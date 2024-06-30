import express from "express";

import { getAppDataSource } from "@/db";
import { OverdueNoticeDocument } from "@/db/entities/documents";
import { OverdueNotice } from "@/db/entities/overdue_notice";
import { ErrorCode, UserRole } from "@/global/types/backendTypes";
import { ApiError } from "@/helpers/apiErrors";
import { noCache } from "@/helpers/middleware";
import { checkAuth } from "@/helpers/roleManagement";

export const overdueNoticesRouter = express.Router();
overdueNoticesRouter.use(noCache);
// TODO: check here and everywhere in the backend that the user permissions are respected

overdueNoticesRouter.get(
  "/:id",
  [checkAuth({ all: true })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource();
    const overdue_notice = await dataSource.manager.findOne(OverdueNotice, {
      where: { id: parseInt(req.params.id) },
    });

    if (!overdue_notice) next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
    else res.json(overdue_notice);
  },
);

overdueNoticesRouter.delete(
  "/:id",
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource();

    const documentCount = await dataSource.manager.countBy(OverdueNoticeDocument, {
      overdue_notice_id: req.params.id,
    });
    if (documentCount > 0) {
      next(new ApiError(ErrorCode.FK_CONSTRAINT_DOCUMENT));
      return;
    }

    try {
      res.json(await dataSource.manager.delete(OverdueNotice, { id: req.params.id }));
    } catch (error) {
      next(error);
    }
  },
);

overdueNoticesRouter.get(
  "/:id/documents",
  [checkAuth({ all: true })],
  async (req: express.Request, res: express.Response) => {
    const dataSource = await getAppDataSource();
    res.json(
      await dataSource.manager.find(OverdueNoticeDocument, {
        where: { overdue_notice_id: req.params.id },
      }),
    );
  },
);

overdueNoticesRouter.post(
  "/:id/documents/create",
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource();
    const overdueNotice = await dataSource.manager.findOne(OverdueNotice, {
      where: { id: parseInt(req.params.id) },
      relations: { order: { client: true } },
      loadRelationIds: { relations: ["invoice_documents"] },
    });
    if (!overdueNotice) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
      return;
    }

    const maxId = (
      await dataSource.manager.query(`
      SELECT max(cast(substr(id,11) as integer)) as max_id
      from overdue_notice_document
      where id LIKE 'M-${overdueNotice.notice_date.substring(0, 7)}-%'
    `)
    )[0].max_id;

    const document = dataSource.manager.create(OverdueNoticeDocument, {
      id: `M-${overdueNotice.notice_date.substring(0, 7)}-${maxId + 1}`,
      creation_date: new Date().toISOString().substring(0, 10),
      client_id: overdueNotice.order.client_id,
      client_email: overdueNotice.order.client.email,
      client_company_name: overdueNotice.order.client.company_name,
      client_first_name: overdueNotice.order.client.first_name,
      client_last_name: overdueNotice.order.client.last_name,
      client_street_and_number: overdueNotice.order.client.street_and_number,
      client_postal_code: overdueNotice.order.client.postal_code,
      client_city: overdueNotice.order.client.city,
      order_title: overdueNotice.order.title,
      overdue_notice_id: String(overdueNotice.id),
      notice_level: overdueNotice.notice_level,
      notice_date: overdueNotice.notice_date,
      payments_until: overdueNotice.payments_until,
      payment_target: overdueNotice.payment_target,
      notice_costs: overdueNotice.notice_costs,
      default_interest: overdueNotice.default_interest,
    });

    await dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(OverdueNoticeDocument, document);
      transactionalEntityManager
        .createQueryBuilder()
        .relation(OverdueNoticeDocument, "invoice_documents")
        .of(document)
        .add(overdueNotice.invoice_documents);
    });

    res.json(document);
  },
);
