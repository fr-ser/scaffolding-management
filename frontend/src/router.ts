import { createRouter, createWebHistory } from "vue-router";

import ArticleView from "@/views/ArticleView.vue";
import ClientListView from "@/views/ClientListView.vue";
import ClientView from "@/views/ClientView.vue";
import DocumentListView from "@/views/DocumentListView.vue";
import DocumentPdfView from "@/views/DocumentView.vue";
import InvoiceView from "@/views/InvoiceView.vue";
import OfferView from "@/views/OfferView.vue";
import OrderListView from "@/views/OrderListView.vue";
import OrderView from "@/views/OrderView.vue";
import OverdueView from "@/views/OverdueNoticeView.vue";
import OverviewView from "@/views/OverviewView.vue";

export const ROUTES = {
  CLIENT: { name: "client", path: "/client", label: "Kunden" },
  ORDER: { name: "order", path: "/order", label: "Aufträge" },
  DOCUMENTS: { name: "documents", path: "/documents", label: "Dokumente" },
  OVERVIEW: { name: "overviews", path: "/overviews", label: "Übersicht" },
  ARTICLES: { name: "articles", path: "/articles", label: "Artikel" },
};
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: ROUTES.CLIENT.path,
    },
    {
      path: ROUTES.CLIENT.path,
      name: `${ROUTES.CLIENT.name}-list`,
      component: ClientListView,
      meta: {
        label: "Kunden",
      },
    },
    {
      path: `${ROUTES.CLIENT.path}/:id/edit`,
      name: ROUTES.CLIENT.name,
      component: ClientView,
      meta: {
        label: "Kunden anschauen/bearbeiten",
      },
    },
    {
      path: `${ROUTES.CLIENT.path}/new`,
      name: `${ROUTES.CLIENT.name}-new`,
      component: ClientView,
      meta: {
        label: "Neuen Kunden erstellen",
      },
    },
    {
      path: ROUTES.ORDER.path,
      name: `${ROUTES.ORDER.name}-list`,
      component: OrderListView,
      meta: {
        label: "Aufträge",
      },
    },
    {
      path: ROUTES.OVERVIEW.path,
      name: ROUTES.OVERVIEW.name,
      component: OverviewView,
      meta: {
        label: "Übersicht",
      },
    },
    {
      path: `${ROUTES.ORDER.path}/:id/edit`,
      name: ROUTES.ORDER.name,
      component: OrderView,
      meta: {
        label: "Auftrag anschauen/bearbeiten",
      },
    },
    {
      path: `${ROUTES.ORDER.path}/:order_id/edit/offer/new`,
      name: `${ROUTES.ORDER.name}-newOffer`,
      component: OfferView,
      meta: {
        label: "Unteraufträge anschauen/bearbeiten",
      },
    },
    {
      path: `${ROUTES.ORDER.path}/:order_id/edit/invoice/new`,
      name: `${ROUTES.ORDER.name}-newInvoice`,
      component: InvoiceView,
      meta: {
        label: "Rechnung anschauen/bearbeiten",
      },
    },
    {
      path: `${ROUTES.ORDER.path}/:order_id/edit/overdue/new`,
      name: `${ROUTES.ORDER.name}-newOverdue`,
      component: OverdueView,
      meta: {
        label: "Mahnung anschauen/bearbeiten",
      },
    },
    {
      path: `${ROUTES.ORDER.path}/new`,
      name: `${ROUTES.ORDER.name}-new`,
      component: OrderView,
      meta: {
        label: "Neuen Auftrag erstellen",
      },
    },
    {
      path: ROUTES.DOCUMENTS.path,
      name: `${ROUTES.DOCUMENTS.name}-list`,
      component: DocumentListView,
      meta: {
        label: "Dokumente",
      },
    },
    {
      path: `${ROUTES.DOCUMENTS.path}/:id/pdf`,
      name: ROUTES.DOCUMENTS.name,
      component: DocumentPdfView,
      meta: {
        label: "Dokumente Pdf",
      },
    },
    {
      path: ROUTES.ARTICLES.path,
      name: ROUTES.ARTICLES.name,
      component: ArticleView,
      meta: {
        label: "Artikel",
      },
    },
  ],
});

export default router;
