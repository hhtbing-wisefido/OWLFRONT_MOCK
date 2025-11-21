# 测试数据目录

本目录用于存储各 API 模块的测试数据和 Mock 函数，采用 **API 测试模式**。

## 目录结构

```
test/
├── login/                    # Login API 测试数据
│   ├── data.ts              # 测试数据（机构、账号、响应等）
│   ├── api.ts               # API 响应格式模板
│   ├── mock.ts              # Mock 函数（模拟 API 调用）
│   ├── index.ts             # 统一导出
│   └── TEST_ACCOUNTS.md     # 测试账号参考表
├── resident/                # Resident API 测试数据（待开发）
│   └── index.ts
├── staff/                   # Staff API 测试数据（待开发）
│   └── index.ts
├── utils/                   # 测试工具函数
│   └── generator.ts         # 数据生成器
├── examples/                # 使用示例
│   └── login.test.example.ts
├── index.ts                 # 统一导出入口
├── setup.ts                 # 测试环境配置
└── README.md                # 本文件
```

## API 测试模式

### 核心原则

**一个 API 模块 = 一个测试模块**

例如：
- `src/api/auth/auth.ts` → `test/login/`
- `src/api/resident/resident.ts` → `test/resident/`
- `src/api/staff/staff.ts` → `test/staff/`

### 文件说明

每个 API 测试模块包含：

1. **`data.ts`** - 测试数据
   - 测试账号、密码
   - 机构数据
   - 登录结果数据
   - 错误场景数据

2. **`api.ts`** - API 响应格式模板
   - 定义标准 API 响应结构
   - 与数据库字段对应关系
   - 响应示例

3. **`mock.ts`** - Mock 函数
   - `mockSearchInstitutions()` - 模拟机构搜索 API
   - `mockLogin()` - 模拟登录 API
   - 其他 API Mock 函数

4. **`index.ts`** - 统一导出
   - 导出所有测试数据和 Mock 函数

## 使用方式

### 1. 在 API 函数中使用 Mock

```typescript
// src/api/auth/auth.ts
import { defHttp } from '@/utils/http/axios'

const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

export function loginApi(params: LoginParams) {
  // 开发环境：使用 Mock 数据
  if (useMock) {
    return import('@/test/index.ts').then(({ login }) => {
      return login.mockLogin(params)
    })
  }
  
  // 生产环境：调用真实 API
  return defHttp.post({ url: Api.Login, params })
}
```

### 2. 在单元测试中使用

```typescript
// test/login.test.ts
import { describe, it, expect } from 'vitest'
import { login } from './index'

describe('Login API Mock', () => {
  it('should search institutions', async () => {
    const result = await login.mockSearchInstitutions('s1@test.com', 'staff')
    expect(result.length).toBeGreaterThan(0)
  })
  
  it('should login successfully', async () => {
    const result = await login.mockLogin({
      account: 's1@test.com',
      password: 'Ts123@123',
      userType: 'staff',
      institutionId: 'tenant-001',
    })
    expect(result.userType).toBe('staff')
  })
})
```

### 3. 在组件测试中使用

```typescript
// src/views/login/__tests__/LoginForm.test.ts
import { vi } from 'vitest'
import * as authApi from '@/api/auth/auth'

// Mock API 调用
vi.mock('@/api/auth/auth', () => ({
  searchInstitutionsApi: vi.fn(),
  loginApi: vi.fn(),
}))
```

## 测试账号

完整测试账号列表请查看：`test/login/TEST_ACCOUNTS.md`

### 快速参考

| Type | User | Username/Phone/Email | Password | Institution |
|------|------|---------------------|----------|-------------|
| Staff | S1 | S1 / 720101101 / s1@test.com | Ts123@123 | Sunset |
| Staff | S2 | S2 / 720101102 / s2@test.com | Ts123@123 | Sunset + Golden |
| Staff | S3 | S2 / 720101103 / s3@test.com | Ts123@121 | Winds |
| Resident | R1 | customR1 / 820111222 / R1@test.com | Ts123@123 | Sunset |
| Resident | R2 | customR2 / 820111223 / R2@test.com | Ts123@123 | Sunset + Golden |
| Resident | R3 | customR3 / 820111224 / R3@test.com | Ts123@123 | Winds |

## 添加新 API 测试模块

### 步骤 1: 创建模块目录

```bash
mkdir -p test/new-api
```

### 步骤 2: 创建测试文件

```typescript
// test/new-api/data.ts
export const testData = { ... }

// test/new-api/api.ts
export const apiResponseTemplate = { ... }

// test/new-api/mock.ts
export async function mockNewApi(params: any) {
  await delay(300)
  return { ... }
}

// test/new-api/index.ts
export * from './data'
export * from './api'
export * from './mock'
```

### 步骤 3: 在 `test/index.ts` 中导出

```typescript
export * as newApi from './new-api'
```

### 步骤 4: 在 API 函数中使用

```typescript
// src/api/new-api/newApi.ts
export function newApi(params: any) {
  if (useMock) {
    return import('@/test/index.ts').then(({ newApi }) => {
      return newApi.mockNewApi(params)
    })
  }
  return defHttp.get({ url: Api.NewApi, params })
}
```

## 重要说明

1. **API 字段必须与数据库字段保持一致**
   - 参考 `docs/api/auth-api.md` 了解字段映射关系
   - 参考 `docs/api/API_DESIGN_PRINCIPLES.md` 了解 API 设计原则

2. **Mock 仅在开发环境启用**
   - 生产环境自动禁用
   - 通过 `VITE_USE_MOCK=false` 可手动禁用

3. **测试数据不应包含敏感信息**
   - 使用占位符或测试数据
   - 不要使用真实用户密码、token 等

4. **保持测试数据与 API 规范同步**
   - 当后端 API 规范变更时，及时更新测试数据
   - 测试数据应覆盖所有业务场景

## 相关文档

- **测试账号参考**: `test/login/TEST_ACCOUNTS.md`
- **API 设计原则**: `docs/api/API_DESIGN_PRINCIPLES.md`
- **Auth API 规范**: `docs/api/auth-api.md`
- **登录流程设计**: `docs/login.md`
