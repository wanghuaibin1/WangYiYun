import { ref } from 'vue'
import { SongAPI } from '@/api'
import { formatLyr } from '@/utils/format'
import { useSongStore } from '@/stores/modules/song.ts'
import type { Song } from '@/types/player'

export function usePlayer() {
  const SongStore = useSongStore()

  /**
   * 设置当前播放的歌曲
   * @param currentIndex - 当前歌曲在播放列表中的索引
   */
  const currSong = (currentIndex: number): void => {
    try {
      if (SongStore.playList[currentIndex]) {
        SongStore.currentSong = SongStore.playList[currentIndex]
      }
    } catch (error) {
      console.error('当前歌曲不存在:', error)
    }
  }
  /**
   * 添加歌曲到播放列表，若歌曲已存在则更新当前播放索引
   * @param {number | string} id - 要获取详情的歌曲 ID
   * @returns {Promise<void>} - 异步函数，无返回值
   */
  const songDetail = async (id: number): Promise<void> => {
    try {
      const { data: resDetail } = await SongAPI.getSongDetail(id)
      if (!resDetail.value?.songs?.[0]) {
        console.warn('获取歌曲详情失败：歌曲数据为空')
        return
      }
      const song = resDetail.value.songs[0]
      // 查找当前歌曲是否已存在于播放列表中
      const existingIndex = SongStore.playList.findIndex(
        (item) => Number(item.id) === Number(song.id),
      )
      if (existingIndex === -1) {
        // 如果歌曲不存在，插入到播放列表的第 1 位，并设置当前索引为 1
        SongStore.playList.splice(1, 0, song)
        SongStore.currentIndex = 1
        console.log('歌曲已添加到播放列表', song)
      } else {
        // 如果歌曲存在，直接更新当前索引
        SongStore.currentIndex = existingIndex
        console.log('歌曲已存在于播放列表中，当前索引更新为:', existingIndex)
      }
    } catch (error) {
      console.error('获取歌曲详情失败:', error)
    }
  }

  /**
   * 播放指定歌曲的函数，通过歌曲 ID 获取歌曲 URL 和歌词数据
   * @param {number} id - 要播放的歌曲的唯一标识符 (ID)
   * @param currentIndex - 当前歌曲的索引
   * @returns {Promise<void>} - 异步函数，没有返回值
   */
  const player = async (id: number, currentIndex: number): Promise<void> => {
    try {
      console.log('正在播放歌曲:', id)
      currSong(currentIndex)
      const { data: resUrl } = await SongAPI.getSongUrl(id)
      if (!resUrl.value?.data?.[0]?.url) {
        console.warn('获取歌曲 URL 失败')
        return
      }
      SongStore.songUrl = resUrl.value.data[0].url

      const { data: resLyric } = await SongAPI.getLyric(id)
      const songDuration = SongStore.currentSong.dt || 0
      SongStore.lyric = formatLyr(resLyric.value, songDuration)

      if (SongStore.lyric.length > 0) {
        SongStore.currentTimeLyric = SongStore.lyric[0]
      } else {
        console.warn('暂无歌词数据')
      }
    } catch (error) {
      console.error('播放失败:', error)
    }
  }

  // 生成随机播放列表
  const getRandomPlayList = (): Song[] => {
    const shuffled = SongStore.playList.slice() // 创建播放列表的副本
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)) // 获取随机索引 j
      // 交换元素
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled // 返回打乱后的播放列表
  }

  return {
    player,
    songDetail,
    currSong,
    getRandomPlayList
  }
}
