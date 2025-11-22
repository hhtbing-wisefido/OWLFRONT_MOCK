# 路由管理功能设计文档

## 功能概述

路由管理负责页面导航、权限控制、路由守卫等功能，确保用户只能访问有权限的页面。

## 当前状态

### ❌ 缺少的功能

1. **路由守卫**
   - 没有 `src/router/guard/permissionGuard.ts`
   - 没有 `src/router/guard/stateGuard.ts`
   - 没有登录状态检查，所有页面都可以直接访问

2. **首页/仪表板路由**
   - 没有首页路由
   - 登录后不知道跳转到哪里

3. **路由元信息使用**
   - 路由 meta 中有 `requiresAuth`，但没有在守卫中使用

4. **404 错误页面**
   - 没有 404 页面
   - 没有错误处理路由

---

## 需要实现的功能

### 1. 路由守卫 - 权限守卫 (`src/router/guard/permissionGuard.ts`)

#### 功能说明
检查用户登录状态和权限，控制页面访问。

#### 实现内容

```typescript
import type { Router, RouteLocationNormalized } from 'vue-router'
import { useUserStoreWithOut } from '@/store/modules/user'
import { PageEnum } from '@/enums/pageEnum'

const LOGIN_PATH = PageEnum.BASE_LOGIN || '/login'
const WHITE_LIST = [LOGIN_PATH, '/forgot-password', '/test-data'] // 白名单路由

export function createPermissionGuard(router: Router) {
  const userStore = useUserStoreWithOut()
  
  router.beforeEach(async (to, from, next) => {
    // 白名单路由可以直接访问
    if (WHITE_LIST.includes(to.path)) {
      // 如果已登录，访问登录页时跳转到首页
      if (to.path === LOGIN_PATH && userStore.getToken) {
        next('/dashboard')
        return
      }
      next()
      return
    }

    // 检查 token
    const token = userStore.getToken

    // 没有 token，跳转到登录页
    if (!token) {
      // 如果路由不需要认证，允许访问
      if (to.meta.requiresAuth === false) {
        next()
        return
      }

      // 跳转到登录页，并保存目标路由用于登录后跳转
      next({
        path: LOGIN_PATH,
        query: {
          redirect: to.fullPath, // 保存完整路径，包括查询参数
        },
        replace: true,
      })
      return
    }

    // 有 token，检查用户信息
    if (!userStore.getUserInfo || userStore.getLastUpdateTime === 0) {
      try {
        // 获取用户信息
        await userStore.getUserInfoAction()
      } catch (error) {
        // 获取用户信息失败，清除 token 并跳转到登录页
        await userStore.logout(true)
        next({
          path: LOGIN_PATH,
          query: {
            redirect: to.fullPath,
          },
          replace: true,
        })
        return
      }
    }

    // 检查路由权限（如果需要）
    // TODO: 根据用户角色检查路由权限

    // 允许访问
    next()
  })
}
```

---

### 2. 路由守卫 - 状态守卫 (`src/router/guard/stateGuard.ts`)

#### 功能说明
在路由切换后清理状态，确保进入登录页时清除认证信息。

#### 实现内容

```typescript
import type { Router } from 'vue-router'
import { useUserStoreWithOut } from '@/store/modules/user'
import { PageEnum } from '@/enums/pageEnum'

const LOGIN_PATH = PageEnum.BASE_LOGIN || '/login'

export function createStateGuard(router: Router) {
  router.afterEach((to) => {
    // 进入登录页时清除认证信息
    if (to.path === LOGIN_PATH) {
      const userStore = useUserStoreWithOut()
      userStore.resetState()
    }
  })
}
```

---

### 3. 路由配置更新 (`src/router/index.ts`)

#### 功能说明
注册路由守卫，添加首页路由，完善路由配置。

#### 实现内容

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { createPermissionGuard } from './guard/permissionGuard'
import { createStateGuard } from './guard/stateGuard'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: {
      title: 'Login',
      requiresAuth: false, // 不需要登录
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/forgot-password/ForgotPassword.vue'),
    meta: {
      title: 'Forgot Password',
      requiresAuth: false, // 不需要登录
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/Dashboard.vue'),
    meta: {
      title: 'Dashboard',
      requiresAuth: true, // 需要登录
    },
  },
  {
    path: '/test-data',
    name: 'TestDataViewer',
    component: () => import('@/views/test/TestDataViewer.vue'),
    meta: {
      title: 'Test Data Viewer',
      requiresAuth: false, // 测试页面，不需要登录
    },
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '404 Not Found',
      requiresAuth: false,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 注册路由守卫
export function setupRouterGuard() {
  createPermissionGuard(router)
  createStateGuard(router)
}

// 初始化路由守卫
setupRouterGuard()

export default router
```

---

### 4. 首页/仪表板页面 (`src/views/dashboard/Dashboard.vue`)

#### 功能说明
创建首页/仪表板页面，作为登录后的默认页面。

#### 实现内容

```vue
<template>
  <div class="dashboard-container">
    <h1>Dashboard</h1>
    <p>Welcome, {{ userInfo?.username || 'User' }}!</p>
    <p>Institution: {{ userInfo?.institutionName }}</p>
    <Button @click="handleLogout">Logout</Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from 'ant-design-vue'
import { useUserStoreWithOut } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStoreWithOut()

const userInfo = computed(() => userStore.getUserInfo)

const handleLogout = async () => {
  await userStore.logout(true)
}
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
}
</style>
```

---

### 5. 404 错误页面 (`src/views/error/404.vue`)

#### 功能说明
创建 404 错误页面，处理未匹配的路由。

#### 实现内容

```vue
<template>
  <div class="error-container">
    <h1>404</h1>
    <p>Page Not Found</p>
    <Button type="primary" @click="goHome">Go Home</Button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from 'ant-design-vue'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
```

---

### 6. 页面枚举 (`src/enums/pageEnum.ts`)

#### 功能说明
定义页面路径常量，统一管理路由路径。

#### 实现内容

```typescript
export enum PageEnum {
  // 基础登录路径
  BASE_LOGIN = '/login',
  BASE_FALLBACK = '/offline',
  
  // 基础首页路径
  BASE_HOME = '/dashboard',
  
  // 错误页面路径
  ERROR_PAGE = '/exception',
  ERROR_LOG_PAGE = '/error-log/list',
}
```

---

### 7. 登录后跳转逻辑 (`src/views/login/LoginForm.vue`)

#### 功能说明
登录成功后，根据 redirect 参数或默认跳转到首页。

#### 实现内容

```typescript
// 在 handleLogin 函数中
if (result) {
  message.success('Login successful!')
  
  // 保存 token 和用户信息（见 token.md）
  const { useUserStoreWithOut } = await import('@/store/modules/user')
  const userStore = useUserStoreWithOut()
  await userStore.login({...})
  await userStore.getUserInfoAction()
  
  // 保存 "Remember me" 相关数据...
  
  // 跳转逻辑
  const redirect = router.currentRoute.value.query.redirect as string
  if (redirect) {
    // 跳转到目标页面
    router.push(redirect)
  } else {
    // 跳转到首页
    router.push('/dashboard')
  }
}
```

---

## 路由元信息（Meta）

### Meta 字段说明

```typescript
interface RouteMeta {
  title?: string           // 页面标题
  requiresAuth?: boolean  // 是否需要登录（默认 true）
  ignoreAuth?: boolean    // 是否忽略权限检查
  roles?: string[]        // 允许访问的角色列表
  hideMenu?: boolean      // 是否在菜单中隐藏
  hideBreadcrumb?: boolean // 是否隐藏面包屑
}
```

### 使用示例

```typescript
{
  path: '/dashboard',
  name: 'Dashboard',
  component: () => import('@/views/dashboard/Dashboard.vue'),
  meta: {
    title: 'Dashboard',
    requiresAuth: true,    // 需要登录
    roles: ['admin', 'staff'], // 允许的角色
  },
}
```

---

## 实现步骤

### 第一步：创建路由守卫
1. 创建 `src/router/guard/permissionGuard.ts`
2. 创建 `src/router/guard/stateGuard.ts`
3. 在 `src/router/index.ts` 中注册守卫

### 第二步：创建页面枚举
1. 创建 `src/enums/pageEnum.ts`
2. 定义页面路径常量

### 第三步：添加首页路由
1. 创建 `src/views/dashboard/Dashboard.vue`
2. 在路由配置中添加首页路由

### 第四步：添加 404 页面
1. 创建 `src/views/error/404.vue`
2. 在路由配置中添加 404 路由

### 第五步：完善登录跳转
1. 在 `LoginForm.vue` 中实现跳转逻辑
2. 支持 redirect 参数

---

## 注意事项

1. **路由守卫顺序**
   - 权限守卫应该在状态守卫之前执行
   - 确保在检查权限前先检查登录状态

2. **白名单路由**
   - 登录页、忘记密码页等不需要登录的页面应该加入白名单
   - 避免登录页的重定向循环

3. **Redirect 参数**
   - 保存完整路径（包括查询参数）
   - 登录成功后跳转到目标页面

4. **动态路由**
   - 如果需要根据用户角色动态加载路由，可以在权限守卫中实现
   - 参考原框架的 `permissionStore.buildRoutesAction()`

5. **404 路由**
   - 使用 `/:pathMatch(.*)*` 匹配所有未匹配的路由
   - 放在路由配置的最后

