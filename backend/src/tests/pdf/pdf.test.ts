import fs from "fs";
import path from "path";
import { expect, test } from "vitest";

import { DocumentKind } from "@/global/types/appTypes";
import { renderMultiplePDF } from "@/pdf/renderPDF";
import { getInvoiceDocument, getOfferDocument, getOverdueNoticeDocument } from "@/tests/factories";

const SNAPSHOT_DIR = path.resolve("src/tests/pdf");

function compareToSnapshot(buffer: Buffer, snapshotFile: string) {
  const snapshotPath = path.join(SNAPSHOT_DIR, snapshotFile);
  const expectedLines = String(fs.readFileSync(snapshotPath)).split("\n");
  String(buffer)
    .split("\n")
    .forEach((resultLine, index) => {
      const expectedLine = expectedLines[index];
      if (expectedLine?.startsWith("(D:") && expectedLine.endsWith("Z)")) return; // creation date differs between runs
      if (expectedLine?.startsWith("/ID [<")) return; // content hash differs between runs
      expect(resultLine).toBe(expectedLine);
    });
}

test("invoice PDF generation", async () => {
  const buffer = await renderMultiplePDF([
    { kind: DocumentKind.invoice, document: await getInvoiceDocument() },
  ]);
  compareToSnapshot(buffer, "invoice_snapshot.pdf");
});

test("offer PDF generation", async () => {
  const buffer = await renderMultiplePDF([
    { kind: DocumentKind.offer, document: await getOfferDocument() },
  ]);
  compareToSnapshot(buffer, "offer_snapshot.pdf");
});

test("overdue notice PDF generation", async () => {
  const buffer = await renderMultiplePDF([
    { kind: DocumentKind.overdueNotice, document: await getOverdueNoticeDocument() },
  ]);
  compareToSnapshot(buffer, "overdue_notice_snapshot.pdf");
});
