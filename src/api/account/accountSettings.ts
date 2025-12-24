/**
 * AccountSettings API
 * Unified API for all user types (staff, resident, contact)
 * Automatically routes to the correct backend path based on user role
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type { AccountSettings, UpdateAccountSettingsParams, UpdateAccountSettingsResponse } from './model/accountSettingsModel'
import { useUserStore } from '@/store/modules/user'

/**
 * API 路径枚举（3 组路径：user, resident, contact）
 */
enum ApiPath {
  // Staff 用户路径
  UserGet = '/admin/api/v1/users/:id/account-settings',
  UserUpdate = '/admin/api/v1/users/:id/account-settings',
  
  // Resident 用户路径
  ResidentGet = '/admin/api/v1/residents/:id/account-settings',
  ResidentUpdate = '/admin/api/v1/residents/:id/account-settings',
  
  // Contact 用户路径
  ContactGet = '/admin/api/v1/contacts/:id/account-settings',
  ContactUpdate = '/admin/api/v1/contacts/:id/account-settings',
}

/**
 * 判断是否为 Staff 角色
 */
function isStaffRole(role?: string): boolean {
  if (!role) return false
  const staffRoles = ['Admin', 'Nurse', 'Caregiver', 'IT', 'Manager']
  return staffRoles.includes(role)
}

/**
 * 判断是否为 Contact 角色
 */
function isContactRole(role?: string): boolean {
  return role === 'Family'
}

/**
 * 获取账户设置（统一 API，根据 role 自动选择路径）
 * @param userId - 用户 ID（可能是 user_id, resident_id, 或 contact_id）
 * @param mode - Error message mode
 */
export function getAccountSettingsApi(
  userId: string,
  mode: ErrorMessageMode = 'modal'
): Promise<AccountSettings> {
  const userStore = useUserStore()
  const userInfo = userStore.getUserInfo
  const role = userInfo?.role
  
  // 根据 role 选择路径（3 组路径）
  let url: string
  if (isStaffRole(role)) {
    // Staff: user
    url = ApiPath.UserGet.replace(':id', userId)
  } else if (isContactRole(role)) {
    // Contact: contact
    url = ApiPath.ContactGet.replace(':id', userId)
  } else {
    // Resident: resident
    url = ApiPath.ResidentGet.replace(':id', userId)
  }
  
  return defHttp.get<AccountSettings>(
    {
      url,
    },
    { errorMessageMode: mode },
  )
}

/**
 * 更新账户设置（统一 API，根据 role 自动选择路径）
 * @param userId - 用户 ID（可能是 user_id, resident_id, 或 contact_id）
 * @param params - 更新参数
 * @param mode - Error message mode
 */
export function updateAccountSettingsApi(
  userId: string,
  params: UpdateAccountSettingsParams,
  mode: ErrorMessageMode = 'modal'
): Promise<UpdateAccountSettingsResponse> {
  const userStore = useUserStore()
  const userInfo = userStore.getUserInfo
  const role = userInfo?.role
  
  // 根据 role 选择路径（3 组路径）
  let url: string
  if (isStaffRole(role)) {
    // Staff: user
    url = ApiPath.UserUpdate.replace(':id', userId)
  } else if (isContactRole(role)) {
    // Contact: contact
    url = ApiPath.ContactUpdate.replace(':id', userId)
  } else {
    // Resident: resident
    url = ApiPath.ResidentUpdate.replace(':id', userId)
  }
  
  // 对于 user（staff），save_email 和 save_phone 总是 true（与页面和原始值无关）
  if (isStaffRole(role)) {
    // User 场景：save_email 和 save_phone 恒为 true，不管 email/phone 字段是否存在
    params.save_email = true
    params.save_phone = true
  }
  
  // 对于 contact（Family），save_email 和 save_phone 总是 true（与页面和原始值无关）
  if (isContactRole(role)) {
    // Contact 场景：save_email 和 save_phone 恒为 true，不管 email/phone 字段是否存在
    params.save_email = true
    params.save_phone = true
  }
  
  // 对于 resident，如果 email/phone 字段存在，确保 save_email/save_phone 也有值
  if (!isStaffRole(role) && !isContactRole(role)) {
    // Resident 场景：如果 email 字段存在，确保 save_email 有值（如果未设置，使用当前值或默认值）
    if (params.email !== undefined && params.save_email === undefined) {
      // 如果 email 字段存在但 save_email 未设置，说明是删除操作，设置为 false
      params.save_email = false
    }
    if (params.phone !== undefined && params.save_phone === undefined) {
      // 如果 phone 字段存在但 save_phone 未设置，说明是删除操作，设置为 false
      params.save_phone = false
    }
  }
  
  return defHttp.put<UpdateAccountSettingsResponse>(
    {
      url,
      data: params,
    },
    { errorMessageMode: mode },
  )
}

