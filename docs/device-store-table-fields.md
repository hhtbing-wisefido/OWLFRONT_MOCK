# Device Store 表格字段列表（待审核）

## 表格列字段

基于 `device_store` 表结构，以下是 `devicestore.vue` 表格应该显示的字段：

| 序号 | 列名（显示） | 字段名（数据库） | 类型 | 必填 | 可编辑 | 说明 |
|------|------------|----------------|------|------|--------|------|
| 1 | Device Type | `device_type` | VARCHAR(50) | ✅ | ✅ | 设备类型（Radar/SleepPad/VibrationSensor/Gateway等） |
| 2 | Device Model | `device_model` | VARCHAR(50) | ❌ | ✅ | 设备型号（如 WF-RADAR-60G-V2） |
| 3 | Serial Number | `serial_number` | VARCHAR(100) | ⚠️* | ✅ | 序列号（与 UID 至少填一个，全局唯一） |
| 4 | UID | `uid` | VARCHAR(50) | ⚠️* | ✅ | 唯一 UID（与 Serial Number 至少填一个，全局唯一） |
| 5 | IMEI | `imei` | VARCHAR(50) | ❌ | ✅ | 4G 设备 IMEI（仅 4G 设备需要） |
| 6 | Comm Mode | `comm_mode` | VARCHAR(20) | ❌ | ✅ | 通信模式（WiFi/LTE/Zigbee/Bluetooth等） |
| 7 | MCU Model | `mcu_model` | VARCHAR(50) | ❌ | ✅ | MCU/主控型号（如 STM32F4, ESP32） |
| 8 | Firmware Version | `firmware_version` | VARCHAR(50) | ❌ | ✅ | 设备当前运行的固件版本（权威数据源） |
| 9 | OTA Target Version | `ota_target_firmware_version` | VARCHAR(50) | ❌ | ✅ | OTA 目标固件版本（NULL 表示无升级计划） |
| 10 | OTA Target MCU | `ota_target_mcu_model` | VARCHAR(50) | ❌ | ✅ | OTA 目标 MCU 型号（可选，NULL 表示不升级 MCU） |
| 11 | Tenant | `tenant_id` | UUID | ❌ | ✅ | 分配租户（默认值表示未分配，显示租户名称） |
| 12 | Allow Access | `allow_access` | BOOLEAN | ❌ | ✅ | 系统是否允许设备接入业务系统（TRUE/FALSE） |
| 13 | Import Date | `import_date` | TIMESTAMPTZ | ❌ | ❌ | 入库时间（只读，系统自动设置） |
| 14 | Allocate Time | `allocate_time` | TIMESTAMPTZ | ❌ | ❌ | 分配时间（只读，分配时自动设置） |
| 15 | Operation | - | - | - | - | 操作按钮（编辑、删除、分配、收回等） |

## 字段说明

### 必填字段规则
- ⚠️* 表示：`serial_number` 和 `uid` 至少需要填写一个（由应用层验证）

### 字段分组

**物理属性组**（设备固有属性，创建后一般不变）：
- Device Type
- Device Model
- Serial Number
- UID
- IMEI
- Comm Mode
- MCU Model

**固件版本组**（OTA 升级管理）：
- Firmware Version（当前版本）
- OTA Target Version（目标版本）
- OTA Target MCU（目标 MCU 型号）

**分配管理组**：
- Tenant（分配租户）
- Allow Access（系统权限）
- Import Date（入库时间）
- Allocate Time（分配时间）

**操作组**：
- Operation（操作按钮）

## 显示建议

1. **默认显示列**（主要字段）：
   - Device Type
   - Device Model
   - Serial Number
   - UID
   - Firmware Version
   - Tenant
   - Allow Access
   - Operation

2. **可选显示列**（可折叠或通过设置显示）：
   - IMEI
   - Comm Mode
   - MCU Model
   - OTA Target Version
   - OTA Target MCU
   - Import Date
   - Allocate Time

3. **字段显示格式**：
   - `allow_access`: 显示为开关或标签（✅/❌ 或 TRUE/FALSE）
   - `tenant_id`: 显示租户名称（如果已分配），未分配显示 "-" 或 "Unallocated"
   - `firmware_version` vs `ota_target_firmware_version`: 如果不同，高亮显示（表示需要升级）
   - `import_date` / `allocate_time`: 格式化显示（YYYY-MM-DD HH:mm:ss）

## 待确认问题

1. **是否显示 `device_store_id`**？
   - 建议：不显示（作为主键，用户不需要看到）

2. **`tenant_id` 显示方式**？
   - 选项 A：显示租户名称（需要 JOIN tenants 表）
   - 选项 B：显示租户 ID（简单但不够友好）
   - 建议：显示租户名称

3. **`allow_access` 显示方式**？
   - 选项 A：开关组件（可点击切换）
   - 选项 B：标签显示（TRUE/FALSE 或 ✅/❌）
   - 建议：开关组件（可直接操作）

4. **OTA 升级状态显示**？
   - 是否需要单独列显示升级状态（如：需要升级/升级中/已升级）？
   - 建议：通过对比 `firmware_version` 和 `ota_target_firmware_version` 自动判断

5. **字段排序优先级**？
   - 建议：按重要性排序（物理属性 → 固件版本 → 分配管理 → 时间信息）



