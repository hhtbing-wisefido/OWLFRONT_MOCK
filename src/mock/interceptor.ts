import axios from 'axios'
import type { AxiosRequestConfig, InternalAxiosRequestConfig, AxiosAdapter } from 'axios'
import {
  mockLogin,
  mockSearchInstitutions,
  mockGetCards,
  mockGetCardDetail,
  mockGetAlarms,
  mockResolveAlarm,
  mockGetResidents,
  mockGetRolePermissions
} from './mockApi'

// Mock模式开关
export const MOCK_ENABLED = true

// 创建XHR适配器（用于非Mock请求）
function createXhrAdapter(): AxiosAdapter {
  return (config: any) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      xhr.open(config.method?.toUpperCase() || 'GET', config.url!, true)
      
      // 设置请求头
      if (config.headers) {
        Object.keys(config.headers).forEach(key => {
          xhr.setRequestHeader(key, config.headers[key])
        })
      }
      
      // 设置超时
      if (config.timeout) {
        xhr.timeout = config.timeout
      }
      
      xhr.onload = () => {
        const response = {
          data: xhr.response,
          status: xhr.status,
          statusText: xhr.statusText,
          headers: {},
          config: config,
          request: xhr
        }
        resolve(response)
      }
      
      xhr.onerror = () => {
        reject(new Error('Network Error'))
      }
      
      xhr.ontimeout = () => {
        reject(new Error('Timeout'))
      }
      
      // 发送请求
      xhr.send(config.data)
    })
  }
}

// Mock路由匹配函数
function matchMockRoute(method: string, url: string): any {
  const routes: Array<{ pattern: RegExp, method: string, handler: any }> = [
    // 登录
    { pattern: /\/auth\/api\/v1\/login$/, method: 'POST', handler: mockLogin },
    { pattern: /\/api\/auth\/login$/, method: 'POST', handler: mockLogin },
    { pattern: /\/api\/login$/, method: 'POST', handler: mockLogin },
    
    // 机构搜索
    { pattern: /\/auth\/api\/v1\/institutions\/search/, method: 'GET', handler: mockSearchInstitutions },
    { pattern: /\/api\/institutions\/search/, method: 'GET', handler: mockSearchInstitutions },
    
    // 居民列表
    { pattern: /\/admin\/api\/v1\/residents/, method: 'GET', handler: mockGetResidents },
    { pattern: /\/api\/v1\/residents/, method: 'GET', handler: mockGetResidents },
    { pattern: /\/api\/residents/, method: 'GET', handler: mockGetResidents },
    
    // 角色权限列表
    { pattern: /\/admin\/api\/v1\/role-permissions/, method: 'GET', handler: mockGetRolePermissions },
    { pattern: /\/api\/v1\/role-permissions/, method: 'GET', handler: mockGetRolePermissions },
    { pattern: /\/api\/role-permissions/, method: 'GET', handler: mockGetRolePermissions },
    
    // 卡片列表
    { pattern: /\/data\/api\/v1\/data\/vital-focus\/cards/, method: 'GET', handler: mockGetCards },
    { pattern: /\/api\/v1\/monitors\/cards$/, method: 'GET', handler: mockGetCards },
    { pattern: /\/monitors\/api\/v1\/cards$/, method: 'GET', handler: mockGetCards },
    { pattern: /\/api\/monitors\/cards$/, method: 'GET', handler: mockGetCards },
    { pattern: /\/api\/cards$/, method: 'GET', handler: mockGetCards },
    
    // 卡片详情
    { pattern: /\/api\/v1\/monitors\/cards\/\w+/, method: 'GET', handler: mockGetCardDetail },
    { pattern: /\/api\/cards\/\w+/, method: 'GET', handler: mockGetCardDetail },
    
    // 报警
    { pattern: /\/api\/alarms/, method: 'GET', handler: mockGetAlarms },
    { pattern: /\/api\/alarm\/list/, method: 'GET', handler: mockGetAlarms },
    { pattern: /\/api\/alarm\/resolve/, method: 'POST', handler: mockResolveAlarm }
  ]
  
  for (const route of routes) {
    if (route.method === method && route.pattern.test(url)) {
      return route.handler
    }
  }
  
  return null
}

// 创建Mock适配器
export const createMockAdapter = (): AxiosAdapter => {
  const adapter: AxiosAdapter = async (config: any) => {
    const method = (config.method || 'GET').toUpperCase()
    const url = config.url || ''
    
    // 检查是否匹配Mock路由
    const handler = matchMockRoute(method, url)
    
    if (handler) {
      console.log(`🎯 Mock拦截: ${method} ${url}`)
      
      try {
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        
        let mockData
        
        if (method === 'POST' || method === 'PUT') {
          // POST/PUT请求可能使用data（body）或params（query）
          // 优先使用data，如果没有则使用params
          let requestData = {}
          
          if (config.data) {
            // body数据
            requestData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
          } else if (config.params) {
            // query参数
            requestData = config.params
          }
          
          console.log('📦 POST请求数据:', requestData)
          mockData = await handler(requestData)
        } else if (method === 'GET') {
          // GET请求传递params和路径参数
          const pathMatch = url.match(/\/([^/?]+)(?:\?|$)/)
          const id = pathMatch && pathMatch[1] !== 'api' && pathMatch[1] !== 'v1' ? pathMatch[1] : undefined
          mockData = await handler(config.params, id)
        } else {
          mockData = await handler()
        }
        
        console.log(`✅ Mock响应: ${method} ${url}`)
        
        // 返回标准Axios响应
        return Promise.resolve({
          data: mockData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config,
          request: {}
        })
        
      } catch (error: any) {
        console.error(`❌ Mock错误: ${method} ${url}`, error)
        
        // 返回错误响应
        return Promise.reject({
          data: { message: error.message || 'Mock error' },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: config,
          request: {},
          message: error.message
        })
      }
    }
    
    // 非Mock路由，使用自定义xhr适配器
    const xhrAdapter = createXhrAdapter()
    return xhrAdapter(config)
  }
  
  return adapter
}

// 注意：不再需要setupMockInterceptor函数
// Mock适配器在VAxios实例创建时直接注入（见 src/utils/http/axios/index.ts）
