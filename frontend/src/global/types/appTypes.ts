export enum ArticleKind {
  item = "Artikel",
  heading = "Hinweis",
}

export enum OverdueNoticeLevel {
  first = "1. Mahnung",
  last = "Letzte Mahnung",
}
export enum PaymentStatus {
  initial = "-",
  open = "Ausstehend",
  paid = "Bezahlt",
  reminded = "Gemahnt",
}

export enum OfferStatus {
  initial = "-",
  created = "Ausgestellt",
  confirmed = "Bestätigt",
  rejected = "Abgelehnt",
}

export enum OrderStatus {
  offer = "Angebot",
  preparation = "Vorbereitung",
  finished = "Fertig",
  deconstructed = "Abgebaut",
  blocked = "Gesperrt",
}

export enum OverdueNoticePaymentStatus {
  initial = "-",
  open = "Ausstehend",
  paid = "Bezahlt",
  partiallyPaid = "Teilweise bezahlt",
}

export enum DocumentKind {
  offer = "Angebot",
  invoice = "Rechnung",
  overdueNotice = "Mahnung",
}

export enum ClientSalutation {
  empty = "",
  mister = "Herr",
  misses = "Frau",
  misses_doctor = "Frau Dr.",
  mister_doctor = "Herr Dr.",
}

export enum SubItemKind {
  offer = "OFFER",
  invoice = "INVOICE",
  overdueNotice = "OVERDUE",
}
