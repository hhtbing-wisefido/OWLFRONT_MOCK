/**
 * Login parameters (internal use only)
 * Note: These are the raw values from the form
 * Before sending to API, account and password are hashed
 */
export interface LoginParams {
  account: string // Username, Email, or Phone (will be hashed before API call)
  password: string // Password (will be hashed before API call)
  userType: 'staff' | 'resident'
  institutionId?: string
}

/**
 * Login API request parameters (what is actually sent to backend)
 * Note: Only hashes are sent, no raw PHI (phone/email) is transmitted
 * This ensures HIPAA compliance - Chrome DevTools will show only hashes
 */
export interface LoginApiParams {
  accountHash: string // SHA-256 hash of account (phone/email/username) - NO raw PHI
  accountPasswordHash: string // SHA-256 hash of account:password - NO raw password
  userType: 'staff' | 'resident'
  institutionId?: string
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
  userId: string
  userType: 'staff' | 'resident'
  institutionId?: string
  institutionName?: string
  // Staff-specific fields
  role?: string
  username?: string
  email?: string
  phone?: string
}

export interface Institution {
  id: string           // 机构 ID（对应 tenants.tenant_id，UUID）
  name: string         // 机构名称（对应 tenants.tenant_name）
  domain?: string       // 机构域名（对应 tenants.domain，可选）
}

/**
 * Forgot Password API parameters
 * Note: For forgot password, we transmit raw phone/email (HTTPS) for verification code delivery
 * 
 * Important: Institution name is REQUIRED to prevent duplicate accounts across multiple institutions
 * Example: Same phone number may exist in multiple institutions (S2 in Sunset and Golden)
 */
export interface SendVerificationCodeParams {
  account: string      // Phone or Email (raw value, transmitted via HTTPS)
  userType: 'staff' | 'resident'
  institutionName: string  // REQUIRED: Institution name (to prevent duplicates across institutions)
  institutionId?: string   // Optional: Institution ID (if available)
}

export interface VerifyCodeParams {
  account: string      // Phone or Email (raw value, transmitted via HTTPS)
  code: string         // 6-digit verification code
  userType: 'staff' | 'resident'
  institutionName: string  // REQUIRED: Institution name
  institutionId?: string
}

export interface ResetPasswordParams {
  account: string      // Phone or Email (raw value, transmitted via HTTPS)
  code: string         // 6-digit verification code
  newPassword: string  // New password (will be hashed by backend)
  userType: 'staff' | 'resident'
  institutionName: string  // REQUIRED: Institution name
  institutionId?: string
}

export interface ForgotPasswordResult {
  success: boolean
  message: string
  adminEmail?: string  // Admin email for the institution (for display)
}

