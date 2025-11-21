import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type { 
  LoginParams, 
  LoginResult, 
  Institution,
  SendVerificationCodeParams,
  VerifyCodeParams,
  ResetPasswordParams,
  ForgotPasswordResult,
} from './model/authModel'

export enum Api {
  Login = '/auth/api/v1/login',
  SearchInstitutions = '/auth/api/v1/institutions/search',
  SendVerificationCode = '/auth/api/v1/forgot-password/send-code',
  VerifyCode = '/auth/api/v1/forgot-password/verify-code',
  ResetPassword = '/auth/api/v1/forgot-password/reset',
}

// Mock mode: In development, use mock data instead of real API calls
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

// Display mock status in console
if (useMock) {
  console.log('%c[Mock] API Mock enabled - Using test data', 'color: #52c41a; font-weight: bold')
}

/**
 * @description: Login API
 * 
 * Security (HIPAA Compliance):
 * - Account (phone/email) is hashed (SHA-256) before sending to backend
 * - Password is hashed (SHA-256) before sending to backend
 * - Backend only receives hashes, never receives raw PHI (phone/email)
 * - Chrome DevTools Network tab will show only hashes, proving no raw PHI transmission
 * 
 * In development: Returns mock data directly for testing Vue components
 * In production: Calls real backend API
 */
export async function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  // Import crypto utility
  const { hashAccount, hashAccountPassword } = await import('@/utils/crypto')
  
  // Hash account (phone/email/username) for HIPAA compliance
  const accountHash = await hashAccount(params.account)
  
  // Hash account + password combination
  const accountPasswordHash = await hashAccountPassword(params.account, params.password)
  
  // In development with mock enabled, return mock data directly
  if (useMock) {
    // Use relative path to avoid Vite alias resolution issues in dynamic imports
    return import('../../../test/index').then(({ login }) => {
      console.log('%c[Mock] Login API Request', 'color: #1890ff; font-weight: bold', {
        accountType: params.account.includes('@') ? 'email' : /^\d+$/.test(params.account.replace(/\D/g, '')) ? 'phone' : 'username',
        accountHash: accountHash.substring(0, 16) + '...', // Show partial hash for debugging
        accountPasswordHash: accountPasswordHash.substring(0, 16) + '...', // Show partial hash for debugging
        userType: params.userType,
        institutionId: params.institutionId,
        note: 'Only hashes are sent, no raw PHI (phone/email) transmitted',
      })
      
      // For mock, we still pass plain account/password for testing
      return login.mockLogin(params).then((result) => {
        console.log('%c[Mock] Login API - Success', 'color: #52c41a; font-weight: bold', {
          result,
        })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Login API - Failed', 'color: #ff4d4f; font-weight: bold', {
          error: error.message,
        })
        throw error
      })
    })
  }

  // Production: Call real API with hashed account and password
  // Chrome DevTools will show only hashes in Network tab, proving no raw PHI is transmitted
  return defHttp.post<LoginResult>(
    {
      url: Api.Login,
      params: {
        accountHash, // Hash of account (phone/email/username) - NO raw PHI
        accountPasswordHash, // Hash of account:password - NO raw password
        userType: params.userType,
        institutionId: params.institutionId,
      },
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: Search institutions by account hash and password hash
 * 
 * Security (HIPAA Compliance):
 * - Account (phone/email) is hashed (SHA-256) before sending to backend
 * - Password is hashed (SHA-256) before sending to backend
 * - Backend only receives hashes, never receives raw PHI (phone/email)
 * - This prevents PHI transmission and allows distinguishing accounts with same username
 * 
 * Note: Both account hash and password hash are required to distinguish accounts
 * Example: S2 and S3 both use username "S2" but different passwords
 * 
 * Forgot Password: Only when user requests password reset, raw phone/email is sent (HTTPS)
 * 
 * In development: Returns mock data directly for testing Vue components
 * In production: Calls real backend API
 */
export async function searchInstitutionsApi(
  account: string,
  password: string,
  userType: 'staff' | 'resident',
  mode: ErrorMessageMode = 'none',
) {
  // Import crypto utility
  const { hashAccount, hashAccountPassword } = await import('@/utils/crypto')
  
  // Hash account (phone/email/username) for HIPAA compliance
  // This ensures raw PHI is never transmitted to backend
  const accountHash = await hashAccount(account)
  
  // Hash account + password combination for secure transmission
  const accountPasswordHash = await hashAccountPassword(account, password)
  
  // In development with mock enabled, return mock data directly
  if (useMock) {
    // Use relative path to avoid Vite alias resolution issues in dynamic imports
    return import('../../../test/index').then(({ login }) => {
      console.log('%c[Mock] Institution Search API Request', 'color: #1890ff; font-weight: bold', {
        accountType: account.includes('@') ? 'email' : /^\d+$/.test(account.replace(/\D/g, '')) ? 'phone' : 'username',
        accountHash: accountHash.substring(0, 16) + '...', // Show partial hash for debugging
        accountPasswordHash: accountPasswordHash.substring(0, 16) + '...', // Show partial hash for debugging
        userType,
        note: 'Only hashes are sent, no raw PHI (phone/email) transmitted',
      })
      
      // For mock, we still pass plain account/password for testing, but in production only hashes are sent
      return login.mockSearchInstitutions(account, password, userType).then((result) => {
        console.log('%c[Mock] Institution Search API - Result', 'color: #1890ff; font-weight: bold', {
          count: result.length,
          institutions: result,
        })
        return result
      })
    })
  }

  // Production: Call real API with hashed account and password
  // Chrome DevTools will show only hashes in Network tab, proving no raw PHI is transmitted
  return defHttp.get<Institution[]>(
    {
      url: Api.SearchInstitutions,
      params: {
        accountHash, // Hash of account (phone/email/username) - NO raw PHI
        accountPasswordHash, // Hash of account:password - NO raw password
        userType,
      },
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: Send verification code for forgot password
 * 
 * Security Note:
 * - For forgot password, we transmit raw phone/email (via HTTPS) for verification code delivery
 * - This is acceptable because:
 *   1. User explicitly requests password reset (user-initiated action)
 *   2. Verification code is sent to user's own phone/email
 *   3. HTTPS encryption protects transmission
 * - Institution name is REQUIRED to prevent duplicate accounts across institutions
 * 
 * In development: Returns mock data directly for testing Vue components
 * In production: Calls real backend API
 */
export async function sendVerificationCodeApi(
  params: SendVerificationCodeParams,
  mode: ErrorMessageMode = 'modal',
): Promise<ForgotPasswordResult> {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('../../../test/index').then(({ forgotPassword }) => {
      console.log('%c[Mock] Send Verification Code API Request', 'color: #1890ff; font-weight: bold', {
        account: params.account,
        userType: params.userType,
        institutionName: params.institutionName,
        institutionId: params.institutionId,
        note: 'Raw phone/email transmitted via HTTPS for verification code delivery',
      })
      
      return forgotPassword.mockSendVerificationCode(params).then((result: any) => {
        console.log('%c[Mock] Send Verification Code API - Success', 'color: #52c41a; font-weight: bold', {
          result,
        })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Send Verification Code API - Failed', 'color: #ff4d4f; font-weight: bold', {
          error: error.message,
        })
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.post<ForgotPasswordResult>(
    {
      url: Api.SendVerificationCode,
      params: {
        account: params.account, // Raw phone/email (HTTPS encrypted)
        userType: params.userType,
        institutionName: params.institutionName, // REQUIRED
        institutionId: params.institutionId,
      },
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: Verify verification code
 * 
 * In development: Returns mock data directly for testing Vue components
 * In production: Calls real backend API
 */
export async function verifyCodeApi(
  params: VerifyCodeParams,
  mode: ErrorMessageMode = 'modal',
): Promise<ForgotPasswordResult> {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('../../../test/index').then(({ forgotPassword }) => {
      console.log('%c[Mock] Verify Code API Request', 'color: #1890ff; font-weight: bold', {
        account: params.account,
        code: params.code,
        userType: params.userType,
        institutionName: params.institutionName,
      })
      
      return forgotPassword.mockVerifyCode(params).then((result: any) => {
        console.log('%c[Mock] Verify Code API - Success', 'color: #52c41a; font-weight: bold', {
          result,
        })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Verify Code API - Failed', 'color: #ff4d4f; font-weight: bold', {
          error: error.message,
        })
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.post<ForgotPasswordResult>(
    {
      url: Api.VerifyCode,
      params: {
        account: params.account,
        code: params.code,
        userType: params.userType,
        institutionName: params.institutionName, // REQUIRED
        institutionId: params.institutionId,
      },
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: Reset password
 * 
 * Security Note:
 * - New password will be hashed by backend before storage
 * - Frontend sends raw password (HTTPS encrypted) to backend
 * - Backend validates password strength according to DB requirements
 * 
 * In development: Returns mock data directly for testing Vue components
 * In production: Calls real backend API
 */
export async function resetPasswordApi(
  params: ResetPasswordParams,
  mode: ErrorMessageMode = 'modal',
): Promise<ForgotPasswordResult> {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('../../../test/index').then(({ forgotPassword }) => {
      console.log('%c[Mock] Reset Password API Request', 'color: #1890ff; font-weight: bold', {
        account: params.account,
        code: params.code,
        userType: params.userType,
        institutionName: params.institutionName,
        newPasswordLength: params.newPassword.length,
        note: 'New password will be hashed by backend',
      })
      
      return forgotPassword.mockResetPassword(params).then((result: any) => {
        console.log('%c[Mock] Reset Password API - Success', 'color: #52c41a; font-weight: bold', {
          result,
        })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Reset Password API - Failed', 'color: #ff4d4f; font-weight: bold', {
          error: error.message,
        })
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.post<ForgotPasswordResult>(
    {
      url: Api.ResetPassword,
      params: {
        account: params.account,
        code: params.code,
        newPassword: params.newPassword, // Raw password (HTTPS encrypted, will be hashed by backend)
        userType: params.userType,
        institutionName: params.institutionName, // REQUIRED
        institutionId: params.institutionId,
      },
    },
    {
      errorMessageMode: mode,
    },
  )
}

