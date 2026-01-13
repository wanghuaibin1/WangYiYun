import type { RouteRecordRaw } from 'vue-router'
import PlayerLayout from '@/layouts/PlayerLayout.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: PlayerLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'play',
        name: 'play',
        component: () => import('@/views/play-page/index.vue'),
        meta: { requiresAuth: true },
      },
      // {
      //   path: 'playlist',
      //   name: 'playlist',
      //   component: () => import('@/views/playlist/index.vue'),
      //   meta: { requiresAuth: true },
      // },
      // {
      //   path: 'search',
      //   name: 'search',
      //   component: () => import('@/views/search/index.vue'),
      //   meta: { requiresAuth: true },
      // },
    ],
  },
  {
    path: '/:pathMatch(.*)',
    component: () => import('@/views/error/404.vue'),
  },
]
