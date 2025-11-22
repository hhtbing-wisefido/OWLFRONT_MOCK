/**
 * 用户状态管理 Store
 * 管理用户认证状态，包括 token、用户信息、角色等
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
 * UserInfo 接口定义
 * 仅包含非敏感信息，符合 HIPAA 合规要求
 * 
 * Note: This interface should match the structure returned from LoginResult
 * All field names use snake_case to match database schema
 */
export interface UserInfo {
  // 基本信息（仅非敏感信息）
  userId: string                    // 用户 ID（非敏感）
  user_account: string              // 用户账号（非敏感）
  userType: 'staff' | 'resident'   // 用户类型（必须，非敏感）- 登录成功时保存
  residentType?: 'home' | 'institution'  // Resident 子类型 - 对应 residents.is_institutional
  locationType?: 'home' | 'institution'  // Location 类型 - 对应 locations.location_type
  role?: string                     // 角色编码（如 'Admin', 'Nurse', 'Caregiver'）- 登录成功时保存
  nickName?: string                 // 昵称/显示名称（非敏感，用于 UI 显示）- 登录成功时保存
  
  // 机构信息（Tenant 表，所有用户类型都需要，非敏感）
  tenant_id: string                  // 机构 ID（对应 tenants.tenant_id）- 登录成功时保存
  tenant_name: string                // 机构名称（对应 tenants.tenant_name）- 登录成功时保存
  domain?: string                   // 机构域名（对应 tenants.domain）- 登录成功时保存
  
  // Location 信息（避免地址泄漏，仅存储非敏感的位置标识）
  locationTag?: string              // 位置标签（对应 locations.location_tag）- 非敏感，用于分组和路由
  locationName?: string             // 位置名称（对应 locations.location_name）- 非敏感，用于卡片显示
  
  // 其他
  homePath?: string                 // 用户首页路径（非敏感）
  avatar?: string                   // 头像 URL（非敏感，可选）
}

interface UserState {
  userInfo: UserInfo | null
  institutionInfo: InstitutionInfo | null  // 机构信息（Tenant 表）
  accessToken: string | null
  refreshToken: string | null
  roleList: string[]
  lastUpdateTime: number
  // 注意：PIN 码不存储在 state 中（仅内存，不持久化）
  // 注意：locationTag 和 locationName 存储在 userInfo 中
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: null,
    institutionInfo: null,  // 机构信息
    accessToken: null,
    refreshToken: null,
    roleList: [],
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
      return this.userInfo || getAuthCache<UserInfo>(USER_INFO_KEY)
    },
    
    getInstitutionInfo(): InstitutionInfo | null {
      return this.institutionInfo || getInstitutionInfo()
    },
    
    // 判断是否为 Home Resident
    isHomeResident(): boolean {
      return this.userInfo?.userType === 'resident' && 
             this.userInfo?.residentType === 'home'
    },
    
    // 判断是否为 Institution Resident
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
  },

  actions: {
    // 设置 token
    setToken(token: string | null) {
      this.accessToken = token
      if (token) {
        setToken(token)
      } else {
        localStorage.removeItem('ACCESS_TOKEN')
      }
    },

    // 设置刷新 token
    setRefreshToken(refreshToken: string | null) {
      this.refreshToken = refreshToken
      if (refreshToken) {
        setRefreshToken(refreshToken)
      } else {
        localStorage.removeItem('REFRESH_TOKEN')
      }
    },

    // 设置用户信息
    setUserInfo(userInfo: UserInfo | null) {
      this.userInfo = userInfo
      this.lastUpdateTime = Date.now()
      if (userInfo) {
        setAuthCache(USER_INFO_KEY, userInfo)
      } else {
        localStorage.removeItem(USER_INFO_KEY)
      }
    },

    // 设置机构信息
    setInstitutionInfo(info: InstitutionInfo | null) {
      this.institutionInfo = info
      if (info) {
        setInstitutionInfo(info)
      } else {
        clearInstitutionInfo()
      }
    },

    // 设置角色列表
    setRoleList(roleList: string[]) {
      this.roleList = roleList
      if (roleList.length > 0) {
        setAuthCache(ROLES_KEY, roleList)
      } else {
        localStorage.removeItem(ROLES_KEY)
      }
    },

    // 登录
    async login(params: LoginParams): Promise<LoginResult> {
      const result = await loginApi(params)
      
      // 保存 token
      this.setToken(result.accessToken)
      this.setRefreshToken(result.refreshToken)
      
      // 保存机构信息（Tenant 表）
      if (result.tenant_id && result.tenant_name) {
        this.setInstitutionInfo({
          tenant_id: result.tenant_id,
          tenant_name: result.tenant_name,
          domain: result.domain,
        })
      }
      
      // 保存用户信息（登录时一次性返回完整信息，包含 homePath 和 avatar）
      this.setUserInfo({
        userId: result.userId,
        user_account: result.user_account || '', // 用户账号（非敏感，用于显示和标识）
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
      
      return result
    },

    // 获取用户信息（用于刷新用户信息，登录时不需要调用，因为 login 已返回完整信息）
    async getUserInfoAction(): Promise<UserInfo | null> {
      if (!this.getToken) {
        return null
      }
      
      // TODO: 实现 getUserInfoApi
      // const userInfo = await getUserInfoApi()
      // this.setUserInfo(userInfo)
      
      // 设置角色列表（如果有）
      const userInfo = this.getUserInfo
      if (userInfo?.role) {
        this.setRoleList([userInfo.role])
      }
      
      return userInfo
    },

    // 登录后的操作（加载路由等，不需要获取用户信息，因为 login 已返回完整信息）
    async afterLoginAction(goHome = true): Promise<UserInfo | null> {
      if (!this.getToken) {
        return null
      }
      
      // 从 store 获取用户信息（登录时已保存）
      const userInfo = this.getUserInfo
      
      // TODO: 加载动态路由（如果需要）
      // const permissionStore = usePermissionStore()
      // if (!permissionStore.isDynamicAddedRoute) {
      //   const routes = await permissionStore.buildRoutesAction()
      //   routes.forEach((route) => {
      //     router.addRoute(route)
      //   })
      // }
      
      // 跳转到首页（如果需要）
      // 默认跳转到 monitoring/vital-focus（v1.0 中 staff/resident 的默认主页）
      if (goHome) {
        const router = (await import('@/router')).default
        router.push(userInfo?.homePath || '/monitoring/vital-focus')
      }
      
      return userInfo
    },

    // 刷新 token
    async refreshTokenAction(): Promise<string | null> {
      const currentRefreshToken = this.getRefreshToken
      if (!currentRefreshToken) {
        throw new Error('No refresh token available')
      }
      
      try {
        // TODO: 实现 refreshTokenApi
        // const data = await refreshTokenApi({ refreshToken: currentRefreshToken })
        
        // 保存新 token
        // this.setToken(data.accessToken)
        // this.setRefreshToken(data.refreshToken)
        
        // return data.accessToken
        throw new Error('refreshTokenApi not implemented yet')
      } catch (error) {
        // 刷新失败，清除 token 并跳转到登录页
        await this.logout(true)
        throw error
      }
    },

    // 登出
    async logout(goLogin = false) {
      if (this.getToken) {
        try {
          // TODO: 实现 logoutApi
          // const refreshToken = this.getRefreshToken
          // if (refreshToken) {
          //   await logoutApi({ refreshToken })
          // }
        } catch (error) {
          console.error('Logout API failed:', error)
        }
      }
      
      // 清除状态
      this.resetState()
      
      // 跳转到登录页
      if (goLogin) {
        const router = (await import('@/router')).default
        router.push('/login')
      }
    },

    // 重置状态
    resetState() {
      this.userInfo = null
      this.institutionInfo = null  // 清除机构信息
      this.accessToken = null
      this.refreshToken = null
      this.roleList = []
      this.lastUpdateTime = 0
      clearAuthCache()
    },
  },
})

// 在 setup 外使用（用于路由守卫、HTTP 拦截器等）
export function useUserStoreWithOut() {
  return useUserStore(store)
}

