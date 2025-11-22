# Token 管理功能设计文档

## 功能概述

Token 管理是用户认证的核心功能，负责存储、获取、刷新和清除用户的访问令牌（Access Token）和刷新令牌（Refresh Token）。

## 当前状态

### ❌ 缺少的功能

1. **Token 存储工具**
   - 没有 `src/utils/auth/index.ts`
   - 没有统一的 token 存储和获取接口

2. **用户状态管理（Pinia Store）**
   - 没有 `src/store/modules/user.ts`
   - 无法管理 token、用户信息、角色

3. **Token 刷新机制**
   - 没有 token 刷新功能
   - HTTP 拦截器中有 TODO 注释（`src/utils/http/axios/index.ts` 第 35-36 行）

4. **登录后 Token 保存**
   - 登录成功后没有保存 token（`LoginForm.vue` 第 419 行有 TODO）

---

## 需要实现的功能

### 1. Token 存储工具 (`src/utils/auth/index.ts`)

#### 功能说明
提供统一的 token 存储和获取接口，支持 localStorage 和 sessionStorage。

#### 实现内容

```typescript
// Token 存储键名常量
export const TOKEN_KEY = 'ACCESS_TOKEN'
export const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN'
export const USER_INFO_KEY = 'USER_INFO'  // 包含 userId, userType, residentType, role
export const INSTITUTION_INFO_KEY = 'INSTITUTION_INFO'  // 机构信息
export const ROLES_KEY = 'ROLES'  // 角色列表（可选，如果需要多个角色）

// 获取 token
export function getToken(): string | null {
  return getAuthCache<string>(TOKEN_KEY)
}

// 设置 token
export function setToken(token: string): void {
  setAuthCache(TOKEN_KEY, token)
}

// 获取刷新 token
export function getRefreshToken(): string | null {
  return getAuthCache<string>(REFRESH_TOKEN_KEY)
}

// 设置刷新 token
export function setRefreshToken(refreshToken: string): void {
  setAuthCache(REFRESH_TOKEN_KEY, refreshToken)
}

// 获取认证缓存（通用）
export function getAuthCache<T>(key: string): T | null {
  // 使用 localStorage（或根据配置使用 sessionStorage）
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : null
}

// 设置认证缓存（通用）
export function setAuthCache(key: string, value: any): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// 获取机构信息
export function getInstitutionInfo(): InstitutionInfo | null {
  return getAuthCache<InstitutionInfo>(INSTITUTION_INFO_KEY)
}

// 设置机构信息
export function setInstitutionInfo(info: InstitutionInfo | null): void {
  if (info) {
    setAuthCache(INSTITUTION_INFO_KEY, info)
  } else {
    localStorage.removeItem(INSTITUTION_INFO_KEY)
  }
}

// 清除机构信息
export function clearInstitutionInfo(): void {
  localStorage.removeItem(INSTITUTION_INFO_KEY)
}

// 注意：InstitutionInfo 接口定义请参考 docs/store.md

// 清除认证缓存
export function clearAuthCache(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_INFO_KEY)
  localStorage.removeItem(INSTITUTION_INFO_KEY)
  localStorage.removeItem(ROLES_KEY)
}
```

---

### 2. 用户状态管理

#### 功能说明
使用 Pinia 管理用户状态，包括 token、用户信息、角色等。

**详细实现、类型定义和存储策略请参考：`docs/store.md`**

主要功能：
- `useUserStore` - 用户状态管理 Store
- `setToken()` / `getToken()` - Token 管理
- `setUserInfo()` / `getUserInfo()` - 用户信息管理
- `login()` - 登录
- `getUserInfoAction()` - 获取用户信息
- `refreshTokenAction()` - 刷新 Token
- `logout()` - 登出
- `resetState()` - 重置状态

---

### 3. Token 刷新机制 (`src/utils/http/axios/index.ts`)

#### 功能说明
在 HTTP 拦截器中处理 token 过期，自动刷新 token 并重试请求。

#### 实现内容

```typescript
// 在响应拦截器中添加 token 刷新逻辑
responseInterceptorsCatch: (axiosInstance: AxiosResponse, error: any) => {
  const config = error?.config || error?.response?.config
  const response = error?.response

  // 检查是否是 token 过期错误
  const isTokenExpiredError =
    response?.status === 401 && 
    response?.data?.code === ResultEnum.TOKEN_EXPIRED

  if (isTokenExpiredError && config && !config._retry) {
    config._retry = true // 标记已重试，避免无限循环

    try {
      // 动态导入 userStore 避免循环依赖
      const { useUserStoreWithOut } = await import('@/store/modules/user')
      const userStore = useUserStoreWithOut()
      
      // 刷新 token
      const newToken = await userStore.refreshTokenAction()
      
      // 更新请求头中的 token
      config.headers.Authorization = `Bearer ${newToken}`
      
      // 重试原请求
      return axiosInstance(config)
    } catch (refreshError) {
      // 刷新失败，跳转到登录页
      const router = (await import('@/router')).default
      router.push('/login')
      return Promise.reject(refreshError)
    }
  }

  // 其他错误处理...
  return Promise.reject(error)
}
```

---

### 4. 登录后 Token 保存 (`src/views/login/LoginForm.vue`)

#### 功能说明
登录成功后保存 token 到 store，获取用户信息，并跳转到首页。

#### 实现内容

```typescript
// 在 handleLogin 函数中
if (result) {
  message.success('Login successful!')
  
  // 1. 保存 token 到 store
  const { useUserStoreWithOut } = await import('@/store/modules/user')
  const userStore = useUserStoreWithOut()
  await userStore.login({
    account: formData.account,
    password: formData.password,
    userType: formData.userType,
    institutionId: formData.institutionId,
  })
  
  // 2. 获取用户信息
  await userStore.getUserInfoAction()
  
  // 3. 保存 "Remember me" 相关数据到 cookie
  if (formData.rememberMe) {
    setCookie('rememberMe', 'true', 30)
    setCookie('savedAccount', formData.account, 30)
    setCookie('savedUserType', formData.userType, 30)
    if (formData.institutionId) {
      setCookie('savedInstitutionId', formData.institutionId, 30)
    }
    if (formData.institutionName) {
      setCookie('savedInstitutionName', formData.institutionName, 30)
    }
  } else {
    deleteCookie('rememberMe')
    deleteCookie('savedAccount')
    deleteCookie('savedUserType')
    deleteCookie('savedInstitutionId')
    deleteCookie('savedInstitutionName')
  }
  
  // 4. 跳转到首页
  router.push('/dashboard') // 或根据用户角色跳转
}
```

---

## API 接口

### 需要实现的 API

1. **获取用户信息 API**
   ```typescript
   // src/api/auth/auth.ts
   export async function getUserInfoApi(): Promise<UserInfo> {
     return defHttp.get<UserInfo>({
       url: Api.GetUserInfo,
     })
   }
   ```

2. **刷新 Token API**
   ```typescript
   // src/api/auth/auth.ts
   export async function refreshTokenApi(params: { refreshToken: string }): Promise<{ accessToken: string; refreshToken: string }> {
     return defHttp.post<{ accessToken: string; refreshToken: string }>({
       url: Api.RefreshToken,
       params,
     })
   }
   ```

3. **登出 API**
   ```typescript
   // src/api/auth/auth.ts
   export async function logoutApi(params: { refreshToken: string }): Promise<void> {
     return defHttp.post<void>({
       url: Api.Logout,
       params,
     })
   }
   ```

---

## 类型定义

### 需要添加的类型

**注意**：
- `UserInfo` 和 `InstitutionInfo` 接口定义请参考 `docs/store.md`
- API 接口类型定义（`LoginParams`, `LoginResult` 等）请参考 `src/api/auth/model/authModel.ts`

---

## 实现步骤

### 第一步：创建 Token 存储工具
1. 创建 `src/utils/auth/index.ts`
2. 实现 `getToken`, `setToken`, `getAuthCache`, `setAuthCache` 等函数

### 第二步：创建用户状态管理
1. 创建 `src/store/modules/user.ts`
2. 实现 `useUserStore` 和所有 actions

### 第三步：实现 Token 刷新
1. 在 HTTP 拦截器中添加 token 刷新逻辑
2. 实现 `refreshTokenApi`

### 第四步：完善登录流程
1. 在 `LoginForm.vue` 中保存 token
2. 获取用户信息
3. 跳转到首页

### 第五步：实现登出功能
1. 实现 `logoutApi`
2. 在需要的地方调用 `userStore.logout()`

---

## 注意事项

1. **Token 格式**
   - Access Token 通常需要添加 `Bearer` 前缀
   - 在 HTTP 请求头中使用：`Authorization: Bearer ${token}`

2. **Token 存储位置**
   - 建议使用 `localStorage`（持久化）
   - 也可以根据配置使用 `sessionStorage`（会话级）

3. **安全性**
   - Token 存储在客户端，存在 XSS 风险
   - 建议使用 HttpOnly Cookie（需要后端支持）
   - 当前实现使用 localStorage，需要注意 XSS 防护

4. **Token 刷新时机**
   - 401 错误且错误码为 TOKEN_EXPIRED
   - 避免重复刷新（使用 `_retry` 标记）

5. **循环依赖**
   - 使用动态导入避免循环依赖
   - `userStore` 和 `router` 使用动态导入

