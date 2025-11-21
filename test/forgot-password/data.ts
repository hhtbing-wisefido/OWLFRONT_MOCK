/**
 * Forgot Password Test Data
 */

import type {
  SendVerificationCodeParams,
  VerifyCodeParams,
  ResetPasswordParams,
  ForgotPasswordResult,
} from '@/api/auth/model/authModel'

// Test institutions
export const institutions = {
  sunset: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Sunset Care Center',
    domain: 'sunset-care.com',
    adminEmail: 'admin@sunset-care.com',
  },
  golden: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Golden Care Center',
    domain: 'golden-care.com',
    adminEmail: 'admin@golden-care.com',
  },
  winds: {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Winds Care Center',
    domain: 'winds-care.com',
    adminEmail: 'admin@winds-care.com',
  },
}

// Test accounts for forgot password
export const testAccounts = {
  staff: {
    s1: {
      phone: '720101101',
      email: 's1@test.com',
      institution: 'Sunset Care Center',
      institutionId: '550e8400-e29b-41d4-a716-446655440000',
    },
    s2: {
      phone: '720101102',
      email: 's2@test.com',
      institution: 'Sunset Care Center', // S2 exists in multiple institutions
      institutionId: '550e8400-e29b-41d4-a716-446655440000',
    },
  },
  resident: {
    r1: {
      phone: '820111222',
      email: 'r1@test.com',
      institution: 'Sunset Care Center',
      institutionId: '550e8400-e29b-41d4-a716-446655440000',
    },
  },
}

// Test verification codes
export const testVerificationCodes = {
  correct: '123456',
  wrong: '000000',
  expired: '999999',
}

// Test passwords
export const testPasswords = {
  valid: 'NewPass123!@#',
  tooShort: 'Short1!',
  noUpperCase: 'lowercase123!',
  noLowerCase: 'UPPERCASE123!',
  noNumber: 'NoNumber!@#',
  noSpecialChar: 'NoSpecial123',
}

// API Response Templates
export const apiResponses = {
  sendCodeSuccess: (adminEmail?: string): ForgotPasswordResult => ({
    success: true,
    message: 'Verification code sent successfully',
    adminEmail: adminEmail || 'admin@example.com',
  }),

  sendCodeError: (message: string): ForgotPasswordResult => ({
    success: false,
    message,
  }),

  verifyCodeSuccess: (): ForgotPasswordResult => ({
    success: true,
    message: 'Verification code verified successfully',
  }),

  verifyCodeError: (message: string): ForgotPasswordResult => ({
    success: false,
    message,
  }),

  resetPasswordSuccess: (): ForgotPasswordResult => ({
    success: true,
    message: 'Password reset successfully',
  }),

  resetPasswordError: (message: string): ForgotPasswordResult => ({
    success: false,
    message,
  }),
}

// Error Messages
export const errors = {
  accountNotFound: {
    message: 'Account not found in this institution',
  },
  institutionNotFound: {
    message: 'Institution not found',
  },
  invalidCode: {
    message: 'Invalid verification code',
  },
  codeExpired: {
    message: 'Verification code has expired',
  },
  passwordWeak: {
    message: 'Password does not meet requirements',
  },
  passwordMismatch: {
    message: 'Passwords do not match',
  },
}

