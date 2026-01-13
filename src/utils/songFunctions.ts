import { useUserStore } from '@/stores'

/**
 * 检查歌曲是否在收藏列表中
 * @param id - 歌曲 ID
 * @returns 如果歌曲在收藏列表中返回 true，否则返回 false
 */
export function upCollectState(id: number): boolean {
  const UserStore = useUserStore()
  if (!Array.isArray(UserStore.likeList) || UserStore.likeList.length === 0) {
    return false
  }
  // 使用 Set 来提高查找效率（每次调用都重新创建，确保数据是最新的）
  const likedSet = new Set(UserStore.likeList)
  return likedSet.has(id)
}
