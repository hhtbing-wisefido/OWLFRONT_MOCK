# 完整菜单权限对照表

## 说明
- ✅ 表示该角色可以访问该页面
- ❌ 表示该角色不能访问该页面
- **RCDU 权限**：Read/Create/Delete/Update 权限在页面内部控制，与路由访问权限无关
- 权限配置在 `src/store/modules/user.ts` 的 `defaultPermissions` 中
- 菜单过滤在 `src/components/layout/Menu.vue` 中通过 `userStore.hasPagePermission(item.path)` 实现

## 菜单权限表

| 菜单项 | 路径 | SystemAdmin | Admin | Manager | IT | Nurse | Caregiver | Resident | Family |
|--------|------|-------------|-------|---------|----|----|-----------|----------|--------|
| **【核心操作区域】** | | | | | | | | | |
| Monitoring Overview | `/monitoring/overview` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Alarm Records | `/alarm/records` | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Alarm Settings | `/alarm/settings` | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Alarm Cloud | `/admin/alarm-cloud` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **【数据管理区域】** | | | | | | | | | |
| Resident Management | `/residents` | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Resident PHI Tab | `/resident/:id/phi` | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Resident Contacts Tab | `/resident/:id/contacts` | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Card Overview | `/care-coordination/card-overview` | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **【系统设置区域】** | | | | | | | | | |
| Device Management | `/devices` | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Device Store | `/admin/device-store` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Unit Management | `/units` | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| User Management | `/admin/users` | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Role Management | `/admin/roles` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Permission Management | `/admin/permissions` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tag Management | `/admin/tags` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

## 权限说明

### SystemAdmin（系统管理员）
- **职责**：全局系统参数调整，不访问客户内部数据
- **可访问页面**：
  - Alarm Cloud（系统级报警云配置）
  - Device Store（管理全部设备，RCDU）
  - Role Management（系统角色管理）
  - Permission Management（系统权限管理）
  - Tag Management（系统标签管理）
- **总计**: 5 个页面

### Admin（租户管理员）
- **职责**：管理本租户的所有数据
- **可访问页面**：**除了 Device Store 之外的所有页面**
  - Monitoring Overview
  - Alarm Records
  - Alarm Settings
  - Alarm Cloud
  - Resident Management（包括 PHI Tab、Contacts Tab）
  - Card Overview
  - Device Management
  - Unit Management
  - User Management
  - Role Management
  - Tag Management
- **总计**: 11 个页面
- **注意**：RCDU 权限在页面内部根据资源权限表控制，与路由访问无关

### Manager（经理）
- **职责**：管理部分租户数据
- **可访问页面**：**与 Admin 相同（除了 Device Store）**
  - Monitoring Overview
  - Alarm Records
  - Alarm Settings
  - Alarm Cloud
  - Resident Management（包括 PHI Tab、Contacts Tab）
  - Card Overview
  - Device Management
  - Unit Management
  - User Management
  - Role Management
  - Tag Management
- **总计**: 11 个页面

### IT（技术管理员）
- **职责**：技术管理
- **可访问页面**：**比 Admin 少以下页面**
  - ❌ Resident Management（列表页）
  - ❌ Resident PHI Tab（PHI 敏感信息）
  - ❌ Resident Contacts Tab（联系人）
  - ❌ Round 页面（暂未实现）
- **可访问页面**：
  - Monitoring Overview
  - Alarm Records
  - Alarm Settings
  - Resident Detail（Profile Tab，不包括 PHI 和 Contacts）
  - Card Overview
  - Device Management
  - Unit Management
  - User Management
  - Role Management
  - Tag Management
- **总计**: 10 个页面

### Nurse（护士）
- **职责**：业务操作
- **可访问页面**：**比 Admin 少 Role Management 和 Permission Management**
  - Monitoring Overview
  - Alarm Records
  - Resident Management（包括 PHI Tab、Contacts Tab）
  - Card Overview
  - Tag Management
- **总计**: 5 个页面

### Caregiver（护理员）
- **职责**：业务操作
- **可访问页面**：**比 Admin 少 Role Management 和 Permission Management**
  - Monitoring Overview
  - Resident Management（包括 PHI Tab、Contacts Tab）
  - Tag Management
- **总计**: 3 个页面

### Resident（住户）
- **职责**：查看自己的信息
- **可访问页面**：Monitoring Overview, Resident Detail（自己的，包括 Contacts Tab）
- **总计**: 2 个页面（含详情页）

### Family（家属）
- **职责**：查看关联住户的信息
- **可访问页面**：Monitoring Overview, Resident Detail（关联住户的，包括 Contacts Tab）
- **总计**: 2 个页面（含详情页）

## 权限差异总结

### Manager vs Admin
- **相同**：Manager 可访问的页面与 Admin 完全相同（除了 Device Store）

### IT vs Admin
- **IT 不能访问**：
  - Resident Management（列表页 `/residents`）
  - Resident PHI Tab（`/resident/:id/phi`）
  - Resident Contacts Tab（`/resident/:id/contacts`）
  - Round 页面（暂未实现）

### Nurse/Caregiver vs Admin
- **Nurse/Caregiver 不能访问**：
  - Role Management（`/admin/roles`）
  - Permission Management（`/admin/permissions`）
  - Alarm Settings（`/alarm/settings`）
  - Alarm Cloud（`/admin/alarm-cloud`）
  - Device Management（`/devices`）
  - Unit Management（`/units`）
  - User Management（`/admin/users`）
  - Card Overview（`/care-coordination/card-overview`）- Caregiver 不能访问
  - Alarm Records（`/alarm/records`）- Caregiver 不能访问

## 资源权限映射

根据资源权限表，以下资源对应的页面权限：

| 资源 | 权限 | 对应页面 | SystemAdmin | Admin | Manager |
|------|------|----------|-------------|-------|---------|
| 13_device_store | RCDU | Device Store | ✅ | ❌ | ❌ |
| 17_alarm_cloud | R | Alarm Cloud | ✅ | ✅ | ✅ |
| 22_tags_catalog | RCDU | Tag Management | ✅ | ✅ | ✅ |
| 01_tenants | RCDU | - | ✅ (系统级，无前端页面) | - | - |
| 02_roles | RCDU | Role Management | ✅ | ✅ | ✅ |
| 03_role_permissions | RCDU | Permission Management | ✅ | ❌ | ❌ |

**注意**：RCDU 权限（Read/Create/Delete/Update）在页面内部根据资源权限表控制，路由访问权限只控制能否进入页面。
