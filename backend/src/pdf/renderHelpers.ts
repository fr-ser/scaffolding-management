export const mmToPx = function (num: number) {
  // default dpi is 72
  return (72 / 25.4) * num
}

export const appPageOptions = {
  pageHeight: mmToPx(297),
  pageWidth: mmToPx(210),
  horizontalMargin: mmToPx(15),
  headerEnd: mmToPx(40),
  footerStart: mmToPx(270),
}

export interface PdfFileData {
  totalPages: number
  prevY: number
  currY: number
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
  layout: 'portrait', // can be 'landscape',
  bufferPages: true,
}

export function newPageCheck(
  doc: PDFKit.PDFDocument,
  start: number,
  addition: number,
  argPDocData: PdfFileData,
) {
  if (appPageOptions.footerStart < start + addition) {
    doc.addPage(pageOptions)
    argPDocData.totalPages++
    argPDocData.currY = appPageOptions.headerEnd
    return true
  } else return false
}
