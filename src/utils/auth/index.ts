/**
 * Authentication utility functions
 * Token storage and user information management
 * 
 * HIPAA Compliance: Uses sessionStorage instead of localStorage for better security in shared PC scenarios.
 * sessionStorage is automatically cleared when the browser tab is closed, ensuring user data isolation.
 * 
 * Note: All field names use snake_case to match database schema (PostgreSQL standard)
 */

// Token storage key name constants
export const TOKEN_KEY = 'ACCESS_TOKEN'
export const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN'
export const USER_INFO_KEY = 'USER_INFO'  // Contains userId, userType, residentType, role, nickName, tenant_id, locationType, branchTag, locationName
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
 * Uses sessionStorage for HIPAA compliance (automatically cleared when tab closes)
 * @param key Cache key name
 * @returns Cache value or null
 */
export function getAuthCache<T>(key: string): T | null {
  // Use sessionStorage (HIPAA compliant: cleared when tab closes)
  try {
    const value = sessionStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error('Failed to get auth cache:', error)
    return null
  }
}

/**
 * Set authentication cache (generic)
 * Uses sessionStorage for HIPAA compliance (automatically cleared when tab closes)
 * @param key Cache key name
 * @param value Cache value
 */
export function setAuthCache(key: string, value: any): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to set auth cache:', error)
  }
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
    sessionStorage.removeItem(INSTITUTION_INFO_KEY)
  }
}

/**
 * Clear institution information
 */
export function clearInstitutionInfo(): void {
  sessionStorage.removeItem(INSTITUTION_INFO_KEY)
}

/**
 * Clear authentication cache (all authentication-related data from sessionStorage)
 * HIPAA Compliance: Clears all session data for current tab
 */
export function clearAuthCache(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  sessionStorage.removeItem(USER_INFO_KEY)
  sessionStorage.removeItem(INSTITUTION_INFO_KEY)
  sessionStorage.removeItem(ROLES_KEY)
}

/**
 * Clear all authentication data (both localStorage and sessionStorage)
 * HIPAA Compliance: Called on login to ensure no data leakage between users
 * This ensures complete isolation when multiple users share the same PC
 */
export function clearAllAuthData(): void {
  // Clear sessionStorage (current tab's auth data)
  clearAuthCache()
  
  // Also clear localStorage (legacy data and other tabs' data)
  // This ensures no data leakage when a new user logs in
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_INFO_KEY)
  localStorage.removeItem(INSTITUTION_INFO_KEY)
  localStorage.removeItem(ROLES_KEY)
  localStorage.removeItem('LOGIN_TYPE')
  
  // Clear any other potential auth-related keys
  // Note: This is a safety measure to ensure complete cleanup
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.startsWith('ACCESS_TOKEN') ||
        key.startsWith('REFRESH_TOKEN') ||
        key.startsWith('USER_INFO') ||
        key.startsWith('INSTITUTION_INFO') ||
        key.startsWith('ROLES') ||
        key === 'LOGIN_TYPE'
      )) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
  
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (
        key.startsWith('ACCESS_TOKEN') ||
        key.startsWith('REFRESH_TOKEN') ||
        key.startsWith('USER_INFO') ||
        key.startsWith('INSTITUTION_INFO') ||
        key.startsWith('ROLES')
      )) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key))
  } catch (error) {
    console.error('Error clearing sessionStorage:', error)
  }
}

