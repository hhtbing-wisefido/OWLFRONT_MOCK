/**
 * Data processing class, can be configured according to the project
 */
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { RequestOptions, Result } from '/#/axios'

export interface CreateAxiosOptions extends AxiosRequestConfig {
  authenticationScheme?: string
  transform?: AxiosTransform
  requestOptions?: RequestOptions
}

export abstract class AxiosTransform {
  /**
   * @description: Process configuration before request
   * @description: Process configuration before request
   */
  beforeRequestHook?: (config: AxiosRequestConfig, options: RequestOptions) => AxiosRequestConfig

  /**
   * @description: Process response data
   */
  transformResponseHook?: (res: AxiosResponse<Result>, options: RequestOptions) => any

  /**
   * @description: Request failure handling
   */
  requestCatchHook?: (e: Error, options: RequestOptions) => Promise<any>

  /**
   * @description: Interceptor before request
   */
  requestInterceptors?: (
    config: AxiosRequestConfig,
    options: CreateAxiosOptions,
  ) => AxiosRequestConfig

  /**
   * @description: Interceptor after request
   */
  responseInterceptors?: (res: AxiosResponse<any>) => AxiosResponse<any>

  /**
   * @description: Error handling for interceptor before request
   */
  requestInterceptorsCatch?: (error: Error) => void

  /**
   * @description: Error handling for interceptor after request
   */
  responseInterceptorsCatch?: (axiosInstance: AxiosResponse, error: Error) => void
}

