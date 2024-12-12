import request from '@/utils/request'
import { API } from '@/constants/api'
import type { ApiResponse, UserProfile } from '@/types/api'

export const user = {
  // 获取用户详情
  getDetail(uid: number) {
    return request.get<ApiResponse<UserProfile>>(API.USER.DETAIL, {
      params: { uid }
    })
  },

  // 获取用户歌单
  getPlaylists(uid: number) {
    return request.get<ApiResponse>(API.USER.PLAYLIST, {
      params: { uid }
    })
  }
}