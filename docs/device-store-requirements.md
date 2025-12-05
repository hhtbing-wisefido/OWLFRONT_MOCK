# Device Store 管理页面需求分析

## 一、表结构分析

### device_store 表（系统级设备库存表）
**用途**：系统管理员管理设备库存、分配、出库、OTA 升级

**核心字段**：
- **物理属性**（设备固有属性）：
  - `device_type` - 设备类型（Radar/SleepPad/VibrationSensor/Gateway等）
  - `device_model` - 设备型号
  - `serial_number` - 序列号（与 uid 至少填一个）
  - `uid` - 唯一 UID（与 serial_number 至少填一个）
  - `imei` - 4G 设备 IMEI
  - `comm_mode` - 通信模式（WiFi/LTE/Zigbee等）
  - `mcu_model` - MCU/主控型号

- **固件版本管理**：
  - `firmware_version` - 设备当前运行的固件版本（权威数据源）
  - `ota_target_firmware_version` - OTA 目标固件版本（SystemAdmin 设置）
  - `ota_target_mcu_model` - OTA 目标 MCU 型号（可选）

- **分配管理**：
  - `tenant_id` - 租户 ID（默认值表示未分配）
  - `import_date` - 入库时间
  - `allocate_time` - 分配时间

- **系统权限**：
  - `allow_access` - 系统是否允许设备接入业务系统

### devices 表（租户级设备业务表）
**用途**：租户管理业务设备

**核心字段**：
- `device_name` - 设备名称（用户自定义）
- `business_access` - 租户业务访问权限（pending/approved/rejected）
- `status` - 设备状态（online/offline/error/disabled）
- `monitoring_enabled` - 监控启用状态
- `bound_room_id` / `bound_bed_id` - 位置绑定

**关系**：
- `devices.device_store_id` → `device_store.device_store_id`
- devices 通过 device_store_id 获取物理属性和固件版本

## 二、功能需求

### 2.1 核心功能

1. **设备列表展示**
   - 显示所有设备（包括未分配的）
   - **搜索功能**：支持按 Serial Number / UID / IMEI 搜索
   - **排序功能**：所有列表头支持升序排序（点击表头排序）
   - **导出功能**：导出当前列表为 Excel/CSV 文件

2. **设备入库**
   - **单个创建**：手动创建/导入新设备到 device_store
     - 必填字段：device_type, device_model, serial_number 或 uid（至少一个）
     - 可选字段：imei, comm_mode, mcu_model, firmware_version
   - **批量导入**：通过上传 Excel/CSV 文件批量导入设备
     - 支持格式：.xlsx, .xls, .csv
     - 字段映射：Excel 列名 → 数据库字段
     - 数据验证：导入前验证必填字段和格式
     - 错误处理：显示导入结果（成功/失败数量，错误详情）
     - 重复检查：检查 serial_number 和 uid 是否已存在

3. **设备分配**
   - 将设备分配给租户（更新 tenant_id, allocate_time, allow_access）
   - 只能分配未分配的设备（tenant_id = 默认值）

4. **设备收回**
   - 从租户收回设备（重置 tenant_id 为默认值）
   - 只能收回已分配的设备

5. **OTA 升级管理**
   - 设置 OTA 目标固件版本（ota_target_firmware_version）
   - 设置 OTA 目标 MCU 型号（ota_target_mcu_model）
   - 查看设备当前固件版本 vs 目标版本
   - 批量设置 OTA 升级计划

6. **系统权限控制**
   - 设置 allow_access（系统是否允许设备接入）

7. **数据导出**
   - 导出当前筛选的设备列表为 Excel/CSV 文件
   - 支持导出所有字段或选择字段导出
   - 导出文件包含完整的设备信息（物理属性、分配状态、固件版本等）

### 2.2 表格列设计

**重要说明**：所有字段都是从数据库查询回来的，大部分字段为只读，只有以下字段可以修改：

| 列名 | 字段 | 说明 | 可编辑 | 编辑方式 |
|------|------|------|--------|---------|
| Device Type | device_type | 设备类型 | ❌ | 只读（从 DB 查询） |
| Device Model | device_model | 设备型号 | ❌ | 只读（从 DB 查询） |
| Serial Number | serial_number | 序列号 | ❌ | 只读（从 DB 查询） |
| UID | uid | 唯一 UID | ❌ | 只读（从 DB 查询） |
| IMEI | imei | IMEI 号 | ❌ | 只读（从 DB 查询） |
| Comm Mode | comm_mode | 通信模式 | ❌ | 只读（从 DB 查询） |
| MCU Model | mcu_model | MCU 型号 | ❌ | 只读（从 DB 查询） |
| Firmware Version | firmware_version | 当前固件版本 | ❌ | 只读（从 DB 查询） |
| OTA Target Version | ota_target_firmware_version | OTA 目标版本 | ✅ | 文本输入框 |
| OTA Target MCU | ota_target_mcu_model | OTA 目标 MCU | ✅ | 文本输入框 |
| Tenant | tenant_id | 分配租户 | ✅ | 下拉框（显示 tenant_name） |
| Allow Access | allow_access | 系统权限 | ✅ | 滑动开关 |
| Import Date | import_date | 入库时间 | ❌ | 只读（从 DB 查询） |
| Allocate Time | allocate_time | 分配时间 | ❌ | 只读（从 DB 查询） |
| Operation | - | 操作按钮 | - | Save 按钮 |

**编辑规则**：
- ✅ 可编辑字段：直接在表格中修改（Tenant 下拉框、OTA Target Version 文本输入、OTA Target MCU 文本输入、Allow Access 开关）
- ✅ 保存方式：点击 Save 按钮时批量保存所有修改
- ✅ 排序功能：所有列表头支持升序排序（点击表头排序）
- ✅ 搜索功能：支持按 Serial Number / UID / IMEI 搜索

### 2.3 与 DeviceList.vue 的区别

| 特性 | DeviceList.vue | devicestore.vue |
|------|---------------|-----------------|
| **管理范围** | 租户级设备管理 | 系统级设备库存管理 |
| **用户角色** | Admin/Manager/IT | SystemAdmin |
| **核心字段** | device_name, business_access, status | device_type, device_model, serial_number, uid |
| **分配管理** | ❌ | ✅（分配/收回） |
| **OTA 升级** | ❌ | ✅（固件版本管理） |
| **系统权限** | ❌ | ✅（allow_access） |
| **位置绑定** | ✅ | ❌ |
| **业务状态** | ✅（status, business_access） | ❌ |

## 三、实现要点

### 3.1 表格编辑流程

1. **直接编辑**：在表格中直接修改可编辑字段
   - Tenant：点击下拉框选择租户（显示 tenant_name）
   - OTA Target Version：文本输入框输入
   - OTA Target MCU：文本输入框输入
   - Allow Access：点击开关切换

2. **保存修改**：点击 Save 按钮
   - 批量保存所有修改的字段
   - 显示保存成功/失败提示
   - 保存后刷新列表

3. **排序功能**：点击任意列表头
   - 支持升序排序
   - 再次点击切换排序方向（升序/降序/取消排序）

4. **搜索功能**：在搜索框输入
   - 支持按 Serial Number / UID / IMEI 搜索
   - 实时过滤列表

### 3.2 设备入库流程

#### 3.2.1 单个创建设备
1. 点击"创建设备"按钮
2. 填写设备物理属性（device_type, device_model, serial_number/uid 至少一个）
3. 提交创建，设备入库（tenant_id = 默认值，未分配）

#### 3.2.2 批量导入设备（Excel/CSV）
1. 点击"批量导入"按钮
2. 下载导入模板（Excel 格式，包含列名和示例数据）
3. 填写设备信息到模板文件
4. 上传文件（支持 .xlsx, .xls, .csv）
5. 预览导入数据（显示前 10 条，验证格式）
6. 确认导入
7. 显示导入结果：
   - 成功数量
   - 失败数量
   - 错误详情（行号、错误原因）
   - 重复设备列表（如果存在）

**Excel 模板格式**：
| Device Type | Device Model | Serial Number | UID | IMEI | Comm Mode | MCU Model | Firmware Version |
|-------------|--------------|---------------|-----|------|-----------|-----------|------------------|
| Radar       | WF-RADAR-60G | SN001         | UID001 | | WiFi | STM32F4 | 1.0.0 |
| SleepPad    | WF-SP-V2     | SN002         | | | WiFi | ESP32 | 1.2.0 |

**字段说明**：
- **必填字段**：Device Type, Device Model, Serial Number 或 UID（至少一个）
- **可选字段**：IMEI, Comm Mode, MCU Model, Firmware Version
- **字段验证**：
  - Device Type：必须是有效值（Radar/SleepPad/VibrationSensor/Gateway等）
  - Serial Number 和 UID：全局唯一（如果已存在则跳过或报错）
  - IMEI：格式验证（15 位数字）
  - Comm Mode：必须是有效值（WiFi/LTE/Zigbee/Bluetooth等）

**导入规则**：
- 如果 serial_number 或 uid 已存在，跳过该行（不重复导入）
- 如果必填字段缺失，标记为失败，显示错误信息
- 如果格式验证失败，标记为失败，显示错误信息
- 导入成功的设备，tenant_id 自动设置为默认值（未分配状态）

### 3.3 设备分配/收回流程
- **分配设备**：在表格中直接修改 Tenant 字段，选择租户，点击 Save 保存
- **收回设备**：在表格中将 Tenant 字段清空或选择"未分配"，点击 Save 保存
- **系统权限**：通过 Allow Access 开关控制，点击 Save 保存

### 3.5 批量导入设备流程
1. 点击"批量导入"按钮
2. 下载导入模板（Excel 格式，包含列名和示例数据）
3. 填写设备信息到模板文件
4. 上传文件（支持 .xlsx, .xls, .csv）
5. 预览导入数据（显示前 10 条，验证格式）
6. 确认导入
7. 显示导入结果：
   - 成功数量
   - 失败数量
   - 错误详情（行号、错误原因）
   - 重复设备列表（如果存在）

### 3.6 数据导出流程
1. 设置筛选条件（可选：按租户、设备类型、搜索关键词）
2. 点击"导出"按钮
3. 选择导出格式（Excel 或 CSV）
4. 选择导出字段（全选或自定义）
5. 确认导出
6. 下载导出文件
7. 导出文件包含：
   - 表头（字段名称）
   - 所有符合筛选条件的设备数据
   - 包含所有字段（物理属性、分配状态、固件版本、OTA 信息等）

## 四、API 接口需求

```
GET    /admin/api/v1/device-store/items          # 获取设备库存列表
POST   /admin/api/v1/device-store/items          # 创建设备（入库，单个）
PUT    /admin/api/v1/device-store/:id            # 更新设备信息（批量保存）
DELETE /admin/api/v1/device-store/:id            # 删除设备（物理删除）
# 注意：分配/收回设备通过 PUT /admin/api/v1/device-store/:id 更新 tenant_id 实现
PUT    /admin/api/v1/device-store/:id/ota        # 设置 OTA 升级目标
POST   /admin/api/v1/device-store/import          # 批量导入设备（Excel/CSV）
GET    /admin/api/v1/device-store/import-template # 下载导入模板
GET    /admin/api/v1/device-store/export          # 导出设备列表（Excel/CSV）
```

### 4.1 批量导入接口详情

**POST /admin/api/v1/device-store/import**

**请求**：
- Content-Type: `multipart/form-data`
- 参数：`file` (File) - Excel/CSV 文件

**响应**：
```json
{
  "success": true,
  "total": 100,        // 总记录数
  "success_count": 95,  // 成功数量
  "failed_count": 5,   // 失败数量
  "skipped_count": 2,  // 跳过数量（重复设备）
  "errors": [          // 错误详情
    {
      "row": 3,        // 行号（从 1 开始，不包括表头）
      "serial_number": "SN003",
      "error": "Serial number already exists"
    },
    {
      "row": 5,
      "serial_number": "SN005",
      "error": "Device type is required"
    }
  ],
  "skipped": [         // 跳过的设备（重复）
    {
      "row": 7,
      "serial_number": "SN007",
      "uid": "UID007",
      "reason": "Device already exists"
    }
  ]
}
```

**GET /admin/api/v1/device-store/import-template**

**响应**：
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- 返回 Excel 模板文件（.xlsx）

### 4.2 数据导出接口详情

**GET /admin/api/v1/device-store/export**

**请求参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `format` | string | 否 | 导出格式：'excel' 或 'csv'，默认 'excel' |
| `tenant_id` | string | 否 | 租户 ID 筛选（可选） |
| `device_type` | string | 否 | 设备类型筛选（可选） |
| `search` | string | 否 | 搜索关键词（可选） |
| `fields` | string[] | 否 | 导出字段列表（可选，不传则导出所有字段） |
| `include_unallocated` | boolean | 否 | 是否包含未分配设备，默认 true |

**响应**：
- Content-Type: 
  - Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - CSV: `text/csv; charset=utf-8`
- 返回文件下载（文件名：`device-store-export-YYYYMMDD-HHmmss.xlsx` 或 `.csv`）

**导出字段列表**（可选）：
- `device_type` - 设备类型
- `device_model` - 设备型号
- `serial_number` - 序列号
- `uid` - UID
- `imei` - IMEI
- `comm_mode` - 通信模式
- `mcu_model` - MCU 型号
- `firmware_version` - 当前固件版本
- `ota_target_firmware_version` - OTA 目标固件版本
- `ota_target_mcu_model` - OTA 目标 MCU 型号
- `tenant_id` - 租户 ID
- `tenant_name` - 租户名称（如果已分配）
- `allow_access` - 系统权限
- `import_date` - 入库时间
- `allocate_time` - 分配时间

**业务规则**：
- 导出数据基于当前筛选条件（与列表页显示一致）
- 支持导出所有设备或仅导出已分配/未分配设备
- 导出文件包含表头（字段名称）
- Excel 格式支持多工作表（可选：按设备类型分组）
- CSV 格式使用 UTF-8 编码，支持中文

## 五、权限要求

- **所有操作**：仅 SystemAdmin 可访问
- **设备入库**：SystemAdmin
- **设备分配/收回**：SystemAdmin
- **OTA 升级管理**：SystemAdmin
- **系统权限控制**：SystemAdmin

