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
  clearAllAuthData,
  getInstitutionInfo,
  setInstitutionInfo,
  clearInstitutionInfo,
  USER_INFO_KEY,
  ROLES_KEY,
} from '@/utils/auth'
import { loginApi } from '@/api/auth/auth'
import { store } from '../index'

// Helper function to match route patterns (e.g., /admin/users/:id matches /admin/users/123)
function matchRoutePattern(actualPath: string, pattern: string): boolean {
  // Convert pattern to regex
  // /admin/users/:id -> /admin/users/[^/]+
  const regexPattern = pattern
    .replace(/:[^/]+/g, '[^/]+')  // :id -> [^/]+
    .replace(/:\?[^/]+/g, '[^/]*') // :tab? -> [^/]*
  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(actualPath)
}

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
                                     // Note: userType is the value selected in login form (staff/resident)
                                     // Backend uses it to determine which table to query (user table for staff, Resident/Resident_contact for resident)
                                     // NOT used for permission control - permissions are based on role only
  residentType?: 'home' | 'institution'  // Resident subtype - corresponds to residents.is_institutional
  locationType?: 'home' | 'institution'  // Location type - corresponds to locations.location_type
  role?: string                     // Role code (e.g., 'Admin', 'Nurse', 'Caregiver') - saved on login success
  nickName?: string                 // Nickname/display name (non-sensitive, for UI display) - saved on login success
  
  // Institution information (Tenant table, required for all user types, non-sensitive)
  tenant_id: string                  // Institution ID (corresponds to tenants.tenant_id) - saved on login success
  tenant_name: string                // Institution name (corresponds to tenants.tenant_name) - saved on login success
  domain?: string                   // Institution domain (corresponds to tenants.domain) - saved on login success
  
  // Location information (avoid address leakage, only store non-sensitive location identifiers)
  branchTag?: string              // Branch tag: for staff users, corresponds to users.branch_tag; for residents, corresponds to units.branch_tag (via residents.unit_id) - non-sensitive, for grouping and routing
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
  loginType: 'staff' | 'resident' | null  // Login type selected in login form (staff/resident) - stored locally only, not on server
  // Note: PIN code is not stored in state (memory only, not persisted)
  // Note: branchTag and locationName are stored in userInfo
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
    loginType: null,  // Login type selected in login form
  }),

  getters: {
    getToken(): string | null {
      const stateToken = this.accessToken
      const storageToken = getToken()
      console.log('[UserStore] getToken getter调用', { 
        stateToken: stateToken?.substring(0, 20) + '...', 
        storageToken: storageToken?.substring(0, 20) + '...',
        result: (stateToken || storageToken)?.substring(0, 20) + '...'
      })
      return stateToken || storageToken
    },
    
    getRefreshToken(): string | null {
      return this.refreshToken || getRefreshToken()
    },
    
    getUserInfo(): UserInfo | null {
      const userInfo = this.userInfo || getAuthCache<UserInfo>(USER_INFO_KEY)
      
      // Development environment: support test role override
      // Only enable this when explicitly running in mock mode; otherwise it will
      // override real backend role (e.g. sysadmin -> SystemAdmin) and break routing.
      if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true' && userInfo) {
        // Use sessionStorage for HIPAA compliance
        const testRole = sessionStorage.getItem('dev_test_role')
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
    
    // Get login type (selected in login form)
    getLoginType(): 'staff' | 'resident' | null {
      // Try to get from state first, then from sessionStorage
      if (this.loginType) {
        return this.loginType
      }
      const saved = sessionStorage.getItem('LOGIN_TYPE')
      if (saved === 'staff' || saved === 'resident') {
        return saved
      }
      return null
    },
    
    // Get user home page path
    getUserHomePath(): string {
      const userInfo = this.getUserInfo
      const role = userInfo?.role || ''

      // Role-based landing pages (prevent "login success but no redirect" due to permission guard loop)
      if (role === 'SystemOperator') {
        return '/alarm/cloud'
      }

      // Prefer backend-returned homePath only if it's permitted by current role.
      // Otherwise it can cause a guard loop (deny -> redirect to same denied path).
      if (userInfo?.homePath) {
        const allowedRoles = this.pagePermissions[userInfo.homePath]
        if (!allowedRoles || allowedRoles.length === 0) {
          // No config: allow for non-admin paths; deny for admin paths.
          if (!userInfo.homePath.startsWith('/admin')) {
            return userInfo.homePath
          }
        } else if (allowedRoles.includes(role)) {
          return userInfo.homePath
        }
      }

      // Default home page for other roles: Monitoring Overview
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
      
      // Check admin paths - use permission config (based on role) to determine access
      // Note: userType is NOT used for permission checks - it's only used for business logic
      // userType tells backend which table to query (user table for staff, Resident/Resident_contact for resident)
      // Permissions are determined by role (from LoginResult.role), not userType
      if (path.startsWith('/admin')) {
        // For admin paths, must have permission config
        // Don't allow access by default for admin paths
        // Try exact match first, then try pattern matching for dynamic routes
        let allowedRoles = this.pagePermissions[path]
        
        // If exact match failed, try pattern matching for dynamic routes (e.g., /admin/users/:id)
        if (!allowedRoles || allowedRoles.length === 0) {
          for (const [pattern, roles] of Object.entries(this.pagePermissions)) {
            if (pattern.includes(':') && matchRoutePattern(path, pattern)) {
              allowedRoles = roles
              if (import.meta.env.DEV) {
                console.log('[UserStore] hasPagePermission: Matched admin pattern', { path, pattern, roles })
              }
              break
            }
          }
        }
        
        if (!allowedRoles || allowedRoles.length === 0) {
          if (import.meta.env.DEV) {
            console.warn('[UserStore] hasPagePermission: Admin path has no permission config, denying access', { 
              path,
              availablePatterns: Object.keys(this.pagePermissions).filter(p => p.startsWith('/admin')),
              allPatterns: Object.keys(this.pagePermissions)
            })
          }
          return false
        }
        // Check role for admin paths
        const userRole = userInfo.role
        if (!userRole) {
          if (import.meta.env.DEV) {
            console.warn('[UserStore] hasPagePermission: No user role for admin path', {
              path,
              allowedRoles,
              userInfo: { userType: userInfo.userType, userId: userInfo.userId },
            })
          }
          return false
        }
        const hasPermission = allowedRoles.includes(userRole)
        if (import.meta.env.DEV) {
          if (hasPermission) {
            console.log('[UserStore] hasPagePermission: Admin path - GRANTED', {
              path,
              userRole,
              allowedRoles,
            })
          } else {
            console.warn('[UserStore] hasPagePermission: Admin path - DENIED', {
              path,
              userRole,
              allowedRoles,
            })
          }
        }
        return hasPermission
      }
      
      // For non-admin paths, check permission config
      // Try exact match first, then try pattern matching for dynamic routes
      let allowedRoles = this.pagePermissions[path]
      
      // If exact match failed, try pattern matching for dynamic routes (e.g., /resident/:id/profile)
      if (!allowedRoles || allowedRoles.length === 0) {
        for (const [pattern, roles] of Object.entries(this.pagePermissions)) {
          if (pattern.includes(':') && matchRoutePattern(path, pattern)) {
            allowedRoles = roles
            if (import.meta.env.DEV) {
              console.log('[UserStore] hasPagePermission: Matched pattern', { path, pattern, roles })
            }
            break
          }
        }
      }
      
      if (!allowedRoles || allowedRoles.length === 0) {
        // If no permission config, allow access by default (only for non-admin paths)
        if (import.meta.env.DEV) {
          console.log('[UserStore] hasPagePermission: No permission config, allowing access', { path })
        }
        return true
      }
      // Get user role (with test role override in dev environment via getUserInfo getter)
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
      if (import.meta.env.DEV) {
        if (!hasPermission) {
          console.warn('[UserStore] hasPagePermission: Role not in allowed list - DENIED', {
            path,
            userRole,
            allowedRoles,
            userInfo: { userType: userInfo.userType, userId: userInfo.userId },
          })
        } else {
          console.log('[UserStore] hasPagePermission: Role in allowed list - GRANTED', {
            path,
            userRole,
            allowedRoles,
          })
        }
      }
      return hasPermission
    },
    
    // Set token
    setToken(token: string | null) {
      console.log('[UserStore] setToken调用', { token, tokenLength: token?.length })
      this.accessToken = token
      if (token) {
        setToken(token)
        console.log('[UserStore] Token已保存到sessionStorage')
        // 验证是否真的保存成功
        const saved = sessionStorage.getItem('ACCESS_TOKEN')
        console.log('[UserStore] 验证sessionStorage:', { saved: !!saved, savedLength: saved?.length })
      } else {
        sessionStorage.removeItem('ACCESS_TOKEN')
      }
    },

    // Set refresh token
    setRefreshToken(refreshToken: string | null) {
      this.refreshToken = refreshToken
      if (refreshToken) {
        setRefreshToken(refreshToken)
      } else {
        sessionStorage.removeItem('REFRESH_TOKEN')
      }
    },

    // Set user information
    setUserInfo(userInfo: UserInfo | null) {
      this.userInfo = userInfo
      this.lastUpdateTime = Date.now()
      if (userInfo) {
        setAuthCache(USER_INFO_KEY, userInfo)
      } else {
        sessionStorage.removeItem(USER_INFO_KEY)
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
        sessionStorage.removeItem(ROLES_KEY)
      }
    },
    
    // Set page access permissions
    setPagePermissions(permissions: Record<string, string[]>) {
      this.pagePermissions = permissions
      // Page permissions don't need persistence (reset on each login)
    },
    
    // Set login type (selected in login form)
    setLoginType(loginType: 'staff' | 'resident') {
      this.loginType = loginType
      // Store in sessionStorage for HIPAA compliance
      sessionStorage.setItem('LOGIN_TYPE', loginType)
    },
    
    // Initialize page access permissions (based on role configuration)
    // Note: Roles have been updated to simplified version, only SystemAdmin can globally modify roles (system built-in)
    // Tenants (Admin and others) cannot modify system roles, can only view or manage tenant custom roles
    initPagePermissions() {
      // Default page permission configuration
      // Note: All permission checks are based on role (from LoginResult.role), NOT userType
      // userType ('staff' | 'resident') is the value selected in login form:
      //   - 'staff' → backend queries user table
      //   - 'resident' → backend queries Resident/Resident_contact table
      // Backend returns LoginResult with both userType (from form) and role (from database)
      // userType is only used for business logic (e.g., isHomeResident, isInstitutionResident), not permission control
      // Based on route.md permission table (lines 11-33)
      const defaultPermissions: Record<string, string[]> = {
        // ==================== 【核心操作区域】 ====================
        '/monitoring/overview': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
        // Note: Resident and Family can view alarm records from card detail page, but not from /alarm/records (privacy protection)
        '/alarm/records': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver'],
        '/alarm/cloud': ['SystemAdmin', 'SystemOperator', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],

        // ==================== 【数据管理区域】 ====================
        '/residents': ['Admin', 'Manager', 'Nurse', 'Caregiver', 'Resident'], // Family removed - cannot access
        '/residents/create': ['Admin', 'Manager', 'Nurse', 'Caregiver'], // Same as /residents
        '/resident/:id/profile': ['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver'], // Resident and Family removed - cannot access
        '/resident/:id/phi': ['Admin', 'Manager', 'Nurse', 'Caregiver'],
        '/resident/:id/contacts': ['Admin', 'Manager', 'Nurse', 'Caregiver', 'Resident'], // Family removed - cannot access
        '/care-coordination/card-overview': ['Admin', 'Manager', 'IT', 'Nurse'],

        // ==================== 【系统设置区域】 ====================
        '/devices': ['Admin', 'Manager', 'IT'],
        '/admin/devicestore': ['SystemAdmin', 'SystemOperator'],
        '/units': ['Admin', 'Manager', 'IT'],
        '/unitview': ['Admin', 'Manager', 'IT'], // Same as /units
        // SystemAdmin is a platform role, but sysadmin account lives in the System tenant.
        // Allow SystemAdmin to access Users page at least for System tenant management.
        '/admin/users': ['SystemAdmin', 'Admin', 'Manager', 'IT'],
        '/admin/users/:id': ['SystemAdmin', 'Admin', 'Manager', 'IT'],
        '/admin/roles': ['SystemAdmin', 'Admin', 'Manager', 'IT'],
        '/admin/permissions': ['SystemAdmin'],
        '/admin/role-permissions': ['SystemAdmin'], // Redirect to /admin/permissions
        '/admin/tags': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver'],
        '/admin/tenants': ['SystemAdmin', 'SystemOperator'],

        // ==================== 其他功能路由 ====================
        '/monitoring/detail/:cardId': ['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
        // Legacy routes - redirect to /monitoring/detail/:cardId
        // Device Monitor Settings
        '/settings/monitor/sleepace/:deviceId': ['Admin', 'Manager', 'IT', 'Nurse'],
        '/settings/monitor/radar/:deviceId': ['Admin', 'Manager', 'IT', 'Nurse'],
        '/monitoring/vital-focus/:cardId': ['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
        '/monitoring/wellness-monitor/:cardId': ['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
        '/report/sleepace/:deviceId': ['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
        '/report/sleepace/:deviceId/detail/:date': ['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
      }
      this.setPagePermissions(defaultPermissions)
      if (import.meta.env.DEV) {
        console.log('[UserStore] initPagePermissions: Initialized', {
          totalPaths: Object.keys(defaultPermissions).length,
          adminPaths: Object.keys(defaultPermissions).filter(p => p.startsWith('/admin')),
        })
      }
    },

    // Login
    async login(params: LoginParams): Promise<LoginResult> {
      // HIPAA Compliance: Clear all authentication data before login
      // This ensures no data leakage when multiple users share the same PC
      clearAllAuthData()
      
      const result = await loginApi(params)
      
      // Save token
      this.setToken(result.accessToken)
      this.setRefreshToken(result.refreshToken)
      
      // Save login type (selected in login form, stored locally only)
      this.setLoginType(params.userType)
      if (import.meta.env.DEV) {
        console.log('[UserStore] login: Saved loginType', { loginType: params.userType })
      }
      
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
        branchTag: result.branchTag,
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
      console.log('[afterLoginAction] 开始执行', { goHome, token: this.getToken })
      
      if (!this.getToken) {
        console.error('[afterLoginAction] 没有token，返回null')
        return null
      }
      
      // Get user info from store (saved on login)
      const userInfo = this.getUserInfo
      console.log('[afterLoginAction] 用户信息', { userInfo })
      
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
        const homePath = this.getUserHomePath
        console.log('[afterLoginAction] 准备导航到:', homePath)
        
        const router = (await import('@/router')).default
        console.log('[afterLoginAction] Router实例获取成功，执行push')
        
        await router.push(homePath)
        console.log('[afterLoginAction] Router.push完成')
      }
      
      console.log('[afterLoginAction] 执行完成')
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
      
      // Stop alarm sound before logout
      try {
        const { alarmSound } = await import('@/utils/radar/alarmSound')
        alarmSound.stopAlarm()
        console.log('[User Store] Alarm sound stopped on logout')
      } catch (error) {
        console.error('[User Store] Failed to stop alarm sound:', error)
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
      this.loginType = null
      sessionStorage.removeItem('LOGIN_TYPE')
      // HIPAA Compliance: Clear all authentication data on logout
      clearAllAuthData()
      // Clear entities store cache when user logs out/switches
      // This prevents showing cached data from previous user
      import('@/store/modules/entities').then(({ useEntitiesStore }) => {
        const entitiesStore = useEntitiesStore()
        entitiesStore.clearCache()
      })
    },
  },
})

// Use outside setup (for route guards, HTTP interceptors, etc.)
export function useUserStoreWithOut() {
  return useUserStore(store)
}
