# 数据类型一致性检查报告

## 1. Units 表 (05_units.sql) vs Unit 模型 (unitModel.ts)

### ✅ 一致的字段
- `unit_id` (UUID) → `unit_id: string`
- `tenant_id` (UUID) → `tenant_id: string`
- `location_tag` (VARCHAR(255)) → `location_tag?: string`
- `unit_name` (VARCHAR(255)) → `unit_name: string`
- `building` (VARCHAR(50), DEFAULT '-') → `building?: string`
- `floor` (VARCHAR(50), DEFAULT '1F') → `floor?: string`
- `area_tag` (VARCHAR(255)) → `area_tag?: string`
- `unit_number` (VARCHAR(255)) → `unit_number: string`
- `layout_config` (JSONB) → `layout_config?: Record<string, any>`
- `unit_type` (VARCHAR(20)) → `unit_type: 'Facility' | 'Home'`
- `primary_resident_id` (UUID) → `primary_resident_id?: string`
- `is_public_space` (BOOLEAN, DEFAULT FALSE) → `is_public_space?: boolean`
- `is_multi_person_room` (BOOLEAN, DEFAULT FALSE) → `is_multi_person_room?: boolean`
- `timezone` (VARCHAR(50)) → `timezone?: string`
- `alarm_user_ids` (UUID[]) → `alarm_user_ids?: string[]`
- `alarm_tags` (VARCHAR[]) → `alarm_tags?: string[]`

### ⚠️ 问题
1. **`created_at` / `updated_at`**: 数据库中没有这些字段，但前端模型中有 `created_at?: string` 和 `updated_at?: string`
   - **建议**: 如果数据库确实没有这些字段，应该从前端模型中移除；或者数据库应该添加这些字段

## 2. Rooms 表 (06_rooms.sql) vs Room 模型 (unitModel.ts)

### ✅ 一致的字段
- `room_id` (UUID) → `room_id: string`
- `unit_id` (UUID) → `unit_id: string`
- `room_name` (VARCHAR(100)) → `room_name: string`
- `layout_config` (JSONB) → 前端模型中没有，但数据库有

### ❌ 不一致的字段
1. **`is_default`**: 
   - **数据库**: 没有此字段，通过 `room_name == unit_name` 判断是否为默认房间
   - **前端模型**: `is_default: boolean`
   - **问题**: 前端模型包含了一个数据库中不存在的字段
   - **建议**: 
     - 方案1: 移除前端模型的 `is_default` 字段，改为计算属性 `isDefault = room_name === unit_name`
     - 方案2: 后端 API 在返回 Room 数据时，自动计算并添加 `is_default` 字段

2. **`layout_config`**:
   - **数据库**: 有 `layout_config JSONB`
   - **前端模型**: 没有此字段
   - **建议**: 如果前端需要房间级布局配置，应该添加到 Room 模型中

3. **`tenant_id`**:
   - **数据库**: 有 `tenant_id UUID NOT NULL`
   - **前端模型**: 没有此字段
   - **建议**: 如果需要，可以添加到模型中

4. **`created_at` / `updated_at`**: 同 Units 表的问题

## 3. Beds 表 (07_beds.sql) vs Bed 模型 (unitModel.ts)

### ✅ 一致的字段
- `bed_id` (UUID) → `bed_id: string`
- `room_id` (UUID) → `room_id: string`
- `bed_name` (VARCHAR(50)) → `bed_name: string`
- `bed_type` (VARCHAR(20)) → `bed_type?: 'ActiveBed' | 'NonActiveBed'`
- `mattress_material` (VARCHAR(50)) → `mattress_material?: string`
- `mattress_thickness` (VARCHAR(20)) → `mattress_thickness?: string`
- `resident_id` (UUID) → `resident_id?: string`
- `bound_device_count` (INTEGER, DEFAULT 0) → `bound_device_count?: number`

### ⚠️ 问题
1. **`tenant_id`**: 数据库有，前端模型没有（如果需要可以添加）
2. **`created_at` / `updated_at`**: 同 Units 表的问题

## 4. Devices 表 (12_devices.sql) vs Device 模型 (deviceModel.ts)

### ✅ 一致的字段
- `device_id` (UUID) → `device_id: string`
- `tenant_id` (UUID) → `tenant_id: string`
- `device_name` (VARCHAR(100)) → `device_name: string`
- `serial_number` (VARCHAR(100)) → `serial_number?: string`
- `uid` (VARCHAR(50)) → `uid?: string`
- `status` (VARCHAR(20)) → `status: 'online' | 'offline' | 'error' | 'disabled'`
- `business_access` (VARCHAR(20)) → `business_access: 'pending' | 'approved' | 'rejected'`
- `monitoring_enabled` (BOOLEAN) → `monitoring_enabled?: boolean`

### ❌ 不一致的字段

1. **`device_store_id`**:
   - **数据库**: `device_store_id UUID REFERENCES device_store(device_store_id)`
   - **前端模型**: 没有此字段
   - **问题**: 设备需要通过 `device_store_id` 关联 `device_store` 表获取物理属性
   - **建议**: 添加到 Device 模型中

2. **`bound_room_id` / `bound_bed_id` / `unit_id`**:
   - **数据库**: 
     - `bound_room_id UUID REFERENCES rooms(room_id)`
     - `bound_bed_id UUID REFERENCES beds(bed_id)`
     - `unit_id UUID REFERENCES units(unit_id)`
   - **前端模型**: 注释说这些字段在 Location 模块处理，但实际代码中使用了这些字段（在 `useDevice.ts` 中）
   - **问题**: 模型定义与实际使用不一致
   - **建议**: 取消注释，将这些字段添加到 Device 模型中

3. **`device_type` / `device_model` / `imei` / `comm_mode` / `firmware_version` / `mcu_model`**:
   - **数据库**: 这些字段在 `device_store` 表中，通过 `device_store_id` JOIN 获取
   - **前端模型**: 定义为 `read-only, read from device`
   - **问题**: 模型注释不准确，应该说明这些字段来自 `device_store` 表
   - **建议**: 更新注释，说明这些字段通过 `device_store_id` JOIN `device_store` 获取

4. **`metadata`**:
   - **数据库**: `metadata JSONB`
   - **前端模型**: 注释说在 alarm/IoT alarm monitor 模块处理
   - **建议**: 如果需要，可以添加到模型中

5. **`device_code`**:
   - **前端模型**: `device_code?: string`
   - **数据库**: 没有此字段
   - **问题**: 前端模型有但数据库没有
   - **建议**: 确认是否需要此字段，如果不需要则移除

## 5. Store 数据一致性检查

### Tags Store (tags.ts)
- **存储**: `TagCatalogItem[]` (来自 `tagsModel.ts`)
- **数据库表**: `tags_catalog`
- **一致性**: ✅ 基本一致，通过 API 获取

### User Store (user.ts)
- **存储**: `UserInfo` 接口
- **数据库表**: `users`, `tenants`
- **字段检查**:
  - `userId` → 对应 `users.user_id`
  - `user_account` → 对应 `users.user_account`
  - `userType` → 对应 `users.user_type`
  - `role` → 对应 `users.role`
  - `tenant_id` → 对应 `tenants.tenant_id`
  - `tenant_name` → 对应 `tenants.tenant_name`
  - `locationTag` → 对应 `units.location_tag` 或 `locations.location_tag`
  - `locationName` → 对应 `units.unit_name` 或 `locations.location_name`
- **一致性**: ✅ 基本一致

## 6. 实际代码使用情况

### UnitList.vue 中使用的字段
- ✅ 使用了 `bound_room_id`, `bound_bed_id`, `unit_id` (在 `useDevice.ts` 中)
- ✅ 使用了 `device.bound_room_id`, `device.bound_bed_id` 来判断设备绑定状态
- ⚠️ 但 Device 模型中没有这些字段的定义

### useDevice.ts 中使用的字段
- ✅ `bound_room_id`, `bound_bed_id` 被广泛使用
- ✅ `unit_id` 被使用
- ❌ 但 Device 模型中没有这些字段

## 7. 修复状态

### ✅ 已修复 (2024-12-XX)
1. **Device 模型**: ✅ 已添加 `device_store_id`, `bound_room_id`, `bound_bed_id`, `unit_id`, `metadata` 字段
2. **Device 模型**: ✅ 已更新字段注释，说明 `device_type`, `device_model` 等字段来自 `device_store` 表
3. **Room 模型**: ✅ 已更新注释，说明 `is_default` 是计算字段（room_name === unit_name），由后端 API 返回
4. **Room 模型**: ✅ 已添加 `layout_config` 字段
5. **Room 模型**: ✅ 已添加 `tenant_id` 字段（可选）
6. **Bed 模型**: ✅ 已添加 `tenant_id` 字段（可选）
7. **Unit/Bed/Room 模型**: ✅ 已更新注释，说明 `created_at` / `updated_at` 不在数据库 schema 中

### ⚠️ 待确认
1. **Device 模型**: `device_code` 字段 - 前端模型中有但数据库中没有，需要确认是否保留
   - 当前状态: 已标记为可选字段，保留但添加注释说明可能不存在于数据库

## 8. 总结

### 一致性状态
- ✅ **Units 表**: 与前端模型一致
- ✅ **Rooms 表**: 与前端模型一致（`is_default` 为计算字段）
- ✅ **Beds 表**: 与前端模型一致
- ✅ **Devices 表**: 与前端模型一致（已添加缺失字段）
- ✅ **Store 数据**: 与数据库 schema 一致

### 注意事项
1. **计算字段**: `Room.is_default` 是计算字段，不在数据库中存储，由后端 API 计算返回
2. **时间戳字段**: `created_at` / `updated_at` 不在数据库 schema 中，如果后端需要，应该添加这些字段
3. **设备物理属性**: `device_type`, `device_model` 等字段来自 `device_store` 表，通过 `device_store_id` JOIN 获取

