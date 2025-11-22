# Vital Focus 页面设计文档

## 功能概述

Vital Focus 页面是监控系统的核心页面，用于实时显示所有卡片（ActiveBed 和 Location）的状态信息，包括生命体征、设备状态、报警信息等。

## 数据来源

### 卡片数据

卡片数据来自 `cards` 表和 `v_cards_full` 视图，包含：

- **卡片基本信息**：
  - `card_id`: 卡片ID（UUID）
  - `card_type`: 卡片类型（'ActiveBed' 或 'Location'）
  - `card_name`: 卡片名称（ActiveBed 显示住户姓名，Location 显示门牌号）
  - `card_address`: 卡片地址（如 "A - E203 - BedA"）
  - `tenant_id`: 租户ID（UUID）

- **关联信息**：
  - `devices`: 绑定的设备列表（JSON 数组）
  - `residents`: 关联的住户列表（JSON 数组）
  - `device_count`: 设备数量
  - `resident_count`: 住户数量

- **未处理报警统计**（来自 `cards` 表）：
  - `unhandled_alarm_0`: EMERG(0) 未处理报警数量
  - `unhandled_alarm_1`: ALERT(1) 未处理报警数量
  - `unhandled_alarm_2`: CRIT(2) 未处理报警数量
  - `unhandled_alarm_3`: ERR(3) 未处理报警数量
  - `unhandled_alarm_4`: WARNING(4) 未处理报警数量
  - `total_unhandled_alarms`: 总未处理报警数量（自动计算）

- **报警显示控制**（来自 `cards` 表）：
  - `icon_alarm_level`: 图标报警级别阈值（默认 3/ERR）
  - `pop_alarm_emerge`: 弹出报警级别阈值（默认 0/EMERG）

- **具体报警项**（来自 `alarm_events` 表）：
  - `alarms`: 报警项数组，包含具体的报警信息
    - `event_id`: 事件ID（UUID）
    - `event_type`: 事件类型（如 'Fall', 'Radar_AbnormalHeartRate', 'OfflineAlarm' 等）
    - `alarm_level`: 报警级别（'0'/'EMERG', '1'/'ALERT', '2'/'CRIT', '3'/'ERR', '4'/'WARNING'）
    - `alarm_status`: 报警状态（'active', 'acknowledged'）
    - `triggered_at`: 触发时间

## 报警显示逻辑

### 1. 右上角图标（Icon Alarm）

**位置**：卡片头部右侧，与 Name 和 Address 同一行

**显示规则**：
1. 根据 `icon_alarm_level` 阈值过滤：只有 `alarm_level <= icon_alarm_level` 的未处理报警才会显示图标
2. 从符合条件的报警中，找出最高级别的报警（级别优先级：0 > 1 > 2 > 3 > 4）
3. 根据最高级别显示颜色：
   - **EMERG(0) 或 ALERT(1)**：红色 (#d32f2f)
   - **CRIT(2)、ERR(3)、WARNING(4)**：橙色 (#f3783f)
   - **无符合条件的报警**：灰色 (#a9a9a9)

**计算逻辑**：
```typescript
// 伪代码
const iconAlarmLevel = card.icon_alarm_level // 默认 3
const unhandledAlarms = {
  0: card.unhandled_alarm_0, // EMERG
  1: card.unhandled_alarm_1, // ALERT
  2: card.unhandled_alarm_2, // CRIT
  3: card.unhandled_alarm_3, // ERR
  4: card.unhandled_alarm_4, // WARNING
}

// 找出最高级别（考虑阈值）
let highestLevel = -1
for (let level = 0; level <= iconAlarmLevel; level++) {
  if (unhandledAlarms[level] > 0) {
    highestLevel = level
    break // 从高到低，找到第一个有报警的级别
  }
}

// 根据最高级别显示颜色
if (highestLevel === 0 || highestLevel === 1) {
  // 红色
} else if (highestLevel >= 2 && highestLevel <= 4) {
  // 橙色
} else {
  // 灰色
}
```

**示例**：
- 如果没有 EMERG，但有 2 个 CRIT 和 3 个 WARNING，且 `icon_alarm_level = 3`：
  - 符合条件的报警：CRIT(2) 和 ERR(3)（WARNING(4) 被阈值过滤）
  - 最高级别：CRIT(2)
  - 显示颜色：橙色

### 2. 下端弹出项（Pop Alarm）

**位置**：卡片底部，浮动显示

**显示规则**：
1. 根据 `pop_alarm_emerge` 阈值过滤：只有 `alarm_level <= pop_alarm_emerge` 的未处理报警才会弹出
2. 显示当前最新的一个报警（`alarms[0]`，按 `triggered_at` 降序排序）
3. 显示格式：`{报警类型名称} Handle`
   - 例如："Offline Handle"、"Fall Handle"、"Heart Rate Fast Handle"
4. 根据报警级别显示颜色：
   - **EMERG(0) 或 ALERT(1)**：红色条（`red-floating-bar`）
   - **CRIT(2)、ERR(3)、WARNING(4)**：橙色条（`yellow-floating-bar`）

**计算逻辑**：
```typescript
// 伪代码
const popAlarmEmerge = card.pop_alarm_emerge // 默认 0
const activeAlarms = card.alarms
  .filter(alarm => alarm.alarm_status === 'active')
  .filter(alarm => {
    const level = parseInt(alarm.alarm_level) || 
      (alarm.alarm_level === 'EMERG' ? 0 :
       alarm.alarm_level === 'ALERT' ? 1 :
       alarm.alarm_level === 'CRIT' ? 2 :
       alarm.alarm_level === 'ERR' ? 3 :
       alarm.alarm_level === 'WARNING' ? 4 : 999)
    return level <= popAlarmEmerge
  })
  .sort((a, b) => b.triggered_at - a.triggered_at) // 按时间降序

if (activeAlarms.length > 0) {
  const latestAlarm = activeAlarms[0]
  const alarmTypeName = formatAlarmTypeToString(latestAlarm.event_type)
  const alarmLevel = parseInt(latestAlarm.alarm_level) || ...
  
  // 显示："{alarmTypeName} Handle"
  // 颜色：alarmLevel <= 1 ? 红色 : 橙色
}
```

**报警类型名称映射**：
- `formatAlarmTypeToString()` 函数将 `event_type` 转换为可读名称：
  - `'OfflineAlarm'` → "Offline"
  - `'Fall'` → "Fall"
  - `'Radar_AbnormalHeartRate'` → "Heart Rate Fast" 或 "Heart Rate Slow"
  - `'Radar_AbnormalRespiratoryRate'` → "Breath Rate Fast" 或 "Breath Rate Slow"
  - 等等...

### 3. 报警处理逻辑

**处理流程**：
1. 用户点击 "Handle" 按钮
2. 调用后端 API 处理报警（更新 `alarm_events` 表的 `alarm_status` 和 `operation` 字段）
3. 后端更新 `cards` 表的 `unhandled_alarm_*` 字段（调用 `update_card_unhandled_alarms()` 函数）
4. 前端刷新卡片数据，报警项自动消失

**数据更新**：
- 当报警被处理时，`alarm_events.alarm_status` 从 `'active'` 变为 `'acknowledged'`
- 后端自动重新计算 `cards.unhandled_alarm_*` 字段
- 前端重新获取卡片数据，报警项不再显示

## 报警级别说明

根据 Syslog 标准（0-7），v1.5 主要使用以下级别：

| 级别 | 数字 | 名称 | 说明 | 图标颜色 | 弹出条颜色 |
|------|------|------|------|----------|------------|
| 0 | 0 | EMERG | 紧急，系统不可用 | 红色 | 红色 |
| 1 | 1 | ALERT | 警报，必须立即采取行动 | 红色 | 红色 |
| 2 | 2 | CRIT | 严重，严重情况 | 橙色 | 橙色 |
| 3 | 3 | ERR | 错误，错误条件 | 橙色 | 橙色 |
| 4 | 4 | WARNING | 警告，警告信息 | 橙色 | 橙色 |

**注意**：
- 级别数字越小，优先级越高（0 > 1 > 2 > 3 > 4）
- EMERG(0) 和 ALERT(1) 使用红色
- CRIT(2)、ERR(3)、WARNING(4) 使用橙色

## 阈值控制

### icon_alarm_level（图标报警级别阈值）

- **默认值**：3 (ERR)
- **作用**：控制哪些级别的报警会在卡片图标上显示报警标识
- **规则**：只有 `alarm_level <= icon_alarm_level` 的未处理报警才会在图标上显示
- **示例**：
  - `icon_alarm_level = 3`：CRIT(2) 和 ERR(3) 会显示，WARNING(4) 不会显示
  - `icon_alarm_level = 2`：只有 CRIT(2) 及以下会显示
  - `icon_alarm_level = 1`：只有 ALERT(1) 及以下会显示

### pop_alarm_emerge（弹出报警级别阈值）

- **默认值**：0 (EMERG)
- **作用**：控制哪些级别的报警会触发弹出通知
- **规则**：只有 `alarm_level <= pop_alarm_emerge` 的未处理报警才会弹出
- **示例**：
  - `pop_alarm_emerge = 0`：仅 EMERG(0) 级别的报警会弹出
  - `pop_alarm_emerge = 1`：EMERG(0) 和 ALERT(1) 会弹出
  - `pop_alarm_emerge = 2`：EMERG(0)、ALERT(1)、CRIT(2) 会弹出

## 前端实现要点

### 1. 数据结构

```typescript
interface VitalFocusCard {
  // ... 其他字段
  unhandled_alarm_0: number  // EMERG(0) 未处理报警数量
  unhandled_alarm_1: number  // ALERT(1) 未处理报警数量
  unhandled_alarm_2: number  // CRIT(2) 未处理报警数量
  unhandled_alarm_3: number  // ERR(3) 未处理报警数量
  unhandled_alarm_4: number  // WARNING(4) 未处理报警数量
  icon_alarm_level: number   // 图标报警级别阈值（默认 3）
  pop_alarm_emerge: number   // 弹出报警级别阈值（默认 0）
  alarms: Array<{
    event_id: string
    event_type: string
    alarm_level: string | number  // '0'/'EMERG', '1'/'ALERT', '2'/'CRIT', '3'/'ERR', '4'/'WARNING'
    alarm_status: 'active' | 'acknowledged'
    triggered_at: number  // timestamp
  }>
}
```

### 2. 计算最高报警级别

```typescript
function getHighestAlarmLevel(
  unhandledAlarms: { 0: number, 1: number, 2: number, 3: number, 4: number },
  threshold: number  // icon_alarm_level 或 pop_alarm_emerge
): number {
  // 从高到低查找第一个有报警的级别（在阈值范围内）
  for (let level = 0; level <= threshold && level <= 4; level++) {
    if (unhandledAlarms[level] > 0) {
      return level
    }
  }
  return -1  // 无报警
}
```

### 3. 获取报警颜色

```typescript
function getAlarmColor(level: number): string {
  if (level === 0 || level === 1) {
    return '#d32f2f'  // 红色
  } else if (level >= 2 && level <= 4) {
    return '#f3783f'  // 橙色
  } else {
    return '#a9a9a9'  // 灰色
  }
}
```

### 4. 格式化报警类型名称

```typescript
function formatAlarmTypeToString(eventType: string): string {
  // 将 event_type 转换为可读名称
  // 例如：'OfflineAlarm' → "Offline"
  //      'Fall' → "Fall"
  //      'Radar_AbnormalHeartRate' → "Heart Rate Fast" 或 "Heart Rate Slow"
  // 等等...
}
```

## 与 v1.0 的区别

### v1.0
- 使用 `unhandledAlarmsCount` 和 `unhandledAlarmsLevel`（单一级别）
- 报警条显示数量："Alarm (2)" 或 "Alert (1)"

### v1.5
- 使用 5 个字段分别统计各级别数量（`unhandled_alarm_0` 到 `unhandled_alarm_4`）
- 支持阈值控制（`icon_alarm_level` 和 `pop_alarm_emerge`）
- 报警条显示报警类型名称："Offline Handle"、"Fall Handle" 等
- 更精细的级别控制（0-4 五个级别）

## 测试数据

测试数据位于 `test/vital-focus/data.ts`，包含：
- 5 个测试卡片（Card 1-5）
- 不同级别的报警场景
- 详细的报警项数据

## 相关文档

- 数据库表定义：`owlRD/db/18_cards.sql`
- 报警事件表：`owlRD/db/24_alarm_events.sql`
- API 模型：`src/api/monitor/model/monitorModel.ts`
- 测试数据：`test/vital-focus/data.ts`

