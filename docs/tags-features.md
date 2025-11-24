# Tags 管理功能需求文档

## 功能需求

基于 `tags_catalog` 表，实现以下功能：

### 1. 查看当前的 tags，列出包含的对象列表 ✅

**当前实现**：
- 表格中显示 Usage 列，显示对象类型和数量
- 格式：`类型: 数量`（每行一个类型）

**需要增强**：
- 点击 Usage 列或添加"查看详情"按钮，展开显示详细的对象列表
- 显示每个对象的 ID 和名称
- 按对象类型分组显示

### 2. 直接 drop 该 tag 中一些对象 ⏳

**功能描述**：
- 在查看对象列表时，可以选择某些对象并删除
- 删除后，这些对象不再使用该 tag
- 需要调用 `update_tag_objects` 函数（action: 'remove'）

**实现方式**：
- 在对象列表 Modal 中，每个对象前添加复选框
- 选择要删除的对象后，点击"删除选中对象"按钮
- 确认后调用 API 删除

### 3. 删除某个 tag ✅

**当前实现**：
- 已有删除功能
- 需要更新以使用 `tag_type` 参数

**需要更新**：
- 删除 API 调用时传递 `tag_type` 参数
- 确保唯一性约束：`(tenant_id, tag_type, tag_name)`

### 4. 增加/删除某些 tag_type ⏳

**功能描述**：
- Tag Type 是系统预定义的：`'alarm_tag'`, `'location_tag'`, `'family_tag'`, `'user_tag'`, `'caregiver_tag'`
- 但可能需要管理哪些 tag_type 在当前租户中可用
- 或者只是作为筛选条件使用

**实现方式**：
- 在搜索区域添加 Tag Type 筛选下拉框
- 可以选择特定的 tag_type 进行过滤
- 或者显示所有 tag_type 的统计信息

## 数据模型更新

### TagCatalogItem

```typescript
interface TagCatalogItem {
  tag_id: string
  tenant_id: string
  tag_type: string // 新增：Tag 类型
  tag_name: string
  tag_objects?: Record<string, Record<string, string>>
  is_active: boolean
  is_system_tag: boolean
}
```

### API 更新

1. **GetTagsParams**：添加 `tag_type?: string` 过滤参数
2. **CreateTagParams**：添加 `tag_type: string` 必填参数
3. **DeleteTagParams**：添加 `tag_type: string` 必填参数
4. **RemoveTagObjectsParams**：新增接口，用于删除 tag 中的对象

## UI 设计

### 表格列更新

| 列名 | 字段 | 说明 |
|------|------|------|
| Tag Type | `tag_type` | 显示 tag 类型 |
| Tag Name | `tag_name` | Tag 名称（可双击编辑） |
| Status | `is_active` | Active/Inactive |
| System Tag | `is_system_tag` | 系统 tag 标识 |
| Usage | `tag_objects` | 使用情况（可点击查看详情） |
| Operation | - | 操作按钮 |

### 对象列表 Modal

- **标题**：`Tag Objects: {tag_name}`
- **布局**：按对象类型分组显示
- **功能**：
  - 显示每个对象的 ID 和名称
  - 每个对象前有复选框（用于选择删除）
  - "删除选中对象"按钮
  - "关闭"按钮

### Tag Type 筛选

- **位置**：搜索区域，在搜索框和按钮之间
- **类型**：下拉选择框
- **选项**：
  - All Types（默认，显示所有）
  - Alarm Tag
  - Location Tag
  - Family Tag
  - User Tag
  - Caregiver Tag

## 实现步骤

1. ✅ 更新数据模型（添加 `tag_type`）
2. ✅ 更新 API 接口
3. ✅ 更新 Mock 数据
4. ⏳ 更新 UI 显示（添加 Tag Type 列）
5. ⏳ 实现对象列表查看功能
6. ⏳ 实现删除对象功能
7. ⏳ 添加 Tag Type 筛选功能
8. ⏳ 更新删除 tag 功能以使用 `tag_type`

