# 权限检查问题分析

## 问题描述

当选择 SystemAdmin 角色时，侧边栏显示了不应该显示的菜单项：
- Monitoring Overview
- Alarm Records
- Alarm Settings
- Resident Management
- Card Overview
- Device Management
- Unit Management

但根据权限表，SystemAdmin 不应该访问这些页面。

## 问题分析

### 1. 权限检查逻辑

`hasPagePermission` 函数（第148-237行）的逻辑：

```typescript
// 对于非 /admin 路径
const allowedRoles = this.pagePermissions[path]
if (!allowedRoles || allowedRoles.length === 0) {
  // ⚠️ 问题：如果没有权限配置，默认允许访问！
  return true
}
const userRole = userInfo.role
const hasPermission = allowedRoles.includes(userRole)
return hasPermission
```

### 2. 测试角色覆盖

`getUserInfo` getter（第91-104行）会检查测试角色：

```typescript
if (import.meta.env.DEV && userInfo) {
  const testRole = localStorage.getItem('dev_test_role')
  if (testRole) {
    return {
      ...userInfo,
      role: testRole, // 覆盖为测试角色
    }
  }
}
```

### 3. 预期行为

当选择 SystemAdmin 时：
- `userInfo.role` = `'SystemAdmin'`（从测试角色覆盖）
- 对于 `/monitoring/overview`：
  - `allowedRoles` = `['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family']`
  - `hasPermission` = `allowedRoles.includes('SystemAdmin')` = `false`
  - 应该返回 `false`，菜单应该被过滤掉

### 4. 可能的问题

#### 问题A：默认主页问题

`getUserHomePath`（第135-143行）：
```typescript
getUserHomePath(): string {
  const userInfo = this.getUserInfo
  if (userInfo?.homePath) {
    return userInfo.homePath
  }
  // ⚠️ 问题：默认主页是 /monitoring/overview，但 SystemAdmin 不应该访问
  return '/monitoring/overview'
}
```

**影响**：SystemAdmin 登录后会被重定向到 `/monitoring/overview`，但该页面不应该被访问。

#### 问题B：hasPagePermission 可能没有正确检查

需要验证：
1. `hasPagePermission` 是否真的被调用
2. 返回的值是什么
3. 是否有其他地方绕过了权限检查

## 需要检查的点

1. **控制台日志**：检查是否有 `[UserStore] hasPagePermission` 的警告日志
2. **菜单过滤**：确认 `filteredMenuItems` 是否正确调用了 `hasPagePermission`
3. **默认主页**：SystemAdmin 的默认主页应该是什么？

## 建议的修复

### 修复1：修复默认主页

SystemAdmin 的默认主页应该是 SystemAdmin 可以访问的页面，比如 `/admin/device-store` 或 `/admin/alarm-cloud`。

### 修复2：确保权限检查正确

添加调试日志，确认 `hasPagePermission` 的返回值。




















