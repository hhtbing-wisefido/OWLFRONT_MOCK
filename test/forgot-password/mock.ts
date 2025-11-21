/**
 * Forgot Password Mock Functions
 * Simulates API calls for forgot password functionality
 */

import type {
  SendVerificationCodeParams,
  VerifyCodeParams,
  ResetPasswordParams,
  ForgotPasswordResult,
} from '@/api/auth/model/authModel'
import * as dataModule from './data'
const { apiResponses, errors, testVerificationCodes } = dataModule

// Store verification codes (in real app, this would be in backend)
const verificationCodeStore = new Map<string, { code: string; expiresAt: number }>()

// Generate a verification code
// In development: Use fixed test code for easier testing
// In production: Generate random code
function generateVerificationCode(): string {
  // Use fixed test code in development mode
  if (import.meta.env.DEV) {
    return testVerificationCodes.correct // '123456'
  }
  // Generate random code in production
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store verification code with expiration (5 minutes)
function storeVerificationCode(key: string, code: string): void {
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes
  verificationCodeStore.set(key, { code, expiresAt })
}

// Get verification code
function getVerificationCode(key: string): string | null {
  const stored = verificationCodeStore.get(key)
  if (!stored) return null
  if (Date.now() > stored.expiresAt) {
    verificationCodeStore.delete(key)
    return null
  }
  return stored.code
}

// Create key for verification code storage
// Use normalized institution name (case-insensitive) for key matching
// Always use matched institution name to ensure consistent key matching
function createCodeKey(
  account: string,
  userType: string,
  institutionName: string, // Should be the matched institution name
): string {
  // Normalize institution name to lowercase for consistent key matching
  const normalizedInstitutionName = institutionName.trim().toLowerCase()
  return `${account}:${userType}:${normalizedInstitutionName}`
}

// Get matched institution name (case-insensitive match)
function getMatchedInstitutionName(inputName: string): string | null {
  const inputLower = inputName.trim().toLowerCase()
  const institution = Object.values(dataModule.institutions).find(
    (inst: any) => inst.name.toLowerCase().includes(inputLower) ||
                  inputLower.includes(inst.name.toLowerCase()),
  )
  return institution ? institution.name : null
}

/**
 * Mock: Send verification code
 */
export async function mockSendVerificationCode(
  params: SendVerificationCodeParams,
): Promise<ForgotPasswordResult> {
  console.log('%c[Mock] mockSendVerificationCode called', 'color: #1890ff; font-weight: bold', {
    account: params.account,
    userType: params.userType,
    institutionName: params.institutionName,
  })

  // Validate institution name (case-insensitive, supports partial match)
  // Example: "sunset" matches "Sunset Care Center", "SUNSET" matches "Sunset Care Center"
  const institutionNameLower = params.institutionName.trim().toLowerCase()
  const institution = Object.values(dataModule.institutions).find(
    (inst: any) => inst.name.toLowerCase().includes(institutionNameLower) ||
                  institutionNameLower.includes(inst.name.toLowerCase()),
  )
  if (!institution) {
    throw new Error(errors.institutionNotFound.message)
  }

  // Use the matched institution name for account lookup (case-insensitive)
  const matchedInstitutionName = institution.name

  // Check if account exists in this institution
  const accountExists =
    Object.values(dataModule.testAccounts.staff).some(
      (acc: any) =>
        (acc.phone === params.account || acc.email === params.account) &&
        acc.institution.toLowerCase() === matchedInstitutionName.toLowerCase(),
    ) ||
    Object.values(dataModule.testAccounts.resident).some(
      (acc: any) =>
        (acc.phone === params.account || acc.email === params.account) &&
        acc.institution.toLowerCase() === matchedInstitutionName.toLowerCase(),
    )

  if (!accountExists) {
    throw new Error(errors.accountNotFound.message)
  }

  // Generate and store verification code
  // Use matched institution name for key (normalized to lowercase)
  const code = generateVerificationCode()
  const key = createCodeKey(params.account, params.userType, matchedInstitutionName)
  storeVerificationCode(key, code)

  // Only log detailed info in development mode
  if (import.meta.env.DEV) {
    console.log('%c[Mock] Verification code generated', 'color: #52c41a; font-weight: bold', {
      code,
      key,
      account: params.account,
      userType: params.userType,
      matchedInstitutionName,
      note: 'In production, this code would be sent via SMS/Email',
      hint: 'Use this code to verify: ' + code,
    })
  }

  // Return success with admin email
  return apiResponses.sendCodeSuccess((institution as any).adminEmail)
}

/**
 * Mock: Verify verification code
 */
export async function mockVerifyCode(params: VerifyCodeParams): Promise<ForgotPasswordResult> {
  console.log('%c[Mock] mockVerifyCode called', 'color: #1890ff; font-weight: bold', {
    account: params.account,
    code: params.code,
    userType: params.userType,
    institutionName: params.institutionName,
  })

  // Get matched institution name (case-insensitive)
  const matchedInstitutionName = getMatchedInstitutionName(params.institutionName)
  if (!matchedInstitutionName) {
    throw new Error(errors.institutionNotFound.message)
  }

  // Create key with matched institution name (must match the key used when storing)
  const key = createCodeKey(params.account, params.userType, matchedInstitutionName)
  const storedCode = getVerificationCode(key)

  // Only log detailed debug info in development mode
  if (import.meta.env.DEV) {
    console.log('%c[Mock] Verification code lookup', 'color: #fa8c16; font-weight: bold', {
      key,
      storedCode: storedCode ? '***' : 'NOT FOUND', // Don't expose actual code
      inputCode: '***', // Don't expose input code
      matchedInstitutionName,
    })

    if (!storedCode) {
      console.log('%c[Mock] Code not found or expired', 'color: #ff4d4f; font-weight: bold', {
        key,
        hint: 'Check if the key matches the one used when sending the code',
      })
    } else if (storedCode !== params.code) {
      console.log('%c[Mock] Code mismatch', 'color: #ff4d4f; font-weight: bold', {
        hint: 'The verification code does not match',
      })
    }
  }

  if (!storedCode) {
    throw new Error(errors.codeExpired.message)
  }

  if (storedCode !== params.code) {
    throw new Error(errors.invalidCode.message)
  }

  // Code verified successfully
  console.log('%c[Mock] Verification code verified', 'color: #52c41a; font-weight: bold', {
    key,
  })

  return apiResponses.verifyCodeSuccess()
}

/**
 * Mock: Reset password
 */
export async function mockResetPassword(params: ResetPasswordParams): Promise<ForgotPasswordResult> {
  console.log('%c[Mock] mockResetPassword called', 'color: #1890ff; font-weight: bold', {
    account: params.account,
    code: params.code,
    userType: params.userType,
    institutionName: params.institutionName,
    newPasswordLength: params.newPassword.length,
  })

  // Get matched institution name (case-insensitive)
  const matchedInstitutionName = getMatchedInstitutionName(params.institutionName)
  if (!matchedInstitutionName) {
    throw new Error(errors.institutionNotFound.message)
  }

  // Verify code first (use matched institution name)
  const verifyParams: VerifyCodeParams = {
    account: params.account,
    code: params.code,
    userType: params.userType,
    institutionName: matchedInstitutionName,
  }

  try {
    await mockVerifyCode(verifyParams)
  } catch (error: any) {
    throw error
  }

  // Validate password strength (basic check, backend will do detailed validation)
  if (params.newPassword.length < 8) {
    throw new Error(errors.passwordWeak.message)
  }

  const hasUpperCase = /[A-Z]/.test(params.newPassword)
  const hasLowerCase = /[a-z]/.test(params.newPassword)
  const hasNumber = /\d/.test(params.newPassword)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(params.newPassword)

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    throw new Error(errors.passwordWeak.message)
  }

  // Password reset successful
  console.log('%c[Mock] Password reset successful', 'color: #52c41a; font-weight: bold', {
    account: params.account,
    institutionName: params.institutionName,
    note: 'In production, password would be hashed and stored in database',
  })

  // Clear verification code after successful reset
  const key = createCodeKey(params.account, params.userType, matchedInstitutionName)
  verificationCodeStore.delete(key)

  return apiResponses.resetPasswordSuccess()
}

