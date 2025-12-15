# Tag 权限表

## 权限定义

- **Admin**: 角色为 `Admin`
- **Manager**: 角色为 `Manager`
- **canManageBranch**: `isAdmin` (只有 Admin)
- **canManageOtherTags**: `isManager || isAdmin` (Manager 或 Admin)

---

## 权限表

| Tag 类型 | 操作 | 所需权限 | 代码检查位置 | 说明 |
|---------|------|---------|------------|------|
| **branch_tag** | 创建 Tag | ✅ **Admin** | `handleCreateBranch`<br>`canManageBranch` | 输入框和按钮都禁用 |
| | 创建成员 (Branch) | ✅ **Admin** | `handleCreateBranch`<br>`canManageBranch` | 通过创建流程添加成员 |
| | 删除成员 (Branch) | ✅ **Admin** | `deleteObjectFromTag`<br>`canManageBranch` | 删除按钮禁用，点击显示警告 |
| | 编辑 Tag Name | ❌ **不支持** | - | `tag_name` 固定为 "Branch"，不可编辑 |
| | 删除 Tag | ❌ **不支持** | - | 系统固定 Tag，不能删除整条记录 |
| **area_tag** | 创建 Tag | ✅ **Manager 或 Admin** | `handleCreateArea`<br>`canManageOtherTags` | 输入框和按钮都禁用 |
| | 创建成员 (Area) | ✅ **Manager 或 Admin** | `handleCreateArea`<br>`canManageOtherTags` | 通过创建流程添加成员 |
| | 删除成员 (Area) | ✅ **Manager 或 Admin** | `deleteObjectFromTag`<br>`canManageOtherTags` | 删除按钮禁用，点击显示警告 |
| | 编辑 Tag Name | ❌ **不支持** | - | `tag_name` 固定为 "Area"，不可编辑 |
| | 删除 Tag | ❌ **不支持** | - | 系统固定 Tag，不能删除整条记录 |
| **user_tag** | 创建 Tag | ✅ **Manager 或 Admin** | `handleCreateUserTag`<br>`canManageOtherTags` | 输入框和按钮都禁用 |
| | 创建成员 (User) | ✅ **Manager 或 Admin** | `handleSaveAll`<br>`canManageOtherTags` | 通过复选框选择，Save 按钮保存 |
| | 删除成员 (User) | ✅ **Manager 或 Admin** | `handleSaveAll`<br>`canManageOtherTags` | 通过复选框取消选择，Save 按钮保存 |
| | 编辑 Tag Name | ❌ **未实现** | - | 当前代码中 tag_name 为只读显示，未实现编辑功能 |
| | 删除 Tag | ✅ **Manager 或 Admin** | `deleteTagName`<br>`canManageOtherTags` | 仅当 `tag_objects` 为空时，删除图标才显示 |
| **family_tag** | 创建 Tag | ✅ **Manager 或 Admin** | `handleCreateFamily`<br>`canManageOtherTags` | 输入框和按钮都禁用 |
| | 创建成员 (Resident) | ✅ **Manager 或 Admin** | `handleSaveAll`<br>`canManageOtherTags` | 通过复选框选择，Save 按钮保存 |
| | 删除成员 (Resident) | ✅ **Manager 或 Admin** | `handleSaveAll`<br>`canManageOtherTags` | 通过复选框取消选择，Save 按钮保存 |
| | 编辑 Tag Name | ❌ **未实现** | - | 当前代码中 tag_name 为只读显示，未实现编辑功能 |
| | 删除 Tag | ✅ **Manager 或 Admin** | `deleteTagName`<br>`canManageOtherTags` | 仅当 `tag_objects` 为空时，删除图标才显示 |

---

## 详细权限检查点

### 1. Branch Tag (branch_tag)

#### 创建操作
- **函数**: `handleCreateBranch()`
- **权限检查**: `canManageBranch` (第 22, 29 行)
- **UI 控制**: 
  - 输入框: `:disabled="!canManageBranch"`
  - 按钮: `:disabled="!canManageBranch"`
- **权限要求**: ✅ **Admin**

#### 删除成员操作
- **函数**: `deleteObjectFromTag()` (第 992-1006 行)
- **权限检查**: 
  ```javascript
  if (record.tag_type === 'branch_tag' && !canManageBranch.value) {
    message.warning('Only administrators can delete branch')
    return
  }
  ```
- **UI 控制**: 
  - 删除按钮: `:class="{ 'disabled': record.tag_type === 'branch_tag' && !canManageBranch }"`
  - Tooltip: 显示 "Only administrators can delete branch"
- **权限要求**: ✅ **Admin**

---

### 2. Area Tag (area_tag)

#### 创建操作
- **函数**: `handleCreateArea()`
- **权限检查**: `canManageOtherTags` (第 37, 40 行)
- **UI 控制**: 
  - 输入框: `:disabled="!canManageOtherTags"`
  - 按钮: `:disabled="!canManageOtherTags"`
- **权限要求**: ✅ **Manager 或 Admin**

#### 删除成员操作
- **函数**: `deleteObjectFromTag()` (第 1003-1006 行)
- **权限检查**: 
  ```javascript
  if (record.tag_type === 'area_tag' && !canManageOtherTags.value) {
    message.warning('Only Manager or Admin can delete area')
    return
  }
  ```
- **UI 控制**: 
  - 删除按钮: `:class="{ 'disabled': record.tag_type === 'area_tag' && !canManageOtherTags }"`
  - Tooltip: 显示 "Only Manager or Admin can delete area"
- **权限要求**: ✅ **Manager 或 Admin**

---

### 3. User Tag (user_tag)

#### 创建操作
- **函数**: `handleCreateUserTag()`
- **权限检查**: `canManageOtherTags` (第 45, 48 行)
- **UI 控制**: 
  - 输入框: `:disabled="!canManageOtherTags"`
  - 按钮: `:disabled="!canManageOtherTags"`
- **权限要求**: ✅ **Manager 或 Admin**

#### 编辑成员操作
- **函数**: `handleSaveAll()` (第 913-989 行)
- **权限检查**: 
  ```javascript
  if (!canManageOtherTags.value) {
    message.warning('Only Manager or Admin can edit tags')
    return
  }
  ```
- **UI 控制**: 
  - Save 按钮: `:disabled="!canManageOtherTags"`
  - Cancel 按钮: `:disabled="!canManageOtherTags"`
- **权限要求**: ✅ **Manager 或 Admin**

#### 删除 Tag 操作
- **函数**: `deleteTagName()` (第 784-815 行)
- **权限检查**: 
  ```javascript
  if (!canManageOtherTags.value) {
    message.warning('Only Manager or Admin can delete tags')
    return
  }
  ```
- **UI 控制**: 
  - 删除图标: `v-if="!hasObjects(record) && (record.tag_type === 'user_tag' || record.tag_type === 'family_tag') && canManageOtherTags"`
  - 仅当无成员且有权时才显示
- **权限要求**: ✅ **Manager 或 Admin**

#### 编辑 Tag Name 操作
- **函数**: `updateTagApi()` (已导入但未使用)
- **权限检查**: 未实现
- **权限要求**: ❌ **未实现** - 当前 tag_name 列为只读显示，无编辑功能

---

### 4. Family Tag (family_tag)

#### 创建操作
- **函数**: `handleCreateFamily()`
- **权限检查**: `canManageOtherTags` (第 53, 56 行)
- **UI 控制**: 
  - 输入框: `:disabled="!canManageOtherTags"`
  - 按钮: `:disabled="!canManageOtherTags"`
- **权限要求**: ✅ **Manager 或 Admin**

#### 编辑成员操作
- **函数**: `handleSaveAll()` (第 913-989 行)
- **权限检查**: 
  ```javascript
  if (!canManageOtherTags.value) {
    message.warning('Only Manager or Admin can edit tags')
    return
  }
  ```
- **UI 控制**: 
  - Save 按钮: `:disabled="!canManageOtherTags"`
  - Cancel 按钮: `:disabled="!canManageOtherTags"`
- **权限要求**: ✅ **Manager 或 Admin**

#### 删除 Tag 操作
- **函数**: `deleteTagName()` (第 784-815 行)
- **权限检查**: 
  ```javascript
  if (!canManageOtherTags.value) {
    message.warning('Only Manager or Admin can delete tags')
    return
  }
  ```
- **UI 控制**: 
  - 删除图标: `v-if="!hasObjects(record) && (record.tag_type === 'user_tag' || record.tag_type === 'family_tag') && canManageOtherTags"`
  - 仅当无成员且有权时才显示
- **权限要求**: ✅ **Manager 或 Admin**

#### 编辑 Tag Name 操作
- **函数**: `updateTagApi()` (已导入但未使用)
- **权限检查**: 未实现
- **权限要求**: ❌ **未实现** - 当前 tag_name 列为只读显示，无编辑功能

---

## 权限检查代码位置汇总

### 权限定义 (第 245-248 行)
```typescript
const isAdmin = computed(() => currentUserRole.value === 'Admin')
const isManager = computed(() => currentUserRole.value === 'Manager')
const canManageBranch = computed(() => isAdmin.value) // Only Admin
const canManageOtherTags = computed(() => isManager.value || isAdmin.value) // Manager or Admin
```

### 创建操作权限检查
- Branch: 第 22, 29 行 - `canManageBranch`
- Area: 第 37, 40 行 - `canManageOtherTags`
- User Tag: 第 45, 48 行 - `canManageOtherTags`
- Family Tag: 第 53, 56 行 - `canManageOtherTags`

### 删除成员操作权限检查
- Branch: 第 999-1002 行 - `canManageBranch`
- Area: 第 1003-1006 行 - `canManageOtherTags`

### 编辑成员操作权限检查
- User/Family: 第 917-920 行 - `canManageOtherTags` (Save 按钮)
- Save/Cancel 按钮: 第 111, 112 行 - `canManageOtherTags`

### 删除 Tag 操作权限检查
- User/Family: 第 785-789 行 - `canManageOtherTags`
- 删除图标显示: 第 126 行 - `canManageOtherTags`

---

## 待完善的权限检查

1. **Tag Name 编辑功能**: `updateTagApi` 已导入但未使用，tag_name 列为只读显示，如需实现编辑功能需要：
   - 添加编辑 UI（双击或编辑按钮）
   - 添加权限检查 `canManageOtherTags`
   - 调用 `updateTagApi` 保存修改
2. **查看权限**: 目前所有用户都可以查看 Tag，如果需要限制查看权限，需要添加相应检查

---

## 权限验证清单

- ✅ Branch 创建: 只有 Admin
- ✅ Branch 删除成员: 只有 Admin
- ✅ Area 创建: Manager 或 Admin
- ✅ Area 删除成员: Manager 或 Admin
- ✅ User Tag 创建: Manager 或 Admin
- ✅ User Tag 编辑成员: Manager 或 Admin
- ✅ User Tag 删除: Manager 或 Admin
- ✅ Family Tag 创建: Manager 或 Admin
- ✅ Family Tag 编辑成员: Manager 或 Admin
- ✅ Family Tag 删除: Manager 或 Admin
- ❌ Tag Name 编辑: 未实现（当前为只读显示）
