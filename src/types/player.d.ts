export interface Artist {
  id: number
  name: string
  tns?: string[]
  alias?: string[]
}

export interface Album {
  id: number
  name: string
  picUrl: string
  tns?: string[]
  pic_str?: string
  pic?: number
}

export interface Song {
  id: number
  name: string
  ar: Artist[]
  al: Album
  dt: number  // 歌曲时长（毫秒）
  url?: string
  fee: number
  v: number
  st: number
  mark?: number
  mv?: number
}

export interface PlayMode {
  type: 'sequence' | 'random' | 'loop'
  label: string
}