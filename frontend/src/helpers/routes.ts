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

export function getReportingPath() {
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

export function getOrderEditPath(orderId: string, kind?: DocumentKind, subOrderId?: number) {
  let path = `/orders/${orderId}/edit`;
  if (kind) {
    path += `?kind=${kind}`;
    if (subOrderId) {
      path += `&subOrderId=${subOrderId}`;
    }
  }
  return path;
}
