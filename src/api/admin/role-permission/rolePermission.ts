/**
 * Role Permission API interface definition
 * Backend API calls related to role permission management
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
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

/**
 * @description: Get role permission list
 * @param params - Query parameters (supports multiple filter conditions)
 * @param mode - Error message mode
 */
export function getRolePermissionsApi(
  params?: GetRolePermissionsParams,
  mode: ErrorMessageMode = 'modal',
) {
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
  return defHttp.get<GetResourceTypesResult>(
    {
      url: Api.GetResourceTypes,
    },
    {
      errorMessageMode: mode,
    },
  )
}
