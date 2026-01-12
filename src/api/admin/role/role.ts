/**
 * Role API interface definition
 * Backend API calls related to role management
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
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
// DEV 默认走真实后端；只有显式设置 VITE_USE_MOCK='true' 才启用 mock
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

// Display mock status in console
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

