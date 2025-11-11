import express from "express";

import { checkPermissionMiddleware } from "@/authorization";
import { getAppDataSource } from "@/db";
import { Order } from "@/db/entities/order";
import {
  OfferStatus,
  OrderStatus,
  OverdueNoticePaymentStatus,
  PaymentStatus,
} from "@/global/types/appTypes";
import {
  PaginationQueryParameters,
  PaginationResponse,
  UserPermissions,
} from "@/global/types/backendTypes";

export const reportRouter = express.Router();

reportRouter.get(
  "/overdue-orders",
  [checkPermissionMiddleware(UserPermissions.SUB_ORDERS_VIEW)],
  async (req: express.Request, res: express.Response) => {
    const { skip = 0, take = 100 } = req.query as PaginationQueryParameters;

    const dataSource = getAppDataSource();

    let databaseQuery = dataSource
      .getRepository(Order)
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.client", "client")
      .orderBy("order.created_at", "DESC")
      .limit(take)
      .offset(skip);

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

    const result = await databaseQuery.getManyAndCount();

    res.json({ data: result[0], totalCount: result[1] } as PaginationResponse<Order>);
  },
);

reportRouter.get("/prepared-orders", async (req: express.Request, res: express.Response) => {
  const { skip = 0, take = 100 } = req.query as PaginationQueryParameters;

  const dataSource = getAppDataSource();

  const databaseQuery = dataSource
    .getRepository(Order)
    .createQueryBuilder("order")
    .leftJoinAndSelect("order.client", "client")
    .where("order.status = :isPrepared", { isPrepared: OrderStatus.preparation })
    .orderBy("order.created_at", "DESC")
    .limit(take)
    .offset(skip);

  const result = await databaseQuery.getManyAndCount();

  res.json({ data: result[0], totalCount: result[1] } as PaginationResponse<Order>);
});
