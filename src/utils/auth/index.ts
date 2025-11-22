/**
 * Authentication utility functions
 * Token storage and user information management
 * 
 * Note: All field names use snake_case to match database schema (PostgreSQL standard)
 */

// Token 存储键名常量
export const TOKEN_KEY = 'ACCESS_TOKEN'
export const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN'
export const USER_INFO_KEY = 'USER_INFO'  // 包含 userId, userType, residentType, role, nickName, tenant_id, locationType, locationTag, locationName
export const INSTITUTION_INFO_KEY = 'INSTITUTION_INFO'  // 机构信息
export const ROLES_KEY = 'ROLES'  // 角色列表（可选，如果需要多个角色）

/**
 * InstitutionInfo 接口
 * 对应 tenants 表
 */
export interface InstitutionInfo {
  tenant_id: string            // 机构 ID（对应 tenants.tenant_id）
  tenant_name: string          // 机构名称（对应 tenants.tenant_name）
  domain?: string             // 机构域名（对应 tenants.domain）
}

/**
 * 获取认证缓存（通用）
 * @param key 缓存键名
 * @returns 缓存值或 null
 */
export function getAuthCache<T>(key: string): T | null {
  // 使用 localStorage（持久化）
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : null
}

/**
 * 设置认证缓存（通用）
 * @param key 缓存键名
 * @param value 缓存值
 */
export function setAuthCache(key: string, value: any): void {
  localStorage.setItem(key, JSON.stringify(value))
}

/**
 * 获取 token
 * @returns Access token 或 null
 */
export function getToken(): string | null {
  return getAuthCache<string>(TOKEN_KEY)
}

/**
 * 设置 token
 * @param token Access token
 */
export function setToken(token: string): void {
  setAuthCache(TOKEN_KEY, token)
}

/**
 * 获取刷新 token
 * @returns Refresh token 或 null
 */
export function getRefreshToken(): string | null {
  return getAuthCache<string>(REFRESH_TOKEN_KEY)
}

/**
 * 设置刷新 token
 * @param refreshToken Refresh token
 */
export function setRefreshToken(refreshToken: string): void {
  setAuthCache(REFRESH_TOKEN_KEY, refreshToken)
}

/**
 * 获取机构信息
 * @returns InstitutionInfo 或 null
 */
export function getInstitutionInfo(): InstitutionInfo | null {
  return getAuthCache<InstitutionInfo>(INSTITUTION_INFO_KEY)
}

/**
 * 设置机构信息
 * @param info InstitutionInfo
 */
export function setInstitutionInfo(info: InstitutionInfo | null): void {
  if (info) {
    setAuthCache(INSTITUTION_INFO_KEY, info)
  } else {
    localStorage.removeItem(INSTITUTION_INFO_KEY)
  }
}

/**
 * 清除机构信息
 */
export function clearInstitutionInfo(): void {
  localStorage.removeItem(INSTITUTION_INFO_KEY)
}

/**
 * 清除认证缓存（所有认证相关数据）
 */
export function clearAuthCache(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_INFO_KEY)
  localStorage.removeItem(INSTITUTION_INFO_KEY)
  localStorage.removeItem(ROLES_KEY)
}

