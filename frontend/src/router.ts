import { createRouter, createWebHistory } from "vue-router";

import { DocumentKind } from "@/global/types/appTypes";
import * as routes from "@/helpers/routes";
import ArticleView from "@/views/ArticleView.vue";
import ClientListView from "@/views/ClientListView.vue";
import ClientView from "@/views/ClientView.vue";
import DocumentListView from "@/views/DocumentListView.vue";
import DocumentView from "@/views/DocumentView.vue";
import OrderListView from "@/views/OrderListView.vue";
import OrderView from "@/views/OrderView.vue";
import ReportingView from "@/views/ReportingView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: routes.getClientListPath(),
    },
    {
      path: routes.getClientListPath(),
      component: ClientListView,
    },
    {
      path: routes.getClientEditPath(":id"),
      component: ClientView,
    },
    {
      path: routes.getClientCreatePath(),
      component: ClientView,
    },
    {
      path: routes.getOrderListPath(),
      component: OrderListView,
    },
    {
      path: routes.getReportingPath(),
      component: ReportingView,
    },
    {
      path: routes.getOrderEditPath(":id"),
      component: OrderView,
    },
    {
      path: routes.getOrderCreatePath(),
      component: OrderView,
    },
    {
      path: routes.getDocumentListPath(),
      component: DocumentListView,
    },
    {
      path: routes.getDocumentViewPath(":kind" as any as DocumentKind, ":id"),
      component: DocumentView,
    },
    {
      path: routes.getArticleListPath(),
      component: ArticleView,
    },
  ],
});

export default router;
