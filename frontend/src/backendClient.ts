import axios from "axios";

import { neverFunction } from "@/global/helpers";
import { DocumentKind } from "@/global/types/appTypes";
import type { PaginationResponse, SaveDocumentsAsPdfPayload } from "@/global/types/backendTypes";
import type {
  ArticleCreate,
  ArticleUpdate,
  ClientCreate,
  ClientUpdate,
  InvoiceUpdate,
  OfferCreate,
  OrderCreate,
  OrderUpdate,
} from "@/global/types/dataEditTypes";
import {
  type Article,
  type Client,
  type Invoice,
  type InvoiceDocument,
  type Offer,
  type OfferDocument,
  type Order,
  type OverdueNoticeDocument,
} from "@/global/types/entities";

function getUrlEntityForKind(kind: DocumentKind): string {
  if (kind === DocumentKind.invoice) {
    return "invoices";
  } else if (kind === DocumentKind.overdueNotice) {
    return "overdue_notices";
  } else if (kind === DocumentKind.offer) {
    return "offers";
  } else return neverFunction(kind);
}

const axiosInstance = axios.create({
  withCredentials: true,
});

export async function getArticles(): Promise<PaginationResponse<Article>> {
  const response = await axiosInstance.get(`/api/articles`);
  return response.data;
}
export async function updateArticle(id: string, article: ArticleUpdate): Promise<Article> {
  const response = await axiosInstance.patch(`/api/articles/${id}`, article);
  return response.data;
}
export async function createArticle(article: ArticleCreate): Promise<Article> {
  const response = await axiosInstance.post(`/api/articles/`, article);
  return response.data;
}
export async function deleteArticle(id: string): Promise<void> {
  await axiosInstance.delete(`/api/articles/${id}`);
}

export async function getClients(query?: string): Promise<PaginationResponse<Client>> {
  const response = await axiosInstance.get(`/api/clients${query ? `?search=${query}` : ''}`);
  return response.data;
}

export async function getClient(id: string): Promise<Client> {
  const response = await axiosInstance.get(`/api/clients/${id}`);
  return response.data;
}

export async function deleteClient(id: string): Promise<void> {
  await axiosInstance.delete(`/api/clients/${id}`);
}

export async function createClient(client: ClientCreate): Promise<Client> {
  const response = await axiosInstance.post(`/api/clients`, client);
  return response.data;
}

export async function updateClient(id: string, client: ClientUpdate): Promise<Client> {
  const response = await axiosInstance.patch(`/api/clients/${id}`, client);
  return response.data;
}

export async function getOrders(options: { clientId?: string } = {}): Promise<Order[]> {
  const params: any = {};
  if (options.clientId) {
    params.client_id = options.clientId;
  }
  const response = await axiosInstance.get(`/api/orders`, { params });
  return response.data;
}
export async function getOrder(id: string): Promise<Order> {
  const response = await axiosInstance.get(`/api/orders/${id}`);
  return response.data;
}
export async function deleteOrder(id: string) {
  const response = await axiosInstance.delete(`/api/orders/${id}`);
  return response.data;
}
export async function createOrder(order: OrderCreate): Promise<Order> {
  const response = await axiosInstance.post(`/api/orders/`, order);
  return response.data;
}
export async function updateOrder(id: string, order: OrderUpdate): Promise<Order> {
  const response = await axiosInstance.patch(`/api/orders/${id}`, order);
  return response.data;
}

export async function createOffer(offer: OfferCreate): Promise<Offer> {
  const response = await axiosInstance.post(`/api/orders/offers/`, offer);
  return response.data;
}

export async function updateInvoice(id: number, invoice: InvoiceUpdate): Promise<Invoice> {
  const response = await axiosInstance.patch(`/api/orders/invoices/${id}`, invoice);
  return response.data;
}

export async function getDocuments(): Promise<
  (OfferDocument | OverdueNoticeDocument | InvoiceDocument)[]
> {
  const response = await axiosInstance.get(`/api/documents`);
  return response.data;
}
export async function getInvoiceDocument(id: string): Promise<InvoiceDocument> {
  const response = await axiosInstance.get(`/api/documents/invoices/${id}`);
  return response.data;
}
export async function getOfferDocument(id: string): Promise<OfferDocument> {
  const response = await axiosInstance.get(`/api/documents/offers/${id}`);
  return response.data;
}
export async function getOverdueNoticeDocument(id: string): Promise<OverdueNoticeDocument> {
  const response = await axiosInstance.get(`/api/documents/overdue_notices/${id}`);
  return response.data;
}

export async function createDocumentBySubOrder(
  id: number,
  kind: DocumentKind,
): Promise<OverdueNoticeDocument | InvoiceDocument | OfferDocument> {
  const response = await axiosInstance.post(
    `/api/orders/${getUrlEntityForKind(kind)}/${id}/documents/create`,
  );
  return response.data;
}

export async function getDocumentsBySubOrder(
  subOrderId: number,
  kind: DocumentKind,
): Promise<Array<OverdueNoticeDocument | InvoiceDocument | OfferDocument>> {
  const response = await axiosInstance.get(
    `/api/orders/${getUrlEntityForKind(kind)}/${subOrderId}/documents`,
  );
  return response.data;
}
export async function deleteSubOrder(subOrderId: number, kind: DocumentKind): Promise<void> {
  await axiosInstance.delete(`/api/orders/${getUrlEntityForKind(kind)}/${subOrderId}`);
}

export async function deleteDocument(id: string, kind: DocumentKind): Promise<void> {
  await axiosInstance.delete(`/api/documents/${getUrlEntityForKind(kind)}/${id}`);
}

export async function getDocumentPdf(payload: SaveDocumentsAsPdfPayload): Promise<Blob> {
  const response = await axiosInstance.post(`/api/documents/pdf-download`, payload, {
    responseType: "blob",
  });
  return response.data;
}
