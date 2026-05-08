import express from "express";

import { checkPermissionMiddleware } from "@/authorization";
import { getAppDataSource } from "@/db";
import { CreditNoteDocument } from "@/db/entities/documents";
import { ErrorCode, UserPermissions } from "@/global/types/backendTypes";
import { ApiError } from "@/helpers/apiErrors";

export const creditNoteDocumentsRouter = express.Router();

creditNoteDocumentsRouter.get(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.DOCUMENTS_VIEW)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { id } = req.params as Record<string, string>;
    const dataSource = getAppDataSource();
    const document = await dataSource.manager.findOne(CreditNoteDocument, {
      relations: { items: true },
      where: { id },
    });

    if (!document) next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
    else res.json(document);
  },
);

creditNoteDocumentsRouter.delete(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.DOCUMENTS_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { id } = req.params as Record<string, string>;
    const dataSource = getAppDataSource();

    const document = await dataSource.manager.findOne(CreditNoteDocument, {
      where: { id },
    });

    if (!document) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
      return;
    }

    try {
      res.json(await dataSource.manager.delete(CreditNoteDocument, { id }));
    } catch (error) {
      next(error);
    }
  },
);
