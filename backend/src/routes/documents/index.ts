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
import { log } from "@/helpers/logging";
import { checkAuth } from "@/helpers/roleManagement";
import { mergeSortedDocuments } from "@/helpers/utils";
import { renderMultiplePDF } from "@/pdf/renderPDF";
import { invoiceDocumentsRouter } from "@/routes/documents/invoice_documents";
import { offerDocumentsRouter } from "@/routes/documents/offer_documents";
import { overdueNoticeDocumentsRouter } from "@/routes/documents/overdue_notice_documents";

export const documentsRouter = express.Router();

documentsRouter.get(
  "",
  [checkAuth({ no: [UserRole.employee] })],
  async (req: express.Request, res: express.Response) => {
    // "regular" pagination will not work with this endpoint that returns data from
    // multiple tables.
    interface QueryParams {
      start_timestamp?: number;
      take?: number;
    }
    const { take = 300 } = req.query as QueryParams;
    let { start_timestamp } = req.query as QueryParams;
    if (start_timestamp == null) {
      start_timestamp = Date.now() / 1000;
    }

    const dataSource = getAppDataSource();
    const allDataResult = await Promise.all([
      dataSource.manager.find(InvoiceDocument, {
        where: { created_at: LessThanOrEqual(start_timestamp) },
        order: { created_at: "DESC" },
        take: take,
      }),
      dataSource.manager.find(OfferDocument, {
        where: { created_at: LessThanOrEqual(start_timestamp) },
        order: { created_at: "DESC" },
        take: take,
      }),
      dataSource.manager.find(OverdueNoticeDocument, {
        where: { created_at: LessThanOrEqual(start_timestamp) },
        order: { created_at: "DESC" },
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

    const dataSource = getAppDataSource();
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
      log(`Could not generate a PDF for: ${payload.map((item) => item.id)}`, error);
      next(error);
    }
  },
);
documentsRouter.use("/offers", offerDocumentsRouter);
documentsRouter.use("/overdue_notices", overdueNoticeDocumentsRouter);
documentsRouter.use("/invoices", invoiceDocumentsRouter);
