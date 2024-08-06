import express from "express";
import { FindOneOptions, ILike } from "typeorm";

import { getAppDataSource } from "@/db";
import { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "@/db/entities/documents";
import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { Order } from "@/db/entities/order";
import { OverdueNotice } from "@/db/entities/overdue_notice";
import {
  ErrorCode,
  PaginationQueryParameters,
  PaginationResponse,
  UserRole,
} from "@/global/types/backendTypes";
import { ApiError, SQLITE_CONSTRAINT_ERROR_CODE } from "@/helpers/apiErrors";
import { noCache } from "@/helpers/middleware";
import { checkAuth } from "@/helpers/roleManagement";
import { invoicesRouter } from "@/routes/orders/invoices";
import { offersRouter } from "@/routes/orders/offers";
import { overdueNoticesRouter } from "@/routes/orders/overdue_notices";

export const ordersRouter = express.Router();
ordersRouter.use(noCache);

ordersRouter.get(
  "",
  [checkAuth({ all: true })],
  async (req: express.Request, res: express.Response) => {
    const { skip = 0, take = 100 } = req.query as PaginationQueryParameters;
    const { search } = req.query as { search?: string };

    const dataSource = getAppDataSource();

    let whereClause: FindOneOptions<Order>["where"] = undefined;

    if (search) {
      whereClause = [{ id: ILike(`%${search}%`) }, { title: ILike(`%${search}%`) }];
    }

    const result = await dataSource.manager.findAndCount(Order, {
      skip,
      take,
      order: { created_at: "DESC" },
      where: whereClause,
    });

    res.json({ data: result[0], totalCount: result[1] } as PaginationResponse<Order>);
  },
);

ordersRouter.post(
  "",
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    try {
      const maxId = await dataSource.manager.query(
        `SELECT max(cast(substr(id,2) as integer)) as max_id from "order"`,
      );
      const order = await dataSource.manager.create(Order, {
        ...req.body,
        id: `A${maxId[0].max_id + 1}`,
      });
      const results = await dataSource.manager.save(Order, order);
      res.json(results);
    } catch (error) {
      next(error);
    }
  },
);

ordersRouter.get(
  "/:id",
  [checkAuth({ all: true })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    const order = await dataSource.manager.findOne(Order, {
      relations: {
        client: true,
        offer: { items: true },
        overdue_notices: { invoice_documents: { items: true } },
        invoices: { items: true },
      },
      where: { id: req.params.id },
    });
    if (!order) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
    } else res.json(order);
  },
);

ordersRouter.patch(
  "/:id",
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    let order: Order | null = null;

    delete req.body.overdue_notices;
    delete req.body.invoices;
    delete req.body.offer;
    delete req.body.client;
    delete req.body.id;

    try {
      await dataSource.manager.update(Order, req.params.id, req.body);
      order = await dataSource.manager.findOne(Order, {
        relations: {
          client: true,
          offer: { items: true },
          overdue_notices: { invoice_documents: { items: true } },
          invoices: { items: true },
        },
        where: { id: req.params.id },
      });
    } catch (error) {
      next(error);
      return;
    }

    if (order != null) res.json(order);
    else next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
  },
);

ordersRouter.delete(
  "/:id",
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    try {
      res.json(await dataSource.manager.delete(Order, { id: req.params.id }));
    } catch (error) {
      if (error.code !== SQLITE_CONSTRAINT_ERROR_CODE) {
        next(error);
        return;
      }

      const subOrderCounts = await Promise.all([
        dataSource.manager.countBy(Invoice, { order_id: req.params.id }),
        dataSource.manager.countBy(Offer, { order_id: req.params.id }),
        dataSource.manager.countBy(OverdueNotice, { order_id: req.params.id }),
      ]);

      if (subOrderCounts.reduce((a, b) => a + b, 0) > 0) {
        next(new ApiError(ErrorCode.FK_CONSTRAINT_SUB_ORDER));
      }

      next(error);
    }
  },
);

ordersRouter.get(
  "/:id/documents",
  [checkAuth({ all: true })],
  async (req: express.Request, res: express.Response) => {
    const dataSource = getAppDataSource();
    const allDataResult = await Promise.all([
      dataSource.manager.find(InvoiceDocument, {
        where: { invoice: { order_id: req.params.id } },
      }),
      dataSource.manager.find(OfferDocument, {
        where: { offer: { order_id: req.params.id } },
      }),
      dataSource.manager.find(OverdueNoticeDocument, {
        where: { overdue_notice: { order_id: req.params.id } },
      }),
    ]);

    res.json([...allDataResult[0], ...allDataResult[1], ...allDataResult[2]]);
  },
);

ordersRouter.use("/invoices", invoicesRouter);
ordersRouter.use("/offers", offersRouter);
ordersRouter.use("/overdue_notices", overdueNoticesRouter);
