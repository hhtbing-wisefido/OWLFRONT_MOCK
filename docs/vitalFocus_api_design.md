# Vital Focus API 设计

> **设计原则**：简单、直接、高效、符合 RESTful 规范

## 1. 概述

### 1.1 核心概念

- **卡片是全局的**：基于数据关系（设备、位置、住户）自动生成，存储在 PostgreSQL
- **权限控制**：用户根据权限（tenant_id, role, caregiver_id）看到不同的卡片
- **用户偏好**：用户可以通过 Focus 功能选择关注的卡片，存储在 `users.preferences.vitalFocus.selectedCardIds`
- **缓存优先**：后端从 Redis 缓存读取，响应速度快（< 50ms）
- **数据已融合**：后端已经融合多个设备的数据（Sleepace + Radar），API 返回的是融合后的最终值

### 1.2 数据说明

**VitalFocus API 只返回融合后的最终值**，不返回各设备的原始数据。

- **VitalFocus API**：返回融合后的数据，用于卡片显示
- **vue_radar 组件**：如果需要原始设备数据（如轨迹数据），单独订阅 MQTT 或调用专门的设备数据 API
- **详情页**：如果需要各设备的原始数据，调用专门的设备数据 API（如 `GET /devices/:deviceId/data`）

**融合规则**（后端处理，前端不关心）：
- HR/RR：优先使用 Sleepace，如果 Sleepace 无数据则使用 Radar
- 睡眠状态：优先使用 Sleepace，如果 Sleepace 无数据则使用 Radar
- 床状态：优先使用 Sleepace，离床时使用 Radar（更准确）
- 姿态数据：来自所有 Radar 设备，合并所有 tracking_id 的姿态
- **报警显示信息**：后端根据报警级别计算颜色和显示信息（`icon_alarm_color`、`alarm_color`），前端直接使用

### 1.3 API 架构

```
前端 (OwlFront)
    ↓ HTTP GET (JWT Token)
API Gateway (/data/api/v1/data/vital-focus/*)
    ↓ 解析用户权限
    ↓ 权限过滤卡片ID
    ↓ 批量读取 Redis 缓存
Redis: vital-focus:card:{card_id}:full
    ↓ 返回 JSON
前端接收卡片数据
```

---

## 2. API 端点

### 2.1 获取订阅的卡片及数据（主要接口）

**端点**：`GET /data/api/v1/data/vital-focus/cards`

**请求**：
```http
GET /data/api/v1/data/vital-focus/cards?filter=unhand
Authorization: Bearer <JWT_TOKEN>
```

**查询参数**（可选）：
| 参数 | 类型 | 说明 |
|------|------|------|
| `filter` | string | 过滤类型：'unhand' \| 'outofroom' \| 'leftbed' \| 'visitor' \| 'awake' \| 'sleep' |

**过滤类型说明**：
- `unhand`: 有未处理0-1级警报（`unhandled_alarm_0 > 0` 或 `unhandled_alarm_1 > 0`）
- `outofroom`: 离房（Location卡片且`person_count = 0`）
- `leftbed`: 离床（`bed_status = 1`）
- `visitor`: 有访客（根据实际数据结构判断）
- `awake`: 床上未睡（`bed_status = 0` 且 `sleep_stage = 1`）
- `sleep`: 入睡（`bed_status = 0` 且 `sleep_stage = 2` 或 `4`）

**后端处理逻辑**：
1. 从 JWT Token 解析用户信息（userID, tenant_id, role, caregiver_id）
2. 根据权限自动过滤可见卡片ID列表
3. **确定计算范围**：
   - 从 `users.preferences.vitalFocus.selectedCardIds` 读取订阅的卡片（`preferences` 是 JSONB 字段，`vitalFocus.selectedCardIds` 只是其中一项）
   - **特殊值处理**：
     - `["*"]`：表示所有有权限的卡片（等同于默认行为）
     - `[]`：表示不显示任何卡片（返回空列表）
     - 具体卡片 ID 列表：只显示指定的卡片（已验证权限）
     - `NULL` 或字段不存在：使用默认值（显示所有有权限的卡片）
4. 使用 Redis `MGET` 批量读取卡片完整数据
5. **计算统计数量**：基于步骤 3 确定的卡片范围，计算各过滤类型的统计数量（`filter_counts`）
6. **计算显示信息**：
   - 为每张卡片计算 `icon_alarm_color` 和 `alarm_color`（后端根据报警级别计算，前端直接使用）
   - **为 ActiveBed 卡片格式化时间信息**（考虑 location 时区）：
     - `bed_status_timestamp`：床状态变化事件的当地时间，格式化为 "hh:mm:ss"（如 "05:52:30"）
     - `status_duration`：从床状态变化事件发生到当前时间的持续时间，格式化为 "HH:MM"（如 "01:10" 表示 1小时10分钟，或 "00:45" 表示 45分钟）
7. 如果提供了 `filter` 参数，根据过滤类型过滤数据（从步骤 3 确定的卡片范围中过滤）
8. 返回过滤后的卡片列表和统计数量

**重要**：`filter_counts` 和 `items` 使用相同的计算范围（要么都是 preference 里的卡片，要么都是所有有权限的卡片），保证逻辑一致性。

**响应**：
```json
{
  "code": 2000,
  "message": "success",
  "result": {
    "items": [
      {
        "card_id": "100e8400-e29b-41d4-a716-446655440001",
        "tenant_id": "tenant-001",
        "card_type": "ActiveBed",
        "card_name": "Smith",
        "card_address": "A - E203 - BedA",
        "heart": 72,
        "breath": 20,
        "heart_source": "r",
        "breath_source": "s",
        "sleep_stage": 1,
        "bed_status": 0,
        "person_count": 3,
        "postures": [4, 4, 3],
        "alarms": [
          {
            "event_id": "event-001",
            "event_type": "Fall",
            "category": "safety",
            "alarm_level": "1",
            "alarm_status": "active",
            "alarm_color": "#d32f2f",
            "triggered_at": 1704067200000,
            "triggered_by": "Radar-002"
          }
        ],  // 只包含一个最新的报警（用于弹出显示），按 triggered_at 降序排序后的第一个
        "total_unhandled_alarms": 1,
        "icon_alarm_color": "#d32f2f",
        "icon_alarm_level": 1,
        "pop_alarm_emerge": 1,
        "residents": [...],
        "devices": [...],
        "bed_status_timestamp": "05:52:30",     // 床状态变化事件的当地时间（已格式化，考虑 location 时区）
        "status_duration": "01:10"               // 从床状态变化事件发生到当前时间的持续时间（已格式化，表示 1小时10分钟）
      },
      {
        "card_id": "100e8400-e29b-41d4-a716-446655440002",
        "tenant_id": "tenant-001",
        "card_type": "Location",
        "card_name": "Bathroom",
        "card_address": "A - E203 - Bathroom",
        "person_count": 0,
        "postures": [],
        "alarms": [],
        "total_unhandled_alarms": 0,
        "icon_alarm_color": null,
        "icon_alarm_level": null,
        "pop_alarm_emerge": 0,
        "residents": [...],
        "devices": [...]
        // Location 卡片无 bed_status_timestamp 和 status_duration 字段
      }
    ],
    "filter_counts": {
      "unhand": 5,
      "outofroom": 2,
      "leftbed": 3,
      "visitor": 1,
      "awake": 4,
      "sleep": 8
    },
    "timestamp": 1704067200000
  }
}
```

**说明**：
- `items`: 过滤后的卡片列表
  - **计算范围**：如果有 preference 则基于 preference 里的卡片，否则基于所有有权限的卡片
  - **过滤**：如果提供了 `filter` 参数，只返回符合条件的数据；否则返回所有卡片
- `filter_counts`: 各过滤类型的统计数量（用于前端显示 badge）
  - **计算范围**：与 `items` 相同（如果有 preference 则基于 preference 里的卡片，否则基于所有有权限的卡片）
  - **不受 `filter` 参数影响**：无论是否提供 `filter` 参数，统计数量都基于相同的计算范围
- **后端直接返回显示信息**（前端无需计算）：
  - `icon_alarm_color`: 图标报警颜色（后端根据报警级别和 `icon_alarm_level` 阈值计算，前端直接使用）
  - `icon_alarm_level`: 图标报警级别（后端计算，前端直接使用）
  - `alarms`: 报警数组，只包含一个最新的报警（用于弹出显示），包含 `alarm_color` 等显示信息（后端计算，前端直接使用）

---

### 2.2 获取可见的卡片列表（用于 Focus 调整）

**端点**：`GET /data/api/v1/data/vital-focus/cards/list`

**请求**：
```http
GET /data/api/v1/data/vital-focus/cards/list
Authorization: Bearer <JWT_TOKEN>
```

**后端处理逻辑**：
1. 从 JWT Token 解析用户信息
2. 根据权限自动过滤可见卡片ID列表
3. 从 PostgreSQL 读取卡片基础信息（不读取实时数据）
4. 返回所有可见的卡片列表

**响应**：
```json
{
  "code": 2000,
  "message": "success",
  "result": {
    "items": [
      {
        "card_id": "100e8400-e29b-41d4-a716-446655440001",
        "card_type": "ActiveBed",
        "card_name": "Smith",
        "card_address": "A - E203 - BedA",
        "location_id": "location-001",
        "room_id": "room-001"
      }
    ]
  }
}
```

---

### 2.3 更新用户 Focus 选择

**端点**：`PUT /user/api/v1/user/preferences`

**请求**：
```http
PUT /user/api/v1/user/preferences
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**请求体**：
```json
{
  "vitalFocus": {
    "selectedCardIds": [
      "100e8400-e29b-41d4-a716-446655440001",
      "100e8400-e29b-41d4-a716-446655440002"
    ]
  }
}
```

**处理逻辑**：
1. 从 JWT Token 解析用户ID
2. 验证 selectedCardIds 中的卡片是否都在用户权限可见范围内（如果包含 `["*"]`，则跳过验证）
3. 更新 `users.preferences` JSONB 字段（只更新 `vitalFocus` 部分，不会覆盖其他偏好设置）
4. 返回更新后的 preferences

**说明**：
- `preferences` 是 JSONB 字段，可以存储多个用户偏好设置
- `vitalFocus.selectedCardIds` 只是 `preferences` 中的一项
- 此 API 会合并更新 `preferences.vitalFocus`，不会覆盖其他偏好设置（如 `otherPreferences`）
- 特殊值：
  - `["*"]`：表示所有有权限的卡片
  - `[]`：表示不显示任何卡片
  - 具体卡片 ID 列表：只显示指定的卡片

---

### 2.4 获取单个卡片详情

**端点**：`GET /data/api/v1/data/vital-focus/cards/:cardId`

**请求**：
```http
GET /data/api/v1/data/vital-focus/cards/100e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <JWT_TOKEN>
```

**说明**：
- 返回的数据与 `GET /cards` 相同，都是融合后的数据
- 如果需要各设备的原始数据（如轨迹数据），详情页应调用专门的设备数据 API 或订阅 MQTT

---

## 3. 权限控制

### 3.1 权限层级

1. **租户隔离**（tenant_id）：用户只能看到自己租户的卡片
2. **角色权限**（role）：
   - `admin` / `staff`：租户下所有卡片
   - `caregiver`：只返回分配的住户卡片
3. **护理员分配**（caregiver_id）：如果 `role === 'caregiver'`，只返回 `caregiver_residents` 表中分配的住户卡片

### 3.2 Focus 功能

**用户偏好存储**：
```sql
-- users 表结构
CREATE TABLE users (
  ...
  preferences JSONB DEFAULT '{}'::jsonb  -- 用户偏好设置（JSONB）：存储用户的 UI 偏好和个性化设置
);

-- preferences 格式示例
{
  "vitalFocus": {
    "selectedCardIds": ["card-id-1", "card-id-2", "card-id-3"]
    // 或 ["*"] 表示所有有权限的卡片
  },
  "otherPreferences": {
    // 其他用户偏好
  }
}
```

**`vitalFocus.selectedCardIds` 特殊值说明**：
- `["*"]`：表示所有有权限的卡片（等同于默认行为）
- `[]`：表示不显示任何卡片（返回空列表）
- 具体卡片 ID 列表：只显示指定的卡片（已验证权限）
- `NULL` 或字段不存在：使用默认值（显示所有有权限的卡片）

**处理逻辑**：
- `GET /cards`：读取 `users.preferences.vitalFocus.selectedCardIds`，根据特殊值处理逻辑确定计算范围
- `GET /cards/list`：忽略 Focus 过滤，返回所有权限可见的卡片列表（仅基础信息）

**注意**：
- `preferences` 是 JSONB 字段，可以存储多个用户偏好设置
- `vitalFocus.selectedCardIds` 只是 `preferences` 中的一项
- 由前端通过 API 更新，后端只负责存储和读取

---

## 4. 数据格式

### 4.1 接口定义

```typescript
interface VitalFocusCard {
  // 基础信息
  card_id: string
  tenant_id: string
  card_type: 'ActiveBed' | 'Location'
  bed_id?: string
  location_id: string
  card_name: string
  card_address: string
  primary_resident_id?: string
  
  // 实时数据（融合后的最终值）
  heart?: number                     // 心率 (bpm)
  breath?: number                    // 呼吸频率 (次/分钟)
  heart_source?: 's' | 'r' | '-'    // 数据源：'s'=sleepace, 'r'=radar, '-'=无数据
  breath_source?: 's' | 'r' | '-'
  
  // 睡眠状态
  sleep_stage?: number               // 1=awake, 2=light sleep, 4=deep sleep
  sleep_state_snomed_code?: string
  sleep_state_display?: string
  
  // 床状态
  bed_status?: number                // 0=in bed, 1=out of bed
  
  // 人员数量和姿态（Location 卡片）
  person_count?: number              // 所有 Radar 设备的 tracking_id 总和，不跨设备去重
  postures?: number[]                // 姿态数组（0-11），每个元素对应一个人员的姿态
  
  // 时间信息（用于 ActiveBed 卡片显示，后端已格式化，考虑 location 时区）
  // 说明：当 bed_status 发生变化时（上床/离床事件），记录事件发生的时间
  bed_status_timestamp?: string       // 床状态变化事件的当地时间（已格式化，考虑 location 时区）：如 "05:52:30"（hh:mm:ss 格式）
  status_duration?: string             // 从床状态变化事件发生到当前时间的持续时间（已格式化）：如 "01:10"（HH:MM 格式，表示 1小时10分钟）或 "00:45"（表示 45分钟）
  
  // 报警数据（后端计算显示信息，前端直接使用）
  total_unhandled_alarms?: number
  icon_alarm_color?: string | null   // 图标报警颜色（后端根据报警级别计算，前端直接使用）
  icon_alarm_level?: number | null   // 图标报警级别（后端计算，前端直接使用）
  pop_alarm_emerge?: number          // 弹出报警级别阈值（默认 0/EMERG）
  alarms?: Alarm[]                   // 报警数组，只包含一个最新的报警（用于弹出显示），按 triggered_at 降序排序后的第一个，包含颜色等显示信息
  
  // 设备信息
  devices?: CardDevice[]
  device_count?: number
  r_connection?: number              // Radar 连接状态：0=offline, 1=online
  s_connection?: number              // Sleepace 连接状态：0=offline, 1=online
  
  // 住户信息
  residents?: CardResident[]
  resident_count?: number
}

interface CardListItem {
  card_id: string
  card_type: 'ActiveBed' | 'Location'
  card_name: string
  card_address: string
  location_id: string
  room_id?: string
}

interface Alarm {
  event_id: string
  event_type: string
  category: 'safety' | 'clinical' | 'behavioral' | 'device'
  alarm_level: string                // '0'/'EMERG', '1'/'ALERT', '2'/'CRIT', '3'/'ERR', '4'/'WARNING'
  alarm_status: 'active' | 'acknowledged'
  alarm_color?: string               // 报警颜色（后端根据 alarm_level 计算，前端直接使用）
  triggered_at: number               // 触发时间（毫秒），用于排序，最新的报警排在第一位
  triggered_by?: string
  trigger_data?: Record<string, any>
}

// 注意：alarms 数组只包含一个最新的报警（用于弹出显示）
// 后端根据 pop_alarm_emerge 阈值过滤，按 triggered_at 降序排序，只返回第一个符合条件的报警

interface CardDevice {
  device_id: string
  device_name: string
  device_type: number                // 1=sleepace, 2=radar
  device_model?: string
  binding_type: 'direct' | 'indirect'  // 'direct'=绑床, 'indirect'=绑位置
}

interface CardResident {
  resident_id: string
  last_name?: string
  first_name?: string
  nickname?: string
  service_level?: string
  service_level_info?: ServiceLevelInfo
}

interface ServiceLevelInfo {
  level_code: string
  display_name: string
  color_tag?: string
  color_hex?: string
  priority?: number
}

// 响应模型
interface GetVitalFocusCardsResult {
  items: VitalFocusCard[]
  filter_counts: {
    unhand: number
    outofroom: number
    leftbed: number
    visitor: number
    awake: number
    sleep: number
  }
}
```

---

## 5. 前端调用示例

```typescript
import { getVitalFocusCardsApi } from '@/api/monitor/monitor'
import { getVitalFocusCardsListApi } from '@/api/monitor/monitor'
import { updateUserPreferencesApi } from '@/api/user/user'

// 获取订阅的卡片及数据
const response = await getVitalFocusCardsApi()
updateCards(response.items)
updateFilterBadges(response.filter_counts)

// 应用过滤条件
const filtered = await getVitalFocusCardsApi({ filter: 'unhand' })

// 获取可见的卡片列表（Focus 调整）
const allCards = await getVitalFocusCardsListApi()

// 更新用户 Focus 选择
await updateUserPreferencesApi({
  vitalFocus: {
    selectedCardIds: ['card-id-1', 'card-id-2', 'card-id-3']
  }
})
```

---

## 6. 后端实现要点

### 6.1 处理流程

**`GET /cards`**：
1. 从 JWT Token 解析用户信息
2. 根据权限自动过滤可见卡片ID列表
3. 读取用户 Focus 选择（preferences）
4. 使用 Redis `MGET` 批量读取卡片完整数据
5. 计算各过滤类型的统计数量（`filter_counts`）
6. 应用过滤条件（如果提供了 `filter` 参数）
7. 返回结果

**`GET /cards/list`**：
1. 从 JWT Token 解析用户信息
2. 根据权限自动过滤可见卡片ID列表
3. 从 PostgreSQL 读取卡片基础信息
4. 返回结果

### 6.2 性能优化

- **Redis 缓存**：完整卡片缓存 TTL 10 秒
- **批量查询**：使用 `MGET` 批量读取多个卡片
- **索引优化**：确保数据库查询字段有索引
- **权限缓存**：可以缓存用户的可见卡片ID列表（TTL 5 分钟）

---

## 7. 错误处理

| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| 2000 | 200 | 成功 |
| 4001 | 400 | 请求参数错误 |
| 4010 | 401 | 未授权（Token 无效或过期） |
| 4030 | 403 | 无权限访问该资源 |
| 4040 | 404 | 资源不存在 |
| 5000 | 500 | 服务器内部错误 |

---

## 8. 总结

### 8.1 API 端点

| 端点 | 用途 | 返回数据 |
|------|------|---------|
| `GET /cards` | 获取订阅的卡片及数据 | 完整卡片数据（基础信息 + 融合后的实时数据 + 报警）+ 过滤统计数量 |
| `GET /cards/list` | 获取可见的卡片列表 | 仅基础信息（用于 Focus 调整） |
| `GET /cards/:cardId` | 获取单个卡片详情 | 完整卡片数据（融合后的实时数据） |
| `PUT /user/preferences` | 更新用户 Focus 选择 | 更新后的 preferences |

### 8.2 设计特点

- ✅ **后端自动处理**：前端只需传递 userID（从 JWT Token 获取），后端自动处理所有逻辑
- ✅ **过滤由后端处理**：前端传递过滤条件，后端根据条件过滤数据并返回结果和统计数量
- ✅ **数据已融合**：API 只返回融合后的最终值，不返回各设备的原始数据
- ✅ **权限自动**：后端自动根据用户权限过滤
- ✅ **缓存优先**：响应速度快（< 50ms）
