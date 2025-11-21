/**
 * Login API Mock 函数
 * 对应 src/api/auth/auth.ts
 * 用于开发环境模拟后端 API 响应
 */

import type { LoginParams, LoginResult, Institution } from '@/api/auth/model/authModel'
import {
  singleInstitutionStaff,
  multipleInstitutionsStaff,
  windsInstitutionStaff,
  singleInstitutionResident,
  multipleInstitutionsResident,
  windsInstitutionResident,
  noInstitutions,
  loginSuccessStaff,
  loginSuccessResident,
  loginErrorAccountNotFound,
  loginErrorAccountDisabled,
  testAccounts,
} from './data'
import { delay } from '../utils/generator'

/**
 * Mock: 搜索机构 API
 * 对应 searchInstitutionsApi
 * 
 * 注意：需要同时提供 account 和 password，因为相同 username 可能对应不同密码和机构
 * 例如：S2 和 S3 都使用 username "S2"，但密码不同（Ts123@123 vs Ts123@121），对应不同机构
 * 
 * 测试账号参考：test/login/TEST_ACCOUNTS.md
 */
export async function mockSearchInstitutions(
  account: string,
  password: string,
  userType: 'staff' | 'resident',
): Promise<Institution[]> {
  // 模拟网络延迟
  await delay(300)
  
  console.log('%c[Mock] mockSearchInstitutions called', 'color: #faad14; font-weight: bold', {
    account,
    passwordLength: password.length,
    userType,
  })

  // Normalize account for case-insensitive matching (username and email)
  // Phone numbers are numeric, so toLowerCase() has no effect
  const normalizedAccount = account.trim().toLowerCase()
  
  // Staff 用户
  if (userType === 'staff') {
    // S1: S1 / 720101101 / s1@test.com | Ts123@123 → Sunset (单个)
    // Note: Username and email are case-insensitive, phone is numeric
    if (
      (normalizedAccount === testAccounts.staff.s1.username.toLowerCase() ||
        normalizedAccount === testAccounts.staff.s1.phone ||
        normalizedAccount === testAccounts.staff.s1.email.toLowerCase() ||
        normalizedAccount === testAccounts.staff.singleInstitution.toLowerCase()) &&
      password === testAccounts.staff.s1.password
    ) {
      return singleInstitutionStaff
    }

    // S2: S2 / 720101102 / s2@test.com | Ts123@123 → Sunset + Golden (多个)
    // Note: Username and email are case-insensitive, phone is numeric
    const isS2Account = 
      normalizedAccount === testAccounts.staff.s2.username.toLowerCase() ||
      normalizedAccount === testAccounts.staff.s2.phone ||
      normalizedAccount === testAccounts.staff.s2.email.toLowerCase() ||
      normalizedAccount === testAccounts.staff.multipleInstitutions.toLowerCase()
    
    const isS2Password = password === testAccounts.staff.s2.password
    
    if (isS2Account && isS2Password) {
      console.log('%c[Mock] Matched S2 - Returning multiple institutions', 'color: #52c41a; font-weight: bold', {
        account,
        passwordMatch: true,
        institutions: multipleInstitutionsStaff.map(i => i.name),
      })
      return multipleInstitutionsStaff
    }

    // S3: S2 / 720101103 / s3@test.com | Ts123@121 → Winds (单个)
    // 注意：username 与 S2 相同，但 password 不同，所以需要同时检查 account 和 password
    if (
      (account === testAccounts.staff.s3.username ||
        account === testAccounts.staff.s3.phone ||
        account === testAccounts.staff.s3.email) &&
      password === testAccounts.staff.s3.password
    ) {
      return windsInstitutionStaff
    }

    // 账号不存在
    if (account === testAccounts.staff.notFound) {
      return noInstitutions
    }
  }

  // Resident 用户
  if (userType === 'resident') {
    // R1: R1 / 82010101 / R1@test.com | Ts123@123 → Sunset (单个)
    if (
      (account === testAccounts.resident.r1.account ||
        account === testAccounts.resident.r1.phone ||
        account === testAccounts.resident.r1.email ||
        account === testAccounts.resident.singleInstitution) &&
      password === testAccounts.resident.r1.password
    ) {
      return singleInstitutionResident
    }

    // R2: R2 / 82010102 / R2@test.com | Ts123@123 → Sunset + Golden (多个)
    if (
      (account === testAccounts.resident.r2.account ||
        account === testAccounts.resident.r2.phone ||
        account === testAccounts.resident.r2.email ||
        account === testAccounts.resident.multipleInstitutions) &&
      password === testAccounts.resident.r2.password
    ) {
      return multipleInstitutionsResident
    }

    // R3: R2 / 82010103 / R3@test.com | Ts123@121 → Winds (单个)
    // 注意：account 与 R2 相同，但 password 不同，所以需要同时检查 account 和 password
    if (
      (account === testAccounts.resident.r3.account ||
        account === testAccounts.resident.r3.phone ||
        account === testAccounts.resident.r3.email) &&
      password === testAccounts.resident.r3.password
    ) {
      return windsInstitutionResident
    }

    // 账号不存在
    if (account === testAccounts.resident.notFound) {
      return noInstitutions
    }
  }

  // 账号不匹配任何测试账号，返回空数组（不泄露账号是否存在）
  console.log('%c[Mock] Account not found in test data', 'color: #ff4d4f; font-weight: bold', {
    account,
    userType,
    note: 'Returning empty array for security (no account enumeration)',
  })
  return noInstitutions
}

/**
 * Mock: 登录 API
 * 对应 loginApi
 * 
 * 测试账号参考：test/login/TEST_ACCOUNTS.md
 */
export async function mockLogin(params: LoginParams): Promise<LoginResult> {
  // 模拟网络延迟
  await delay(500)

  // Normalize account for case-insensitive matching (username and email)
  // Phone numbers are numeric, so toLowerCase() has no effect
  const normalizedAccount = params.account.trim().toLowerCase()

  // Staff 用户登录
  if (params.userType === 'staff') {
    // S1: S1 / 720101101 / s1@test.com | Ts123@123 → Sunset
    // Note: Username and email are case-insensitive, phone is numeric
    if (
      (normalizedAccount === testAccounts.staff.s1.username.toLowerCase() ||
        normalizedAccount === testAccounts.staff.s1.phone ||
        normalizedAccount === testAccounts.staff.s1.email.toLowerCase() ||
        normalizedAccount === testAccounts.staff.singleInstitution.toLowerCase())
    ) {
      // 检查密码
      if (params.password !== testAccounts.staff.s1.password) {
        throw new Error('Invalid username or password')
      }
      // 检查机构
      if (!params.institutionId || params.institutionId === testAccounts.staff.s1.institutionId) {
        return loginSuccessStaff
      }
      throw new Error('Institution mismatch')
    }

    // S2: S2 / 720101102 / s2@test.com | Ts123@123 → Sunset 或 Golden
    // Note: Username and email are case-insensitive, phone is numeric
    if (
      normalizedAccount === testAccounts.staff.s2.username.toLowerCase() ||
      normalizedAccount === testAccounts.staff.s2.phone ||
      normalizedAccount === testAccounts.staff.s2.email.toLowerCase() ||
      normalizedAccount === testAccounts.staff.multipleInstitutions.toLowerCase()
    ) {
      // 检查密码
      if (params.password !== testAccounts.staff.s2.password) {
        throw new Error('Invalid username or password')
      }
      if (params.institutionId === testAccounts.staff.s2.institutionIds[0]) {
        // Sunset
        return {
          ...loginSuccessStaff,
          userId: 'user-s2',
          username: testAccounts.staff.s2.username,
          email: testAccounts.staff.s2.email,
          phone: testAccounts.staff.s2.phone,
          institutionId: testAccounts.staff.s2.institutionIds[0],
          institutionName: 'Sunset',
        }
      } else if (params.institutionId === testAccounts.staff.s2.institutionIds[1]) {
        // Golden
        return {
          ...loginSuccessStaff,
          userId: 'user-s2',
          username: testAccounts.staff.s2.username,
          email: testAccounts.staff.s2.email,
          phone: testAccounts.staff.s2.phone,
          institutionId: testAccounts.staff.s2.institutionIds[1],
          institutionName: 'Golden',
        }
      } else if (!params.institutionId && testAccounts.staff.s2.institutionIds.length > 1) {
        // 多个机构但未选择，返回错误
        throw new Error('Multiple institutions found, please select one')
      }
    }

    // S3: S2 / 720101103 / s3@test.com | Ts123@121 → Winds
    // Note: Username and email are case-insensitive, phone is numeric
    if (
      normalizedAccount === testAccounts.staff.s3.username.toLowerCase() ||
      normalizedAccount === testAccounts.staff.s3.phone ||
      normalizedAccount === testAccounts.staff.s3.email.toLowerCase()
    ) {
      // 检查密码
      if (params.password !== testAccounts.staff.s3.password) {
        throw new Error('Invalid username or password')
      }
      return {
        ...loginSuccessStaff,
        userId: 'user-s3',
        username: testAccounts.staff.s3.username,
        email: testAccounts.staff.s3.email,
        phone: testAccounts.staff.s3.phone,
        institutionId: testAccounts.staff.s3.institutionId,
        institutionName: testAccounts.staff.s3.institution,
      }
    }

    // 账号不存在
    if (normalizedAccount === testAccounts.staff.notFound.toLowerCase()) {
      throw new Error(loginErrorAccountNotFound.message)
    }

    // 账号已禁用
    if (normalizedAccount === testAccounts.staff.disabled.toLowerCase()) {
      throw new Error(loginErrorAccountDisabled.message)
    }
  }

  // Resident 用户登录
  if (params.userType === 'resident') {
    // R1: R1 / 82010101 / R1@test.com | Ts123@123 → Sunset
    // Note: Username and email are case-insensitive, phone is numeric
    if (
      (normalizedAccount === testAccounts.resident.r1.account.toLowerCase() ||
        normalizedAccount === testAccounts.resident.r1.phone ||
        normalizedAccount === testAccounts.resident.r1.email.toLowerCase() ||
        normalizedAccount === testAccounts.resident.singleInstitution.toLowerCase())
    ) {
      // 检查密码
      if (params.password !== testAccounts.resident.r1.password) {
        throw new Error('Invalid username or password')
      }
      // 检查机构
      if (!params.institutionId || params.institutionId === testAccounts.resident.r1.institutionId) {
        return loginSuccessResident
      }
      throw new Error('Institution mismatch')
    }

    // R2: R2 / 82010102 / R2@test.com | Ts123@123 → Sunset 或 Golden
    // Note: Username and email are case-insensitive, phone is numeric
    if (
      normalizedAccount === testAccounts.resident.r2.account.toLowerCase() ||
      normalizedAccount === testAccounts.resident.r2.phone ||
      normalizedAccount === testAccounts.resident.r2.email.toLowerCase() ||
      normalizedAccount === testAccounts.resident.multipleInstitutions.toLowerCase()
    ) {
      // 检查密码
      if (params.password !== testAccounts.resident.r2.password) {
        throw new Error('Invalid username or password')
      }
      if (params.institutionId === testAccounts.resident.r2.institutionIds[0]) {
        // Sunset
        return {
          ...loginSuccessResident,
          userId: 'resident-r2',
          institutionId: testAccounts.resident.r2.institutionIds[0],
          institutionName: 'Sunset',
        }
      } else if (params.institutionId === testAccounts.resident.r2.institutionIds[1]) {
        // Golden
        return {
          ...loginSuccessResident,
          userId: 'resident-r2',
          institutionId: testAccounts.resident.r2.institutionIds[1],
          institutionName: 'Golden',
        }
      } else if (!params.institutionId && testAccounts.resident.r2.institutionIds.length > 1) {
        // 多个机构但未选择，返回错误
        throw new Error('Multiple institutions found, please select one')
      }
    }

    // R3: R2 / 82010103 / R3@test.com | Ts123@121 → Winds
    // Note: Username and email are case-insensitive, phone is numeric
    if (
      normalizedAccount === testAccounts.resident.r3.account.toLowerCase() ||
      normalizedAccount === testAccounts.resident.r3.phone ||
      normalizedAccount === testAccounts.resident.r3.email.toLowerCase()
    ) {
      // 检查密码
      if (params.password !== testAccounts.resident.r3.password) {
        throw new Error('Invalid username or password')
      }
      return {
        ...loginSuccessResident,
        userId: 'resident-r3',
        institutionId: testAccounts.resident.r3.institutionId,
        institutionName: testAccounts.resident.r3.institution,
      }
    }

    // 账号不存在
    if (normalizedAccount === testAccounts.resident.notFound.toLowerCase()) {
      throw new Error(loginErrorAccountNotFound.message)
    }
  }

  // 账号不匹配任何测试账号，返回错误（为了安全，不泄露账号是否存在）
  console.log('%c[Mock] Account not found in test data', 'color: #ff4d4f; font-weight: bold', {
    account: params.account,
    userType: params.userType,
    note: 'Returning error for security (no account enumeration)',
  })
  throw new Error('Invalid username or password')
}

