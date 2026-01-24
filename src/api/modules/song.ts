import request from '@/api/request.ts'
import type { ApiResponse, SongUrlResponse, LyricResponse } from '@/types/api'
import type { Song } from '@/types/player'

export const SongAPI = {
  /**
   * 获取歌曲详情，调用此接口，传入音乐 id（支持多个 id，使用逗号隔开）
   * @param {number|string} ids - 歌曲的唯一标识符，支持传入多个 id，多个 id 使用逗号分隔
   * @returns {Promise<ApiResponse<{ songs: Song[] }>>} 返回包含歌曲详情的响应对象，其中 `songs` 是一个歌曲数组
   */
  getSongDetail(ids: number | string) {
    return request.get<ApiResponse<{ songs: Song[] }>>('/song/detail', {
       ids ,
    })
  },

  /**
   * 获取歌曲 URL，调用此接口，传入音乐 id
   * @param {number|string} id - 歌曲的唯一标识符，必传参数,( 可多个 , 用逗号隔开 ), 可以获取对应的音乐的 url,未登录状态或者非会员返回试听片段(返回字段包含被截取的正常歌曲的开始时间和结束时间)
   * @param {number} [br=999000] - 音质码率，默认值为 999000（即最大码率），可选参数，若要 320k 可以设置为 320000，其他码率类推
   * @returns {Promise<SongUrlResponse>} 返回歌曲的 URL 地址
   */
  getSongUrl(id: number | string, br?: number) {
    return request.get<SongUrlResponse>('/song/url/v1', {
      id,
      level:'exhigh',
      br,
    })
  },

  /**
   * 获取歌曲的歌词，调用此接口，传入歌曲 id
   * @param {number} id - 歌曲的唯一标识符，必传参数
   * @returns {Promise<LyricResponse>} 返回包含歌词内容的响应对象
   */
  getLyric(id: number) {
    return request.get<LyricResponse>('/lyric', {
      id,
    })
  },
}
