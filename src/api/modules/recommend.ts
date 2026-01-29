import request from '@/api/request'
import type { Song } from '@/types/player'

export interface RecommendPlaylist {
  id: number
  name: string
  picUrl: string
  playcount?: number
  copywriter?: string
}

interface RecommendResourceRaw {
  code: number
  recommend: RecommendPlaylist[]
}

interface RecommendSongsRaw {
  code: number
  data: {
    dailySongs: Song[]
  }
}

type RecommendResponse<T> = Promise<{
  loading: import('vue').Ref<boolean>
  data: import('vue').Ref<T | null>
  errMsg: import('vue').Ref<string | null>
}>

export const RecommendAPI = {
  /**
   * 获取每日推荐歌单（需要登录）
   */
  getDailyPlaylists(): RecommendResponse<RecommendResourceRaw> {
    return request.get<RecommendResourceRaw>('/recommend/resource')
  },

  /**
   * 获取每日推荐歌曲（需要登录）
   */
  getDailySongs(): RecommendResponse<RecommendSongsRaw> {
    return request.get<RecommendSongsRaw>('/recommend/songs')
  },
}


