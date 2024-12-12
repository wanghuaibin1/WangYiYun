import type { Song } from './player'

export interface ApiResponse<T = any> {
  code: number
  message?: string
  data: T
}

// 登录相关
export interface LoginResponse {
  code: number
  cookie: string
  token: string
  profile?: UserProfile
}

export interface QRKeyResponse {
  code: number
  data: {
    unikey: string
  }
}

export interface QRImageResponse {
  code: number
  data: {
    qrimg: string
    qrurl: string
  }
}

export interface QRCheckResponse {
  code: number
  message?: string
  cookie?: string
}

// 用户相关
export interface UserProfile {
  userId: number
  nickname: string
  avatarUrl: string
  signature?: string
  // ... 其他字段
}

// 歌曲相关
export interface SongUrlResponse {
  code: number
  data: {
    id: number
    url: string
    br: number
    size: number
    type: string
  }[]
}

export interface LyricResponse {
  code: number
  lrc: {
    version: number
    lyric: string
  }
  tlyric?: {
    version: number
    lyric: string
  }
}