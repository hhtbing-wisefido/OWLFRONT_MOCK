# 状态管理（Pinia Store）设计文档

## 功能概述

使用 Pinia 进行全局状态管理，管理用户信息、应用配置、权限等全局状态。

本文档包含：
- Store 架构设计
- 用户信息类型定义（UserInfo, InstitutionInfo）
- 存储策略（哪些信息存储，哪些不存储）
- HIPAA 合规要求

## 当前状态

### ❌ 缺少的功能

1. **Store 目录结构**
   - 没有 `src/store/` 目录
   - 没有 `src/store/index.ts`（Store 入口文件）

2. **用户状态管理**
   - 没有 `src/store/modules/user.ts`
   - 无法管理 token、用户信息、角色

3. **应用状态管理**
   - 没有 `src/store/modules/app.ts`
   - 无法管理应用配置、主题等

---

## Store 目录结构

```
src/store/
├── index.ts              # Store 入口文件
└── modules/
    ├── user.ts           # 用户状态管理
    ├── app.ts            # 应用状态管理（可选）
    └── permission.ts    # 权限状态管理（可选）
```

---

## 1. Store 入口文件 (`src/store/index.ts`)

### 功能说明
创建 Pinia 实例，导出 store。

### 实现内容

```typescript
import { createPinia } from 'pinia'

const store = createPinia()

export { store }

// 导出所有 store，方便在 setup 外使用
export * from './modules/user'
// export * from './modules/app'
// export * from './modules/permission'
```

---

## 2. 用户信息类型定义

### UserInfo 接口

```typescript
/**
 * 用户信息接口
 * 仅包含非敏感信息，符合 HIPAA 合规要求
 */
export interface UserInfo {
  // 基本信息（仅非敏感信息）
  userId: string                    // 用户 ID（非敏感）
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
  
  // 注意：以下敏感信息不存储到本地（HIPAA 合规）
  // username?: string              // 不存储（敏感信息）
  // email?: string                 // 不存储（PHI，敏感信息）
  // phone?: string                 // 不存储（PHI，敏感信息）
  // building, floor, area_id, door_number 等详细地址信息不存储（可能包含敏感信息）
}
```

### InstitutionInfo 接口

```typescript
/**
 * 机构信息接口
 * 对应 tenants 表
 */
export interface InstitutionInfo {
  tenant_id: string            // 机构 ID（对应 tenants.tenant_id）
  tenant_name: string          // 机构名称（对应 tenants.tenant_name）
  domain?: string             // 机构域名（对应 tenants.domain）
}
```

### 存储策略说明

#### ✅ 必须存储（持久化到 localStorage）

1. **用户基本信息**（UserInfo）
   - `userId`, `userType`, `residentType`, `locationType`, `role`, `nickName`
   - 存储原因：页面刷新后需要恢复用户信息，路由守卫需要判断用户类型和权限

2. **机构信息**（InstitutionInfo）
   - `tenant_id`, `tenant_name`, `domain`
   - 存储原因：跨机构登录时，需要记住用户选择的机构，页面显示当前机构名称

3. **Location 信息**
   - `locationTag`, `locationName`
   - 存储原因：用于页面显示和路由，不包含 PHI，符合 HIPAA 要求

4. **Token 信息**
   - `accessToken`, `refreshToken`
   - 存储原因：认证必需，页面刷新后需要恢复登录状态

#### ❌ 不存储（HIPAA 合规）

1. **敏感信息**
   - `email`, `phone` - PHI，敏感信息
   - `username` - 可能包含敏感信息
   - `building`, `floor`, `area_id`, `door_number` - 详细地址信息，可能包含敏感信息

2. **PIN 码**
   - 服务器验证（类似密码），不能本地存储

3. **详细权限信息**
   - `role_permissions` - 详细的权限信息不存储（由后台控制）

#### 关于 role 存储的说明

- `role` 是角色编码（如 'Admin', 'Nurse'），是**公开的角色标识**，不是敏感的个人信息
- 用于前端控制页面展示（菜单、按钮的显示/隐藏）
- **真实的权限控制仍在后台**（role_permissions 表）
- 前端仅用于 UI 展示控制，不用于安全验证

#### 关于页面访问权限的说明

- `pagePermissions` 存储页面访问权限配置：`{ routePath: [allowedRoles] }`
- 登录时自动初始化：调用 `initPagePermissions()` 设置默认页面权限配置
- **Admin 模块访问控制**：
  - 整个 `/admin` 路径下的所有页面仅对 `staff` 用户开放
  - `residents` 用户无法访问 admin 模块（在 `hasPagePermission()` 中检查 `userType`）
  - 在 staff 用户中，还需要检查角色权限（如 admin/Director/CO/IT）
- 权限检查流程：
  1. 首先检查用户类型（admin 模块仅允许 staff）
  2. 然后检查用户角色是否在允许列表中
  3. 如果不符合条件，路由守卫会重定向到用户首页

#### 关于 residentType 和 locationType 的说明

- `residentType`: 对应 `residents.is_institutional` (TRUE = 'institution', FALSE = 'home')
- `locationType`: 对应 `locations.location_type` (当前用户关联的 location 类型)
- 两者可能不同：例如，Resident 是 home 类型，但其 location 可能是 institution 类型
- 用于区分 home/institution 场景，控制页面展示和功能访问

#### 关于 locationTag 和 locationName 的说明

- `locationTag`: 位置标签（如 "A 院区主楼"、"Spring 区域组SP"），用于分组和路由，不包含 PHI
- `locationName`: 位置名称（如 "E203"、"201"、"Home-001"），用于卡片显示，不包含 PHI
- 真实地址信息（如城市、州省、邮编等）存储在加密的 `resident_phi` 表中，不在此处存储
- 这些字段符合 HIPAA 要求，不包含敏感信息
- **避免地址泄漏**：仅存储非敏感的位置标识，不存储详细地址信息

---

## 3. 用户状态管理 (`src/store/modules/user.ts`)

### 功能说明
管理用户认证状态，包括 token、用户信息、角色等。

### 实现内容

```typescript
import { defineStore } from 'pinia'
import type { UserInfo, LoginParams, LoginResult } from '@/api/auth/model/authModel'
import type { InstitutionInfo } from '@/utils/auth'  // 从 auth 工具导入
import { 
  getToken, 
  setToken, 
  getRefreshToken, 
  setRefreshToken,
  getAuthCache,
  setAuthCache,
  clearAuthCache 
} from '@/utils/auth'
import { loginApi, getUserInfoApi, refreshTokenApi, logoutApi } from '@/api/auth/auth'
import { store } from '../index'

interface UserState {
  userInfo: UserInfo | null
  institutionInfo: InstitutionInfo | null  // 机构信息（Tenant 表）
  accessToken: string | null
  refreshToken: string | null
  roleList: string[]
  pagePermissions: Record<string, string[]>  // 页面访问权限：{ routePath: [allowedRoles] }
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
    pagePermissions: {},  // 页面访问权限
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
      return this.userInfo || getAuthCache<UserInfo>('USER_INFO')
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
        : getAuthCache<string[]>('ROLES') || []
    },
    
    getLastUpdateTime(): number {
      return this.lastUpdateTime
    },
    
    // 检查是否有页面访问权限
    hasPagePermission(routePath: string): boolean {
      const userInfo = this.getUserInfo
      if (!userInfo) {
        return false
      }
      
      // Admin 模块仅允许 staff 用户访问
      if (routePath.startsWith('/admin')) {
        if (userInfo.userType !== 'staff') {
          return false
        }
      }
      
      const allowedRoles = this.pagePermissions[routePath]
      if (!allowedRoles || allowedRoles.length === 0) {
        // 如果没有配置权限，默认允许访问
        return true
      }
      const userRole = userInfo.role
      if (!userRole) {
        return false
      }
      return allowedRoles.includes(userRole)
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
        setAuthCache('USER_INFO', userInfo)
      } else {
        localStorage.removeItem('USER_INFO')
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
        setAuthCache('ROLES', roleList)
      } else {
        localStorage.removeItem('ROLES')
      }
    },
    
    // 设置页面访问权限
    setPagePermissions(permissions: Record<string, string[]>) {
      this.pagePermissions = permissions
      // 页面权限可以存储在 localStorage 中，但通常不需要持久化（每次登录时重新设置）
    },
    
    // 初始化页面访问权限（根据角色配置）
    initPagePermissions() {
      // 默认页面权限配置
      // 注意：Admin 模块仅允许 staff 用户访问（在 hasPagePermission 中检查 userType）
      const defaultPermissions: Record<string, string[]> = {
        '/admin/roles': ['Admin', 'Director', 'CO', 'IT'],
        '/admin/role-permissions': ['Admin', 'Director', 'CO', 'IT'],
        // 可以根据需要添加更多 admin 页面的权限配置
      }
      this.setPagePermissions(defaultPermissions)
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
      
      // 设置角色列表
      if (result.role) {
        this.setRoleList([result.role])
      }
      
      // 初始化页面访问权限
      this.initPagePermissions()
      
      return result
    },

    // 获取用户信息（用于刷新用户信息，登录时不需要调用，因为 login 已返回完整信息）
    async getUserInfoAction(): Promise<UserInfo | null> {
      if (!this.getToken) {
        return null
      }
      
      const userInfo = await getUserInfoApi()
      this.setUserInfo(userInfo)
      
      // 设置角色列表（如果有）
      if (userInfo.role) {
        this.setRoleList([userInfo.role])
      }
      
      // 初始化页面访问权限
      this.initPagePermissions()
      
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
      if (goHome) {
        const router = (await import('@/router')).default
        router.push(userInfo?.homePath || '/dashboard')
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
        const data = await refreshTokenApi({ refreshToken: currentRefreshToken })
        
        // 保存新 token
        this.setToken(data.accessToken)
        this.setRefreshToken(data.refreshToken)
        
        return data.accessToken
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
          const refreshToken = this.getRefreshToken
          if (refreshToken) {
            await logoutApi({ refreshToken })
          }
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
      this.pagePermissions = {}
      this.lastUpdateTime = 0
      clearAuthCache()
    },
  },
})

// 在 setup 外使用（用于路由守卫、HTTP 拦截器等）
export function useUserStoreWithOut() {
  return useUserStore(store)
}
```

---

## 3. 应用状态管理 (`src/store/modules/app.ts`) - 可选

### 功能说明
管理应用全局配置，如主题、语言、布局等。

### 实现内容（示例）

```typescript
import { defineStore } from 'pinia'
import { store } from '../index'

interface AppState {
  theme: 'light' | 'dark'
  locale: string
  collapsed: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    theme: 'light',
    locale: 'en',
    collapsed: false,
  }),

  getters: {
    getTheme(): 'light' | 'dark' {
      return this.theme
    },
  },

  actions: {
    setTheme(theme: 'light' | 'dark') {
      this.theme = theme
    },
    
    setLocale(locale: string) {
      this.locale = locale
    },
    
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    },
  },
})

export function useAppStoreWithOut() {
  return useAppStore(store)
}
```

---

## 4. 权限状态管理 (`src/store/modules/permission.ts`) - 可选

### 功能说明
管理路由权限，动态加载路由。

### 实现内容（示例，根据需求实现）

```typescript
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import { store } from '../index'

interface PermissionState {
  routes: RouteRecordRaw[]
  isDynamicAddedRoute: boolean
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routes: [],
    isDynamicAddedRoute: false,
  }),

  getters: {
    getRoutes(): RouteRecordRaw[] {
      return this.routes
    },
    
    isDynamicAddedRoute(): boolean {
      return this.isDynamicAddedRoute
    },
  },

  actions: {
    // 构建路由（根据用户角色动态加载）
    async buildRoutesAction(): Promise<RouteRecordRaw[]> {
      // TODO: 根据用户角色从后端获取路由配置
      // 或根据角色过滤静态路由
      const routes: RouteRecordRaw[] = []
      
      this.routes = routes
      return routes
    },
    
    setDynamicAddedRoute(added: boolean) {
      this.isDynamicAddedRoute = added
    },
    
    resetState() {
      this.routes = []
      this.isDynamicAddedRoute = false
    },
  },
})

export function usePermissionStoreWithOut() {
  return usePermissionStore(store)
}
```

---

## 在 main.ts 中使用

### 更新 `src/main.ts`

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import './style.css'
import App from './App.vue'
import router from './router'
import { store } from './store' // 使用统一的 store

const app = createApp(App)

// 使用 Pinia（使用统一的 store 实例）
app.use(store)

// 使用 Ant Design Vue
app.use(Antd)

// 使用 Router
app.use(router)

app.mount('#app')
```

---

## Store 使用模式

### 在组件中使用

```typescript
<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

// 获取 token
const token = userStore.getToken

// 获取用户信息
const userInfo = userStore.getUserInfo

// 调用 action
await userStore.login(params)
</script>
```

### 在 setup 外使用（路由守卫、HTTP 拦截器等）

```typescript
import { useUserStoreWithOut } from '@/store/modules/user'

const userStore = useUserStoreWithOut()
const token = userStore.getToken
```

---

## 实现步骤

### 第一步：创建 Store 目录结构
1. 创建 `src/store/index.ts`
2. 创建 `src/store/modules/` 目录

### 第二步：实现用户 Store
1. 创建 `src/store/modules/user.ts`
2. 实现所有 getters 和 actions

### 第三步：更新 main.ts
1. 使用统一的 store 实例
2. 确保 Pinia 正确初始化

### 第四步：可选 Store（根据需求）
1. 创建 `src/store/modules/app.ts`（如果需要）
2. 创建 `src/store/modules/permission.ts`（如果需要）

---

## 注意事项

1. **Store 实例**
   - 使用统一的 `store` 实例，确保在 setup 外也能使用
   - 通过 `useUserStoreWithOut()` 在路由守卫、HTTP 拦截器中使用

2. **状态持久化**
   - Token 和用户信息存储在 localStorage
   - Store 中的状态是内存中的，刷新页面后从 localStorage 恢复

3. **循环依赖**
   - 避免 store 之间的循环依赖
   - 使用动态导入避免循环依赖（如 router）

4. **TypeScript 类型**
   - 定义清晰的 State 接口
   - 导出类型供其他模块使用

5. **Getters 设计**
   - Getters 应该优先从 state 读取
   - 如果 state 为空，再从 localStorage 读取（持久化）

---

## 参考

- Pinia 官方文档：https://pinia.vuejs.org/
- 原框架实现：`../wisefido-frontend/wisefido-platform-vue/src/store/modules/user.ts`
- Token 管理：`docs/token.md` - Token 存储工具函数
- API 接口类型：`src/api/auth/model/authModel.ts` - API 接口类型定义（LoginParams, LoginResult 等）

