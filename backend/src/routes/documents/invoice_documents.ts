import express from "express";

import { checkPermissionMiddleware } from "@/authorization";
import { getAppDataSource } from "@/db";
import { InvoiceDocument } from "@/db/entities/documents";
import { OverdueNotice } from "@/db/entities/overdue_notice";
import { ErrorCode, UserPermissions } from "@/global/types/backendTypes";
import { ApiError, SQLITE_CONSTRAINT_ERROR_CODE } from "@/helpers/apiErrors";

export const invoiceDocumentsRouter = express.Router();

invoiceDocumentsRouter.get(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.DOCUMENTS_VIEW)],
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
  [checkPermissionMiddleware(UserPermissions.DOCUMENTS_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();

    const document = await dataSource.manager.findOne(InvoiceDocument, {
      relations: { items: true },
      where: { id: req.params.id },
    });

    if (!document) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
      return;
    }

    try {
      res.json(await dataSource.manager.delete(InvoiceDocument, { id: req.params.id }));
    } catch (error) {
      if (error.code !== SQLITE_CONSTRAINT_ERROR_CODE) {
        next(error);
        return;
      }

      const overdueNoticeCount = await dataSource.manager.countBy(OverdueNotice, {
        invoice_documents: { id: req.params.id },
      });
      if (overdueNoticeCount > 0) {
        next(new ApiError(ErrorCode.FK_CONSTRAINT_OVERDUE_NOTICE));
        return;
      }

      next(error);
    }
  },
);
