# 菜单权限对照表（最终版）

## 说明
- ✅ 表示该角色可以访问该页面
- ❌ 表示该角色不能访问该页面
- **RCDU 权限**：Read/Create/Delete/Update 权限在页面内部控制，与路由访问权限无关
- 权限配置位置：`src/store/modules/user.ts` → `defaultPermissions`
- 菜单配置位置：`src/types/menu.ts` → `menuItems`

---

## 一、完整权限对照表

| 菜单项 | 路径 | SystemAdmin | Admin | Manager | IT | Nurse | Caregiver | Resident | Family |
|--------|------|-------------|-------|---------|----|----|-----------|----------|--------|
| **【核心操作区域】** | | | | | | | | | |
| Monitoring Overview | `/monitoring/overview` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Alarm Records | `/alarm/records` | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Alarm Settings | `/alarm/settings` | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Alarm Cloud | `/admin/alarm-cloud` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **【数据管理区域】** | | | | | | | | | |
| Resident Management | `/residents` | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Resident Profile Tab | `/resident/:id/profile` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
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

---

## 二、各角色权限汇总

### SystemAdmin（系统管理员）
**职责**: 全局系统参数调整，不访问客户内部数据

**可访问页面** (5个):
1. ✅ Alarm Cloud (`/admin/alarm-cloud`)
2. ✅ Device Store (`/admin/device-store`)
3. ✅ Role Management (`/admin/roles`)
4. ✅ Permission Management (`/admin/permissions`)
5. ✅ Tag Management (`/admin/tags`)

---

### Admin（租户管理员）
**职责**: 管理本租户的所有数据

**可访问页面** (11个，除了 Device Store 之外的所有页面):
1. ✅ Monitoring Overview
2. ✅ Alarm Records
3. ✅ Alarm Settings
4. ✅ Alarm Cloud
5. ✅ Resident Management (`/residents`)
6. ✅ Resident Profile Tab
7. ✅ Resident PHI Tab
8. ✅ Resident Contacts Tab
9. ✅ Card Overview
10. ✅ Device Management
11. ✅ Unit Management
12. ✅ User Management
13. ✅ Role Management
14. ✅ Tag Management

**不可访问**:
- ❌ Device Store

---

### Manager（经理）
**职责**: 管理部分租户数据

**可访问页面** (11个，与 Admin 相同):
1. ✅ Monitoring Overview
2. ✅ Alarm Records
3. ✅ Alarm Settings
4. ✅ Alarm Cloud
5. ✅ Resident Management (`/residents`)
6. ✅ Resident Profile Tab
7. ✅ Resident PHI Tab
8. ✅ Resident Contacts Tab
9. ✅ Card Overview
10. ✅ Device Management
11. ✅ Unit Management
12. ✅ User Management
13. ✅ Role Management
14. ✅ Tag Management

**不可访问**:
- ❌ Device Store

**说明**: Manager 与 Admin 拥有完全相同的访问权限

---

### IT（技术管理员）
**职责**: 技术管理

**可访问页面** (10个，比 Admin 少 Resident 相关页面):
1. ✅ Monitoring Overview
2. ✅ Alarm Records
3. ✅ Alarm Settings
4. ✅ Resident Profile Tab（基本信息，不包括 PHI 和 Contacts）
5. ✅ Card Overview
6. ✅ Device Management
7. ✅ Unit Management
8. ✅ User Management
9. ✅ Role Management
10. ✅ Tag Management

**不可访问**:
- ❌ Alarm Cloud
- ❌ Resident Management（列表页 `/residents`）
- ❌ Resident PHI Tab（`/resident/:id/phi`）
- ❌ Resident Contacts Tab（`/resident/:id/contacts`）
- ❌ Round 页面（暂未实现）
- ❌ Device Store

---

### Nurse（护士）
**职责**: 业务操作

**可访问页面** (5个):
1. ✅ Monitoring Overview
2. ✅ Alarm Records
3. ✅ Resident Management (`/residents`)
4. ✅ Resident Profile Tab
5. ✅ Resident PHI Tab
6. ✅ Resident Contacts Tab
7. ✅ Card Overview
8. ✅ Tag Management

**不可访问**:
- ❌ Alarm Settings
- ❌ Alarm Cloud
- ❌ Device Management
- ❌ Unit Management
- ❌ User Management
- ❌ Role Management
- ❌ Permission Management
- ❌ Device Store

---

### Caregiver（护理员）
**职责**: 业务操作

**可访问页面** (3个):
1. ✅ Monitoring Overview
2. ✅ Resident Management (`/residents`)
3. ✅ Resident Profile Tab
4. ✅ Resident PHI Tab
5. ✅ Resident Contacts Tab
6. ✅ Tag Management

**不可访问**:
- ❌ Alarm Records
- ❌ Alarm Settings
- ❌ Alarm Cloud
- ❌ Card Overview
- ❌ Device Management
- ❌ Unit Management
- ❌ User Management
- ❌ Role Management
- ❌ Permission Management
- ❌ Device Store

---

### Resident（住户）
**职责**: 查看自己的信息

**可访问页面** (2个):
1. ✅ Monitoring Overview
2. ✅ Resident Detail（自己的，包括 Profile Tab 和 Contacts Tab）

**不可访问**:
- ❌ 所有其他页面
- ❌ Resident PHI Tab（自己的 PHI 信息）

---

### Family（家属）
**职责**: 查看关联住户的信息

**可访问页面** (2个):
1. ✅ Monitoring Overview
2. ✅ Resident Detail（关联住户的，包括 Profile Tab 和 Contacts Tab）

**不可访问**:
- ❌ 所有其他页面
- ❌ Resident PHI Tab（关联住户的 PHI 信息）

---

## 三、权限差异对比

### Manager vs Admin
| 页面 | Admin | Manager |
|------|-------|---------|
| 所有页面 | ✅ | ✅ |
| **差异**: 无，Manager 与 Admin 完全相同 |

### IT vs Admin
| 页面 | Admin | IT |
|------|-------|-----|
| Resident Management（列表） | ✅ | ❌ |
| Resident PHI Tab | ✅ | ❌ |
| Resident Contacts Tab | ✅ | ❌ |
| Alarm Cloud | ✅ | ❌ |
| **差异**: IT 不能访问 Resident 相关敏感信息和 Alarm Cloud |

### Nurse vs Admin
| 页面 | Admin | Nurse |
|------|-------|-------|
| Alarm Settings | ✅ | ❌ |
| Alarm Cloud | ✅ | ❌ |
| Device Management | ✅ | ❌ |
| Unit Management | ✅ | ❌ |
| User Management | ✅ | ❌ |
| Role Management | ✅ | ❌ |
| Permission Management | ✅ | ❌ |
| **差异**: Nurse 不能访问系统管理相关页面 |

### Caregiver vs Admin
| 页面 | Admin | Caregiver |
|------|-------|-----------|
| Alarm Records | ✅ | ❌ |
| Alarm Settings | ✅ | ❌ |
| Alarm Cloud | ✅ | ❌ |
| Card Overview | ✅ | ❌ |
| Device Management | ✅ | ❌ |
| Unit Management | ✅ | ❌ |
| User Management | ✅ | ❌ |
| Role Management | ✅ | ❌ |
| Permission Management | ✅ | ❌ |
| **差异**: Caregiver 比 Nurse 更少，不能访问 Alarm Records 和 Card Overview |

---

## 四、资源权限映射

| 资源 | 权限 | 对应页面 | SystemAdmin | Admin | Manager | IT |
|------|------|----------|-------------|-------|---------|-----|
| 13_device_store | RCDU | Device Store | ✅ | ❌ | ❌ | ❌ |
| 17_alarm_cloud | R | Alarm Cloud | ✅ | ✅ | ✅ | ❌ |
| 22_tags_catalog | RCDU | Tag Management | ✅ | ✅ | ✅ | ✅ |
| 01_tenants | RCDU | - | ✅ (系统级，无前端页面) | - | - | - |
| 02_roles | RCDU | Role Management | ✅ | ✅ | ✅ | ✅ |
| 03_role_permissions | RCDU | Permission Management | ✅ | ❌ | ❌ | ❌ |

**注意**: RCDU 权限（Read/Create/Delete/Update）在页面内部根据资源权限表控制，路由访问权限只控制能否进入页面。

---

## 五、配置位置

- **权限定义**: `src/store/modules/user.ts` → `defaultPermissions`
- **菜单配置**: `src/types/menu.ts` → `menuItems`
- **路由配置**: `src/router/index.ts` → `routes`
- **菜单过滤**: `src/components/layout/Menu.vue` → `filteredMenuItems`

---

## 六、审查要点

### ✅ SystemAdmin 权限检查
- [x] SystemAdmin 不能访问客户业务数据
- [x] SystemAdmin 只能访问系统管理功能（5个页面）
- [x] SystemAdmin 可以访问 Device Store（管理全部设备）
- [x] SystemAdmin 可以访问 Alarm Cloud（系统级配置）

### ✅ Admin 权限检查
- [x] Admin 可以访问除了 Device Store 之外的所有页面（11个页面）
- [x] Admin 可以访问 Alarm Cloud

### ✅ Manager 权限检查
- [x] Manager 与 Admin 拥有完全相同的访问权限
- [x] Manager 可以访问 Alarm Cloud

### ✅ IT 权限检查
- [x] IT 不能访问 Resident Management（列表页）
- [x] IT 不能访问 Resident PHI Tab
- [x] IT 不能访问 Resident Contacts Tab
- [x] IT 不能访问 Alarm Cloud
- [x] IT 可以访问 Resident Profile Tab（基本信息）

### ✅ Nurse/Caregiver 权限检查
- [x] Nurse/Caregiver 不能访问 Role Management
- [x] Nurse/Caregiver 不能访问 Permission Management
- [x] Caregiver 比 Nurse 少 Alarm Records 和 Card Overview

### ✅ 菜单完整性检查
- [x] 所有菜单项都有对应的路由
- [x] 所有菜单项都有对应的权限配置
- [x] Device Store 已添加（仅 SystemAdmin）
- [x] Alarm Cloud 已添加（SystemAdmin, Admin, Manager）

