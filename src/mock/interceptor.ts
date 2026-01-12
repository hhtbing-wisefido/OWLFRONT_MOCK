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
  mockGetRolePermissions,
  mockGetAlarmEvents,
  mockGetAlarmCloudConfig,
  mockGetCardOverview,
  mockGetBranches,
  mockGetAllUnits,
  mockGetDevices,
  mockGetUsers,
  mockGetTags,
  mockGetBranchTags,
  mockGetRoles
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
    { pattern: /\/api\/alarm\/resolve/, method: 'POST', handler: mockResolveAlarm },
    
    // 报警记录/事件 - 注意：API定义使用alarm-events（带连字符）
    { pattern: /\/admin\/api\/v1\/alarm-events/, method: 'GET', handler: mockGetAlarmEvents },
    { pattern: /\/alarm\/api\/v1\/events/, method: 'GET', handler: mockGetAlarmEvents },
    { pattern: /\/api\/v1\/alarm\/events/, method: 'GET', handler: mockGetAlarmEvents },
    { pattern: /\/api\/alarm\/events/, method: 'GET', handler: mockGetAlarmEvents },
    { pattern: /\/alarm\/events/, method: 'GET', handler: mockGetAlarmEvents },
    { pattern: /\/alarm\/history/, method: 'GET', handler: mockGetAlarmEvents },
    
    // 报警云配置 - 注意：API定义使用alarm-cloud（带连字符）
    { pattern: /\/admin\/api\/v1\/alarm-cloud/, method: 'GET', handler: mockGetAlarmCloudConfig },
    { pattern: /\/alarm\/api\/v1\/cloud/, method: 'GET', handler: mockGetAlarmCloudConfig },
    { pattern: /\/api\/v1\/alarm\/cloud/, method: 'GET', handler: mockGetAlarmCloudConfig },
    { pattern: /\/api\/alarm\/cloud/, method: 'GET', handler: mockGetAlarmCloudConfig },
    { pattern: /\/alarm\/cloud/, method: 'GET', handler: mockGetAlarmCloudConfig },
    
    // 卡片概览
    { pattern: /\/admin\/api\/v1\/card-overview/, method: 'GET', handler: mockGetCardOverview },
    { pattern: /\/data\/api\/v1\/card-overview/, method: 'GET', handler: mockGetCardOverview },
    { pattern: /\/api\/v1\/card-overview/, method: 'GET', handler: mockGetCardOverview },
    { pattern: /\/api\/card-overview/, method: 'GET', handler: mockGetCardOverview },
    
    // 分支/单元
    { pattern: /\/admin\/api\/v1\/branches/, method: 'GET', handler: mockGetBranches },
    { pattern: /\/api\/v1\/branches/, method: 'GET', handler: mockGetBranches },
    { pattern: /\/api\/branches/, method: 'GET', handler: mockGetBranches },
    { pattern: /\/admin\/api\/v1\/units/, method: 'GET', handler: mockGetAllUnits },
    { pattern: /\/api\/v1\/units/, method: 'GET', handler: mockGetAllUnits },
    { pattern: /\/api\/units/, method: 'GET', handler: mockGetAllUnits },
    
    // 设备
    { pattern: /\/admin\/api\/v1\/devices/, method: 'GET', handler: mockGetDevices },
    { pattern: /\/device\/api\/v1\/devices/, method: 'GET', handler: mockGetDevices },
    { pattern: /\/api\/v1\/devices/, method: 'GET', handler: mockGetDevices },
    { pattern: /\/api\/devices/, method: 'GET', handler: mockGetDevices },
    
    // 用户管理
    { pattern: /\/admin\/api\/v1\/users/, method: 'GET', handler: mockGetUsers },
    { pattern: /\/api\/v1\/users/, method: 'GET', handler: mockGetUsers },
    { pattern: /\/api\/users/, method: 'GET', handler: mockGetUsers },
    
    // 标签
    { pattern: /\/admin\/api\/v1\/tags/, method: 'GET', handler: mockGetTags },
    { pattern: /\/api\/v1\/tags/, method: 'GET', handler: mockGetTags },
    { pattern: /\/api\/tags/, method: 'GET', handler: mockGetTags },
    
    // 分支标签
    { pattern: /\/admin\/api\/v1\/branch-tags/, method: 'GET', handler: mockGetBranchTags },
    { pattern: /\/api\/v1\/branch-tags/, method: 'GET', handler: mockGetBranchTags },
    { pattern: /\/api\/branch-tags/, method: 'GET', handler: mockGetBranchTags },
    
    // 角色
    { pattern: /\/admin\/api\/v1\/roles/, method: 'GET', handler: mockGetRoles },
    { pattern: /\/api\/v1\/roles/, method: 'GET', handler: mockGetRoles },
    { pattern: /\/api\/roles/, method: 'GET', handler: mockGetRoles }
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
