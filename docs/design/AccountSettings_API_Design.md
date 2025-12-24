# AccountSettings API 设计文档

## 1. 设计原则

- **统一命名**：所有用户类型使用相同的函数名
- **统一接口**：参数和返回值结构一致
- **3 组路径**：根据 role 自动选择对应的后端路径（user/resident/contact）
- **类型安全**：完整的 TypeScript 类型定义

## 2. Vue 层设计

### 2.1 文件结构

```
/src/api/account/
  ├── accountSettings.ts          # 统一 API 函数
  └── model/
      └── accountSettingsModel.ts # TypeScript 类型定义
```

### 2.2 TypeScript 类型定义

#### AccountSettings（响应）
```typescript
export interface AccountSettings {
  id: string                    // UUID: account_id (user_id, resident_id, 或 contact_id)
  account?: string              // staff: user_account, resident: resident_account
  nickname: string              // 昵称（所有类型都有）
  email?: string                // 邮箱（可选）
  phone?: string                // 电话（可选）
  save_email?: boolean          // 是否保存 email 明文（user 一直是 true，resident 根据设置）
  save_phone?: boolean          // 是否保存 phone 明文（user 一直是 true，resident 根据设置）
  role: string                  // 角色代码：'Admin' | 'Nurse' | 'Caregiver' | 'IT' | 'Manager' | 'Resident' | 'Family'
}
```

#### UpdateAccountSettingsParams（请求参数）
```typescript
export interface UpdateAccountSettingsParams {
  password_hash?: string         // 密码 hash（可选，64 字符 hex 字符串）
  email?: string | null          // 邮箱（null 表示删除，空字符串也表示删除）
  email_hash?: string            // 邮箱 hash（前端计算的 hex 字符串）
  phone?: string | null          // 电话（null 表示删除，空字符串也表示删除）
  phone_hash?: string            // 电话 hash（前端计算的 hex 字符串）
  save_email?: boolean          // 是否保存 email 明文（user 总是 true，resident 根据用户选择）
  save_phone?: boolean          // 是否保存 phone 明文（user 总是 true，resident 根据用户选择）
}
```

#### UpdateAccountSettingsResponse（响应）
```typescript
export interface UpdateAccountSettingsResponse {
  success: boolean               // 是否成功
  message?: string               // 消息（可选）
}
```

### 2.3 API 路径设计（3 组路径）

| Role | 路径组 | GET 路径 | PUT 路径 |
|------|--------|---------|---------|
| Admin, Nurse, Caregiver, IT, Manager | user | `/admin/api/v1/users/:id/account-settings` | `/admin/api/v1/users/:id/account-settings` |
| Resident | resident | `/admin/api/v1/residents/:id/account-settings` | `/admin/api/v1/residents/:id/account-settings` |
| Family | contact | `/admin/api/v1/contacts/:id/account-settings` | `/admin/api/v1/contacts/:id/account-settings` |

### 2.4 API 函数设计

#### getAccountSettingsApi
- **功能**：获取账户设置（统一 API，根据 role 自动选择路径）
- **参数**：
  - `userId: string` - 用户 ID（可能是 user_id, resident_id, 或 contact_id）
  - `mode: ErrorMessageMode = 'modal'` - Error message mode
- **返回**：`Promise<AccountSettings>`
- **逻辑**：
  1. 从 userStore 获取当前用户的 role
  2. 根据 role 选择对应的 API 路径：
     - Staff 角色 → `/admin/api/v1/users/:id/account-settings`
     - Family 角色 → `/admin/api/v1/contacts/:id/account-settings`
     - Resident 角色 → `/admin/api/v1/residents/:id/account-settings`
  3. 调用对应的后端 API

#### updateAccountSettingsApi
- **功能**：更新账户设置（统一 API，根据 role 自动选择路径）
- **参数**：
  - `userId: string` - 用户 ID（可能是 user_id, resident_id, 或 contact_id）
  - `params: UpdateAccountSettingsParams` - 更新参数
  - `mode: ErrorMessageMode = 'modal'` - Error message mode
- **返回**：`Promise<UpdateAccountSettingsResponse>`
- **逻辑**：
  1. 从 userStore 获取当前用户的 role
  2. 根据 role 选择对应的 API 路径（同 getAccountSettingsApi）
  3. 对于 user（staff）和 contact（Family），自动设置 `save_email = true` 和 `save_phone = true`
  4. 调用对应的后端 API

### 2.5 旧函数处理

以下函数仅 Sidebar.vue 使用，将注释掉并标记为 `@deprecated`：
- `/src/api/admin/user/user.ts` 中的 `getAccountSettingsApi` 和 `updateAccountSettingsApi`
- `/src/api/resident/resident.ts` 中的 `getResidentAccountSettingsApi` 和 `updateResidentAccountSettingsApi`

### 2.6 使用示例

```typescript
import { getAccountSettingsApi, updateAccountSettingsApi } from '@/api/account/accountSettings'

// 获取账户设置
const accountSettings = await getAccountSettingsApi(userId)
// accountSettings.id, accountSettings.account, accountSettings.nickname, 
// accountSettings.email, accountSettings.phone, accountSettings.save_email, 
// accountSettings.save_phone, accountSettings.role

// 更新账户设置
const result = await updateAccountSettingsApi(userId, {
  password_hash: '...',
  email: 'new@example.com',
  email_hash: '...',
  phone: '1234567890',
  phone_hash: '...',
  save_email: true,  // 仅 resident 需要，user 和 contact 自动设为 true
  save_phone: true,  // 仅 resident 需要，user 和 contact 自动设为 true
})
```

## 3. 实施步骤

1. 创建 `/src/api/account/model/accountSettingsModel.ts`（类型定义）
2. 创建 `/src/api/account/accountSettings.ts`（统一 API 函数）
3. 修改 `/src/components/layout/Sidebar.vue`（使用新的统一 API）
4. 注释掉旧函数（在 `user.ts` 和 `resident.ts` 中）

## 4. 场景表

### 4.1 User (Staff) 场景

| 场景 | Email | Email_hash | Save_email | Service 层处理（updateUser） |
|:-----|:------|:-----------|:-----------|:----------------------------|
| **Email 改变且有效** | `"xxx@xxx.com"` (string) | `"64字符hex"` (string) | `true` | `Email = sql.NullString{String: "xxx@xxx.com", Valid: true}`<br>`EmailHash = []byte{...}` (从 hex 解码) |
| **Email=""（空字符串，删除）** | `""` (空字符串) | `""` (空字符串) | `true` | `Email = sql.NullString{String: "", Valid: true}`（Repository 层识别为删除，设置为 NULL）<br>`EmailHash = []byte{}`（空 slice，非 nil，Repository 层识别为删除，设置为 NULL） |
| **允许更新为空字符串（非删除）** | `""` (空字符串) | 字段不存在（undefined） | `true` | `Email = sql.NullString{String: "", Valid: true}`（Repository 层识别为删除，设置为 NULL）<br>不设置 `EmailHash` 字段（保留现有 hash）<br>**注意**：当前实现中，空字符串统一视为删除，不支持设置为空字符串（非 NULL） |
| **Email 改变但无效（格式错误等）** | 字段不存在（undefined） | 字段不存在（undefined） | `true` | 不设置 `Email` 字段<br>不设置 `EmailHash` 字段 |
| **Email 未改变** | 字段不存在（undefined） | 字段不存在（undefined） | `true` | 不设置 `Email` 字段<br>不设置 `EmailHash` 字段 |

**说明**：
- 对于 User (Staff)，`save_email` 恒为 `true`，与 email 字段是否存在、页面状态、原始值无关
- 在 `accountSettings.ts` 的 API 层自动设置 `save_email = true` 和 `save_phone = true`
- Service 层不处理 `save_email`，只处理 `Email` 和 `EmailHash` 字段
- 当 `req.Email != nil && *req.Email != ""` 且 `req.EmailHash == nil` 时，Service 层会自动计算 `EmailHash`
- `sql.NullString{String: "", Valid: true}` 的作用：Service 层设置，Repository 层识别为删除（执行 `UPDATE users SET email = NULL`）
- `EmailHash = []byte{}`（空 slice，非 nil）的作用：Service 层设置，Repository 层识别为删除（执行 `UPDATE users SET email_hash = NULL`）
- `EmailHash = nil` 的作用：表示不更新该字段（Repository 层不包含在 UPDATE 语句中）

### 4.2 Resident/Contact 场景

| 场景 | Email | Email_hash | Save_email | Service 层处理（updateUser） |
|:-----|:------|:-----------|:-----------|:----------------------------|
| **Email 改变且有效，Save=true** | `"xxx@xxx.com"` (string) | `"64字符hex"` (string) | `true` | `Email = sql.NullString{String: "xxx@xxx.com", Valid: true}`<br>`EmailHash = []byte{...}` (从 hex 解码) |
| **Email 改变且有效，Save=false** | 字段不存在（undefined） | `"64字符hex"` (string) | `false` | 不设置 `Email` 字段<br>`EmailHash = []byte{...}` (从 hex 解码) |
| **Email=""（空字符串，删除）** | `""` (空字符串) | `""` (空字符串) | `false` | `Email = sql.NullString{String: "", Valid: true}`（Repository 层识别为删除，设置为 NULL）<br>`EmailHash = []byte{}`（空 slice，非 nil，Repository 层识别为删除，设置为 NULL） |
| **允许更新为空字符串（非删除）** | `""` (空字符串) | 字段不存在（undefined） | `true` | `Email = sql.NullString{String: "", Valid: true}`（Repository 层识别为删除，设置为 NULL）<br>不设置 `EmailHash` 字段（保留现有 hash）<br>**注意**：当前实现中，空字符串统一视为删除，不支持设置为空字符串（非 NULL） |
| **Email 改变但无效（格式错误等）** | 字段不存在（undefined） | 字段不存在（undefined） | `false` | 不设置 `Email` 字段<br>不设置 `EmailHash` 字段 |
| **Email 未改变，Save 从 false 改为 true** | `"xxx@xxx.com"` (string) | `"64字符hex"` (string) | `true` | `Email = sql.NullString{String: "xxx@xxx.com", Valid: true}`<br>`EmailHash = []byte{...}` (从 hex 解码) |
| **Email 未改变，Save 从 true 改为 false** | `""` (空字符串) | 字段不存在（undefined） | `false` | `Email = sql.NullString{String: "", Valid: true}`（Repository 层识别为删除，设置为 NULL）<br>不设置 `EmailHash` 字段（保留现有 hash） |
| **Email 未改变，Save 未改变** | 字段不存在（undefined） | 字段不存在（undefined） | 字段不存在（undefined） | 不设置 `Email` 字段<br>不设置 `EmailHash` 字段 |

**说明**：
- 对于 Resident/Contact，`save_email` 由用户选择决定
- 当 `save_email = false` 时，不发送 `email` 字段（只发送 `email_hash` 用于登录）
- 当 `save_email = true` 时，同时发送 `email` 和 `email_hash`
- 当 `Email=""` 时，表示删除 email 和 email_hash（两者都设置为 NULL）

## 5. 验证标准

实施完成后，需要验证：
1. Sidebar.vue 可以正常获取和更新账户设置
2. 所有用户类型（staff/resident/contact）都能正常工作
3. 路径选择逻辑正确（根据 role 选择正确的路径）
4. save_email 和 save_phone 逻辑正确（user 和 contact 自动为 true）
5. 场景表中的所有场景都能正确处理

