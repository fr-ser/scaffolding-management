import express from "express";
import { In, SelectQueryBuilder } from "typeorm";

import { getAppDataSource } from "@/db";
import { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "@/db/entities/documents";
import { DocumentKind } from "@/global/types/appTypes";
import {
  AnyDocument,
  ErrorCode,
  PaginationResponse,
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
      take?: number;
      search?: string;
    }
    const { take = 300, search } = req.query as QueryParams;

    let baseInvoiceQuery: SelectQueryBuilder<InvoiceDocument>;
    let baseOfferQuery: SelectQueryBuilder<OfferDocument>;
    let baseOverdueNoticeQuery: SelectQueryBuilder<OverdueNoticeDocument>;

    if (!search) {
      baseInvoiceQuery = getAppDataSource().manager.createQueryBuilder(InvoiceDocument, "invoice");
      baseOfferQuery = getAppDataSource().manager.createQueryBuilder(OfferDocument, "offer");
      baseOverdueNoticeQuery = getAppDataSource().manager.createQueryBuilder(
        OverdueNoticeDocument,
        "overdue_notice",
      );
    } else {
      const cleanSearch = search.trim();
      baseInvoiceQuery = getAppDataSource()
        .manager.createQueryBuilder(InvoiceDocument, "invoice")
        .where("(id LIKE '%' || :search || '%' OR order_title LIKE '%' || :search || '%')", {
          search: cleanSearch,
        });

      baseOfferQuery = getAppDataSource()
        .manager.createQueryBuilder(OfferDocument, "offer")
        .where("(id LIKE '%' || :search || '%' OR order_title LIKE '%' || :search || '%')", {
          search: cleanSearch,
        });
      baseOverdueNoticeQuery = getAppDataSource()
        .manager.createQueryBuilder(OverdueNoticeDocument, "overdue_notice")
        .where("(id LIKE '%' || :search || '%' OR order_title LIKE '%' || :search || '%')", {
          search: cleanSearch,
        });
    }

    const allDataResult = await Promise.all([
      baseInvoiceQuery.take(take).orderBy("created_at", "DESC").getMany(),
      baseOfferQuery.take(take).orderBy("created_at", "DESC").getMany(),
      baseOverdueNoticeQuery.take(take).orderBy("created_at", "DESC").getMany(),
      baseInvoiceQuery.getCount(),
      baseOfferQuery.getCount(),
      baseOverdueNoticeQuery.getCount(),
    ]);

    const data = allDataResult.slice(0, 3) as [
      OfferDocument[],
      InvoiceDocument[],
      OverdueNoticeDocument[],
    ];

    const counts = allDataResult.slice(3) as number[];

    res.json({
      data: mergeSortedDocuments(...data, {
        isAscending: false,
        maxItems: take,
      }),
      totalCount: counts.reduce((acc, item) => acc + item, 0),
    } as PaginationResponse<InvoiceDocument | OfferDocument | OverdueNoticeDocument>);
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
