# 完整权限对照表

## 说明
- ✅ 表示该角色可以访问该页面
- ❌ 表示该角色不能访问该页面
- **RCDU 权限**：Read/Create/Delete/Update 权限在页面内部控制，与路由访问权限无关
- 权限配置位置：`src/store/modules/user.ts` → `defaultPermissions`

---

## 完整权限对照表

| 菜单项                  | 路径                              | SystemAdmin | Admin | Manager | IT | Nurse  | Caregiver | Resident | Family |
|-------------------------|-----------------------------------|-------------|-------|---------|----|------|-----------|----------|--------|
| **【核心操作区域】**     |                                     |             |       |         |    |      |           |          |        |
| Monitoring Overview     | `/monitoring/overview`            | ✅          | ✅    | ✅      | ✅ | ✅   | ✅        | ✅       | ✅     |
| Alarm Records           | `/alarm/records`                  | ❌          | ✅    | ✅      | ✅ | ✅   | ✅        | ✅       | ✅     |
| Alarm Cloud             | `/alarm/cloud`                    | ✅          | ✅    | ✅      | ✅ | ✅   | ✅        | ✅       | ✅     |
| **【数据管理区域】**     |                                     |             |       |         |    |      |           |          |        |
| Resident Management     | `/residents`                      | ❌          | ✅    | ✅      | ❌ | ✅   | ✅        | ✅       | ✅     |
| Resident Profile Tab    | `/resident/:id/profile`           | ❌          | ✅    | ✅      | ❌ | ✅   | ✅        | ✅       | ✅     |
| Resident PHI Tab        | `/resident/:id/phi`               | ❌          | ✅    | ✅      | ❌ | ✅   | ✅        | ❌       | ❌     |
| Resident Contacts Tab   | `/resident/:id/contacts`          | ❌          | ✅    | ✅      | ❌ | ✅   | ✅        | ✅       | ✅     |
| Card Overview           | `/care-coordination/card-overview`| ❌          | ✅    | ✅      | ✅ | ✅   | ❌        | ❌       | ❌     |
| **【系统设置区域】**     |                                     |             |       |         |    |      |           |          |        |
| Device Management       | `/devices`                        | ❌          | ✅    | ✅      | ✅ | ❌   | ❌        | ❌       | ❌     |
| Device Store            | `/admin/device-store`             | ✅          | ❌    | ❌      | ❌ | ❌   | ❌        | ❌       | ❌     |
| Unit Management         | `/units`                          | ❌          | ✅    | ✅      | ✅ | ❌   | ❌        | ❌       | ❌     |
| User Management         | `/admin/users`                    | ❌          | ✅    | ✅      | ✅ | ❌   | ❌        | ❌       | ❌     |
| Role Management        | `/admin/roles`                     | ✅          | ✅    | ✅      | ✅ | ❌   | ❌        | ❌       | ❌     |
| Permission Management   | `/admin/permissions`              | ✅          | ❌    | ❌      | ❌ | ❌   | ❌        | ❌       | ❌     |
| Tag Management          | `/admin/tags`                     | ✅          | ✅    | ✅      | ✅ | ✅   | ✅        | ❌       | ❌     |

---

## 各角色可访问页面统计

### SystemAdmin（系统管理员）
**可访问页面数**: 5 个

| # | 页面 | 路径 |
|---|------|------|
| 1 | Alarm Cloud | `/alarm/cloud` |
| 2 | Device Store | `/admin/device-store` |
| 3 | Role Management | `/admin/roles` |
| 4 | Permission Management | `/admin/permissions` |
| 5 | Tag Management | `/admin/tags` |

---

### Admin（租户管理员）
**可访问页面数**: 11 个（除了 Device Store 之外的所有页面）

| # | 页面 | 路径 |
|---|------|------|
| 1 | Monitoring Overview | `/monitoring/overview` |
| 2 | Alarm Records | `/alarm/records` |
| 3 | Alarm Settings | `/alarm/settings` |
| 4 | Alarm Cloud | `/admin/alarm-cloud` |
| 5 | Resident Management | `/residents` |
| 6 | Resident Profile Tab | `/resident/:id/profile` |
| 7 | Resident PHI Tab | `/resident/:id/phi` |
| 8 | Resident Contacts Tab | `/resident/:id/contacts` |
| 9 | Card Overview | `/care-coordination/card-overview` |
| 10 | Device Management | `/devices` |
| 11 | Unit Management | `/units` |
| 12 | User Management | `/admin/users` |
| 13 | Role Management | `/admin/roles` |
| 14 | Tag Management | `/admin/tags` |

**不可访问**: Device Store

---

### Manager（经理）
**可访问页面数**: 11 个（与 Admin 完全相同）

| # | 页面 | 路径 |
|---|------|------|
| 1 | Monitoring Overview | `/monitoring/overview` |
| 2 | Alarm Records | `/alarm/records` |
| 3 | Alarm Settings | `/alarm/settings` |
| 4 | Alarm Cloud | `/admin/alarm-cloud` |
| 5 | Resident Management | `/residents` |
| 6 | Resident Profile Tab | `/resident/:id/profile` |
| 7 | Resident PHI Tab | `/resident/:id/phi` |
| 8 | Resident Contacts Tab | `/resident/:id/contacts` |
| 9 | Card Overview | `/care-coordination/card-overview` |
| 10 | Device Management | `/devices` |
| 11 | Unit Management | `/units` |
| 12 | User Management | `/admin/users` |
| 13 | Role Management | `/admin/roles` |
| 14 | Tag Management | `/admin/tags` |

**不可访问**: Device Store

**说明**: Manager 与 Admin 拥有完全相同的访问权限

---

### IT（技术管理员）
**可访问页面数**: 11 个（比 Admin 少 Resident 相关敏感信息）

| # | 页面 | 路径 |
|---|------|------|
| 1 | Monitoring Overview | `/monitoring/overview` |
| 2 | Alarm Records | `/alarm/records` |
| 3 | Alarm Settings | `/alarm/settings` |
| 4 | Alarm Cloud | `/admin/alarm-cloud` |
| 5 | Resident Profile Tab | `/resident/:id/profile` |
| 6 | Card Overview | `/care-coordination/card-overview` |
| 7 | Device Management | `/devices` |
| 8 | Unit Management | `/units` |
| 9 | User Management | `/admin/users` |
| 10 | Role Management | `/admin/roles` |
| 11 | Tag Management | `/admin/tags` |

**不可访问**:
- Resident Management（列表页）
- Resident PHI Tab
- Resident Contacts Tab
- Round 页面（暂未实现）
- Device Store

---

### Nurse（护士）
**可访问页面数**: 7 个

| # | 页面 | 路径 |
|---|------|------|
| 1 | Monitoring Overview | `/monitoring/overview` |
| 2 | Alarm Records | `/alarm/records` |
| 3 | Alarm Settings | `/alarm/settings` |
| 4 | Alarm Cloud | `/admin/alarm-cloud` |
| 5 | Resident Management | `/residents` |
| 6 | Resident Profile Tab | `/resident/:id/profile` |
| 7 | Resident PHI Tab | `/resident/:id/phi` |
| 8 | Resident Contacts Tab | `/resident/:id/contacts` |
| 9 | Card Overview | `/care-coordination/card-overview` |
| 10 | Tag Management | `/admin/tags` |

**不可访问**:
- Device Management
- Unit Management
- User Management
- Role Management
- Permission Management
- Device Store

---

### Caregiver（护理员）
**可访问页面数**: 6 个

| # | 页面 | 路径 |
|---|------|------|
| 1 | Monitoring Overview | `/monitoring/overview` |
| 2 | Alarm Records | `/alarm/records` |
| 3 | Alarm Settings | `/alarm/settings` |
| 4 | Alarm Cloud | `/admin/alarm-cloud` |
| 5 | Resident Management | `/residents` |
| 6 | Resident Profile Tab | `/resident/:id/profile` |
| 7 | Resident PHI Tab | `/resident/:id/phi` |
| 8 | Resident Contacts Tab | `/resident/:id/contacts` |
| 9 | Tag Management | `/admin/tags` |

**不可访问**:
- Card Overview
- Device Management
- Unit Management
- User Management
- Role Management
- Permission Management
- Device Store

---

### Resident（住户）
**可访问页面数**: 5 个

| # | 页面 | 路径 |
|---|------|------|
| 1 | Monitoring Overview | `/monitoring/overview` |
| 2 | Alarm Records | `/alarm/records` |
| 3 | Alarm Settings | `/alarm/settings` |
| 4 | Alarm Cloud | `/admin/alarm-cloud` |
| 5 | Resident Detail（自己的） | `/resident/:id/profile` |
| 6 | Resident Contacts Tab（自己的） | `/resident/:id/contacts` |

**不可访问**:
- 所有其他页面
- Resident PHI Tab（自己的 PHI 信息）

---

### Family（家属）
**可访问页面数**: 5 个

| # | 页面 | 路径 |
|---|------|------|
| 1 | Monitoring Overview | `/monitoring/overview` |
| 2 | Alarm Records | `/alarm/records` |
| 3 | Alarm Settings | `/alarm/settings` |
| 4 | Alarm Cloud | `/admin/alarm-cloud` |
| 5 | Resident Detail（关联住户的） | `/resident/:id/profile` |
| 6 | Resident Contacts Tab（关联住户的） | `/resident/:id/contacts` |

**不可访问**:
- 所有其他页面
- Resident PHI Tab（关联住户的 PHI 信息）

---

## 权限差异总结

### Manager vs Admin
- **差异**: 无，Manager 与 Admin 完全相同

### IT vs Admin
- **IT 不能访问**:
  - Resident Management（列表页）
  - Resident PHI Tab
  - Resident Contacts Tab
  - Round 页面（暂未实现）

### Nurse vs Admin
- **Nurse 不能访问**:
  - Device Management
  - Unit Management
  - User Management
  - Role Management
  - Permission Management

### Caregiver vs Admin
- **Caregiver 不能访问**:
  - Card Overview
  - Device Management
  - Unit Management
  - User Management
  - Role Management
  - Permission Management

---

## 资源权限映射

| 资源 | 权限 | 对应页面 | SystemAdmin | Admin | Manager | IT |
|------|------|----------|-------------|-------|---------|-----|
| 13_device_store | RCDU | Device Store | ✅ | ❌ | ❌ | ❌ |
| 17_alarm_cloud | R | Alarm Cloud | ✅ | ✅ | ✅ | ✅ |
| 22_tags_catalog | RCDU | Tag Management | ✅ | ✅ | ✅ | ✅ |
| 01_tenants | RCDU | - | ✅ (系统级，无前端页面) | - | - | - |
| 02_roles | RCDU | Role Management | ✅ | ✅ | ✅ | ✅ |
| 03_role_permissions | RCDU | Permission Management | ✅ | ❌ | ❌ | ❌ |

**注意**: RCDU 权限（Read/Create/Delete/Update）在页面内部根据资源权限表控制，路由访问权限只控制能否进入页面。

---

## 配置位置

- **权限定义**: `src/store/modules/user.ts` → `defaultPermissions`
- **菜单配置**: `src/types/menu.ts` → `menuItems`
- **路由配置**: `src/router/index.ts` → `routes`
- **菜单过滤**: `src/components/layout/Menu.vue` → `filteredMenuItems`
