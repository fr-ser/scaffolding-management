import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { expect, test, vi } from "vitest";

import { setReminderSubSumTableText, setReminderSumTable } from "@/pdf/reminder";
import { getInvoiceDocument, getOverdueNoticeDocument } from "@/tests/factories";

test("reminders charge VAT only on ordinary invoices, including in the payment QR code", async () => {
  const reverseInvoice = await getInvoiceDocument({
    id: "reverse",
    client_reverse_vat: true,
    service_dates: ["2026-01-01"],
  });
  const ordinaryInvoice = await getInvoiceDocument({
    id: "ordinary",
    client_reverse_vat: false,
    service_dates: ["2026-01-01"],
  });
  const document = await getOverdueNoticeDocument({
    invoice_documents: [reverseInvoice, ordinaryInvoice],
    notice_costs: 10,
    default_interest: 5,
  });
  const pdf = new PDFDocument();
  const text = vi.spyOn(pdf, "text");
  const qr = vi.spyOn(QRCode, "toBuffer");
  const page = { totalPages: 1, prevY: 0, currY: 0 };

  setReminderSumTable(pdf, document, page);
  expect(text.mock.calls.map((call) => call[0])).toEqual(["2.000,00 €", "190,00 €", "2.205,00 €"]);

  await setReminderSubSumTableText(pdf, document, page);
  expect(qr.mock.calls[0][0]).toContain("EUR2205.00");
  qr.mockRestore();
  pdf.end();
});
