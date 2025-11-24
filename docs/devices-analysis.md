# Devices Management 需求分析

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

## 一、功能需求

### 1.1 核心功能

- ✅ **设备审批流程**：新设备 `business_access='pending'`，管理员审批为 `'approved'` 或 `'rejected'`
- ✅ **设备删除管理**：物理删除（未使用过）或软删除（使用过，设置 `status = 'disabled'`）
- ✅ **设备信息管理**：可编辑 `device_name` 和 `business_access`，其他字段只读

### 1.2 权限控制

| 操作 | 角色 |
|------|------|
| 设备列表查看 | Admin, Director, IT, NurseManager |
| 设备编辑 | Admin, Director, IT |
| 设备删除 | Admin, Director, IT |
| 设备审批 | Admin, Director |

---

## 二、UI 设计

### 2.1 设备管理表格设计（最终确认版）

#### 2.1.1 表格列设计

**可编辑字段：**

| 列名            | 类型   | 编辑方式       | 排序 | 说明                                                                                                 |
|----------------|--------|----------------|------|------------------------------------------------------------------------------------------------------|
| **Device Name** | 文本   | ✅ 单元格编辑   | ✅   | 双击编辑，用户自定义设备名称                                                                         |
| **Business Access** | 下拉   | ✅ 下拉选择     | ✅   | 3 个状态：'approved'（允许，绿）、'rejected'（拒绝，红）、'pending'（待审批，黄/灰）                |

**只读字段（设备自身属性）：**

| 列名                | 类型           | 排序 | 说明                           |
|---------------------|----------------|------|--------------------------------|
| **Device Type**     | 文本           | ✅   | 只读，设备类型（支持排序，不支持筛选） |
| **Device Model**    | 文本           | ✅   | 只读，设备型号（支持排序，方便查找）   |
| **Serial Number**   | 文本           | ✅   | 只读，序列号                   |
| **UID**             | 文本           | ✅   | 只读，唯一 UID                |
| **IMEI**            | 文本           | ✅   | 只读，4G 设备 IMEI            |
| **Comm Mode**       | 文本           | ✅   | 只读，通讯方式                 |
| **Firmware Version**| 文本           | ✅   | 只读，固件版本                 |
| **MCU Model**       | 文本           | ✅   | 只读，MCU/主控型号            |
| **Status**          | 标签 + 筛选器  | ✅   | 只读，实时状态。表头带多选下拉筛选器 |

**操作列：**

| 列名      | 类型 | 说明                                                                                                 |
|-----------|------|------------------------------------------------------------------------------------------------------|
| **Delete**| 按钮 | 始终可点击，悬停提示："仅当设备未接入使用才能删除，否则，仅是禁用"。由 server 判断是物理删除还是软删除 |

#### 2.1.2 Status 筛选器设计

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

#### 2.1.3 表格功能总结

- ✅ **表头排序**：所有列支持排序（点击表头箭头），包括 Device Type 和 Device Model
- ✅ **表头筛选**：仅 Status 列带多选下拉筛选器
- ✅ **单元格编辑**：仅 Device Name 可双击编辑
- ✅ **下拉选择**：Business Access 使用下拉选择器（3 个状态）
- ✅ **只读显示**：设备自身属性字段只读
- ✅ **删除按钮**：始终可点击，悬停提示删除逻辑
- ❌ **批量操作**：不需要批量审批功能

---

## 三、实现要点

### 3.1 设备列表页（DeviceList.vue）

**核心功能：**
- 表格展示：电子表格风格，所有列支持排序（前端处理）
- Status 筛选：多选下拉筛选器（online/offline/error/disabled，默认 disabled 未选中）
- 可编辑：`device_name`（双击编辑）、`business_access`（下拉选择）
- 分页：由 server 负责，Vue 传递 `page` 和 `size` 参数
- 删除：Delete 按钮，悬停提示删除逻辑

**API 调用：**
- `GET /device/api/v1/device/items` - 获取设备列表
- `PUT /device/api/v1/device/:id` - 更新设备信息
- `DELETE /device/api/v1/device/:id` - 删除设备

### 3.2 职责划分

- **前端**：UI 展示、用户交互、API 调用、基础表单验证
- **后端**：业务逻辑、复杂验证、数据处理、删除判断（物理/软删除）
