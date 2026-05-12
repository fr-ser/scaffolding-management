import QRCode from "qrcode";

import { COMPANY_BIC, COMPANY_IBAN, COMPANY_NAME } from "@/config";

export const mmToPx = function (num: number) {
  // default dpi is 72
  return (72 / 25.4) * num;
};

export const appPageOptions = {
  pageHeight: mmToPx(297),
  pageWidth: mmToPx(210),
  horizontalMargin: mmToPx(15),
  headerEnd: mmToPx(40),
  footerStart: mmToPx(270),
};

export interface PdfFileData {
  totalPages: number;
  prevY: number;
  currY: number;
}

export const pageOptions: PDFKit.PDFDocumentOptions = {
  size: [appPageOptions.pageWidth, appPageOptions.pageHeight], // A4 in mm: 210 x 297
  margins: {
    // by default, all are 72
    top: 0,
    bottom: 0,
    left: appPageOptions.horizontalMargin,
    right: appPageOptions.horizontalMargin,
  },
  layout: "portrait", // can be 'landscape',
  bufferPages: true,
};

export function newPageCheck(
  doc: PDFKit.PDFDocument,
  start: number,
  addition: number,
  argPDocData: PdfFileData,
) {
  if (appPageOptions.footerStart < start + addition) {
    doc.addPage(pageOptions);
    argPDocData.totalPages++;
    argPDocData.currY = appPageOptions.headerEnd;
    doc.y = argPDocData.currY;
    return true;
  } else return false;
}

/**
 * Generates an EPC-QR Code string according to the SEPA Credit Transfer (SCT) standard.
 * Format:
 * BCD (Service Tag)
 * 002 (Version)
 * 1 (Character Set)
 * SCT (Identification)
 * BIC
 * Name
 * IBAN
 * EUR[Amount]
 * [Reference]
 */
export function generateEpcQrCodeString(amount: number, reference: string): string {
  const amountStr = amount.toFixed(2);
  return [
    "BCD",
    "002",
    "1",
    "SCT",
    COMPANY_BIC,
    COMPANY_NAME,
    COMPANY_IBAN,
    `EUR${amountStr}`,
    "", // Purpose Code (optional)
    reference, // Remittance Information (Unstructured)
    "", // Advice
  ].join("\n");
}

/**
 * Generates a QR code and draws it onto the PDF document.
 */
export async function drawEpcQrCode(
  doc: PDFKit.PDFDocument,
  amount: number,
  reference: string,
  x: number,
  y: number,
) {
  const savedY = doc.y;
  const savedFont = (doc as unknown as { _font?: { name: string } })._font?.name || "Helvetica";
  const savedSize = (doc as unknown as { _fontSize?: number })._fontSize || 9;

  const epcString = generateEpcQrCodeString(amount, reference);
  const qrBuffer = await QRCode.toBuffer(epcString, {
    margin: 1,
    scale: 4,
    errorCorrectionLevel: "M",
  });

  const qrWidth = mmToPx(25);
  doc
    .font("Helvetica")
    .fontSize(7)
    .text("Überweisung per QR-Code", x - mmToPx(5), y - 10, {
      width: qrWidth + mmToPx(10),
      align: "center",
    });
  doc.image(qrBuffer, x, y, { width: qrWidth });

  // Restore cursor and font settings
  doc.y = savedY;
  doc.font(savedFont).fontSize(savedSize);
}
