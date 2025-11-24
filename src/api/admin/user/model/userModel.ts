/**
 * User API 数据模型定义
 * 对应 owlRD/db/03_users.sql 中的 users 表结构
 * 
 * Note: All field names use snake_case to match database schema (PostgreSQL standard)
 */

/**
 * 用户数据模型
 */
export interface User {
  user_id: string
  tenant_id: string
  user_account: string
  nickname?: string
  email?: string
  phone?: string
  role: string
  status: 'active' | 'disabled' | 'left'
  alarm_levels?: string[]
  alarm_channels?: string[]
  alarm_scope?: 'ALL' | 'LOCATION-TAG' | 'ASSIGNED_ONLY'
  last_login_at?: string // ISO 8601 格式的时间字符串
  tags?: string[] // JSONB 字段，存储为字符串数组
  preferences?: Record<string, any> // JSONB 字段
}

/**
 * 获取用户列表请求参数
 */
export interface GetUsersParams {
  search?: string // 搜索关键词（可选，用于搜索 user_account、nickname、email、phone）
}

/**
 * 获取用户列表响应
 */
export interface GetUsersResult {
  items: User[]
  total: number
}

/**
 * 创建用户请求参数
 */
export interface CreateUserParams {
  user_account: string
  nickname?: string
  email?: string
  phone?: string
  role: string
  password: string // 创建时必填
  alarm_levels?: string[]
  alarm_channels?: string[]
  alarm_scope?: 'ALL' | 'LOCATION-TAG' | 'ASSIGNED_ONLY'
  tags?: string[]
}

/**
 * 创建用户响应
 */
export interface CreateUserResult {
  user_id: string
}

/**
 * 更新用户请求参数
 * 用于编辑、删除、禁用操作
 */
export interface UpdateUserParams {
  nickname?: string
  email?: string
  phone?: string
  role?: string
  status?: 'active' | 'disabled' | 'left'
  alarm_levels?: string[]
  alarm_channels?: string[]
  alarm_scope?: 'ALL' | 'LOCATION-TAG' | 'ASSIGNED_ONLY'
  tags?: string[]
  _delete?: boolean // 删除时使用（true：删除）
}

/**
 * 重置密码请求参数
 */
export interface ResetPasswordParams {
  user_id: string
  new_password: string
}

/**
 * 重置密码响应
 */
export interface ResetPasswordResult {
  success: boolean
  message: string
}

