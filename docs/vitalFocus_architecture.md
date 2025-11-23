# Vital Focus 数据流架构设计

> **目标**：设计一个高性能、可扩展、易维护的数据流架构，支持多传感器融合和报警级别判断
> 
> **参考实现**：`wisefido-backend` (v1.0) 的实际架构

## 1. 架构对比

### 1.1 v1.0 架构图

```
IoT 设备 → 
    ├─ Radar: MQTT → wisefido-radar 服务 → Redis Hash
    ├─ Sleepace: MQTT → wisefido-sleepace 服务 → Redis Hash
    └─ Qinglan: (类似 Radar)
    
Redis 缓存 → wisefido-data 服务 (API 层) → 
    ├─ 从 Redis 读取设备状态
    ├─ 从 MySQL 读取基础信息（cards, residents, devices, alarms）
    ├─ 数据融合（多传感器合并）
    └─ 返回 VitalFocusCard 给前端
```

### 1.2 v1.5 架构图

```
IoT 设备 → MQTT Broker
    ├─ Radar → wisefido-radar 服务
    ├─ Sleepace → wisefido-sleepace 服务
    └─ 其他设备...

设备服务 → Redis Streams / MQTT
    ├─→ 数据转换服务 (Data Transformation Service)
    │   ├─ 数据标准化（SNOMED CT 映射）
    │   ├─ 数据验证和清洗
    │   └─→ PostgreSQL TimescaleDB (iot_timeseries 表)
    │
    ├─→ 传感器融合服务 (Sensor Fusion Service)
    │   ├─ 监听设备数据变化
    │   ├─ 多传感器数据融合（HR/RR、姿态）
    │   └─→ Redis 缓存 (vital-focus:card:{card_id}:realtime)
    │
    ├─→ 报警处理服务 (Alarm Processing Service)
    │   ├─ 监听融合后的数据
    │   ├─ 应用报警规则（从 cloud_alarm_policies 读取）
    │   ├─ 判断报警级别（DangerLevel）
    │   └─→ PostgreSQL alarm_events + Redis 缓存 (vital-focus:card:{card_id}:alarms)
    │
    └─→ VitalFocusCard 聚合服务 (Card Aggregation Service)
        ├─ 监听实时数据和报警数据变化
        ├─ 聚合所有数据（基础信息 + 实时数据 + 报警）
        └─→ Redis 缓存 (vital-focus:card:{card_id}:full)
            └─→ API Gateway (wisefido-data) → 前端
```

### 1.3 架构差异

| 维度 | v1.0 | v1.5 |
|------|------|------|
| **数据持久化** | ❌ 无 | ✅ PostgreSQL TimescaleDB |
| **数据融合时机** | API 层（每次请求） | 数据流层（实时融合） |
| **报警处理** | ⚠️ 不明确 | ✅ 独立服务 |
| **数据标准化** | ❌ 无 | ✅ SNOMED CT / FHIR |
| **缓存层级** | Redis Hash (设备级) | Redis (设备级 + 卡片级) |


## 2. v1.5 服务输入/输出

### 2.1 数据转换服务 (Data Transformation Service)

**输入**：
- 原始 IoT 数据（MQTT/Redis Streams）

**输出**：
- PostgreSQL `iot_timeseries` 表（标准化数据）
- Redis Streams 事件（触发下游服务）

**处理**：
- SNOMED CT 编码映射
- 数据验证和清洗
- FHIR Category 分类

---

### 2.2 传感器融合服务 (Sensor Fusion Service)

**输入**：
- PostgreSQL `iot_timeseries` 表（标准化数据）
- Redis Streams 事件

**输出**：
- Redis `vital-focus:card:{card_id}:realtime` (TTL: 5分钟)
  - `heart`, `breath`, `heart_source`, `breath_source`
  - `sleep_stage`, `bed_status`
  - `person_count`, `postures[]`
  - `timestamp`

**融合规则**：
- HR/RR：优先 Sleepace，无数据则 Radar
- 姿态：合并所有 Radar 的 `tracking_id`（不跨设备去重）

---

### 2.3 报警处理服务 (Alarm Processing Service)

**输入**：
- Redis `vital-focus:card:{card_id}:realtime`
- PostgreSQL `cloud_alarm_policies`, `iot_monitor_alarms`（报警规则）

**输出**：
- PostgreSQL `alarm_events` 表（报警记录）
- Redis `vital-focus:card:{card_id}:alarms` (TTL: 30秒)
  - `total_unhandled_alarms`
  - `icon_alarm_color`, `icon_alarm_level`
  - `alarms[]`（最新一个报警）
- 通知事件（可选）

**报警规则**：
- 从配置表读取阈值和级别
- 支持心率异常、呼吸暂停等规则

---

### 2.4 VitalFocusCard 聚合服务 (Card Aggregation Service)

**输入**：
- PostgreSQL `cards`, `devices`, `residents` 表（基础信息）
- Redis `vital-focus:card:{card_id}:realtime`（实时数据）
- Redis `vital-focus:card:{card_id}:alarms`（报警数据）

**输出**：
- Redis `vital-focus:card:{card_id}:full` (TTL: 10秒)
  - 完整的 `VitalFocusCard` JSON 对象

---

### 2.5 API 服务 (wisefido-data)

**输入**：
- HTTP 请求（JWT Token）
- Redis `vital-focus:card:{card_id}:full`

**输出**：
- HTTP 响应（VitalFocusCard[] + filter_counts）

**处理**：
- 权限过滤（tenant_id, role, caregiver_id）
- Focus 过滤（users.preferences.vitalFocus.selectedCardIds）
- 过滤统计（filter_counts）

---

## 3. 数据流时序

### 3.1 实时数据更新流程

```
1. IoT 设备发送数据 → MQTT Broker
2. MQTT Broker → Redis Streams (消息队列)
3. 数据转换服务消费消息：
   - 标准化数据
   - 写入 PostgreSQL TimescaleDB
   - 发布事件到 Redis Streams
4. 传感器融合服务消费事件：
   - 读取相关设备的最新数据
   - 执行融合逻辑
   - 更新 Redis 缓存 (vital-focus:card:{card_id}:realtime)
   - 发布事件到 Redis Streams
5. 报警处理服务消费事件：
   - 读取融合后的数据
   - 应用报警规则
   - 创建 alarm_events 记录
   - 更新 Redis 缓存 (vital-focus:card:{card_id}:alarms)
   - 触发通知
6. VitalFocusCard 聚合服务消费事件：
   - 聚合所有数据
   - 更新 Redis 缓存 (vital-focus:card:{card_id}:full)
```

### 3.2 API 请求流程

```
1. 前端请求 GET /data/api/v1/data/vital-focus/cards
2. API Gateway 接收请求
3. VitalFocusCard 聚合服务：
   - 检查 Redis 缓存 (vital-focus:card:{card_id}:full)
   - 如果缓存存在且未过期，直接返回
   - 如果缓存不存在或过期，执行聚合逻辑并更新缓存
4. 返回响应给前端
```

---

