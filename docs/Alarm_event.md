# Alarm Event API 设计文档

## 功能概述

Alarm Event API 用于管理报警事件（alarm_events 表），包括查询报警记录和处理报警。

## API 端点

### 1. 获取报警事件列表

**端点**: `GET /admin/api/v1/alarm-events`

**参数**:
- `status`: 'active' | 'resolved' - 报警状态过滤
- `alarm_time_start`: number (timestamp) - 开始时间
- `alarm_time_end`: number (timestamp) - 结束时间
- `resident`: string - 住户搜索
- `location_tag`: string - 位置标签搜索
- `unit_name`: string - 单元名称搜索
- `device_name`: string - 设备名称搜索
- `event_types`: string[] - 事件类型过滤（多选）
- `categories`: string[] - 类别过滤（多选）
- `alarm_levels`: string[] - 报警级别过滤（多选）
- `page`: number - 页码
- `page_size`: number - 每页数量

**响应**: `GetAlarmEventsResult`

### 2. 处理报警事件

**端点**: `PUT /admin/api/v1/alarm-events/:id/handle`

**参数**:
- `alarm_status`: 'acknowledged' | 'resolved' - 目标状态
- `handle_type`: 'verified' | 'false_alarm' | 'test' - 处理类型
- `remarks`: string - 备注

## 权限控制

### 后端 API 权限检查（必须实现）

#### 1. 查询报警事件权限

**权限规则**:
- 所有有权限查看报警事件的用户都可以查询
- 后端应根据用户角色和权限过滤可查看的报警事件
- 参考：`/alarm/records` 页面的权限配置

#### 2. 处理报警事件权限（重要）

**权限规则**:
- **Facility 类型卡片** (`unit_type = 'Facility'`):
  - 只有 `Nurse` 或 `Caregiver` 角色可以处理报警
  - 其他角色（如 `Admin`, `Manager`, `IT` 等）不能处理 Facility 卡片的报警
  - **后端必须验证此权限**，防止前端绕过检查

- **Home 类型卡片** (`unit_type = 'Home'`):
  - 所有角色都可以处理报警
  - 包括：`SystemAdmin`, `Admin`, `Manager`, `IT`, `Nurse`, `Caregiver` 等

**实现方式**:
1. 后端接收到处理报警请求时，需要：
   - 根据 `event_id` 查询报警事件
   - 通过 `device_id` 关联到设备
   - 通过设备关联到卡片（一个设备只能属于一个卡片）
   - 查询卡片的 `unit_type`
   - 验证用户角色是否符合权限要求

2. 权限验证逻辑：
   ```typescript
   // 伪代码
   if (card.unit_type === 'Facility') {
     if (user.role !== 'Nurse' && user.role !== 'Caregiver') {
       return 403 Forbidden // 权限不足
     }
   }
   // Home 类型或其他情况，允许处理
   ```

3. 错误响应：
   - 权限不足时返回 `403 Forbidden`
   - 错误消息：`"Only Nurse or Caregiver can handle alarms for Facility cards"`

**安全说明**:
- 前端检查只是 UI 层面的限制，**后端必须实现权限验证**
- 防止恶意用户通过直接调用 API 绕过前端检查
- 确保数据安全性和权限一致性

## 数据模型

### AlarmEvent

```typescript
interface AlarmEvent {
  event_id: string  // UUID
  event_type: string
  category: 'safety' | 'clinical' | 'behavioral' | 'device'
  alarm_level: string | number
  alarm_status: 'active' | 'acknowledged' | 'resolved'
  triggered_at: number  // timestamp
  
  // Related data
  device_id?: string  // 用于关联到卡片
  device_name?: string
  
  // ... 其他字段
}
```

### 设备到卡片的关联

- 一个设备（device）只能属于一个卡片（card）
- 通过 `device_id` 可以找到对应的卡片
- 卡片包含 `unit_type` 字段：'Facility' | 'Home'

## 前端实现

### 权限检查函数

前端在 `AlarmRecordList` 组件中实现了权限检查：

```typescript
const canHandleAlarm = (record: AlarmEvent): boolean => {
  const userRole = userStore.getUserInfo?.role
  
  if (!record.device_id) {
    return true // 如果没有 device_id，允许处理（fallback）
  }

  // 通过 device_id 从 card store 获取卡片信息
  const card = cardStore.getCardByDeviceId(record.device_id)
  
  if (!card) {
    return true // 如果卡片不在缓存中，允许处理（fallback）
  }

  // Facility 类型：只有 Nurse 或 Caregiver 可以处理
  if (card.unit_type === 'Facility') {
    return userRole === 'Nurse' || userRole === 'Caregiver'
  }
  
  // Home 类型：所有角色都可以处理
  if (card.unit_type === 'Home') {
    return true
  }

  return true
}
```

### Card Detail 页面

在 Card Detail 页面中，也需要实现相同的权限检查逻辑。

## 注意事项

1. **权限一致性**: 前端和后端必须实现相同的权限规则
2. **缓存更新**: 当卡片数据更新时，需要更新 card store 缓存
3. **错误处理**: 当权限不足时，前端显示 "No permission"，后端返回 403
4. **日志记录**: 后端应记录权限拒绝的日志，用于审计

## 相关文档

- Card Overview API: `docs/card-overview.md` (待创建)
- User Roles: `docs/roles.md`
- Store Management: `docs/store.md`

