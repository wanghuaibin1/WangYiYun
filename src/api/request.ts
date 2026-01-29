import axios from 'axios'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'

import { ref, type Ref } from 'vue'

export interface HttpResponse<T = unknown> {
  loading: ref<boolean>
  data: ref<T | null>
  errMsg: ref<string | null>
}

type HttpOptions = Omit<AxiosRequestConfig, 'url' | 'method' | 'params' | 'data'>

export class Http {
  private instance: AxiosInstance

  constructor(baseURL = import.meta.env.VITE_BASE_API) {
    // 如果 baseURL 未配置，输出警告
    if (!baseURL) {
      console.warn('[API Warning] VITE_BASE_API 未配置，请创建 .env 文件并设置 VITE_BASE_API')
    }
    
    this.instance = axios.create({
      baseURL,
      // 如果后端支持 CORS 且需要发送 cookies，设置为 true
      // 如果遇到 CORS 问题，可以尝试设置为 false
      withCredentials: import.meta.env.VITE_WITH_CREDENTIALS !== 'false',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 12000,
    })
    this.interceptors()
  }

  private interceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 开发环境打印请求信息
        if (import.meta.env.DEV) {
          console.log('[API Request]', config.method?.toUpperCase(), config.url, {
            baseURL: config.baseURL,
            params: config.params,
            data: config.data,
          })
        }
        return config
      },
      (error: AxiosError) => Promise.reject(error),
    )
    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 开发环境打印响应信息
        if (import.meta.env.DEV) {
          console.log('[API Response]', response.config.url, {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers,
          })
        }
        
        // 检查响应数据是否存在
        if (response.data === null || response.data === undefined) {
          console.warn('[API Warning] 响应数据为空', response.config.url)
        }
        
        return response.data
      },
      (error: AxiosError) => {
        // 详细错误日志
        if (error.response) {
          // 服务器返回了错误响应
          console.error('[API Error]', {
            url: error.config?.url,
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers,
          })
        } else if (error.request) {
          // 请求已发出但没有收到响应（可能是 CORS 问题）
          console.error('[API Error] 无响应', {
            url: error.config?.url,
            message: '可能是 CORS 跨域问题或网络错误',
          })
        } else {
          // 请求配置错误
          console.error('[API Error] 请求配置错误', error.message)
        }
        
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

/**
 * 错误提示处理函数
 * @param error - Axios 错误对象
 */
function errTip(error: AxiosError): void {
  const status = error.response?.status
  const errorMessages: Record<number, string> = {
    400: '请求错误',
    401: '未授权，请登录',
    403: '拒绝访问',
    404: `请求地址出错: ${error.response?.config?.url || ''}`,
    405: '请求方式不允许',
    408: '请求超时',
    500: '服务器内部错误',
    501: '服务未实现',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时',
    505: 'HTTP版本不受支持',
  }
  const message = status && errorMessages[status] ? errorMessages[status] : error.message || '未知错误'
  console.error('[HTTP Error]', message, error)
}

export default new Http()
