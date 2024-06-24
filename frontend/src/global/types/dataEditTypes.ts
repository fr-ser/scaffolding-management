import type { Article, Client, Invoice, Offer, Order } from "./entities";

export type ClientCreate = Omit<Client, "id">;
export type ClientUpdate = Partial<Omit<Client, "id">>;

export type ArticleCreate = Omit<Article, "id">;
export type ArticleUpdate = Partial<Omit<Article, "id">>;

export type OrderCreate = Omit<Order, "id" | "client" | "offer" | "overdue_notices" | "invoices">;
export type OrderUpdate = Partial<Omit<Order, "id" | "client">>;

export type OfferCreate = Omit<Offer, "id" | "order" | "documents">;

export type InvoiceUpdate = Partial<Omit<Invoice, "id">>;
