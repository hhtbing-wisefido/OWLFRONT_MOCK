/**
 * User state management Store
 * Manages user authentication state, including token, user info, roles, etc.
 * 
 * Note: All field names use snake_case to match database schema (PostgreSQL standard)
 */

import { defineStore } from 'pinia'
import type { LoginParams, LoginResult } from '@/api/auth/model/authModel'
import type { InstitutionInfo } from '@/utils/auth'
import {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  getAuthCache,
  setAuthCache,
  clearAuthCache,
  getInstitutionInfo,
  setInstitutionInfo,
  clearInstitutionInfo,
  USER_INFO_KEY,
  ROLES_KEY,
} from '@/utils/auth'
import { loginApi } from '@/api/auth/auth'
import { store } from '../index'

/**
 * UserInfo interface definition
 * Contains only non-sensitive information, compliant with HIPAA requirements
 * 
 * Note: This interface should match the structure returned from LoginResult
 * All field names use snake_case to match database schema
 */
export interface UserInfo {
  // Basic information (non-sensitive only)
  userId: string                    // User ID (non-sensitive)
  user_account: string              // User account (non-sensitive)
  userType: 'staff' | 'resident'   // User type (required, non-sensitive) - saved on login success
  residentType?: 'home' | 'institution'  // Resident subtype - corresponds to residents.is_institutional
  locationType?: 'home' | 'institution'  // Location type - corresponds to locations.location_type
  role?: string                     // Role code (e.g., 'Admin', 'Nurse', 'Caregiver') - saved on login success
  nickName?: string                 // Nickname/display name (non-sensitive, for UI display) - saved on login success
  
  // Institution information (Tenant table, required for all user types, non-sensitive)
  tenant_id: string                  // Institution ID (corresponds to tenants.tenant_id) - saved on login success
  tenant_name: string                // Institution name (corresponds to tenants.tenant_name) - saved on login success
  domain?: string                   // Institution domain (corresponds to tenants.domain) - saved on login success
  
  // Location information (avoid address leakage, only store non-sensitive location identifiers)
  locationTag?: string              // Location tag (corresponds to locations.location_tag) - non-sensitive, for grouping and routing
  locationName?: string             // Location name (corresponds to locations.location_name) - non-sensitive, for card display
  
  // Other
  homePath?: string                 // User home page path (non-sensitive)
  avatar?: string                   // Avatar URL (non-sensitive, optional)
}

interface UserState {
  userInfo: UserInfo | null
  institutionInfo: InstitutionInfo | null  // Institution information (Tenant table)
  accessToken: string | null
  refreshToken: string | null
  roleList: string[]
  pagePermissions: Record<string, string[]>  // Page access permissions: { routePath: [allowedRoles] }
  lastUpdateTime: number
  // Note: PIN code is not stored in state (memory only, not persisted)
  // Note: locationTag and locationName are stored in userInfo
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: null,
    institutionInfo: null,  // Institution information
    accessToken: null,
    refreshToken: null,
    roleList: [],
    pagePermissions: {},  // Page access permissions
    lastUpdateTime: 0,
  }),

  getters: {
    getToken(): string | null {
      return this.accessToken || getToken()
    },
    
    getRefreshToken(): string | null {
      return this.refreshToken || getRefreshToken()
    },
    
    getUserInfo(): UserInfo | null {
      const userInfo = this.userInfo || getAuthCache<UserInfo>(USER_INFO_KEY)
      
      // Development environment: support test role override
      if (import.meta.env.DEV && userInfo) {
        const testRole = localStorage.getItem('dev_test_role')
        if (testRole) {
          return {
            ...userInfo,
            role: testRole,
          }
        }
      }
      
      return userInfo
    },
    
    getInstitutionInfo(): InstitutionInfo | null {
      return this.institutionInfo || getInstitutionInfo()
    },
    
    // Check if user is a Home Resident
    isHomeResident(): boolean {
      return this.userInfo?.userType === 'resident' && 
             this.userInfo?.residentType === 'home'
    },
    
    // Check if user is an Institution Resident
    isInstitutionResident(): boolean {
      return this.userInfo?.userType === 'resident' && 
             this.userInfo?.residentType === 'institution'
    },
    
    getRoleList(): string[] {
      return this.roleList.length > 0 
        ? this.roleList 
        : getAuthCache<string[]>(ROLES_KEY) || []
    },
    
    getLastUpdateTime(): number {
      return this.lastUpdateTime
    },
    
    // Get user home page path
    getUserHomePath(): string {
      const userInfo = this.getUserInfo
      // Prefer backend-returned homePath
      if (userInfo?.homePath) {
        return userInfo.homePath
      }
      // Default home page: all users use /monitoring/overview
      return '/monitoring/overview'
    },
  },

  actions: {
    // Check if user has page access permission
    hasPagePermission(routePath: string | undefined | null): boolean {
      // If routePath doesn't exist or is not a string, allow access by default (to avoid errors)
      if (!routePath || typeof routePath !== 'string') {
        return true
      }
      
      // Ensure routePath is a string type
      const path = String(routePath)
      
      const userInfo = this.getUserInfo
      if (!userInfo) {
        if (import.meta.env.DEV) {
          console.warn('[UserStore] hasPagePermission: No userInfo', { path })
        }
        return false
      }
      
      // Admin module only allows staff users to access
      if (path.startsWith('/admin')) {
        if (userInfo.userType !== 'staff') {
          if (import.meta.env.DEV) {
            console.warn('[UserStore] hasPagePermission: Admin path requires staff userType', {
              path,
              userType: userInfo.userType,
            })
          }
          return false
        }
      }
      
      const allowedRoles = this.pagePermissions[path]
      if (!allowedRoles || allowedRoles.length === 0) {
        // If no permission config, allow access by default
        if (import.meta.env.DEV) {
          console.log('[UserStore] hasPagePermission: No permission config, allowing access', { path })
        }
        return true
      }
      const userRole = userInfo.role
      if (!userRole) {
        if (import.meta.env.DEV) {
          console.warn('[UserStore] hasPagePermission: No user role', {
            path,
            allowedRoles,
            userInfo: { userType: userInfo.userType, userId: userInfo.userId },
          })
        }
        return false
      }
      const hasPermission = allowedRoles.includes(userRole)
      if (!hasPermission && import.meta.env.DEV) {
        console.warn('[UserStore] hasPagePermission: Role not in allowed list', {
          path,
          userRole,
          allowedRoles,
        })
      }
      return hasPermission
    },
    
    // Set token
    setToken(token: string | null) {
      this.accessToken = token
      if (token) {
        setToken(token)
      } else {
        localStorage.removeItem('ACCESS_TOKEN')
      }
    },

    // Set refresh token
    setRefreshToken(refreshToken: string | null) {
      this.refreshToken = refreshToken
      if (refreshToken) {
        setRefreshToken(refreshToken)
      } else {
        localStorage.removeItem('REFRESH_TOKEN')
      }
    },

    // Set user information
    setUserInfo(userInfo: UserInfo | null) {
      this.userInfo = userInfo
      this.lastUpdateTime = Date.now()
      if (userInfo) {
        setAuthCache(USER_INFO_KEY, userInfo)
      } else {
        localStorage.removeItem(USER_INFO_KEY)
      }
    },

    // Set institution information
    setInstitutionInfo(info: InstitutionInfo | null) {
      this.institutionInfo = info
      if (info) {
        setInstitutionInfo(info)
      } else {
        clearInstitutionInfo()
      }
    },

    // Set role list
    setRoleList(roleList: string[]) {
      this.roleList = roleList
      if (roleList.length > 0) {
        setAuthCache(ROLES_KEY, roleList)
      } else {
        localStorage.removeItem(ROLES_KEY)
      }
    },
    
    // Set page access permissions
    setPagePermissions(permissions: Record<string, string[]>) {
      this.pagePermissions = permissions
      // Page permissions can be stored in localStorage, but usually don't need persistence (reset on each login)
    },
    
    // Initialize page access permissions (based on role configuration)
    // Note: Roles have been updated to simplified version, only SystemAdmin can globally modify roles (system built-in)
    // Tenants (Admin and others) cannot modify system roles, can only view or manage tenant custom roles
    initPagePermissions() {
      // Default page permission configuration
      // Note: Admin module only allows staff users to access (checked in hasPagePermission by userType)
      const defaultPermissions: Record<string, string[]> = {
        // Core operations area
        '/monitoring/overview': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
        '/alarm/history': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse'],
        '/alarm/settings': ['SystemAdmin', 'Admin', 'IT'],

        // Data management area
        '/residents': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver'], // List page
        '/resident/:id': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'], // Detail page (general)
        '/resident/:id/profile': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
        '/resident/:id/phi': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver'], // PHI sensitive information
        '/resident/:id/contacts': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
        '/care-coordination/assignments': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse'],
        '/care-coordination/card-overview': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse'],

        // System settings area
        '/devices': ['SystemAdmin', 'Admin', 'IT'],
        '/units': ['SystemAdmin', 'Admin', 'IT'],
        '/admin/users': ['SystemAdmin', 'Admin', 'IT'],
        '/admin/roles': ['SystemAdmin', 'Admin', 'Manager', 'IT'],
        '/admin/permissions': ['SystemAdmin'], // Only SystemAdmin can access Permission Management
        '/admin/tags': ['SystemAdmin', 'Admin', 'IT'],
      }
      this.setPagePermissions(defaultPermissions)
    },

    // Login
    async login(params: LoginParams): Promise<LoginResult> {
      const result = await loginApi(params)
      
      // Save token
      this.setToken(result.accessToken)
      this.setRefreshToken(result.refreshToken)
      
      // Save institution information (Tenant table)
      if (result.tenant_id && result.tenant_name) {
        this.setInstitutionInfo({
          tenant_id: result.tenant_id,
          tenant_name: result.tenant_name,
          domain: result.domain,
        })
      }
      
      // Save user information (complete information returned once on login, including homePath and avatar)
      this.setUserInfo({
        userId: result.userId,
        user_account: result.user_account || '', // User account (non-sensitive, for display and identification)
        userType: result.userType,
        residentType: result.residentType,
        locationType: result.locationType,
        role: result.role,
        nickName: result.nickName,
        tenant_id: result.tenant_id!,
        tenant_name: result.tenant_name!,
        domain: result.domain,
        locationTag: result.locationTag,
        locationName: result.locationName,
        homePath: result.homePath,
        avatar: result.avatar,
      })
      
      // Set role list
      if (result.role) {
        this.setRoleList([result.role])
      }
      
      // Initialize page access permissions
      this.initPagePermissions()
      
      return result
    },

    // Get user information (for refreshing user info, not needed on login since login already returns complete info)
    async getUserInfoAction(): Promise<UserInfo | null> {
      if (!this.getToken) {
        return null
      }
      
      // TODO: Implement getUserInfoApi
      // const userInfo = await getUserInfoApi()
      // this.setUserInfo(userInfo)
      
      // Set role list (if any)
      const userInfo = this.getUserInfo
      if (userInfo?.role) {
        this.setRoleList([userInfo.role])
      }
      
      // Initialize page access permissions
      this.initPagePermissions()
      
      return userInfo
    },

    // Actions after login (load routes, etc., no need to get user info since login already returns complete info)
    async afterLoginAction(goHome = true): Promise<UserInfo | null> {
      if (!this.getToken) {
        return null
      }
      
      // Get user info from store (saved on login)
      const userInfo = this.getUserInfo
      
      // TODO: Load dynamic routes (if needed)
      // const permissionStore = usePermissionStore()
      // if (!permissionStore.isDynamicAddedRoute) {
      //   const routes = await permissionStore.buildRoutesAction()
      //   routes.forEach((route) => {
      //     router.addRoute(route)
      //   })
      // }
      
      // Navigate to home page (if needed)
      // Use getUserHomePath getter to get home page path (prefer backend-returned homePath)
      if (goHome) {
        const router = (await import('@/router')).default
        router.push(this.getUserHomePath)
      }
      
      return userInfo
    },

    // Refresh token
    async refreshTokenAction(): Promise<string | null> {
      const currentRefreshToken = this.getRefreshToken
      if (!currentRefreshToken) {
        throw new Error('No refresh token available')
      }
      
      try {
        // TODO: Implement refreshTokenApi
        // const data = await refreshTokenApi({ refreshToken: currentRefreshToken })
        
        // Save new token
        // this.setToken(data.accessToken)
        // this.setRefreshToken(data.refreshToken)
        
        // return data.accessToken
        throw new Error('refreshTokenApi not implemented yet')
      } catch (error) {
        // Refresh failed, clear token and navigate to login page
        await this.logout(true)
        throw error
      }
    },

    // Logout
    async logout(goLogin = false) {
      if (this.getToken) {
        try {
          // TODO: Implement logoutApi
          // const refreshToken = this.getRefreshToken
          // if (refreshToken) {
          //   await logoutApi({ refreshToken })
          // }
        } catch (error) {
          console.error('Logout API failed:', error)
        }
      }
      
      // Clear state
      this.resetState()
      
      // Navigate to login page
      if (goLogin) {
        const router = (await import('@/router')).default
        router.push('/login')
      }
    },

    // Reset state
    resetState() {
      this.userInfo = null
      this.institutionInfo = null  // Clear institution information
      this.accessToken = null
      this.refreshToken = null
      this.roleList = []
      this.pagePermissions = {}
      this.lastUpdateTime = 0
      clearAuthCache()
    },
  },
})

// Use outside setup (for route guards, HTTP interceptors, etc.)
export function useUserStoreWithOut() {
  return useUserStore(store)
}
