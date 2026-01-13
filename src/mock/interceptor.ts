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
  mockGetResident,
  mockGetServiceLevels,
  mockGetRolePermissions,
  mockGetAlarmEvents,
  mockGetAlarmCloudConfig,
  mockGetCardOverview,
  mockGetBuildings,
  mockGetBranches,
  mockGetAllUnits,
  mockGetRooms,
  mockGetDevices,
  mockGetUsers,
  mockGetUser,
  mockGetTags,
  mockGetBranchTags,
  mockGetRoles,
  // CRUD 操作
  mockCreateResident,
  mockUpdateResident,
  mockDeleteResident,
  mockUpdateDevice,
  mockDeleteDevice,
  mockCreateUser,
  mockUpdateUser,
  mockDeleteUser,
  mockHandleAlarmEvent,
  mockUpdateAlarmCloudConfig,
  mockCreateTag,
  mockUpdateTag,
  mockDeleteTag,
  mockCreateBuilding,
  mockUpdateBuilding,
  mockDeleteBuilding
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
    
    // ==================== 居民管理 ====================
    // GET - 居民列表
    { pattern: /\/admin\/api\/v1\/residents(?:\?|$)/, method: 'GET', handler: mockGetResidents },
    { pattern: /\/api\/v1\/residents(?:\?|$)/, method: 'GET', handler: mockGetResidents },
    { pattern: /\/api\/residents(?:\?|$)/, method: 'GET', handler: mockGetResidents },
    
    // GET - 单个居民详情
    { pattern: /\/admin\/api\/v1\/residents\/[^/?]+$/, method: 'GET', handler: mockGetResident },
    { pattern: /\/api\/v1\/residents\/[^/?]+$/, method: 'GET', handler: mockGetResident },
    { pattern: /\/api\/residents\/[^/?]+$/, method: 'GET', handler: mockGetResident },
    
    // GET - 服务级别
    { pattern: /\/admin\/api\/v1\/service-levels/, method: 'GET', handler: mockGetServiceLevels },
    { pattern: /\/api\/v1\/service-levels/, method: 'GET', handler: mockGetServiceLevels },
    
    // POST - 创建居民
    { pattern: /\/admin\/api\/v1\/residents$/, method: 'POST', handler: mockCreateResident },
    { pattern: /\/api\/v1\/residents$/, method: 'POST', handler: mockCreateResident },
    { pattern: /\/api\/residents$/, method: 'POST', handler: mockCreateResident },
    
    // PUT - 更新居民
    { pattern: /\/admin\/api\/v1\/residents\/[^/?]+/, method: 'PUT', handler: mockUpdateResident },
    { pattern: /\/api\/v1\/residents\/[^/?]+/, method: 'PUT', handler: mockUpdateResident },
    { pattern: /\/api\/residents\/[^/?]+/, method: 'PUT', handler: mockUpdateResident },
    
    // DELETE - 删除居民
    { pattern: /\/admin\/api\/v1\/residents\/[^/?]+/, method: 'DELETE', handler: mockDeleteResident },
    { pattern: /\/api\/v1\/residents\/[^/?]+/, method: 'DELETE', handler: mockDeleteResident },
    { pattern: /\/api\/residents\/[^/?]+/, method: 'DELETE', handler: mockDeleteResident },
    
    // ==================== 设备管理 ====================
    // GET - 设备列表
    { pattern: /\/admin\/api\/v1\/devices(?:\?|$)/, method: 'GET', handler: mockGetDevices },
    { pattern: /\/device\/api\/v1\/devices(?:\?|$)/, method: 'GET', handler: mockGetDevices },
    { pattern: /\/api\/v1\/devices(?:\?|$)/, method: 'GET', handler: mockGetDevices },
    { pattern: /\/api\/devices(?:\?|$)/, method: 'GET', handler: mockGetDevices },
    
    // PUT - 更新设备
    { pattern: /\/admin\/api\/v1\/devices\/[^/?]+/, method: 'PUT', handler: mockUpdateDevice },
    { pattern: /\/device\/api\/v1\/devices\/[^/?]+/, method: 'PUT', handler: mockUpdateDevice },
    { pattern: /\/api\/v1\/devices\/[^/?]+/, method: 'PUT', handler: mockUpdateDevice },
    { pattern: /\/api\/devices\/[^/?]+/, method: 'PUT', handler: mockUpdateDevice },
    
    // DELETE - 删除设备
    { pattern: /\/admin\/api\/v1\/devices\/[^/?]+/, method: 'DELETE', handler: mockDeleteDevice },
    { pattern: /\/device\/api\/v1\/devices\/[^/?]+/, method: 'DELETE', handler: mockDeleteDevice },
    { pattern: /\/api\/v1\/devices\/[^/?]+/, method: 'DELETE', handler: mockDeleteDevice },
    { pattern: /\/api\/devices\/[^/?]+/, method: 'DELETE', handler: mockDeleteDevice },
    
    // ==================== 用户管理 ====================
    // GET - 用户详情（必须在列表路由之前，更具体的匹配）
    { pattern: /\/admin\/api\/v1\/users\/[^/?]+(?:\?|$)/, method: 'GET', handler: (params: any, userId: string) => {
      return mockGetUser(userId)
    }},
    { pattern: /\/api\/v1\/users\/[^/?]+(?:\?|$)/, method: 'GET', handler: (params: any, userId: string) => {
      return mockGetUser(userId)
    }},
    { pattern: /\/api\/users\/[^/?]+(?:\?|$)/, method: 'GET', handler: (params: any, userId: string) => {
      return mockGetUser(userId)
    }},
    
    // GET - 用户列表
    { pattern: /\/admin\/api\/v1\/users(?:\?|$)/, method: 'GET', handler: mockGetUsers },
    { pattern: /\/api\/v1\/users(?:\?|$)/, method: 'GET', handler: mockGetUsers },
    { pattern: /\/api\/users(?:\?|$)/, method: 'GET', handler: mockGetUsers },
    
    // POST - 创建用户
    { pattern: /\/admin\/api\/v1\/users$/, method: 'POST', handler: mockCreateUser },
    { pattern: /\/api\/v1\/users$/, method: 'POST', handler: mockCreateUser },
    { pattern: /\/api\/users$/, method: 'POST', handler: mockCreateUser },
    
    // PUT - 更新用户
    { pattern: /\/admin\/api\/v1\/users\/[^/?]+/, method: 'PUT', handler: mockUpdateUser },
    { pattern: /\/api\/v1\/users\/[^/?]+/, method: 'PUT', handler: mockUpdateUser },
    { pattern: /\/api\/users\/[^/?]+/, method: 'PUT', handler: mockUpdateUser },
    
    // DELETE - 删除用户
    { pattern: /\/admin\/api\/v1\/users\/[^/?]+/, method: 'DELETE', handler: mockDeleteUser },
    { pattern: /\/api\/v1\/users\/[^/?]+/, method: 'DELETE', handler: mockDeleteUser },
    { pattern: /\/api\/users\/[^/?]+/, method: 'DELETE', handler: mockDeleteUser },
    
    // ==================== 报警管理 ====================
    // GET - 报警记录
    { pattern: /\/admin\/api\/v1\/alarm-events/, method: 'GET', handler: mockGetAlarmEvents },
    { pattern: /\/alarm\/api\/v1\/events/, method: 'GET', handler: mockGetAlarmEvents },
    { pattern: /\/api\/v1\/alarm\/events/, method: 'GET', handler: mockGetAlarmEvents },
    { pattern: /\/api\/alarm\/events/, method: 'GET', handler: mockGetAlarmEvents },
    { pattern: /\/alarm\/events/, method: 'GET', handler: mockGetAlarmEvents },
    { pattern: /\/alarm\/history/, method: 'GET', handler: mockGetAlarmEvents },
    
    // POST - 处理报警（确认/解决）
    { pattern: /\/admin\/api\/v1\/alarm-events\/[^/?]+\/handle/, method: 'POST', handler: mockHandleAlarmEvent },
    { pattern: /\/alarm\/api\/v1\/events\/[^/?]+\/handle/, method: 'POST', handler: mockHandleAlarmEvent },
    { pattern: /\/api\/alarm\/events\/[^/?]+\/handle/, method: 'POST', handler: mockHandleAlarmEvent },
    
    // GET - 报警云配置
    { pattern: /\/admin\/api\/v1\/alarm-cloud/, method: 'GET', handler: mockGetAlarmCloudConfig },
    { pattern: /\/alarm\/api\/v1\/cloud/, method: 'GET', handler: mockGetAlarmCloudConfig },
    { pattern: /\/api\/v1\/alarm\/cloud/, method: 'GET', handler: mockGetAlarmCloudConfig },
    { pattern: /\/api\/alarm\/cloud/, method: 'GET', handler: mockGetAlarmCloudConfig },
    { pattern: /\/alarm\/cloud/, method: 'GET', handler: mockGetAlarmCloudConfig },
    
    // PUT - 更新报警云配置 (支持带ID和不带ID两种方式)
    { pattern: /\/admin\/api\/v1\/alarm-cloud$/, method: 'PUT', handler: mockUpdateAlarmCloudConfig },
    { pattern: /\/admin\/api\/v1\/alarm-cloud\/[^/?]+/, method: 'PUT', handler: mockUpdateAlarmCloudConfig },
    { pattern: /\/alarm\/api\/v1\/cloud$/, method: 'PUT', handler: mockUpdateAlarmCloudConfig },
    { pattern: /\/alarm\/api\/v1\/cloud\/[^/?]+/, method: 'PUT', handler: mockUpdateAlarmCloudConfig },
    { pattern: /\/api\/alarm\/cloud$/, method: 'PUT', handler: mockUpdateAlarmCloudConfig },
    { pattern: /\/api\/alarm\/cloud\/[^/?]+/, method: 'PUT', handler: mockUpdateAlarmCloudConfig },
    
    // ==================== 标签管理 ====================
    // GET - 标签列表
    { pattern: /\/admin\/api\/v1\/tags(?:\?|$)/, method: 'GET', handler: mockGetTags },
    { pattern: /\/api\/v1\/tags(?:\?|$)/, method: 'GET', handler: mockGetTags },
    { pattern: /\/api\/tags(?:\?|$)/, method: 'GET', handler: mockGetTags },
    
    // POST - 创建标签
    { pattern: /\/admin\/api\/v1\/tags$/, method: 'POST', handler: mockCreateTag },
    { pattern: /\/api\/v1\/tags$/, method: 'POST', handler: mockCreateTag },
    { pattern: /\/api\/tags$/, method: 'POST', handler: mockCreateTag },
    
    // PUT - 更新标签
    { pattern: /\/admin\/api\/v1\/tags\/[^/?]+/, method: 'PUT', handler: mockUpdateTag },
    { pattern: /\/api\/v1\/tags\/[^/?]+/, method: 'PUT', handler: mockUpdateTag },
    { pattern: /\/api\/tags\/[^/?]+/, method: 'PUT', handler: mockUpdateTag },
    
    // DELETE - 删除标签
    { pattern: /\/admin\/api\/v1\/tags\/[^/?]+/, method: 'DELETE', handler: mockDeleteTag },
    { pattern: /\/api\/v1\/tags\/[^/?]+/, method: 'DELETE', handler: mockDeleteTag },
    { pattern: /\/api\/tags\/[^/?]+/, method: 'DELETE', handler: mockDeleteTag },
    
    // ==================== 建筑管理 ====================
    // GET - 建筑列表
    { pattern: /\/admin\/api\/v1\/buildings(?:\?|$)/, method: 'GET', handler: mockGetBuildings },
    { pattern: /\/api\/v1\/buildings(?:\?|$)/, method: 'GET', handler: mockGetBuildings },
    { pattern: /\/api\/buildings(?:\?|$)/, method: 'GET', handler: mockGetBuildings },
    
    // POST - 创建建筑
    { pattern: /\/admin\/api\/v1\/buildings$/, method: 'POST', handler: mockCreateBuilding },
    { pattern: /\/api\/v1\/buildings$/, method: 'POST', handler: mockCreateBuilding },
    { pattern: /\/api\/buildings$/, method: 'POST', handler: mockCreateBuilding },
    
    // PUT - 更新建筑
    { pattern: /\/admin\/api\/v1\/buildings\/[^/?]+/, method: 'PUT', handler: mockUpdateBuilding },
    { pattern: /\/api\/v1\/buildings\/[^/?]+/, method: 'PUT', handler: mockUpdateBuilding },
    { pattern: /\/api\/buildings\/[^/?]+/, method: 'PUT', handler: mockUpdateBuilding },
    
    // DELETE - 删除建筑
    { pattern: /\/admin\/api\/v1\/buildings\/[^/?]+/, method: 'DELETE', handler: mockDeleteBuilding },
    { pattern: /\/api\/v1\/buildings\/[^/?]+/, method: 'DELETE', handler: mockDeleteBuilding },
    { pattern: /\/api\/buildings\/[^/?]+/, method: 'DELETE', handler: mockDeleteBuilding },
    
    // ==================== 其他 GET 接口 ====================
    
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
    
    // 房间
    { pattern: /\/admin\/api\/v1\/rooms/, method: 'GET', handler: mockGetRooms },
    { pattern: /\/api\/v1\/rooms/, method: 'GET', handler: mockGetRooms },
    { pattern: /\/api\/rooms/, method: 'GET', handler: mockGetRooms },
    
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
        
        // 从URL中提取ID（用于PUT/DELETE请求）
        // 匹配形如 /api/v1/resource/123 或 /api/resource/abc-123
        const idMatch = url.match(/\/([^/?]+)(?:\?|$)/)
        const segments = url.split('/').filter(s => s && s !== 'api' && s !== 'v1' && s !== 'admin' && s !== 'alarm' && s !== 'device' && s !== 'data' && s !== 'monitors')
        const resourceId = segments.length > 1 ? segments[segments.length - 1] : undefined
        
        if (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH') {
          // POST/PUT/DELETE请求可能使用data（body）或params（query）
          let requestData = {}
          
          if (config.data) {
            // body数据
            requestData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
          } else if (config.params) {
            // query参数
            requestData = config.params
          }
          
          console.log(`📦 ${method}请求数据:`, requestData, 'ID:', resourceId)
          
          // 传递请求数据和ID
          mockData = await handler(requestData, resourceId)
        } else if (method === 'GET') {
          // GET请求传递params和路径参数
          mockData = await handler(config.params, resourceId)
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
