/**
 * Forgot Password API Response Examples
 * These are examples of what the API should return
 */

import type { ForgotPasswordResult } from '@/api/auth/model/authModel'
import { apiResponses } from './data'

/**
 * Example: Send Verification Code - Success
 */
export const sendCodeSuccessExample: ForgotPasswordResult = apiResponses.sendCodeSuccess(
  'admin@sunset-care.com',
)

/**
 * Example: Send Verification Code - Account Not Found
 */
export const sendCodeAccountNotFoundExample: ForgotPasswordResult = apiResponses.sendCodeError(
  'Account not found in this institution',
)

/**
 * Example: Send Verification Code - Institution Not Found
 */
export const sendCodeInstitutionNotFoundExample: ForgotPasswordResult = apiResponses.sendCodeError(
  'Institution not found',
)

/**
 * Example: Verify Code - Success
 */
export const verifyCodeSuccessExample: ForgotPasswordResult = apiResponses.verifyCodeSuccess()

/**
 * Example: Verify Code - Invalid Code
 */
export const verifyCodeInvalidExample: ForgotPasswordResult = apiResponses.verifyCodeError(
  'Invalid verification code',
)

/**
 * Example: Verify Code - Expired Code
 */
export const verifyCodeExpiredExample: ForgotPasswordResult = apiResponses.verifyCodeError(
  'Verification code has expired',
)

/**
 * Example: Reset Password - Success
 */
export const resetPasswordSuccessExample: ForgotPasswordResult = apiResponses.resetPasswordSuccess()

/**
 * Example: Reset Password - Password Weak
 */
export const resetPasswordWeakExample: ForgotPasswordResult = apiResponses.resetPasswordError(
  'Password does not meet requirements',
)

