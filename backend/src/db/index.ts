import "reflect-metadata";
import { DataSource } from "typeorm";

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
import { sendMsgLog } from "@/helpers/logging";

let AppDataSource: DataSource;

export async function getAppDataSource() {
  if (AppDataSource) return AppDataSource;
  AppDataSource = new DataSource({
    type: "sqlite",
    database: DB_PATH,
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
  });
  await AppDataSource.initialize();
  sendMsgLog(`Initialized database at ${DB_PATH}`);
  return AppDataSource;
}

export async function closeDatabase() {
  if (AppDataSource) {
    await AppDataSource.destroy();
    sendMsgLog(`Closed database at ${DB_PATH}`);
  }
}
