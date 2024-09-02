import { DataSource, DataSourceOptions } from "typeorm";

import { DB_PATH } from "@/config";
import { Article } from "@/db/entities/article";
import { Client } from "@/db/entities/client";
import { InvoiceDocumentItem, OfferDocumentItem } from "@/db/entities/document_items";
import { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "@/db/entities/documents";
import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { Order } from "@/db/entities/order";
import { InvoiceItem, OfferItem } from "@/db/entities/order_items";
import { OverdueNotice } from "@/db/entities/overdue_notice";

export function getDataSourceConfig(path: string) {
  return {
    type: "sqlite",
    database: path,
    entities: [
      Client,
      Article,
      Order,
      Offer,
      Invoice,
      OfferItem,
      InvoiceItem,
      OverdueNotice,
      OfferDocument,
      InvoiceDocument,
      OverdueNoticeDocument,
      InvoiceDocumentItem,
      OfferDocumentItem,
    ],
    migrations: ["./dist/src/migrations/*"],
  } as DataSourceOptions;
}

export default new DataSource(getDataSourceConfig(DB_PATH));
