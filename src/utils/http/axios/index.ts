// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
// The axios configuration can be configured according to the project, just change the file, other files can be left unchanged

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

// 临时配置，后续需要从环境变量或配置中读取
const apiUrl = import.meta.env.VITE_API_URL || ''
const urlPrefix = import.meta.env.VITE_URL_PREFIX || ''

// 从 store 获取 token（同步函数，因为 store getter 是同步的）
function getToken(): string | null {
  try {
    // 尝试从 localStorage 直接获取（避免循环依赖）
    // Store 会在设置 token 时同步更新 localStorage
    return localStorage.getItem('ACCESS_TOKEN')
  } catch (error) {
    return null
  }
}

// TODO: 实现 Token 刷新逻辑时使用
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
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
  /**
   * @description: 处理响应数据。如果数据不是预期格式，可直接抛出错误
   */
  transformResponseHook: (res: AxiosResponse<Result>, options: RequestOptions) => {
    const { isTransformResponse, isReturnNativeResponse } = options

    // Check if 'res' has the structure of an AxiosResponse.
    const isAxiosResponse = res && typeof res === 'object' && 'data' in res && 'status' in res && 'config' in res

    if (!isAxiosResponse) {
      console.warn('transformResponseHook received non-AxiosResponse data, returning directly:', res)
      return res
    }

    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return res
    }
    // 不进行任何处理，直接返回
    if (!isTransformResponse) {
      return res.data
    }

    const { data } = res
    if (!data) {
      throw new Error('Request failed, no data returned')
    }
    //  这里 code，result，message为 后台统一的字段
    const { code, result, message } = data

    // 这里逻辑可以根据项目进行修改
    const hasSuccess = data && Reflect.has(data, 'code') && code === ResultEnum.SUCCESS
    if (hasSuccess) {
      return result
    }

    // 在此处根据自己项目的实际情况对不同的code执行不同的操作
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

    // errorMessageMode='modal'的时候会显示modal错误弹窗，而不是消息提示
    // errorMessageMode='none' 一般是调用时明确表示不希望自动弹出错误提示
    if (options.errorMessageMode === 'modal') {
      // TODO: 显示错误弹窗
      console.error(`[Error Modal]: ${timeoutMsg}`)
    } else if (options.errorMessageMode === 'message') {
      // TODO: 显示错误消息
      console.error(`[Error Message]: ${timeoutMsg}`)
    }

    throw new Error(timeoutMsg || 'Request failed')
  },

  // 请求之前处理config
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
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false))
      } else {
        // 兼容restful风格
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
          // 非GET请求如果没有提供data，则将params视为data
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
        // 兼容restful风格
        config.url = config.url + params
        config.params = undefined
      }
    }
    return config
  },

  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: (config, options) => {
    // 请求之前处理config
    const token = getToken()
    if (token && (config as any)?.requestOptions?.withToken !== false) {
      // jwt token
      ;(config as any).headers = (config as any).headers || {}
      ;(config as any).headers.Authorization = options.authenticationScheme
        ? `${options.authenticationScheme} ${token}`
        : token
    }
    return config
  },

  /**
   * @description: 响应拦截器处理
   */
  responseInterceptors: (res: AxiosResponse<any>) => {
    return res
  },

  /**
   * @description: 响应错误处理
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
      // TODO: 实现 Token 刷新逻辑
      // 这里先简单处理，直接返回错误
      return Promise.reject(error)
    } else {
      const { response: errResponse, code, message } = error || {}
      const errorMessageMode = config?.requestOptions?.errorMessageMode || 'none'
      const msg: string = errResponse?.data?.error?.message ?? ''
      const err: string = error?.toString?.() ?? ''
      let errMessage = ''
      try {
        if (code === 'ECONNABORTED' && message?.indexOf('timeout') !== -1) {
          // TODO: 跳转到超时页面
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

      // 添加自动重试机制 保险起见 只针对GET请求
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
    // 深度合并
    deepMerge(
      {
        // authentication schemes，e.g: Bearer
        authenticationScheme: '',
        timeout: 10 * 1000,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        // 数据处理方式
        transform: clone(transform),
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 默认将prefix 添加到url
          joinPrefix: true,
          // 是否返回原生响应头
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 消息提示类型
          errorMessageMode: 'message',
          // 接口地址
          apiUrl: apiUrl,
          // 接口拼接地址
          urlPrefix: urlPrefix,
          //  是否加入时间戳
          joinTime: true,
          // 忽略重复请求
          ignoreCancelToken: true,
          // 是否携带token
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

