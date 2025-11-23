/**
 * Role Permission API 接口定义
 * 角色权限管理相关的后端API调用
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  RolePermission,
  GetRolePermissionsParams,
  GetRolePermissionsResult,
  CreateRolePermissionParams,
  CreateRolePermissionResult,
  BatchCreateRolePermissionsParams,
  UpdateRolePermissionParams,
  UpdateRolePermissionStatusParams,
} from './model/rolePermissionModel'

// 定义 API 路径枚举
export enum Api {
  GetList = '/admin/api/v1/role-permissions',
  Create = '/admin/api/v1/role-permissions',
  BatchCreate = '/admin/api/v1/role-permissions/batch',
  Update = '/admin/api/v1/role-permissions/:id',
  Delete = '/admin/api/v1/role-permissions/:id',
  UpdateStatus = '/admin/api/v1/role-permissions/:id/status',
}

// Mock mode: In development, use mock data instead of real API calls
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

// Display mock status in console
if (useMock) {
  console.log(
    '%c[Mock] Role Permission API Mock enabled - Using test data',
    'color: #52c41a; font-weight: bold',
  )
}

/**
 * @description: 获取角色权限列表
 * @param params - 查询参数（支持多种过滤条件）
 * @param mode - 错误消息模式
 */
export function getRolePermissionsApi(
  params?: GetRolePermissionsParams,
  mode: ErrorMessageMode = 'modal',
) {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ rolePermissions }) => {
      console.log(
        '%c[Mock] Get Role Permissions API Request',
        'color: #1890ff; font-weight: bold',
        { params },
      )
      return rolePermissions.mockGetRolePermissions(params).then((result) => {
        console.log(
          '%c[Mock] Get Role Permissions API - Success',
          'color: #52c41a; font-weight: bold',
          { result },
        )
        return result
      }).catch((error: any) => {
        console.log(
          '%c[Mock] Get Role Permissions API - Failed',
          'color: #ff4d4f; font-weight: bold',
          { error: error.message },
        )
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.get<GetRolePermissionsResult>(
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
 * @description: 创建角色权限
 * @param params - 创建角色权限参数
 * @param mode - 错误消息模式
 */
export function createRolePermissionApi(
  params: CreateRolePermissionParams,
  mode: ErrorMessageMode = 'modal',
) {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ rolePermissions }) => {
      console.log(
        '%c[Mock] Create Role Permission API Request',
        'color: #1890ff; font-weight: bold',
        { params },
      )
      return rolePermissions.mockCreateRolePermission(params).then((result) => {
        console.log(
          '%c[Mock] Create Role Permission API - Success',
          'color: #52c41a; font-weight: bold',
          { result },
        )
        return result
      }).catch((error: any) => {
        console.log(
          '%c[Mock] Create Role Permission API - Failed',
          'color: #ff4d4f; font-weight: bold',
          { error: error.message },
        )
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.post<CreateRolePermissionResult>(
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
 * @description: 批量创建角色权限
 * @param params - 批量创建角色权限参数
 * @param mode - 错误消息模式
 */
export function batchCreateRolePermissionsApi(
  params: BatchCreateRolePermissionsParams,
  mode: ErrorMessageMode = 'modal',
) {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ rolePermissions }) => {
      console.log(
        '%c[Mock] Batch Create Role Permissions API Request',
        'color: #1890ff; font-weight: bold',
        { params },
      )
      return rolePermissions.mockBatchCreateRolePermissions(params).then((result) => {
        console.log(
          '%c[Mock] Batch Create Role Permissions API - Success',
          'color: #52c41a; font-weight: bold',
          { result },
        )
        return result
      }).catch((error: any) => {
        console.log(
          '%c[Mock] Batch Create Role Permissions API - Failed',
          'color: #ff4d4f; font-weight: bold',
          { error: error.message },
        )
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.post<{ success_count: number; failed_count: number }>(
    {
      url: Api.BatchCreate,
      params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: 更新角色权限
 * @param permissionId - 权限ID
 * @param params - 更新角色权限参数
 * @param mode - 错误消息模式
 */
export function updateRolePermissionApi(
  permissionId: string,
  params: UpdateRolePermissionParams,
  mode: ErrorMessageMode = 'modal',
) {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ rolePermissions }) => {
      console.log(
        '%c[Mock] Update Role Permission API Request',
        'color: #1890ff; font-weight: bold',
        { permissionId, params },
      )
      return rolePermissions.mockUpdateRolePermission(permissionId, params).then((result) => {
        console.log(
          '%c[Mock] Update Role Permission API - Success',
          'color: #52c41a; font-weight: bold',
          { result },
        )
        return result
      }).catch((error: any) => {
        console.log(
          '%c[Mock] Update Role Permission API - Failed',
          'color: #ff4d4f; font-weight: bold',
          { error: error.message },
        )
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.put(
    {
      url: Api.Update.replace(':id', permissionId),
      params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: 删除角色权限
 * @param permissionId - 权限ID
 * @param mode - 错误消息模式
 */
export function deleteRolePermissionApi(permissionId: string, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ rolePermissions }) => {
      console.log(
        '%c[Mock] Delete Role Permission API Request',
        'color: #1890ff; font-weight: bold',
        { permissionId },
      )
      return rolePermissions.mockDeleteRolePermission(permissionId).then((result) => {
        console.log(
          '%c[Mock] Delete Role Permission API - Success',
          'color: #52c41a; font-weight: bold',
          { result },
        )
        return result
      }).catch((error: any) => {
        console.log(
          '%c[Mock] Delete Role Permission API - Failed',
          'color: #ff4d4f; font-weight: bold',
          { error: error.message },
        )
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.delete(
    {
      url: Api.Delete.replace(':id', permissionId),
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: 更新角色权限状态（启用/禁用）
 * @param permissionId - 权限ID
 * @param params - 更新状态参数
 * @param mode - 错误消息模式
 */
export function changeRolePermissionStatusApi(
  permissionId: string,
  params: UpdateRolePermissionStatusParams,
  mode: ErrorMessageMode = 'modal',
) {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ rolePermissions }) => {
      console.log(
        '%c[Mock] Change Role Permission Status API Request',
        'color: #1890ff; font-weight: bold',
        { permissionId, params },
      )
      return rolePermissions.mockChangeRolePermissionStatus(permissionId, params).then((result) => {
        console.log(
          '%c[Mock] Change Role Permission Status API - Success',
          'color: #52c41a; font-weight: bold',
          { result },
        )
        return result
      }).catch((error: any) => {
        console.log(
          '%c[Mock] Change Role Permission Status API - Failed',
          'color: #ff4d4f; font-weight: bold',
          { error: error.message },
        )
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.put(
    {
      url: Api.UpdateStatus.replace(':id', permissionId),
      params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

