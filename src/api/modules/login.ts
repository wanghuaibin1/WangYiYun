import request from '@/api/request'
import type { LoginResponse, QRKeyResponse, QRImageResponse, QRCheckResponse } from '@/types/api'

export const loginAPI = {
  /**
   * 手机号登录
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
    return request.get<QRKeyResponse>('/login/qr/key', { timestamp: Date.now() })
  },
  /**
   * 获取二维码图片
   * @param key 二维码 key
   * @returns
   */
  createQRCode(key: string) {
    return request.get<QRImageResponse>('/login/qr/create', {
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
   * @param {*} params
   * @returns
   */
  RefreshLoginStatus(cookie:string){
    return request.get('/login/status',{
      cookie,
      timerstamp: Date.now()
    })
  },

  /**
   * 退出登录
   */
  loginOut(){
    return request.get('/logout')
  }
}


