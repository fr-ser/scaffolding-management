import type {
  Article,
  Client,
  Invoice,
  InvoiceItem,
  Offer,
  OfferItem,
  Order,
  OverdueNotice,
} from "./entities";

export type ClientCreate = Omit<Client, "id" | "created_at" | "updated_at">;
export type ClientUpdate = Partial<Omit<Client, "id">>;

export type ArticleCreate = Omit<Article, "id" | "created_at" | "updated_at">;
export type ArticleUpdate = Partial<Omit<Article, "id">>;

export type OrderCreate = Omit<
  Order,
  "id" | "client" | "offer" | "overdue_notices" | "invoices" | "created_at" | "updated_at"
>;
export type OrderUpdate = Partial<OrderCreate>;

export type OfferItemCreate = Omit<OfferItem, "offer_id" | "offer">;

export type OfferCreate = Omit<
  Offer,
  "id" | "order" | "documents" | "created_at" | "updated_at" | "items"
> & {
  items: OfferItemCreate[];
};

export type InvoiceItemCreate = Omit<InvoiceItem, "invoice_id" | "invoice">;

export type InvoiceCreate = Omit<
  Invoice,
  "id" | "order" | "documents" | "created_at" | "updated_at" | "items"
> & {
  items: InvoiceItemCreate[];
};
export type InvoiceUpdate = Partial<Omit<Invoice, "id">>;

export type OfferUpdate = Partial<Omit<Offer, "id">>;

export type OverdueNoticeCreate = Omit<
  OverdueNotice,
  "id" | "order" | "invoice_documents" | "created_at" | "updated_at"
>;

export type OverdueNoticeUpdate = Partial<Omit<OverdueNotice, "id">>;
