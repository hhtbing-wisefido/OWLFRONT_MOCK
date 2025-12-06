# Sleep Report 功能分析文档

## 概述

本文档分析 v1.0 wisefido-frontend 项目中的 Sleep Report（睡眠报告）功能，用于指导 v1.5 owlFront 项目的复用实现。

**结论：该功能可以完全复用，主要需要适配 API 接口和路由结构。**

---

## 功能结构

### 1. 组件结构

```
SleepReport/
├── reportComponent.vue          # 主报告组件（3499行，核心组件）
└── Chart/
    ├── scoreChart.vue           # 睡眠评分图表（ECharts）
    ├── heartMutateChart.vue     # 心率变化图表（ECharts）
    └── alarmBarChart.vue        # 报警统计柱状图（ECharts）
```

### 2. 视图页面

```
views/report/
├── daily-report-sleepace.vue    # 每日睡眠报告列表页（带日期范围选择）
└── report-detail.vue            # 睡眠报告详情页
```

---

## 核心功能

### 1. 每日睡眠报告列表页 (`daily-report-sleepace.vue`)

**功能：**
- 显示设备信息（设备名称、内部编码、地址、住户信息）
- 日期范围选择器（RangePicker）
- 使用 ECharts 显示多天睡眠状态时间轴图表
- 支持分页浏览（每页 8 条）
- 点击图表跳转到详情页

**关键特性：**
- 睡眠状态可视化：使用自定义 ECharts 图表显示不同睡眠状态（Awake, Light sleep, Deep sleep, Not in Bed, Not monitoring）
- 时间轴：X 轴为时间（小时:分钟），Y 轴为日期（月/日）
- 数据缩放：支持滑块和内部缩放
- 状态图例：显示不同睡眠状态的颜色标识

**API 调用：**
- `getDeviceRelationsApi(deviceId)` - 获取设备关联信息
- `getSleepaceReportsApi(deviceId, params)` - 获取睡眠报告列表
  - 参数：`startDate`, `endDate`, `page`, `size`

### 2. 睡眠报告详情页 (`report-detail.vue`)

**功能：**
- 显示单日详细睡眠报告
- 日期选择器（仅可选择有数据的日期）
- 调用 `reportComponent` 组件显示完整报告

**API 调用：**
- `getSleepaceReportsDatesApi(deviceId)` - 获取有数据的日期列表
- `getSleepaceReportDetailApi(deviceId, date)` - 获取指定日期的详细报告

### 3. 报告组件 (`reportComponent.vue`)

**功能模块：**

#### 3.1 睡眠分布图表
- **Daily Sleep Distribution**：使用 ECharts 显示睡眠状态时间线
- 显示心率（Resting Heart Rate）和呼吸率（Respiratory Rate）曲线
- 显示身体运动（Body Movement）标记
- 状态图例：Situp, Awake, Light Sleep, Deep Sleep, Not in Bed, Not Monitoring

#### 3.2 睡眠评分
- **睡眠评分图表**：使用 `scoreChart` 组件显示圆形评分（0-100）
- **评分描述**：根据分数显示评价（Excellent, Good, Fair, Poor）

#### 3.3 最长睡眠统计
- **睡眠时间信息**：
  - In Bed Time（上床时间）
  - Get Up Time（起床时间）
  - Onset Time（入睡时间）
  - Wake Up Time（醒来时间）
- **睡眠比例统计**：
  - Total Sleep Time（总睡眠时间）
  - Sleep Efficiency（睡眠效率）
  - Awake Duration（清醒时长）
  - Light Sleep Duration（浅睡时长）
  - Deep Sleep Duration（深睡时长）
  - REM Sleep Duration（REM 睡眠时长）
  - Off Bed Duration（离床时长）
  - 每个指标都有评分和扣分说明

#### 3.4 心率统计
- **心率变化图表**：使用 `heartMutateChart` 组件
- 显示平均心率、最低心率、最高心率
- 显示心率过高/过低时长和百分比

#### 3.5 呼吸率统计
- **呼吸率变化图表**
- 显示平均呼吸率、最低呼吸率、最高呼吸率
- 显示呼吸率过高/过低时长和百分比

#### 3.6 报警统计
- **报警柱状图**：使用 `alarmBarChart` 组件
- 统计各类报警次数：
  - Situp（坐起）
  - Left Bed（离床）
  - Go To Bed（上床）
  - Many Body Move（频繁身体运动）
  - No Body Move（无身体运动）
  - No Turn Over（无翻身）
  - Heart Slow（心率过慢）
  - Heart Fast（心率过快）
  - Breath Slow（呼吸过慢）
  - Breath Fast（呼吸过快）
  - Breath Stop（呼吸暂停）

#### 3.7 房颤风险评估
- **Suspected Risk Level Of Atrial Fibrillation**：基于 HRV 数据评估

---

## API 接口

### 1. 获取睡眠报告列表

```typescript
GET /sleepace/api/v1/sleepace/reports/:id

参数：
- startDate: number (时间戳，秒)
- endDate: number (时间戳，秒)
- page: number
- size: number

返回：
{
  items: Array<{
    date: number,
    startTime: number,
    timeStep: number,
    sleepState: string,  // JSON 字符串，如 "[1,2,1,1,1,...]"
  }>,
  pagination: {
    page: number,
    size: number,
    count: number,
  }
}
```

### 2. 获取睡眠报告详情

```typescript
GET /sleepace/api/v1/sleepace/reports/:id/detail

参数：
- date: number (日期数字，如 20240820)

返回：
{
  startTime: number,
  endTime: number,
  report: string,  // JSON 字符串，包含完整的报告数据
}
```

### 3. 获取有数据的日期列表

```typescript
GET /sleepace/api/v1/sleepace/reports/:id/dates

返回：
number[]  // 日期数组，如 [20240820, 20240821, ...]
```

### 4. 获取设备关联信息

```typescript
GET /device/api/v1/device/:id/relations

返回：
{
  deviceId: string,
  deviceName: string,
  deviceInternalCode: string,
  deviceType: number,
  addressId: string,
  addressName: string,
  addressType: number,
  residents: Array<{
    id: string,
    name: string,
    gender: string,
    birthday: string,
  }>
}
```

---

## 技术实现

### 1. 图表库

- **ECharts 5.x**：用于所有图表渲染
- **vue-echarts**：Vue 3 的 ECharts 封装

### 2. 图表类型

1. **自定义系列图表**（Custom Series）：
   - 用于显示睡眠状态时间轴
   - 使用 `renderItem` 自定义渲染矩形条

2. **折线图**（Line Chart）：
   - 心率变化曲线
   - 呼吸率变化曲线

3. **柱状图**（Bar Chart）：
   - 报警统计

4. **仪表盘图**（Gauge Chart）：
   - 睡眠评分圆形图

### 3. 数据格式

**睡眠状态数组**：
```javascript
// sleepState 是 JSON 字符串，解析后为数字数组
// 0: Not monitoring
// 1: Not in Bed
// 2: Awake
// 3: Light sleep
// 4: Deep sleep
// 6: Situp
```

**报告数据结构**：
```javascript
{
  analysis: {
    startTime: number,
    duration: number,
    wake: number,
    outOfBedDuration: number,
    remAllTime: number,
    avgHeartRate: number,
    avgBreathRate: number,
    sleepStateStr: string,  // JSON 字符串
    snArrayStr: string,     // JSON 字符串
    lightSleepDuration: number,
    deepSleepDuration: number,
    sleepArray: Array<{ startTime: number, duration: number }>,
    maxReport: {
      inBedTime: number,
      getupTime: number,
      onsetTime: number,
      wakeupTime: number,
      scale: number,        // 睡眠评分
      tsTime: number,
      sleepRate: number,
      asleepDur: number,
      seIndex: number,      // 睡眠效率
      awakeDur: number,
      awakePct: number,
      lightDur: number,
      lightPct: number,
      deepDur: number,
      deepPct: number,
      remDur: number,
      remPct: number,
      offBedDur: number,
      offBedPct: number,
      // ... 更多字段
    }
  },
  detail: {
    userId: number,
    startTime: number,
    breathRate: string,     // JSON 字符串数组
    heartRate: string,      // JSON 字符串数组
    status: string,         // JSON 字符串数组
    statusValue: string,    // JSON 字符串数组
    // ... 更多字段
  },
  summary: {
    userId: number,
    deviceId: string,
    startTime: number,
    timezone: number,
    timeStep: number,
    recordCount: number,
    // ... 更多字段
  }
}
```

---

## 复用方案

### 1. 文件迁移

**需要复制的文件：**
```
wisefido-frontend/wisefido-platform-vue/src/components/SleepReport/
  → owlFront/src/components/SleepReport/

wisefido-frontend/wisefido-platform-vue/src/views/report/
  → owlFront/src/views/report/
```

### 2. 依赖安装

```bash
# 需要安装的依赖
npm install echarts vue-echarts
```

### 3. API 适配

**创建 API 文件：**
```
owlFront/src/api/report/report.ts
owlFront/src/api/report/model/reportModel.ts
```

**API 路径适配：**
- v1.0: `/sleepace/api/v1/sleepace/reports/:id`
- v1.5: 需要根据后端 API 设计调整路径（可能为 `/api/v1/reports/sleepace/:deviceId`）

### 4. 路由配置

**添加路由：**
```typescript
{
  path: '/report/sleepace/:deviceId',
  name: 'SleepaceReport',
  component: () => import('@/views/report/daily-report-sleepace.vue'),
  meta: {
    title: 'Sleep Report',
    requiresAuth: true,
  },
},
{
  path: '/report/sleepace/:deviceId/detail/:date',
  name: 'SleepaceReportDetail',
  component: () => import('@/views/report/report-detail.vue'),
  meta: {
    title: 'Sleep Report Detail',
    requiresAuth: true,
  },
},
```

### 5. 工具函数适配

**需要检查的工具函数：**
- `formatDateToNumber` - 日期转数字
- `formatTimestampToDate` - 时间戳转日期
- `formatDateToHHmm` - 日期转时分
- `calculateAge` - 计算年龄
- `genderToString` - 性别转字符串
- `prefixInteger` - 数字补零

这些函数可能在 `@/utils/conversion.ts` 中，需要确认或创建。

### 6. 图表工具函数

**需要检查：**
- `@/utils/chart/drawChart` - 图表配置函数
  - `drawChart.scoreChart(data)` - 评分图表配置
  - `drawChart.heartMutateChart(data, maxY)` - 心率图表配置
  - `drawChart.alarmBarChart(data)` - 报警图表配置

如果不存在，需要从 v1.0 复制或重新实现。

### 7. 样式适配

**需要检查的样式：**
- 颜色主题是否一致
- 响应式布局是否需要调整
- Ant Design Vue 组件样式兼容性

### 8. 类型定义

**需要创建的类型：**
```typescript
// src/api/report/model/reportModel.ts
export interface SleepaceReport {
  date: number
  startTime: number
  timeStep: number
  sleepState: string
}

export interface SleepaceReportDetail {
  startTime: number
  endTime: number
  report: string  // JSON 字符串
}

export interface DeviceRelations {
  deviceId: string
  deviceName: string
  deviceInternalCode: string
  deviceType: number
  addressId: string
  addressName: string
  addressType: number
  residents: Array<{
    id: string
    name: string
    gender: string
    birthday: string
  }>
}
```

---

## 实施步骤

### 阶段 1：基础准备
1. ✅ 安装依赖（echarts, vue-echarts）
2. ✅ 创建 API 文件和类型定义
3. ✅ 创建工具函数文件（如果不存在）

### 阶段 2：组件迁移
1. ✅ 复制 SleepReport 组件目录
2. ✅ 复制 report 视图目录
3. ✅ 适配导入路径（`/@/` → `@/`）

### 阶段 3：API 集成
1. ✅ 实现 API 调用函数
2. ✅ 适配 API 路径（根据后端设计）
3. ✅ 处理数据格式转换

### 阶段 4：路由和导航
1. ✅ 添加路由配置
2. ✅ 添加菜单项（如果需要）
3. ✅ 添加从设备详情页到报告页的导航链接

### 阶段 5：测试和优化
1. ✅ 测试报告列表页功能
2. ✅ 测试报告详情页功能
3. ✅ 测试图表渲染和交互
4. ✅ 优化样式和响应式布局

---

## 注意事项

### 1. 数据格式兼容性
- 确保后端返回的数据格式与 v1.0 一致
- 特别注意 JSON 字符串字段的解析

### 2. 图表性能
- 大量数据时注意图表渲染性能
- 考虑数据分页或数据采样

### 3. 响应式设计
- 确保在不同屏幕尺寸下正常显示
- 图表需要支持 resize

### 4. 错误处理
- API 调用失败时的错误提示
- 数据为空时的友好提示

### 5. 国际化
- 如果项目需要多语言，需要提取文本到 i18n 文件

---

## 总结

Sleep Report 功能结构清晰，组件化程度高，**完全可以复用**。主要工作：

1. **文件迁移**：直接复制组件和视图文件
2. **路径适配**：修改导入路径和 API 路径
3. **依赖安装**：确保 ECharts 相关依赖已安装
4. **工具函数**：确保工具函数存在或创建
5. **测试验证**：确保功能正常运行

预计工作量：**2-3 天**（包括测试和优化）



