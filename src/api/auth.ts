import request from './request'

export interface LoginResponse {
  code: number
  cookie: string
  token: string
  message?: string
}

export interface ApiResponse<T> {
  code: number
  message?: string
  data: T
}

// 二维码状态码
export enum QRCodeStatus {
  Expired = 800,    // 二维码已过期
  Waiting = 801,    // 等待扫码
  Confirming = 802, // 待确认
  Success = 803     // 授权登录成功
}

export interface QRKeyResponse {
  data: {
    unikey: string
  }
}

export interface QRImageResponse {
  data: {
    qrimg: string  // 二维码图片 base64
    qrurl: string  // 二维码内容
  }
}

export interface QRCheckResponse {
  code: QRCodeStatus
  cookie?: string
  message?: string
  nickname?: string
  avatarUrl?: string
}

export const auth = {
  // 手机号登录
  loginByPhone(phone: string, password: string, params?: {
    countrycode?: string,  // 国家码
    md5_password?: string, // md5加密后的密码
    captcha?: string       // 验证码
  }) {
    return request.post<LoginResponse>('/login/cellphone', {
      phone,
      password,
      ...params
    })
  },

  // 邮箱登录
  loginByEmail(email: string, password: string, md5_password?: string) {
    return request.post<LoginResponse>('/login', {
      email,
      password,
      md5_password
    })
  },

  // 获取手机验证码
  getCaptcha(phone: string) {
    return request.get<ApiResponse<any>>('/captcha/sent', {
      params: {
        phone,
        timestamp: Date.now()
      }
    })
  },

  // 验证验证码
  verifyCaptcha(phone: string, captcha: string) {
    return request.get<ApiResponse<any>>('/captcha/verify', {
      params: {
        phone,
        captcha,
        timestamp: Date.now()
      }
    })
  },

  // 获取二维码 key
  getQRKey() {
    return request.get<ApiResponse<QRKeyResponse>>('/login/qr/key', {
      params: {
        timestamp: Date.now()
      }
    })
  },

  // 生成二维码
  createQRCode(key: string) {
    return request.get<ApiResponse<QRImageResponse>>('/login/qr/create', {
      params: {
        key,
        qrimg: true,
        timestamp: Date.now()
      }
    })
  },

  // 检查二维码状态
  checkQRStatus(key: string) {
    return request.get<QRCheckResponse>('/login/qr/check', {
      params: {
        key,
        timestamp: Date.now()
      }
    })
  }
}