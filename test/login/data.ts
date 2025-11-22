/**
 * Login 页面测试数据
 * 对应 src/views/login/Login.vue
 */

import type { LoginResult, Institution } from '@/api/auth/model/authModel'

/**
 * 搜索机构 API 测试数据
 */

// 机构定义（对应 tenants 表）
// 注意：根据 ../owlRD/db/01_tenants.sql，tenants 表只有 tenant_id, tenant_name, domain, status 字段
export const institutions = {
  sunset: {
    id: '550e8400-e29b-41d4-a716-446655440000', // UUID 格式
    name: 'Sunset Care Center',
    domain: 'sunset-care.com',
  },
  golden: {
    id: '660e8400-e29b-41d4-a716-446655440001', // UUID 格式
    name: 'Golden Care Center',
    domain: 'goldenyears.com',
  },
  winds: {
    id: '770e8400-e29b-41d4-a716-446655440002', // UUID 格式
    name: 'Winds Care Center',
    domain: 'winds-care.com',
  },
}

// 场景1: 单个机构匹配（Staff S1 → Sunset）
export const singleInstitutionStaff: Institution[] = [
  {
    id: institutions.sunset.id,
    name: institutions.sunset.name,
    domain: institutions.sunset.domain,
  },
]

// 场景2: 多个机构匹配（Staff S2 → Sunset + Golden）
export const multipleInstitutionsStaff: Institution[] = [
  {
    id: institutions.sunset.id,
    name: institutions.sunset.name,
    domain: institutions.sunset.domain,
  },
  {
    id: institutions.golden.id,
    name: institutions.golden.name,
    domain: institutions.golden.domain,
  },
]

// 场景3: 不同机构（Staff S3 → Winds）
export const windsInstitutionStaff: Institution[] = [
  {
    id: institutions.winds.id,
    name: institutions.winds.name,
    domain: institutions.winds.domain,
  },
]

// 场景4: 单个机构匹配（Resident R1 → Sunset）
export const singleInstitutionResident: Institution[] = [
  {
    id: institutions.sunset.id,
    name: institutions.sunset.name,
    domain: institutions.sunset.domain,
  },
]

// 场景5: 多个机构匹配（Resident R2 → Sunset + Golden）
export const multipleInstitutionsResident: Institution[] = [
  {
    id: institutions.sunset.id,
    name: institutions.sunset.name,
    domain: institutions.sunset.domain,
  },
  {
    id: institutions.golden.id,
    name: institutions.golden.name,
    domain: institutions.golden.domain,
  },
]

// 场景6: 不同机构（Resident R3 → Winds）
export const windsInstitutionResident: Institution[] = [
  {
    id: institutions.winds.id,
    name: institutions.winds.name,
    domain: institutions.winds.domain,
  },
]

// 场景5: 无匹配机构
export const noInstitutions: Institution[] = []

/**
 * 登录 API 测试数据
 */

// 成功场景：Staff 登录
export const loginSuccessStaff: LoginResult = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token-staff',
  refreshToken: 'refresh-token-staff-12345',
  userId: 'user-001',
  user_account: 'S1', // 用户账号（非敏感，用于显示和标识）
  userType: 'staff',
  tenant_id: institutions.sunset.id, // UUID 格式
  tenant_name: institutions.sunset.name,
  role: 'Nurse',
  nickName: 'John Doe',
  homePath: '/dashboard',
}

// 成功场景：Resident 登录
export const loginSuccessResident: LoginResult = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token-resident',
  refreshToken: 'refresh-token-resident-12345',
  userId: 'resident-001',
  user_account: 'R1', // 用户账号（非敏感，用于显示和标识）
  userType: 'resident',
  tenant_id: institutions.sunset.id, // UUID 格式
  tenant_name: institutions.sunset.name,
  homePath: '/resident/dashboard',
}

// 失败场景：密码错误
export const loginErrorWrongPassword = {
  code: 401,
  message: 'Invalid password',
  type: 'error',
}

// 失败场景：账号不存在
export const loginErrorAccountNotFound = {
  code: 404,
  message: 'Account not found',
  type: 'error',
}

// 失败场景：账号已禁用
export const loginErrorAccountDisabled = {
  code: 403,
  message: 'Account is disabled',
  type: 'error',
}

// 失败场景：机构不匹配
export const loginErrorInstitutionMismatch = {
  code: 400,
  message: 'Institution mismatch',
  type: 'error',
}

/**
 * 测试账号数据
 * 完整参考表请查看：test/login/TEST_ACCOUNTS.md
 */

// 统一测试密码
// 注意：S1, S2, R1, R2 使用 correct，S3, R3 使用 alternative（用于测试相同 username 但不同密码的场景）
export const testPasswords = {
  correct: 'Ts123@123',      // S1, S2, R1, R2 使用此密码
  alternative: 'Ts123@121',  // S3, R3 使用此密码（相同 username 但不同密码）
  wrong: 'WrongPassword123!',
}

/**
 * 测试账号完整列表
 * 
 * Type | User | Username/Phone/Email | Password | Institution
 * Staff | S1 | S1 / 720101101 / s1@test.com | Ts123@123 | Sunset
 * Staff | S2 | S2 / 720101102 / s2@test.com | Ts123@123 | Sunset + Golden (跨机构)
 * Staff | S3 | S2 / 720101103 / s3@test.com | Ts123@121 | Winds
 * Resident | R1 | R1 / 82010101 / R1@test.com | Ts123@123 | Sunset
 * Resident | R2 | R2 / 82010102 / R2@test.com | Ts123@123 | Sunset + Golden (跨机构)
 * Resident | R3 | R2 / 82010103 / R3@test.com | Ts123@121 | Winds
 */
export const testAccounts = {
  staff: {
    // S1: 单个机构（Sunset）
    s1: {
      username: 'S1',
      phone: '720101101',
      email: 's1@test.com',
      password: 'Ts123@123',
      institution: 'Sunset',
      institutionId: institutions.sunset.id, // UUID 格式
    },
    // S2: 多个机构（Sunset + Golden）- 跨机构账号
    s2: {
      username: 'S2',
      phone: '720101102',
      email: 's2@test.com',
      password: 'Ts123@123',
      institutions: ['Sunset', 'Golden'],
      institutionIds: [institutions.sunset.id, institutions.golden.id], // UUID 格式
    },
    // S3: 不同机构（Winds）- 注意：username 相同但 password 不同
    s3: {
      username: 'S2', // 与 S2 相同
      phone: '720101103',
      email: 's3@test.com',
      password: 'Ts123@121', // 与 S2 不同
      institution: 'Winds',
      institutionId: institutions.winds.id, // UUID 格式
    },
    // 兼容旧版本的测试账号（保留）
    singleInstitution: 's1@test.com', // S1
    multipleInstitutions: 's2@test.com', // S2
    notFound: 'notfound@example.com',
    disabled: 'disabled@example.com',
  },
  resident: {
    // R1: 单个机构（Sunset）
    r1: {
      account: 'R1',
      phone: '82010101',
      email: 'R1@test.com',
      password: 'Ts123@123',
      institution: 'Sunset',
      institutionId: institutions.sunset.id, // UUID 格式
    },
    // R2: 多个机构（Sunset + Golden）- 跨机构账号
    r2: {
      account: 'R2',
      phone: '82010102',
      email: 'R2@test.com',
      password: 'Ts123@123',
      institutions: ['Sunset', 'Golden'],
      institutionIds: [institutions.sunset.id, institutions.golden.id], // UUID 格式
    },
    // R3: 不同机构（Winds）- 注意：username 相同但 password 不同
    r3: {
      account: 'R2', // 与 R2 相同
      phone: '82010103',
      email: 'R3@test.com',
      password: 'Ts123@121', // 与 R2 不同
      institution: 'Winds',
      institutionId: institutions.winds.id, // UUID 格式
    },
    // 兼容旧版本的测试账号（保留）
    singleInstitution: 'R1@test.com', // R1
    multipleInstitutions: 'R2@test.com', // R2
    notFound: 'notfound@example.com',
  },
}


