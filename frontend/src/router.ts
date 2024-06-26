import { createRouter, createWebHistory } from "vue-router";

import ArticleView from "@/views/ArticleView.vue";
import ClientView from "@/views/ClientView.vue";
import DocumentView from "@/views/DocumentView.vue";

export const ROUTES = {
  CLIENTS: { name: "clients", path: "/", label: "Kunden" },
  ORDER: { name: "order", path: "/order", label: "Aufträge" },
  ORDERS: { name: "orders", path: "/orders", label: "Übersicht" },
  DOCUMENTS: { name: "documents", path: "/documents", label: "Dokumente" },
  ARTICLES: { name: "articles", path: "/articles", label: "Artikel" },
};
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: ROUTES.CLIENTS.path,
      name: ROUTES.CLIENTS.name,
      component: ClientView,
    },
    {
      path: ROUTES.ORDER.path,
      name: ROUTES.ORDER.name,
      component: ClientView,
    },
    {
      path: ROUTES.ORDERS.path,
      name: ROUTES.ORDERS.name,
      component: ClientView,
    },
    {
      path: ROUTES.DOCUMENTS.path,
      name: ROUTES.DOCUMENTS.name,
      component: DocumentView,
    },
    {
      path: ROUTES.ARTICLES.path,
      name: ROUTES.ARTICLES.name,
      component: ArticleView,
    },
  ],
});

export default router;
