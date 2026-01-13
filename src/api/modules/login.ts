import request from '@/api/request'
import type { LoginResponse, QRKeyResponse, QRImageResponse, QRCheckResponse, ApiResponse } from '@/types/api'

export const loginAPI = {
  /**
   * 手机号登录（密码方式）
   * @param phone 手机号
   * @param password 密码
   * @returns
   */
  loginByPhone(phone: string, password: string) {
    return request.post<LoginResponse>('/login/cellphone', {
      phone,
      password,
    })
  },

  /**
   * 手机号登录（验证码方式）
   * @param phone 手机号
   * @param captcha 验证码
   * @param countrycode 国家码，用于国外手机号登录，例如美国传入：1
   * @returns
   */
  loginByPhoneWithCaptcha(phone: string, captcha: string, countrycode?: string) {
    return request.post<LoginResponse>('/login/cellphone', {
      phone,
      captcha,
      countrycode,
    })
  },

  /**
   * 发送验证码
   * @param phone 手机号码
   * @param ctcode 国家区号，默认 86 即中国
   * @returns
   */
  sendCaptcha(phone: string, ctcode: string = '86') {
    return request.get<ApiResponse<any>>('/captcha/sent', {
      phone,
      ctcode,
    })
  },

  /**
   * 邮箱登录
   * @param email 163 网易邮箱
   * @param password 密码
   */
  loginByEmail(email: string, password: string) {
    return request.post<LoginResponse>('/login', {
      email,
      password,
    })
  },

  /**
   * 二维码登录,获取 key
   */
  getQRKey() {
    return request.get<ApiResponse<QRKeyResponse>>('/login/qr/key', { timestamp: Date.now() })
  },
  /**
   * 获取二维码图片
   * @param key 二维码 key
   * @returns
   */
  createQRCode(key: string) {
    return request.get<ApiResponse<QRImageResponse>>('/login/qr/create', {
      key,
      qrimg: true,
      timestamp: Date.now(),
    })
  },
  /**
   * 检查二维码状态
   * @param key 二维码 key
   * @returns
   */
  checkQRStatus(key: string) {
    return request.get<QRCheckResponse>('/login/qr/check', {
      key,
      timestamp: Date.now(),
    })
  },

  /**
   * 刷新登录状态
   * @param cookie 登录凭证
   * @returns
   */
  RefreshLoginStatus(cookie: string) {
    return request.get<ApiResponse<any>>('/login/status', {
      cookie,
      timestamp: Date.now()
    })
  },

  /**
   * 退出登录
   */
  loginOut() {
    return request.get<ApiResponse<any>>('/logout')
  }
}


