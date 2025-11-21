# 登录 API 接口说明

## 1. 搜索机构 API

**接口**: `GET /auth/api/v1/institutions/search`

**输入参数（Query String）**:
- `accountHash` (string, 必填) - 账号的 SHA-256 hash（phone/email/username），不传输原始 PHI
- `accountPasswordHash` (string, 必填) - 账号+密码的 SHA-256 hash（格式：`sha256(account:password)`），不传输明文密码
- `userType` ('staff' | 'resident', 必填) - 用户类型

**前端计算方式**:
```typescript
const accountHash = sha256(account.toLowerCase().trim())
const accountPasswordHash = sha256(`${account.toLowerCase().trim()}:${password}`)
```

**返回数据**:
```typescript
{
  code: 200,
  result: [
    {
      id: string,        // 机构 ID（对应 tenants.tenant_id，UUID）
      name: string,      // 机构名称（对应 tenants.tenant_name，如 "Sunset Care Center"）
      domain?: string    // 机构域名（对应 tenants.domain，可选）
    }
  ],
  message: 'ok',
  type: 'success'
}
```

**示例**:
```json
{
  "code": 200,
  "result": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Sunset Care Center",
      "domain": "sunset-care.com"
    }
  ],
  "message": "ok",
  "type": "success"
}
```

**无匹配结果**:
```json
{
  "code": 200,
  "result": [],
  "message": "ok",
  "type": "success"
}
```

---

## 2. 登录 API

**接口**: `POST /auth/api/v1/login`

**输入参数（Request Body）**:
```typescript
{
  accountHash: string,          // SHA-256 hash of account (phone/email/username) - NO raw PHI
  accountPasswordHash: string,  // SHA-256 hash of account:password - NO raw password
  userType: 'staff' | 'resident',  // 用户类型
  institutionId?: string        // 机构 ID（当匹配到多个机构时必填）
}
```

**前端计算方式**:
```typescript
const accountHash = sha256(account.toLowerCase().trim())
const accountPasswordHash = sha256(`${account.toLowerCase().trim()}:${password}`)
```

**返回数据**:
```typescript
{
  code: 200,
  result: {
    accessToken: string,         // JWT Access Token
    refreshToken: string,        // JWT Refresh Token
    userId: string,              // 用户 ID
    userType: 'staff' | 'resident',  // 用户类型
    institutionId?: string,      // 机构 ID
    institutionName?: string,    // 机构名称
    
    // Staff 用户特有字段
    role?: string,               // 角色
    username?: string,           // 用户名
    email?: string,              // 邮箱
    phone?: string               // 电话
  },
  message: 'Login successful',
  type: 'success'
}
```

**成功响应示例（Staff）**:
```json
{
  "code": 200,
  "result": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-12345",
    "userId": "user-001",
    "userType": "staff",
    "institutionId": "tenant-001",
    "institutionName": "Sunset Care Center",
    "role": "admin",
    "username": "S1",
    "email": "s1@test.com",
    "phone": "720101201"
  },
  "message": "Login successful",
  "type": "success"
}
```

**成功响应示例（Resident）**:
```json
{
  "code": 200,
  "result": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-12345",
    "userId": "resident-001",
    "userType": "resident",
    "institutionId": "tenant-001",
    "institutionName": "Sunset Care Center"
  },
  "message": "Login successful",
  "type": "success"
}
```

**错误响应**:
- 密码错误: `{ code: 401, result: null, message: "Invalid password", type: "error" }`
- 账号不存在: `{ code: 404, result: null, message: "Account not found", type: "error" }`
- 账号已禁用: `{ code: 403, result: null, message: "Account is disabled", type: "error" }`
- 机构不匹配: `{ code: 400, result: null, message: "Institution mismatch", type: "error" }`

---

## 安全说明

1. **HIPAA 合规**: 只传输 hash，不传输原始 PHI（phone/email/username/password）
2. **Rate Limiting（后端实现）**: 每 IP 每分钟最多 10 次，每账号每分钟最多 6 次
   - 前端不进行 rate limiting，避免影响手工测试和开发调试
   - 后端返回 429 状态码时，前端显示错误提示
3. **统一响应格式**: 无论账号是否存在，都返回相同的响应结构
4. **延迟响应**: 随机延迟 100-500ms

---

## 状态码

- `200` - 成功
- `400` - 请求参数错误
- `401` - 未授权（密码错误）
- `403` - 禁止访问（账号已禁用）
- `404` - 资源不存在（账号不存在）
- `429` - 请求过于频繁
- `500` - 服务器内部错误

