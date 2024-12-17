import type { Router, RouteLocationNormalized } from 'vue-router';
import { storage, STORAGE_KEY } from '@/utils/storage';

export function setupGuards(router: Router) {
  router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next) => {
    const cookie = storage.get(STORAGE_KEY.COOKIE);

    if (to.meta.requiresAuth && (!cookie || typeof cookie !== 'string') && to.path !== '/login') {
      next({ path: '/login', query: { redirect: encodeURIComponent(to.fullPath) } });
      return;
    }

    // 未来可拓展异步验证逻辑
    // if (cookie) {
    //   const isValid = await validateCookie(cookie);
    //   if (!isValid) {
    //     next({ path: '/login', query: { redirect: encodeURIComponent(to.fullPath) } });
    //     return;
    //   }
    // }

    next();
  });
}
