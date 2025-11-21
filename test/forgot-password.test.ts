/**
 * Forgot Password API 测试
 * 测试忘记密码相关的 API Mock 函数
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { forgotPassword } from './index'

describe('Forgot Password API 测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('发送验证码 API', () => {
    it('应该成功发送验证码（Staff）', async () => {
      const params = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }

      console.log('📥 输入:', { ...params, account: params.account })

      const result = await forgotPassword.mockSendVerificationCode(params)

      console.log('📤 输出:', {
        success: result.success,
        message: result.message,
        adminEmail: result.adminEmail,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('successfully')
      expect(result.adminEmail).toBeDefined()
    })

    it('应该成功发送验证码（Resident）', async () => {
      const params = {
        account: forgotPassword.testAccounts.resident.r1.phone,
        userType: 'resident' as const,
        institutionName: 'Sunset Care Center',
      }

      const result = await forgotPassword.mockSendVerificationCode(params)

      expect(result.success).toBe(true)
      expect(result.adminEmail).toBeDefined()
    })

    it('应该返回机构不存在错误', async () => {
      const params = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        userType: 'staff' as const,
        institutionName: 'NonExistent Institution',
      }

      await expect(forgotPassword.mockSendVerificationCode(params)).rejects.toThrow(
        'Institution not found',
      )
    })

    it('应该返回账号不存在错误', async () => {
      const params = {
        account: '9999999999',
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }

      await expect(forgotPassword.mockSendVerificationCode(params)).rejects.toThrow(
        'Account not found in this institution',
      )
    })

    it('应该支持大小写不敏感的机构名称匹配', async () => {
      const params = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        userType: 'staff' as const,
        institutionName: 'sunset care center', // 小写
      }

      const result = await forgotPassword.mockSendVerificationCode(params)

      expect(result.success).toBe(true)
    })
  })

  describe('验证验证码 API', () => {
    it('应该成功验证验证码', async () => {
      // 先发送验证码
      const sendParams = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }
      await forgotPassword.mockSendVerificationCode(sendParams)

      // 验证验证码
      const verifyParams = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        code: forgotPassword.testVerificationCodes.correct,
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }

      console.log('📥 输入:', { ...verifyParams, account: verifyParams.account })

      const result = await forgotPassword.mockVerifyCode(verifyParams)

      console.log('📤 输出:', {
        success: result.success,
        message: result.message,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('verified')
    })

    it('应该返回验证码错误', async () => {
      // 先发送验证码
      const sendParams = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }
      await forgotPassword.mockSendVerificationCode(sendParams)

      // 使用错误的验证码
      const verifyParams = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        code: forgotPassword.testVerificationCodes.wrong,
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }

      await expect(forgotPassword.mockVerifyCode(verifyParams)).rejects.toThrow(
        'Invalid verification code',
      )
    })

    it('应该返回验证码过期错误', async () => {
      // 尝试验证一个不存在的验证码（未发送验证码）
      const verifyParams = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        code: forgotPassword.testVerificationCodes.expired,
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }

      // 当验证码不存在时，mock 函数返回 "Invalid verification code"
      // 这是为了安全，不泄露验证码是否过期或不存在
      await expect(forgotPassword.mockVerifyCode(verifyParams)).rejects.toThrow(
        'Invalid verification code',
      )
    })
  })

  describe('重置密码 API', () => {
    it('应该成功重置密码', async () => {
      // 先发送验证码
      const sendParams = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }
      await forgotPassword.mockSendVerificationCode(sendParams)

      // 验证验证码
      const verifyParams = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        code: forgotPassword.testVerificationCodes.correct,
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }
      await forgotPassword.mockVerifyCode(verifyParams)

      // 重置密码
      const resetParams = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        code: forgotPassword.testVerificationCodes.correct,
        newPassword: forgotPassword.testPasswords.valid,
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }

      console.log('📥 输入:', {
        account: resetParams.account,
        code: resetParams.code,
        newPasswordLength: resetParams.newPassword.length,
        userType: resetParams.userType,
        institutionName: resetParams.institutionName,
      })

      const result = await forgotPassword.mockResetPassword(resetParams)

      console.log('📤 输出:', {
        success: result.success,
        message: result.message,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('successfully')
    })

    it('应该返回密码强度不足错误', async () => {
      // 先发送和验证验证码
      const sendParams = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }
      await forgotPassword.mockSendVerificationCode(sendParams)

      const verifyParams = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        code: forgotPassword.testVerificationCodes.correct,
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }
      await forgotPassword.mockVerifyCode(verifyParams)

      // 使用弱密码
      const resetParams = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        code: forgotPassword.testVerificationCodes.correct,
        newPassword: forgotPassword.testPasswords.tooShort,
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }

      await expect(forgotPassword.mockResetPassword(resetParams)).rejects.toThrow(
        'Password does not meet requirements',
      )
    })

    it('应该返回验证码错误（重置密码时）', async () => {
      // 先发送验证码
      const sendParams = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }
      await forgotPassword.mockSendVerificationCode(sendParams)

      // 使用错误的验证码重置密码
      const resetParams = {
        account: forgotPassword.testAccounts.staff.s1.phone,
        code: forgotPassword.testVerificationCodes.wrong,
        newPassword: forgotPassword.testPasswords.valid,
        userType: 'staff' as const,
        institutionName: 'Sunset Care Center',
      }

      await expect(forgotPassword.mockResetPassword(resetParams)).rejects.toThrow(
        'Invalid verification code',
      )
    })
  })
})

