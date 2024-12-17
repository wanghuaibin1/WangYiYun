import request from '@/api/request.ts'
import type { UserProfile } from '@/types/api'

export const UserAPI = {
  /**
   * 获取用户详情
   * @param  uid  用户id
   */
  getUserInfo(uid:number) {
    return request.get<UserProfile>('/user/detail', { uid })
  }

}
