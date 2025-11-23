/**
 * Role API 接口定义
 * 角色管理相关的后端API调用
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  Role,
  GetRolesParams,
  GetRolesResult,
  CreateRoleParams,
  CreateRoleResult,
  UpdateRoleParams,
  UpdateRoleStatusParams,
} from './model/roleModel'

// 定义 API 路径枚举
export enum Api {
  GetList = '/admin/api/v1/roles',
  Create = '/admin/api/v1/roles',
  Update = '/admin/api/v1/roles/:id',
  Delete = '/admin/api/v1/roles/:id',
  UpdateStatus = '/admin/api/v1/roles/:id/status',
}

// Mock mode: In development, use mock data instead of real API calls
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

// Display mock status in console
if (useMock) {
  console.log('%c[Mock] Role API Mock enabled - Using test data', 'color: #52c41a; font-weight: bold')
}

/**
 * @description: 获取角色列表
 * @param params - 查询参数（可选搜索关键词）
 * @param mode - 错误消息模式
 */
export function getRolesApi(params?: GetRolesParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ roles }) => {
      console.log('%c[Mock] Get Roles API Request', 'color: #1890ff; font-weight: bold', { params })
      return roles.mockGetRoles(params).then((result) => {
        console.log('%c[Mock] Get Roles API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Get Roles API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.get<GetRolesResult>(
    {
      url: Api.GetList,
      params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: 创建角色
 * @param params - 创建角色参数
 * @param mode - 错误消息模式
 */
export function createRoleApi(params: CreateRoleParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ roles }) => {
      console.log('%c[Mock] Create Role API Request', 'color: #1890ff; font-weight: bold', { params })
      return roles.mockCreateRole(params).then((result) => {
        console.log('%c[Mock] Create Role API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Create Role API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.post<CreateRoleResult>(
    {
      url: Api.Create,
      params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: 更新角色
 * @param roleId - 角色ID
 * @param params - 更新角色参数
 * @param mode - 错误消息模式
 */
export function updateRoleApi(roleId: string, params: UpdateRoleParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ roles }) => {
      console.log('%c[Mock] Update Role API Request', 'color: #1890ff; font-weight: bold', { roleId, params })
      return roles.mockUpdateRole(roleId, params).then((result) => {
        console.log('%c[Mock] Update Role API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Update Role API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.put(
    {
      url: Api.Update.replace(':id', roleId),
      params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: 删除角色
 * @param roleId - 角色ID
 * @param mode - 错误消息模式
 */
export function deleteRoleApi(roleId: string, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ roles }) => {
      console.log('%c[Mock] Delete Role API Request', 'color: #1890ff; font-weight: bold', { roleId })
      return roles.mockDeleteRole(roleId).then((result) => {
        console.log('%c[Mock] Delete Role API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Delete Role API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.delete(
    {
      url: Api.Delete.replace(':id', roleId),
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: 更新角色状态（启用/禁用）
 * @param roleId - 角色ID
 * @param params - 更新状态参数
 * @param mode - 错误消息模式
 */
export function changeRoleStatusApi(roleId: string, params: UpdateRoleStatusParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ roles }) => {
      console.log('%c[Mock] Change Role Status API Request', 'color: #1890ff; font-weight: bold', { roleId, params })
      return roles.mockChangeRoleStatus(roleId, params).then((result) => {
        console.log('%c[Mock] Change Role Status API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Change Role Status API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.put(
    {
      url: Api.UpdateStatus.replace(':id', roleId),
      params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

