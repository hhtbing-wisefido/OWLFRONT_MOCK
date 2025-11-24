# Tags 管理 UI 设计文档

## 概述

Tags 管理功能用于统一管理系统中所有类型的 tag，基于 `tags_catalog` 表实现。本文档重点说明前端 UI 实现。

## 页面路由

- **路径**：`/admin/tags`
- **组件**：`src/views/admin/tags/TagList.vue`
- **权限**：`['Admin', 'Director', 'IT', 'NurseManager']`

## UI 设计

### 1. 列表页面布局

```
┌─────────────────────────────────────────────────────────┐
│  [Search Input: 400px]  [Search]  [Create Tag]          │
├─────────────────────────────────────────────────────────┤
│  Tag Name    │ Status │ System Tag │ Usage │ Operation │
├─────────────────────────────────────────────────────────┤
│  Management  │ Active │ System     │ -     │ Edit      │
│  NightShift  │ Active │ -          │ 3     │ Edit Del  │
│  ...         │ ...    │ ...        │ ...   │ ...       │
└─────────────────────────────────────────────────────────┘
```

### 2. 搜索区域

- **搜索输入框**：宽度 400px，支持按 tag name 搜索
- **Search 按钮**：触发搜索
- **Create Tag 按钮**：创建新 tag

**布局**：所有按钮在同一行，Search 和 Create Tag 按钮在搜索框右侧

### 3. 表格列定义

| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| Tag Name | `tag_name` | 200px | 可双击编辑 |
| Status | `is_active` | 100px | Active/Inactive（颜色标识） |
| System Tag | `is_system_tag` | 120px | 系统 tag 显示蓝色标签 |
| Usage | `tag_objects` | 200px | 显示使用该 tag 的对象数量和类型 |
| Operation | - | 200px | 操作按钮（固定右侧） |

### 4. 表格显示规则

#### Tag Name 列
- 显示 tag 名称
- **可双击**：双击 tag name 打开编辑 Modal
- 样式：蓝色文字，鼠标悬停显示指针

#### Status 列
- **Active**：绿色文字（`#52c41a`）
- **Inactive**：红色文字（`#ff4d4f`）
- 字体加粗

#### System Tag 列
- **系统 tag**：显示蓝色 `<a-tag color="blue">System</a-tag>`
- **用户 tag**：显示 `-`

#### Usage 列
- 显示 `tag_objects` JSONB 中的对象类型和数量
- 格式：`类型: 数量`（每行一个类型）
- 示例：
  ```
  resident: 3
  location: 2
  user: 5
  ```
- 如果没有使用对象，显示 `-`

#### Operation 列
- **Edit**：编辑 tag（所有 tag 都可编辑）
- **Delete**：删除 tag（仅用户 tag 可删除，系统 tag 不显示）
- **Disable**：禁用 tag（仅 Active 状态显示）
- **Enable**：启用 tag（仅 Inactive 状态显示）

### 5. 创建/编辑 Modal

#### Modal 布局
- **宽度**：600px
- **标题**：Create Tag / Edit Tag（根据模式动态显示）

#### 表单字段

| 字段 | 类型 | 必填 | 可编辑 | 说明 |
|------|------|------|--------|------|
| Tag Name | Input | ✅ | 创建时可编辑，编辑时禁用 | Tag 名称（最大 255 字符） |
| Is Active | Switch | - | ✅ | 是否启用 |
| System Tag | Switch | - | ❌ | 仅编辑模式显示，禁用状态 |

#### 表单验证
- **Tag Name**：
  - 必填
  - 最大长度 255 字符

#### 按钮布局
- **Cancel**：左侧，margin-right: 30px
- **Confirm**：右侧，margin-right: 20px

### 6. 删除确认 Modal

#### Modal 布局
- **宽度**：420px
- **标题**：Delete Tag / Disable Tag / Enable Tag（根据操作动态显示）

#### 内容
- 警告图标（黄色，24px）
- 确认消息（左对齐，margin-bottom: 24px）

#### 按钮布局
- **Cancel** 和 **Confirm** 按钮：水平居中，等间距分布

## 功能实现

### 1. 数据获取

```typescript
// 自动获取当前用户的 tenant_id
const userInfo = userStore.getUserInfo
const tenantId = userInfo?.tenant_id

// 调用 API 获取 tags
const result = await getTagsApi({
  tenant_id: tenantId,
  is_active: undefined, // 获取所有状态
  include_system_tags: true,
})
```

### 2. 搜索功能

- **实时搜索**：输入框内容变化时自动过滤
- **搜索范围**：仅搜索 `tag_name` 字段
- **不区分大小写**：使用 `toLowerCase()` 比较

### 3. 创建 Tag

```typescript
const params: CreateTagParams = {
  tenant_id: tenantId,
  tag_name: 'NewTag',
  is_system_tag: false, // 用户创建的 tag 默认为 false
}
await createTagApi(params)
```

### 4. 编辑 Tag

- **Tag Name**：编辑模式下禁用（不可修改）
- **Is Active**：可以切换启用/禁用状态
- **System Tag**：显示但禁用（系统 tag 不能修改）

### 5. 删除 Tag

- **限制**：系统 tag（`is_system_tag = true`）不能删除
- **功能**：调用 `drop_tag()` 函数，自动从所有使用该 tag 的地方删除
- **确认**：删除前显示确认 Modal

### 6. 启用/禁用 Tag

- **Disable**：将 `is_active` 设置为 `false`
- **Enable**：将 `is_active` 设置为 `true`
- **确认**：操作前显示确认 Modal

## 数据模型

### TagCatalogItem

```typescript
interface TagCatalogItem {
  tag_id: string              // UUID
  tenant_id: string           // UUID
  tag_name: string            // Tag 名称
  tag_objects?: {             // 使用该 tag 的对象列表（JSONB）
    [objectType: string]: {   // 对象类型：resident, location, user, card, caregiver_group
      [objectId: string]: string  // 对象ID -> 对象名称
    }
  }
  is_active: boolean          // 是否启用
  is_system_tag: boolean      // 是否系统 tag
}
```

### tag_objects 格式示例

```json
{
  "resident": {
    "uuid1": "Resident Name 1",
    "uuid2": "Resident Name 2"
  },
  "location": {
    "uuid3": "Location Name 1"
  },
  "user": {
    "uuid4": "User Name 1",
    "uuid5": "User Name 2"
  }
}
```

## API 接口

### 1. 获取 Tags 列表

```typescript
getTagsApi(params?: GetTagsParams): Promise<GetTagsResult>
```

**参数**：
- `tenant_id`：租户 ID（可选，默认使用当前用户）
- `is_active`：是否只获取启用的 tags（可选）
- `include_system_tags`：是否包含系统 tags（可选，默认 true）

### 2. 创建 Tag

```typescript
createTagApi(params: CreateTagParams): Promise<CreateTagResult>
```

**参数**：
- `tenant_id`：租户 ID（必填）
- `tag_name`：Tag 名称（必填）
- `is_system_tag`：是否系统 tag（可选，默认 false）

### 3. 更新 Tag

```typescript
updateTagApi(tagId: string, params: UpdateTagParams): Promise<{ success: boolean }>
```

**参数**：
- `tag_name`：Tag 名称（可选，但编辑模式下不能修改）
- `is_active`：是否启用（可选）

### 4. 删除 Tag

```typescript
deleteTagApi(params: DeleteTagParams): Promise<{ success: boolean }>
```

**参数**：
- `tenant_id`：租户 ID（必填）
- `tag_name`：Tag 名称（必填）

**注意**：系统 tag 不能删除，后端会返回错误

## 权限控制

### 页面访问权限

- **允许角色**：`['Admin', 'Director', 'IT', 'NurseManager']`
- **路由守卫**：在 `router/index.ts` 中配置
- **权限检查**：使用 `userStore.hasPagePermission('/admin/tags')`

### 操作权限

- **创建/编辑/删除**：所有有页面访问权限的用户都可以操作
- **系统 tag 保护**：系统 tag 不能删除（后端和前端双重保护）

## 自动同步机制

Tags 通过数据库触发器自动同步，前端无需手动管理：

1. **自动创建**：当各表中使用 tag 时，自动在 `tags_catalog` 中创建记录
2. **自动更新**：`tag_objects` 字段通过触发器自动维护
3. **自动清理**：当对象被删除时，自动从 `tag_objects` 中移除

前端只需要：
- 创建/编辑/删除 tag 本身
- 查看 tag 的使用情况（`tag_objects`）

## 使用场景

### 1. 查看所有 Tags

- 访问 `/admin/tags` 页面
- 显示当前租户的所有 tags
- 可以搜索、筛选

### 2. 创建新 Tag

- 点击 "Create Tag" 按钮
- 输入 Tag Name
- 选择是否启用
- 确认创建

### 3. 编辑 Tag

- 双击 Tag Name 或点击 "Edit" 按钮
- 修改 Is Active 状态
- 确认保存

### 4. 删除 Tag

- 点击 "Delete" 按钮（仅用户 tag 显示）
- 确认删除
- Tag 会从所有使用它的地方自动删除

### 5. 查看 Tag 使用情况

- 在 Usage 列查看使用该 tag 的对象类型和数量
- 格式：`类型: 数量`（每行一个类型）

## 注意事项

1. **系统 Tag 保护**：系统 tag 不能删除，编辑时 `is_system_tag` 字段禁用
2. **Tag Name 唯一性**：同一租户内 tag 名称必须唯一
3. **自动同步**：`tag_objects` 由数据库触发器自动维护，前端只读
4. **多租户隔离**：所有操作都基于当前用户的 `tenant_id` 进行过滤

