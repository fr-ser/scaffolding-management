import { ArticleKind, OverdueNoticeLevel } from "@/global/types/appTypes";
import { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "@/global/types/entities";

export function getInvoiceDocument() {
  return {
    id: "document_id",
    creation_date: "1992-12-12",
    client_id: "client_id",
    client_email: "client@mail.com",
    client_company_name: "client_company_name",
    client_first_name: "client_first_name",
    client_last_name: "client_last_name",
    client_street_and_number: "client_street_and_number",
    client_postal_code: "client_postal_code",
    client_city: "client_city",
    order_title: "order_title",
    invoice_id: "invoice_id",
    invoice: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    items: [
      {
        id: "id1",
        kind: ArticleKind.heading,
        title: "title1",
        description: "description1",
      },
      {
        id: "id2",
        kind: ArticleKind.item,
        title: "title2",
        description: "description2",
        unit: "unit",
        price: 10,
        amount: 100,
      },
    ],
    service_dates: ["1993-12-12", "1994-12-13"],
    payment_target: "1995-12-12",
    can_have_cash_discount: false,
    discount_duration: 0,
    discount_percentage: 0,
  } as InvoiceDocument;
}

export function getOfferDocument() {
  return {
    id: "document_id",
    creation_date: "1992-12-12",
    client_id: "client_id",
    client_email: "client@mail.com",
    client_company_name: "client_company_name",
    client_first_name: "client_first_name",
    client_last_name: "client_last_name",
    client_street_and_number: "client_street_and_number",
    client_postal_code: "client_postal_code",
    client_city: "client_city",
    order_title: "order_title",
    offer_id: "offer_id",
    offer: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    items: [
      {
        id: "id1",
        kind: ArticleKind.heading,
        title: "title1",
        description: "description1",
      },
      {
        id: "id2",
        kind: ArticleKind.item,
        title: "title2",
        description: "description2",
        unit: "unit",
        price: 10,
        amount: 100,
      },
    ],
    offered_at: "1993-12-12",
    offer_valid_until: "1995-12-12",
  } as OfferDocument;
}

export function getOverdueNoticeDocument() {
  return {
    id: "document_id",
    creation_date: "1992-12-12",
    client_id: "client_id",
    client_email: "client@mail.com",
    client_company_name: "client_company_name",
    client_first_name: "client_first_name",
    client_last_name: "client_last_name",
    client_street_and_number: "client_street_and_number",
    client_postal_code: "client_postal_code",
    client_city: "client_city",
    order_title: "order_title",
    overdue_notice_id: "overdue_notice_id",
    overdue_notice: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    items: [],
    notice_level: OverdueNoticeLevel.first,
    notice_date: "1993-12-12",
    payments_until: "1994-12-12",
    payment_target: "1995-12-12",
    notice_costs: 55,
    default_interest: 2.5,
    invoice_documents: [getInvoiceDocument()],
  } as OverdueNoticeDocument;
}
