# Tag 创建和编辑规则

## 一、Tag 类型 (tag_type)

系统预定义的 4 种类型：
- `branch_tag` - 分支标签
- `area_tag` - 区域标签
- `user_tag` - 用户标签
- `family_tag` - 家庭标签

**规则：`tag_type` 不可编辑（只读）**

---

## 二、创建规则

### 1. Branch Tag (branch_tag)

**创建流程：**
1. 检查是否存在 `tag_type = 'branch_tag'` 且 `tag_name = 'Branch'` 的记录
2. 如果不存在，先创建该记录（`tag_name` 固定为 `"Branch"`）
3. 将用户输入的分支名作为成员添加到 `tag_objects` JSONB 中

**数据结构：**
- `tag_name`: 固定为 `"Branch"`（不可修改）
- `tag_type`: `"branch_tag"`
- `tag_objects`: JSONB 格式，存储所有分支名
  ```json
  {
    "branch": {
      "<uuid>": "<branch_name>"
    }
  }
  ```

**权限要求：**
- 需要 `hasManagePermission`（Admin 或 Manager）
- 非管理员无法创建和删除 Branch

**输入验证：**
- 分支名不能为空

---

### 2. Area Tag (area_tag)

**创建流程：**
1. 检查是否存在 `tag_type = 'area_tag'` 且 `tag_name = 'Area'` 的记录
2. 如果不存在，先创建该记录（`tag_name` 固定为 `"Area"`）
3. 将用户输入的区域名作为成员添加到 `tag_objects` JSONB 中

**数据结构：**
- `tag_name`: 固定为 `"Area"`（不可修改）
- `tag_type`: `"area_tag"`
- `tag_objects`: JSONB 格式，存储所有区域名
  ```json
  {
    "area": {
      "<uuid>": "<area_name>"
    }
  }
  ```

**特点：**
- 整个系统只有一个 `area_tag` 记录
- 所有区域名都存储在这个记录的 `tag_objects` 中

**输入验证：**
- 区域名不能为空

---

### 3. User Tag (user_tag)

**创建流程：**
1. 直接创建新的 `user_tag` 记录
2. `tag_name` 为用户输入的标签名

**数据结构：**
- `tag_name`: 用户输入的标签名（可编辑）
- `tag_type`: `"user_tag"`
- `tag_objects`: JSONB 格式，存储成员（用户）
  ```json
  {
    "user": {
      "<user_id>": "<user_name>"
    }
  }
  ```

**特点：**
- 可以有多个 `user_tag` 记录
- 每个 `user_tag` 有独立的 `tag_name`
- 成员通过复选框管理

**输入验证：**
- 标签名不能为空

---

### 4. Family Tag (family_tag)

**创建流程：**
1. 直接创建新的 `family_tag` 记录
2. `tag_name` 为用户输入的家庭名

**数据结构：**
- `tag_name`: 用户输入的家庭名（可编辑）
- `tag_type`: `"family_tag"`
- `tag_objects`: JSONB 格式，存储成员（住户）
  ```json
  {
    "resident": {
      "<resident_id>": "<resident_name>"
    }
  }
  ```

**特点：**
- 可以有多个 `family_tag` 记录
- 每个 `family_tag` 有独立的 `tag_name`
- 成员通过复选框管理

**输入验证：**
- 家庭名不能为空

---

## 三、编辑规则

### 1. Tag Name (tag_name) 编辑

**可编辑：**
- ✅ `user_tag`: 可以修改 `tag_name`
- ✅ `family_tag`: 可以修改 `tag_name`

**不可编辑：**
- ❌ `branch_tag`: `tag_name` 固定为 `"Branch"`（系统固定值）
- ❌ `area_tag`: `tag_name` 固定为 `"Area"`（系统固定值）

**编辑方式：**
- 在表格的 `tag_name` 列直接编辑（双击或点击编辑图标）

---

### 2. Tag Type (tag_type) 编辑

**规则：**
- ❌ **所有 tag_type 都不可编辑**（系统预定义，只读显示）

---

### 3. Objects (成员) 编辑

#### Branch Tag 和 Area Tag

**显示方式：**
- 成员列表显示，每个成员旁边有删除按钮（×）
- 无复选框（不能批量选择）

**删除规则：**
- ✅ 可以删除单个成员（点击 × 按钮）
- ⚠️ **Branch Tag**: 只有 Admin/Manager 可以删除（需要 `hasManagePermission`）
- ✅ **Area Tag**: 所有有权限的用户都可以删除

**添加规则：**
- 通过创建流程添加新成员（输入框 + Create 按钮）

---

#### User Tag 和 Family Tag

**显示方式：**
- 成员列表显示为复选框
- 可以批量选择/取消选择成员

**编辑规则：**
- ✅ 可以通过复选框添加/移除成员
- ✅ 修改后需要点击 "Save" 按钮保存
- ✅ 可以点击 "Cancel" 取消修改

**保存机制：**
- 取消选择的成员会被标记为待删除
- 点击 "Save" 后批量删除取消选择的成员
- 新添加的成员需要单独调用 API 添加

---

## 四、删除规则

### 1. 删除 Tag Name（整条记录）

**可删除：**
- ✅ `user_tag`: 当 `tag_objects` 为空时，可以删除整条记录
- ✅ `family_tag`: 当 `tag_objects` 为空时，可以删除整条记录

**不可删除：**
- ❌ `branch_tag`: 不能删除整条记录（系统关键数据）
- ❌ `area_tag`: 不能删除整条记录（系统关键数据）
- ❌ 任何有 `tag_objects` 的记录都不能删除（必须先清空成员）

**删除验证：**
```javascript
if (hasObjects(record)) {
  message.warning('Cannot delete tag with objects. Please remove all objects first.')
  return
}
```

---

### 2. 删除 Objects（成员）

**Branch Tag:**
- ⚠️ 只有 Admin/Manager 可以删除（`hasManagePermission`）
- 删除单个成员：点击成员旁边的 × 按钮

**Area Tag:**
- ✅ 所有有权限的用户都可以删除
- 删除单个成员：点击成员旁边的 × 按钮

**User Tag / Family Tag:**
- ✅ 通过复选框取消选择，然后点击 "Save" 批量删除
- ✅ 或通过其他 API 单独删除

---

## 五、权限规则

### 权限检查

**角色权限定义:**
- `isAdmin`: 当前用户角色为 `Admin`
- `isManager`: 当前用户角色为 `Manager`
- `canManageBranch`: 只有 `Admin` 可以管理 Branch
- `canManageOtherTags`: `Manager` 或 `Admin` 可以管理 Area/Family/User tags

### 权限应用

**Branch Tag (branch_tag):**
- ✅ **创建**: 只有 `Admin` 可以创建
- ✅ **删除成员**: 只有 `Admin` 可以删除 Branch 成员
- ❌ 其他角色: 创建按钮和删除按钮禁用，显示提示 "Only administrators can delete branch"

**Area Tag / Family Tag / User Tag:**
- ✅ **创建**: `Manager` 或 `Admin` 可以创建
- ✅ **编辑成员**: `Manager` 或 `Admin` 可以编辑（通过复选框和 Save 按钮）
- ✅ **编辑 Tag Name**: `Manager` 或 `Admin` 可以编辑（仅 user_tag 和 family_tag）
- ✅ **删除 Tag**: `Manager` 或 `Admin` 可以删除（仅 user_tag 和 family_tag，且无成员时）
- ❌ 其他角色: 所有操作按钮禁用，无法创建或编辑

---

## 六、数据验证规则

### 创建时验证

1. **输入不能为空**
   - Branch Name: 必须输入
   - Area Name: 必须输入
   - User Tag Name: 必须输入
   - Family Name: 必须输入

2. **Tenant ID 验证**
   - 必须有有效的 `tenant_id`
   - 从 `userStore.getUserInfo.tenant_id` 获取

### 编辑时验证

1. **Tag Name 唯一性**
   - 同一 `tag_type` 下，`tag_name` 应该唯一（由后端验证）

2. **Objects 格式验证**
   - `tag_objects` 必须是有效的 JSONB 格式
   - Object ID 必须是有效的 UUID

---

## 七、UI 交互规则

### 创建区域

- **布局**: 输入框在前，按钮在后
- **快捷键**: 输入框支持 `Enter` 键提交

### 表格编辑

- **Tag Name 列**: 
  - 双击或点击编辑图标进入编辑模式
  - 编辑完成后按 `Enter` 或点击外部保存

- **Objects 列**:
  - Branch/Area: 显示删除按钮（×）
  - User/Family: 显示复选框，支持批量选择

### 保存/取消

- **Save 按钮**: 保存所有修改（批量删除取消选择的成员）
- **Cancel 按钮**: 取消所有修改，恢复原始状态

---

## 八、API 调用规则

### 创建 Tag

```typescript
createTagApi({
  tenant_id: string,
  tag_type: 'branch_tag' | 'area_tag' | 'user_tag' | 'family_tag',
  tag_name: string
})
```

### 更新 Tag Name

```typescript
updateTagApi({
  tenant_id: string,
  tag_name: string,  // 旧名称
  new_tag_name: string  // 新名称
})
```

### 添加成员

```typescript
addTagObjectsApi({
  tag_id: string,
  object_type: 'branch' | 'area' | 'user' | 'resident',
  objects: [{ object_id: string, object_name: string }]
})
```

### 删除成员

```typescript
removeTagObjectsApi({
  tag_id: string,
  object_type: string,
  object_ids: string[]
})
```

### 删除 Tag

```typescript
deleteTagApi({
  tenant_id: string,
  tag_name: string
})
```

---

## 九、特殊规则总结

1. **Branch Tag 和 Area Tag 的特殊性**
   - `tag_name` 固定，不可修改
   - 只有一个记录，所有成员存储在 `tag_objects` 中
   - Branch 的删除需要管理员权限

2. **User Tag 和 Family Tag 的特殊性**
   - `tag_name` 可编辑
   - 可以有多个记录
   - 支持批量编辑成员（复选框）

3. **删除保护**
   - 有成员的 Tag 不能删除
   - 必须先清空所有成员才能删除 Tag

4. **权限控制**
   - Branch 的创建和删除需要管理员权限
   - 其他操作所有有权限的用户都可以执行
