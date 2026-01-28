import { defineStore } from 'pinia'
import { storage, STORAGE_KEY } from '@/utils/storage'
import { UserAPI } from '@/api'
import type { ReplacePhoneParams } from '@/api/modules/user'
import { getThemeColor, normalizeThemeColor, type RGB } from '@/utils/themeColor.ts' // 需导入换绑手机的参数类型
interface UserProfile {
  userId: number
  nickname?: string
  avatarUrl?: string
  [key: string]: unknown
}

interface UserInfo {
  profile: UserProfile
  [key: string]: unknown
}

export const useUserStore = defineStore('user', {
  state: () => ({
    cookie: storage.get(STORAGE_KEY.COOKIE) || null,
    UserInfo: storage.get(STORAGE_KEY.USER_INFO) || null,
    likeList: [] as string[], //喜欢列表
    userData: [], //用户信息 , 歌单，收藏，mv, dj 数量
    userPlaylists: [] as any[], // 用户歌单列表
    accountInformation: [], //账号信息
    userLevel: '', //用户等级信息
    userBinding_information: [], //用户绑定信息
    bindMobile_phone: [], //用户绑定手机
    userThemeRGB: [30, 30, 30] as RGB, //用户头像主题色
    userCache: {} as Record<string, RGB>,
    backTheme: true as boolean,
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
     * 登录成功并行获取用户信息
     * @param uid 用户id
     * @param cookie 登录成功的cookie
     */
    async loginSuccess(uid: number, cookie: string) {
      try {
        // 并行请求，提升效率
        await Promise.all([
          this.getUserInfo(uid, cookie),
          this.getLikeSongList(),
          this.getUserLevel(),
        ])
        console.log('用户信息并行拉取完成')
      } catch (err) {
        console.error('登录后拉取用户信息失败', err)
      }
    },
    /**
     * 获取用户详情
     * @param uid - 用户 ID
     * @param cookie
     * @returns 返回用户详情信息
     */
    async getUserInfo(uid: number, cookie: string) {
      try {
        const { data: res } = await UserAPI.getUserInfoAPI(uid)
        this.setUserInfo(res.value, cookie)
      } catch (err) {
        console.error('获取用户详情失败', err)
      }
    },

    /**
     * 获取用户喜欢的歌曲ID列表
     * @param uid - 用户 ID
     * @returns {Promise<void>}
     */
    async getLikeSongList(): Promise<void> {
      if (!this.UserInfo?.profile?.userId) {
        console.warn('用户未登录，无法获取收藏列表')
        return
      }
      try {
        const { data: res } = await UserAPI.getLikeList(this.UserInfo?.profile?.userId)
        this.likeList = res.value?.ids || []
      } catch (err) {
        this.likeList = [] // 失败兜底空数组，避免后续遍历报错
        console.error('获取用户喜欢列表失败', err)
      }
    },

    /**
     * 获取用户核心账号信息（登录后调用，无参数）
     * @returns {Promise<void>}
     */
    async getUserAccount() {
      try {
        const { data: res } = await UserAPI.getUserAccount()
        this.accountInformation = res.value || []
      } catch (err) {
        this.accountInformation = [] // 失败兜底空数组
        console.error('获取用户账号信息失败', err)
      }
    },

    /**
     * 获取用户信息+歌单/收藏/mv/dj数量统计（登录后调用，无参数）
     * @returns {Promise<void>}
     */
    async getUserSubcount() {
      try {
        const { data: res } = await UserAPI.getUserSubcount()
        this.userData = res.value || []
      } catch (err) {
        this.userData = [] // 失败兜底空数组
        console.error('获取用户数据统计失败', err)
      }
    },

    /**
     * 获取用户歌单列表（创建/收藏）
     */
    async getUserPlaylists(uid?: number) {
      const targetUid = uid ?? this.userId
      if (!targetUid) {
        console.warn('用户未登录，无法获取歌单列表')
        this.userPlaylists = []
        return
      }
      try {
        const { data: res } = await UserAPI.getUserPlaylist(targetUid)
        // Netease 原始结构通常为 { playlist: [...] }，这里做兼容兜底
        const raw = (res as any)?.value as any
        const list = Array.isArray(raw?.playlist) ? raw.playlist : Array.isArray(raw) ? raw : []
        this.userPlaylists = list
      } catch (err) {
        this.userPlaylists = []
        console.error('获取用户歌单列表失败', err)
      }
    },


    /**
     * 获取用户绑定信息（登录后调用，必传用户ID）
     * @param uid - 用户 ID
     * @returns {Promise<void>}
     */
    async getUserBinding(uid: number) {
      try {
        const { data: res } = await UserAPI.getUserBinding(uid)
        this.userBinding_information = res.value || []
      } catch (err) {
        this.userBinding_information = [] // 失败兜底空数组
        console.error('获取用户绑定信息失败', err)
      }
    },

    /**
     * 用户更换绑定手机（登录后调用，操作类接口）
     * @param params - 换绑手机参数（新手机号、新旧验证码、地区码）
     * @returns {Promise<boolean>} - 返回是否操作成功，方便组件做交互提示
     */
    async replaceUserPhone(params: ReplacePhoneParams) {
      try {
        const { data: res } = await UserAPI.replaceUserPhone(params)
        this.bindMobile_phone = res.value || [] // 存储换绑结果
        console.log('手机换绑请求成功')
        return true // 成功返回true
      } catch (err) {
        this.bindMobile_phone = [] // 失败兜底空数组
        console.error('用户更换绑定手机失败', err)
        return false // 失败返回false
      }
    },

    /*
     *获取用户头像主题色
     */
    async setUserThemeByCover(coverUrl: string) {
      if (!coverUrl) return
      // 命中缓存，直接用
      if (this.userCache[coverUrl]) {
        this.userThemeRGB = this.userCache[coverUrl]
        return
      }
      const rgb = await getThemeColor(coverUrl)
      const safeRGB = normalizeThemeColor(rgb)
      this.userThemeRGB = safeRGB
      this.userCache[coverUrl] = safeRGB
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
  },
})
