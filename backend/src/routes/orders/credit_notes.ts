import express from "express";

import { checkPermissionMiddleware } from "@/authorization";
import { getAppDataSource } from "@/db";
import { CreditNote } from "@/db/entities/credit_note";
import { CreditNoteDocumentItem } from "@/db/entities/document_items";
import { CreditNoteDocument } from "@/db/entities/documents";
import { CreditNoteItem } from "@/db/entities/order_items";
import { ErrorCode, UserPermissions } from "@/global/types/backendTypes";
import { CreditNoteCreate, CreditNoteUpdate } from "@/global/types/dataEditTypes";
import { ApiError } from "@/helpers/apiErrors";
import { findFirstUnusedNumber } from "@/helpers/findFirstUnusedNumber";

export const creditNotesRouter = express.Router();

creditNotesRouter.get(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.SUB_ORDERS_VIEW)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { id } = req.params as Record<string, string>;
    const dataSource = getAppDataSource();
    const creditNote = await dataSource.manager.findOne(CreditNote, {
      where: { id: parseInt(id) },
    });

    if (!creditNote) next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
    else res.json(creditNote);
  },
);

creditNotesRouter.post(
  "",
  [checkPermissionMiddleware(UserPermissions.SUB_ORDERS_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    const payload = req.body as CreditNoteCreate;

    const creditNote = dataSource.manager.create(CreditNote, { ...payload });

    try {
      await dataSource.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.insert(CreditNote, creditNote);

        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(CreditNoteItem)
          .values(
            payload.items.map((item) => {
              return {
                kind: item.kind,
                title: item.title,
                description: item.description,
                unit: item.unit,
                price: item.price,
                amount: item.amount,
                credit_note_id: creditNote.id,
              };
            }),
          )
          .execute();
      });

      res.json(creditNote);
    } catch (error) {
      next(error);
      return;
    }
  },
);

creditNotesRouter.delete(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.SUB_ORDERS_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { id } = req.params as Record<string, string>;
    const dataSource = getAppDataSource();

    const documentCount = await dataSource.manager.countBy(CreditNoteDocument, {
      credit_note_id: parseInt(id),
    });
    if (documentCount > 0) {
      next(new ApiError(ErrorCode.FK_CONSTRAINT_DOCUMENT));
      return;
    }

    try {
      res.json(await dataSource.manager.delete(CreditNote, { id }));
    } catch (error) {
      next(error);
    }
  },
);

creditNotesRouter.patch(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.SUB_ORDERS_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { id } = req.params as Record<string, string>;
    const creditNoteId = parseInt(id);
    const payload = req.body as CreditNoteUpdate;
    const dataSource = getAppDataSource();

    const creditNoteWithoutItems = { ...payload, items: undefined, id: creditNoteId };

    try {
      await dataSource.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(CreditNote, creditNoteWithoutItems);

        if (payload.items == null) return;

        await transactionalEntityManager.delete(CreditNoteItem, {
          credit_note_id: creditNoteWithoutItems.id,
        });

        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(CreditNoteItem)
          .values(
            payload.items.map((item) => {
              return {
                kind: item.kind,
                title: item.title,
                description: item.description,
                unit: item.unit,
                price: item.price,
                amount: item.amount,
                credit_note_id: creditNoteId,
              };
            }),
          )
          .execute();
      });
    } catch (error) {
      next(error);
      return;
    }

    const creditNote = await dataSource.manager.findOne(CreditNote, {
      where: { id: creditNoteId },
    });

    if (creditNote == null) next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
    else res.json(creditNote);
  },
);

creditNotesRouter.get(
  "/:id/documents",
  [checkPermissionMiddleware(UserPermissions.DOCUMENTS_VIEW)],
  async (req: express.Request, res: express.Response) => {
    const { id } = req.params as Record<string, string>;
    const dataSource = getAppDataSource();
    const documents = await dataSource.manager.find(CreditNoteDocument, {
      where: { credit_note_id: parseInt(id) },
    });
    res.json(documents);
  },
);

creditNotesRouter.post(
  "/:id/documents",
  [checkPermissionMiddleware(UserPermissions.DOCUMENTS_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { id } = req.params as Record<string, string>;
    const dataSource = getAppDataSource();
    const creditNote = await dataSource.manager.findOne(CreditNote, {
      where: { id: parseInt(id) },
      relations: { order: { client: true }, items: true },
    });
    if (!creditNote) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
      return;
    }

    const documentsOfTheMonth = await dataSource.manager.query(`
      SELECT id from credit_note_document where id LIKE 'G${creditNote.credit_date.substring(0, 7)}-%'
    `);
    const firstUnusedNumber = findFirstUnusedNumber(
      documentsOfTheMonth.map((doc: { id: string }) => doc.id),
    );

    const document = dataSource.manager.create(CreditNoteDocument, {
      id: `G${creditNote.credit_date.substring(0, 7)}-${String(firstUnusedNumber).padStart(2, "0")}`,
      order_id: creditNote.order_id,
      creation_date: new Date().toISOString().substring(0, 10),
      client_id: creditNote.order.client_id,
      client_email: creditNote.order.client.email,
      client_company_name: creditNote.order.client.company_name,
      client_first_name: creditNote.order.client.first_name,
      client_last_name: creditNote.order.client.last_name,
      client_street_and_number: creditNote.order.client.street_and_number,
      client_postal_code: creditNote.order.client.postal_code,
      client_city: creditNote.order.client.city,
      order_title: creditNote.order.title,
      credit_note_id: creditNote.id,
      credit_date: creditNote.credit_date,
    });

    try {
      await dataSource.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.insert(CreditNoteDocument, document);

        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(CreditNoteDocumentItem)
          .values(
            creditNote.items.map((item) => {
              return {
                credit_note_document_id: document.id,
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
    } catch (error) {
      next(error);
      return;
    }
  },
);
