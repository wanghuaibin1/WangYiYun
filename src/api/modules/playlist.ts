import request from '@/api/request.ts'
import type { ApiResponse } from '@/types/api'
import type { Song } from '@/types/player'

/**
 * 歌单详情接口返回的数据结构
 */
export interface PlaylistDetail {
  id: number
  name: string
  coverImgUrl: string
  description?: string
  playCount: number
  trackCount: number
  creator: {
    userId: number
    nickname: string
    avatarUrl?: string
  }
  trackIds: Array<{ id: number }>
  tracks?: Song[]
  tags?: string[]
  createTime?: number
  updateTime?: number
}

/**
 * 歌单所有歌曲接口返回的数据结构
 */
export interface PlaylistTrack {
  id: number
  name: string
  ar: Array<{ id: number; name: string }>
  al: {
    id: number
    name: string
    picUrl: string
  }
  dt: number
  fee: number
  v: number
  st: number
}

export const PlaylistAPI = {
  /**
   * 获取歌单详情
   * @param id - 歌单 id
   * @param s - 歌单最近的 s 个收藏者，默认为 8
   * @returns 返回歌单详情
   */
  getPlaylistDetail(id: number | string, s?: number) {
    return request.get<ApiResponse<{ playlist: PlaylistDetail }>>('/playlist/detail', {
      id,
      s,
    })
  },

  /**
   * 获取歌单所有歌曲
   * @param id - 歌单 id
   * @param limit - 限制获取歌曲的数量，默认值为当前歌单的歌曲数量
   * @param offset - 默认值为0
   * @returns 返回歌单所有歌曲
   */
  getPlaylistTracks(id: number | string, limit?: number, offset?: number) {
    return request.get<ApiResponse<{ songs: PlaylistTrack[] }>>('/playlist/track/all', {
      id,
      limit,
      offset,
    })
  },
}


