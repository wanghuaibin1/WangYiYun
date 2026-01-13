import request from '@/api/request.ts'
import type { UserProfile, ApiResponse } from '@/types/api'

export const UserAPI = {
  /**
   * 获取用户详情
   * @param uid - 用户 ID
   * @returns 返回用户详情信息
   */
  getUserInfo(uid: number) {
    return request.get<ApiResponse<UserProfile>>('/user/detail', { uid })
  },

  /**
   * 获取用户播放记录
   * @param uid - 用户 ID
   * @returns 返回用户播放记录
   */
  getRecordSongsAPI(uid: number) {
    return request.get<ApiResponse<any>>('/user/record', { uid })
  },

  /**
   * 获取用户收藏的歌曲
   * @param uid - 用户 ID
   * @returns 返回用户收藏的歌曲列表（包含 ids 数组）
   */
  getLikeList(uid: number) {
    return request.get<ApiResponse<{ ids: number[] }>>('/likelist', { uid })
  },
}
