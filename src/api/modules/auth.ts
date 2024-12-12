import request from '@/utils/request'
import { API } from '@/constants/api'
import type { LoginResponse, QRKeyResponse, QRImageResponse, QRCheckResponse } from '@/types/api'

export const auth = {
  loginByPhone(phone: string, password: string) {
    return request.post<LoginResponse>(API.AUTH.LOGIN_PHONE, {
      phone,
      password
    })
  },

  loginByEmail(email: string, password: string) {
    return request.post<LoginResponse>(API.AUTH.LOGIN_EMAIL, {
      email,
      password
    })
  },

  getQRKey() {
    return request.get<QRKeyResponse>(API.AUTH.LOGIN_QR_KEY, {
      params: { timestamp: Date.now() }
    })
  },

  createQRCode(key: string) {
    return request.get<QRImageResponse>(API.AUTH.LOGIN_QR_CREATE, {
      params: {
        key,
        qrimg: true,
        timestamp: Date.now()
      }
    })
  },

  checkQRStatus(key: string) {
    return request.get<QRCheckResponse>(API.AUTH.LOGIN_QR_CHECK, {
      params: {
        key,
        timestamp: Date.now()
      }
    })
  }
}