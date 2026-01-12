import request from '@/api/request.ts'
import type { UserProfile } from '@/types/api'

export const UserAPI = {
  /**
   * 获取用户详情
   * @param  uid  用户id
   */
  getUserInfo(uid:number) {
    return request.get<UserProfile>('/user/detail', { uid })
  },
/**
   * 获取用户播放记录
   * @param  uid  用户id
    */
  getRecordSongsAPI(uid:number){
    return request.get('/user/record', { uid })
  },

  /**
   * 获取用户收藏的歌曲
   * @param uid
   */
  getLikeList(uid:number){
    return request.get('/likelist', { uid })
  }
}
