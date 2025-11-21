/**
 * Login API 测试数据
 * 对应 src/api/auth/auth.ts
 * 用于 API 级别的测试（不特定于页面）
 */

import type { LoginResult, Institution } from '@/api/auth/model/authModel'

/**
 * API 响应数据模板
 */
export const apiResponseTemplates = {
  // 成功响应模板
  success: <T>(data: T) => ({
    code: 200,
    result: data,
    message: 'ok',
    type: 'success',
  }),

  // 错误响应模板
  error: (message: string, code: number = 400) => ({
    code,
    result: null,
    message,
    type: 'error',
  }),
}

/**
 * 机构搜索 API 响应数据
 */
export const institutionSearchResponses = {
  single: (institution: Institution) => ({
    code: 200,
    result: [institution],
    message: 'ok',
    type: 'success',
  }),

  multiple: (institutions: Institution[]) => ({
    code: 200,
    result: institutions,
    message: 'ok',
    type: 'success',
  }),

  empty: () => ({
    code: 200,
    result: [],
    message: 'ok',
    type: 'success',
  }),
}

/**
 * 登录 API 响应数据
 */
export const loginResponses = {
  success: (result: LoginResult) => ({
    code: 200,
    result,
    message: 'Login successful',
    type: 'success',
  }),

  wrongPassword: () => ({
    code: 401,
    result: null,
    message: 'Invalid password',
    type: 'error',
  }),

  accountNotFound: () => ({
    code: 404,
    result: null,
    message: 'Account not found',
    type: 'error',
  }),

  accountDisabled: () => ({
    code: 403,
    result: null,
    message: 'Account is disabled',
    type: 'error',
  }),
}

