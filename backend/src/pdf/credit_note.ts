import { COMPANY_NAME } from "@/config";
import { formatIsoDateString } from "@/global/helpers";
import { CreditNoteDocument } from "@/global/types/entities";
import { PdfFileData, appPageOptions, mmToPx, newPageCheck } from "@/pdf/renderHelpers";

export function setCreditNoteInformationTable(
  pdfFile: PDFKit.PDFDocument,
  document: CreditNoteDocument,
) {
  pdfFile
    .font("Helvetica")
    .fontSize(9)
    .text("Gutschriftsdatum:", mmToPx(135), mmToPx(42))
    .text("Kundennummer:")
    .text("Gutschriftsnummer:");

  pdfFile
    .text(formatIsoDateString(document.credit_date), mmToPx(170), mmToPx(42), {
      width: mmToPx(25),
      align: "center",
    })
    .text(document.client_id, { width: mmToPx(25), align: "center" })
    .text(document.id, { width: mmToPx(25), align: "center" });
}

export const setInitialCreditNoteText = function setInitialCreditNoteText(
  pdfFile: PDFKit.PDFDocument,
) {
  pdfFile.font("Helvetica").fontSize(9).text("wir schreiben Ihnen den folgenden Betrag gut.");
};

export const setCreditNoteSubSumTableText = function setCreditNoteSubSumTableText(
  pdfFile: PDFKit.PDFDocument,
  pdfFileData: PdfFileData,
) {
  if (pdfFileData.totalPages === 1 && pdfFileData.currY < mmToPx(225))
    pdfFileData.currY = mmToPx(225);
  pdfFile.font("Helvetica");

  newPageCheck(pdfFile, pdfFileData.currY, pdfFile.currentLineHeight() * 3, pdfFileData);

  pdfFile
    .text(" ", appPageOptions.horizontalMargin, pdfFileData.currY)
    .text(
      "Der gutgeschriebene Betrag wird mit Ihrer nächsten Rechnung verrechnet oder auf Wunsch erstattet.",
    );
  pdfFileData.currY = pdfFile.y;

  newPageCheck(pdfFile, pdfFileData.currY, pdfFile.currentLineHeight() * 4, pdfFileData);

  pdfFile
    .text(" ", appPageOptions.horizontalMargin, pdfFileData.currY)
    .text("Mit freundlichen Grüßen")
    .moveDown()
    .text(COMPANY_NAME);
  pdfFileData.currY = pdfFile.y;
};
