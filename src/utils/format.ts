import type { lyric } from '@/types/player'

// 重新导出类型，保持向后兼容
export type { lyric }

// 格式化歌曲总时长时间
export function formatTime(time: number): string {
  const minutes = Math.floor(time / 1000 / 60)
  const seconds = Math.floor((time / 1000) % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 格式化歌曲播放进度
export function formatProgress(currentTime: number): string {
  let m = parseInt(currentTime / 60)
  let s = parseInt(currentTime % 60)
  m = m >= 10 ? m : (m = '0' + m)
  s = s >= 10 ? s : (s = '0' + s)
  return `${m}:${s}`
}

// 格式化数字
export function formatNumber(num: number): string {
  if (num < 10000) return num
  return Math.floor(num / 10000) + '万'
}

// 格式化歌词
export function formatLyr(lrc: any, songDuration: number): lyric[] {
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
      time: songDuration / 1000,
      text: '',
      translate_intoChinese: '',
    })
  } else {
    // 将翻译拆分
    const translationLines = lrc.tlyric?.lyric?.split('\n') || []
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
      .filter(Boolean) as { time: number; text: string }[]
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
      .filter(Boolean) as { time: number; text: string }[]

    // 合并英文歌词和翻译
    parsedLyrics.forEach((lyric) => {
      if (lyric) {
        // 检查 lyric 是否为 null
        const translation = parsedTranslations.find((t) => t.time === lyric.time)
        lyricsArray.push({
          time: lyric.time,
          text: lyric.text,
          translate_intoChinese: translation ? translation.text : '',
        })
      }
    })
    lyricsArray.push({
      time: songDuration / 1000,
      text: '',
      translate_intoChinese: '',
    })
  }
  // 按时间排序
  lyricsArray.sort((a, b) => a.time - b.time)
  return lyricsArray
}

//获取最接近当前播放时间的歌词
export function getLyricByTime(currentTime: number, lyrics: lyric[]): lyric {
  if (!lyrics || lyrics.length === 0) {
    return { time: 0, text: '', translate_intoChinese: '' }
  }

  let left = 0
  let right = lyrics.length - 1
  let closestLyric: lyric = lyrics[0]

  // 使用二分查找找到最接近的歌词
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)

    // 判断是否是最后一条歌词
    if (mid === lyrics.length - 1) {
      closestLyric = lyrics[mid]
      break
    }

    // 判断当前歌词是否处于播放时间范围内
    if (currentTime >= lyrics[mid].time && currentTime < lyrics[mid + 1].time) {
      closestLyric = lyrics[mid]
      break
    }

    // 如果当前时间比 mid 的时间大，往右查找
    if (lyrics[mid].time <= currentTime) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  return closestLyric
}
