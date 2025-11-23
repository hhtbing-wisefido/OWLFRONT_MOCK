# 角色权限管理 API 设计

## API 端点

### 1. 获取角色权限列表

**端点**：`GET /admin/api/v1/role-permissions`

**功能**：获取角色权限列表。

**参数**：无

**响应**：返回权限数组和总数量。

**注意事项**：
- 根据用户租户ID过滤，系统角色权限对所有租户可见
- 返回所有权限（包括启用和禁用的）
- 前端按角色分组展示
- 新建角色时，系统会自动创建空的权限表，客户需要在权限管理页面设置各个资源的 C/E/D/R 权限
- **页面访问控制**：仅允许 admin/Director/CO/IT 角色访问权限管理页面
  - **前端控制**：路由守卫检查用户角色，无权限用户无法访问页面（用户体验优化）
  - **后端控制**：API 层验证用户角色，无权限用户调用 API 返回 403（安全控制）

---

### 2. 更新角色权限

**端点**：`PUT /admin/api/v1/role-permissions/batch`

**功能**：更新某个角色的所有权限（用于保存权限矩阵的修改）。

**参数**：
- `role_code`（必填）：角色编码
- `permissions`（必填）：权限数组，每个元素包含：
  - `permission_id`（可选）：权限ID（如果存在则更新，不存在则创建）
  - `resource_type`（必填）：资源类型
  - `permission_type`（必填）：权限类型（read, create, update, delete, manage）
  - `scope`（可选）：权限范围，默认 `all`


**响应**：
- 全部成功：返回 `{ success: true }`
- 有失败项：返回 `{ success: false, failed_items: Array<{ resource_type: string, permission_type: string, reason: string }> }`

**响应示例**：
```json
// 全部成功
{
  "success": true
}

// 有失败项
{
  "success": false,
  "failed_items": [
    {
      "resource_type": "users",
      "permission_type": "create",
      "reason": "Insufficient permissions to modify this resource"
    }
  ]
}
```

**注意事项**：
- 每个角色独立展开和保存，各自点击各自的 Save 按钮
- 点击 Save 时，一次性提交该角色的所有权限变更
- 如果权限已存在则更新，不存在则创建
- **权限限制**：NS（Nurse）、CG（Caregiver）、ResidentsFamily 等角色只能修改自己授权的表项（行权限），此限制在应用层（后端）处理，前端仅负责展示

---

## 权限要求

### 页面访问权限

- **Admin 模块访问控制**：
  - **仅允许 staff 用户访问**：整个 `/admin` 路径下的所有页面仅对 staff 用户开放，residents 用户无法访问
  - **角色级别控制**：在 staff 用户中，仅允许 admin/Director/CO/IT 角色访问权限管理相关页面
  - **前端路由守卫**：检查用户类型和角色，无权限用户重定向到首页
    - 实现位置：`src/router/index.ts` 的 `beforeEach` 守卫
    - 权限存储：`src/store/modules/user.ts` 的 `pagePermissions` 字段
    - 登录时初始化：调用 `initPagePermissions()` 设置默认页面权限配置
  - **后端 API 验证**：所有 API 端点验证用户类型和角色，无权限用户返回 403 Forbidden

**实现说明**：
- 登录时，后端返回用户 `userType`（'staff' | 'resident'）和 `role` 字段（如 'Admin', 'Director', 'CO', 'IT'）
- 前端 store 保存用户类型和角色信息，并初始化页面访问权限配置
- 路由守卫首先检查用户类型（admin 模块仅允许 staff），然后检查用户角色是否在允许访问的角色列表中
- 如果无权限，重定向到用户首页（`homePath`）或默认首页

### API 操作权限

- **查看权限列表**：需要 `roles.read` 权限
- **更新权限**：需要 `roles.update` 权限

**注意事项**：
- NS（Nurse）、CG（Caregiver）、ResidentsFamily 等角色只能修改自己授权的表项（行权限）
- 此限制在应用层（后端）处理，前端仅负责展示和提交
- 后端需要验证当前用户是否有权限修改指定角色的权限

---

## 业务规则

### 角色创建时的权限初始化

- 新建角色时，系统会自动为该角色创建空的权限表
- 客户需要在权限管理页面为各个资源设置 C/E/D/R 权限
- 空权限表意味着该角色默认没有任何权限，需要手动配置

### 唯一性约束

- 同一角色对同一资源的同一权限类型只能有一条记录
- 唯一键：`(role_code, resource_type, permission_type)`

### 权限类型说明

- `read`：只读权限
- `create`：创建权限
- `update`：更新权限
- `delete`：删除权限
- `manage`：全部权限（read + create + update + delete）

### 权限范围说明

- `all`：全部资源
- `assigned_only`：仅分配的资源（NS 和 CG 使用）
- `location_tag`：按位置标签过滤

### 权限启用/禁用控制

- 权限的启用/禁用由 `roles.is_active` 字段控制
- `role_permissions` 表不包含 `is_active` 字段
- 当角色被禁用（`roles.is_active = false`）时，该角色的所有权限都视为禁用
- 当角色被启用（`roles.is_active = true`）时，该角色的所有权限都视为启用

### 系统角色权限

- 系统预置角色（`tenant_id = NULL`）的权限为系统默认，所有租户共享
- 租户自定义角色的权限为租户级别，仅该租户可见

---

## 相关文档

- **角色权限管理功能说明**：`docs/role-permissions-ui-design.md`
