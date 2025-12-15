# 权限检查调试指南

## 问题现象

选择 SystemAdmin 角色后，侧边栏显示了不应该显示的菜单项。

## 调试步骤

### 1. 检查控制台日志

打开浏览器控制台，查看是否有以下日志：

```
[UserStore] hasPagePermission: Role not in allowed list
```

如果有，说明权限检查正在工作，但返回了 `false`。如果没有，说明可能没有调用 `hasPagePermission` 或者有其他问题。

### 2. 检查测试角色

在控制台执行：
```javascript
localStorage.getItem('dev_test_role')
```

应该返回 `'SystemAdmin'`。

### 3. 检查用户信息

在控制台执行：
```javascript
// 需要先获取 store 实例
import { useUserStore } from '@/store/modules/user'
const store = useUserStore()
console.log('UserInfo:', store.getUserInfo)
console.log('Role:', store.getUserInfo?.role)
```

应该显示 `role: 'SystemAdmin'`。

### 4. 检查权限配置

在控制台执行：
```javascript
console.log('Page Permissions:', store.pagePermissions)
console.log('/monitoring/overview:', store.pagePermissions['/monitoring/overview'])
```

应该显示 `/monitoring/overview` 的权限列表，且不包含 `'SystemAdmin'`。

### 5. 手动测试权限检查

在控制台执行：
```javascript
store.hasPagePermission('/monitoring/overview')
```

应该返回 `false`（因为 SystemAdmin 不在允许列表中）。

## 可能的问题

### 问题1：hasPagePermission 没有正确获取测试角色

**检查**：确认 `hasPagePermission` 中使用的 `userInfo` 是通过 `this.getUserInfo` getter 获取的。

**当前代码**（第157行）：
```typescript
const userInfo = this.getUserInfo
```

✅ 正确，使用了 getter，应该会包含测试角色覆盖。

### 问题2：菜单过滤逻辑问题

**检查**：`Menu.vue` 中的 `filteredMenuItems` 是否正确调用了 `hasPagePermission`。

**当前代码**（第59-68行）：
```typescript
const filteredMenuItems = computed(() => {
  return menuItems.filter((item) => {
    if (item.path) {
      return userStore.hasPagePermission(item.path)
    }
    return true
  })
})
```

✅ 看起来正确。

### 问题3：默认主页问题

**问题**：`getUserHomePath` 默认返回 `/monitoring/overview`，但 SystemAdmin 不应该访问这个页面。

**影响**：SystemAdmin 登录后会被重定向到无权访问的页面。

## 建议的修复

### 修复1：修复默认主页逻辑

根据角色返回不同的默认主页：

```typescript
getUserHomePath(): string {
  const userInfo = this.getUserInfo
  // Prefer backend-returned homePath
  if (userInfo?.homePath) {
    return userInfo.homePath
  }
  
  // Default home page based on role
  const role = userInfo?.role
  if (role === 'SystemAdmin') {
    // SystemAdmin 默认主页：Device Store 或 Alarm Cloud
    return '/admin/device-store'
  }
  
  // Other roles default to monitoring overview
  return '/monitoring/overview'
}
```

### 修复2：添加调试日志

在 `hasPagePermission` 中添加更详细的日志：

```typescript
hasPagePermission(routePath: string | undefined | null): boolean {
  // ... existing code ...
  
  const userRole = userInfo.role
  if (import.meta.env.DEV) {
    console.log('[UserStore] hasPagePermission check', {
      path,
      userRole,
      allowedRoles,
      hasPermission: allowedRoles.includes(userRole),
    })
  }
  
  return allowedRoles.includes(userRole)
}
```




























