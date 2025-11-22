# 登录功能设计文档

## 功能概述

登录功能支持两种用户类型（Staff 员工 / Resident 住户）登录，支持跨机构登录，当用户账号在多个机构中存在时，需要用户选择目标机构。

## 用户界面

### 登录表单字段

1. **用户类型选择**（必填）
   - Staff（员工）
   - Resident（住户）
   - 默认选择：Staff

2. **账号输入**（必填）
   - 支持格式：Username、Email、Phone
   - 占位符："Enter your credentials"

3. **密码输入**（必填）
   - 占位符："Enter your password"
   - 支持显示/隐藏密码
   - **重要**：Staff 和 Resident 都必须输入密码（HIPAA 合规要求）

4. **机构选择**（条件必填）
   - 占位符："Leave empty for auto-detection"
   - 当匹配到多个机构时，此字段变为必填
   - 当只匹配到 1 个机构时，自动填充并禁用

5. **记住我**（可选）
   - 复选框，用于保存登录状态

6. **登录按钮**
   - 文本："Sign In"
   - 提交时显示加载状态

## 登录流程

### 步骤 1：用户输入账号和密码

**触发时机：**
- 用户输入账号和密码后（实时搜索，带防抖 500ms）
- 用户类型切换时（如果账号和密码已输入，重新搜索）
- **注意**：必须同时输入账号和密码才触发搜索（用于区分相同 username 但不同密码的账号）

**前端行为：**
- 账号长度不在 1-100 字符范围内时，不触发搜索
- 密码长度不在 4-100 字符范围内时，不触发搜索
- 显示加载状态
- 调用后端搜索机构 API

**后端 API：**
- `GET /auth/api/v1/institutions/search`
- 参数：`accountHash`（账号的 SHA-256 hash）、`accountPasswordHash`（账号+密码的 SHA-256 hash）、`userType`（用户类型）
- **安全说明**：
  - **前端只传输 hash，不传输原始 PHI**（phone/email/username/password）
  - 传输通过 HTTPS 加密
  - 后端使用 hash 查询数据库，不接收原始值
  - 符合 HIPAA 合规要求

**安全措施（必须实现）：**
1. ✅ **Rate Limiting（后端实现）**：限制请求频率（每 IP 每分钟 10 次，每账号每分钟 6 次）
   - 前端不进行 rate limiting，避免影响手工测试
   - 后端返回 429 状态码时，前端显示错误提示
2. ✅ **统一响应格式**：不泄露账号是否存在的信息
3. ✅ **延迟响应**：随机延迟 100-500ms
4. ✅ **HTTPS 传输**：所有 PHI 数据通过 HTTPS 加密传输
5. ✅ **后端 Hash**：后端立即计算 hash，不存储原始 phone/email

### 步骤 2：机构匹配处理

**匹配结果处理：**

- **0 个机构匹配**
  - 不显示错误提示（不泄露账号是否存在）
  - 机构选择字段隐藏
  - 用户可以继续输入密码尝试登录

- **1 个机构匹配**
  - 自动填充机构字段
  - 机构字段禁用（显示为 "Auto-detected"）
  - 用户可以继续输入密码

- **多个机构匹配**
  - 显示机构下拉选择框
  - 机构字段变为必填
  - 显示所有匹配的机构供用户选择
  - 机构列表显示机构名称，可选显示地址信息

### 步骤 3：用户输入密码

**前端行为：**
- 验证表单必填项
- **Staff 和 Resident 都必须输入密码**（HIPAA 合规要求）
- 密码字段为必填项，不能为空

### 步骤 4：提交登录

**触发时机：**
- 用户点击 "Sign In" 按钮
- 用户在密码字段按 Enter 键

**前端验证：**
- 账号必填
- 密码必填
- 用户类型必填
- 如果匹配到多个机构，机构选择必填

**后端 API：**
- `POST /auth/api/v1/login`
- 请求体：`accountHash`（账号的 SHA-256 hash）、`accountPasswordHash`（账号+密码的 SHA-256 hash）、`userType`、`institutionId`
- **安全说明**：前端只传输 hash，不传输原始 PHI（phone/email/username/password）

**登录成功：**
- 后端返回完整的用户信息（包括 token、用户基本信息、机构信息、位置信息、首页路径等）
- 前端一次性保存所有信息到本地存储（token、用户信息、机构信息）
- 根据返回的 `homePath` 跳转到首页（如果没有 `homePath`，则跳转到默认首页）
- **注意**：登录时一次性返回完整信息，不需要额外的 `getUserInfo` API 调用

**登录失败：**
- 显示错误提示
- 不清空表单（方便用户重试）

## 前后端职责划分

### 前端职责

1. **用户交互**
   - 显示登录表单
   - 处理用户输入
   - 显示加载状态
   - 显示错误提示

2. **机构搜索**
   - 账号输入时调用搜索 API
   - 处理搜索结果（0/1/多个）
   - 显示机构选择列表

3. **表单验证（基本检查）**
   - **前端只做基本检查，不进行复杂的安全验证：**
     - **账号长度**：1 <= 长度 <= 100 个字符
       - 基于数据库约束：`user_account VARCHAR(100)`, `resident_account VARCHAR(100)`
       - 支持短用户名（如 "S2"）
       - 减少不必要的 API 请求
     - **密码长度**：4 <= 长度 <= 100 个字符
       - 基本长度检查
       - 防止空密码或过短密码
       - 基于数据库约束：`password_hash BYTEA`（前端限制 100 字符）
   - **注意：** 前端验证只是为了减少无效请求，**真正的安全验证由后端和数据库负责**。
   - 客户端必填项验证
   - 显示验证错误

4. **登录提交**
   - 调用登录 API
   - 处理登录结果
   - 保存 token
   - 页面跳转

### 后端职责

1. **机构搜索 API**
   - 接收账号和用户类型
   - 识别账号格式（email/phone/username）
   - 计算 hash（email_hash 或 phone_hash）
   - 根据用户类型查询对应表（users 或 residents）
   - 返回匹配的机构列表
   - 实现安全防护措施

2. **登录 API**
   - 接收登录参数
   - 验证账号、密码、机构匹配
   - 验证账号状态（active/disabled）
   - 生成 JWT token
   - 更新最后登录时间
   - **一次性返回完整的用户信息**（包括 token、用户基本信息、机构信息、位置信息、首页路径、头像等）
   - **注意**：登录时已经查询了用户信息，直接返回即可，避免前端需要额外的 API 调用

## 数据库查询逻辑

### 机构搜索查询

**Staff 用户：**
- 查询 `users` 表
- 匹配条件：`email_hash`、`phone_hash` 或 `username`
- 关联 `tenants` 表获取机构信息
- 只返回 `status = 'active'` 的机构

**Resident 用户：**
- 查询 `residents` 表
- 匹配条件：`email_hash`、`phone_hash` 或 `resident_account`
- 关联 `tenants` 表获取机构信息
- 只返回 `status = 'active'` 的机构和住户

### 登录验证查询

**Staff 用户：**
- 查询 `users` 表
- 验证 `password_hash`
- 验证 `status = 'active'`
- 验证 `tenant_id` 匹配

**Resident 用户：**
- 查询 `residents` 表
- **必须验证密码**（HIPAA 合规要求）
- 验证 `status = 'active'`
- 验证 `tenant_id` 匹配
- 注意：Resident 表可能没有 `password_hash` 字段，需要根据实际数据库设计实现密码验证机制

## 安全要求

### 机构搜索 API 安全

1. **Rate Limiting（后端必须实现）**
   - 每个 IP 地址：每分钟最多 10 次请求
   - 每个账号：每分钟最多 6 次查询
   - 超过限制返回 429 Too Many Requests
   - **注意**：前端不进行 rate limiting，避免影响手工测试和开发调试

2. **统一响应格式（必须）**
   - 无论账号是否存在，都返回相同的响应结构
   - 不通过响应内容泄露账号是否存在的信息
   - 没有匹配结果时返回空数组 `[]`

3. **延迟响应（推荐）**
   - 随机延迟 100-500ms
   - 防止通过响应时间判断账号是否存在

4. **日志记录（推荐）**
   - 记录所有搜索请求
   - 记录 IP 地址、账号、时间戳
   - 用于安全审计和异常检测

### 登录 API 安全

1. **密码传输安全（HIPAA 合规要求）**
   - **Staff 和 Resident 都必须验证密码**
   - **前端只传输 hash，不传输原始 PHI**：
     - 账号（phone/email/username）：传输 `accountHash`（SHA-256 hash）
     - 密码：传输 `accountPasswordHash`（SHA-256 hash of `account:password`）
   - 后端使用 hash 查询数据库，不接收原始 phone/email
   - 后端使用 bcrypt 或 Argon2 存储和验证密码
   - 不允许无密码登录（违反 HIPAA 安全规则）

2. **防暴力破解**
   - 限制登录尝试次数（如 5 次/15分钟）
   - 超过限制后锁定账号或要求验证码
   - 使用 Redis 记录失败次数

3. **Token 安全**
   - Access Token 有效期：24 小时
   - Refresh Token 有效期：7 天
   - 使用 HTTPS 传输
   - Token 存储在 HttpOnly Cookie 或内存中

4. **账号状态验证**
   - 验证账号状态为 `active`
   - 禁用或离职账号不允许登录

## 错误处理

### 机构搜索错误

- **账号格式无效**：返回 400 Bad Request
- **超过速率限制**：返回 429 Too Many Requests
- **查询出错**：返回 500 Internal Server Error
- **无匹配结果**：返回空数组 `[]`（不泄露信息）

### 登录错误

- **账号不存在**：返回 401 Unauthorized
- **密码错误**：返回 401 Unauthorized
- **账号已禁用**：返回 403 Forbidden
- **机构不匹配**：返回 400 Bad Request
- **其他错误**：返回 500 Internal Server Error

## 用户体验优化

1. **防抖处理**
   - 账号输入时使用 500ms 防抖
   - 避免频繁调用搜索 API

2. **加载状态**
   - 搜索机构时显示加载指示器
   - 登录提交时显示加载状态

3. **智能填充**
   - 单个机构匹配时自动填充
   - 多个机构匹配时显示选择列表

4. **错误提示**
   - 显示友好的错误信息
   - 不泄露系统内部信息

5. **记住我功能**
   - 保存用户选择的机构（可选）
   - 下次登录时自动填充

## 跨机构登录场景

### 场景描述

同一个账号（email/phone）可能在多个机构中存在，用户需要选择登录到哪个机构。

### 处理流程

1. 用户输入账号
2. 后端返回所有匹配的机构列表
3. 前端显示机构选择列表
4. 用户选择目标机构
5. 提交登录时携带选中的机构 ID

### 业务规则

- 每个机构是独立的租户（tenant）
- 同一账号在不同机构中可能有不同的角色和权限
- 用户需要明确选择登录到哪个机构
- 系统不自动关联跨机构账号

## 登录返回数据完整性

### 设计原则

**登录时一次性返回完整用户信息**，避免前端需要额外的 API 调用。

### 返回字段说明

登录 API 返回的 `LoginResult` 包含以下完整信息：

1. **认证信息**
   - `accessToken` - JWT Access Token
   - `refreshToken` - JWT Refresh Token

2. **用户基本信息**
   - `userId` - 用户 ID
   - `userType` - 用户类型（'staff' | 'resident'）
   - `residentType` - Resident 子类型（'home' | 'institution'，仅 Resident 需要）
   - `locationType` - Location 类型（'home' | 'institution'）
   - `role` - 角色编码（如 'Admin', 'Nurse', 'Caregiver'）
   - `nickName` - 昵称/显示名称

3. **机构信息（Tenant 表）**
   - `tenant_id` - 机构 ID（对应 tenants.tenant_id）
   - `tenant_name` - 机构名称（对应 tenants.tenant_name）
   - `domain` - 机构域名（对应 tenants.domain，可选）

4. **Location 信息（避免地址泄漏）**
   - `locationTag` - 位置标签（对应 locations.location_tag）
   - `locationName` - 位置名称（对应 locations.location_name）

5. **其他信息**
   - `homePath` - 用户首页路径（由后端根据 userType 和 role 计算，用于登录后跳转）
   - `avatar` - 头像 URL（可选，用于用户头像显示）

### 前端处理流程

1. 调用 `loginApi` → 获取完整的 `LoginResult`
2. 保存 token 到本地存储
3. 保存用户信息到 Store（包含所有字段，包括 `homePath` 和 `avatar`）
4. 保存机构信息到 Store
5. 根据 `homePath` 跳转到首页（如果没有 `homePath`，则跳转到默认首页）

### 优势

- ✅ **减少 API 调用**：登录时已经查询了用户信息，直接返回即可
- ✅ **简化前端逻辑**：不需要额外的 `getUserInfo` API 调用
- ✅ **提升用户体验**：减少等待时间
- ✅ **提高后端效率**：避免重复查询

### 注意

- 登录时返回的信息足够用于初始化和路由跳转
- 如果将来需要获取更多信息（如用户设置、偏好等），可以单独提供 `getUserInfo` API
- 但登录时返回的信息应该足够用于基本的页面展示和路由控制

## 注意事项

1. **HIPAA 合规要求**
   - **所有用户（Staff 和 Resident）都必须通过密码验证才能登录**
   - 不允许无密码或弱密码登录
   - 密码必须加密存储（bcrypt 或 Argon2）
   - 必须记录登录日志用于审计
   - 必须实现会话超时机制

2. **账号格式识别**
   - Email：包含 `@` 符号
   - Phone：纯数字或带格式（如 +1-234-567-8900）
   - Username：其他格式

3. **Hash 计算与账号规范化**
   - **Username**：转换为小写（大小写不敏感），去除空格后计算 SHA-256
   - **Email**：转换为小写（大小写不敏感，标准做法），去除空格后计算 SHA-256
   - **Phone**：去除空格后计算 SHA-256（电话号码是数字，无需转换大小写）
   - **Password**：保持原样（密码大小写敏感）
   - **重要**：统一使用小写计算 hash，确保前后端 hash 一致，避免因大小写不同导致匹配失败
   - 确保与数据库存储的 hash 格式一致

4. **机构状态**
   - 只返回 `status = 'active'` 的机构
   - 已暂停或删除的机构不显示

5. **用户状态**
   - Staff：只查询 `status = 'active'` 的用户
   - Resident：只查询 `status = 'active'` 的住户

6. **Resident 密码存储（重要）**
   - **当前数据库设计**：`residents` 表没有 `password_hash` 字段
   - **HIPAA 合规要求**：必须实现密码验证机制
   - **实现方案**：
     - 方案 A（推荐）：在 `residents` 表添加 `password_hash BYTEA` 字段
     - 方案 B：使用独立的认证表关联 `resident_id` 存储密码
     - 方案 C：使用 PIN 码（参考 `users` 表的 `pin_hash` 字段设计）
   - **注意**：无论使用哪种方案，都必须实现密码验证，不允许无密码登录
   - **密码要求**：
     - 使用 bcrypt 或 Argon2 加密存储
     - 最小长度要求（建议 8 位）
     - 密码强度验证

7. **性能优化**
   - 确保数据库索引已创建（email_hash、phone_hash）
   - 考虑使用缓存（Redis）存储机构列表
   - 查询时使用 LIMIT 限制结果数量

