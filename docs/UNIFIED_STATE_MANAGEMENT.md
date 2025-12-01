# 统一状态管理方案

## 概述

统一状态管理方案使用 Pinia store 来集中管理所有实体数据（devices, units, users, residents 等），避免在多个组件中重复存储和管理数据。

## 架构设计

### 核心原则

1. **单一数据源**：所有实体数据从 server 取回后统一存放在 store
2. **缓存机制**：通过时间戳和超时机制避免重复 API 调用
3. **响应式更新**：使用 Pinia 的响应式系统，更新一处，所有组件自动同步
4. **统一接口**：提供统一的 CRUD 操作接口

### Store 结构

```
src/store/modules/
├── user.ts          # 用户认证和权限
├── tags.ts          # Tags 缓存
└── entities.ts      # 统一实体管理（devices, units, users, residents...）
```

## Entities Store 使用指南

### 1. 基本使用

```typescript
import { useEntitiesStore } from '@/store/modules/entities'

// 在组件或 composable 中使用
const entitiesStore = useEntitiesStore()

// 获取所有 devices
const devices = entitiesStore.devices

// 获取可用 devices（未绑定的）
const availableDevices = entitiesStore.availableDevices

// 获取某个 room 的 devices
const roomDevices = entitiesStore.getDevicesByRoom(roomId)

// 获取某个 bed 的 devices
const bedDevices = entitiesStore.getDevicesByBed(bedId)
```

### 2. 数据获取和缓存

```typescript
// 检查是否需要刷新
if (entitiesStore.shouldRefreshDevices) {
  // 从 API 获取数据
  const result = await getDevicesApi({ tenant_id })
  
  // 存储到 store
  entitiesStore.setDevices(result.items)
}

// 或者直接使用缓存的数据（如果存在且未过期）
const devices = entitiesStore.devices
```

### 3. 更新数据

```typescript
// 更新单个 device
await updateDeviceApi(deviceId, { device_name: 'New Name' })
entitiesStore.updateDevice(deviceId, { device_name: 'New Name' })

// 更新单个 unit
await updateUnitApi(unitId, { unit_name: 'New Name' })
entitiesStore.updateUnit(unitId, { unit_name: 'New Name' })
```

### 4. 删除数据

```typescript
// 删除 device
await deleteDeviceApi(deviceId)
entitiesStore.removeDevice(deviceId)

// 删除 unit
await deleteUnitApi(unitId)
entitiesStore.removeUnit(unitId)
```

### 5. Rooms with Beds 缓存

```typescript
// 检查是否需要刷新
if (entitiesStore.shouldRefreshRooms(unitId)) {
  // 从 API 获取数据
  const rooms = await getRoomsWithBedsApi(unitId)
  
  // 存储到 store
  entitiesStore.setRoomsWithBeds(unitId, rooms)
}

// 获取缓存的 rooms
const rooms = entitiesStore.getRoomsWithBeds(unitId)
```

## 迁移现有代码

### 示例：迁移 useDevice.ts

**之前**：
```typescript
// useDevice.ts
const allDevices = ref<Device[]>([])
const availableDevices = ref<Device[]>([])

const fetchAllDevices = async () => {
  const result = await getDevicesApi({ tenant_id })
  allDevices.value = result.items
  availableDevices.value = result.items.filter(...)
}
```

**之后**：
```typescript
// useDevice.ts
import { useEntitiesStore } from '@/store/modules/entities'

const entitiesStore = useEntitiesStore()

const fetchAllDevices = async () => {
  // 检查缓存
  if (entitiesStore.shouldRefreshDevices) {
    const result = await getDevicesApi({ tenant_id })
    entitiesStore.setDevices(result.items)
  }
}

// 使用 store 中的数据
const allDevices = computed(() => entitiesStore.devices)
const availableDevices = computed(() => entitiesStore.availableDevices)
```

### 示例：迁移 DeviceList.vue

**之前**：
```typescript
// DeviceList.vue
const dataSource = ref<Device[]>([])

const fetchDevices = async () => {
  const result = await getDevicesApi(params)
  dataSource.value = result.items
}
```

**之后**：
```typescript
// DeviceList.vue
import { useEntitiesStore } from '@/store/modules/entities'

const entitiesStore = useEntitiesStore()

// 直接使用 store 中的数据
const dataSource = computed(() => entitiesStore.devices)

const fetchDevices = async () => {
  if (entitiesStore.shouldRefreshDevices) {
    const result = await getDevicesApi(params)
    entitiesStore.setDevices(result.items)
  }
}
```

## 缓存策略

### 缓存超时时间

- **Devices**: 5 分钟
- **Units**: 5 分钟
- **Rooms with Beds**: 5 分钟（按 unit 缓存）

### 缓存失效

缓存会在以下情况失效：
1. 超过超时时间（5 分钟）
2. 手动调用 `clearCache()`
3. 用户登出时

### 强制刷新

如果需要强制刷新（忽略缓存），可以：
```typescript
// 方式1：直接调用 API 并更新 store
const result = await getDevicesApi(params)
entitiesStore.setDevices(result.items)

// 方式2：清除缓存后获取
entitiesStore.clearCache()
await fetchDevices()
```

## 优势

### 1. 减少代码重复
- 避免在多个组件中重复定义相同的状态和方法
- 统一的接口，易于维护

### 2. 提高性能
- 缓存机制避免重复 API 调用
- 响应式更新，自动同步

### 3. 数据一致性
- 单一数据源，更新一处，所有组件自动同步
- 避免数据不一致的问题

### 4. 易于扩展
- 添加新的 entity 类型只需在 store 中添加相应的方法
- 统一的模式，易于理解和使用

## 扩展指南

### 添加新的 Entity 类型

以添加 `users` 为例：

```typescript
// entities.ts

// 1. 添加状态
const users = ref<User[]>([])
const usersLastFetched = ref<Date | null>(null)
const usersCacheTimeout = 5 * 60 * 1000

// 2. 添加 computed
const shouldRefreshUsers = computed(() => {
  if (!usersLastFetched.value) return true
  const now = new Date()
  return now.getTime() - usersLastFetched.value.getTime() > usersCacheTimeout
})

// 3. 添加 actions
const setUsers = (newUsers: User[]) => {
  users.value = newUsers
  usersLastFetched.value = new Date()
}

const updateUser = (userId: string, updates: Partial<User>) => {
  const index = users.value.findIndex((u) => u.user_id === userId)
  if (index !== -1) {
    users.value[index] = { ...users.value[index], ...updates }
  }
}

const removeUser = (userId: string) => {
  users.value = users.value.filter((u) => u.user_id !== userId)
}

// 4. 在 return 中导出
return {
  // ...
  users,
  shouldRefreshUsers,
  setUsers,
  updateUser,
  removeUser,
}
```

## 最佳实践

1. **优先使用 store**：新功能优先使用 entities store，而不是在组件中维护本地状态
2. **及时更新**：API 调用成功后，立即更新 store
3. **利用缓存**：在获取数据前，先检查 `shouldRefresh`，避免不必要的 API 调用
4. **统一更新**：更新数据时，同时更新 API 和 store，保持一致性
5. **清理缓存**：用户登出时，调用 `clearCache()` 清理所有缓存

## 注意事项

1. **缓存时间**：根据数据更新频率调整缓存超时时间
2. **内存管理**：大量数据时，考虑分页或虚拟滚动
3. **错误处理**：API 调用失败时，不要更新 store
4. **类型安全**：使用 TypeScript 确保类型安全

