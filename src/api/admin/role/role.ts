/**
 * Role API interface definition
 * Backend API calls related to role management
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

// Define API path enum
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
 * @description: Get role list
 * @param params - Query parameters (optional search keyword)
 * @param mode - Error message mode
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
 * @description: Create role
 * @param params - Create role parameters
 * @param mode - Error message mode
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
 * @description: Update role
 * @param roleId - Role ID
 * @param params - Update role parameters
 * @param mode - Error message mode
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
 * @description: Delete role
 * @param roleId - Role ID
 * @param mode - Error message mode
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
 * @description: Update role status (enable/disable)
 * @param roleId - Role ID
 * @param params - Update status parameters
 * @param mode - Error message mode
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

