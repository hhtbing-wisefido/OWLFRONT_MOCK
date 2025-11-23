/**
 * Login API 测试
 * 测试登录相关的 API Mock 函数
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login } from './index'

describe('Login API 测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('搜索机构 API', () => {
    it('应该返回单个机构（Staff）', async () => {
      const account = login.testAccounts.staff.singleInstitution
      const password = login.testPasswords.correct
      
      console.log('📥 输入:', { account, password: '***', userType: 'staff' })
      
      const result = await login.mockSearchInstitutions(account, password, 'staff')
      
      console.log('📤 输出:', {
        count: result.length,
        institutions: result.map(i => ({ id: i.id, name: i.name, domain: i.domain })),
      })
      
      expect(result).toHaveLength(1)
      expect(result[0]?.name).toBe('Sunset Care Center')
    })

    it('应该返回多个机构（Staff）', async () => {
      const account = login.testAccounts.staff.multipleInstitutions
      const password = login.testPasswords.correct
      
      console.log('📥 输入:', { account, password: '***', userType: 'staff' })
      
      const result = await login.mockSearchInstitutions(account, password, 'staff')
      
      console.log('📤 输出:', {
        count: result.length,
        institutions: result.map(i => ({ id: i.id, name: i.name, domain: i.domain })),
      })
      
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

    it('应该返回单个机构（Resident）', async () => {
      const result = await login.mockSearchInstitutions(
        login.testAccounts.resident.singleInstitution,
        login.testPasswords.correct,
        'resident',
      )
      expect(result).toHaveLength(1)
    })
  })

  describe('登录 API', () => {
    it('应该成功登录（Staff）', async () => {
      const params = {
        account: login.testAccounts.staff.singleInstitution,
        password: login.testPasswords.correct,
        userType: 'staff' as const,
        tenant_id: login.testAccounts.staff.s1.institutionId, // 使用正确的 institutionId (UUID)
      }
      
      console.log('📥 输入:', { ...params, password: '***' })
      
      const result = await login.mockLogin(params)
      
      console.log('📤 输出:', {
        userType: result.userType,
        userId: result.userId,
        tenant_id: result.tenant_id,
        tenant_name: result.tenant_name,
        role: result.role,
        hasToken: !!result.accessToken,
      })

      expect(result.userType).toBe('staff')
      expect(result.accessToken).toBeDefined()
      expect(result.role).toBeDefined()
      expect(result.tenant_id).toBe(login.testAccounts.staff.s1.institutionId)
    })

    it('应该成功登录（Resident）', async () => {
      const result = await login.mockLogin({
        account: login.testAccounts.resident.singleInstitution,
        password: login.testPasswords.correct,
        userType: 'resident',
        tenant_id: login.testAccounts.resident.r1.institutionId, // 使用正确的 institutionId (UUID)
      })

      expect(result.userType).toBe('resident')
      expect(result.accessToken).toBeDefined()
    })

    it('应该返回密码错误', async () => {
      await expect(
        login.mockLogin({
          account: login.testAccounts.staff.singleInstitution,
          password: login.testPasswords.wrong,
          userType: 'staff',
          tenant_id: login.testAccounts.staff.s1.institutionId, // 使用正确的 institutionId (UUID)
        }),
      ).rejects.toThrow('Invalid username or password')
    })

    it('应该返回账号不存在', async () => {
      await expect(
        login.mockLogin({
          account: login.testAccounts.staff.notFound,
          password: login.testPasswords.correct,
          userType: 'staff',
          tenant_id: login.testAccounts.staff.s1.institutionId, // 使用正确的 institutionId (UUID)
        }),
      ).rejects.toThrow(login.loginErrorAccountNotFound.message)
    })

    it('应该返回账号已禁用', async () => {
      await expect(
        login.mockLogin({
          account: login.testAccounts.staff.disabled,
          password: login.testPasswords.correct,
          userType: 'staff',
          tenant_id: login.testAccounts.staff.s1.institutionId, // 使用正确的 institutionId (UUID)
        }),
      ).rejects.toThrow(login.loginErrorAccountDisabled.message)
    })
  })
})

