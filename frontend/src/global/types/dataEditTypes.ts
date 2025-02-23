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

export type OfferItemCreate = Omit<OfferItem, "offer_id" | "offer" | "id">;

export type OfferCreate = Omit<
  Offer,
  "id" | "order" | "documents" | "created_at" | "updated_at" | "items" | "sub_id"
> & {
  items: OfferItemCreate[];
};

export type InvoiceItemCreate = Omit<InvoiceItem, "invoice_id" | "invoice" | "id">;

export type InvoiceCreate = Omit<
  Invoice,
  "id" | "order" | "documents" | "created_at" | "updated_at" | "items" | "sub_id"
> & {
  items: InvoiceItemCreate[];
};
export type InvoiceUpdate = Partial<Omit<Invoice, "id" | "items">> & {
  items?: InvoiceItemCreate[];
};

export type OfferUpdate = Partial<Omit<Offer, "id" | "items">> & {
  items?: OfferItemCreate[];
};

export type OverdueNoticeCreate = Omit<
  OverdueNotice,
  "id" | "order" | "invoice_documents" | "created_at" | "updated_at"
> & {
  invoice_documents: string[];
};

export type OverdueNoticeUpdate = Partial<Omit<OverdueNotice, "id" | "invoice_documents">> & {
  invoice_documents?: string[];
};
