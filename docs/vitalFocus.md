# Vital Focus 页面 UI 设计文档

> **API 设计文档**：详细的数据格式和 API 端点定义请参见 `docs/vitalFocus_api_design.md`

## 功能概述

Vital Focus 页面是监控系统的核心页面，用于实时显示所有卡片（ActiveBed 和 Location）的状态信息，包括生命体征、设备状态、报警信息等。

## 数据来源

卡片数据通过 API `GET /data/api/v1/data/vital-focus/cards` 获取，数据格式和字段定义详见 `docs/vitalFocus_api_design.md`。

**关键字段说明**（用于 UI 显示）：
- `heart`, `breath`: 心率/呼吸率数值（后端已融合计算）
- `heart_source`, `breath_source`: 数据来源标识（'s'=sleepace, 'r'=radar, '-'=无数据）
- `sleep_stage`: 睡眠阶段（1=awake, 2=light sleep, 4=deep sleep）
- `bed_status`: 床状态（0=在床，1=离床）
- `person_count`: 检测到的人数（Location 卡片）
- `postures[]`: 姿态数组（number[]），每个元素对应一个人员的姿态
- `icon_alarm_color`: 图标报警颜色（后端已计算，前端直接使用）
- `alarms[]`: 报警数组（后端已过滤和排序，只包含最新一个报警）
- `alarm_color`: 报警颜色（后端已计算，前端直接使用）

## 实时数据显示逻辑

### HR/RR 数据显示

**数据来源**：后端已融合计算，前端直接使用 `heart` 和 `breath` 字段。

**两种显示形态**：

1. **详细模式**（显示数字和单位）：
   - 显示 `heart` 和 `breath` 数值（大号字体 36px）
   - 显示数据来源标识（badge，字体 14px）：
     - `heart_source === 's'` → 显示 "s" badge
     - `heart_source === 'r'` → 显示 "r" badge
     - `heart_source === '-'` → 不显示 badge
   - 显示单位（bpm/rpm，字体 18px）
   - 图标较小（20px × 20px）
   - 垂直排列（`flex-direction: column`）
   - 点击可切换为简化模式
   - **宽度计算**（badge 字体 14px）：
     - 图标：20px
     - margin-right：10px
     - 数字：36px 字体
       - 2位数字（如 72）：约 43px
       - 3位数字（如 120）：约 65px
     - badge：14px 字体（不占额外宽度，绝对定位在数字右下角）
     - 单位：约 36px（" bpm" 或 " rpm"，18px 字体）
     - 一行总宽度：
       - 2位数字：20px + 10px + 43px + 36px = **109px**
       - 3位数字：20px + 10px + 65px + 36px = **131px**
     - 因为是垂直排列，宽度取最大值：**131px**（3位数字时）

2. **简化模式**（只显示图标）：
   - 只显示图标，不显示数字和单位
   - 图标大小：**50px × 50px**
   - 水平排列（`flex-direction: row`）
   - 根据数值范围显示不同颜色的图标（红色/黄色/绿色/灰色）
   - 点击可切换为详细模式
   - **宽度计算**：
     - 图标1：50px
     - margin-right：10px
     - 图标2：50px
     - 总宽度：50px + 10px + 50px = **110px**

**当前宽度总结**：
- **详细模式**：**131px**（3位数字时，包含单位，badge 字体 14px）
- **简化模式**：**110px**（图标 50px × 50px）
- **宽度差**：详细模式比简化模式宽 **21px**

**交互**：
- 点击 HR/RR 区域可在两种模式间切换
- 可以保存设置（"Save change" 按钮），持久化每个卡片的显示偏好

### 姿态数据显示

**位置**：Real-time Data 部分的右侧

**数据来源**：后端已合并所有雷达设备的 tracking_id，前端直接使用 `person_count` 和 `postures[]` 字段。

**显示规则**：
1. 只有当 `person_count > 0` 且 `postures` 数组不为空时显示
2. 遍历 `postures` 数组，为每个姿态值显示对应的图标
3. 姿态图标映射：
   - `1` (walk) → `walk.png`
   - `2` (suspected-fall) → `suspected-fall.png`
   - `3` (sitting) → `sitting.svg`
   - `4` (stand) → `stand.png`
   - `5` (fall) → `fall.png`
   - `6` (lying) → `lying.svg`
   - 其他值 → `unknown.png`

**布局**：
- **当前实现**：使用 2 个容器（外层容器使用 `justify-content: space-between`）：
  - **左侧容器**：包含睡眠状态图标和 HR/RR 数据（使用 `justify-content: center` 和 `flex-wrap: wrap`）
    - 睡眠状态图标：自适应宽度
      - `awake.gif`、`light_sleep.gif`、`deep_sleep.gif`：原始尺寸（无固定宽度）
      - `Analysing_sleep_state.png`：固定 72px × 72px
    - HR/RR 数据：自适应宽度
      - 详细模式：约 131px（3位数字时）
      - 简化模式：110px
  - **右侧容器**：姿态图标（垂直排列，`flex-direction: column`，每个图标 30px）

- **ActiveBed 卡片**：姿态图标垂直排列（`flex-direction: column`）
  - 位置：Real-time Data 部分的右侧容器
  - 每个图标 30px，垂直堆叠
  - 图标间距：4px（`.posture-img` 的 `margin-right: 4px`）
  - 容器宽度：约 30px（1列）

- **Location 卡片**：姿态图标水平排列（`flex-direction: row`，当 `person_count > 0` 时）
  - 位置：卡片中央区域（整个 Real-time Data 部分）
  - 布局：垂直居中，显示 "X Person" 文字和姿态图标
  - 姿态图标水平排列，每个图标 **50px × 50px**（比 ActiveBed 卡片的 30px 更大）
  - 图标间距：10px（`margin-right: 10px`）
  - **最多可显示列数计算**：
    - 内容区域宽度：240px
    - 每个图标：50px
    - 图标间距：10px
    - 1列：50px
    - 2列：50px + 10px + 50px = **110px**
    - 3列：50px + 10px + 50px + 10px + 50px = **170px**
    - 4列：50px + 10px + 50px + 10px + 50px + 10px + 50px = **230px**
    - 5列：50px + 10px + 50px + 10px + 50px + 10px + 50px + 10px + 50px = **290px**（超出）
    - **最多可显示 4 列**（230px < 240px）
  - **支持换行（flex-wrap: wrap）**：
    - 每行最多 4 列
    - **最多显示 2 行**（为下方的报警条留出空间）
    - 每行高度：50px
    - 2行总高度：50px × 2 + 10px（间距）= **110px**
    - 设置 `max-height: 110px` 和 `overflow: hidden` 限制显示
    - **总计**：最多可显示 **4 列 × 2 行 = 8 个图标**
  - **特点**：
    - 当图标数量少时（1-2个），水平排列更紧凑，适合 Location 卡片的布局
    - 图标尺寸较大（50px），更容易识别，适合 Location 卡片较少的图标数量

**宽度分布说明**：
- **卡片总宽度**：270px（`.itemFrom` 样式）
- **卡片内边距**：15px * 2 = 30px
- **实际内容区域宽度**：240px

**左右容器宽度比例**：
- **右侧容器**（姿态图标）：
  - 固定宽度：约 30px（每个姿态图标 30px，垂直排列）
  - 占据比例：约 **12.5%**（30px / 240px）

- **左侧容器**（睡眠状态 + HR/RR）：
  - 自适应宽度：占据剩余空间
  - **详细模式时**：约 210px（240px - 30px）
  - **简化模式时**：约 210px（240px - 30px）
  - 占据比例：约 **87.5%**

**左侧容器内部宽度分布**：
- **睡眠状态图标区域**：
  - `awake.gif`、`light_sleep.gif`、`deep_sleep.gif`：原始尺寸（无固定宽度，通常约 60-72px）
  - `Analysing_sleep_state.png`：固定 72px × 72px
  - margin-right：10px
- **HR/RR 区域**（详细模式）：
  - 图标：20px
  - margin-right：10px
  - 数字：36px 字体，2-3位数字约 43-65px
  - badge：14px 字体（不占额外宽度，绝对定位在数字右下角）
  - 单位：约 36px（" bpm" 或 " rpm"）
  - **总宽度**：约 **131px**（3位数字时）
- **HR/RR 区域**（简化模式）：
  - 图标1：50px
  - margin-right：10px
  - 图标2：50px
  - **总宽度**：**110px**

**宽度比例**：
- 左侧容器（睡眠状态 + HR/RR）：约 **210px**（自适应，占据剩余空间）
- 右侧容器（姿态图标）：**30px**（垂直，1列）
- 左侧:右侧 ≈ **7:1**（约 87.5% : 12.5%）

**注意**：
- 使用 `justify-content: space-between` 时，左侧容器占据大部分空间，右侧容器只占据内容所需宽度
- 左侧容器使用 `flex-wrap: wrap`，如果内容过多可能换行，影响布局
- 当前实现中，睡眠状态和 HR/RR 在同一个容器内，不是真正的 3 列布局

## 报警显示逻辑

### 1. 右上角图标（Icon Alarm）

**位置**：卡片头部右侧，与 Name 和 Address 同一行

**显示规则**：
- 直接使用后端返回的 `icon_alarm_color` 字段
- 如果 `icon_alarm_color` 为 `null`，使用默认灰色 `#a9a9a9`
- 点击图标可跳转到详情页

**前端实现**：
```typescript
const iconColor = card.icon_alarm_color || '#a9a9a9'
// 点击事件：@click.stop="goDetail(card)"
```

### 2. 下端弹出项（Pop Alarm）

**位置**：卡片底部，浮动显示

**显示规则**：
- 后端已过滤和排序，`alarms` 数组只包含最新一个报警（用于弹出显示）
- 显示格式：`{报警类型名称} Handle`
  - 例如："Offline Handle"、"Fall Handle"、"Heart Rate Fast Handle"
- 直接使用报警的 `alarm_color` 字段设置颜色：
  - 红色 (#d32f2f) → `red-floating-bar`
  - 橙色 (#f3783f) → `yellow-floating-bar`

**前端实现**：
```typescript
const popAlarm = card.alarms?.[0] // 后端已排序，取第一个
if (popAlarm && popAlarm.alarm_status === 'active') {
  const alarmTypeName = formatAlarmTypeToString(popAlarm.event_type)
  const alarmColor = popAlarm.alarm_color // 后端已计算
  // 显示："{alarmTypeName} Handle"
  // 样式：根据 alarmColor 应用 red-floating-bar 或 yellow-floating-bar
}
```

**报警类型名称映射**：
- `formatAlarmTypeToString()` 函数将 `event_type` 转换为可读名称：
  - `'OfflineAlarm'` → "Offline"
  - `'Fall'` → "Fall"
  - `'Radar_AbnormalHeartRate'` → "Heart Rate Fast" 或 "Heart Rate Slow"
  - `'Radar_AbnormalRespiratoryRate'` → "Breath Rate Fast" 或 "Breath Rate Slow"

### 3. 报警处理交互

**处理流程**：
1. 用户点击 "Handle" 按钮
2. 调用后端 API 处理报警
3. 前端刷新卡片数据，报警项自动消失

**UI 反馈**：
- 点击后显示加载状态
- 处理成功后刷新卡片列表
- 处理失败显示错误提示

## 报警级别和颜色

**报警级别**（后端返回，前端直接使用）：
- `0` (EMERG) / `1` (ALERT) → 红色 (#d32f2f)
- `2` (CRIT) / `3` (ERR) / `4` (WARNING) → 橙色 (#f3783f)

**颜色使用**：
- 图标颜色：直接使用 `icon_alarm_color`（后端已计算）
- 弹出条颜色：直接使用 `alarm_color`（后端已计算）

## 前端实现要点

### 1. 数据结构

详细的数据结构定义请参见 `docs/vitalFocus_api_design.md` 和 `src/api/monitor/model/monitorModel.ts`。

**关键字段**（用于 UI 显示）：
- `icon_alarm_color`: 图标颜色（后端已计算，直接使用）
- `alarms[]`: 报警数组（后端已过滤和排序，只包含最新一个）
- `alarm_color`: 报警颜色（后端已计算，直接使用）

### 2. 格式化报警类型名称

```typescript
function formatAlarmTypeToString(eventType: string): string {
  // 将 event_type 转换为可读名称
  // 例如：'OfflineAlarm' → "Offline"
  //      'Fall' → "Fall"
  //      'Radar_AbnormalHeartRate' → "Heart Rate Fast" 或 "Heart Rate Slow"
  // 等等...
}
```

## 页面布局

### 卡片布局

**卡片尺寸**：与 v1.0 保持一致，根据页面宽度动态换行

**卡片内容**：
- **头部**：Name、Address、Icon Alarm（右上角）
- **实时数据区域**：3 列布局（睡眠状态、HR/RR、姿态）
- **时间信息区域**（仅 ActiveBed 卡片）：
  - 第一行：显示上床/离床事件的时间
    - `bed_status === 1`（离床）：显示 "Left bed time" + 时间（如 "05:52:30"）
    - `bed_status === 0`（在床）：显示 "Went to Bed" + 时间（如 "05:52:30"）
    - 时间值：直接使用后端返回的 `bed_status_timestamp` 字段（已格式化，考虑 location 时区，hh:mm:ss 格式）
  - 分隔线：`border-bottom: 1px solid rgba(203, 203, 225, 0.5)`
  - 第二行：显示从事件发生到当前的持续时间
    - `bed_status === 1`（离床）：显示 "Out of bed" + 持续时间（如 "01:10"）
    - `bed_status === 0`（在床）：显示 "Awake" + 持续时间（如 "01:10"）
    - 其他：显示 "Analysing" + 持续时间
    - 持续时间值：直接使用后端返回的 `status_duration` 字段（已格式化，HH:MM 格式，如 "01:10" 表示 1小时10分钟）
- **底部**：Pop Alarm（浮动显示）

### Focus 功能

**按钮**：页面右上角 "Focus" 按钮

**功能**：
- 打开模态框，显示所有可见卡片列表
- 支持 "All" 和 "Invert" 操作
- 默认所有卡片选中
- 选择状态持久化到 `users.preferences.vitalFocus.selectedCardIds`

**过滤按钮**：
- `unhand`、`outofroom`、`leftbed`、`visitor`、`awake`、`sleep`
- 点击后提交过滤条件到后端，后端返回过滤后的卡片和统计数量

## 相关文档

- **API 设计**：`docs/vitalFocus_api_design.md` - API 端点、数据格式、权限控制
- **架构设计**：`docs/vitalFocus_architecture.md` - 数据流架构、服务设计
- **API 模型**：`src/api/monitor/model/monitorModel.ts` - TypeScript 类型定义
- **测试数据**：`test/vital-focus/data.ts` - 测试用例数据

