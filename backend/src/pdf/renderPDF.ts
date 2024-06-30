import path from 'path'
import PDFDocument from 'pdfkit'

import {
  COMPANY_BANK_NAME_1,
  COMPANY_BANK_NAME_2,
  COMPANY_BIC_1,
  COMPANY_BIC_2,
  COMPANY_EMAIL,
  COMPANY_HOMEPAGE,
  COMPANY_IBAN_1,
  COMPANY_IBAN_2,
  COMPANY_MOBILE_PHONE,
  COMPANY_NAME,
  COMPANY_OWNER,
  COMPANY_PHONE,
  COMPANY_POSTAL_CODE_AND_CITY,
  COMPANY_STREET_AND_NUMBER,
  COMPANY_TAX_CODE,
  COMPANY_VAT_CODE,
  STATIC_FILE_ROOT,
} from '@/config'
import { OfferDocumentItem } from '@/db/entities/document_items'
import { formatNumber, getVatRate, neverFunction, round } from '@/global/helpers'
import { ArticleKind, DocumentKind, OverdueNoticeLevel } from '@/global/types/appTypes'
import { AnyDocument } from '@/global/types/backendTypes'
import { InvoiceDocumentItem } from '@/global/types/entities'
import {
  setInitialInvoiceText,
  setInvoiceInformationTable,
  setInvoiceSubSumTableText,
} from '@/pdf/invoice'
import { setInitialOfferText, setOfferInformationTable, setOfferSubSumTableText } from '@/pdf/offer'
import {
  createRmdTable,
  setInitialReminderText,
  setReminderInformationTable,
  setReminderSubSumTableText,
  setReminderSumTable,
} from '@/pdf/reminder'
import { PdfFileData, appPageOptions, mmToPx, newPageCheck, pageOptions } from '@/pdf/renderHelpers'

const createDocument = function createDocument(
  pdfFile: PDFKit.PDFDocument,
  documentData: AnyDocument,
) {
  const tParams: { [index: string]: number } = {
    c1x: appPageOptions.horizontalMargin, // description
    c2x: mmToPx(90), // amount
    c3x: mmToPx(105), // unit
    c4x: mmToPx(120), // price
    c5x: mmToPx(135), // net
    c6x: mmToPx(150), // VAT %
    c7x: mmToPx(162), // VAT
    c8x: mmToPx(177), // total
    c9x: appPageOptions.pageWidth - appPageOptions.horizontalMargin,
  } // table parameters

  let pdfFileData: PdfFileData = {
    totalPages: 1,
    prevY: 0,
    currY: 0,
  }

  let vatRate: number

  if (documentData.kind === DocumentKind.invoice) {
    vatRate = getVatRate({ isoDate: documentData.document.service_dates[0] })
  } else if (documentData.kind === DocumentKind.offer) {
    vatRate = getVatRate({ isoDate: documentData.document.offered_at })
  } else vatRate = 0

  function createHeaderAndFooter() {
    let range = pdfFile.bufferedPageRange()

    for (let ii = range.start; ii < range.start + range.count; ii++) {
      pdfFile.switchToPage(ii)

      pdfFile.image(path.join(STATIC_FILE_ROOT, 'logo_pdf.png'), mmToPx(150), mmToPx(10), {
        width: mmToPx(35),
      })

      pdfFile.font('Helvetica-Bold').fontSize(8).text(COMPANY_NAME, mmToPx(15), mmToPx(10))

      pdfFile
        .font('Helvetica-Oblique')
        .fontSize(8)
        .text(`${COMPANY_STREET_AND_NUMBER}, ${COMPANY_POSTAL_CODE_AND_CITY}`)

      let titelText: string
      if (
        documentData.kind === DocumentKind.overdueNotice &&
        documentData.document.notice_level === OverdueNoticeLevel.last
      ) {
        titelText = 'Letzte Mahnung vor Abgabe an Inkasso'
      } else if (documentData.kind === DocumentKind.overdueNotice) {
        titelText = documentData.document.notice_level
      } else {
        titelText = documentData.kind
      }
      pdfFile
        .font('Helvetica-Bold')
        .fontSize(14)
        .text(titelText, mmToPx(15), mmToPx(20))
        .font('Helvetica')
        .fontSize(8)
        .text(`Seite: ${ii - range.start + 1}/${pdfFileData.totalPages}`)

      pdfFile
        .lineWidth(2)
        .strokeColor('black')
        .strokeOpacity(1)
        .moveTo(mmToPx(15), appPageOptions.footerStart)
        .lineTo(
          appPageOptions.pageWidth - appPageOptions.horizontalMargin,
          appPageOptions.footerStart,
        )
        .stroke()

      pdfFile
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(COMPANY_NAME, mmToPx(15), appPageOptions.footerStart + mmToPx(2))
        .font('Helvetica')
        .text(COMPANY_STREET_AND_NUMBER)
        .text(COMPANY_POSTAL_CODE_AND_CITY)
        .text(COMPANY_TAX_CODE)
        .text(COMPANY_VAT_CODE)

      pdfFile
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('Kontaktinformation', mmToPx(55), appPageOptions.footerStart + mmToPx(2))
        .font('Helvetica')
        .text(COMPANY_OWNER)
        .text(`Phone: ${COMPANY_PHONE}`)
        .text(`Mobil: ${COMPANY_MOBILE_PHONE}`)
        .text(`E-Mail: ${COMPANY_EMAIL}`)

      pdfFile
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('Bankverbindung', mmToPx(100), appPageOptions.footerStart + mmToPx(2), {
          width: mmToPx(100),
          align: 'center',
        })
        .font('Helvetica')
        .moveDown(3)
        .text(`Web: ${COMPANY_HOMEPAGE}`, { width: mmToPx(100), align: 'center' })

      pdfFile
        .font('Helvetica-Bold')
        .fontSize(7.5)
        .text(' ', mmToPx(100), appPageOptions.footerStart + mmToPx(2))
        .font('Helvetica')
        .text(COMPANY_BANK_NAME_1)
        .text(`IBAN: ${COMPANY_IBAN_1}`)
        .text(`BIC: ${COMPANY_BIC_1}`)

      pdfFile
        .lineWidth(1)
        .strokeColor('black')
        .strokeOpacity(1)
        .moveTo(mmToPx(147), appPageOptions.footerStart + mmToPx(5))
        .lineTo(mmToPx(147), appPageOptions.footerStart + mmToPx(13.5))
        .stroke()

      pdfFile
        .font('Helvetica-Bold')
        .fontSize(7.5)
        .text(' ', mmToPx(150), appPageOptions.footerStart + mmToPx(2))
        .font('Helvetica')
        .text(COMPANY_BANK_NAME_2)
        .text(`IBAN: ${COMPANY_IBAN_2}`)
        .text(`BIC: ${COMPANY_BIC_2}`)
    }
  }

  function createSubHeader() {
    pdfFile
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Empfänger', mmToPx(15), mmToPx(35))
      .text(
        documentData.document.client_company_name ||
          documentData.document.client_first_name + ' ' + documentData.document.client_last_name,
      )
      .font('Helvetica')
      .text(documentData.document.client_street_and_number || '')
      .text(documentData.document.client_postal_code + ' ' + documentData.document.client_city)

    pdfFile
      .lineWidth(1)
      .moveTo(mmToPx(135), mmToPx(38))
      .lineTo(appPageOptions.pageWidth - appPageOptions.horizontalMargin, mmToPx(38))
      .stroke()
      .moveTo(mmToPx(135), mmToPx(56))
      .lineTo(appPageOptions.pageWidth - appPageOptions.horizontalMargin, mmToPx(56))
      .stroke()

    if (documentData.kind === DocumentKind.offer)
      setOfferInformationTable(pdfFile, documentData.document)
    else if (documentData.kind === DocumentKind.invoice)
      setInvoiceInformationTable(pdfFile, documentData.document)
    else if (documentData.kind === DocumentKind.overdueNotice)
      setReminderInformationTable(pdfFile, documentData.document)
    else neverFunction(documentData)
  }

  function createTableTopText() {
    pdfFile
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('BV: ' + documentData.document.order_title, mmToPx(15), mmToPx(70))
    pdfFile
      .font('Helvetica')
      .fontSize(9)
      .text('Sehr geehrte Damen und Herren,', mmToPx(15), mmToPx(77))

    if (documentData.kind === DocumentKind.offer) setInitialOfferText(pdfFile)
    else if (documentData.kind === DocumentKind.invoice) setInitialInvoiceText(pdfFile)
    else if (documentData.kind === DocumentKind.overdueNotice)
      setInitialReminderText(pdfFile, documentData.document)
    else neverFunction(documentData)
  }

  function createQtInvTable() {
    pdfFile
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('Bezeichnung', tParams.c1x, mmToPx(90), {
        width: tParams.c2x - tParams.c1x,
        align: 'center',
      })
      .text('Anzahl', tParams.c2x, mmToPx(90), {
        width: tParams.c3x - tParams.c2x,
        align: 'center',
      })
      .text('Einheit', tParams.c3x, mmToPx(90), {
        width: tParams.c4x - tParams.c3x,
        align: 'center',
      })
      .text('Preis', tParams.c4x, mmToPx(90), {
        width: tParams.c5x - tParams.c4x,
        align: 'center',
      })
      .text('Netto', tParams.c5x, mmToPx(90), {
        width: tParams.c6x - tParams.c5x,
        align: 'center',
      })
      .text('USt. %', tParams.c6x, mmToPx(90), {
        width: tParams.c7x - tParams.c6x,
        align: 'center',
      })
      .text('Ust.', tParams.c7x, mmToPx(90), {
        width: tParams.c8x - tParams.c7x,
        align: 'center',
      })
      .text('Gesamt', tParams.c8x, mmToPx(90), {
        width: tParams.c9x - tParams.c8x,
        align: 'center',
      })

    pdfFile
      .lineWidth(1)
      .moveTo(tParams.c1x, mmToPx(94))
      .lineTo(appPageOptions.pageWidth - appPageOptions.horizontalMargin, mmToPx(94))
      .stroke()

    pdfFileData.currY = pdfFile.y + 5

    if (documentData.kind === DocumentKind.offer || documentData.kind === DocumentKind.invoice) {
      for (const item of documentData.document.items) {
        if (
          newPageCheck(
            pdfFile,
            pdfFileData.currY,
            pdfFile.heightOfString(item.description, {
              width: tParams.c2x - tParams.c1x,
            }),
            pdfFileData,
          )
        ) {
          pdfFile
            .lineWidth(1)
            .strokeOpacity(0.5)
            .strokeColor([96, 125, 139])
            .moveTo(tParams.c1x, pdfFileData.currY - 5)
            .lineTo(
              appPageOptions.pageWidth - appPageOptions.horizontalMargin,
              pdfFileData.currY - 5,
            )
            .stroke()
        }

        pdfFile
          .font('Helvetica-Bold')
          .fontSize(9)
          .text(item.title, tParams.c1x + 2, pdfFileData.currY, {
            width: tParams.c2x - tParams.c1x - 2,
          })
          .font('Helvetica')

        // could be two lines, therefore save height
        let postHeadY = pdfFile.y + 1

        if (item.kind === ArticleKind.item) {
          pdfFile
            .text(formatNumber(item.amount), tParams.c2x, pdfFileData.currY, {
              width: tParams.c3x - tParams.c2x,
              align: 'center',
            })
            .text(item.unit, tParams.c3x, pdfFileData.currY, {
              width: tParams.c4x - tParams.c3x,
              align: 'center',
            })
            .text(formatNumber(item.price), tParams.c4x, pdfFileData.currY, {
              width: tParams.c5x - tParams.c4x,
              align: 'center',
            })
            .text(
              formatNumber(item.price * item.amount, { decimals: 2 }),
              tParams.c5x,
              pdfFileData.currY,
              {
                width: tParams.c6x - tParams.c5x,
                align: 'center',
              },
            )
            .text(`${vatRate * 100}%`, tParams.c6x, pdfFileData.currY, {
              width: tParams.c7x - tParams.c6x,
              align: 'center',
            })
            .text(
              formatNumber(item.price * item.amount * vatRate, { decimals: 2 }),
              tParams.c7x,
              pdfFileData.currY,
              {
                width: tParams.c8x - tParams.c7x,
                align: 'center',
              },
            )
            .text(
              formatNumber(item.price * item.amount * (1 + vatRate), { decimals: 2 }),
              tParams.c8x,
              pdfFileData.currY,
              {
                width: tParams.c9x - tParams.c8x,
                align: 'center',
              },
            )
        }
        // must come last as this is the highest element
        pdfFile.text(item.description, tParams.c1x + 2, postHeadY, {
          width: tParams.c2x - tParams.c1x - 2,
        })

        pdfFile
          .lineWidth(1)
          .strokeOpacity(0.5)
          .strokeColor([96, 125, 139])
          .moveTo(tParams.c1x, pdfFile.y + 1)
          .lineTo(appPageOptions.pageWidth - appPageOptions.horizontalMargin, pdfFile.y + 1)
          .stroke()

        pdfFileData.prevY = pdfFileData.currY
        pdfFileData.currY = pdfFile.y + 5

        for (let ii = 1; ii < 10; ii++) {
          let tempX = tParams['c' + ii + 'x']

          pdfFile
            .lineWidth(1)
            .strokeOpacity(0.5)
            .strokeColor([96, 125, 139])
            .moveTo(tempX, pdfFileData.prevY - 5)
            .lineTo(tempX, pdfFileData.currY - 5)
            .stroke()
        }
      }
    } else throw Error('Cannot generate article positions for an overdue notice')

    pdfFileData.currY += 10
  }

  function createTableBottomText() {
    pdfFile.fontSize(10).font('Helvetica-Bold')
    newPageCheck(pdfFile, pdfFileData.currY, pdfFile.currentLineHeight() * 3.5, pdfFileData)

    pdfFile
      .lineWidth(1)
      .moveTo(appPageOptions.horizontalMargin, pdfFileData.currY - 3)
      .lineTo(appPageOptions.pageWidth - appPageOptions.horizontalMargin, pdfFileData.currY - 3)
      .strokeColor('black')
      .strokeOpacity(1)
      .stroke()

    pdfFile
      .text('Netto', appPageOptions.horizontalMargin, pdfFileData.currY + 5, {
        width: mmToPx(60),
        align: 'center',
      })
      .text('Umsatzsteuer', appPageOptions.horizontalMargin + mmToPx(60), pdfFileData.currY + 5, {
        width: mmToPx(60),
        align: 'center',
      })
      .text('Brutto', appPageOptions.horizontalMargin + mmToPx(120), pdfFileData.currY + 5, {
        width: mmToPx(60),
        align: 'center',
      })
      .moveDown()
    pdfFileData.prevY = pdfFileData.currY
    pdfFileData.currY = pdfFile.y

    if (documentData.kind === DocumentKind.offer || documentData.kind === DocumentKind.invoice) {
      let netSum = (
        documentData.document.items as (InvoiceDocumentItem | OfferDocumentItem)[]
      ).reduce((curr, item) => {
        if (item.price == null || item.amount == null) return curr
        else return (curr += round(item.price * item.amount, 2))
      }, 0)

      pdfFile
        .font('Helvetica')
        .text(
          formatNumber(netSum, { currency: true }),
          appPageOptions.horizontalMargin,
          pdfFileData.currY,
          {
            width: mmToPx(60),
            align: 'center',
          },
        )
        .text(
          formatNumber(netSum * vatRate, { currency: true }),
          appPageOptions.horizontalMargin + mmToPx(60),
          pdfFileData.currY,
          {
            width: mmToPx(60),
            align: 'center',
          },
        )
        .text(
          formatNumber(netSum * (1 + vatRate), { currency: true }),
          appPageOptions.horizontalMargin + mmToPx(120),
          pdfFileData.currY,
          { width: mmToPx(60), align: 'center' },
        )
    } else setReminderSumTable(pdfFile, documentData.document, pdfFileData)

    pdfFileData.currY = pdfFile.y

    pdfFile
      .lineWidth(1)
      .moveTo(appPageOptions.horizontalMargin, pdfFileData.currY + 3)
      .lineTo(appPageOptions.pageWidth - appPageOptions.horizontalMargin, pdfFileData.currY + 3)
      .strokeColor('black')
      .strokeOpacity(1)
      .stroke()

    pdfFile
      .lineWidth(1)
      .moveTo(
        appPageOptions.horizontalMargin,
        pdfFileData.prevY + (pdfFile.y - pdfFileData.prevY) / 2,
      )
      .lineTo(
        appPageOptions.pageWidth - appPageOptions.horizontalMargin,
        pdfFileData.prevY + (pdfFile.y - pdfFileData.prevY) / 2,
      )
      .stroke()

    pdfFile
      .lineWidth(1)
      .moveTo(appPageOptions.horizontalMargin, pdfFileData.prevY - 3)
      .lineTo(appPageOptions.horizontalMargin, pdfFileData.currY + 3)
      .stroke()

    pdfFile
      .lineWidth(1)
      .moveTo(appPageOptions.horizontalMargin + mmToPx(60), pdfFileData.prevY - 3)
      .lineTo(appPageOptions.horizontalMargin + mmToPx(60), pdfFileData.currY + 3)
      .stroke()

    pdfFile
      .lineWidth(1)
      .moveTo(appPageOptions.horizontalMargin + mmToPx(120), pdfFileData.prevY - 3)
      .lineTo(appPageOptions.horizontalMargin + mmToPx(120), pdfFileData.currY + 3)
      .stroke()

    pdfFile
      .lineWidth(1)
      .moveTo(appPageOptions.horizontalMargin + mmToPx(180), pdfFileData.prevY - 3)
      .lineTo(appPageOptions.horizontalMargin + mmToPx(180), pdfFileData.currY + 3)
      .stroke()

    if (documentData.kind === DocumentKind.offer) setOfferSubSumTableText(pdfFile, pdfFileData)
    else if (documentData.kind === DocumentKind.invoice)
      setInvoiceSubSumTableText(pdfFile, documentData.document, pdfFileData)
    else if (documentData.kind === DocumentKind.overdueNotice)
      setReminderSubSumTableText(pdfFile, pdfFileData)
  }

  createSubHeader()
  createTableTopText()
  if (documentData.kind === DocumentKind.invoice || documentData.kind === DocumentKind.offer)
    createQtInvTable()
  else if (documentData.kind === DocumentKind.overdueNotice)
    createRmdTable(pdfFile, documentData.document, pdfFileData)
  createTableBottomText()
  createHeaderAndFooter()

  pdfFile.flushPages()
}

/**
 * @param asBase64 return the PDF as a base64 string. Useful for emails
 */
export function renderMultiplePDF(documents: AnyDocument[], asBase64?: false): Promise<Buffer>
export function renderMultiplePDF(documents: AnyDocument[], asBase64?: true): Promise<string>
export function renderMultiplePDF(
  documents: AnyDocument[],
  asBase64: boolean = false,
): Promise<Buffer | string> {
  return new Promise((resolve, reject) => {
    try {
      // Create a document
      const pdfFile = new PDFDocument(pageOptions)

      let bufferArr: Array<Buffer> = []
      pdfFile.on('data', (chunk: Buffer) => {
        bufferArr.push(chunk)
      })

      pdfFile.on('end', () => {
        let tempBuffer = Buffer.concat(bufferArr)
        if (asBase64) resolve(tempBuffer.toString('base64'))
        else resolve(tempBuffer)
      })

      documents.forEach((item, index) => {
        if (index > 0) pdfFile.addPage(pageOptions)

        createDocument(pdfFile, item)

        // Finalize PDF file
        if (index === documents.length - 1) pdfFile.end()
      })
    } catch (err) {
      reject(err)
    }
  })
}
