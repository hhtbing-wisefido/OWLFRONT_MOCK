# Tags 管理设计总结

## 核心概念

### tag_type（Tag 类型）
- **定义**：定义是什么 tag，可选字段
- **可选值**：
  - 系统预定义：`alarm_tag`, `location_tag`, `family_tag`, `nursestation_tag`（`is_system_tag_type = TRUE`，不能删除）
  - 用户自定义：`user_tag`, `caregiver_tag`（`is_system_tag_type = FALSE`，可以删除）
  - `NULL`：无类型标签（`is_system_tag_type = FALSE`，用户自定义）
- **约束**：每个 `tag_name` 最多只能有一个 `tag_type`（或为 NULL）

### tag_name（Tag 名称）
- **定义**：某类型 `tag_type` 下具体的 tag 标签
- **约束**：
  - 必填（NOT NULL）
  - 在同一 `tenant_id` 下全局唯一（跨所有 `tag_type`）
  - 不能重复
- **唯一性**：`UNIQUE(tenant_id, tag_name)` - 确保每个 `tag_name` 只能有一个 `tag_type`

## 数据库约束

### 唯一约束
```sql
UNIQUE(tenant_id, tag_name)
```
- 确保 `tag_name` 在同一租户下全局唯一
- 这意味着：**每个 `tag_name` 最多只能有一个 `tag_type`**

### 业务规则
1. **创建 Tag**：
   - 如果 `tag_name` 已存在，不允许创建（因为已经有一个 `tag_type`）
   - 如果 `tag_name` 不存在，可以创建，指定 `tag_type`（或 NULL）

2. **更新 Tag**：
   - 可以修改 `tag_name`（但必须保持全局唯一）
   - 可以修改 `tag_type`（但每个 `tag_name` 只能有一个 `tag_type`）

3. **删除 Tag**：
   - 只需 `tag_name`（因为全局唯一，不需要 `tag_type`）
   - 系统预定义 `tag_type`（`is_system_tag_type = TRUE`）不能删除
   - 仅当 `tag_name` 下面无对象时方可删除

## 前端实现要点

### 1. 创建 Tag Name
- 选择 `tag_type`（可选，包括 NULL）
- 输入 `tag_name`（必填，全局唯一）
- 检查 `tag_name` 是否已存在（跨所有 `tag_type`）

### 2. 显示逻辑
- Tag Type 列：显示 `tag_type` 或 `(None)`
- Tag Name 列：显示 `tag_name`
- 每个 `tag_name` 只显示一次（因为全局唯一）

### 3. 删除逻辑
- 只需 `tag_name`，不需要 `tag_type`
- 检查是否为系统预定义 `tag_type`
- 检查是否有对象使用该 tag

## 示例

### 正确示例
```
tag_name: "NightShift"
tag_type: "user_tag"
→ 可以创建

tag_name: "NightShift"  
tag_type: "alarm_tag"
→ 不能创建（tag_name 已存在）
```

### 错误示例
```
tag_name: "NightShift"
tag_type: "user_tag"
→ 已存在

tag_name: "NightShift"
tag_type: "alarm_tag"  
→ 不能创建（违反唯一约束）
```

## 总结

- **每个 `tag_name` 最多只能有一个 `tag_type`**（或为 NULL）
- `tag_name` 在同一 `tenant_id` 下全局唯一（跨所有 `tag_type`）
- 创建时必须检查 `tag_name` 是否已存在（跨所有 `tag_type`）
- 删除时只需 `tag_name`（因为全局唯一）

