# Mock vs 实际实现差异分析

## 问题概述

对比前端 mock 实现与实际后端实现的差异，发现以下问题：

## 1. 字段名称不一致

### Mock 实现 (`test/admin/unit/mock.ts`)

**`mockCreateBuilding`** (第290-300行):
```typescript
export function mockCreateBuilding(params: CreateBuildingParams & { tag_name?: string }): Building {
  const newBuilding: Building = {
    building_id: `building-${buildingIdCounter++}`,
    building_name: params.building_name || '',
    floors: params.floors,
    tenant_id: 'tenant-1',
    location_tag: params.location_tag || params.tag_name || undefined,  // ❌ 使用 location_tag
  }
  buildings.push(newBuilding)
  return newBuilding
}
```

**`mockUpdateBuilding`** (第306-323行):
```typescript
export function mockUpdateBuilding(id: string, params: UpdateBuildingParams & { tag_name?: string }): Building {
  // ...
  const updateData: UpdateBuildingParams = {
    building_name: params.building_name,
    floors: params.floors,
    location_tag: (params as any).tag_name || params.location_tag,  // ❌ 使用 location_tag
  }
  // ...
}
```

### 实际实现

**类型定义** (`src/api/units/model/unitModel.ts`):
```typescript
export interface Building {
  building_id?: string
  building_name: string
  floors: number
  tenant_id?: string
  branch_tag?: string  // ✅ 使用 branch_tag
}

export interface CreateBuildingParams {
  building_name: string
  floors: number
  branch_tag?: string  // ✅ 使用 branch_tag
}
```

**API 层** (`src/api/units/unit.ts`):
```typescript
export async function createBuildingApi(
  params: CreateBuildingParams & { tag_name?: string },
  mode: ErrorMessageMode = 'modal'
): Promise<Building> {
  // ...
  const apiParams: CreateBuildingParams = {
    building_name: params.building_name,
    floors: params.floors,
    branch_tag: (params as any).tag_name || params.branch_tag,  // ✅ 使用 branch_tag
  }
  // ...
}
```

**后端实现** (`owlBack/wisefido-data/internal/repository/postgres_units.go`):
```go
func (r *PostgresUnitsRepo) CreateBuilding(ctx context.Context, tenantID string, payload map[string]any) (map[string]any, error) {
    branchTag, _ := payload["branch_tag"].(string)  // ✅ 使用 branch_tag
    // ...
}
```

### 问题

❌ **Mock 使用 `location_tag`，但实际 API 和类型定义使用 `branch_tag`**

这会导致：
- Mock 模式下返回的数据结构与实际 API 不一致
- 前端可能无法正确显示 `branch_tag`（因为 mock 返回的是 `location_tag`）

## 2. 验证逻辑缺失

### Mock 实现

**`mockCreateBuilding`** (第290-300行):
```typescript
export function mockCreateBuilding(params: CreateBuildingParams & { tag_name?: string }): Building {
  // ❌ 没有验证逻辑
  const newBuilding: Building = {
    building_id: `building-${buildingIdCounter++}`,
    building_name: params.building_name || '',  // 允许为空字符串
    floors: params.floors,
    tenant_id: 'tenant-1',
    location_tag: params.location_tag || params.tag_name || undefined,  // 允许为 undefined
  }
  buildings.push(newBuilding)
  return newBuilding
}
```

### 实际实现

**前端验证** (`src/views/units/composables/useBuilding.ts`):
```typescript
const handleCreateBuilding = async () => {
  // ✅ 有验证逻辑
  if (!createBuildingForm.value.branch_tag && !createBuildingForm.value.building_name) {
    message.error('Please provide either branch_tag or Building name')
    return
  }
  // ...
}
```

**后端验证** (`owlBack/wisefido-data/internal/repository/memory_units.go`):
```go
func (r *MemoryUnitsRepo) CreateBuilding(_ context.Context, tenantID string, payload map[string]any) (map[string]any, error) {
    // ✅ 有验证逻辑
    if (branchTag == "" || branchTag == "-") && (buildingName == "" || buildingName == "-") {
        return nil, fmt.Errorf("branch_tag or building_name must be provided (at least one must not be empty)")
    }
    // ...
}
```

**后端验证** (`owlBack/wisefido-data/internal/repository/postgres_units.go`):
```go
func (r *PostgresUnitsRepo) CreateBuilding(ctx context.Context, tenantID string, payload map[string]any) (map[string]any, error) {
    // ✅ 有验证逻辑
    if (branchTag == "" || branchTag == "-") && (buildingName == "" || buildingName == "-") {
        return nil, fmt.Errorf("branch_tag or building_name must be provided (at least one must not be empty)")
    }
    // ...
}
```

### 问题

❌ **Mock 没有验证逻辑，允许 `branch_tag` 和 `building_name` 都为空**

这会导致：
- Mock 模式下可以创建无效的 building（两个字段都为空）
- 与实际 API 行为不一致

## 3. 默认值处理不一致

### Mock 实现

```typescript
building_name: params.building_name || '',  // 空字符串，不是 '-'
location_tag: params.location_tag || params.tag_name || undefined,  // undefined，不是 '-'
```

### 实际实现

**前端** (`src/views/units/composables/useBuilding.ts`):
```typescript
const buildingName = createBuildingForm.value.building_name?.trim() || '-'  // ✅ 默认 '-'
const branchTag = createBuildingForm.value.branch_tag?.trim() || '-'  // ✅ 默认 '-'
```

**后端** (`owlBack/wisefido-data/internal/repository/memory_units.go`):
```go
if buildingName == "" {
    buildingName = "-"  // ✅ 默认 '-'
}
if branchTag == "" {
    branchTag = "-"  // ✅ 默认 '-'
}
```

### 问题

❌ **Mock 使用空字符串和 undefined，但实际实现使用 `'-'` 作为默认值**

这会导致：
- Mock 模式下返回的数据格式与实际 API 不一致
- 前端显示逻辑可能无法正确处理空字符串

## 4. Mock 数据格式

### Mock 数据 (`test/admin/unit/data.ts`)

```typescript
export const mockBuildingsData: Building[] = [
  {
    building_id: 'building-1',
    building_name: 'A',
    floors: 2,
    tenant_id: 'tenant-1',
    location_tag: 'DV1',  // ❌ 使用 location_tag
  },
  // ...
]
```

### 类型定义

```typescript
export interface Building {
  branch_tag?: string  // ✅ 应该是 branch_tag
}
```

## 修复建议

### 1. 修复 Mock 字段名称

将 `location_tag` 改为 `branch_tag`：

```typescript
export function mockCreateBuilding(params: CreateBuildingParams & { tag_name?: string }): Building {
  const newBuilding: Building = {
    building_id: `building-${buildingIdCounter++}`,
    building_name: params.building_name || '-',  // 改为 '-'
    floors: params.floors,
    tenant_id: 'tenant-1',
    branch_tag: params.branch_tag || (params as any).tag_name || '-',  // 改为 branch_tag，默认 '-'
  }
  buildings.push(newBuilding)
  return newBuilding
}
```

### 2. 添加验证逻辑

```typescript
export function mockCreateBuilding(params: CreateBuildingParams & { tag_name?: string }): Building {
  // 验证：branch_tag 或 building_name 必须有一个不为空
  const branchTag = params.branch_tag || (params as any).tag_name || ''
  const buildingName = params.building_name || ''
  
  if ((branchTag === '' || branchTag === '-') && (buildingName === '' || buildingName === '-')) {
    throw new Error('branch_tag or building_name must be provided (at least one must not be empty)')
  }
  
  // 设置默认值
  const finalBranchTag = branchTag || '-'
  const finalBuildingName = buildingName || '-'
  
  const newBuilding: Building = {
    building_id: `building-${buildingIdCounter++}`,
    building_name: finalBuildingName,
    floors: params.floors,
    tenant_id: 'tenant-1',
    branch_tag: finalBranchTag,
  }
  buildings.push(newBuilding)
  return newBuilding
}
```

### 3. 修复 Mock 数据

```typescript
export const mockBuildingsData: Building[] = [
  {
    building_id: 'building-1',
    building_name: 'A',
    floors: 2,
    tenant_id: 'tenant-1',
    branch_tag: 'DV1',  // 改为 branch_tag
  },
  {
    building_id: 'building-2',
    building_name: 'B',
    floors: 1,
    tenant_id: 'tenant-1',
    branch_tag: 'SPR',  // 改为 branch_tag
  },
]
```

### 4. 修复 mockUpdateBuilding

```typescript
export function mockUpdateBuilding(id: string, params: UpdateBuildingParams & { tag_name?: string }): Building {
  const index = buildings.findIndex((b) => b.building_id === id)
  if (index === -1) {
    throw new Error(`Building with id ${id} not found`)
  }
  
  // 验证：如果提供了新值，必须至少有一个不为空
  const newBranchTag = params.branch_tag || (params as any).tag_name || ''
  const newBuildingName = params.building_name || ''
  
  if (newBranchTag !== '' || newBuildingName !== '') {
    if ((newBranchTag === '' || newBranchTag === '-') && (newBuildingName === '' || newBuildingName === '-')) {
      throw new Error('branch_tag or building_name must be provided (at least one must not be empty)')
    }
  }
  
  const updateData: UpdateBuildingParams = {
    building_name: params.building_name,
    floors: params.floors,
    branch_tag: params.branch_tag || (params as any).tag_name,  // 改为 branch_tag
  }
  
  const updated = {
    ...buildings[index],
    ...updateData,
  }
  buildings[index] = updated
  return { ...updated }
}
```

## 总结

### 主要差异

1. ❌ **字段名称不一致**: Mock 使用 `location_tag`，实际使用 `branch_tag`
2. ❌ **验证逻辑缺失**: Mock 没有验证 `branch_tag` 或 `building_name` 必须有一个不为空
3. ❌ **默认值不一致**: Mock 使用空字符串/undefined，实际使用 `'-'`
4. ❌ **Mock 数据格式过时**: 使用 `location_tag` 而不是 `branch_tag`

### 影响

- Mock 模式下行为与实际 API 不一致
- 可能导致前端显示问题
- 测试结果可能不准确

