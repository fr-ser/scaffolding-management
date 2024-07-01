import fs from "fs";
import { expect, test } from "vitest";

import { DocumentKind } from "@/global/types/appTypes";
import { renderMultiplePDF } from "@/pdf/renderPDF";
import { getInvoiceDocument, getOfferDocument, getOverdueNoticeDocument } from "@/tests/factories";

test("invoice PDF generation", async () => {
  const resultPDF = await renderMultiplePDF([
    { kind: DocumentKind.invoice, document: getInvoiceDocument() },
  ]);
  const pdfLines = String(resultPDF).split("\n");
  const snapshotLines = String(fs.readFileSync("src/tests/pdf/invoice_snapshot.pdf")).split("\n");

  for (let index = 0; index < pdfLines.length; index++) {
    const pdfLine = pdfLines[index];
    const snapshotLine = snapshotLines[index];

    if (snapshotLine.startsWith("(D:20240701")) continue; //  timestamps
    if (snapshotLine.startsWith("/ID [<")) continue; // some ID, no idea what it is

    expect(pdfLine).toBe(snapshotLine);
  }
});

test("offer PDF generation", async () => {
  const resultPDF = await renderMultiplePDF([
    { kind: DocumentKind.offer, document: getOfferDocument() },
  ]);
  const pdfLines = String(resultPDF).split("\n");
  const snapshotLines = String(fs.readFileSync("src/tests/pdf/offer_snapshot.pdf")).split("\n");

  for (let index = 0; index < pdfLines.length; index++) {
    const pdfLine = pdfLines[index];
    const snapshotLine = snapshotLines[index];

    if (snapshotLine.startsWith("(D:20240701")) continue; //  timestamps
    if (snapshotLine.startsWith("/ID [<")) continue; // some ID, no idea what it is

    expect(pdfLine).toBe(snapshotLine);
  }
});

test("overdue notice PDF generation", async () => {
  const resultPDF = await renderMultiplePDF([
    { kind: DocumentKind.overdueNotice, document: getOverdueNoticeDocument() },
  ]);
  const pdfLines = String(resultPDF).split("\n");
  const snapshotLines = String(fs.readFileSync("src/tests/pdf/overdue_notice_snapshot.pdf")).split(
    "\n",
  );

  for (let index = 0; index < pdfLines.length; index++) {
    const pdfLine = pdfLines[index];
    const snapshotLine = snapshotLines[index];

    if (snapshotLine.startsWith("(D:20240701")) continue; //  timestamps
    if (snapshotLine.startsWith("/ID [<")) continue; // some ID, no idea what it is

    expect(pdfLine).toBe(snapshotLine);
  }
});
