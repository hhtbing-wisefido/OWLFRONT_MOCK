# 功能模块清单

## 📋 模块分类

根据数据库设计和业务需求，功能模块分为以下三大类：

### 1. 核心操作区 (Core Operations)
### 2. 数据管理区 (Data Management)
### 3. 系统设置区 (System Settings)

---

## ✅ 已实现的功能模块

### 核心操作区

| 模块 | 路径 | 状态 | 说明 |
|------|------|------|------|
| **Monitoring Overview** | `/monitoring/overview` | ✅ 已实现 | 监控概览页面 |
| **Wellness Monitor** | `/monitoring/wellness-monitor` | ✅ 已实现 | 健康监控页面（原 VitalFocus） |
| **Alarm History** | `/alarm/history` | ⚠️ 路由存在 | 告警历史（待实现页面） |
| **Alarm Settings** | `/alarm/settings` | ⚠️ 路由存在 | 告警设置（待实现页面） |

### 数据管理区

| 模块 | 路径 | 状态 | 说明 |
|------|------|------|------|
| **Resident Management** | `/residents` | ⚠️ 路由存在 | 住户管理（待实现页面） |
| **Resident Profile** | `/resident/:id/profile` | ❌ 未实现 | 住户详情（Profile/PHI/Contacts 标签页） |
| **Resident PHI** | `/resident/:id/phi` | ❌ 未实现 | 住户 PHI 信息 |
| **Resident Contacts** | `/resident/:id/contacts` | ❌ 未实现 | 住户联系人 |
| **Care Assignments** | `/care-coordination/assignments` | ⚠️ 路由存在 | 护理分配（待实现页面） |
| **Assignment Overview** | `/care-coordination/resident-dashboard` | ⚠️ 路由存在 | 分配概览（待实现页面） |

### 系统设置区

| 模块 | 路径 | 状态 | 说明 |
|------|------|------|------|
| **Device Management** | `/devices` | ✅ 已实现 | 设备管理 |
| **Unit Management** | `/units` | ✅ 已实现 | 单元/房间/床位管理 |
| **User Management** | `/admin/users` | ✅ 已实现 | 用户管理 |
| **Role Management** | `/admin/roles` | ✅ 已实现 | 角色管理 |
| **Permission Management** | `/admin/permissions` | ✅ 已实现 | 权限管理（仅 SystemAdmin） |
| **Tag Management** | `/admin/tags` | ✅ 已实现 | 标签管理 |

### 其他

| 模块 | 路径 | 状态 | 说明 |
|------|------|------|------|
| **Login** | `/login` | ✅ 已实现 | 登录页面 |
| **Forgot Password** | `/forgot-password` | ✅ 已实现 | 忘记密码 |
| **Test Data Viewer** | `/test-data` | ✅ 已实现 | 测试数据查看器 |

---

## ❌ 待实现的功能模块

### 核心操作区

| 模块 | 数据库表 | 优先级 | 说明 |
|------|----------|--------|------|
| **Alarm History** | `alarm_events` | 高 | 告警历史查询、筛选、详情 |
| **Alarm Settings** | `alarm_cloud`, `alarm_device` | 高 | 告警策略配置 |
| **Real-time Monitoring** | `iot_timeseries` | 高 | 实时监控数据展示 |
| **Historical Trajectory** | `iot_timeseries` | 中 | 历史轨迹回放（4H 内从 Redis，更长从 DB） |
| **Vital Signs Dashboard** | `iot_timeseries`, `cards` | 中 | 生命体征仪表盘 |

### 数据管理区

| 模块 | 数据库表 | 优先级 | 说明 |
|------|----------|--------|------|
| **Resident List** | `residents` | 高 | 住户列表（Manager 查看所有，Nurse/Caregiver 查看分配的） |
| **Resident Profile** | `residents`, `resident_phi` | 高 | 住户基本信息、PHI、联系人（标签页） |
| **Resident PHI** | `resident_phi` | 高 | 住户 PHI 信息（加密存储） |
| **Resident Contacts** | `resident_contacts` | 高 | 住户联系人管理 |
| **Resident Caregivers** | `resident_caregivers` | 高 | 住户-护理员关联管理 |
| **Care Assignments** | `resident_caregivers` | 高 | 护理分配（Manager 分配 Nurse/Caregiver 到 Resident） |
| **Assignment Overview** | `residents`, `resident_caregivers` | 高 | 分配概览（汇总表） |
| **Rounds Management** | `rounds`, `round_details` | 中 | 巡房管理（Nurse/Caregiver 记录巡房） |
| **Service Levels** | `service_levels` | 低 | 服务级别管理 |

### 系统设置区

| 模块 | 数据库表 | 优先级 | 说明 |
|------|----------|--------|------|
| **Device Store** | `device_store` | 中 | 设备库存管理（SystemAdmin） |
| **Building Management** | `units` (building, floor) | 低 | 楼栋/楼层管理（已在 Unit Management 中部分实现） |
| **Config Versions** | `config_versions` | 低 | 配置版本管理 |
| **SNOMED Mapping** | `snomed_mapping` | 低 | SNOMED 编码映射 |

---

## 📊 数据库表与功能模块对应关系

### 核心操作相关表

| 数据库表 | 功能模块 | 状态 |
|----------|----------|------|
| `alarm_events` | Alarm History | ❌ 待实现 |
| `alarm_cloud` | Alarm Settings | ❌ 待实现 |
| `alarm_device` | Alarm Settings | ❌ 待实现 |
| `iot_timeseries` | Real-time Monitoring, Historical Trajectory | ❌ 待实现 |
| `cards` | Vital Signs Dashboard | ❌ 待实现 |

### 数据管理相关表

| 数据库表 | 功能模块 | 状态 |
|----------|----------|------|
| `residents` | Resident Management | ❌ 待实现 |
| `resident_phi` | Resident PHI | ❌ 待实现 |
| `resident_contacts` | Resident Contacts | ❌ 待实现 |
| `resident_caregivers` | Care Assignments | ❌ 待实现 |
| `rounds` | Rounds Management | ❌ 待实现 |
| `round_details` | Rounds Management | ❌ 待实现 |
| `service_levels` | Service Levels | ❌ 待实现 |

### 系统设置相关表

| 数据库表 | 功能模块 | 状态 |
|----------|----------|------|
| `tenants` | Tenant Management | ❌ 待实现（SystemAdmin） |
| `users` | User Management | ✅ 已实现 |
| `roles` | Role Management | ✅ 已实现 |
| `role_permissions` | Permission Management | ✅ 已实现 |
| `tags_catalog` | Tag Management | ✅ 已实现 |
| `devices` | Device Management | ✅ 已实现 |
| `device_store` | Device Store | ❌ 待实现 |
| `units` | Unit Management | ✅ 已实现 |
| `rooms` | Unit Management | ✅ 已实现 |
| `beds` | Unit Management | ✅ 已实现 |
| `config_versions` | Config Versions | ❌ 待实现 |
| `snomed_mapping` | SNOMED Mapping | ❌ 待实现 |

---

## 📈 实现进度统计

### 总体进度

- **已实现**: 10 个模块
- **待实现**: 18+ 个模块
- **完成度**: 约 35%

### 分类进度

| 分类 | 已实现 | 待实现 | 完成度 |
|------|--------|--------|--------|
| 核心操作区 | 2 | 5 | 29% |
| 数据管理区 | 0 | 9 | 0% |
| 系统设置区 | 6 | 4 | 60% |

---

## 🎯 优先级建议

### P0 (高优先级 - 核心功能)

1. **Resident Management** - 住户管理（列表、详情、PHI、联系人）
2. **Care Assignments** - 护理分配
3. **Alarm History** - 告警历史
4. **Alarm Settings** - 告警设置
5. **Real-time Monitoring** - 实时监控

### P1 (中优先级 - 重要功能)

1. **Rounds Management** - 巡房管理
2. **Historical Trajectory** - 历史轨迹回放
3. **Vital Signs Dashboard** - 生命体征仪表盘
4. **Device Store** - 设备库存管理

### P2 (低优先级 - 辅助功能)

1. **Service Levels** - 服务级别管理
2. **Config Versions** - 配置版本管理
3. **SNOMED Mapping** - SNOMED 编码映射
4. **Tenant Management** - 租户管理（SystemAdmin）

---

## 📝 备注

1. **Resident Profile** 应使用标签页（Tabs）实现：
   - Profile（基本信息）
   - PHI（受保护健康信息）
   - Contacts（联系人）

2. **权限控制**：
   - Manager 可以查看所有住户
   - Nurse/Caregiver 只能查看分配的住户（assigned_only）
   - 所有角色都需要 `read` 权限访问 `units`, `rooms`, `beds`, `devices`（不暴露住户信息）

3. **数据访问**：
   - 历史轨迹：4 小时内从 Redis 缓存读取，更长从 `iot_timeseries` 读取
   - PHI 数据：加密存储，需要特殊权限访问

4. **设备绑定规则**：
   - SleepPad 只能绑定到 Bed
   - 其他设备可以绑定到 Room 或 Bed
   - 绑定到 Unit 时，自动创建 `unit_room` (room_name === unit_name)

