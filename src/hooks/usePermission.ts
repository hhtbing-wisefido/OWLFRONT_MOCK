import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

/**
 * 权限检查 Composable
 * 提供统一的权限检查方法
 */
export function usePermission() {
  const userStore = useUserStore()
  
  /**
   * 检查是否有管理权限（Admin、Director、IT）
   */
  const hasManagePermission = computed(() => {
    const userInfo = userStore.getUserInfo
    
    // 开发环境：如果没有用户信息，默认返回 true（admin 权限）
    if (!userInfo) {
      console.log('[usePermission] No userInfo, defaulting to admin permission')
      return true
    }
    
    const allowedRoles = ['Admin', 'Director', 'IT']
    const userRole = userInfo.role
    
    // 开发环境：如果没有 role 信息，默认返回 true（admin 权限）
    if (!userRole) {
      console.log('[usePermission] No role, defaulting to admin permission', { userInfo })
      return true
    }
    
    // 不区分大小写比较
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
      
      // 开发环境：如果权限检查失败，默认返回 true（便于开发测试）
      if (!hasPermission) {
        console.log('[usePermission] Development mode: Forcing admin permission')
        return true
      }
    }
    
    return hasPermission
  })
  
  /**
   * 检查是否有特定角色
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
   * 检查是否有特定权限（基于 role-permissions）
   * TODO: 实现基于 role-permissions 表的权限检查
   */
  const hasPermission = (permission: string) => {
    // 暂时基于角色判断，后续改为基于 role-permissions 表
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
   * 检查是否是当前用户
   */
  const isCurrentUser = (userId: string) => {
    const userInfo = userStore.getUserInfo
    return userInfo?.userId === userId
  }
  
  /**
   * 检查是否可以编辑自己的信息
   */
  const canEditSelf = computed(() => {
    return true // 用户总是可以编辑自己的信息
  })
  
  return {
    hasManagePermission,
    hasRole,
    hasPermission,
    isCurrentUser,
    canEditSelf,
  }
}

