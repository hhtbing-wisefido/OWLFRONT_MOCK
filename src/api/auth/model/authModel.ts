/**
 * Login parameters (internal use only)
 * Note: These are the raw values from the form
 * Before sending to API, account and password are hashed
 */
export interface LoginParams {
  account: string // user_account, Email, or Phone (will be hashed before API call)
  password: string // password (will be hashed before API call)
  userType: 'staff' | 'resident'
  tenant_id?: string  // tenant_id (corresponds to tenants.tenant_id)
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
  userId: string
  user_account?: string  // User account (non-sensitive, for display and identification) - saved on login success
  userType: 'staff' | 'resident'  // Saved on login success
  residentType?: 'home' | 'institution'  // Resident subtype (only for Resident) - corresponds to residents.is_institutional
  locationType?: 'home' | 'institution'  // Location type (location associated with current user) - corresponds to locations.location_type
  role?: string  // Role code (e.g., 'Admin', 'Nurse', 'Caregiver') - saved on login success, for frontend page display control
  nickName?: string  // Nickname/display name (non-sensitive, for UI display)
  
  // Institution information (tenant table)
  tenant_id?: string  // Institution ID (corresponds to tenants.tenant_id) - saved on login success
  tenant_name?: string  // Institution name (corresponds to tenants.tenant_name) - saved on login success
  domain?: string  // Institution domain (corresponds to tenants.domain) - saved on login success
  
  // Location information (avoid address leakage, only store non-sensitive location identifiers)
  locationTag?: string  // Location tag (corresponds to locations.location_tag, e.g., "A Building Main") - non-sensitive, for grouping and routing
  locationName?: string  // Location name (corresponds to locations.location_name, e.g., "E203", "Home-001") - non-sensitive, for card display
  
  // Other information
  homePath?: string  // User home page path (for redirect after login, calculated by backend based on userType and role)
  avatar?: string    // Avatar URL (optional, for user avatar display)
  
  // Note: The following sensitive information should NOT be stored locally (HIPAA compliance)
  // If display is needed, should be fetched from server API (using token)
  // email?: string        // Not stored (PHI, sensitive information)
  // phone?: string        // Not stored (PHI, sensitive information)
  // residentAccount?: string  // Not stored (may contain sensitive information)
  // Note: user_account can be stored (non-sensitive, for display and identification, does not contain PHI)
  // Detailed address information like building, floor, area_id, door_number not stored (may contain sensitive information)
  
  // Notes on role storage:
  // - role is role code (e.g., 'Admin', 'Nurse'), a public role identifier, not sensitive personal information
  // - Used for frontend page display control (menu, button show/hide)
  // - Real permission control is still in backend (role_permissions table)
  // - Frontend only for UI display control, not for security verification
  
  // Notes on residentType and locationType:
  // - residentType: corresponds to residents.is_institutional (TRUE = 'institution', FALSE = 'home')
  // - locationType: corresponds to locations.location_type (location type associated with current user)
  // - They may differ: e.g., Resident is home type, but its location may be institution type
  
  // Notes on locationTag and locationName:
  // - locationTag: Location tag (e.g., "A Building Main", "Spring Area Group SP"), for grouping and routing, does not contain PHI
  // - locationName: Location name (e.g., "E203", "201", "Home-001"), for card display, does not contain PHI
  // - Real address information (e.g., city, state, zip code) stored in encrypted resident_phi table, not stored here
  // - These fields comply with HIPAA requirements, do not contain sensitive information
}

export interface Institution {
  id: string           // Institution ID (corresponds to tenants.tenant_id, UUID)
  name: string         // Institution name (corresponds to tenants.tenant_name)
  domain?: string       // Institution domain (corresponds to tenants.domain, optional)
}

/**
 * Forgot Password API parameters
 * Note: For forgot password, we transmit raw phone/email (HTTPS) for verification code delivery
 * 
 * Important: Institution name is REQUIRED to prevent duplicate accounts across multiple institutions
 * Example: Same phone number may exist in multiple institutions (S2 in Sunset and Golden)
 */
export interface SendVerificationCodeParams {
  account: string      // user_account, Email, or Phone (raw value, transmitted via HTTPS)
  userType: 'staff' | 'resident'
  tenant_name: string  // REQUIRED: Institution name (corresponds to tenants.tenant_name, prevents duplicate accounts across institutions)
  tenant_id?: string   // Optional: Institution ID (corresponds to tenants.tenant_id)
}

export interface VerifyCodeParams {
  account: string      // Phone or Email (raw value, transmitted via HTTPS)
  code: string         // 6-digit verification code
  userType: 'staff' | 'resident'
  tenant_name: string  // REQUIRED: Institution name (corresponds to tenants.tenant_name)
  tenant_id?: string   // Optional: Institution ID (corresponds to tenants.tenant_id)
}

export interface ResetPasswordParams {
  account: string      // Phone or Email (raw value, transmitted via HTTPS)
  code: string         // 6-digit verification code
  newPassword: string  // New password (will be hashed by backend)
  userType: 'staff' | 'resident'
  tenant_name: string  // REQUIRED: Institution name (corresponds to tenants.tenant_name)
  tenant_id?: string   // Optional: Institution ID (corresponds to tenants.tenant_id)
}

export interface ForgotPasswordResult {
  success: boolean
  message: string
  adminEmail?: string  // Admin email for the institution (for display)
}

