# 权限控制系统设计文档

## 概述

本文档描述前端权限控制系统的整体架构和实现方案，用于根据用户角色和权限控制页面访问、组件显示和功能操作。

## 权限控制层次

### 1. 路由级权限（Route-level Permission）

**位置：** `src/router/index.ts` 的 `beforeEach` 守卫

**职责：**
- 检查用户是否已登录
- 检查用户是否有权限访问特定路由
- 无权限时重定向到用户首页

**实现方式：**
```typescript
router.beforeEach((to, from, next) => {
  const userStore = useUserStoreWithOut()
  
  if (to.meta.requiresAuth) {
    // 检查登录状态
    if (!userStore.getToken) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
    
    // 检查页面访问权限
    if (!userStore.hasPagePermission(to.path)) {
      next({ path: userStore.getUserHomePath() })
      return
    }
  }
  
  next()
})
```

**配置位置：** `src/store/modules/user.ts` 的 `pagePermissions`

```typescript
const defaultPermissions: Record<string, string[]> = {
  '/admin/roles': ['Admin', 'Director', 'CO', 'IT'],
  '/admin/role-permissions': ['Admin', 'Director', 'CO', 'IT'],
  '/admin/users': ['Admin', 'Director', 'IT'],
}
```

---

### 2. 组件级权限（Component-level Permission）

**实现方式：** 使用组合式函数（Composable）统一管理权限检查

#### 2.1 创建权限检查 Composable

**文件：** `src/hooks/usePermission.ts`

```typescript
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
    if (!userInfo) return true // 开发环境默认权限
    
    const allowedRoles = ['Admin', 'Director', 'IT']
    const userRole = userInfo.role
    if (!userRole) return true // 开发环境默认权限
    
    return allowedRoles.some(role => 
      role.toLowerCase() === userRole.toLowerCase()
    )
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
```

#### 2.2 在组件中使用

```vue
<script setup lang="ts">
import { usePermission } from '@/hooks/usePermission'

const { hasManagePermission, hasPermission, isCurrentUser } = usePermission()
const userId = computed(() => route.params.id as string)
const canEdit = computed(() => isCurrentUser(userId.value) || hasManagePermission.value)
</script>

<template>
  <a-input
    v-model:value="userData.nickname"
    :disabled="!canEdit"
  />
  
  <a-button
    v-if="hasPermission('users.delete')"
    @click="deleteUser"
  >
    Delete
  </a-button>
</template>
```

---

### 3. 指令级权限（Directive-level Permission）

**实现方式：** 创建自定义指令 `v-permission`

**文件：** `src/directives/permission.ts`

```typescript
import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/modules/user'

/**
 * 权限指令
 * 用法：v-permission="'users.create'" 或 v-permission="['Admin', 'Director']"
 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const userStore = useUserStore()
    const userInfo = userStore.getUserInfo
    
    if (!userInfo) {
      // 开发环境默认显示
      return
    }
    
    const value = binding.value
    let hasPermission = false
    
    if (typeof value === 'string') {
      // 权限字符串，如 'users.create'
      hasPermission = checkPermission(value, userInfo)
    } else if (Array.isArray(value)) {
      // 角色数组，如 ['Admin', 'Director']
      hasPermission = value.some(role => 
        role.toLowerCase() === userInfo.role?.toLowerCase()
      )
    }
    
    if (!hasPermission) {
      el.style.display = 'none'
      // 或者移除元素
      // el.parentNode?.removeChild(el)
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    // 权限变化时重新检查
    // 实现逻辑同 mounted
  },
}

function checkPermission(permission: string, userInfo: any): boolean {
  // 权限检查逻辑
  // TODO: 实现基于 role-permissions 表的检查
  return true
}
```

**注册指令：** `src/main.ts`

```typescript
import { permission } from '@/directives/permission'

app.directive('permission', permission)
```

**使用方式：**

```vue
<template>
  <a-button v-permission="'users.create'">Create User</a-button>
  <a-button v-permission="['Admin', 'Director']">Admin Only</a-button>
</template>
```

---

## 权限控制最佳实践

### 1. 统一使用 Composable

**推荐：** 在组件中使用 `usePermission()` 获取权限状态

```typescript
const { hasManagePermission, hasPermission } = usePermission()
```

**不推荐：** 直接在组件中访问 `userStore.getUserInfo.role`

### 2. 权限检查的优先级

1. **功能权限**（最细粒度）：`hasPermission('users.create')`
2. **角色权限**（中等粒度）：`hasRole(['Admin', 'Director'])`
3. **管理权限**（粗粒度）：`hasManagePermission`

### 3. 字段级权限控制

**场景：** 某些字段只有管理员可以编辑，用户只能编辑自己的部分字段

```vue
<template>
  <!-- 用户总是可以编辑自己的昵称 -->
  <a-input
    v-model:value="userData.nickname"
    :disabled="!canEditNickname"
  />
  
  <!-- 只有管理员可以编辑角色 -->
  <a-select
    v-model:value="userData.role"
    :disabled="!hasManagePermission"
  />
</template>

<script setup>
const { hasManagePermission, isCurrentUser } = usePermission()
const canEditNickname = computed(() => 
  isCurrentUser(userId.value) || hasManagePermission.value
)
</script>
```

### 4. 按钮/操作权限控制

**方式 1：** 使用 `v-if` 完全隐藏

```vue
<a-button v-if="hasPermission('users.delete')" @click="deleteUser">
  Delete
</a-button>
```

**方式 2：** 使用 `:disabled` 禁用但显示

```vue
<a-button 
  :disabled="!hasPermission('users.delete')" 
  @click="deleteUser"
>
  Delete
</a-button>
```

**选择原则：**
- 如果操作对用户不可见，使用 `v-if`
- 如果需要提示用户为什么不能操作，使用 `:disabled` + tooltip

---

## 权限数据来源

### 当前实现（简化版）

- **角色信息：** 从 `LoginResult.role` 获取，存储在 `userStore.userInfo.role`
- **页面权限：** 硬编码在 `userStore.pagePermissions`
- **功能权限：** 暂时基于角色判断

### 未来实现（完整版）

- **角色信息：** 从 `LoginResult.role` 获取
- **权限信息：** 从 `role-permissions` 表获取，存储在 `userStore.permissions`
- **动态权限：** 支持后端返回的权限列表，前端动态检查

---

## 开发环境默认权限

为了便于开发，在以下情况下默认返回 `true`（有权限）：

1. 没有用户信息（`!userInfo`）
2. 没有角色信息（`!userInfo.role`）

**注意：** 生产环境应该严格检查权限，不允许默认权限。

---

## 总结

权限控制系统分为三个层次：

1. **路由级：** 控制页面访问（`router.beforeEach`）
2. **组件级：** 控制组件显示和功能（`usePermission` Composable）
3. **指令级：** 控制 DOM 元素显示（`v-permission` 指令）

**推荐使用方式：**
- 页面访问：路由守卫
- 组件/按钮：`usePermission` Composable
- 简单隐藏：`v-permission` 指令

