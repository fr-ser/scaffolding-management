import express from "express";
import { In, LessThanOrEqual } from "typeorm";

import { getAppDataSource } from "@/db";
import { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "@/db/entities/documents";
import { DocumentKind } from "@/global/types/appTypes";
import {
  AnyDocument,
  ErrorCode,
  SaveDocumentsAsPdfPayload,
  UserRole,
} from "@/global/types/backendTypes";
import { ApiError } from "@/helpers/apiErrors";
import { sendErrorLog } from "@/helpers/logging";
import { noCache } from "@/helpers/middleware";
import { checkAuth } from "@/helpers/roleManagement";
import { mergeSortedDocuments } from "@/helpers/utils";
import { renderMultiplePDF } from "@/pdf/renderPDF";

export const documentsRouter = express.Router();
documentsRouter.use(noCache);

documentsRouter.get(
  "",
  [checkAuth({ all: true })],
  async (req: express.Request, res: express.Response) => {
    // "regular" pagination will not work with this endpoint that returns data from
    // multiple tables.
    interface QueryParams {
      start_date?: string;
      take?: number;
    }
    const { take = 300 } = req.query as QueryParams;
    let { start_date } = req.query as QueryParams;
    if (start_date == null) {
      start_date = new Date().toISOString().split("T")[0];
    }

    const dataSource = await getAppDataSource();
    const allDataResult = await Promise.all([
      dataSource.manager.find(InvoiceDocument, {
        where: { creation_date: LessThanOrEqual(start_date) },
        order: { creation_date: "DESC" },
        take: take,
      }),
      dataSource.manager.find(OfferDocument, {
        where: { creation_date: LessThanOrEqual(start_date) },
        order: { creation_date: "DESC" },
        take: take,
      }),
      dataSource.manager.find(OverdueNoticeDocument, {
        where: { creation_date: LessThanOrEqual(start_date) },
        order: { creation_date: "DESC" },
        take: take,
      }),
    ]);

    res.json(
      mergeSortedDocuments(...allDataResult, {
        isAscending: false,
        maxItems: take,
      }),
    );
  },
);

documentsRouter.post(
  "/pdf-download",
  [checkAuth({ no: [UserRole.employee] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const payload = req.body as SaveDocumentsAsPdfPayload;

    if (payload.length === 0) {
      next(new ApiError(ErrorCode.PDF_NO_DOCUMENTS_SELECTED));
      return;
    } else if (payload.length > 50) {
      next(new ApiError(ErrorCode.PDF_TOO_MANY_DOCUMENTS_SELECTED));
      return;
    }

    const dataSource = await getAppDataSource();
    const allDocuments = (
      (await Promise.all([
        dataSource.manager
          .find(InvoiceDocument, {
            where: {
              id: In(
                payload.filter((item) => item.kind === DocumentKind.invoice).map((item) => item.id),
              ),
            },
            relations: { items: true },
          })
          .then((result) =>
            result.map((item) => {
              return { kind: DocumentKind.invoice, document: item };
            }),
          ),
        dataSource.manager
          .find(OfferDocument, {
            where: {
              id: In(
                payload.filter((item) => item.kind === DocumentKind.offer).map((item) => item.id),
              ),
            },
            relations: { items: true },
          })
          .then((result) =>
            result.map((item) => {
              return { kind: DocumentKind.offer, document: item };
            }),
          ),
        dataSource.manager
          .find(OverdueNoticeDocument, {
            where: {
              id: In(
                payload
                  .filter((item) => item.kind === DocumentKind.overdueNotice)
                  .map((item) => item.id),
              ),
            },
            relations: { invoice_documents: { items: true } },
          })
          .then((result) =>
            result.map((item) => {
              return { kind: DocumentKind.overdueNotice, document: item };
            }),
          ),
      ])) as AnyDocument[][]
    ).flatMap((item) => item);

    if (allDocuments.length !== payload.length) {
      next(new ApiError(ErrorCode.PDF_NOT_ALL_DOCUMENTS_FOUND));
      return;
    }

    try {
      res.contentType("application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="document.pdf"; filename*="document.pdf"',
      );
      res.send(await renderMultiplePDF(allDocuments));
    } catch (error) {
      sendErrorLog(`Could not generate a PDF for: ${payload.map((item) => item.id)}`, error);
      next(error);
    }
  },
);
