/**
 * User API interface definition
 * Backend API calls related to user management
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  User,
  GetUsersParams,
  GetUsersResult,
  CreateUserParams,
  CreateUserResult,
  UpdateUserParams,
  ResetPasswordParams,
  ResetPasswordResult,
  ResetPinParams,
  ResetPinResult,
} from './model/userModel'

// Export User type for use by other modules
export type { User } from './model/userModel'

// Define API path enum
export enum Api {
  GetList = '/admin/api/v1/users',
  Create = '/admin/api/v1/users',
  Update = '/admin/api/v1/users/:id',
  Delete = '/admin/api/v1/users/:id',
  ResetPassword = '/admin/api/v1/users/:id/reset-password',
  ResetPin = '/admin/api/v1/users/:id/reset-pin',
  GetAccountSettings = '/admin/api/v1/users/:id/account-settings',
  UpdateAccountSettings = '/admin/api/v1/users/:id/account-settings',
}

// Mock mode: In development, use mock data instead of real API calls
// DEV 默认走真实后端；只有显式设置 VITE_USE_MOCK='true' 才启用 mock
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

// Display mock status in console
if (useMock) {
  console.log('%c[Mock] User API Mock enabled - Using test data', 'color: #52c41a; font-weight: bold')
}

/**
 * @description: Get user list
 * @param params - Query parameters
 * @param mode - Error message mode
 */
export function getUsersApi(params?: GetUsersParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.get<GetUsersResult>(
    {
      url: Api.GetList,
      params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Create user
 * @param params - Create user parameters
 * @param mode - Error message mode
 */
export function createUserApi(params: CreateUserParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  return defHttp.post<CreateUserResult>(
    {
      url: Api.Create,
      data: params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Update user
 * @param userId - User ID
 * @param params - Update user parameters
 * @param mode - Error message mode
 */
export function updateUserApi(userId: string, params: UpdateUserParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  return defHttp.put<{ success: boolean }>(
    {
      url: Api.Update.replace(':id', userId),
      data: params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Delete user
 * @param userId - User ID
 * @param mode - Error message mode
 */
export function deleteUserApi(userId: string, mode: ErrorMessageMode = 'modal') {
  return updateUserApi(userId, { _delete: true }, mode)
}

/**
 * @description: Get user detail
 * @param userId - User ID
 * @param mode - Error message mode
 */
export function getUserApi(userId: string, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  return defHttp.get<User>(
    {
      url: Api.Update.replace(':id', userId),
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Reset password
 * @param userId - User ID
 * @param params - Reset password parameters
 * @param mode - Error message mode
 */
export function resetPasswordApi(userId: string, params: Omit<ResetPasswordParams, 'user_id'>, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  return defHttp.post<ResetPasswordResult>(
    {
      url: Api.ResetPassword.replace(':id', userId),
      data: params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Reset PIN
 * @param userId - User ID
 * @param params - Reset PIN parameters
 * @param mode - Error message mode
 */
export function resetPinApi(userId: string, params: Omit<ResetPinParams, 'user_id'>, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  return defHttp.post<ResetPinResult>(
    {
      url: Api.ResetPin.replace(':id', userId),
      data: params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @deprecated 已迁移到 /api/account/accountSettings.ts
 * 此函数仅 Sidebar.vue 使用，Sidebar 迁移到新 API 后将被删除
 * 
 * @description: Get account settings
 * @param userId - User ID
 * @param mode - Error message mode
 */
/*
export function getAccountSettingsApi(userId: string, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  return defHttp.get<{
    user_account: string
    nickname: string
    email?: string
    phone?: string
  }>(
    {
      url: Api.GetAccountSettings.replace(':id', userId),
    },
    { errorMessageMode: mode },
  )
}
*/

/**
 * @deprecated 已迁移到 /api/account/accountSettings.ts
 * 此函数仅 Sidebar.vue 使用，Sidebar 迁移到新 API 后将被删除
 * 
 * @description: Update account settings (unified API)
 * @param userId - User ID
 * @param params - Update account settings parameters
 * @param mode - Error message mode
 */
/*
export function updateAccountSettingsApi(
  userId: string,
  params: {
    password_hash?: string
    email?: string | null
    email_hash?: string
    phone?: string | null
    phone_hash?: string
  },
  mode: ErrorMessageMode = 'modal',
) {
  // In development with mock enabled, return mock data directly
  return defHttp.put<{ success: boolean; message?: string }>(
    {
      url: Api.UpdateAccountSettings.replace(':id', userId),
      data: params,
    },
    { errorMessageMode: mode },
  )
}
*/

