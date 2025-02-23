import express from "express";

import { checkPermissionMiddleware } from "@/authorization";
import { getAppDataSource } from "@/db";
import { InvoiceDocumentItem } from "@/db/entities/document_items";
import { InvoiceDocument } from "@/db/entities/documents";
import { Invoice } from "@/db/entities/invoice";
import { InvoiceItem } from "@/db/entities/order_items";
import { ErrorCode, UserPermissions } from "@/global/types/backendTypes";
import { InvoiceCreate, InvoiceUpdate } from "@/global/types/dataEditTypes";
import { ApiError } from "@/helpers/apiErrors";

export const invoicesRouter = express.Router();

invoicesRouter.get(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.SUB_ORDERS_VIEW)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    const invoice = await dataSource.manager.findOne(Invoice, {
      where: { id: parseInt(req.params.id) },
    });

    if (!invoice) next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
    else res.json(invoice);
  },
);

invoicesRouter.post(
  "",
  [checkPermissionMiddleware(UserPermissions.SUB_ORDERS_EDIT)],
  async (req: express.Request, res: express.Response) => {
    const dataSource = getAppDataSource();
    const payload = req.body as InvoiceCreate;

    const invoice = dataSource.manager.create(Invoice, { ...payload });

    await dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(Invoice, invoice);

      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(InvoiceItem)
        .values(
          payload.items.map((item) => {
            return {
              kind: item.kind,
              title: item.title,
              description: item.description,
              unit: item.unit,
              price: item.price,
              amount: item.amount,
              invoice_id: invoice.id,
            };
          }),
        )
        .execute();
    });

    res.json(invoice);
  },
);

invoicesRouter.delete(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.SUB_ORDERS_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();

    const documentCount = await dataSource.manager.countBy(InvoiceDocument, {
      invoice_id: parseInt(req.params.id),
    });
    if (documentCount > 0) {
      next(new ApiError(ErrorCode.FK_CONSTRAINT_DOCUMENT));
      return;
    }

    try {
      res.json(await dataSource.manager.delete(Invoice, { id: req.params.id }));
    } catch (error) {
      next(error);
    }
  },
);

invoicesRouter.patch(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.SUB_ORDERS_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const invoiceId = parseInt(req.params.id);
    const payload = req.body as InvoiceUpdate;
    const dataSource = getAppDataSource();

    const invoiceWithoutItems = { ...payload, items: undefined, id: invoiceId };

    try {
      await dataSource.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(Invoice, invoiceWithoutItems);

        if (payload.items == null) return;

        await transactionalEntityManager.delete(InvoiceItem, {
          invoice_id: invoiceWithoutItems.id,
        });

        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(InvoiceItem)
          .values(
            payload.items.map((item) => {
              return {
                kind: item.kind,
                title: item.title,
                description: item.description,
                unit: item.unit,
                price: item.price,
                amount: item.amount,
                invoice_id: invoiceId,
              };
            }),
          )
          .execute();
      });
    } catch (error) {
      next(error);
      return;
    }

    const invoice = await dataSource.manager.findOne(Invoice, {
      where: { id: parseInt(req.params.id) },
    });

    if (invoice == null) next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
    else res.json(invoice);
  },
);

invoicesRouter.get(
  "/:id/documents",
  [checkPermissionMiddleware(UserPermissions.DOCUMENTS_VIEW)],
  async (req: express.Request, res: express.Response) => {
    const dataSource = getAppDataSource();
    const documents = await dataSource.manager.find(InvoiceDocument, {
      where: { invoice_id: parseInt(req.params.id) },
    });
    res.json(documents);
  },
);

invoicesRouter.post(
  "/:id/documents",
  [checkPermissionMiddleware(UserPermissions.DOCUMENTS_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    const invoice = await dataSource.manager.findOne(Invoice, {
      where: { id: parseInt(req.params.id) },
      relations: { order: { client: true }, items: true },
    });
    if (!invoice) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
      return;
    }

    const maxId = (
      await dataSource.manager.query(`
      SELECT max(cast(substr(id,11) as integer)) as max_id
      from invoice_document
      where id LIKE 'R-${invoice.invoice_date.substring(0, 7)}-%'
    `)
    )[0].max_id;

    const document = dataSource.manager.create(InvoiceDocument, {
      id: `R-${invoice.invoice_date.substring(0, 7)}-${maxId + 1}`,
      order_id: invoice.order_id,
      creation_date: new Date().toISOString().substring(0, 10),
      client_id: invoice.order.client_id,
      client_email: invoice.order.client.email,
      client_company_name: invoice.order.client.company_name,
      client_first_name: invoice.order.client.first_name,
      client_last_name: invoice.order.client.last_name,
      client_street_and_number: invoice.order.client.street_and_number,
      client_postal_code: invoice.order.client.postal_code,
      client_city: invoice.order.client.city,
      order_title: invoice.order.title,
      invoice_id: invoice.id,
      invoice_date: invoice.invoice_date,
      service_dates: invoice.service_dates,
      payment_target: invoice.payment_target,
      can_have_cash_discount: invoice.order.can_have_cash_discount,
      discount_duration: invoice.order.discount_duration,
      discount_percentage: invoice.order.discount_percentage,
    });

    await dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(InvoiceDocument, document);

      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(InvoiceDocumentItem)
        .values(
          invoice.items.map((item) => {
            return {
              invoice_document_id: document.id,
              kind: item.kind,
              title: item.title,
              description: item.description,
              unit: item.unit,
              price: item.price,
              amount: item.amount,
            };
          }),
        )
        .execute();
    });

    res.json(document);
  },
);
