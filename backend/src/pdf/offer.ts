import { COMPANY_NAME } from "@/config";
import { formatIsoDateString } from "@/global/helpers";
import { OfferDocument } from "@/global/types/entities";
import { PdfFileData, appPageOptions, mmToPx, newPageCheck } from "@/pdf/renderHelpers";

export function setOfferInformationTable(pdfFile: PDFKit.PDFDocument, document: OfferDocument) {
  pdfFile
    .font("Helvetica")
    .fontSize(9)
    .text("Angebotsdatum:", mmToPx(135), mmToPx(40))
    .text("Kundennummer:")
    .text("Angebotsnummer:")
    .text("Angebot gültig bis:");

  pdfFile
    .text(formatIsoDateString(document.offered_at), mmToPx(170), mmToPx(40), {
      width: mmToPx(25),
      align: "center",
    })
    .text(document.client_id, { width: mmToPx(25), align: "center" })
    .text(document.id, { width: mmToPx(25), align: "center" })
    .text(formatIsoDateString(document.offer_valid_until), { width: mmToPx(25), align: "center" });
}

export function setInitialOfferText(pdfFile: PDFKit.PDFDocument) {
  pdfFile
    .font("Helvetica")
    .fontSize(9)
    .text("vielen Dank für Ihr Interesse. Hiermit unterbreiten wir Ihnen folgendes Angebot.");
}

export function setOfferSubSumTableText(pdfFile: PDFKit.PDFDocument, pdfFileData: PdfFileData) {
  if (pdfFileData.totalPages === 1 && pdfFileData.currY < mmToPx(220))
    pdfFileData.currY = mmToPx(220);
  pdfFile.font("Helvetica");
  newPageCheck(pdfFile, pdfFileData.currY, pdfFile.currentLineHeight() * 3, pdfFileData);
  pdfFile.text(" ", appPageOptions.horizontalMargin, pdfFileData.currY);
  pdfFile.text(
    "Die oben zusammengefassten Angaben sind nur geschätzte Angaben und werden" +
      " bei Rechnungsstellung genau ermittelt und abgerechnet.",
  );
  pdfFileData.currY = pdfFile.y;

  newPageCheck(pdfFile, pdfFileData.currY, pdfFile.currentLineHeight() * 5, pdfFileData);
  pdfFile
    .text(
      "Wir hoffen Ihnen sagt unser Angebot zu und " +
        "würden uns freuen, Ihren Auftrag zu erhalten!",
      appPageOptions.horizontalMargin,
      pdfFileData.currY,
    )
    .text(" ")
    .text("Mit freundlichen Grüßen")
    .text(" ")
    .text(COMPANY_NAME);
  pdfFileData.currY = pdfFile.y;

  newPageCheck(pdfFile, pdfFileData.currY, pdfFile.currentLineHeight() * 4, pdfFileData);
  pdfFile
    .text(" ", appPageOptions.horizontalMargin, pdfFileData.currY)
    .text(
      "Zur Auftragsersteilung und Bestätigung senden Sie uns das Angebot bitte unterschrieben zurück:",
      {
        width: mmToPx(130),
      },
    )
    .text(" ", mmToPx(145), pdfFileData.currY)
    .text("______________________")
    .text("Datum und Unterschrift");
  pdfFileData.currY = pdfFile.y;
}
