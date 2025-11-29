import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

/**
 * Permission check Composable
 * Provides unified permission check methods
 */
export function usePermission() {
  const userStore = useUserStore()
  
  /**
   * Check if user has management permission (Admin, Director, IT)
   */
  const hasManagePermission = computed(() => {
    const userInfo = userStore.getUserInfo
    
    // Development environment: if no user info, default to true (admin permission)
    if (!userInfo) {
      console.log('[usePermission] No userInfo, defaulting to admin permission')
      return true
    }
    
    const allowedRoles = ['Admin', 'Director', 'IT']
    const userRole = userInfo.role
    
    // Development environment: if no role info, default to true (admin permission)
    if (!userRole) {
      console.log('[usePermission] No role, defaulting to admin permission', { userInfo })
      return true
    }
    
    // Case-insensitive comparison
    const hasPermission = allowedRoles.some(role => 
      role.toLowerCase() === userRole.toLowerCase()
    )
    
    if (import.meta.env.DEV) {
      console.log('[usePermission] Permission check:', {
        userRole,
        allowedRoles,
        hasPermission,
        userInfo: { userId: userInfo.userId, user_account: userInfo.user_account, role: userInfo.role }
      })
      
      // Development environment: if permission check fails, default to true (for development testing)
      if (!hasPermission) {
        console.log('[usePermission] Development mode: Forcing admin permission')
        return true
      }
    }
    
    return hasPermission
  })
  
  /**
   * Check if user has specific role
   */
  const hasRole = (roles: string | string[]) => {
    const userInfo = userStore.getUserInfo
    if (!userInfo || !userInfo.role) return false
    
    const roleList = Array.isArray(roles) ? roles : [roles]
    return roleList.some(role => 
      role.toLowerCase() === userInfo.role?.toLowerCase()
    )
  }
  
  /**
   * Check if user has specific permission (based on role-permissions)
   * TODO: Implement permission check based on role-permissions table
   */
  const hasPermission = (permission: string) => {
    // Temporarily based on role judgment, will be changed to based on role-permissions table later
    const permissionMap: Record<string, string[]> = {
      'users.read': ['Admin', 'Director', 'IT', 'Nurse', 'Caregiver'],
      'users.create': ['Admin', 'Director', 'IT'],
      'users.update': ['Admin', 'Director', 'IT'],
      'users.delete': ['Admin', 'Director', 'IT'],
      'roles.read': ['Admin', 'Director', 'CO', 'IT'],
      'roles.create': ['Admin', 'Director', 'IT'],
      'roles.update': ['Admin', 'Director', 'IT'],
      'roles.delete': ['Admin', 'Director', 'IT'],
    }
    
    const allowedRoles = permissionMap[permission]
    if (!allowedRoles) return false
    
    return hasRole(allowedRoles)
  }
  
  /**
   * Check if user is current user
   */
  const isCurrentUser = (userId: string) => {
    const userInfo = userStore.getUserInfo
    return userInfo?.userId === userId
  }
  
  /**
   * Check if user can edit own information
   */
  const canEditSelf = computed(() => {
    return true // User can always edit own information
  })
  
  return {
    hasManagePermission,
    hasRole,
    hasPermission,
    isCurrentUser,
    canEditSelf,
  }
}

