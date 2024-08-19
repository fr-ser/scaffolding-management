import express from "express";

import { getAppDataSource } from "@/db";
import { InvoiceDocument, OverdueNoticeDocument } from "@/db/entities/documents";
import { ErrorCode, UserRole } from "@/global/types/backendTypes";
import { ApiError, SQLITE_CONSTRAINT_ERROR_CODE } from "@/helpers/apiErrors";
import { checkAuth } from "@/helpers/roleManagement";

export const invoiceDocumentsRouter = express.Router();

invoiceDocumentsRouter.get(
  "/:id",
  [checkAuth({ no: [UserRole.employee] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    const document = await dataSource.manager.findOne(InvoiceDocument, {
      relations: { items: true },
      where: { id: req.params.id },
    });

    if (!document) next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
    else res.json(document);
  },
);

invoiceDocumentsRouter.delete(
  "/:id",
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    try {
      res.json(await dataSource.manager.delete(InvoiceDocument, { id: req.params.id }));
    } catch (error) {
      if (error.code !== SQLITE_CONSTRAINT_ERROR_CODE) {
        next(error);
        return;
      }
      // TODO: check if an exception is raised for this
      const overdueNoticeDocumentCount = await dataSource.manager.countBy(OverdueNoticeDocument, {
        invoice_documents: { invoice_id: parseInt(req.params.id) },
      });
      if (overdueNoticeDocumentCount > 0) {
        next(new ApiError(ErrorCode.FK_CONSTRAINT_OVERDUE_NOTICE_DOCUMENT));
        return;
      }

      next(error);
    }
  },
);
