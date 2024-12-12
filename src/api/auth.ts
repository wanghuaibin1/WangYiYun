import request from './request'

export interface LoginResponse {
  code: number
  cookie: string
  token: string
  // ... 其他返回字段
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
    qrimg: string
    qrurl: string
  }
}

export interface QRCheckResponse {
  code: number
  cookie?: string
  message?: string
  nickname?: string
  avatarUrl?: string
}

export interface LoginStatusResponse {
  value: {
    data: {
      account: {
        id: number
      }
    }
  }
}

export interface UserInfoResponse {
  value: any  // 根据实际返回数据定义类型
}

export const auth = {
  // 手机号登录
  loginByPhone(phone: string, password: string) {
    return request.post<ApiResponse<LoginResponse>>('/login/cellphone', {
      phone,
      password
    })
  },

  // 邮箱登录
  loginByEmail(email: string, password: string) {
    return request.post<ApiResponse<LoginResponse>>('/login', {
      email,
      password
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
  },

  // 获取登录状态
  getLoginStatus(cookie: string) {
    return request.get<LoginStatusResponse>('/login/status', {
      params: {
        cookie,
        timestamp: Date.now()
      }
    })
  },

  // 获取用户信息
  getUserInfo(uid: number) {
    return request.get<UserInfoResponse>('/user/detail', {
      params: {
        uid,
        timestamp: Date.now()
      }
    })
  }
}