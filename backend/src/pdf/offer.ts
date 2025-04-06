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
  pdfFile.font("Helvetica");

  newPageCheck(pdfFile, pdfFile.y, pdfFile.currentLineHeight() * 5, pdfFileData);

  pdfFile.text(" ", appPageOptions.horizontalMargin);
  pdfFile
    .text(
      "Die oben zusammengefassten Angaben sind nur geschätzte Angaben und werden bei Rechnungsstellung genau ermittelt und abgerechnet.",
    )
    .text(" ")
    .text("Zahlung ohne Abzug innerhalb 14 Werktagen nach Rechnungserhalt bei uns eingehend.")
    .text(" ");

  newPageCheck(pdfFile, pdfFile.y, pdfFile.currentLineHeight() * 12, pdfFileData);
  pdfFile.text("Dem Leistungsverzeichnis liegen zugrunde:");

  const multiLineBulletPointY = pdfFile.y;
  pdfFile
    .text("•", appPageOptions.horizontalMargin + mmToPx(4), multiLineBulletPointY)
    .text(
      "Die VOB (Verdingungsordung für Bauleistungen) Teil A und B, sowie Teil C - Allgemeine Technische Vertragsbedingungen für Bauleistungen (ATV) Gerüstbauarbeiten - DIN 18 451",
      appPageOptions.horizontalMargin + mmToPx(6),
      multiLineBulletPointY,
    )
    .text("• Die TRBS 2121-1", appPageOptions.horizontalMargin + mmToPx(4))
    .text("• Die Unfallverhütungs-Vorschriften der Bau-Berufsgenossenschaften")
    .text("• Die Montage- Aufbauanleitungen der Gerüsthersteller")
    .text(" ", appPageOptions.horizontalMargin)
    .text(
      "Wir weisen auf die Nutzungshinweise bzw. Verwendungsbeschränkungen hin. Diese gelten nach Auftragserteilung als anerkannt.",
    )
    .text(" ");

  newPageCheck(pdfFile, pdfFile.y, pdfFile.currentLineHeight() * 10, pdfFileData);

  pdfFile
    .font("Helvetica-Bold")
    .text("Stundenverrechnungssätze:")
    .font("Helvetica")
    .text("• Kolonnenführer 65,00 €/Stunde", appPageOptions.horizontalMargin + mmToPx(4))
    .text("• Gerüstbauer 60,00 €/Stunde")
    .text("• Gerüstwerker 55,00 €/Stunde")
    .text(" ", appPageOptions.horizontalMargin)
    .text(
      "An- und Abfahrt unserer Montagekolonne, bestehend aus 2 Mann incl. LKW für den Material- bzw. Personentransport, für Gerüstumbauarbeiten oder Teilauf- bzw. Teilabbauten Pauschal 225,00 €/Stück. Wie vor, jedoch 3 Mann = 285,00 €/Stück.",
    )
    .text(" ");

  newPageCheck(pdfFile, pdfFile.y, pdfFile.currentLineHeight() * 7, pdfFileData);

  pdfFile
    .text(
      "Eine fach- und termingerechte Ausführung sichern wir Ihnen zu und würden uns über eine Auftragserteilung freuen.",
      appPageOptions.horizontalMargin,
    )
    .text(" ")
    .text("Mit freundlichen Grüßen")
    .text(" ")
    .text(COMPANY_NAME);

  newPageCheck(pdfFile, pdfFile.y, pdfFile.currentLineHeight() * 4, pdfFileData);

  const signatureLineY = pdfFile.y;
  pdfFile
    .text(" ", appPageOptions.horizontalMargin, signatureLineY)
    .text(
      "Zur Auftragserteilung und Bestätigung senden Sie uns das Angebot bitte unterschrieben zurück:",
      {
        width: mmToPx(130),
      },
    )
    .text(" ", mmToPx(145), signatureLineY)
    .text("______________________")
    .text("Datum und Unterschrift");
}
