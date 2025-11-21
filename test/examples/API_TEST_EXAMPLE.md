# API 测试示例

## 示例：Login API 测试

### 文件结构

```
test/login/
├── data.ts        # 测试数据
├── api.ts         # API 响应格式
├── mock.ts        # Mock 函数
└── index.ts       # 统一导出
```

### 1. 测试数据 (data.ts)

```typescript
import type { Institution, LoginResult } from '@/api/auth/model/authModel'

// 机构测试数据
export const singleInstitutionStaff: Institution[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Sunset Care Center',
    domain: 'sunset-care.com',
  },
]

// 登录结果测试数据
export const loginSuccessStaff: LoginResult = {
  accessToken: 'mock-token-123',
  refreshToken: 'mock-refresh-123',
  userId: 'user-s1',
  userType: 'staff',
  institutionId: 'tenant-001',
  institutionName: 'Sunset',
  role: 'Nurse',
  username: 'usernameS1',
  email: 's1@test.com',
  phone: '720101101',
}

// 测试账号
export const testAccounts = {
  staff: {
    s1: {
      username: 'usernameS1',
      phone: '720101101',
      email: 's1@test.com',
      password: 'Ts123@123',
    },
  },
}
```

### 2. API 响应格式 (api.ts)

```typescript
import type { Institution, LoginResult } from '@/api/auth/model/authModel'

/**
 * API 响应格式模板
 * 与数据库字段对应关系：
 * - Institution.id → tenants.id
 * - Institution.name → tenants.name
 * - LoginResult.userId → users.id
 * - LoginResult.institutionId → users.tenant_id
 */
export const institutionResponseTemplate: Institution = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Sunset Care Center',
  domain: 'sunset-care.com',
}

export const loginResponseTemplate: LoginResult = {
  accessToken: 'string',
  refreshToken: 'string',
  userId: 'string',
  userType: 'staff',
  institutionId: 'string',
  institutionName: 'string',
  role: 'string', // Staff only
  username: 'string', // Staff only
  email: 'string', // Staff only
  phone: 'string', // Staff only
}
```

### 3. Mock 函数 (mock.ts)

```typescript
import type { LoginParams, LoginResult, Institution } from '@/api/auth/model/authModel'
import { delay } from '../utils/generator'
import { singleInstitutionStaff, loginSuccessStaff, testAccounts } from './data'

/**
 * Mock: 搜索机构 API
 * 注意：需要同时提供 account 和 password，因为相同 username 可能对应不同密码和机构
 */
export async function mockSearchInstitutions(
  account: string,
  password: string,
  userType: 'staff' | 'resident',
): Promise<Institution[]> {
  await delay(300) // 模拟网络延迟
  
  if (account === testAccounts.staff.s1.email && 
      password === testAccounts.staff.s1.password && 
      userType === 'staff') {
    return singleInstitutionStaff
  }
  
  return []
}

/**
 * Mock: 登录 API
 */
export async function mockLogin(params: LoginParams): Promise<LoginResult> {
  await delay(500) // 模拟网络延迟
  
  if (
    params.account === testAccounts.staff.s1.email &&
    params.password === testAccounts.staff.s1.password &&
    params.userType === 'staff'
  ) {
    return loginSuccessStaff
  }
  
  throw new Error('Invalid credentials')
}
```

### 4. 统一导出 (index.ts)

```typescript
export * from './data'
export * from './api'
export * from './mock'
```

### 5. 在 API 函数中使用

```typescript
// src/api/auth/auth.ts
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

export function loginApi(params: LoginParams) {
  if (useMock) {
    return import('@/test/index.ts').then(({ login }) => {
      return login.mockLogin(params)
    })
  }
  
  return defHttp.post({ url: Api.Login, params })
}
```

### 6. 单元测试

```typescript
// test/login.test.ts
import { describe, it, expect } from 'vitest'
import { login } from './index'

describe('Login API Mock', () => {
  it('should search institutions', async () => {
    const result = await login.mockSearchInstitutions('s1@test.com', 'Ts123@123', 'staff')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Sunset')
  })
  
  it('should login successfully', async () => {
    const result = await login.mockLogin({
      account: 's1@test.com',
      password: 'Ts123@123',
      userType: 'staff',
      institutionId: 'tenant-001',
    })
    
    expect(result.userType).toBe('staff')
    expect(result.institutionId).toBe('tenant-001')
  })
  
  it('should fail with wrong password', async () => {
    await expect(
      login.mockLogin({
        account: 's1@test.com',
        password: 'wrong',
        userType: 'staff',
        institutionId: 'tenant-001',
      })
    ).rejects.toThrow('Invalid credentials')
  })
})
```

## 最佳实践

1. **数据与 API 分离**
   - `data.ts` 存储测试数据
   - `api.ts` 定义 API 响应格式
   - `mock.ts` 实现 Mock 逻辑

2. **保持字段一致性**
   - 测试数据字段必须与数据库字段一致
   - 参考 `docs/api/auth-api.md` 了解字段映射

3. **模拟真实场景**
   - 添加网络延迟（`delay()`）
   - 覆盖成功和失败场景
   - 处理边界情况

4. **统一导出**
   - 通过 `index.ts` 统一导出
   - 在 `test/index.ts` 中再次导出

5. **文档化**
   - 为每个测试模块创建 `TEST_ACCOUNTS.md`
   - 记录测试账号和场景说明

