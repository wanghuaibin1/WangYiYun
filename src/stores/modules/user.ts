import { defineStore } from 'pinia'
import { storage, STORAGE_KEY } from '@/utils/storage'
import { UserAPI } from '@/api'

interface UserProfile {
  userId: number
  nickname?: string
  avatarUrl?: string
  [key: string]: any
}

interface UserInfo {
  profile: UserProfile
  [key: string]: any
}

interface UserState {
  cookie: string | null
  UserInfo: UserInfo | null
  likeList: number[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    cookie: storage.get(STORAGE_KEY.COOKIE) || null,
    UserInfo: storage.get(STORAGE_KEY.USER_INFO) || null,
    likeList: [],
  }),

  getters: {
    /**
     * 获取用户 ID
     */
    userId(): number | null {
      return this.UserInfo?.profile?.userId ?? null
    },

    /**
     * 检查用户是否已登录
     */
    isLoggedIn(): boolean {
      return !!this.cookie && !!this.UserInfo
    },
  },

  actions: {
    /**
     * 设置用户信息和 cookie
     */
    setUserInfo(userInfo: UserInfo | null, cookie: string | null = null) {
      this.UserInfo = userInfo
      if (cookie) {
        this.cookie = cookie
      }
      // 同步到本地存储
      if (userInfo) {
        storage.set(STORAGE_KEY.USER_INFO, userInfo)
      }
      if (cookie) {
        storage.set(STORAGE_KEY.COOKIE, cookie)
      }
    },

    /**
     * 清除用户信息
     */
    clearUserInfo() {
      this.UserInfo = null
      this.cookie = null
      this.likeList = []
      storage.remove(STORAGE_KEY.USER_INFO)
      storage.remove(STORAGE_KEY.COOKIE)
    },

    /**
     * 获取收藏歌曲列表
     */
    async getLikeSongList(): Promise<void> {
      if (!this.UserInfo?.profile?.userId) {
        console.warn('用户未登录，无法获取收藏列表')
        return
      }

      try {
        const { data: res } = await UserAPI.getLikeList(this.UserInfo.profile.userId)
        if (res?.value?.ids) {
          this.likeList = res.value.ids
        }
      } catch (error) {
        console.error('获取收藏歌曲列表失败:', error)
        this.likeList = []
      }
    },
  },
})
