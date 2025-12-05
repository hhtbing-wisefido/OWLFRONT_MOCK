# 权限问题修复总结

## 发现的问题

### 问题1：默认主页问题 ✅ 已修复

**问题**：
- `getUserHomePath` 默认返回 `/monitoring/overview`
- SystemAdmin 登录后会被重定向到无权访问的页面

**修复**：
- SystemAdmin 的默认主页改为 `/admin/device-store`
- 其他角色仍使用 `/monitoring/overview`

### 问题2：权限检查逻辑

**当前逻辑**：
1. `hasPagePermission` 使用 `this.getUserInfo` 获取用户信息（包含测试角色覆盖）
2. 检查 `userInfo.role` 是否在 `allowedRoles` 列表中
3. 如果不在，应该返回 `false`

**预期行为**：
- SystemAdmin 访问 `/monitoring/overview` 时：
  - `userRole` = `'SystemAdmin'`
  - `allowedRoles` = `['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family']`
  - `hasPermission` = `false`
  - 应该返回 `false`，菜单应该被过滤掉

## 调试步骤

### 1. 检查控制台日志

刷新页面后，查看控制台是否有以下日志：

**如果权限检查正确**：
```
[UserStore] hasPagePermission: Role not in allowed list - DENIED
  path: "/monitoring/overview"
  userRole: "SystemAdmin"
  allowedRoles: ["Admin", "Manager", "IT", "Nurse", "Caregiver", "Resident", "Family"]
```

**如果权限检查有问题**：
- 没有日志 → 可能没有调用 `hasPagePermission`
- 显示 "GRANTED" → 说明 `hasPermission` 返回了 `true`，需要检查原因

### 2. 检查测试角色

在控制台执行：
```javascript
localStorage.getItem('dev_test_role')
// 应该返回: "SystemAdmin"
```

### 3. 检查用户信息

在控制台执行：
```javascript
// 需要先导入 store
import { useUserStore } from '@/store/modules/user'
const store = useUserStore()
console.log('UserInfo:', store.getUserInfo)
console.log('Role:', store.getUserInfo?.role)
// 应该显示: role: "SystemAdmin"
```

### 4. 手动测试权限检查

在控制台执行：
```javascript
store.hasPagePermission('/monitoring/overview')
// 应该返回: false
```

## 可能的原因

### 原因1：pagePermissions 未正确初始化

**检查**：
```javascript
console.log('Page Permissions:', store.pagePermissions)
console.log('/monitoring/overview:', store.pagePermissions['/monitoring/overview'])
```

如果 `pagePermissions` 为空或 `/monitoring/overview` 不存在，说明 `initPagePermissions` 没有被调用。

### 原因2：菜单过滤时机问题

**检查**：`Menu.vue` 中的 `filteredMenuItems` 是否在权限初始化之后计算。

### 原因3：测试角色覆盖未生效

**检查**：确认 `getUserInfo` getter 是否正确读取了测试角色。

## 已完成的修复

1. ✅ 修复默认主页：SystemAdmin 默认主页改为 `/admin/device-store`
2. ✅ 添加调试日志：更详细的权限检查日志

## 下一步

请刷新页面，选择 SystemAdmin 角色，然后：
1. 查看控制台日志，确认权限检查的返回值
2. 检查菜单是否仍然显示不应该显示的项
3. 如果问题仍然存在，请提供控制台日志输出

