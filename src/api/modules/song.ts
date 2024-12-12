import request from '@/utils/request'
import { API } from '@/constants/api'
import type { ApiResponse, SongUrlResponse, LyricResponse } from '@/types/api'
import type { Song } from '@/types/player'

export const song = {
  // 获取歌曲详情
  getDetail(ids: number[]) {
    return request.get<ApiResponse<{ songs: Song[] }>>(API.SONG.DETAIL, {
      params: { ids: ids.join(',') }
    })
  },

  // 获取歌曲 URL
  getUrl(id: number) {
    return request.get<SongUrlResponse>(API.SONG.URL, {
      params: { id }
    })
  },

  // 获取歌词
  getLyric(id: number) {
    return request.get<LyricResponse>(API.SONG.LYRIC, {
      params: { id }
    })
  }
}