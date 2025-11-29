/**
 * Authentication utility functions
 * Token storage and user information management
 * 
 * Note: All field names use snake_case to match database schema (PostgreSQL standard)
 */

// Token storage key name constants
export const TOKEN_KEY = 'ACCESS_TOKEN'
export const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN'
export const USER_INFO_KEY = 'USER_INFO'  // Contains userId, userType, residentType, role, nickName, tenant_id, locationType, locationTag, locationName
export const INSTITUTION_INFO_KEY = 'INSTITUTION_INFO'  // Institution information
export const ROLES_KEY = 'ROLES'  // Role list (optional, if multiple roles are needed)

/**
 * InstitutionInfo interface
 * Corresponds to tenants table
 */
export interface InstitutionInfo {
  tenant_id: string            // Institution ID (corresponds to tenants.tenant_id)
  tenant_name: string          // Institution name (corresponds to tenants.tenant_name)
  domain?: string             // Institution domain (corresponds to tenants.domain)
}

/**
 * Get authentication cache (generic)
 * @param key Cache key name
 * @returns Cache value or null
 */
export function getAuthCache<T>(key: string): T | null {
  // Use localStorage (persistent)
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : null
}

/**
 * Set authentication cache (generic)
 * @param key Cache key name
 * @param value Cache value
 */
export function setAuthCache(key: string, value: any): void {
  localStorage.setItem(key, JSON.stringify(value))
}

/**
 * Get token
 * @returns Access token or null
 */
export function getToken(): string | null {
  return getAuthCache<string>(TOKEN_KEY)
}

/**
 * Set token
 * @param token Access token
 */
export function setToken(token: string): void {
  setAuthCache(TOKEN_KEY, token)
}

/**
 * Get refresh token
 * @returns Refresh token or null
 */
export function getRefreshToken(): string | null {
  return getAuthCache<string>(REFRESH_TOKEN_KEY)
}

/**
 * Set refresh token
 * @param refreshToken Refresh token
 */
export function setRefreshToken(refreshToken: string): void {
  setAuthCache(REFRESH_TOKEN_KEY, refreshToken)
}

/**
 * Get institution information
 * @returns InstitutionInfo or null
 */
export function getInstitutionInfo(): InstitutionInfo | null {
  return getAuthCache<InstitutionInfo>(INSTITUTION_INFO_KEY)
}

/**
 * Set institution information
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
 * Clear institution information
 */
export function clearInstitutionInfo(): void {
  localStorage.removeItem(INSTITUTION_INFO_KEY)
}

/**
 * Clear authentication cache (all authentication-related data)
 */
export function clearAuthCache(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_INFO_KEY)
  localStorage.removeItem(INSTITUTION_INFO_KEY)
  localStorage.removeItem(ROLES_KEY)
}

