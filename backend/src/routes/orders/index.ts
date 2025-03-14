import express from "express";
import basicAuth from "express-basic-auth";
import { FindOptionsRelations } from "typeorm";

import { checkPermissionMiddleware, getPermissionsForUser } from "@/authorization";
import { getAppDataSource } from "@/db";
import { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "@/db/entities/documents";
import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { Order } from "@/db/entities/order";
import { OverdueNotice } from "@/db/entities/overdue_notice";
import { OfferStatus, OverdueNoticePaymentStatus, PaymentStatus } from "@/global/types/appTypes";
import {
  ErrorCode,
  PaginationQueryParameters,
  PaginationResponse,
  UserPermissions,
} from "@/global/types/backendTypes";
import { ApiError, SQLITE_CONSTRAINT_ERROR_CODE } from "@/helpers/apiErrors";
import { attachmentsRouter } from "@/routes/orders/attachments";
import { invoicesRouter } from "@/routes/orders/invoices";
import { offersRouter } from "@/routes/orders/offers";
import { overdueNoticesRouter } from "@/routes/orders/overdue_notices";

export const ordersRouter = express.Router();

ordersRouter.get(
  "",
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { skip = 0, take = 100 } = req.query as PaginationQueryParameters;
    const { search, overdue, detailed } = req.query as {
      search?: string;
      overdue?: boolean;
      detailed?: boolean;
    };

    const dataSource = getAppDataSource();

    // let whereClause: FindOneOptions<Order>["where"] = [];

    let databaseQuery = dataSource
      .getRepository(Order)
      .createQueryBuilder("order")
      .orderBy("order.created_at", "DESC")
      .limit(take)
      .offset(skip);
    if (detailed) {
      const permissions = getPermissionsForUser((req as basicAuth.IBasicAuthedRequest).auth.user);
      if (!permissions.includes(UserPermissions.SUB_ORDERS_VIEW)) {
        next(new ApiError(ErrorCode.WRONG_ROLE, 403));
        return;
      }
      databaseQuery = databaseQuery.leftJoinAndSelect("order.client", "client");
    }

    if (detailed && !overdue) {
      // here we join all sub orders as they are not filtered
      databaseQuery = databaseQuery.leftJoinAndSelect("order.offer", "offer");
      databaseQuery = databaseQuery.leftJoinAndSelect("order.overdue_notices", "overdue_notices");
      databaseQuery = databaseQuery.leftJoinAndSelect("order.invoices", "invoices");
    }

    if (search) {
      databaseQuery = databaseQuery.andWhere(
        "(order.id LIKE CONCAT('%',:idSearch, '%') OR order.title LIKE CONCAT('%',:titleSearch, '%'))",
        {
          idSearch: search,
          titleSearch: search,
        },
      );
    }

    if (overdue) {
      databaseQuery = databaseQuery.leftJoinAndSelect(
        "order.offer",
        "offer",
        "(offer.status = :overdueOfferStatus and date('now') > date(offer.offer_valid_until))",
        {
          overdueOfferStatus: OfferStatus.created,
        },
      );
      databaseQuery = databaseQuery.leftJoinAndSelect(
        "order.overdue_notices",
        "overdue_notices",
        "(overdue_notices.payment_status in(:...overdueOverdueNoticeStatus) and date('now') > date(overdue_notices.payment_target))",
        {
          overdueOverdueNoticeStatus: [
            OverdueNoticePaymentStatus.open,
            OverdueNoticePaymentStatus.partiallyPaid,
          ],
        },
      );
      databaseQuery = databaseQuery.leftJoinAndSelect(
        "order.invoices",
        "invoices",
        "(invoices.status = :overdueInvoiceStatus and date('now') > date(invoices.payment_target))",
        {
          overdueInvoiceStatus: PaymentStatus.open,
        },
      );
      databaseQuery = databaseQuery.andWhere(
        "invoices.id is not null or overdue_notices.id is not null or offer.id is not null",
      );
    }

    const result = await databaseQuery.getManyAndCount();

    res.json({ data: result[0], totalCount: result[1] } as PaginationResponse<Order>);
  },
);

ordersRouter.post(
  "",
  [checkPermissionMiddleware(UserPermissions.ORDERS_CREATE_DELETE)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    try {
      const maxId = await dataSource.manager.query(
        `SELECT max(cast(substr(id,2) as integer)) as max_id from "order"`,
      );
      const order = dataSource.manager.create(Order, {
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
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();

    const permissions = getPermissionsForUser((req as basicAuth.IBasicAuthedRequest).auth.user);
    let relations = {
      client: true,
    } as FindOptionsRelations<Order>;
    if (permissions.includes(UserPermissions.SUB_ORDERS_VIEW)) {
      relations = {
        client: true,
        offer: { items: true },
        overdue_notices: { invoice_documents: { items: true } },
        invoices: { items: true },
      };
    }

    const order = await dataSource.manager.findOne(Order, {
      relations,
      where: { id: req.params.id },
    });
    if (!order) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
    } else res.json(order);
  },
);

ordersRouter.patch(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.ORDERS_UPDATE)],
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
  [checkPermissionMiddleware(UserPermissions.ORDERS_CREATE_DELETE)],
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
  [checkPermissionMiddleware(UserPermissions.DOCUMENTS_VIEW)],
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

ordersRouter.use("/:orderId/attachments", attachmentsRouter);
ordersRouter.use("/invoices", invoicesRouter);
ordersRouter.use("/offers", offersRouter);
ordersRouter.use("/overdue_notices", overdueNoticesRouter);
