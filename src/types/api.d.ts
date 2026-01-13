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
  unikey: string
}

export interface QRImageResponse {
  qrimg: string
  qrurl: string
}

// 二维码状态码
export enum QRCodeStatus {
  Expired = 800,    // 二维码已过期
  Waiting = 801,    // 等待扫码
  Confirming = 802, // 待确认
  Success = 803     // 授权登录成功
}

export interface QRCheckResponse {
  code: QRCodeStatus
  message?: string
  cookie?: string
  nickname?: string
  avatarUrl?: string
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
  pureMusic?: boolean // 是否为纯音乐
}