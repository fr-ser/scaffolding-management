import { createRouter, createWebHistory } from 'vue-router'

import ClientView from '@/views/ClientView.vue'

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
