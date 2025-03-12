import axios from "axios";

import { neverFunction } from "@/global/helpers";
import { DocumentKind } from "@/global/types/appTypes";
import type {
  DropboxFile,
  PaginationResponse,
  SaveDocumentsAsPdfPayload,
  SendDocumentsAsEMail,
} from "@/global/types/backendTypes";
import type {
  ArticleCreate,
  ArticleUpdate,
  ClientCreate,
  ClientUpdate,
  InvoiceCreate,
  InvoiceUpdate,
  OfferCreate,
  OfferUpdate,
  OrderCreate,
  OrderUpdate,
  OverdueNoticeCreate,
  OverdueNoticeUpdate,
} from "@/global/types/dataEditTypes";
import {
  type Article,
  type Client,
  type Invoice,
  type InvoiceDocument,
  type Offer,
  type OfferDocument,
  type Order,
  type OverdueNotice,
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

export async function getArticles(
  parameters = {} as { search?: string; take?: number },
): Promise<PaginationResponse<Article>> {
  const response = await axiosInstance.get("/api/articles", { params: parameters });
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

export async function getClients(
  parameters = {} as { search?: string; take?: number },
): Promise<PaginationResponse<Client>> {
  const response = await axiosInstance.get("/api/clients", { params: parameters });
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

export async function getOrders(
  parameters = {} as { search?: string; take?: number; detailed?: true; overdue?: true },
): Promise<PaginationResponse<Order>> {
  const response = await axiosInstance.get(`/api/orders`, { params: parameters });
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

export async function updateOffer(id: number, offer: OfferUpdate): Promise<Offer> {
  const response = await axiosInstance.patch(`/api/orders/offers/${id}`, offer);
  return response.data;
}

export async function createInvoice(invoice: InvoiceCreate): Promise<Invoice> {
  const response = await axiosInstance.post(`/api/orders/invoices/`, invoice);
  return response.data;
}

export async function updateInvoice(id: number, invoice: InvoiceUpdate): Promise<Invoice> {
  const response = await axiosInstance.patch(`/api/orders/invoices/${id}`, invoice);
  return response.data;
}

export async function createOverdueNotice(
  overdue_notice: OverdueNoticeCreate,
): Promise<OverdueNotice> {
  const response = await axiosInstance.post(`/api/orders/overdue_notices/`, overdue_notice);
  return response.data;
}

export async function updateOverdueNotice(
  id: number,
  overdueNotice: OverdueNoticeUpdate,
): Promise<OverdueNotice> {
  const response = await axiosInstance.patch(`/api/orders/overdue_notices/${id}`, overdueNotice);
  return response.data;
}

export async function getDocuments(
  parameters = {} as { search?: string; take?: number },
): Promise<PaginationResponse<OfferDocument | OverdueNoticeDocument | InvoiceDocument>> {
  const response = await axiosInstance.get(`/api/documents`, { params: parameters });
  return response.data;
}

export async function getDocumentsByOrder(
  id: string,
): Promise<(OfferDocument | OverdueNoticeDocument | InvoiceDocument)[]> {
  const response = await axiosInstance.get(`/api/orders/${id}/documents`);
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
    `/api/orders/${getUrlEntityForKind(kind)}/${id}/documents`,
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

export async function sendDocumentAsEmail(payload: SendDocumentsAsEMail) {
  await axiosInstance.post(`/api/documents/send-email`, payload);
}

export async function getOrderAttachments(id: string) {
  const response = await axiosInstance.get(`/api/orders/${id}/attachments`);
  return response.data as DropboxFile[];
}

export async function deleteOrderAttachment(orderId: string, fileName: string) {
  await axiosInstance.delete(`/api/orders/${orderId}/attachments/${encodeURIComponent(fileName)}`);
}
