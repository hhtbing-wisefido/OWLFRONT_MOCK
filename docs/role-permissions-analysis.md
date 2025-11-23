# 角色权限表展示分析

## 数据表结构

### 核心字段

| 字段 | 类型 | 说明 | 是否展示 |
|------|------|------|---------|
| `permission_id` | UUID | 权限ID（主键） | ❌ 不展示（内部使用） |
| `role_code` | VARCHAR(50) | 角色编码（如 'Admin', 'Director'） | ✅ **必须展示** |
| `resource_type` | VARCHAR(100) | 资源类型（如 'users', 'residents', 'devices'） | ✅ **必须展示** |
| `permission_type` | VARCHAR(20) | 权限类型（'read', 'create', 'update', 'delete', 'manage'） | ✅ **必须展示** |
| `scope` | VARCHAR(50) | 权限范围（'all', 'assigned_only', 'location_tag'） | ✅ **必须展示** |
| `is_active` | BOOLEAN | 是否启用 | ✅ **必须展示** |

## 需要展示的内容

### 1. 表格列（主要展示）

#### 必展示列
1. **Role Code（角色编码）**
   - 显示：`role_code`
   - 宽度：灵活（100-150px）
   - 可点击：可跳转到角色详情或过滤该角色的权限

2. **Resource Type（资源类型）**
   - 显示：`resource_type`
   - 宽度：灵活（150-200px）
   - 说明：显示资源名称（如 'users', 'residents'）

3. **Permission Type（权限类型）**
   - 显示：`permission_type`
   - 宽度：固定（100px）
   - 显示格式：
     - `read` → "Read" 或图标
     - `create` → "Create" 或图标
     - `update` → "Update" 或图标
     - `delete` → "Delete" 或图标
     - `manage` → "Manage" 或图标（表示全部权限）

4. **Scope（权限范围）**
   - 显示：`scope`
   - 宽度：固定（120px）
   - 显示格式：
     - `all` → "All"
     - `assigned_only` → "Assigned Only"
     - `location_tag` → "Location Tag"

5. **Status（状态）**
   - 显示：`is_active`
   - 宽度：固定（80px）
   - 显示格式：
     - `true` → "Active"（绿色）
     - `false` → "Inactive"（红色）

#### 操作列
6. **Operation（操作）**
   - 宽度：固定（200px）
   - 按钮：
     - Edit（编辑）
     - Delete（删除）
     - Enable/Disable（启用/禁用）

### 2. 过滤功能

#### 顶部过滤栏
- **Role Code 过滤**：下拉选择或输入框，支持搜索
- **Resource Type 过滤**：下拉选择，显示所有资源类型
- **Permission Type 过滤**：下拉选择（read, create, update, delete, manage）
- **Status 过滤**：下拉选择（All, Active, Inactive）

### 3. 搜索功能

- **全局搜索**：搜索框，支持搜索 `role_code`、`resource_type`
- **实时搜索**：输入后自动过滤

### 4. 操作功能

#### 创建权限
- **单个创建**：创建单个角色权限
- **批量创建**：为某个角色批量创建多个资源的权限

#### 编辑权限
- 可编辑字段：`scope`、`is_active`
- 不可编辑：`role_code`、`resource_type`、`permission_type`（唯一约束）

#### 删除权限
- 删除单个权限记录
- 需要确认对话框

#### 启用/禁用
- 快速切换权限的启用状态

### 5. 数据展示方式

#### 方式一：平铺列表（推荐）
```
┌──────────┬──────────────┬──────────────┬──────────┬────────┬──────────┐
│Role Code │Resource Type │Permission    │Scope     │Status  │Operation │
├──────────┼──────────────┼──────────────┼──────────┼────────┼──────────┤
│ Admin    │ users        │ manage       │ all      │ Active │ [Edit]   │
│ Admin    │ residents    │ manage       │ all      │ Active │ [Edit]   │
│ Director │ users        │ read         │ all      │ Active │ [Edit]   │
└──────────┴──────────────┴──────────────┴──────────┴────────┴──────────┘
```

#### 方式二：按角色分组（可选）
```
Admin
  ├─ users: manage (all) [Active]
  ├─ residents: manage (all) [Active]
  └─ devices: manage (all) [Active]

Director
  ├─ users: read (all) [Active]
  └─ residents: manage (all) [Active]
```

### 6. 批量操作

#### 批量创建权限
- 选择角色
- 选择多个资源类型
- 选择权限类型
- 选择权限范围
- 批量创建

#### 批量启用/禁用
- 选择多条记录
- 批量启用或禁用

## 业务规则

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
- `assigned_only`：仅分配的资源
- `location_tag`：按位置标签过滤

### 系统角色权限
- 系统预置角色（`tenant_id = NULL`）的权限为系统默认，所有租户共享
- 租户自定义角色的权限为租户级别，仅该租户可见

## 资源类型列表（22个）

1. tenants
2. roles
3. users
4. locations
5. rooms
6. beds
7. residents
8. resident_phi
9. resident_contacts
10. resident_caregivers
11. devices
12. iot_timeseries
13. iot_monitor_alarms
14. cloud_alarm_policies
15. config_versions
16. service_levels
17. color_tags
18. tags_catalog
19. cards
20. event_mapping
21. posture_mapping
22. alarm_events
23. rounds
24. round_details

## 建议的UI布局

### 顶部工具栏
- 左侧：搜索框 + 搜索按钮
- 中间：过滤下拉框（Role Code, Resource Type, Permission Type, Status）
- 右侧：创建权限按钮 + 批量创建按钮

### 表格区域
- 表格：显示所有权限记录
- 分页：支持分页（如果数据量大）
- 排序：支持按各列排序

### 操作区域
- 每行：Edit、Delete、Enable/Disable 按钮
- 批量选择：支持多选，批量操作

