import type { DocumentKind } from "./appTypes";
import type { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "./entities";

export enum UserRole {
  admin = "ADMIN",
  partner = "PARTNER",
  invoicing = "RECHNUNGSVERWALTUNG",
  employee = "MITARBEITER",
}

export enum ErrorCode {
  INVALID_FILE_NAME = "INVALID_FILE_NAME",
  ENTITY_NOT_FOUND = "ENTITY_NOT_FOUND",
  FK_CONSTRAINT_DOCUMENT = "FK_CONSTRAINT_DOCUMENT",
  FK_CONSTRAINT_ORDER = "FK_CONSTRAINT_ORDER",
  FK_CONSTRAINT_SUB_ORDER = "FK_CONSTRAINT_SUB_ORDER",
  FK_CONSTRAINT_OVERDUE_NOTICE = "FK_CONSTRAINT_OVERDUE_NOTICE",
  FK_CONSTRAINT_OVERDUE_NOTICE_DOCUMENT = "FK_CONSTRAINT_OVERDUE_NOTICE_DOCUMENT",
  INTERNAL = "INTERNAL",
}

export interface GetDocumentsResponse {
  [key: string]: InvoiceDocument[] | OfferDocument[] | OverdueNoticeDocument[];

  [DocumentKind.invoice]: InvoiceDocument[];
  [DocumentKind.offer]: OfferDocument[];
  [DocumentKind.overdueNotice]: OverdueNoticeDocument[];
}

export type SaveDocumentsAsPdfPayload = { kind: DocumentKind; id: string }[];

export type AnyDocument =
  | {
      kind: DocumentKind.invoice;
      document: InvoiceDocument;
    }
  | {
      kind: DocumentKind.offer;
      document: OfferDocument;
    }
  | {
      kind: DocumentKind.overdueNotice;
      document: OverdueNoticeDocument;
    };
