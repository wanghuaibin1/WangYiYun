import { useUserStore } from '@/stores'

let likedSet: Set<number> | null = null; // 用于缓存 Set

export function upCollectState(id: number): boolean {
  const UserStore = useUserStore();
  // 如果缓存为空，初始化 likedSet
  if (!likedSet && Array.isArray(UserStore.likeList)) {
    likedSet = new Set(UserStore.likeList); // 将数组转换为 Set
  }
  // 如果 likedSet 存在，则使用 .has() 方法判断
  return likedSet ? likedSet.has(id) : false;
}
