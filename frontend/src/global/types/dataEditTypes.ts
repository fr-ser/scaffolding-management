import type { Article, Client, Invoice, Offer, OfferItem, Order } from "./entities";

export type ClientCreate = Omit<Client, "id" | "created_at" | "updated_at">;
export type ClientUpdate = Partial<Omit<Client, "id">>;

export type ArticleCreate = Omit<Article, "id" | "created_at" | "updated_at">;
export type ArticleUpdate = Partial<Omit<Article, "id">>;

export type OrderCreate = Omit<
  Order,
  "id" | "client" | "offer" | "overdue_notices" | "invoices" | "created_at" | "updated_at"
>;
export type OrderUpdate = Partial<OrderCreate>;

export type OfferItemCreate = Omit<OfferItem, "id" | "offer_id" | "offer">;

export type OfferCreate = Omit<
  Offer,
  "id" | "order" | "documents" | "created_at" | "updated_at" | "items"
> & {
  items: OfferItemCreate[];
};

export type InvoiceUpdate = Partial<Omit<Invoice, "id">>;
