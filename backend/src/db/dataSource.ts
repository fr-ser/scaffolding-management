import { DataSource, DataSourceOptions } from "typeorm";

import { DB_PATH } from "@/config";
import { Article } from "@/db/entities/article";
import { Client } from "@/db/entities/client";
import { CreditNote } from "@/db/entities/credit_note";
import {
  CreditNoteDocumentItem,
  InvoiceDocumentItem,
  OfferDocumentItem,
} from "@/db/entities/document_items";
import {
  CreditNoteDocument,
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/db/entities/documents";
import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { Order } from "@/db/entities/order";
import { CreditNoteItem, InvoiceItem, OfferItem } from "@/db/entities/order_items";
import { OverdueNotice } from "@/db/entities/overdue_notice";

export function getDataSourceConfig(path: string) {
  return {
    type: "better-sqlite3",
    database: path,
    entities: [
      Client,
      Article,
      Order,
      Offer,
      Invoice,
      CreditNote,
      OfferItem,
      InvoiceItem,
      CreditNoteItem,
      OverdueNotice,
      OfferDocument,
      InvoiceDocument,
      CreditNoteDocument,
      OverdueNoticeDocument,
      InvoiceDocumentItem,
      OfferDocumentItem,
      CreditNoteDocumentItem,
    ],
    migrations: ["./dist/src/migrations/*"],
  } as DataSourceOptions;
}

export default new DataSource(getDataSourceConfig(DB_PATH));
