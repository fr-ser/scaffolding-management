import { createRouter, createWebHistory } from 'vue-router'

import ClientView from '@/views/ClientView.vue'

export const ROUTES = {
  CLIENTS: { name: 'clients', path: '/clients', label: 'Kunden' },
  ORDER: { name: 'order', path: '/order', label: 'Aufträge' },
  ORDERS: { name: 'orders', path: '/orders', label: 'Übersicht' },
  DOCUMENTS: { name: 'documents', path: '/documents', label: 'Dokumente' },
  ARTICLES: { name: 'articles', path: '/articles', label: 'Artikel' },
}
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'clients',
      component: ClientView,
    },
    {
      path: '/articles',
      name: 'articles',
      // route level code-splitting
      // this generates a separate chunk ([name].[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/ArticleView.vue'),
    },
  ],
})

export default router
