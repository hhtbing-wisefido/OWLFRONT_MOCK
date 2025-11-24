# Devices Management 需求分析

## 术语说明

### CRUD 是什么？

**CRUD** 是四个基本数据库操作的缩写：
- **C**reate（创建）：新增设备记录
- **R**ead（读取/查询）：查询设备列表、查看设备详情
- **U**pdate（更新）：修改设备信息
- **D**elete（删除）：删除设备记录

在设备管理中，"设备 CRUD" 指的是设备的**创建、查询、更新、删除**这四个基本操作。

## 模块范围说明

### 设备管理模块（Devices Management）包含（租户界面）：
- ✅ 设备基本信息管理（CRUD：创建、查询、更新、删除）
- ✅ 设备审批流程（business_access：pending/approved/rejected）
- ✅ 设备技术规格显示（comm_mode, firmware_version, mcu_model，只读，从设备读取）
- ✅ 设备状态管理（status：online/offline/error/disabled）

### 设备管理模块不包含（属于其他模块）：
- ❌ 设备库存管理（device_store）→ **属于后台管理系统，暂不做**
- ❌ 设备安装管理（installed, installation_date_utc）→ **已从数据库移除**
- ❌ 设备监护状态管理（monitoring_enabled）→ **属于 Location 模块，在 location-device 绑定界面中管理**
- ❌ 设备位置绑定（Location → Room → Bed）→ **属于 Location 模块**
- ❌ 设备元数据管理（metadata JSONB）→ **属于 alarm/IoT alarm monitor 模块，用于警报设置**
- ❌ 设备告警查询和处理 → **属于 alarm/Alarm Records 模块**
- ❌ Alarm Notification Setting（报警设置）→ **属于 alarm 模块**
- ❌ 设备数据监控（实时数据、历史数据）→ **属于 monitoring 模块**

---

## 一、数据库结构分析

### 1.1 v1.5 数据库设计（owlRD）

#### 1.1.1 `devices` 表（11_devices.sql）

**核心字段（租户设备管理界面相关）：**
- `device_id` (UUID, Primary Key)
- `tenant_id` (UUID, 租户ID)
- `device_name` (VARCHAR(100), 设备名称) - **可编辑**
- `device_model` (VARCHAR(50), 设备型号，如 WF-RADAR-60G-V2) - **只读，从设备读取**
- `device_type` (VARCHAR(50), 设备类型：Radar / SleepPad / VibrationSensor / Gateway 等) - **只读，从设备读取**
- `serial_number` (VARCHAR(100), 序列号，可空) - **只读，从设备读取**
- `uid` (VARCHAR(50), 唯一UID，可空) - **只读，从设备读取**
- `imei` (VARCHAR(50), 4G设备IMEI，可空) - **只读，从设备读取**
- `comm_mode` (VARCHAR(20), 通讯方式：WiFi / LTE / Zigbee 等) - **只读，从设备读取**
- `firmware_version` (VARCHAR(50), 固件版本) - **只读，从设备读取**
- `mcu_model` (VARCHAR(50), MCU/主控型号，可选) - **只读，从设备读取**
- `status` (VARCHAR(20), 实时状态：'online'/'offline'/'error'/'disabled') - **只读，从设备读取**
- `business_access` (VARCHAR(20), 租户业务接入权限) - **可编辑，值为 'pending'/'approved'/'rejected'**

**其他字段（不在租户设备管理界面处理）：**
- `location_id` (UUID, 位置ID) - **在 Location 模块处理**
- `bound_room_id` (UUID, 绑定房间ID) - **在 Location 模块处理**
- `bound_bed_id` (UUID, 绑定床位ID) - **在 Location 模块处理**
- `monitoring_enabled` (BOOLEAN, 是否启用监护功能) - **在 Location 模块的 location-device 绑定界面中管理**
- `metadata` (JSONB, 扩展配置/标签) - **在 alarm/IoT alarm monitor 模块处理**

**业务规则：**
1. `serial_number` 与 `uid` 至少填一个，两者在各自租户内各自唯一
2. `business_access` 字段：
   - `'pending'` - 待审批（默认值）
   - `'approved'` - 允许接入
   - `'rejected'` - 拒绝接入
3. `status` 字段：
   - `'online'` - 在线
   - `'offline'` - 离线
   - `'error'` - 错误
   - `'disabled'` - 已禁用/丢失/故障（软删除状态）
4. 删除逻辑：
   - 检查 `iot_timeseries` 表中是否有该设备的数据
   - 如果 `iot_timeseries` 有数据（设备使用过）→ 软删除：设置 `status = 'disabled'`
   - 如果 `iot_timeseries` 无数据（设备未使用过）→ 物理删除：DELETE 记录
   - 查询时默认过滤 `status = 'disabled'` 的设备

#### 1.1.2 `device_store` 表（25_device_store.sql）

**注意：** `device_store` 表属于后台管理系统，由系统管理员管理，不在租户设备管理界面中处理。

**核心字段：**
- `device_store_id` (UUID, Primary Key)
- `device_type` (VARCHAR(50), 设备类型，非空)
- `device_model` (VARCHAR(50), 设备型号)
- `serial_number` (VARCHAR(100), 序列号，可空)
- `uid` (VARCHAR(50), 唯一UID，可空)
- `tenant_id` (UUID, 租户ID，默认值：'00000000-0000-0000-0000-000000000000' 表示未分配)
- `import_date` (TIMESTAMPTZ, 入库时间)
- `allocate_time` (TIMESTAMPTZ, 系统管理员分配时间)
- `allow_access` (BOOLEAN, 系统级别权限控制)

**业务规则：**
1. 在分配给客户之前，录入公司所有设备，避免非授权设备接入
2. 设备在分配给租户之前，`tenant_id = '00000000-0000-0000-0000-000000000000'`（表示未分配）
3. 当设备分配给租户时，`tenant_id` 更新为实际租户 ID，`allocate_time` 记录分配时间
4. 设备分配给租户后，会在 `devices` 表中创建对应的设备记录
5. `serial_number` 与 `uid` 至少填一个，两者全局唯一（允许 NULL）
6. 设备可以接入业务系统的条件：
   - `device_store.allow_access = TRUE`（系统级别，系统管理员控制）
   - `devices.business_access = 'approved'`（租户级别，租户管理员控制）

### 1.2 v1.0 数据库设计（推测）

根据 v1.0 代码分析，v1.0 的设备表结构可能包含：
- `id` (string)
- `name` (string)
- `type` (number, 设备类型编号)
- `code` (string, 设备代码)
- `internalCode` (string, 设备IMEI)
- `model` (string, 设备型号)
- `brand` (string, 品牌)
- `provider` (string, 提供商)
- `manufacturer` (string, 制造商)
- `status` (number, 状态编号)
- `onlineStatus` (number, 在线状态编号)
- `parameters` (string, 参数字符串)
- `description` (string, 描述)
- `created` (Date)
- `updated` (Date)

## 二、v1.0 vs v1.5 差异对比

### 2.1 数据模型差异

| 维度 | v1.0 | v1.5 |
|------|------|------|
| **主键类型** | string (可能是数字ID) | UUID |
| **租户隔离** | 可能没有明确的租户字段 | 明确的 `tenant_id` 字段，支持多租户 |
| **设备类型** | `type` (number, 编号) | `device_type` (VARCHAR(50), 字符串类型名) |
| **设备标识** | `code` + `internalCode` (IMEI) | `serial_number` + `uid` + `imei` (更灵活) |
| **设备状态** | `status` (number) + `onlineStatus` (number) | `status` (VARCHAR(20)) + `installed` + `business_access` + `monitoring_enabled` (三个布尔值，更细粒度) |
| **位置绑定** | 可能通过 `addressId` 关联 | `location_id` + `bound_room_id` + `bound_bed_id` (三级绑定) |
| **扩展配置** | `parameters` (string) + `description` (string) | `metadata` (JSONB, 更灵活，可存储结构化数据) |
| **技术规格** | 无 | `comm_mode` (通讯方式) + `firmware_version` (固件版本) + `mcu_model` (MCU型号) |
| **安装管理** | 无 | `installed` + `installation_date_utc` (明确的安装状态和时间) |
| **业务审批** | 无 | `business_access` (设备接入系统审批) |
| **监护状态** | 无 | `monitoring_enabled` (是否启用监护功能) |

### 2.2 功能差异

#### 2.2.1 设备管理功能

**v1.0 功能：**
- ✅ 设备列表查询（支持搜索、分页）
- ✅ 设备详情查看
- ✅ 设备创建/编辑/删除（CRUD）
- ✅ 设备状态管理（status, onlineStatus）
- ⚠️ 设备告警查询（`getDeviceAlarmsApi`, `getDevicesAlarmsApi`, `getAddressAlarmsApi`）**→ 属于 alarm 模块**
- ⚠️ 设备告警处理（`handleDeviceAlarmApi`）**→ 属于 alarm 模块**
- ✅ 设备关系查询（`getDeviceRelationsApi`）
- ✅ Sleepace 设备特殊配置（床参数、离床模式）
- ✅ 批量设备查询（`getMultipleDevicesApi`）
- ✅ 预准备设备查询（`getPreparedDevicesApi`）

**注意：** 设备告警查询/处理功能属于独立的 **alarm/Alarm Records** 模块，不在设备管理模块范围内。Alarm Notification Setting（报警设置）也属于 alarm 模块，后续单独设计。

**v1.5 租户设备管理功能需求：**
- ✅ 设备审批流程（`business_access`）
  - 新设备加入时，`business_access='pending'`（待审批）
  - 管理员审批：`'approved'`（允许）或 `'rejected'`（拒绝）
- ✅ 设备删除管理
  - 物理删除：设备未使用过（`iot_timeseries` 表中无数据）
  - 软删除：设备使用过（`iot_timeseries` 表中有数据），设置 `status = 'disabled'`
  - 默认查询时过滤 `status = 'disabled'` 的设备

**v1.5 其他模块功能（不在设备管理界面）：**
- ❌ 设备库存管理（`device_store` 表）→ **属于后台管理系统，暂不做**
- ❌ 设备安装管理（`installed` + `installation_date_utc`）→ **已从数据库移除**
- ❌ 设备监护状态管理（`monitoring_enabled`）→ **属于 Location 模块，在 location-device 绑定界面中管理**
- ❌ 设备位置三级绑定（Location → Room → Bed）→ **属于 Location 模块**
- ❌ 设备元数据管理（`metadata` JSONB）→ **属于 alarm/IoT alarm monitor 模块，用于警报设置**

#### 2.2.2 API 接口差异

**v1.0 API 端点：**
```
GET    /device/api/v1/device/items                    # 获取设备列表
GET    /device/api/v1/device/items/:ids              # 批量获取设备
GET    /device/api/v1/device/:id                     # 获取设备详情
POST   /device/api/v1/device/item                    # 创建设备
PUT    /device/api/v1/device/:id                     # 更新设备
DELETE /device/api/v1/device/:id                     # 删除设备
GET    /device/api/v1/device/alarms/:id              # 获取设备告警
GET    /device/api/v1/device/alarms                  # 获取多个设备告警
GET    /device/api/v1/device/alarms/address/:id      # 获取地址告警
PUT    /device/api/v1/device/alarm/:id               # 处理设备告警
GET    /device/api/v1/device/prepared/items          # 获取预准备设备
GET    /device/api/v1/device/item/:id/relations     # 获取设备关系
PUT    /sleepace/api/v1/sleepace/settings/bed-parameters/device/:code  # Sleepace床参数
PUT    /sleepace/api/v1/sleepace/settings/leaving-mode/device/:id/:code  # Sleepace离床模式
GET    /sleepace/api/v1/sleepace/settings/leaving-mode/device/:id/:code  # 获取Sleepace离床模式
```

**v1.5 租户设备管理界面需要的 API 端点：**
```
# 设备列表和详情
GET    /device/api/v1/device/items                    # 获取设备列表（支持排序、筛选、分页）
GET    /device/api/v1/device/:id                      # 获取设备详情（暂不实现详情页）

# 设备更新
PUT    /device/api/v1/device/:id                     # 更新设备信息（device_name, business_access）

# 设备删除
DELETE /device/api/v1/device/:id                     # 删除设备（由 server 判断物理删除或软删除）
```

**v1.5 其他模块的 API 端点（不在设备管理界面）：**
```
# 设备库存管理 → 属于后台管理系统，暂不做
# GET    /device/api/v1/device-store/items             # 获取设备库存列表
# GET    /device/api/v1/device-store/unassigned        # 获取未分配设备
# GET    /device/api/v1/device-store/tenant/:tenant_id # 获取租户设备
# POST   /device/api/v1/device-store/item              # 设备入库
# PUT    /device/api/v1/device-store/:id/bind          # 分配设备给租户
# PUT    /device/api/v1/device-store/:id/unbind         # 取消设备分配

# 设备位置绑定和监护状态 → 属于 Location 模块
# PUT    /device/api/v1/device/:id/bind-location        # 绑定设备到位置
# PUT    /device/api/v1/device/:id/bind-room            # 绑定设备到房间
# PUT    /device/api/v1/device/:id/bind-bed             # 绑定设备到床位
# PUT    /device/api/v1/device/:id/unbind-location       # 解绑设备位置
# PUT    /device/api/v1/device/:id/enable-monitoring    # 启用设备监护
# PUT    /device/api/v1/device/:id/disable-monitoring   # 禁用设备监护

# 设备元数据 → 属于 alarm/IoT alarm monitor 模块
# PUT    /device/api/v1/device/:id/metadata             # 更新设备元数据
# GET    /device/api/v1/device/:id/metadata              # 获取设备元数据

# 设备告警 → 属于 alarm 模块
# GET    /device/api/v1/device/alarms/:id              # 获取设备告警
# GET    /device/api/v1/device/alarms                  # 获取多个设备告警
# GET    /device/api/v1/device/alarms/address/:id      # 获取地址告警
# PUT    /device/api/v1/device/alarm/:id               # 处理设备告警
```

### 2.3 UI/UX 差异

#### 2.3.1 v1.0 UI 特点

**设备列表页（devices-management.vue）：**
- 搜索框（支持模糊搜索）
- 添加设备按钮（权限控制：`role <= 1`）
- 表格显示：设备名称、类型、代码、IMEI、型号、品牌、提供商、制造商、状态
- 操作列：Settings（Sleepace 设备设置）、Edit、Delete
- Sleepace 设备特殊设置模态框（离床模式选择）

**设备表单页（device-form.vue）：**
- 基本信息：Name, Device type, Device code, Device IMEI, Device model, Brand, Provider, Manufacturer
- Parameters（文本域，1024字符限制）
- Description（文本域，1024字符限制）
- 设备类型选择（编辑时禁用）
- 设备代码和IMEI（编辑时禁用）
- "Select" 按钮（用于从预准备设备中选择）

#### 2.3.2 v1.5 UI 需求（租户设备管理界面）

**设备列表页（DeviceList.vue）- 电子表格风格：**
- 表格设计：一行一个设备，像电子表格一样
- 表头排序：所有列支持排序（点击表头箭头）
- 表头筛选：Status 列带多选下拉筛选器（online/offline/error/disabled，默认 disabled 未选中）
- 可编辑字段：
  - `device_name` - 单元格编辑（双击编辑）
  - `business_access` - 下拉选择（'pending'/'approved'/'rejected'，颜色标识：允许绿、拒绝红、待审批黄/灰）
- 只读字段（设备自身属性，从设备读取）：
  - `device_type` - 只读，支持排序
  - `device_model` - 只读，支持排序
  - `serial_number` - 只读，支持排序
  - `uid` - 只读，支持排序
  - `imei` - 只读，支持排序
  - `comm_mode` - 只读，支持排序
  - `firmware_version` - 只读，支持排序
  - `mcu_model` - 只读，支持排序
  - `status` - 只读，支持排序和筛选
- 操作列：
  - Delete 按钮 - 始终可点击，悬停提示："仅当设备未接入使用才能删除，否则，仅是禁用"。由 server 判断是物理删除还是软删除
- 分页组件

**设备详情/编辑页（DeviceDetail.vue）- 暂不实现：**
- 设备基本信息表单（调用API获取/更新）
- 保存/取消按钮

**设备创建页 - 暂不实现：**
- 设备创建表单
- 表单验证
- 提交按钮

**注意：**
- 不需要批量审批功能
- 不需要单独的"查看"按钮，表格直接展示
- 不需要设备库存管理页（属于后台管理系统）

### 2.4 权限控制差异

**v1.0：**
- 设备管理权限：`role <= 1`（可能是 Admin 或 Director）
- 操作权限：Settings、Edit、Delete 都需要 `role <= 1`

**v1.5 租户设备管理权限需求（参考其他模块）：**
- 设备列表查看：`['Admin', 'Director', 'IT', 'NurseManager']`
- 设备编辑（device_name, business_access）：`['Admin', 'Director', 'IT']`
- 设备删除：`['Admin', 'Director', 'IT']`
- 设备审批（business_access）：`['Admin', 'Director']`

**其他模块权限（不在设备管理界面）：**
- 设备库存管理：`['Admin', 'Director', 'IT']` → **属于后台管理系统，暂不做**
- 设备位置绑定和监护状态管理：`['Admin', 'Director', 'IT', 'NurseManager']` → **属于 Location 模块**
- 设备元数据管理：`['Admin', 'Director', 'IT']` → **属于 alarm/IoT alarm monitor 模块**

## 三、v1.5 租户设备管理 UI 设计（最终版）

### 3.1 设备列表页表格设计

#### 3.1.1 表格列设计

**可编辑字段：**
| 列名 | 类型 | 编辑方式 | 排序 | 说明 |
|------|------|----------|------|------|
| **Device Name** | 文本 | ✅ 单元格编辑 | ✅ | 双击编辑，用户自定义设备名称 |
| **Business Access** | 下拉 | ✅ 下拉选择 | ✅ | 3 个状态：`'approved'`（允许，绿）、`'rejected'`（拒绝，红）、`'pending'`（待审批，黄/灰） |

**只读字段（设备自身属性，从设备读取）：**
| 列名 | 类型 | 排序 | 说明 |
|------|------|------|------|
| **Device Type** | 文本 | ✅ | 只读，设备类型（Radar / SleepPad / VibrationSensor / Gateway 等） |
| **Device Model** | 文本 | ✅ | 只读，设备型号（如 WF-RADAR-60G-V2） |
| **Serial Number** | 文本 | ✅ | 只读，序列号 |
| **UID** | 文本 | ✅ | 只读，唯一 UID |
| **IMEI** | 文本 | ✅ | 只读，4G 设备 IMEI |
| **Comm Mode** | 文本 | ✅ | 只读，通讯方式（WiFi / LTE / Zigbee 等） |
| **Firmware Version** | 文本 | ✅ | 只读，固件版本 |
| **MCU Model** | 文本 | ✅ | 只读，MCU/主控型号 |
| **Status** | 标签 + 筛选器 | ✅ | 只读，实时状态（online/offline/error/disabled） |

**操作列：**
| 列名 | 类型 | 说明 |
|------|------|------|
| **Delete** | 按钮 | 始终可点击，悬停提示："仅当设备未接入使用才能删除，否则，仅是禁用"。由 server 判断是物理删除还是软删除 |

#### 3.1.2 Status 筛选器设计

- **位置**：Status 表头右侧，带筛选图标
- **类型**：多选下拉（Checkbox 组）
- **选项**：
  - ✅ online（默认选中）
  - ✅ offline（默认选中）
  - ✅ error（默认选中）
  - ❌ disabled（默认未选中，即默认隐藏已禁用设备）
- **交互**：
  - 点击表头筛选图标打开下拉
  - 勾选/取消勾选控制显示哪些状态的设备
  - 筛选条件实时生效

#### 3.1.3 表格功能总结

- ✅ **表头排序**：所有列支持排序（点击表头箭头）
- ✅ **表头筛选**：仅 Status 列带多选下拉筛选器
- ✅ **单元格编辑**：仅 `Device Name` 可双击编辑
- ✅ **下拉选择**：`Business Access` 使用下拉选择器（3 个状态）
- ✅ **只读显示**：设备自身属性字段只读，显示从设备读取的值
- ✅ **删除按钮**：始终可点击，悬停提示删除逻辑
- ❌ **批量操作**：不需要批量审批功能

#### 3.1.4 删除逻辑

**删除判断（由 server 执行）：**
- 检查 `iot_timeseries` 表中是否有该设备的数据
- **有数据（设备使用过）** → 软删除：设置 `status = 'disabled'`
- **无数据（设备未使用过）** → 物理删除：DELETE 记录

**UI 交互：**
- Delete 按钮始终可点击（可提交）
- 鼠标悬停提示：`"仅当设备未接入使用才能删除，否则，仅是禁用"`
- 使用 `a-tooltip` 组件显示提示

**查询过滤：**
- 默认查询时自动过滤 `status = 'disabled'` 的设备
- 可通过 Status 筛选器显示/隐藏已禁用设备

### 3.2 数据库字段确认

#### 3.2.1 business_access 字段
- **类型**：`VARCHAR(20) NOT NULL DEFAULT 'pending'`
- **约束**：`CHECK (business_access IN ('pending', 'approved', 'rejected'))`
- **值说明**：
  - `'pending'` - 待审批（默认值，黄色/灰色标识）
  - `'approved'` - 允许（绿色标识）
  - `'rejected'` - 拒绝（红色标识）

#### 3.2.2 status 字段
- **类型**：`VARCHAR(20) NOT NULL DEFAULT 'offline'`
- **可能的值**：
  - `'online'` - 在线（绿色标签）
  - `'offline'` - 离线（灰色标签）
  - `'error'` - 错误（红色标签）
  - `'disabled'` - 已禁用/丢失/故障（红色标签，软删除状态）

## 四、v1.5 实现要点

### 4.1 数据模型设计

**前端数据模型（TypeScript Interface）：**

```typescript
// 设备基础信息（租户设备管理界面）
interface Device {
  device_id: string
  tenant_id: string
  device_name: string  // 可编辑
  device_model: string  // 只读，从设备读取
  device_type: string  // 'Radar' | 'SleepPad' | 'VibrationSensor' | 'Gateway' | ...，只读，从设备读取
  serial_number?: string  // 只读，从设备读取
  uid?: string  // 只读，从设备读取
  imei?: string  // 只读，从设备读取
  comm_mode: string  // 'WiFi' | 'LTE' | 'Zigbee' | ...，只读，从设备读取
  firmware_version: string  // 只读，从设备读取
  mcu_model?: string  // 只读，从设备读取
  status: string  // 'online' | 'offline' | 'error' | 'disabled'，只读，从设备读取
  business_access: 'pending' | 'approved' | 'rejected'  // 可编辑，租户业务接入权限
  // 以下字段不在租户设备管理界面处理：
  // location_id?: string  // 在 Location 模块处理
  // bound_room_id?: string  // 在 Location 模块处理
  // bound_bed_id?: string  // 在 Location 模块处理
  // monitoring_enabled?: boolean  // 在 Location 模块的 location-device 绑定界面中管理
  // metadata?: Record<string, any>  // 在 alarm/IoT alarm monitor 模块处理
}
```

### 3.2 前端UI核心功能（界面和交互）

**前端职责：**
- ✅ 提供用户界面（UI）
- ✅ 用户交互（点击、输入、选择等）
- ✅ 调用后端API
- ✅ 展示数据
- ✅ 表单验证（前端基础验证）
- ❌ **不负责业务逻辑**（业务逻辑由后端server负责）

**需要实现的UI页面和组件：**

1. **设备列表页（DeviceList.vue）**
   - 设备列表表格展示（电子表格风格，一行一个设备）
   - 表头排序：所有列支持排序（点击表头箭头）
   - 表头筛选：Status 列带多选下拉筛选器（online/offline/error/disabled，默认 disabled 未选中）
   - 可编辑字段：
     - `device_name` - 单元格编辑（双击编辑）
     - `business_access` - 下拉选择（'pending'/'approved'/'rejected'）
   - 只读字段（设备自身属性，从设备读取）：
     - `device_type`, `device_model`, `serial_number`, `uid`, `imei`, `comm_mode`, `firmware_version`, `mcu_model`, `status`
   - 操作列：Delete 按钮（悬停提示删除逻辑）
   - 分页组件
   - 调用 API：`GET /device/api/v1/device/items`（获取设备列表）
   - 调用 API：`PUT /device/api/v1/device/:id`（更新设备信息）
   - 调用 API：`DELETE /device/api/v1/device/:id`（删除设备，由 server 判断物理删除或软删除）

2. **设备详情/编辑页（DeviceDetail.vue）- 暂不实现**
   - 基本信息表单（调用API获取/更新）
   - 保存/取消按钮

3. **设备创建页 - 暂不实现**
   - 设备创建表单
   - 表单验证
   - 提交按钮

4. **设备库存管理页 - 暂不实现（属于后台管理系统）**

### 3.3 与 v1.0 的兼容性

- **保留的功能：**
  - 设备列表查询、创建、编辑、删除
  - 设备告警查询和处理
  - Sleepace 设备特殊配置（如果 v1.5 仍需要）
  - 设备关系查询

- **需要迁移的数据：**
  - v1.0 的设备数据需要迁移到 v1.5 的新表结构
  - `type` (number) → `device_type` (string)
  - `code` + `internalCode` → `serial_number` + `uid` + `imei`
  - `status` (number) + `onlineStatus` (number) → `status` (string) + `installed` + `business_access` + `monitoring_enabled`
  - `parameters` (string) → `metadata` (JSONB)

## 四、总结

### 4.1 主要差异

1. **数据模型更完善：**
   - v1.5 使用 UUID 主键，支持多租户
   - v1.5 `business_access` 字段改为 `VARCHAR(20)`，支持 3 个状态：'pending'/'approved'/'rejected'
   - v1.5 `status` 字段支持 'disabled' 状态，用于软删除
   - v1.5 设备自身属性字段（device_model, device_type, serial_number, uid, imei, comm_mode, firmware_version, mcu_model）只读，从设备读取

2. **功能更清晰：**
   - v1.5 租户设备管理界面只处理设备基本信息、审批流程、删除管理
   - v1.5 设备位置绑定和监护状态管理在 Location 模块处理
   - v1.5 设备元数据管理在 alarm/IoT alarm monitor 模块处理
   - v1.5 设备库存管理属于后台管理系统，暂不做

3. **业务规则更清晰：**
   - v1.5 明确了设备删除逻辑（物理删除 vs 软删除）
   - v1.5 明确了设备审批流程（pending → approved/rejected）
   - v1.5 明确了各模块职责划分（设备管理、Location、alarm 模块）

### 4.2 前端UI实现优先级

**Phase 1（核心UI界面）- 租户设备管理：**
1. **设备列表页（DeviceList.vue）**
   - 设备列表表格（电子表格风格，调用 `GET /device/api/v1/device/items`）
   - 表头排序：所有列支持排序
   - 表头筛选：Status 列带多选下拉筛选器（默认过滤 disabled）
   - 单元格编辑：`device_name` 双击编辑
   - 下拉选择：`business_access` 下拉选择（3 个状态）
   - 删除按钮：Delete 按钮（悬停提示，调用 `DELETE /device/api/v1/device/:id`）
   - 分页组件
   - 更新 API：`PUT /device/api/v1/device/:id`（更新设备信息）

**Phase 2（扩展UI功能）- 暂不实现：**
1. **设备详情/编辑页（DeviceDetail.vue）**
   - 设备详情展示（调用 `GET /device/api/v1/device/:id`）
   - 基本信息编辑表单（调用 `PUT /device/api/v1/device/:id`）
   - 保存/取消按钮

2. **设备创建页**
   - 设备创建表单（调用 `POST /device/api/v1/device/item`）
   - 表单验证
   - 提交按钮

**Phase 3（其他模块）- 不在设备管理界面：**
1. **设备位置绑定UI** → **属于 Location 模块**
   - 位置三级选择器（Location → Room → Bed）
   - 绑定/解绑按钮
   - 监护状态管理（monitoring_enabled）

2. **设备元数据管理UI** → **属于 alarm/IoT alarm monitor 模块**
   - JSON编辑器或表单（用于警报设置）
   
3. **设备库存管理UI** → **属于后台管理系统，暂不做**
   - 设备库存列表页
   - 设备入库表单
   - 设备分配操作

**注意：**
- 所有业务逻辑（验证、审批、状态转换等）由后端server负责
- 前端只负责UI展示、用户交互和API调用
- 前端可以进行基础的表单验证（如必填项、格式检查），但业务规则验证由后端负责

**不属于设备管理模块（后续在 alarm 模块实现）：**
- 设备告警查询和处理（属于 alarm/Alarm Records 模块）
- Alarm Notification Setting（报警设置，属于 alarm 模块）

