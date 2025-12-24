# AccountSettings API 实施验证文档

## 1. 根据代码反向生成的逻辑

### 1.1 文件结构

**已创建文件：**
- ✅ `/src/api/account/model/accountSettingsModel.ts` - TypeScript 类型定义
- ✅ `/src/api/account/accountSettings.ts` - 统一 API 函数

**已修改文件：**
- ✅ `/src/components/layout/Sidebar.vue` - 使用新的统一 API
- ✅ `/src/api/admin/user/user.ts` - 注释掉旧的 AccountSettings 函数
- ✅ `/src/api/resident/resident.ts` - 注释掉旧的 AccountSettings 函数

### 1.2 类型定义（实际实现）

#### AccountSettings 接口
```typescript
export interface AccountSettings {
  id: string                    // UUID: account_id
  account?: string              // staff: user_account, resident: resident_account
  nickname: string              // 昵称
  email?: string                // 邮箱（可选）
  phone?: string                // 电话（可选）
  save_email?: boolean          // 是否保存 email 明文
  save_phone?: boolean          // 是否保存 phone 明文
  role: string                  // 角色代码
}
```

#### UpdateAccountSettingsParams 接口
```typescript
export interface UpdateAccountSettingsParams {
  password_hash?: string
  email?: string | null
  email_hash?: string
  phone?: string | null
  phone_hash?: string
  save_email?: boolean
  save_phone?: boolean
}
```

#### UpdateAccountSettingsResponse 接口
```typescript
export interface UpdateAccountSettingsResponse {
  success: boolean
  message?: string
}
```

### 1.3 API 路径选择逻辑（实际实现）

**路径枚举：**
- `UserGet` = `/admin/api/v1/users/:id/account-settings`
- `UserUpdate` = `/admin/api/v1/users/:id/account-settings`
- `ResidentGet` = `/admin/api/v1/residents/:id/account-settings`
- `ResidentUpdate` = `/admin/api/v1/residents/:id/account-settings`
- `ContactGet` = `/admin/api/v1/contacts/:id/account-settings`
- `ContactUpdate` = `/admin/api/v1/contacts/:id/account-settings`

**路径选择逻辑：**
1. 从 `userStore.getUserInfo.role` 获取当前用户角色
2. 判断逻辑：
   - 如果 `role` 是 `['Admin', 'Nurse', 'Caregiver', 'IT', 'Manager']` 之一 → 使用 `UserGet/UserUpdate`
   - 如果 `role` 是 `'Family'` → 使用 `ContactGet/ContactUpdate`
   - 否则（Resident）→ 使用 `ResidentGet/ResidentUpdate`

### 1.4 Sidebar.vue 使用逻辑（实际实现）

#### loadAccountInfo 函数
1. 调用 `getAccountSettingsApi(uid)`（统一 API，自动路由）
2. 从返回的 `accountSettings` 中提取：
   - `accountSettings.id` → 未使用（但返回了）
   - `accountSettings.account` → 显示在 UI
   - `accountSettings.nickname` → 显示在 UI
   - `accountSettings.email` → 显示在 UI
   - `accountSettings.phone` → 显示在 UI
   - `accountSettings.role` → 用于判断 save 标志
3. 根据 `role` 设置 save 标志：
   - `role === 'Family'` 或 staff 角色 → `saveEmail = true, savePhone = true`
   - 否则（Resident）→ 使用 API 返回的 `save_email` 和 `save_phone`

#### submitAccountSettings 函数
1. 验证密码（如果提供）
2. 构建 `updateParams`：
   - `password_hash`（如果提供密码）
   - `email` 和 `email_hash`（如果提供 email）
   - `phone` 和 `phone_hash`（如果提供 phone）
3. 根据 `role` 添加 save 标志：
   - 如果不是 staff 且不是 contact（即 Resident）→ 添加 `save_email` 和 `save_phone`
   - Staff 和 Contact 的 save 标志在 `updateAccountSettingsApi` 中自动设置为 true
4. 调用 `updateAccountSettingsApi(uid, updateParams)`（统一 API，自动路由）

## 2. 与设计文档的对比

### 2.1 类型定义 ✅
- ✅ `id` 字段：已实现
- ✅ `account` 字段：已实现
- ✅ `nickname` 字段：已实现
- ✅ `email` 字段：已实现
- ✅ `phone` 字段：已实现
- ✅ `save_email` 字段：已实现
- ✅ `save_phone` 字段：已实现
- ✅ `role` 字段：已实现

### 2.2 API 路径 ✅
- ✅ 3 组路径：user, resident, contact
- ✅ 根据 role 自动选择路径

### 2.3 函数实现 ✅
- ✅ `getAccountSettingsApi`：已实现，根据 role 自动路由
- ✅ `updateAccountSettingsApi`：已实现，根据 role 自动路由，自动设置 save 标志

### 2.4 Sidebar.vue 使用 ✅
- ✅ 使用统一的 `getAccountSettingsApi`
- ✅ 使用统一的 `updateAccountSettingsApi`
- ✅ 移除了 `userType` 判断逻辑
- ✅ 根据返回的 `role` 设置 save 标志

### 2.5 旧函数处理 ✅
- ✅ `user.ts` 中的函数已注释并标记 `@deprecated`
- ✅ `resident.ts` 中的函数已注释并标记 `@deprecated`

## 3. 待后端实现

**需要后端添加 Contact 的 AccountSettings 路径：**
- `/admin/api/v1/contacts/:id/account-settings` (GET)
- `/admin/api/v1/contacts/:id/account-settings` (PUT)

**需要后端返回数据包含：**
- `id` 字段（UUID）
- `role` 字段（用于前端判断）

## 4. 验证结果

✅ **实施完成，与设计文档一致**

