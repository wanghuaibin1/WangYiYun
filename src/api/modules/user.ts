import request from '@/api/request.ts'
import type { UserProfile, ApiResponse } from '@/types/api'

// 为「更换绑定手机」接口定义专属参数类型（TS 强约束，必选/可选参数清晰）
export interface ReplacePhoneParams {
  /** 新手机号码 */
  phone: string
  /** 原手机号的验证码 */
  oldcaptcha: string
  /** 新手机号的验证码 */
  captcha: string
  /** 国家地区代码，默认 86 */
  countrycode?: number
}

export const UserAPI = {
  /**
   * 获取用户详情
   * @param uid - 用户 ID
   * @returns 返回用户详情信息
   */
  getUserInfoAPI(uid: number) {
    return request.get<ApiResponse<UserProfile>>('/user/detail', { uid })
  },

  /**
   * 获取用户播放记录
   * @param uid - 用户 ID
   * @returns 返回用户播放记录
   */
  getRecordSongsAPI(uid: number) {
    return request.get<ApiResponse<unknown>>('/user/record', { uid })
  },

  /**
   * 获取用户收藏的歌曲
   * @param uid - 用户 ID
   * @returns 返回用户收藏的歌曲列表（包含 ids 数组）
   */
  getLikeList(uid: number) {
    return request.get<ApiResponse<{ ids: number[] }>>('/likelist', { uid })
  },

  /**
   * 获取用户账号信息（登录后调用，无参数）
   * @returns 返回用户核心账号信息
   */
  getUserAccount() {
    return request.get<ApiResponse<unknown>>('/user/account')
  },

  /**
   * 获取用户歌单列表
   * @param uid - 用户 ID
   * @param limit - 每页数量，默认 50
   * @param offset - 偏移量，分页使用
   */
  getUserPlaylist(uid: number, limit = 50, offset = 0) {
    return request.get<ApiResponse<unknown>>('/user/playlist', {
      uid,
      limit,
      offset,
    })
  },

  /**
   * 获取用户信息+歌单/收藏/mv/dj数量统计（登录后调用，无参数）
   * @returns 返回用户各类数据的数量统计
   */
  getUserSubcount() {
    return request.get<ApiResponse<unknown>>('/user/subcount')
  },

  /**
   * 获取用户等级信息（登录后调用，无参数）
   * @returns 返回登录天数、听歌次数、等级进度等等级信息
   */
  getUserLevel() {
    return request.get<ApiResponse<unknown>>('/user/level')
  },

  /**
   * 获取用户绑定信息（登录后调用，必传用户ID）
   * @param uid - 用户 ID
   * @returns 返回用户手机、第三方等绑定信息
   */
  getUserBinding(uid: number) {
    return request.get<ApiResponse<unknown>>('/user/binding', { uid })
  },

  /**
   * 用户更换绑定手机（登录后调用，操作类接口用POST）
   * @param params - 换绑手机参数（新手机号、新旧验证码、地区码）
   * @returns 返回换绑结果
   */
  replaceUserPhone(params: ReplacePhoneParams) {
    // 补全默认地区码86，避免前端传参遗漏
    const requestParams = { countrycode: 86, ...params }
    return request.post<ApiResponse<unknown>>('/user/replacephone', requestParams)
  },
}
