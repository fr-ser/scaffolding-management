import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { expect, test, vi } from "vitest";

import { ArticleKind, DocumentKind } from "@/global/types/appTypes";
import { setInvoiceSubSumTableText } from "@/pdf/invoice";
import { appPageOptions } from "@/pdf/renderHelpers";
import { renderMultiplePDF } from "@/pdf/renderPDF";
import { getInvoiceDocument } from "@/tests/factories";

test.each([
  [true, "EUR1000.00"],
  [false, "EUR1190.00"],
])("invoice payment QR reflects reverse-charge status %s", async (reverseVat, expectedAmount) => {
  const invoice = await getInvoiceDocument({
    client_reverse_vat: reverseVat,
    service_dates: ["2026-01-01"],
  });
  const pdf = new PDFDocument();
  const qr = vi.spyOn(QRCode, "toBuffer");

  try {
    await setInvoiceSubSumTableText(pdf, invoice, { totalPages: 1, prevY: 0, currY: 0 });
    expect(qr.mock.calls[0][0]).toContain(expectedAmount);
  } finally {
    qr.mockRestore();
    pdf.end();
  }
});

test("reverse-charge notice stays directly below the sum table across page breaks", async () => {
  const observations: { text: string; page: number; y: number }[] = [];
  const originalText = PDFDocument.prototype.text;
  const text = vi.spyOn(PDFDocument.prototype, "text").mockImplementation(function (
    this: PDFKit.PDFDocument,
    ...args: Parameters<typeof originalText>
  ) {
    const result = Reflect.apply(originalText, this, args);
    if (typeof args[0] === "string") {
      observations.push({ text: args[0], page: this.bufferedPageRange().count, y: this.y });
    }
    return result;
  });

  try {
    let sawPageBreak = false;
    for (const itemCount of [1, 12, 24]) {
      observations.length = 0;
      const invoice = await getInvoiceDocument({
        client_reverse_vat: true,
        items: Array.from({ length: itemCount }, (_, index) => ({
          id: index + 1,
          invoice_document_id: "document_id",
          kind: ArticleKind.item,
          title: `Item ${index + 1}`,
          description: "Description",
          unit: "unit",
          price: 10,
          amount: 1,
        })),
      });

      await renderMultiplePDF([{ kind: DocumentKind.invoice, document: invoice }]);
      const sum = observations.find((entry) => entry.text === "Brutto");
      const notice = observations.find((entry) =>
        entry.text.startsWith("Steuerschuldnerschaft des Leistungsempfängers"),
      );
      const explanation = observations.find((entry) =>
        entry.text.startsWith("Die Rechnung enthält keine Umsatzsteuer"),
      );
      const payment = observations.find((entry) =>
        entry.text.startsWith("Überweisen Sie bitte den offenen Betrag"),
      );

      expect(sum).toBeDefined();
      expect(notice).toBeDefined();
      expect(explanation).toBeDefined();
      expect(payment).toBeDefined();
      expect(notice!.page).toBe(sum!.page);
      expect(explanation!.page).toBe(sum!.page);
      expect(explanation!.y).toBeLessThanOrEqual(appPageOptions.footerStart);
      expect(notice!.y).toBeGreaterThan(sum!.y);
      expect(notice!.y - sum!.y).toBeLessThan(80);
      expect(observations.indexOf(notice!)).toBeLessThan(observations.indexOf(payment!));
      sawPageBreak ||= sum!.page > 1;
    }
    expect(sawPageBreak).toBe(true);
  } finally {
    text.mockRestore();
  }
});
