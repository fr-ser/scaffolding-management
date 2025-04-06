import { COMPANY_NAME } from "@/config";
import { formatIsoDateString, formatNumber, getItemSum, getVatRate } from "@/global/helpers";
import { OverdueNoticeDocument } from "@/global/types/entities";
import { PdfFileData, appPageOptions, mmToPx, newPageCheck } from "@/pdf/renderHelpers";

const rmdTParams: { [index: string]: number } = {
  c1x: appPageOptions.horizontalMargin,
  c2x: mmToPx(52), // invoice number
  c3x: mmToPx(85), // invoice date
  c4x: mmToPx(118), // payment due date
  c5x: mmToPx(142), // net
  c6x: mmToPx(168), // VAT
  c7x: appPageOptions.pageWidth - appPageOptions.horizontalMargin, // total
}; // table parameters for the reminder table

export function setReminderInformationTable(
  pdfFile: PDFKit.PDFDocument,
  document: OverdueNoticeDocument,
) {
  pdfFile
    .font("Helvetica")
    .fontSize(9)
    .text("Mahndatum:", mmToPx(135), mmToPx(42))
    .text("Kundennummer:")
    .text("Belegnummer:");

  pdfFile
    .text(formatIsoDateString(document.notice_date), mmToPx(170), mmToPx(42), {
      width: mmToPx(25),
      align: "center",
    })
    .text(document.client_id, { width: mmToPx(25), align: "center" })
    .text(document.id, { width: mmToPx(25), align: "center" });
}

export function setInitialReminderText(
  pdfFile: PDFKit.PDFDocument,
  document: OverdueNoticeDocument,
) {
  pdfFile
    .font("Helvetica")
    .fontSize(9)
    .text("auf unsere u.a. Rechnung(en) haben wir noch keinen Zahlungseingang feststellen können.")
    .text(
      "Wir bitten Sie, die Regulierung nachzuholen und sehen dem Eingang Ihrer Zahlung entgegen.",
    )
    .text(
      "Sollten Sie zwischenzeitlich die Zahlung bereits geleistet haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.",
    )
    .text(
      `Es wurden ihre Zahlungen bis zum ${formatIsoDateString(document.payments_until)} berücksichtigt.`,
    )
    .moveDown()
    .text("Bitte zahlen Sie bis spätestens: ", { continued: true })
    .font("Helvetica-Bold")
    .text(formatIsoDateString(document.payment_target))
    .font("Helvetica");
}

export function createRmdTable(
  pdfFile: PDFKit.PDFDocument,
  document: OverdueNoticeDocument,
  pdfFileData: PdfFileData,
) {
  pdfFile
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("Rechnungsnummer", rmdTParams.c1x, mmToPx(107), {
      width: rmdTParams.c2x - rmdTParams.c1x,
      align: "center",
    })
    .text("Rechnungsdatum", rmdTParams.c2x, mmToPx(107), {
      width: rmdTParams.c3x - rmdTParams.c2x,
      align: "center",
    })
    .text("Fälligkeitsdatum", rmdTParams.c3x, mmToPx(107), {
      width: rmdTParams.c4x - rmdTParams.c3x,
      align: "center",
    })
    .text("Netto", rmdTParams.c4x, mmToPx(107), {
      width: rmdTParams.c5x - rmdTParams.c4x,
      align: "center",
    })
    .text("USt.", rmdTParams.c5x, mmToPx(107), {
      width: rmdTParams.c6x - rmdTParams.c5x,
      align: "center",
    })
    .text("Gesamt", rmdTParams.c6x, mmToPx(107), {
      width: rmdTParams.c7x - rmdTParams.c6x,
      align: "center",
    });

  pdfFile
    .lineWidth(1)
    .moveTo(rmdTParams.c1x, mmToPx(111))
    .lineTo(appPageOptions.pageWidth - appPageOptions.horizontalMargin, mmToPx(111))
    .stroke();

  pdfFileData.currY = pdfFile.y + 5;

  document.invoice_documents.forEach(function (invoice) {
    if (
      newPageCheck(
        pdfFile,
        pdfFileData.currY,
        pdfFile.heightOfString(invoice.id, { width: rmdTParams.c2x - rmdTParams.c1x }),
        pdfFileData,
      )
    ) {
      pdfFile
        .lineWidth(1)
        .strokeOpacity(0.5)
        .strokeColor([96, 125, 139])
        .moveTo(rmdTParams.c1x, pdfFileData.currY - 5)
        .lineTo(appPageOptions.pageWidth - appPageOptions.horizontalMargin, pdfFileData.currY - 5)
        .stroke();
    }

    const netSum = getItemSum(invoice.items);
    const vatRate = getVatRate({ isoDate: invoice.service_dates[0] });

    pdfFile
      .font("Helvetica")
      .fontSize(9)
      .text(invoice.id, rmdTParams.c1x, pdfFileData.currY, {
        width: rmdTParams.c2x - rmdTParams.c1x,
        align: "center",
      })
      .text(formatIsoDateString(invoice.creation_date), rmdTParams.c2x, pdfFileData.currY, {
        width: rmdTParams.c3x - rmdTParams.c2x,
        align: "center",
      })
      .text(formatIsoDateString(invoice.payment_target), rmdTParams.c3x, pdfFileData.currY, {
        width: rmdTParams.c4x - rmdTParams.c3x,
        align: "center",
      })
      .text(formatNumber(netSum, { currency: true }), rmdTParams.c4x, pdfFileData.currY, {
        width: rmdTParams.c5x - rmdTParams.c4x,
        align: "center",
      })
      .text(formatNumber(netSum * vatRate, { currency: true }), rmdTParams.c5x, pdfFileData.currY, {
        width: rmdTParams.c6x - rmdTParams.c5x,
        align: "center",
      })
      .text(
        formatNumber(netSum * (1 + vatRate), { currency: true }),
        rmdTParams.c6x,
        pdfFileData.currY,
        {
          width: rmdTParams.c7x - rmdTParams.c6x,
          align: "center",
        },
      );

    pdfFile
      .lineWidth(1)
      .strokeOpacity(0.5)
      .strokeColor([96, 125, 139])
      .moveTo(rmdTParams.c1x, pdfFile.y + 1)
      .lineTo(appPageOptions.pageWidth - appPageOptions.horizontalMargin, pdfFile.y + 1)
      .stroke();

    pdfFileData.prevY = pdfFileData.currY;
    pdfFileData.currY = pdfFile.y + 5;

    for (let ii = 1; ii < 8; ii++) {
      const tempX = rmdTParams["c" + ii + "x"];

      pdfFile
        .lineWidth(1)
        .strokeOpacity(0.5)
        .strokeColor([96, 125, 139])
        .moveTo(tempX, pdfFileData.prevY - 5)
        .lineTo(tempX, pdfFileData.currY - 5)
        .stroke();
    }
  });
  pdfFile.y += 20;

  if (document.notice_costs > 0)
    pdfFile.text(
      `Zzgl. Mahnkosten in Höhe von: ${formatNumber(document.notice_costs, { currency: true })}`,
      rmdTParams.c1x,
    );
  if (document.default_interest != null)
    pdfFile.text(
      `Zzgl. Verzugszinsen in Höhe von: ${formatNumber(document.default_interest, {
        currency: true,
      })}`,
      rmdTParams.c1x,
    );

  pdfFileData.currY = pdfFile.y + 10;
}

export function setReminderSumTable(
  pdfFile: PDFKit.PDFDocument,
  document: OverdueNoticeDocument,
  pdfFileData: PdfFileData,
) {
  let prices = { net: 0, tax: 0, gross: 0 };
  for (const invoice of document.invoice_documents) {
    const netSum = getItemSum(invoice.items);
    const vatRate = getVatRate({ isoDate: invoice.service_dates[0] });

    prices = {
      net: prices.net + netSum,
      tax: prices.tax + netSum * vatRate,
      gross: prices.gross + netSum * (1 + vatRate),
    };
  }

  pdfFile
    .font("Helvetica")
    .text(
      formatNumber(prices.net, { currency: true }),
      appPageOptions.horizontalMargin,
      pdfFileData.currY,
      {
        width: mmToPx(60),
        align: "center",
      },
    )
    .text(
      formatNumber(prices.tax, { currency: true }),
      appPageOptions.horizontalMargin + mmToPx(60),
      pdfFileData.currY,
      {
        width: mmToPx(60),
        align: "center",
      },
    )
    .text(
      formatNumber(prices.gross + document.notice_costs + document.default_interest, {
        currency: true,
      }),
      appPageOptions.horizontalMargin + mmToPx(120),
      pdfFileData.currY,
      { width: mmToPx(60), align: "center" },
    );
}

export function setReminderSubSumTableText(pdfFile: PDFKit.PDFDocument, pdfFileData: PdfFileData) {
  if (pdfFileData.totalPages === 1 && pdfFileData.currY < mmToPx(240))
    pdfFileData.currY = mmToPx(240);
  pdfFile.font("Helvetica");

  newPageCheck(pdfFile, pdfFileData.currY, pdfFile.currentLineHeight() * 2, pdfFileData);

  pdfFile
    .text(" ", appPageOptions.horizontalMargin, pdfFileData.currY)
    .text("Überweisen Sie bitte den offenen Betrag auf das unten aufgeführte Geschäftskonto.");
  pdfFileData.currY = pdfFile.y;

  newPageCheck(pdfFile, pdfFileData.currY, pdfFile.currentLineHeight() * 4, pdfFileData);

  pdfFile
    .text(" ", appPageOptions.horizontalMargin, pdfFileData.currY)
    .text("Mit freundlichen Grüßen")
    .moveDown()
    .text(COMPANY_NAME);
  pdfFileData.currY = pdfFile.y;
}
