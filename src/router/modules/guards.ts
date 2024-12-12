import type { Router, RouteLocationNormalized } from 'vue-router';
import { storage, STORAGE_KEY } from '@/utils/storage';

export function setupGuards(router: Router) {
  router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next) => {
    const cookie = storage.get(STORAGE_KEY.COOKIE);

    if (to.meta.requiresAuth && !cookie) {
      next({ path: '/login', query: { redirect: to.fullPath } });
    } else {
      next();
    }
  });
}
