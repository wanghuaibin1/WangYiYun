import { defineStore } from 'pinia'
import { storage, STORAGE_KEY } from '@/utils/storage'
import { UserAPI } from '@/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    cookie: storage.get(STORAGE_KEY.COOKIE) || null,
    UserInfo: storage.get(STORAGE_KEY.USER_INFO) || null,
    likeList: [] as number[],
  }),

  getters: {},

  actions: {
    async getLikeSongList() {
      try {
        const { data: res } = await UserAPI.getLikeList(this.UserInfo.profile.userId)
        this.likeList = res.value.ids
      } catch (error) {
        console.error('获取收藏歌曲列表失败:', error)
      }
    },
  },
})
