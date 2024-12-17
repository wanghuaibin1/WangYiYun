import { useSongStore } from '@/stores/modules/song.ts'

interface lyric {
  time: number
  text: string
  translate_intoChinese: string
}

// 格式化时间
export function formatTime(time: number):string {
  const minutes = Math.floor(time / 1000 / 60)
  const seconds = Math.floor((time / 1000) % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 格式化数字
export function formatNumber(num: number): string{
  if (num < 10000) return num
  return Math.floor(num / 10000) + '万'
}

// 格式化歌词
export function formatLyr(lrc: string): lyric[] {
  const SongStore = useSongStore()

  //  保存解析后的歌词对象
  const lyricsArray: lyric[] = []
  const lines: string = lrc.lrc.lyric.split('\n')
  const timeRegex = /\[(\d+):(\d+\.\d+)]/ // 匹配时间戳的正则
  //验证音乐是否为纯音乐
  if (lrc.pureMusic) {
    lines.forEach((line: string): void => {
      line = line.trim() // 去掉首尾空格
      const matches = line.match(timeRegex) // 匹配时间戳
      if (matches) {
        const minutes = parseInt(matches[1], 10) // 提取分钟部分
        const seconds = parseFloat(matches[2])
        const timeInSeconds = minutes * 60 + seconds
        const content = line.replace(/\[.*?\]/g, '').trim() // 去除所有时间戳得到歌词内容
        // 检查歌词内容是否为空
        if (content) {
          lyricsArray.push({
            time: Number(timeInSeconds.toFixed(2)),
            text: content,
            translate_intoChinese: '',
          })
        }
      }
    })
    lyricsArray.push({
      time: SongStore.playList[SongStore.currentIndex].dt / 1000,
      text: '',
      translate_intoChinese: '',
    })
  } else {
    // 将翻译拆分
    const translationLines = lrc.tlyric.lyric.split('\n')
    // if (translationLines.length > 1) {
    //   console.log('有翻译歌词')
    //   this.pureMusic = true
    // } else {
    //   this.pureMusic = false
    // }
    // 解析英文歌词
    const parsedLyrics = lines
      .map((line: string): { time: number; text: string } | null => {
        const matches = line.match(timeRegex)
        line = line.trim() // 去掉首尾空格
        if (matches) {
          const minutes = parseInt(matches[1], 10) // 提取分钟部分
          const seconds = parseFloat(matches[2])
          const timeInSeconds = minutes * 60 + seconds
          const content = line.replace(/\[.*?\]/g, '').trim() // 去除所有时间戳得到歌词内容
          // 检查歌词内容是否为空
          if (content) {
            return { time: Number(timeInSeconds.toFixed(2)), text: content }
          }
        }
        return null
      })
      .filter(Boolean)
    // 解析翻译歌词
    const parsedTranslations = translationLines
      .map((line: string): { time: number; text: string } | null => {
        const matches = line.match(timeRegex)
        line = line.trim() // 去掉首尾空格
        if (matches) {
          const minutes = parseInt(matches[1], 10) // 提取分钟部分
          const seconds = parseFloat(matches[2])
          const timeInSeconds = minutes * 60 + seconds
          const content = line.replace(/\[.*?/g, '').trim() // 去除所有时间戳得到歌词内容
          // 检查歌词内容是否为空
          if (content) {
            return { time: Number(timeInSeconds.toFixed(2)), text: content }
          }
        }
        return null
      })
      .filter(Boolean)

    // 定义接口类型
    interface Lyric {
      time: number // 时间戳
      text: string // 歌词内容
    }

    // 合并英文歌词和翻译
    parsedLyrics.forEach((lyric: Lyric) => {
      if (lyric) {
        // 检查 lyric 是否为 null
        const translation = parsedTranslations.find((t: Lyric): boolean => t.time === lyric.time)
        lyricsArray.push({
          time: lyric.time,
          text: lyric.text,
          translate_intoChinese: translation ? translation.text : '',
        })
      }
    })
    lyricsArray.push({
      time: SongStore.playList[SongStore.currentIndex].dt / 1000,
      text: '',
      translate_intoChinese: '',
    })
  }
  // 按时间排序
  lyricsArray.sort((a, b) => a.time - b.time)
  return lyricsArray
}
