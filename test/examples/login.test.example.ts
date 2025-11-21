/**
 * 登录功能测试示例
 * 展示如何使用测试数据进行自动化测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login } from '../index'

describe('登录功能测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('搜索机构 API', () => {
    it('应该返回单个机构（Staff）', async () => {
      const result = await login.mockSearchInstitutions(
        login.testAccounts.staff.singleInstitution,
        login.testPasswords.correct,
        'staff',
      )
      expect(result).toHaveLength(1)
      expect(result[0]?.name).toBe('Sunset Care Center')
    })

    it('应该返回多个机构（Staff）', async () => {
      const result = await login.mockSearchInstitutions(
        login.testAccounts.staff.multipleInstitutions,
        login.testPasswords.correct,
        'staff',
      )
      expect(result.length).toBeGreaterThan(1)
    })

    it('应该返回空数组（账号不存在）', async () => {
      const result = await login.mockSearchInstitutions(
        login.testAccounts.staff.notFound,
        login.testPasswords.correct,
        'staff',
      )
      expect(result).toHaveLength(0)
    })
  })

  describe('登录 API', () => {
    it('应该成功登录（Staff）', async () => {
      const result = await login.mockLogin({
        account: login.testAccounts.staff.singleInstitution,
        password: login.testPasswords.correct,
        userType: 'staff',
        institutionId: 'tenant-001',
      })

      expect(result.userType).toBe('staff')
      expect(result.accessToken).toBeDefined()
      expect(result.role).toBeDefined()
    })

    it('应该返回密码错误', async () => {
      await expect(
        login.mockLogin({
          account: login.testAccounts.staff.singleInstitution,
          password: login.testPasswords.wrong,
          userType: 'staff',
          institutionId: 'tenant-001',
        }),
      ).rejects.toThrow(login.loginErrorWrongPassword.message)
    })

    it('应该返回账号不存在', async () => {
      await expect(
        login.mockLogin({
          account: login.testAccounts.staff.notFound,
          password: login.testPasswords.correct,
          userType: 'staff',
          institutionId: 'tenant-001',
        }),
      ).rejects.toThrow()
    })
  })
})

