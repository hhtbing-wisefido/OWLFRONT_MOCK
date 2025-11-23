# 角色管理 API 设计

## API 端点

### 1. 获取角色列表

**端点**：`GET /admin/api/v1/roles`

**功能**：获取角色列表，支持搜索过滤。

**参数**：
- `search`（可选）：搜索关键词，用于搜索 `role_code`、`display_name` 或 `description`

**响应**：返回角色数组和总数量。

**注意事项**：
- 搜索是后端搜索，不区分大小写
- 根据用户租户ID过滤，系统角色对所有租户可见
- 默认按 `role_code` 升序排序

---

### 2. 创建角色

**端点**：`POST /admin/api/v1/roles`

**功能**：创建新角色。

**参数**：
- `role_code`（必填）：角色编码，唯一标识符
- `display_name`（必填）：角色显示名称
- `description`（可选）：角色描述

**响应**：返回新创建的角色ID。

**注意事项**：
- `role_code` 必须唯一（在租户内唯一）
- 创建的角色默认为自定义角色（`is_system: false`）
- 创建的角色默认为启用状态（`is_active: true`）
- `tenant_id` 自动设置为当前用户的租户ID
- 创建角色后，系统会自动为该角色创建空的权限表，客户需要在权限管理页面设置各个资源的 C/E/D/R 权限

---

### 3. 更新角色

**端点**：`PUT /admin/api/v1/roles/:id`

**功能**：更新角色信息（编辑、删除、禁用都通过此端点）。

**参数**：
- `display_name`（可选）：角色显示名称（编辑时使用）
- `description`（可选）：角色描述（编辑时使用）
- `is_active`（可选）：是否启用（true：启用，false：禁用，禁用时使用）
- `_delete`（可选）：是否删除（true：删除，删除时使用）

**注意事项**：
- `role_code` 不允许修改（唯一索引，创建后不能修改，被 `role_permissions` 表引用）
- `role_id` 是数据库主键（UUID），不能修改
- 只更新提供的字段
- **编辑**：传递 `display_name` 和/或 `description`
- **禁用**：传递 `is_active: false`
- **删除**：传递 `_delete: true`（系统角色不允许删除，如果角色正在使用则不允许删除，需要处理关联数据）

---

## 权限要求

- **查看角色列表**：需要 `roles.read` 权限
- **创建角色**：需要 `roles.create` 权限
- **更新角色**：需要 `roles.update` 权限（包括编辑、删除、禁用操作）

---

## 业务规则

### 角色类型

- **系统角色**（`is_system: true`）：系统预置，所有租户共享，不允许删除，不允许修改 `role_code`
- **自定义角色**（`is_system: false`）：用户创建，属于特定租户，允许删除，允许修改所有字段（除了 `role_code`）

### 唯一性约束

- `role_code` 在租户内必须唯一（系统角色的 `tenant_id` 为 null，全局唯一）

---

## 相关文档

- **角色管理功能说明**：`docs/roles.md`
