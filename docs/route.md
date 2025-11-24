# 路由管理功能设计文档

## 功能概述

路由管理负责页面导航、权限控制、路由守卫等功能，确保用户只能访问有权限的页面。

## 核心规则

1. **默认首页**：所有用户（staff 和 residents）登录成功后，默认跳转到 `/monitoring/vital-focus`
2. **Admin 模块访问控制**：
   - 整个 `/admin` 路径下的所有页面仅对 `staff` 用户开放
   - **`residents` 用户无法访问 admin 模块**
3. **特定页面权限**：
   - `/admin/roles` 和 `/admin/role-permissions` 仅允许 Admin、Director、CO、IT 角色访问
   - 其他 staff 用户（如 Nurse、Caregiver）也无法访问这两个页面

---

## 路由配置

### 路由列表

- `/` - 根路径，重定向到登录页
- `/login` - 登录页（不需要认证）
- `/forgot-password` - 忘记密码页（不需要认证）
- `/test-data` - 测试数据查看器（不需要认证）
- `/admin/roles` - 角色管理页（需要认证，仅 staff，仅特定角色）
- `/admin/role-permissions` - 角色权限管理页（需要认证，仅 staff，仅特定角色）
- `/monitoring/vital-focus` - 生命体征监控页（需要认证，所有用户）

### 路由元信息（Meta）

每个路由可以配置以下元信息：

- `title` - 页面标题
- `requiresAuth` - 是否需要登录（默认 true）
- `ignoreAuth` - 是否忽略权限检查（可选）

**注意**：页面访问权限统一在 store 的 `pagePermissions` 中配置，不在路由 meta 中配置。

---

## 路由守卫

### 功能说明

路由守卫在每次路由跳转时检查：
1. **登录状态**：检查是否有 token
2. **用户类型**：Admin 模块仅允许 `staff` 用户访问
3. **角色权限**：检查用户角色是否在允许访问的角色列表中

### 实现位置

- **路由守卫**：`src/router/index.ts` 的 `beforeEach` 守卫
- **权限检查**：`src/store/modules/user.ts` 的 `hasPagePermission()` getter
- **权限配置**：`src/store/modules/user.ts` 的 `initPagePermissions()` action
- **首页路径获取**：`src/store/modules/user.ts` 的 `getUserHomePath()` getter（用于无权限时重定向）

### 权限控制规则

1. **Admin 模块访问控制**：
   - 整个 `/admin` 路径下的所有页面仅对 `staff` 用户开放
   - **`residents` 用户无法访问 admin 模块**（在 `hasPagePermission()` 中检查 `userType !== 'staff'`）
   - 在 staff 用户中，还需要检查角色权限（如 admin/Director/CO/IT）

2. **特定页面权限配置**：
   - `/admin/roles` 和 `/admin/role-permissions` 仅允许 Admin、Director、CO、IT 角色访问
   - 其他 staff 用户（如 Nurse、Caregiver）也无法访问这两个页面

3. **无权限处理**：
   - 如果用户无权限访问，重定向到用户的 `homePath`（通过 `getUserHomePath()` getter 获取）
   - 如果用户没有 `homePath`，则重定向到 `/monitoring/vital-focus`（所有用户的默认首页）

### 工作流程

1. 登录时：后端返回 `userType` 和 `role` 字段
2. Store 保存：保存用户类型和角色信息
3. 初始化权限：调用 `initPagePermissions()` 设置页面权限配置
4. 路由守卫：每次路由跳转时检查用户类型和角色权限
5. 无权限处理：重定向到用户的 `homePath`（通过 `getUserHomePath()` getter 获取），如果没有 `homePath` 则使用默认首页 `/monitoring/vital-focus`

---

## 登录后跳转逻辑

### 功能说明

登录成功后，根据 redirect 参数或默认跳转到 `/monitoring/vital-focus`（所有用户的默认首页）。

### 跳转规则

1. 如果 URL 中有 `redirect` 参数，优先跳转到目标页面
2. 如果没有 `redirect` 参数，优先使用后端返回的 `homePath`（通过 `getUserHomePath()` getter 获取）
3. 如果用户没有 `homePath`，默认跳转到 `/monitoring/vital-focus`（所有用户的默认首页）

### 实现位置

- `src/views/login/LoginForm.vue` 的 `handleLogin` 函数
- `src/store/modules/user.ts` 的 `afterLoginAction()` 方法（使用 `getUserHomePath()` getter）
- `src/store/modules/user.ts` 的 `getUserHomePath()` getter（获取用户首页路径）

---

## 404 错误处理

### 功能说明

当用户访问不存在的路由时，应该显示 404 错误页面。

### 实现要求

- 使用 `/:pathMatch(.*)*` 匹配所有未匹配的路由
- 404 路由应该放在路由配置的最后
- 404 页面不需要认证

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

5. **404 路由**
   - 使用 `/:pathMatch(.*)*` 匹配所有未匹配的路由
   - 放在路由配置的最后

---

## 相关文档

- **状态管理**：`docs/store.md` - 用户状态管理和页面权限配置
- **角色权限管理**：`docs/role-permissions-api.md` - 角色权限 API 设计
