// Axios configuration can be configured according to the project, just change this file, other files can be left unchanged

import type { AxiosResponse } from 'axios'
import { clone } from 'lodash-es'
import type { RequestOptions, Result } from '/#/axios'
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform'
import { VAxios } from './Axios'
import { checkStatus } from './checkStatus'
import { RequestEnum, ResultEnum, ContentTypeEnum } from '@/enums/httpEnum'
import { isString } from '@/utils/is'
import { setObjToUrlParams, deepMerge } from '@/utils'
import { joinTimestamp, formatRequestDate } from './helper'
import { AxiosRetry } from './axiosRetry'

// Temporary configuration, should be read from environment variables or config later
const apiUrl = import.meta.env.VITE_API_URL || ''
const urlPrefix = import.meta.env.VITE_URL_PREFIX || ''

// Get token from store (synchronous function, because store getter is synchronous)
function getToken(): string | null {
  try {
    // Try to get from localStorage directly (avoid circular dependency)
    // Store will synchronously update localStorage when setting token
    return localStorage.getItem('ACCESS_TOKEN')
  } catch (error) {
    return null
  }
}

// Get user info from localStorage (synchronous function)
// Note: Uses USER_INFO_KEY constant from auth utils
function getUserInfo(): { userId?: string; role?: string; tenant_id?: string } | null {
  try {
    const userInfoStr = localStorage.getItem('USER_INFO')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      return {
        userId: userInfo.userId,
        role: userInfo.role,
        tenant_id: userInfo.tenant_id,
      }
    }
    return null
  } catch (error) {
    return null
  }
}

// TODO: Use when implementing token refresh logic
// let isRefreshing = false // Flag to indicate if a refresh is in progress
// let requestsToRetry: Array<(token: string) => void> = [] // Queue for failed requests waiting for refresh

class TokenExpiredError extends Error {
  response: AxiosResponse<Result>
  constructor(message: string, response: AxiosResponse<Result>) {
    super(message)
    this.name = 'TokenExpiredError'
    this.response = response
  }
}

/**
 * @description: Data processing, convenient for distinguishing multiple processing methods
 */
const transform: AxiosTransform = {
  /**
   * @description: Process response data. If data is not in expected format, can directly throw error
   */
  transformResponseHook: (res: AxiosResponse<Result>, options: RequestOptions) => {
    const { isTransformResponse, isReturnNativeResponse } = options

    // Check if 'res' has the structure of an AxiosResponse.
    const isAxiosResponse = res && typeof res === 'object' && 'data' in res && 'status' in res && 'config' in res

    if (!isAxiosResponse) {
      console.warn('transformResponseHook received non-AxiosResponse data, returning directly:', res)
      return res
    }

    // Whether to return native response headers, e.g., use this property when need to get response headers
    if (isReturnNativeResponse) {
      return res
    }
    // Do not process, return directly
    if (!isTransformResponse) {
      return res.data
    }

    const { data } = res
    if (!data) {
      throw new Error('Request failed, no data returned')
    }
    // Here code, result, message are unified backend fields
    const { code, result, message } = data

    // This logic can be modified according to the project
    const hasSuccess = data && Reflect.has(data, 'code') && code === ResultEnum.SUCCESS
    if (hasSuccess) {
      return result
    }

    // Execute different operations for different codes according to the actual situation of the project
    let timeoutMsg = ''
    switch (code) {
      case ResultEnum.TIMEOUT:
        timeoutMsg = message || 'Login timeout, please login again'
        // TODO: Handle logout logic
        break
      case ResultEnum.TOKEN_EXPIRED:
        timeoutMsg = message || 'Token expired, please login again'
        throw new TokenExpiredError(timeoutMsg, res)
      default:
        if (message) {
          timeoutMsg = message
        }
    }

    // When errorMessageMode='modal', will show modal error popup instead of message
    // errorMessageMode='none' usually means explicitly don't want automatic error popup when calling
    if (options.errorMessageMode === 'modal') {
      // TODO: Show error modal
      console.error(`[Error Modal]: ${timeoutMsg}`)
    } else if (options.errorMessageMode === 'message') {
      // TODO: Show error message
      console.error(`[Error Message]: ${timeoutMsg}`)
    }

    throw new Error(timeoutMsg || 'Request failed')
  },

  // Process config before request
  beforeRequestHook: (config, options) => {
    const { apiUrl: optApiUrl, joinPrefix, joinParamsToUrl, formatDate, joinTime = true, urlPrefix: optUrlPrefix } = options
    if (joinPrefix) {
      config.url = `${optUrlPrefix || urlPrefix}${config.url}`
    }

    if (optApiUrl && isString(optApiUrl)) {
      config.url = `${optApiUrl}${config.url}`
    }
    const params = config.params || {}
    const data = config.data || false
    formatDate && data && !isString(data) && formatRequestDate(data)
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        // Add timestamp parameter to GET request to avoid getting data from cache
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false))
      } else {
        // Compatible with RESTful style
        config.url = config.url + params + `${joinTimestamp(joinTime, true)}`
        config.params = undefined
      }
    } else {
      if (!isString(params)) {
        formatDate && formatRequestDate(params)
        if (
          Reflect.has(config, 'data') &&
          config.data &&
          (Object.keys(config.data).length > 0 || config.data instanceof FormData)
        ) {
          config.data = data
          config.params = params
        } else {
          // For non-GET requests, if data is not provided, treat params as data
          config.data = params
          config.params = undefined
        }
        if (joinParamsToUrl) {
          config.url = setObjToUrlParams(
            config.url as string,
            Object.assign({}, config.params, config.data),
          )
        }
      } else {
        // Compatible with RESTful style
        config.url = config.url + params
        config.params = undefined
      }
    }
    return config
  },

  /**
   * @description: Request interceptor processing
   */
  requestInterceptors: (config, options) => {
    // Process config before request
    const token = getToken()
    if (token && (config as any)?.requestOptions?.withToken !== false) {
      // JWT token
      ;(config as any).headers = (config as any).headers || {}
      ;(config as any).headers.Authorization = options.authenticationScheme
        ? `${options.authenticationScheme} ${token}`
        : token
    }
    
    // Add user info (userId and role) to request for backend permission filtering
    // Backend can use these to filter data based on user permissions
    const userInfo = getUserInfo()
    if (userInfo) {
      ;(config as any).headers = (config as any).headers || {}
      if (userInfo.userId) {
        ;(config as any).headers['X-User-Id'] = userInfo.userId
      }
      if (userInfo.role) {
        ;(config as any).headers['X-User-Role'] = userInfo.role
      }
      // Multi-tenant: let backend resolve tenant without requiring tenant_id query param on every POST/PUT
      if ((userInfo as any).tenant_id) {
        ;(config as any).headers['X-Tenant-Id'] = (userInfo as any).tenant_id
      }
    }
    
    return config
  },

  /**
   * @description: Response interceptor processing
   */
  responseInterceptors: (res: AxiosResponse<any>) => {
    return res
  },

  /**
   * @description: Response error handling
   */
  responseInterceptorsCatch: (axiosInstance: AxiosResponse, error: any) => {
    console.info('responseInterceptorsCatch, error:', error)
    const config = error?.config || error?.response?.config // Original request config
    const response = error?.response // Get the response object from the error

    // Check specifically for 401 status AND the backend's expired token code in the response body
    const isTokenExpiredError =
      response?.status === 401 && response?.data?.code === ResultEnum.TOKEN_EXPIRED

    if (isTokenExpiredError && config) {
      console.log('Detected Token Expired Error (401 + 60401)')
      // TODO: Implement token refresh logic
      // Simple handling here, directly return error
      return Promise.reject(error)
    } else {
      const { response: errResponse, code, message } = error || {}
      const errorMessageMode = config?.requestOptions?.errorMessageMode || 'none'
      const msg: string = errResponse?.data?.error?.message ?? ''
      const err: string = error?.toString?.() ?? ''
      let errMessage = ''
      try {
        if (code === 'ECONNABORTED' && message?.indexOf('timeout') !== -1) {
          // TODO: Navigate to timeout page
          errMessage = 'Request timeout'
        }
        if (err?.includes('Network Error')) {
          errMessage = 'Network error'
        }

        if (errMessage) {
          if (errorMessageMode === 'modal') {
            console.error(`[Error Modal]: ${errMessage}`)
          } else if (errorMessageMode === 'message') {
            console.error(`[Error Message]: ${errMessage}`)
          }
          return Promise.reject(error)
        }
      } catch (error) {
        throw new Error(error as unknown as string)
      }

      checkStatus(error?.response?.status, msg, errorMessageMode)

      // Add automatic retry mechanism, for safety only for GET requests
      const retryRequest = new AxiosRetry()
      const retryConfig = config?.requestOptions?.retryRequest
      if (retryConfig?.isOpenRetry && config?.method?.toUpperCase() === RequestEnum.GET) {
        // @ts-ignore
        retryRequest.retry(axiosInstance, error)
      }
      return Promise.reject(error)
    }
  },
}

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    // Deep merge
    deepMerge(
      {
        // Authentication schemes, e.g: Bearer
        authenticationScheme: '',
        timeout: 10 * 1000,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        // Data processing method
        transform: clone(transform),
        // Configuration options, all options below can be overridden in individual API requests
        requestOptions: {
          // Default add prefix to url
          joinPrefix: true,
          // Whether to return native response headers
          isReturnNativeResponse: false,
          // Need to process returned data
          isTransformResponse: true,
          // Add parameters to url when POST request
          joinParamsToUrl: false,
          // Format submitted parameter time
          formatDate: true,
          // Message prompt type
          errorMessageMode: 'message',
          // API address
          apiUrl: apiUrl,
          // API concatenation address
          urlPrefix: urlPrefix,
          // Whether to add timestamp
          joinTime: true,
          // Ignore duplicate requests
          ignoreCancelToken: true,
          // Whether to carry token
          withToken: true,
          retryRequest: {
            isOpenRetry: true,
            count: 0,
            waitTime: 100,
          },
        },
      },
      opt || {},
    ),
  )
}
export const defHttp = createAxios()

// other api url
// export const otherHttp = createAxios({
//   requestOptions: {
//     apiUrl: 'xxx',
//     urlPrefix: 'xxx',
//   },
// });

