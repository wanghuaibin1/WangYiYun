import axios from 'axios'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'

import { ref, type Ref } from 'vue'

interface HttpResponse<T = unknown> {
  loading: ref<boolean>
  data: ref<T | null>
  errMsg: ref<string | null>
}

export class Http {
  private instance: AxiosInstance

  constructor(baseURL = '/api') {
    this.instance = axios.create({
      baseURL,
      withCredentials: true,
      headers: {},
      timeout: 12000,
    })
    this.interceptors()
  }

  private interceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add any logic for request interceptors here
        return config
      },
      (error: AxiosError) => Promise.reject(error),
    )
    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error: AxiosError) => {
        errTip(error)
        return Promise.reject(error)
      },
    )
  }

  get<T>(url: string, params?: string | object | number, config?: HttpOptions) {
    return this.request<T>({
      method: 'get',
      url,
      params,
      ...config,
    })
  }

  post<T>(url: string, data?: string | object | number, config?: HttpOptions) {
    return this.request<T>({
      method: 'post',
      url,
      data,
      ...config,
    })
  }

  json<T>(url: string, data?: string | object | number, config?: HttpOptions) {
    return this.request<T>({
      method: 'post',
      url,
      data,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    })
  }

  put<T>(url: string, data?: string | object | number, config?: HttpOptions) {
    return this.request<T>({
      method: 'put',
      url,
      data,
      ...config,
    })
  }

  delete<T>(url: string, config?: HttpOptions) {
    return this.request<T>({
      method: 'delete',
      url,
      ...config,
    })
  }

  private async request<T>(options: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const loading = ref<boolean>(true)
    const data = ref<T | null>(null)
    const errMsg = ref<string | null>(null)
    try {
      const response: T = await this.instance(options)
      data.value = response
    } catch (e: unknown) {
      const error = e as AxiosError
      errMsg.value = error.message || '未知错误'
    } finally {
      loading.value = false
    }

    return {
      loading,
      data,
      errMsg,
    }
  }
}

function errTip(error: AxiosError, msg = '未知错误'): void {
  const tip: { [key: number]: string } = {
    400: '请求错误',
    401: '未授权，请登录',
    403: '拒绝访问',
    404: `请求地址出错${error.response?.config?.url || ''}`,
    405: `请求方式不允许`,
    408: '请求超时',
    500: '服务器内部错误',
    501: '服务未实现',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时',
    505: 'HTTP版本不受支持',
  }
  console.log(tip[error.response?.status || 0] || msg)
}

export default new Http()
