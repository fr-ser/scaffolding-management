import { COMPANY_NAME } from "@/config";
import { formatIsoDateString, formatNumber } from "@/global/helpers";
import { InvoiceDocument } from "@/global/types/entities";
import { PdfFileData, appPageOptions, mmToPx, newPageCheck } from "@/pdf/renderHelpers";

export function setInvoiceInformationTable(pdfFile: PDFKit.PDFDocument, document: InvoiceDocument) {
  pdfFile
    .font("Helvetica")
    .fontSize(9)
    .text("Rechnungsdatum:", mmToPx(135), mmToPx(42))
    .text("Kundennummer:")
    .text("Rechnungsnummer:");

  pdfFile
    .text(formatIsoDateString(document.creation_date), mmToPx(170), mmToPx(42), {
      width: mmToPx(25),
      align: "center",
    })
    .text(document.client_id, { width: mmToPx(25), align: "center" })
    .text(document.id, { width: mmToPx(25), align: "center" });
}

export const setInitialInvoiceText = function setInitialInvoiceText(pdfFile: PDFKit.PDFDocument) {
  pdfFile
    .font("Helvetica")
    .fontSize(9)
    .text("vielen Dank für Ihren Auftrag, den wir wie folgt in Rechnung stellen.");
};

export const setInvoiceSubSumTableText = function setInvoiceSubSumTableText(
  pdfFile: PDFKit.PDFDocument,
  document: InvoiceDocument,
  pdfFileData: PdfFileData,
) {
  if (pdfFileData.totalPages === 1 && pdfFileData.currY < mmToPx(225))
    pdfFileData.currY = mmToPx(225);
  pdfFile.font("Helvetica");

  newPageCheck(pdfFile, pdfFileData.currY, pdfFile.currentLineHeight() * 3, pdfFileData);

  pdfFile
    .text(" ", appPageOptions.horizontalMargin, pdfFileData.currY)
    .text("Überweisen Sie bitte den offenen Betrag auf das unten aufgeführte Geschäftskonto.")
    .text("Sie sind verpflichtet, die Rechnung zu Steuerzwecken zwei Jahre lang aufzubewahren.");
  pdfFileData.currY = pdfFile.y;

  const getLeistungsDatumString = function getLeistungsDatumString(datArr: Array<string>): string {
    return datArr
      .map((item) => {
        return formatIsoDateString(item);
      })
      .join(", ");
  };

  newPageCheck(pdfFile, pdfFileData.currY, pdfFile.currentLineHeight() * 4, pdfFileData);

  pdfFile
    .text(" ", appPageOptions.horizontalMargin, pdfFileData.currY)
    .text(
      `Die aufgeführten Arbeiten wurden am ${getLeistungsDatumString(document.service_dates)} ausgeführt.`,
    )
    .text(
      `Zahlungsziel: Bitte zahlen Sie bis zum ${formatIsoDateString(document.payment_target)} ohne Abzug.`,
    );
  if (document.can_have_cash_discount) {
    pdfFile.text(
      `Sofern Sie innerhalb von ${document.discount_duration} Tagen zahlen, sind Sie zu einem Abzug` +
        ` von ${formatNumber(document.discount_percentage)}% berechtigt.`,
    );
  }
  pdfFileData.currY = pdfFile.y;

  newPageCheck(pdfFile, pdfFileData.currY, pdfFile.currentLineHeight() * 4, pdfFileData);

  pdfFile
    .text(" ", appPageOptions.horizontalMargin, pdfFileData.currY)
    .text("Mit freundlichen Grüßen")
    .moveDown()
    .text(COMPANY_NAME);
  pdfFileData.currY = pdfFile.y;
};
