import type { DocumentKind } from "./appTypes";
import type { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "./entities";

export enum UserRole {
  admin = "ADMIN",
  partner = "PARTNER",
  invoicing = "RECHNUNGSVERWALTUNG",
  employee = "MITARBEITER",
}

export interface PaginationQueryParameters {
  skip?: number;
  take?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  totalCount: number;
}

export enum ErrorCode {
  INVALID_FILE_NAME = "INVALID_FILE_NAME",
  ENTITY_NOT_FOUND = "ENTITY_NOT_FOUND",
  FK_CONSTRAINT_DOCUMENT = "FK_CONSTRAINT_DOCUMENT",
  FK_CONSTRAINT_ORDER = "FK_CONSTRAINT_ORDER",
  FK_CONSTRAINT_SUB_ORDER = "FK_CONSTRAINT_SUB_ORDER",
  FK_CONSTRAINT_OVERDUE_NOTICE = "FK_CONSTRAINT_OVERDUE_NOTICE",
  PDF_NO_DOCUMENTS_SELECTED = "PDF_NO_DOCUMENTS_SELECTED",
  PDF_NOT_ALL_DOCUMENTS_FOUND = "PDF_NOT_ALL_DOCUMENTS_FOUND",
  PDF_TOO_MANY_DOCUMENTS_SELECTED = "PDF_TOO_MANY_DOCUMENTS_SELECTED",
  INTERNAL = "INTERNAL",
  WRONG_ROLE = "WRONG_ROLE",
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
