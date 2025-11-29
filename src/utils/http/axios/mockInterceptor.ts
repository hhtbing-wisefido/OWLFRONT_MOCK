/**
 * Mock interceptor
 * Intercept API requests in development environment and return test data
 */

import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { LoginParams, LoginResult, Institution } from '@/api/auth/model/authModel'

/**
 * Whether to enable Mock (automatically enabled in development environment)
 */
export const isMockEnabled = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

/**
 * Mock request interceptor
 */
export function mockRequestInterceptor(config: AxiosRequestConfig): AxiosRequestConfig | Promise<AxiosRequestConfig> {
  if (!isMockEnabled) {
    return config
  }

  // Check if it's a Mock API
  const url = config.url || ''
  
  // Login-related APIs
  if (url.includes('/auth/api/v1/')) {
    // Mark as Mock request
    ;(config as any).__isMock = true
  }

  return config
}

/**
 * Mock response interceptor
 * Note: This function is called in the response interceptor, but actually we need to intercept in the request interceptor
 */
export async function mockResponseInterceptor(
  response: AxiosResponse,
): Promise<AxiosResponse> {
  // If not a Mock request, return directly
  if (!(response.config as any).__isMock) {
    return response
  }

  const url = response.config.url || ''
  const method = response.config.method?.toLowerCase()

  // Institution search API
  if (url.includes('/institutions/search') && method === 'get') {
    const account = (response.config.params?.account as string) || ''
    const userType = (response.config.params?.userType as 'staff' | 'resident') || 'staff'

    const { login } = await import('@test/index')
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

  // Login API
  if (url.includes('/login') && method === 'post') {
    const params = response.config.data as LoginParams
    
    try {
      const { login } = await import('@test/index')
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
      
      // Return error response
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
 * Directly intercept and return Mock data in request interceptor
 * This avoids actually sending HTTP requests
 */
export async function interceptMockRequest(config: AxiosRequestConfig): Promise<any> {
  if (!isMockEnabled || !(config as any).__isMock) {
    return null // Don't intercept, continue normal request
  }

  const url = config.url || ''
  const method = config.method?.toLowerCase()

  // Institution search API
  if (url.includes('/institutions/search') && method === 'get') {
    const account = (config.params?.account as string) || ''
    const userType = (config.params?.userType as 'staff' | 'resident') || 'staff'

    const { login } = await import('@test/index')
    const institutions = await login.mockSearchInstitutions(account, userType)
    
    console.log('%c[Mock] Institution Search API', 'color: #1890ff; font-weight: bold', {
      account,
      userType,
      result: institutions,
    })
    
    // Return a Promise, simulate Axios response
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

  // Login API
  if (url.includes('/login') && method === 'post') {
    const params = config.data as LoginParams
    
    try {
      const { login } = await import('@test/index')
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

