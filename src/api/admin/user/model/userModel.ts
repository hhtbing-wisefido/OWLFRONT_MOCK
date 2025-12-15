/**
 * User API data model definition
 * Corresponds to users table structure in owlRD/db/03_users.sql
 * 
 * Note: All field names use snake_case to match database schema (PostgreSQL standard)
 */

/**
 * User data model
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
  alarm_scope?: 'ALL' | 'BRANCH' | 'ASSIGNED_ONLY' // BRANCH: filter by matching users.branch_tag = units.branch_tag
  last_login_at?: string // ISO 8601 format time string
  tags?: string[] // JSONB field, stored as string array
  branch_tag?: string // Branch tag for location filtering
  preferences?: Record<string, any> // JSONB field
}

/**
 * Get user list request parameters
 */
export interface GetUsersParams {
  search?: string // Search keyword (optional, for searching user_account, nickname, email, phone)
}

/**
 * Get user list response
 */
export interface GetUsersResult {
  items: User[]
  total: number
}

/**
 * Create user request parameters
 */
export interface CreateUserParams {
  user_account: string
  nickname?: string
  email?: string
  phone?: string
  role: string
  password: string // Required when creating
  alarm_levels?: string[]
  alarm_channels?: string[]
  alarm_scope?: 'ALL' | 'BRANCH' | 'ASSIGNED_ONLY' // BRANCH: filter by matching users.branch_tag = units.branch_tag
  tags?: string[]
  branch_tag?: string
}

/**
 * Create user response
 */
export interface CreateUserResult {
  user_id: string
}

/**
 * Update user request parameters
 * Used for edit, delete, disable operations
 */
export interface UpdateUserParams {
  nickname?: string
  email?: string
  phone?: string
  role?: string
  status?: 'active' | 'disabled' | 'left'
  alarm_levels?: string[]
  alarm_channels?: string[]
  alarm_scope?: 'ALL' | 'BRANCH' | 'ASSIGNED_ONLY' // BRANCH: filter by matching users.branch_tag = units.branch_tag
  tags?: string[]
  _delete?: boolean // Used when deleting (true: delete)
}

/**
 * Reset password request parameters
 */
export interface ResetPasswordParams {
  user_id: string
  new_password: string
}

/**
 * Reset password response
 */
export interface ResetPasswordResult {
  success: boolean
  message: string
}

/**
 * Reset PIN request parameters
 */
export interface ResetPinParams {
  user_id: string
  new_pin: string // 4-digit PIN code
}

/**
 * Reset PIN response
 */
export interface ResetPinResult {
  success: boolean
  message: string
}

