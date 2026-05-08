/**
 * Regenerates the PDF snapshot files used by pdf.test.ts.
 *
 * Run via: npm run generate-pdf-snapshots (from backend/)
 *
 * Must be run with CONFIG_PATH pointing to .env.development so that
 * VITE_COMPANY_* env vars match the environment used by the test runner.
 */
import fs from "fs";
import path from "path";

import { DocumentKind } from "@/global/types/appTypes";
import { renderMultiplePDF } from "@/pdf/renderPDF";
import { getInvoiceDocument, getOfferDocument, getOverdueNoticeDocument } from "@/tests/factories";

const SNAPSHOT_DIR = path.resolve("src/tests/pdf");

async function main() {
  const invoicePdf = await renderMultiplePDF([
    { kind: DocumentKind.invoice, document: await getInvoiceDocument() },
  ]);
  fs.writeFileSync(path.join(SNAPSHOT_DIR, "invoice_snapshot.pdf"), invoicePdf);
  console.log("Written: invoice_snapshot.pdf");

  const offerPdf = await renderMultiplePDF([
    { kind: DocumentKind.offer, document: await getOfferDocument() },
  ]);
  fs.writeFileSync(path.join(SNAPSHOT_DIR, "offer_snapshot.pdf"), offerPdf);
  console.log("Written: offer_snapshot.pdf");

  const overduePdf = await renderMultiplePDF([
    { kind: DocumentKind.overdueNotice, document: await getOverdueNoticeDocument() },
  ]);
  fs.writeFileSync(path.join(SNAPSHOT_DIR, "overdue_notice_snapshot.pdf"), overduePdf);
  console.log("Written: overdue_notice_snapshot.pdf");
}

void main();
