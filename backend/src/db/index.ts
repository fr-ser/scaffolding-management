import { DataSource } from "typeorm";

import { Article } from "@/db/entities/article";
import { Client } from "@/db/entities/client";
import { InvoiceDocumentItem, OfferDocumentItem } from "@/db/entities/document_items";
import { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "@/db/entities/documents";
import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { Order } from "@/db/entities/order";
import { InvoiceItem, OfferItem } from "@/db/entities/order_items";
import { OverdueNotice } from "@/db/entities/overdue_notice";
import { log } from "@/helpers/logging";

let AppDataSource: DataSource;

export function getAppDataSource() {
  if (!AppDataSource) {
    throw new Error("AppDataSource is not initialized");
  }
  return AppDataSource;
}

export async function initializeAppDataSource(databasePath: string) {
  AppDataSource = new DataSource({
    type: "sqlite",
    database: databasePath,
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
  return AppDataSource;
}

export async function closeDatabase() {
  if (AppDataSource) {
    await AppDataSource.destroy();
    log(`Closed database`);
  }
}
