/**
 * 测试数据生成器
 * 用于生成各种测试场景的数据
 */

import type { Institution, LoginResult } from '@/api/auth/model/authModel'

/**
 * 生成机构列表
 */
export function generateInstitutions(count: number): Institution[] {
  const institutions: Institution[] = []
  for (let i = 1; i <= count; i++) {
    institutions.push({
      id: `550e8400-e29b-41d4-a716-${String(i).padStart(12, '0')}`, // UUID 格式
      name: `Care Center ${i}`,
      domain: `carecenter${i}.com`,
    })
  }
  return institutions
}

/**
 * 生成登录成功响应
 */
export function generateLoginSuccess(
  userType: 'staff' | 'resident',
  tenant_id: string,
  tenant_name: string,
): LoginResult {
  const baseResult: LoginResult = {
    accessToken: `token-${userType}-${Date.now()}`,
    refreshToken: `refresh-${userType}-${Date.now()}`,
    userId: `${userType}-001`,
    userType,
    tenant_id,
    tenant_name,
  }

  if (userType === 'staff') {
    return {
      ...baseResult,
      role: 'Nurse',
      nickName: 'Test User',
      homePath: '/dashboard',
    }
  }

  return baseResult
}

/**
 * 生成错误响应
 */
export function generateErrorResponse(code: number, message: string) {
  return {
    code,
    message,
    type: 'error' as const,
  }
}

/**
 * 延迟函数（用于模拟网络延迟）
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 模拟 API 响应（带延迟）
 */
export async function mockApiResponse<T>(
  data: T,
  delayMs: number = 500,
): Promise<T> {
  await delay(delayMs)
  return data
}

