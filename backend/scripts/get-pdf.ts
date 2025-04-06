import fs from "node:fs/promises";

import { DB_PATH } from "@/config";
import { getAppDataSource, initializeAppDataSource } from "@/db";
import { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "@/db/entities/documents";
import { DocumentKind } from "@/global/types/appTypes";
import { AnyDocument } from "@/global/types/backendTypes";
import { renderMultiplePDF } from "@/pdf/renderPDF";

async function main() {
  await initializeAppDataSource(DB_PATH);
  const dataSource = getAppDataSource();

  const id = process.argv[2] as string;
  const destination = (process.argv[3] as string) || `${id}.pdf`;

  if (!id) {
    throw new Error("No id provided");
  }

  let query: Promise<AnyDocument>;

  if (id.startsWith("R")) {
    query = dataSource.manager
      .findOne(InvoiceDocument, {
        where: { id },
        relations: { items: true },
      })
      .then((result) => {
        return { kind: DocumentKind.invoice, document: result as InvoiceDocument };
      });
  } else if (id.startsWith("A")) {
    query = dataSource.manager
      .findOne(OfferDocument, {
        where: { id },
        relations: { items: true },
      })
      .then((result) => {
        return { kind: DocumentKind.offer, document: result as OfferDocument };
      });
  } else {
    query = dataSource.manager
      .findOne(OverdueNoticeDocument, {
        where: { id },
        relations: { invoice_documents: { items: true } },
      })
      .then((result) => {
        return { kind: DocumentKind.overdueNotice, document: result as OverdueNoticeDocument };
      });
  }

  const data = await renderMultiplePDF([await query]);

  fs.writeFile(destination, data);
}

main()
  .then(() => {
    console.log("Finished creating document");
  })
  .catch((err) => {
    console.error("Error: ", err);
    throw err;
  });
