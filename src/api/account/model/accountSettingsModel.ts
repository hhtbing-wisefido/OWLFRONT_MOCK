/**
 * AccountSettings API Model
 * Unified interface for all user types (staff, resident, contact)
 */

/**
 * 账户设置响应（统一结构，适用于所有用户类型）
 */
export interface AccountSettings {
  // 账户标识
  id: string                    // UUID: account_id (user_id, resident_id, 或 contact_id)
  account?: string              // staff: user_account, resident: resident_account
  nickname: string              // 昵称（所有类型都有）
  email?: string                // 邮箱（可选）
  phone?: string                // 电话（可选）
  
  // 保存标志（所有角色均有）
  save_email?: boolean          // 是否保存 email 明文（user 一直是 true，resident 根据设置）
  save_phone?: boolean          // 是否保存 phone 明文（user 一直是 true，resident 根据设置）
  
  // 角色（用于判断使用哪种表）
  role: string                  // 角色代码：'Admin' | 'Nurse' | 'Caregiver' | 'IT' | 'Manager' | 'Resident' | 'Family'
}

/**
 * 更新账户设置参数（统一结构）
 */
export interface UpdateAccountSettingsParams {
  password_hash?: string         // 密码 hash（可选，64 字符 hex 字符串）
  email?: string | null          // 邮箱（null 表示删除，空字符串也表示删除）
  email_hash?: string            // 邮箱 hash（前端计算的 hex 字符串）
  phone?: string | null          // 电话（null 表示删除，空字符串也表示删除）
  phone_hash?: string            // 电话 hash（前端计算的 hex 字符串）
  
  // 保存标志（所有角色均有，但 user 和 contact 总是 true）
  save_email?: boolean          // 是否保存 email 明文（user 和 contact 总是 true，resident 根据用户选择）
  save_phone?: boolean          // 是否保存 phone 明文（user 和 contact 总是 true，resident 根据用户选择）
}

/**
 * 更新账户设置响应（统一结构）
 */
export interface UpdateAccountSettingsResponse {
  success: boolean               // 是否成功
  message?: string               // 消息（可选）
}

