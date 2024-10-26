import type { DocumentKind } from "@/global/types/appTypes";

export function getClientListPath() {
  return "/clients";
}

export function getClientEditPath(clientId: string) {
  return `/clients/${clientId}/edit`;
}

export function getClientCreatePath() {
  return "/clients-create";
}

export function getOverviewPath() {
  return "/overview";
}

export function getDocumentListPath() {
  return "/documents";
}

export function getDocumentViewPath(kind: DocumentKind, documentId: string) {
  return `/documents/${kind}/${documentId}`;
}

export function getArticleListPath() {
  return "/articles";
}

export function getOrderListPath() {
  return "/orders";
}

export function getOrderCreatePath() {
  return "/orders-create";
}

export function getOrderEditPath(orderId: string) {
  return `/orders/${orderId}/edit`;
}

export function getOrderSubOrderEditPath(orderId: string, kind: DocumentKind, subOrderId: number) {
  return `/orders/${orderId}/${kind}/${subOrderId}/edit`;
}

export function getOrderSubOrderCreatePath(orderId: string, kind: DocumentKind) {
  return `/orders/${orderId}/${kind}-create`;
}
