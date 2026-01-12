/**
 * Role Permission API interface definition
 * Backend API calls related to role permission management
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
  GetResourceTypesResult,
} from './model/rolePermissionModel'

// Define API path enum
export enum Api {
  GetList = '/admin/api/v1/role-permissions',
  Create = '/admin/api/v1/role-permissions',
  BatchCreate = '/admin/api/v1/role-permissions/batch',
  Update = '/admin/api/v1/role-permissions/:id',
  Delete = '/admin/api/v1/role-permissions/:id',
  UpdateStatus = '/admin/api/v1/role-permissions/:id/status',
  GetResourceTypes = '/admin/api/v1/role-permissions/resource-types',
}

// Mock mode: In development, use mock data instead of real API calls
// DEV 榛樿璧扮湡瀹炲悗绔紱鍙湁鏄惧紡璁剧疆 VITE_USE_MOCK='true' 鎵嶅惎鐢?mock
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

// Display mock status in console
if (useMock) {
  console.log(
    '%c[Mock] Role Permission API Mock enabled - Using test data',
    'color: #52c41a; font-weight: bold',
  )
}

/**
 * @description: Get role permission list
 * @param params - Query parameters (supports multiple filter conditions)
 * @param mode - Error message mode
 */
export function getRolePermissionsApi(
  params?: GetRolePermissionsParams,
  mode: ErrorMessageMode = 'modal',
) {
  // In development with mock enabled, return mock data directly
  console.log(
        '%c[Mock] Get Role Permissions API Request',
        'color: #1890ff; font-weight: bold',
        { params },
      )
      return rolePermissions.mock.mockGetRolePermissions(params).then((result) => {
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
 * @description: Create role permission
 * @param params - Create role permission parameters
 * @param mode - Error message mode
 */
export function createRolePermissionApi(
  params: CreateRolePermissionParams,
  mode: ErrorMessageMode = 'modal',
) {
  // In development with mock enabled, return mock data directly
  console.log(
        '%c[Mock] Create Role Permission API Request',
        'color: #1890ff; font-weight: bold',
        { params },
      )
      return rolePermissions.mock.mockCreateRolePermission(params).then((result) => {
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
 * @description: Batch create role permissions
 * @param params - Batch create role permissions parameters
 * @param mode - Error message mode
 */
export function batchCreateRolePermissionsApi(
  params: BatchCreateRolePermissionsParams,
  mode: ErrorMessageMode = 'modal',
) {
  // In development with mock enabled, return mock data directly
  console.log(
        '%c[Mock] Batch Create Role Permissions API Request',
        'color: #1890ff; font-weight: bold',
        { params },
      )
      return rolePermissions.mock.mockBatchCreateRolePermissions(params).then((result) => {
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
 * @description: Update role permission
 * @param permissionId - Permission ID
 * @param params - Update role permission parameters
 * @param mode - Error message mode
 */
export function updateRolePermissionApi(
  permissionId: string,
  params: UpdateRolePermissionParams,
  mode: ErrorMessageMode = 'modal',
) {
  // In development with mock enabled, return mock data directly
  console.log(
        '%c[Mock] Update Role Permission API Request',
        'color: #1890ff; font-weight: bold',
        { permissionId, params },
      )
      return rolePermissions.mock.mockUpdateRolePermission(permissionId, params).then((result) => {
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
 * @description: Delete role permission
 * @param permissionId - Permission ID
 * @param mode - Error message mode
 */
export function deleteRolePermissionApi(permissionId: string, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  console.log(
        '%c[Mock] Delete Role Permission API Request',
        'color: #1890ff; font-weight: bold',
        { permissionId },
      )
      return rolePermissions.mock.mockDeleteRolePermission(permissionId).then((result) => {
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
 * @description: Update role permission status (enable/disable)
 * @param permissionId - Permission ID
 * @param params - Update status parameters
 * @param mode - Error message mode
 */
export function changeRolePermissionStatusApi(
  permissionId: string,
  params: UpdateRolePermissionStatusParams,
  mode: ErrorMessageMode = 'modal',
) {
  // In development with mock enabled, return mock data directly
  console.log(
        '%c[Mock] Change Role Permission Status API Request',
        'color: #1890ff; font-weight: bold',
        { permissionId, params },
      )
      return rolePermissions.mock.mockChangeRolePermissionStatus(permissionId, params).then((result) => {
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

/**
 * @description: Get resource types list
 * @param mode - Error message mode
 */
export function getResourceTypesApi(mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  console.log(
        '%c[Mock] Get Resource Types API Request',
        'color: #1890ff; font-weight: bold',
      )
      return rolePermissions.mock.mockGetResourceTypes().then((result) => {
        console.log(
          '%c[Mock] Get Resource Types API - Success',
          'color: #52c41a; font-weight: bold',
          { result },
        )
        return result
      }).catch((error: any) => {
        console.log(
          '%c[Mock] Get Resource Types API - Failed',
          'color: #ff4d4f; font-weight: bold',
          { error: error.message },
        )
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.get<GetResourceTypesResult>(
    {
      url: Api.GetResourceTypes,
    },
    {
      errorMessageMode: mode,
    },
  )
}

