# 菜单权限列表（审查用）

## 一、核心操作区域

### 1. Monitoring Overview
- **路径**: `/monitoring/overview`
- **权限**: Admin, Manager, IT, Nurse, Caregiver, Resident, Family
- **SystemAdmin**: ❌ 不可访问（客户业务数据）

### 2. Alarm Records
- **路径**: `/alarm/records`
- **权限**: Admin, Manager, IT, Nurse
- **SystemAdmin**: ❌ 不可访问（客户业务数据）

### 3. Alarm Settings
- **路径**: `/alarm/settings`
- **权限**: Admin, IT
- **SystemAdmin**: ❌ 不可访问（租户级报警设置）

### 4. Alarm Cloud
- **路径**: `/admin/alarm-cloud`
- **权限**: SystemAdmin, Admin
- **说明**: 系统级报警云配置（RCDU 权限在页面内部控制）

---

## 二、数据管理区域

### 5. Resident Management
- **路径**: `/residents`
- **权限**: Admin, Manager, IT, Nurse, Caregiver
- **SystemAdmin**: ❌ 不可访问（客户业务数据）

### 6. Card Overview
- **路径**: `/care-coordination/card-overview`
- **权限**: Admin, Manager, IT, Nurse
- **SystemAdmin**: ❌ 不可访问（客户业务数据）

---

## 三、系统设置区域

### 7. Device Management
- **路径**: `/devices`
- **权限**: Admin, IT
- **SystemAdmin**: ❌ 不可访问（租户设备）

### 8. Device Store
- **路径**: `/admin/device-store`
- **权限**: SystemAdmin
- **说明**: 管理全部设备（系统级，RCDU）

### 9. Unit Management
- **路径**: `/units`
- **权限**: Admin, IT
- **SystemAdmin**: ❌ 不可访问（租户单元）

### 10. User Management
- **路径**: `/admin/users`
- **权限**: Admin, IT
- **SystemAdmin**: ❌ 不可访问（租户用户）

### 11. Role Management
- **路径**: `/admin/roles`
- **权限**: SystemAdmin, Admin, Manager, IT
- **说明**: SystemAdmin 管理系统角色，Admin/Manager 管理租户角色

### 12. Permission Management
- **路径**: `/admin/permissions`
- **权限**: SystemAdmin
- **说明**: 系统权限管理（仅 SystemAdmin）

### 13. Tag Management
- **路径**: `/admin/tags`
- **权限**: SystemAdmin, Admin, Manager, IT, Nurse, Caregiver
- **说明**: SystemAdmin 管理系统标签，租户管理自定义标签

---

## 四、各角色可访问页面汇总

### SystemAdmin（系统管理员）
**职责**: 全局系统参数调整，不访问客户内部数据

**可访问页面**:
1. Alarm Cloud (`/admin/alarm-cloud`)
2. Device Store (`/admin/device-store`)
3. Role Management (`/admin/roles`)
4. Permission Management (`/admin/permissions`)
5. Tag Management (`/admin/tags`)

**总计**: 5 个页面

---

### Admin（租户管理员）
**职责**: 管理本租户的所有数据

**可访问页面**（除了 Device Store 之外的所有页面）:
1. Monitoring Overview
2. Alarm Records
3. Alarm Settings
4. Alarm Cloud
5. Resident Management
6. Card Overview
7. Device Management
8. Unit Management
9. User Management
10. Role Management
11. Tag Management

**总计**: 11 个页面

**注意**: RCDU 权限（Read/Create/Delete/Update）在页面内部根据资源权限表控制，与路由访问权限无关

---

### Manager（经理）
**职责**: 管理部分租户数据

**可访问页面**:
1. Monitoring Overview
2. Alarm Records
3. Resident Management
4. Card Overview
5. Role Management
6. Tag Management

**总计**: 6 个页面

---

### IT（技术管理员）
**职责**: 技术管理

**可访问页面**:
1. Monitoring Overview
2. Alarm Records
3. Alarm Settings
4. Resident Management
5. Card Overview
6. Device Management
7. Unit Management
8. User Management
9. Role Management
10. Tag Management

**总计**: 10 个页面

---

### Nurse（护士）
**职责**: 业务操作

**可访问页面**:
1. Monitoring Overview
2. Alarm Records
3. Resident Management
4. Card Overview
5. Tag Management

**总计**: 5 个页面

---

### Caregiver（护理员）
**职责**: 业务操作

**可访问页面**:
1. Monitoring Overview
2. Resident Management
3. Tag Management

**总计**: 3 个页面

---

### Resident（住户）
**职责**: 查看自己的信息

**可访问页面**:
1. Monitoring Overview
2. Resident Detail（自己的）

**总计**: 2 个页面（含详情页）

---

### Family（家属）
**职责**: 查看关联住户的信息

**可访问页面**:
1. Monitoring Overview
2. Resident Detail（关联住户的）

**总计**: 2 个页面（含详情页）

---

## 五、资源权限映射

| 资源 | 权限 | 对应页面 | SystemAdmin 访问 |
|------|------|----------|------------------|
| 13_device_store | RCDU | Device Store | ✅ |
| 17_alarm_cloud | R | Alarm Cloud | ✅ |
| 22_tags_catalog | RCDU | Tag Management | ✅ |
| 01_tenants | RCDU | - | ✅ (系统级，无前端页面) |
| 02_roles | RCDU | Role Management | ✅ |
| 03_role_permissions | RCDU | Permission Management | ✅ |

---

## 六、权限配置位置

- **权限定义**: `src/store/modules/user.ts` → `defaultPermissions`
- **菜单配置**: `src/types/menu.ts` → `menuItems`
- **路由配置**: `src/router/index.ts` → `routes`
- **菜单过滤**: `src/components/layout/Menu.vue` → `filteredMenuItems`

---

## 七、审查要点

### ✅ SystemAdmin 权限检查
- [x] SystemAdmin 不能访问客户业务数据（Monitoring Overview, Alarm Records, Resident Management 等）
- [x] SystemAdmin 只能访问系统管理功能（Device Store, Alarm Cloud, Role Management, Permission Management, Tag Management）
- [x] SystemAdmin 可以访问 Device Store（管理全部设备，RCDU）
- [x] SystemAdmin 可以访问 Alarm Cloud（系统级报警云配置，只读）

### ✅ 其他角色权限检查
- [x] Admin 可以访问所有租户管理页面
- [x] Manager 可以访问部分租户管理页面
- [x] IT 可以访问技术管理相关页面
- [x] Nurse/Caregiver 可以访问业务操作相关页面
- [x] Resident/Family 只能访问自己的信息

### ✅ 菜单完整性检查
- [x] 所有菜单项都有对应的路由
- [x] 所有菜单项都有对应的权限配置
- [x] Device Store 已添加
- [x] Alarm Cloud 已添加

