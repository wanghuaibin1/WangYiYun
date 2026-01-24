import request from '@/api/request'
import type {
  SearchHotDetailItem,
  SearchHotItem,
  SearchResult,
  SearchSuggestResult,
  SearchDefaultKeyword,
} from '@/types/search'

export interface SearchParams {
  keywords: string
  type?: number
  limit?: number
  offset?: number
}

export const SearchAPI = {
  search(params: SearchParams) {
    return request.get<{ code: number; result: SearchResult }>('/cloudsearch', {
      ...params,
    })
  },

  searchDefault() {
    return request.get<{ data: SearchDefaultKeyword; code: number }>('/search/default')
  },

  hotList() {
    return request.get<{ result: { hots: SearchHotItem[] }; code: number }>('/search/hot')
  },

  hotDetail() {
    return request.get<{ data: SearchHotDetailItem[]; code: number }>('/search/hot/detail')
  },

  suggest(keywords: string, type?: string) {
    return request.get<{ result: SearchSuggestResult; code: number }>(
      '/search/suggest',
      { keywords, type },
    )
  },

  multiMatch(keywords: string) {
    return request.get<{ result: SearchResult; code: number }>(
      '/search/multimatch',
      { keywords },
    )
  },
}

