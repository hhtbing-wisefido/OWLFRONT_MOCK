# Building 创建验证问题分析

## 问题描述

在 `UnitList.vue` 中，admin 创建 Building 时出现错误：
```
Please provide either branch_tag or Building name
```

## 错误位置

**文件**: `owlFront/src/views/units/composables/useBuilding.ts`  
**行号**: 78-80

```typescript
if (!createBuildingForm.value.branch_tag && !createBuildingForm.value.building_name) {
  message.error('Please provide either branch_tag or Building name')
  return
}
```

## 数据库设计分析

### 1. Units 表结构 (`owlRD/db/05_units.sql`)

```sql
CREATE TABLE IF NOT EXISTS units (
    branch_tag    VARCHAR(255) NOT NULL,  -- 默认值为 "-"
    unit_name     VARCHAR(255) NOT NULL,
    building      VARCHAR(50) NOT NULL DEFAULT '-',
    ...
)
```

### 2. 唯一性约束 (`owlRD/db/05_units.sql` 第99-108行)

```sql
-- 唯一性约束：branch_tag + unit_name 唯一（人类易记的名称）
-- 如果 branch_tag 不为 NULL：使用 (tenant_id, branch_tag, unit_name) 唯一
-- 如果 branch_tag 为 NULL：使用 (tenant_id, unit_name) 唯一
CREATE UNIQUE INDEX idx_units_unique_with_tag 
    ON units(tenant_id, branch_tag, unit_name) 
    WHERE branch_tag IS NOT NULL;
CREATE UNIQUE INDEX idx_units_unique_without_tag 
    ON units(tenant_id, unit_name) 
    WHERE branch_tag IS NULL;
```

**关键点**：
- 唯一性约束是 `(tenant_id, branch_tag, unit_name)`，**不是** `(tenant_id, building, unit_name)`
- `building` 字段**不参与唯一性约束**
- `branch_tag` 和 `building` 都可以是 `'-'`（默认值）

### 3. 数据库注释说明 (`owlRD/db/05_units.sql` 第20-23行)

```sql
-- 此字段用于卡片地址计算：branch_tag + building + area_tag + unit_name（跳过空值或默认值 "-"）
-- 唯一性：通过 branch_tag + unit_name 保证唯一性（人类易记的名称）
-- unit_name 可能已编码或区分了 building + floor + unit_number 信息，但唯一性只依赖 branch_tag + unit_name
-- 唯一性约束：branch_tag + unit_name 唯一（人类易记的名称）
```

## 后端逻辑分析

### 1. Memory Repository (`owlBack/wisefido-data/internal/repository/memory_units.go`)

```go
func (r *MemoryUnitsRepo) CreateBuilding(_ context.Context, tenantID string, payload map[string]any) (map[string]any, error) {
    buildingName, _ := payload["building_name"].(string)
    if buildingName == "" {
        buildingName = "-"  // 允许为空，自动设置为 "-"
    }
    branchTag, _ := payload["branch_tag"].(string)
    if branchTag == "" {
        branchTag = "-"  // 允许为空，自动设置为 "-"
    }
    // ... 没有验证要求 branch_tag 或 building_name 必须有一个不为空
}
```

### 2. Postgres Repository (`owlBack/wisefido-data/internal/repository/postgres_units.go`)

```go
func (r *PostgresUnitsRepo) CreateUnit(ctx context.Context, tenantID string, payload map[string]any) (*Unit, error) {
    q := `
        INSERT INTO units (tenant_id, branch_tag, unit_name, building, floor, ...)
        VALUES ($1, $2, $3, COALESCE($4,'-'), COALESCE($5,'1F'), ...)
    `
    // branch_tag 和 building 都可以为空，会自动使用默认值
}
```

**后端没有类似的验证**，允许 `branch_tag` 和 `building_name` 都为空。

## Building 概念说明

### Building 是虚拟概念

根据 `postgres_units.go` 的 `ListBuildings` 方法：

```go
// ListBuildings: owlFront 需要 buildings 列表，但 owlRD 暂无 buildings 表
// 这里用 units 表做"虚拟 buildings"：按 (branch_tag, building) 分组
```

**Building 不是数据库中的实体表**，而是通过 `units` 表的 `(branch_tag, building)` 组合虚拟出来的。

## 用户需求

根据用户说明：
- 同一租户下，只要求 **Branch/unitName 不同时为空**
- 且 **Branch+unitname 唯一**
- **不要求 branch 或 unitname 唯一**

## 问题根源

### 前端验证逻辑错误

当前验证：
```typescript
if (!createBuildingForm.value.branch_tag && !createBuildingForm.value.building_name) {
  message.error('Please provide either branch_tag or Building name')
  return
}
```

**问题**：
1. ❌ 要求 `branch_tag` 或 `building_name` 必须有一个不为空
2. ❌ 这与数据库设计不符：两者都可以是 `'-'`（默认值）
3. ❌ 这与后端逻辑不符：后端允许两者都为空
4. ❌ 这与用户需求不符：只要求 `branch_tag` 和 `unit_name` 不同时为空（但 Building 创建时没有 `unit_name`）

### 正确的验证逻辑应该是

根据数据库设计和用户需求：
- **Building 创建时**：`branch_tag` 和 `building_name` 都可以为空（会自动设置为 `'-'`）
- **Unit 创建时**：`branch_tag` 和 `unit_name` 不能同时为空（因为唯一性约束需要）

但是，**Building 创建时没有 `unit_name`**，所以这个验证应该：
- 允许 `branch_tag` 和 `building_name` 都为空
- 或者，如果 Building 创建需要至少一个标识，应该验证 `building_name` 不为空（因为 `branch_tag` 可以为 `'-'`）

## 建议的修复方案

### 方案 1: 移除验证（推荐）

既然后端允许两者都为空，且会自动设置为 `'-'`，前端也应该允许：

```typescript
// 移除这个验证
// if (!createBuildingForm.value.branch_tag && !createBuildingForm.value.building_name) {
//   message.error('Please provide either branch_tag or Building name')
//   return
// }

// 直接使用默认值逻辑（已在第89-90行实现）
const buildingName = createBuildingForm.value.building_name?.trim() || '-'
const branchTag = createBuildingForm.value.branch_tag?.trim() || '-'
```

### 方案 2: 只验证 building_name 不为空

如果 Building 创建需要至少一个标识，应该只验证 `building_name`：

```typescript
if (!createBuildingForm.value.building_name?.trim()) {
  message.error('Please provide Building name')
  return
}
```

### 方案 3: 验证 floors 不为空（已有）

当前代码已有 floors 验证（第83-86行），这是合理的。

## 总结

**问题根源**：前端验证逻辑错误，要求 `branch_tag` 或 `building_name` 必须有一个不为空，但：
- 数据库设计允许两者都为 `'-'`
- 后端逻辑允许两者都为空
- 唯一性约束是 `(tenant_id, branch_tag, unit_name)`，不涉及 `building`

**建议**：移除该验证，允许 `branch_tag` 和 `building_name` 都为空，使用默认值 `'-'`。

