/**
 * Users API Mock 函数
 * 对应 src/api/admin/user/user.ts
 * 用于开发环境模拟后端 API 响应
 */

import type {
  GetUsersParams,
  GetUsersResult,
  CreateUserParams,
  CreateUserResult,
  UpdateUserParams,
  ResetPasswordParams,
  ResetPasswordResult,
  User,
} from '@/api/admin/user/model/userModel'
import { mockUsersData } from './data'
import { delay } from '../../utils/generator'

// 模拟内存存储（用于模拟创建、更新、删除操作）
let usersStore: User[] = [...mockUsersData]
let nextUserId = 7 // 下一个可用的用户ID

/**
 * Mock: 获取用户列表
 * 对应 getUsersApi
 */
export async function mockGetUsers(params?: GetUsersParams): Promise<GetUsersResult> {
  // 模拟网络延迟
  await delay(300)

  let filteredUsers = [...usersStore]

  // 如果有搜索关键词，进行过滤
  if (params?.search && params.search.trim()) {
    const searchLower = params.search.toLowerCase().trim()
    filteredUsers = usersStore.filter((user) => {
      return (
        user.user_account.toLowerCase().includes(searchLower) ||
        (user.nickname && user.nickname.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower))
      )
    })
  }

  return {
    items: filteredUsers,
    total: filteredUsers.length,
  }
}

/**
 * Mock: 创建用户
 * 对应 createUserApi
 */
export async function mockCreateUser(params: CreateUserParams): Promise<CreateUserResult> {
  // 模拟网络延迟
  await delay(500)

  // 检查 user_account 是否已存在（在同一租户内）
  const existingUser = usersStore.find(
    (u) => u.user_account.toLowerCase() === params.user_account.toLowerCase()
  )
  if (existingUser) {
    throw new Error('User account already exists')
  }

  // 创建新用户
  const newUser: User = {
    user_id: String(nextUserId++),
    tenant_id: '550e8400-e29b-41d4-a716-446655440000', // 使用当前租户ID
    user_account: params.user_account.toLowerCase(),
    nickname: params.nickname,
    email: params.email,
    phone: params.phone,
    role: params.role,
    status: 'active',
    alarm_levels: params.alarm_levels || [],
    alarm_channels: params.alarm_channels || [],
    alarm_scope: params.alarm_scope || 'ALL',
    tags: params.tags || [],
    last_login_at: undefined,
  }

  usersStore.push(newUser)

  return {
    user_id: newUser.user_id,
  }
}

/**
 * Mock: 更新用户
 * 对应 updateUserApi
 */
export async function mockUpdateUser(userId: string, params: UpdateUserParams): Promise<{ success: boolean }> {
  // 模拟网络延迟
  await delay(400)

  const userIndex = usersStore.findIndex((u) => u.user_id === userId)
  if (userIndex === -1) {
    throw new Error('User not found')
  }

  // 如果是删除操作
  if (params._delete) {
    usersStore.splice(userIndex, 1)
    return { success: true }
  }

  // 更新用户信息
  const user = usersStore[userIndex]
  if (params.nickname !== undefined) user.nickname = params.nickname
  if (params.email !== undefined) user.email = params.email
  if (params.phone !== undefined) user.phone = params.phone
  if (params.role !== undefined) user.role = params.role
  if (params.status !== undefined) user.status = params.status
  if (params.alarm_levels !== undefined) user.alarm_levels = params.alarm_levels
  if (params.alarm_channels !== undefined) user.alarm_channels = params.alarm_channels
  if (params.alarm_scope !== undefined) user.alarm_scope = params.alarm_scope
  if (params.tags !== undefined) user.tags = params.tags

  return { success: true }
}

/**
 * Mock: 获取用户详情
 * 对应 getUserApi
 */
export async function mockGetUser(userId: string): Promise<User> {
  // 模拟网络延迟
  await delay(200)

  const user = usersStore.find((u) => u.user_id === userId)
  if (!user) {
    throw new Error('User not found')
  }

  return { ...user }
}

/**
 * Mock: 重置密码
 * 对应 resetPasswordApi
 */
export async function mockResetPassword(
  userId: string,
  params: Omit<ResetPasswordParams, 'user_id'>
): Promise<ResetPasswordResult> {
  // 模拟网络延迟
  await delay(400)

  const user = usersStore.find((u) => u.user_id === userId)
  if (!user) {
    throw new Error('User not found')
  }

  // 模拟密码重置（实际应该更新 password_hash，但这里是 Mock）
  return {
    success: true,
    message: 'Password reset successfully',
  }
}

