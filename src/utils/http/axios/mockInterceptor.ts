/**
 * Mock 拦截器
 * 在开发环境中拦截 API 请求，返回测试数据
 */

import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { login } from '@/test/index'
import type { LoginParams, LoginResult, Institution } from '@/api/auth/model/authModel'

/**
 * 是否启用 Mock（开发环境自动启用）
 */
export const isMockEnabled = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

/**
 * Mock 请求拦截器
 */
export function mockRequestInterceptor(config: AxiosRequestConfig): AxiosRequestConfig | Promise<AxiosRequestConfig> {
  if (!isMockEnabled) {
    return config
  }

  // 检查是否是 Mock 的 API
  const url = config.url || ''
  
  // 登录相关 API
  if (url.includes('/auth/api/v1/')) {
    // 标记为 Mock 请求
    ;(config as any).__isMock = true
  }

  return config
}

/**
 * Mock 响应拦截器
 * 注意：这个函数在响应拦截器中调用，但实际上我们需要在请求拦截器中拦截
 */
export async function mockResponseInterceptor(
  response: AxiosResponse,
): Promise<AxiosResponse> {
  // 如果不是 Mock 请求，直接返回
  if (!(response.config as any).__isMock) {
    return response
  }

  const url = response.config.url || ''
  const method = response.config.method?.toLowerCase()

  // 机构搜索 API
  if (url.includes('/institutions/search') && method === 'get') {
    const account = (response.config.params?.account as string) || ''
    const userType = (response.config.params?.userType as 'staff' | 'resident') || 'staff'

    const institutions = await login.mockSearchInstitutions(account, userType)
    
    console.log('%c[Mock] Institution Search API', 'color: #1890ff; font-weight: bold', {
      account,
      userType,
      result: institutions,
    })
    
    return {
      ...response,
      data: {
        code: 200,
        result: institutions,
        message: 'ok',
        type: 'success',
      },
    }
  }

  // 登录 API
  if (url.includes('/login') && method === 'post') {
    const params = response.config.data as LoginParams
    
    try {
      const loginResult = await login.mockLogin(params)
      
      console.log('%c[Mock] Login API - Success', 'color: #52c41a; font-weight: bold', {
        params: { ...params, password: '***' }, // Hide password
        result: loginResult,
      })
      
      return {
        ...response,
        data: {
          code: 200,
          result: loginResult,
          message: 'Login successful',
          type: 'success',
        },
      }
    } catch (error: any) {
      console.log('%c[Mock] Login API - Failed', 'color: #ff4d4f; font-weight: bold', {
        params: { ...params, password: '***' }, // Hide password
        error: error.message,
      })
      
      // 返回错误响应
      return {
        ...response,
        data: {
          code: 401,
          result: null,
          message: error.message || 'Login failed',
          type: 'error',
        },
        status: 401,
        statusText: 'Unauthorized',
      }
    }
  }

  return response
}

/**
 * 在请求拦截器中直接拦截并返回 Mock 数据
 * 这样可以避免实际发送 HTTP 请求
 */
export async function interceptMockRequest(config: AxiosRequestConfig): Promise<any> {
  if (!isMockEnabled || !(config as any).__isMock) {
    return null // 不拦截，继续正常请求
  }

  const url = config.url || ''
  const method = config.method?.toLowerCase()

  // 机构搜索 API
  if (url.includes('/institutions/search') && method === 'get') {
    const account = (config.params?.account as string) || ''
    const userType = (config.params?.userType as 'staff' | 'resident') || 'staff'

    const institutions = await login.mockSearchInstitutions(account, userType)
    
    console.log('%c[Mock] Institution Search API', 'color: #1890ff; font-weight: bold', {
      account,
      userType,
      result: institutions,
    })
    
    // 返回一个 Promise，模拟 Axios 响应
    return Promise.resolve({
      data: {
        code: 200,
        result: institutions,
        message: 'ok',
        type: 'success',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    })
  }

  // 登录 API
  if (url.includes('/login') && method === 'post') {
    const params = config.data as LoginParams
    
    try {
      const loginResult = await login.mockLogin(params)
      
      console.log('%c[Mock] Login API - Success', 'color: #52c41a; font-weight: bold', {
        params: { ...params, password: '***' }, // Hide password
        result: loginResult,
      })
      
      return Promise.resolve({
        data: {
          code: 200,
          result: loginResult,
          message: 'Login successful',
          type: 'success',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      })
    } catch (error: any) {
      console.log('%c[Mock] Login API - Failed', 'color: #ff4d4f; font-weight: bold', {
        params: { ...params, password: '***' }, // Hide password
        error: error.message,
      })
      
      return Promise.reject({
        response: {
          data: {
            code: 401,
            result: null,
            message: error.message || 'Login failed',
            type: 'error',
          },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
        },
      })
    }
  }

  return null
}

