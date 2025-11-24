/**
 * User API 接口定义
 * 用户管理相关的后端API调用
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

// 导出 User 类型供其他模块使用
export type { User } from './model/userModel'

// 定义 API 路径枚举
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
 * @description: 获取用户列表
 * @param params - 查询参数（可选搜索关键词）
 * @param mode - 错误消息模式
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
 * @description: 创建用户
 * @param params - 创建用户参数
 * @param mode - 错误消息模式
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
 * @description: 更新用户
 * @param userId - 用户 ID
 * @param params - 更新用户参数
 * @param mode - 错误消息模式
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
 * @description: 删除用户
 * @param userId - 用户 ID
 * @param mode - 错误消息模式
 */
export function deleteUserApi(userId: string, mode: ErrorMessageMode = 'modal') {
  return updateUserApi(userId, { _delete: true }, mode)
}

/**
 * @description: 获取用户详情
 * @param userId - 用户 ID
 * @param mode - 错误消息模式
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
 * @description: 重置密码
 * @param userId - 用户 ID
 * @param params - 重置密码参数
 * @param mode - 错误消息模式
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

