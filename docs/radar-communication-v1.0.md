# Radar 与 Server 通讯方式分析（v1.0）

## 📋 概述

本文档分析 wisefido-frontend v1.0 和 wisefido-backend v1.0 中 radar 设备与服务器的通讯方式。

---

## 🏗️ 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                     雷达设备 (Radar Device)                    │
│  - 通过 TCP Socket 连接后端                                    │
│  - 使用 Protobuf 协议                                          │
└───────────────────────┬───────────────────────────────────────┘
                        │ TCP Socket (Protobuf)
                        │
┌───────────────────────▼───────────────────────────────────────┐
│          wisefido-radar 服务 (Go Backend)                     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  RadarServer (socket/server.go)                     │    │
│  │  - 监听 TCP 端口                                      │    │
│  │  - 管理设备连接                                        │    │
│  │  - 处理设备注册                                        │    │
│  │  - 接收实时数据                                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Data Channels                                        │    │
│  │  - trackingDataChan  (轨迹数据)                       │    │
│  │  - vitalSignsChan    (生命体征数据)                   │    │
│  │  - eventDataChan     (事件数据)                       │    │
│  │  - trackingStatsChan (统计数据)                       │    │
│  │  - sleepStatsChan    (睡眠数据)                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Consumer (modules/consumer.go)                      │    │
│  │  - 消费 channel 数据                                  │    │
│  │  - 存储到数据库                                        │    │
│  │  - 或通过其他方式提供给前端                            │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────┬───────────────────────────────────────┘
                        │ HTTP API
                        │
┌───────────────────────▼───────────────────────────────────────┐
│          wisefido-frontend (Vue Frontend)                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  HTTP 轮询 (每 1 秒)                                  │    │
│  │  - getRadarDeviceRealtimeDataApi()                   │    │
│  │  - 获取实时轨迹和生命体征数据                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  RadarDataStore (store/radar/radarData.ts)          │    │
│  │  - 管理实时数据                                        │    │
│  │  - 触发警报                                           │    │
│  │  - 更新 UI                                            │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔌 后端通讯方式（wisefido-radar）

### 1. TCP Socket 服务器

**文件位置：** `wisefido-backend/wisefido-radar/socket/server.go`

**主要功能：**
- 监听 TCP 端口，接收雷达设备连接
- 管理设备连接生命周期
- 处理设备注册和心跳
- 接收并解析雷达数据

**关键代码：**

```go
// 启动 TCP 服务器
func (s *RadarServer) Start() error {
    s.listener, err = net.Listen("tcp", fmt.Sprintf(":%d", s.port))
    // ...
}

// 处理设备连接
func (s *RadarServer) handleConnection(conn net.Conn) {
    // 读取消息
    msgType, data, err := readMessage(conn)
    
    // 根据消息类型处理
    switch msgType {
    case constant.MsgTypeRegister:
        // 设备注册
    case constant.MsgTypeTrackingData:
        // 轨迹数据 (type 13)
    case constant.MsgTypeSleepData:
        // 睡眠数据 (type 14)
    case constant.MsgTypeFallDown:
        // 跌倒检测
    // ...
    }
}
```

### 2. 消息协议（Protobuf）

**协议格式：**
```
[Length: 2 bytes][Type: 1 byte][Data: Protobuf bytes]
```

**消息类型：**
- `MsgTypeRegister` (1): 设备注册
- `MsgTypeTrackingData` (13): 实时轨迹数据
- `MsgTypeSleepData` (14): 睡眠/生命体征数据
- `MsgTypeFallDown` (15): 跌倒事件
- `MsgTypeEventData` (16): 其他事件（进入/离开区域等）
- `MsgTypeTrackingStats` (17): 轨迹统计
- `MsgTypeHeartbeat` (20): 心跳

### 3. 实时数据订阅

**自动订阅机制：**
设备注册成功后，后端自动启动实时数据订阅：

```go
// 设备注册后自动订阅
go func() {
    if err := deviceConn.StartRealtimeDataSubscription(); err != nil {
        // 错误处理
    }
}()

// 订阅消息 (type 26)
subMsg := &pb.SetModeReq{
    Seq:     seq,
    Seconds: 3600, // 订阅 1 小时
}
```

**自动续订：**
- 每 50 分钟自动续订一次
- 确保订阅不会过期

### 4. 数据通道（Channels）

后端使用 Go channels 发布数据：

```go
// 发布轨迹数据
func (s *RadarServer) PublishTrackingData(data []*models.TrackingData) {
    select {
    case s.trackingDataChan <- data:
    default:
        // Channel 满，丢弃数据
    }
}

// 发布生命体征数据
func (s *RadarServer) PublishVitalSignsData(data *models.VitalSignsData) {
    select {
    case s.vitalSignsChan <- data:
    default:
    }
}
```

### 5. 数据消费

**文件位置：** `wisefido-backend/wisefido-radar/modules/consumer.go`

Consumer 从 channels 读取数据并：
- 存储到数据库
- 或通过其他方式提供给前端（如 HTTP API、WebSocket 等）

---

## 🌐 前端通讯方式（wisefido-frontend）

### 1. HTTP 轮询

**文件位置：** `wisefido-frontend/wisefido-platform-vue/src/store/radar/radarData.ts`

**实现方式：**
```typescript
// 每 1 秒轮询一次
function startDataStream(radarId: string) {
    if (!timer) {
        refreshRadarData(radarId)
        timer = setInterval(() => {
            refreshRadarData(radarId)
        }, 1 * 1000)  // 1 秒间隔
    }
}

// 获取实时数据
const refreshRadarData = async (radarId: string) => {
    getRadarDeviceRealtimeDataApi(radarId, 'none')
        .then((data) => {
            // 更新轨迹数据
            currentPersons.value = data.positions.map(...)
            
            // 更新生命体征数据
            if (data.vital) {
                currentVital.value = {
                    heartRate: data.vital.heartRate,
                    breathing: data.vital.breathRate,
                    sleepState: data.vital.event,
                }
            }
        })
}
```

### 2. API 接口

**文件位置：** `wisefido-frontend/wisefido-platform-vue/src/api/sys/realtime.ts`

```typescript
enum Api {
    RadarDeviceRealtimeData = '/radar-device/api/v1/radar-device/device/:id/realtime',
    RadarDeviceOriginalProperties = '/radar-device/api/v1/radar-device/device/:id/original-properties',
}

// 获取实时数据
export function getRadarDeviceRealtimeDataApi(id: string) {
    return defHttp.get<RealtimeData>({
        url: Api.RadarDeviceRealtimeData.replace(':id', id),
    })
}
```

### 3. 数据格式

**响应数据结构：**
```typescript
interface RealtimeData {
    positions: Array<{
        personIndex: number;
        coodinateX: number;  // dm 单位
        coodinateY: number;  // dm 单位
        coodinateZ: number;
        remainingTime: number;
        posture: number;
        event: number;
        areaId: number;
    }>;
    vital?: {
        heartRate: number;
        breathRate: number;
        event: number;
    };
}
```

**单位转换：**
- 后端返回：dm（分米）
- 前端显示：cm（厘米）
- 转换：`cm = dm × 10`

---

## 📊 数据流详解

### 实时轨迹数据流

```
1. 雷达设备检测到人员
   ↓
2. 通过 TCP Socket 发送轨迹数据 (type 13)
   ↓
3. RadarServer 接收并解析
   ↓
4. 发布到 trackingDataChan
   ↓
5. Consumer 消费数据
   ↓
6. 存储到数据库或提供 HTTP API
   ↓
7. 前端每 1 秒轮询 HTTP API
   ↓
8. 更新 UI 显示
```

### 生命体征数据流

```
1. 雷达设备检测到生命体征
   ↓
2. 通过 TCP Socket 发送睡眠数据 (type 14)
   ↓
3. RadarServer 接收并解析
   ↓
4. 发布到 vitalSignsChan
   ↓
5. Consumer 消费数据
   ↓
6. 存储到数据库或提供 HTTP API
   ↓
7. 前端每 1 秒轮询 HTTP API
   ↓
8. 更新生命体征显示和警报
```

---

## 🔧 配置管理

### 获取雷达配置

**API：** `GET /radar-device/api/v1/radar-device/device/:id/original-properties`

**文件位置：** `wisefido-frontend/wisefido-platform-vue/src/api/sys/realtime.ts`

```typescript
export function getRadarDeviceOriginalPropertiesApi(id: string) {
    return defHttp.get<string>({
        url: Api.RadarDeviceOriginalProperties.replace(':id', id),
    })
}
```

**返回格式：** JSON 字符串，包含雷达所有配置参数

### 更新雷达配置

**API：** `PUT /radar-device/api/v1/radar-device/device/:id/config`

**文件位置：** `wisefido-frontend/wisefido-platform-vue/src/api/sys/radar.ts`

```typescript
export function updateRadarDeviceConfigApi(
    id: string, 
    data: any, 
    mode: ErrorMessageMode = 'modal'
) {
    return defHttp.put<string[]>({
        url: Api.RadarDeviceConfig.replace(':id', id),
        data: data,
    })
}
```

**配置项包括：**
- `install_model`: 安装模式（wall/ceiling）
- `height`: 高度（dm）
- `boundary_left`, `boundary_right`, `boundary_front`, `boundary_rear`: 边界（dm）
- `area_*_*`: 区域配置（dm）

---

## ⚠️ 注意事项

### 1. 单位转换

- **后端存储/传输：** dm（分米）
- **前端显示：** cm（厘米）
- **转换规则：** `cm = dm × 10`

### 2. 数据延迟

- HTTP 轮询方式有 1 秒延迟
- 实际延迟 = 轮询间隔 + 网络延迟 + 处理时间

### 3. 性能考虑

- 每 1 秒轮询一次，对服务器有一定压力
- 可以考虑使用 WebSocket 替代 HTTP 轮询

### 4. 订阅管理

- 后端自动管理订阅，每 50 分钟续订
- 前端无需关心订阅状态

---

## 🚀 v1.5 改进建议

### 1. 使用 WebSocket 替代 HTTP 轮询

**优势：**
- 实时性更好（推送 vs 轮询）
- 服务器压力更小
- 减少网络请求

**实现方式：**
```typescript
// 建立 WebSocket 连接
const ws = new WebSocket('ws://api/radar/realtime/:deviceId')

// 接收实时数据
ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    // 更新 UI
}
```

### 2. 使用 vue-radar 组件

**优势：**
- 独立的雷达可视化组件
- 支持实时和历史数据
- 更好的用户体验

**集成方式：**
- 作为 NPM 包引入
- 或通过 iframe 嵌入
- 或直接集成到项目中

---

## 📝 总结

### v1.0 通讯方式

1. **后端 → 设备：** TCP Socket + Protobuf
2. **后端 → 前端：** HTTP API（轮询）
3. **数据流：** 设备 → 后端 → 数据库/API → 前端

### 关键文件

**后端：**
- `wisefido-backend/wisefido-radar/socket/server.go` - TCP 服务器
- `wisefido-backend/wisefido-radar/socket/connection.go` - 连接管理
- `wisefido-backend/wisefido-radar/modules/consumer.go` - 数据消费

**前端：**
- `wisefido-frontend/wisefido-platform-vue/src/store/radar/radarData.ts` - 数据管理
- `wisefido-frontend/wisefido-platform-vue/src/api/sys/realtime.ts` - API 接口
- `wisefido-frontend/wisefido-platform-vue/src/api/sys/radar.ts` - 配置 API

### 下一步

在 owlFront v1.5 中：
1. 引入 vue-radar 组件
2. 实现 Real-time Trajectory 路由
3. 考虑使用 WebSocket 替代 HTTP 轮询（可选）

