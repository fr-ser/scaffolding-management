import express from "express";

import { getAppDataSource } from "@/db";
import { OfferDocument } from "@/db/entities/documents";
import { ErrorCode, UserRole } from "@/global/types/backendTypes";
import { ApiError } from "@/helpers/apiErrors";
import { checkAuth } from "@/helpers/roleManagement";

export const offerDocumentsRouter = express.Router();

offerDocumentsRouter.get(
  "/:id",
  [checkAuth({ no: [UserRole.employee] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    const document = await dataSource.manager.findOne(OfferDocument, {
      relations: { items: true },
      where: { id: req.params.id },
    });

    if (!document) next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
    else res.json(document);
  },
);

offerDocumentsRouter.delete(
  "/:id",
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    try {
      res.json(await dataSource.manager.delete(OfferDocument, { id: req.params.id }));
    } catch (error) {
      next(error);
    }
  },
);
