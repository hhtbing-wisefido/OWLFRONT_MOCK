/**
 * Login parameters (internal use only)
 * Note: These are the raw values from the form
 * Before sending to API, account and password are hashed
 */
export interface LoginParams {
  account: string // user_account, Email, or Phone (will be hashed before API call)
  password: string // password (will be hashed before API call)
  userType: 'staff' | 'resident'
  tenant_id?: string  // tenant_id (对应 tenants.tenant_id)
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
  userId: string
  user_account?: string  // 用户账号（非敏感，用于显示和标识）- 登录成功时保存
  userType: 'staff' | 'resident'  // 登录成功时保存
  residentType?: 'home' | 'institution'  // Resident 子类型（仅 Resident 需要）- 对应 residents.is_institutional
  locationType?: 'home' | 'institution'  // Location 类型（当前用户关联的 location）- 对应 locations.location_type
  role?: string  // 角色编码（如 'Admin', 'Nurse', 'Caregiver'）- 登录成功时保存，用于前端页面展示控制
  nickName?: string  // 昵称/显示名称（非敏感，用于 UI 显示）
  
  // 机构信息（tenant 表）
  tenant_id?: string  // 机构 ID（对应 tenants.tenant_id）- 登录成功时保存
  tenant_name?: string  // 机构名称（对应 tenants.tenant_name）- 登录成功时保存
  domain?: string  // 机构域名（对应 tenants.domain）- 登录成功时保存
  
  // Location 信息（避免地址泄漏，仅存储非敏感的位置标识）
  locationTag?: string  // 位置标签（对应 locations.location_tag，如 "A 院区主楼"）- 非敏感，用于分组和路由
  locationName?: string  // 位置名称（对应 locations.location_name，如 "E203"、"Home-001"）- 非敏感，用于卡片显示
  
  // 其他信息
  homePath?: string  // 用户首页路径（用于登录后跳转，由后端根据 userType 和 role 计算）
  avatar?: string    // 头像 URL（可选，用于用户头像显示）
  
  // 注意：以下敏感信息不应该存储在本地（HIPAA 合规）
  // 如果需要显示，应该从服务器 API 获取（使用 token）
  // email?: string        // 不存储（PHI，敏感信息）
  // phone?: string        // 不存储（PHI，敏感信息）
  // residentAccount?: string  // 不存储（可能包含敏感信息）
  // 注意：user_account 可以存储（非敏感，用于显示和标识，不包含 PHI）
  // building, floor, area_id, door_number 等详细地址信息不存储（可能包含敏感信息）
  
  // 关于 role 存储的说明：
  // - role 是角色编码（如 'Admin', 'Nurse'），是公开的角色标识，不是敏感的个人信息
  // - 用于前端控制页面展示（菜单、按钮的显示/隐藏）
  // - 真实的权限控制仍在后台（role_permissions 表）
  // - 前端仅用于 UI 展示控制，不用于安全验证
  
  // 关于 residentType 和 locationType 的说明：
  // - residentType: 对应 residents.is_institutional (TRUE = 'institution', FALSE = 'home')
  // - locationType: 对应 locations.location_type (当前用户关联的 location 类型)
  // - 两者可能不同：例如，Resident 是 home 类型，但其 location 可能是 institution 类型
  
  // 关于 locationTag 和 locationName 的说明：
  // - locationTag: 位置标签（如 "A 院区主楼"、"Spring 区域组SP"），用于分组和路由，不包含 PHI
  // - locationName: 位置名称（如 "E203"、"201"、"Home-001"），用于卡片显示，不包含 PHI
  // - 真实地址信息（如城市、州省、邮编等）存储在加密的 resident_phi 表中，不在此处存储
  // - 这些字段符合 HIPAA 要求，不包含敏感信息
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
  account: string      // user_account, Email, or Phone (raw value, transmitted via HTTPS)
  userType: 'staff' | 'resident'
  tenant_name: string  // REQUIRED: Institution name (对应 tenants.tenant_name，防止跨机构重复账号)
  tenant_id?: string   // Optional: Institution ID (对应 tenants.tenant_id)
}

export interface VerifyCodeParams {
  account: string      // Phone or Email (raw value, transmitted via HTTPS)
  code: string         // 6-digit verification code
  userType: 'staff' | 'resident'
  tenant_name: string  // REQUIRED: Institution name (对应 tenants.tenant_name)
  tenant_id?: string   // Optional: Institution ID (对应 tenants.tenant_id)
}

export interface ResetPasswordParams {
  account: string      // Phone or Email (raw value, transmitted via HTTPS)
  code: string         // 6-digit verification code
  newPassword: string  // New password (will be hashed by backend)
  userType: 'staff' | 'resident'
  tenant_name: string  // REQUIRED: Institution name (对应 tenants.tenant_name)
  tenant_id?: string   // Optional: Institution ID (对应 tenants.tenant_id)
}

export interface ForgotPasswordResult {
  success: boolean
  message: string
  adminEmail?: string  // Admin email for the institution (for display)
}

