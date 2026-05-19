import { DocumentKind } from "./types/appTypes";

export const documentKindLabels: Record<DocumentKind, string> = {
  [DocumentKind.offer]: "Angebot",
  [DocumentKind.invoice]: "Rechnung",
  [DocumentKind.overdueNotice]: "Mahnung",
  [DocumentKind.creditNote]: "Gutschrift",
};
