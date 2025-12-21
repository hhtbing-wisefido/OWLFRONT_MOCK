# UnitList.vue 修改对比分析

## 用户要求
仅需要将 `location_tag` 改成 `branch_tag`，实质逻辑不应该改变。

## 实际修改对比

### 1. ✅ 正确的修改：字段名称替换

#### 1.1 表单字段绑定
**之前 (location_tag)**:
```vue
v-model:value="createBuildingForm.location_tag"
v-model:value="editingBuildingForm.location_tag"
v-model:value="createUnitForm.location_tag"
```

**现在 (branch_tag)**:
```vue
v-model:value="createBuildingForm.branch_tag"
v-model:value="editingBuildingForm.branch_tag"
v-model:value="createUnitForm.branch_tag"
```
✅ **正确**：这是必需的字段名称替换

#### 1.2 变量名称
**之前**:
```typescript
locationTagOptions
selectedLocationTag
```

**现在**:
```typescript
branchTagOptions
// selectedLocationTag 已移除（逻辑简化）
```
✅ **正确**：变量名称应该与字段名称一致

#### 1.3 数据访问
**之前**:
```typescript
building.location_tag
unit.location_tag
```

**现在**:
```typescript
building.branch_tag
unit.branch_tag
```
✅ **正确**：数据字段访问应该更新

---

### 2. ❌ 不应该的修改：逻辑变更

#### 2.1 `branchTagOptions` computed 逻辑复杂化

**之前的简单实现** (HEAD 版本):
```typescript
// Location Tag Options (从 store 获取)
const branchTagOptions = computed(() => tagsStore.branchTags)
```

**现在的复杂实现**:
```typescript
// Location Tag Options (从 store 获取)
// For branch_tag, branch names are stored in tag_objects JSONB (tag_name = "Branch")
// If tag_objects.branch is empty, fallback to extract from buildings
const branchTagOptions = computed(() => {
  const branchTags = tagsStore.branchTags
  const branchNames: Array<{ tag_name: string }> = []
  
  // First, try to get branch names from tag_name = "Branch" tag's tag_objects.branch
  const branchTag = branchTags.find(tag => tag.tag_name === 'Branch')
  if (branchTag && branchTag.tag_objects && branchTag.tag_objects.branch) {
    // Extract all branch names from tag_objects.branch
    Object.values(branchTag.tag_objects.branch).forEach(branchName => {
      if (typeof branchName === 'string' && branchName) {
        // Check if branch name already exists
        if (!branchNames.find(b => b.tag_name === branchName)) {
          branchNames.push({ tag_name: branchName })
        }
      }
    })
  }
  
  // If tag_objects.branch is empty, fallback to extract from buildings
  if (branchNames.length === 0) {
    const branchTagSet = new Set<string>()
    buildings.value.forEach(building => {
      if (building.branch_tag && building.branch_tag !== '-') {
        branchTagSet.add(building.branch_tag)
      }
    })
    branchTagSet.forEach(branchTag => {
      branchNames.push({ tag_name: branchTag })
    })
  }
  
  return branchNames.sort((a, b) => a.tag_name.localeCompare(b.tag_name))
})
```

❌ **问题**：
- 之前的逻辑很简单：直接从 `tagsStore.branchTags` 获取
- 现在的逻辑复杂了很多：从 `tag_objects.branch` 提取，还有 fallback 逻辑
- **这改变了原有的行为逻辑**

**应该保持**:
```typescript
const branchTagOptions = computed(() => tagsStore.branchTags)
```

---

#### 2.2 `unitGrid` 中添加占位 unit 过滤

**之前的实现** (HEAD 版本):
```typescript
const filteredUnits = units.value.filter((unit) => {
  return (
    unit.building === building.building_name &&
    unit.floor === selectedFloor.value &&
    unit.branch_tag === building.branch_tag
  )
})
```

**现在的实现**:
```typescript
const filteredUnits = units.value.filter((unit) => {
  // Exclude placeholder units used for building representation
  if (unit.unit_name && unit.unit_name.startsWith('__BUILDING__')) {
    return false
  }
  return (
    unit.building === building.building_name &&
    unit.floor === selectedFloor.value &&
    unit.branch_tag === building.branch_tag
  )
})
```

❌ **问题**：
- 添加了过滤占位 unit 的逻辑（`__BUILDING__` 前缀检查）
- 这是因为我创建了占位 unit 来代表 building，但这不是原来就有的逻辑
- **这改变了原有的过滤逻辑**

**应该保持**:
```typescript
const filteredUnits = units.value.filter((unit) => {
  return (
    unit.building === building.building_name &&
    unit.floor === selectedFloor.value &&
    unit.branch_tag === building.branch_tag
  )
})
```

**注意**：如果占位 unit 确实不应该显示，应该在**后端** `ListUnits` 中过滤，而不是在前端过滤。

---

### 3. 其他修改检查

#### 3.1 注释更新
**之前**:
```typescript
// Location Tag Options (从 store 获取)
```

**现在**:
```typescript
// Location Tag Options (从 store 获取)
// For branch_tag, branch names are stored in tag_objects JSONB (tag_name = "Branch")
// If tag_objects.branch is empty, fallback to extract from buildings
```

⚠️ **部分正确**：注释应该更新，但不需要添加实现细节说明

---

#### 3.2 查询参数
**之前**:
```typescript
queryParams.location_tag = selectedLocationTag.value
```

**现在**:
```typescript
branch_tag: building.branch_tag,
```

✅ **正确**：这是必需的字段名称替换

---

## 总结

### ✅ 应该保留的修改
1. 所有 `location_tag` → `branch_tag` 的字段名称替换
2. 所有 `locationTagOptions` → `branchTagOptions` 的变量名称替换
3. 查询参数中的字段名称更新

### ❌ 应该撤销的修改
1. **`branchTagOptions` computed 的复杂化** - 应该保持简单的 `tagsStore.branchTags`
2. **`unitGrid` 中的占位 unit 过滤** - 这是新增的逻辑，不应该在这里

### 建议
1. 恢复 `branchTagOptions` 为简单的实现
2. 如果占位 unit 需要过滤，应该在**后端** `ListUnits` 中处理（已经在 `postgres_units.go` 中添加了过滤）
3. 前端不需要额外的过滤逻辑

