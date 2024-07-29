import { createRouter, createWebHistory } from "vue-router";

import ArticleView from "@/views/ArticleView.vue";
import ClientListView from "@/views/ClientListView.vue";
import ClientView from "@/views/ClientView.vue";
import DocumentView from "@/views/DocumentView.vue";
import OrderListView from "@/views/OrderListView.vue";
import OrderView from "@/views/OrderView.vue";

export const ROUTES = {
  CLIENT: { name: "client", path: "/client", label: "Kunden" },
  ORDER: { name: "order", path: "/order", label: "Aufträge" },
  DOCUMENTS: { name: "documents", path: "/documents", label: "Dokumente" },
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
        label: 'Clients'
      }
    },
    {
      path: `${ROUTES.CLIENT.path}/:id/edit`,
      name: ROUTES.CLIENT.name,
      component: ClientView,
      meta: {
        label: 'View/Edit Client'
      }
    },
    {
      path: `${ROUTES.CLIENT.path}/new`,
      name: `${ROUTES.CLIENT.name}-new`,
      component: ClientView,
    },
    {
      path: ROUTES.ORDER.path,
      name: `${ROUTES.ORDER.name}-list`,
      component: OrderListView,
    },
    {
      path: `${ROUTES.ORDER.path}/:id/edit`,
      name: ROUTES.ORDER.name,
      component: OrderView,
    },
    {
      path: `${ROUTES.ORDER.path}/new`,
      name: `${ROUTES.ORDER.name}-new`,
      component: OrderView,
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
