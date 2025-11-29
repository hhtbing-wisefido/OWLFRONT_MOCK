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
}

// Mock mode: In development, use mock data instead of real API calls
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

// Display mock status in console
if (useMock) {
  console.log('%c[Mock] User API Mock enabled - Using test data', 'color: #52c41a; font-weight: bold')
}

/**
 * @description: Get user list
 * @param params - Query parameters (optional search keyword)
 * @param mode - Error message mode
 */
export function getUsersApi(params?: GetUsersParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ users }) => {
      console.log('%c[Mock] Get Users API Request', 'color: #1890ff; font-weight: bold', { params })
      return users.mockGetUsers(params).then((result) => {
        console.log('%c[Mock] Get Users API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Get Users API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
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
  if (useMock) {
    return import('@test/index').then(({ users }) => {
      console.log('%c[Mock] Create User API Request', 'color: #1890ff; font-weight: bold', { params })
      return users.mockCreateUser(params).then((result) => {
        console.log('%c[Mock] Create User API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Create User API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
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
  if (useMock) {
    return import('@test/index').then(({ users }) => {
      console.log('%c[Mock] Update User API Request', 'color: #1890ff; font-weight: bold', { userId, params })
      return users.mockUpdateUser(userId, params).then((result) => {
        console.log('%c[Mock] Update User API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Update User API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
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
  if (useMock) {
    return import('@test/index').then(({ users }) => {
      console.log('%c[Mock] Get User API Request', 'color: #1890ff; font-weight: bold', { userId })
      return users.mockGetUser(userId).then((result) => {
        console.log('%c[Mock] Get User API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Get User API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
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
  if (useMock) {
    return import('@test/index').then(({ users }) => {
      console.log('%c[Mock] Reset Password API Request', 'color: #1890ff; font-weight: bold', { userId, params })
      return users.mockResetPassword(userId, params).then((result) => {
        console.log('%c[Mock] Reset Password API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Reset Password API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  return defHttp.post<ResetPasswordResult>(
    {
      url: Api.ResetPassword.replace(':id', userId),
      data: params,
    },
    { errorMessageMode: mode },
  )
}

