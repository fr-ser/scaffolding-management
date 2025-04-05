import type { DocumentKind } from "./appTypes";
import type { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "./entities";

export enum UserPermissions {
  ARTICLES_EDIT = "ARTICLES_EDIT",
  ARTICLES_VIEW = "ARTICLES_VIEW",
  ATTACHMENTS_EDIT = "ATTACHMENTS_EDIT",
  CLIENTS_EDIT = "CLIENTS_EDIT",
  DOCUMENTS_EDIT = "DOCUMENTS_EDIT",
  DOCUMENTS_SEND_EMAIL = "DOCUMENTS_SEND_EMAIL",
  DOCUMENTS_VIEW = "DOCUMENTS_VIEW",
  ORDERS_CREATE_DELETE = "ORDERS_CREATE_DELETE",
  ORDERS_UPDATE = "ORDERS_UPDATE",
  SUB_ORDERS_EDIT = "SUB_ORDERS_EDIT",
  SUB_ORDERS_VIEW = "SUB_ORDERS_VIEW",
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
  FK_CONSTRAINT_OVERDUE_NOTICE = "FK_CONSTRAINT_OVERDUE_NOTICE",
  PDF_NO_DOCUMENTS_SELECTED = "PDF_NO_DOCUMENTS_SELECTED",
  PDF_NOT_ALL_DOCUMENTS_FOUND = "PDF_NOT_ALL_DOCUMENTS_FOUND",
  PDF_TOO_MANY_DOCUMENTS_SELECTED = "PDF_TOO_MANY_DOCUMENTS_SELECTED",
  INTERNAL = "INTERNAL",
  WRONG_ROLE = "WRONG_ROLE",
  FILE_UPLOAD_INVALID_COUNT = "FILE_UPLOAD_INVALID_COUNT",
}

export type SaveDocumentsAsPdfPayload = { kind: DocumentKind; id: string }[];
export interface SendDocumentsAsEMail {
  kind: DocumentKind;
  id: string;
  recipient: string;
  subject: string;
  message: string;
  attachmentName: string;
}

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

export interface DropboxFile {
  name: string;
  link: string;
}

export interface UserData {
  permissions: UserPermissions[];
}
