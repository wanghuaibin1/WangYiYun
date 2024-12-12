import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './modules/router.ts'
import { setupGuards } from './modules/guards'

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 设置路由守卫
setupGuards(router)

export default router
