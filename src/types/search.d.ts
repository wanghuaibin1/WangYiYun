import type { Song, Artist, Album as BaseAlbum } from './player'

export interface SearchDefaultKeyword {
  realkeyword: string
  showKeyword: string
}

export interface SearchHotItem {
  first: string
  iconType?: number
  second?: number
}

export interface SearchHotDetailItem {
  searchWord: string
  score: number
  content: string
  source?: number
  iconUrl?: string
}

export interface SearchPlaylist {
  id: number
  name: string
  coverImgUrl: string
  trackCount: number
  playCount: number
  creator?: {
    nickname: string
    userId: number
  }
}

export interface SearchUser {
  userId: number
  nickname: string
  avatarUrl: string
  signature?: string
  followeds?: number
  follows?: number
}

export interface SearchSuggestResult {
  allMatch?: { keyword: string }[]
  songs?: Song[]
  artists?: Artist[]
  albums?: SearchAlbum[]
  playlists?: SearchPlaylist[]
  order?: string[]
}

export interface SearchAlbum extends BaseAlbum {
  artists?: Artist[]
}

export interface SearchResult {
  songs?: Song[]
  songCount?: number
  albums?: SearchAlbum[]
  albumCount?: number
  artists?: Artist[]
  artistCount?: number
  playlists?: SearchPlaylist[]
  playlistCount?: number
  userprofiles?: SearchUser[]
  userprofileCount?: number
}

