/**
 * Resident API data model definition
 * Corresponds to residents table structure in owlRD/db/08_residents.sql
 * 
 * Note: All field names use snake_case to match database schema (PostgreSQL standard)
 */

/**
 * Resident data model
 */
export interface Resident {
  resident_id: string
  tenant_id: string
  resident_account?: string
  nickname?: string
  email?: string
  phone?: string
  status: 'active' | 'discharged' | 'transferred'
  service_level?: string
  admission_date?: string // ISO 8601 format date string
  discharge_date?: string // ISO 8601 format date string
  note?: string
  unit_id?: string
  unit_name?: string
  branch_tag?: string
  building?: string // Building name (from units table)
  area_tag?: string // Area tag (from units table)
  unit_number?: string // Unit number (from units table)
  is_multi_person_room?: boolean // Is multi-person room (from units table)
  room_id?: string // Room ID (from rooms table)
  room_name?: string // Room name (from rooms table, via beds)
  bed_id?: string // Bed ID (from beds table)
  bed_name?: string // Bed name (from beds table)
  is_access_enabled?: boolean // Whether resident and family access is enabled
  family_tag?: string // Family identifier (VARCHAR(100), same family_tag for family members, e.g., 'F0001', 'F0002')
  // PHI data (from resident_phi table)
  phi?: ResidentPHI
  // Contacts data (from resident_contacts table)
  // Note: Family member accounts are managed via resident_contacts table (contact_family_tag field)
  // If contact_family_tag is empty, can only view the resident corresponding to resident_id
  contacts?: ResidentContact[]
}

/**
 * Resident PHI (Protected Health Information) data model
 * Corresponds to resident_phi table
 */
export interface ResidentPHI {
  phi_id?: string
  resident_id: string
  tenant_id?: string
  
  // Basic PHI
  first_name?: string              // 真实名字 (Given Name，PII)
  last_name?: string               // 真实姓氏 (Surname，PII)
  gender?: string                  // 性别：Male/Female/Other/Unknown
  date_of_birth?: string           // 出生日期 (ISO 8601 format)
  resident_phone?: string          // 住户个人电话
  resident_email?: string          // 住户个人邮箱
  
  // Biometric PHI（身高/体重）
  weight_lb?: number               // 体重 (lb)
  height_ft?: number               // 身高：feet
  height_in?: number               // 身高：inches
  
  // Functional Mobility（功能性活动能力）
  mobility_level?: number          // 0: 无行动能力 ~ 5: 完全独立
  
  // Functional Health（功能性健康状态）
  tremor_status?: string           // 颤抖状态：None/Mild/Severe
  mobility_aid?: string            // 行走辅助：Cane/Wheelchair/None
  adl_assistance?: string          // 日常活动协助：Independent/NeedsHelp
  comm_status?: string             // 沟通状态：Normal/SpeechDifficulty
  
  // Chronic Conditions / Medical History（老年常见慢病与病史）
  has_hypertension?: boolean       // 高血压（Hypertension）
  has_hyperlipaemia?: boolean      // 高血脂（Hyperlipaemia）
  has_hyperglycaemia?: boolean     // 高血糖 / 糖尿病（Hyperglycaemia / Diabetes）
  has_stroke_history?: boolean      // 既往脑卒中史（Stroke）
  has_paralysis?: boolean           // 肢体瘫痪/偏瘫（Paralysis）
  has_alzheimer?: boolean           // 阿尔茨海默病 / 痴呆（Alzheimer's disease / Dementia）
  medical_history?: string          // 其他病史说明（自由文本或半结构化描述）
  
  // 外部 HIS（医院信息系统）同步字段（包含 PII）
  HIS_resident_name?: string       // HIS 系统中的住户姓名（真实姓名，PII）
  HIS_resident_admission_date?: string  // HIS 系统中的入院日期
  HIS_resident_discharge_date?: string  // HIS 系统中的出院日期
  HIS_resident_metadata?: any       // HIS 系统中的其他元数据（JSONB）
  
  // 家庭地址信息（PHI，仅用于 Home 场景）
  home_address_street?: string      // 街道地址
  home_address_city?: string        // 城市
  home_address_state?: string       // 州/省
  home_address_postal_code?: string // 邮编
  plus_code?: string                // Google Plus Code 或类似全球编码
}

/**
 * Resident Contact data model
 * Corresponds to resident_contacts table
 */
export interface ResidentContact {
  contact_id?: string
  resident_id: string
  slot?: string // 'A', 'B', 'C', 'D', 'E'
  is_enabled?: boolean // 家属账号是否启用
  contact_first_name?: string
  contact_last_name?: string
  relationship?: string // 关系：如 Child/Spouse/Friend/Caregiver
  contact_phone?: string
  contact_email?: string
  phone_hash?: string // 手机号哈希，用于登录和找回密码
  email_hash?: string // 邮箱哈希，用于登录和找回密码
  contact_family_tag?: string // Family identifier for contact (if empty, can only view the resident corresponding to resident_id)
  receive_sms?: boolean // 是否接收短信
  receive_email?: boolean // 是否接收邮件
  // 前端使用的临时字段
  save_phone?: boolean // 是否保存手机号（用于重置密码）
  save_email?: boolean // 是否保存邮箱（用于重置密码）
  contact_password?: string // 临时字段：用于重置密码
  contact_password_confirm?: string // 临时字段：用于确认密码
  // 兼容旧字段
  contact_name?: string
  phone?: string
  email?: string
  is_primary?: boolean
  note?: string
}

/**
 * Get resident list request parameters
 */
export interface GetResidentsParams {
  search?: string // Search keyword (optional, for searching nickname, unit_name, etc.)
  status?: 'active' | 'discharged' | 'transferred' // Filter by status
  service_level?: string // Filter by service level
}

/**
 * Get resident list response
 */
export interface GetResidentsResult {
  items: Resident[]
  total: number
}

/**
 * Get resident detail request parameters
 */
export interface GetResidentParams {
  include_phi?: boolean // Whether to include PHI data
  include_contacts?: boolean // Whether to include contacts
}

/**
 * Create resident request parameters
 */
export interface CreateResidentParams {
  resident_account?: string
  first_name?: string // First name (required in create mode)
  last_name?: string // Last name
  nickname?: string
  email?: string
  phone?: string
  status?: 'active' | 'discharged' | 'transferred'
  service_level?: string
  admission_date?: string
  unit_id?: string
  is_access_enabled?: boolean // Whether resident and family access is enabled
  family_tag?: string // Family identifier (VARCHAR(100), same family_tag for family members, e.g., 'F0001', 'F0002')
  note?: string
}

/**
 * Create resident response
 */
export interface CreateResidentResult {
  resident_id: string
}

/**
 * Update resident request parameters
 */
export interface UpdateResidentParams {
  resident_account?: string // Resident account (manually created/modified)
  first_name?: string // First name
  last_name?: string // Last name
  nickname?: string
  email?: string
  phone?: string
  status?: 'active' | 'discharged' | 'transferred'
  service_level?: string
  admission_date?: string
  discharge_date?: string
  unit_id?: string
  is_access_enabled?: boolean // Whether resident and family access is enabled
  family_tag?: string // Family identifier (VARCHAR(100), same family_tag for family members, e.g., 'F0001', 'F0002')
  note?: string
}

/**
 * Update resident PHI request parameters
 * Note: All fields are optional, only provided fields will be updated
 */
export interface UpdateResidentPHIParams {
  // Basic PHI
  first_name?: string
  last_name?: string
  gender?: string
  date_of_birth?: string
  resident_phone?: string | null
  resident_email?: string | null
  phone_hash?: string | null // 手机号哈希，用于登录（前端计算）
  email_hash?: string | null // 邮箱哈希，用于登录（前端计算）
  
  // Biometric PHI
  weight_lb?: number
  height_ft?: number
  height_in?: number
  
  // Functional Mobility
  mobility_level?: number
  
  // Functional Health
  tremor_status?: string
  mobility_aid?: string
  adl_assistance?: string
  comm_status?: string
  
  // Chronic Conditions
  has_hypertension?: boolean
  has_hyperlipaemia?: boolean
  has_hyperglycaemia?: boolean
  has_stroke_history?: boolean
  has_paralysis?: boolean
  has_alzheimer?: boolean
  medical_history?: string
  
  // HIS Integration
  HIS_resident_name?: string
  HIS_resident_admission_date?: string
  HIS_resident_discharge_date?: string
  HIS_resident_metadata?: any
  
  // Home Address
  home_address_street?: string
  home_address_city?: string
  home_address_state?: string
  home_address_postal_code?: string
  plus_code?: string
}

/**
 * Update resident contact request parameters
 * Corresponds to resident_contacts table structure
 */
export interface UpdateResidentContactParams {
  contact_id?: string
  slot?: string // 'A', 'B', 'C', 'D', 'E'
  is_enabled?: boolean
  contact_first_name?: string
  contact_last_name?: string
  relationship?: string // Child/Spouse/Friend/Caregiver/Other
  contact_phone?: string | null
  contact_email?: string | null
  phone_hash?: string | null // 手机号哈希，用于登录（前端计算）
  email_hash?: string | null // 邮箱哈希，用于登录（前端计算）
  contact_family_tag?: string
  receive_sms?: boolean // 是否接收短信
  receive_email?: boolean // 是否接收邮件
  contact_password?: string // 密码（用于更新 password_hash）
  // Legacy fields for backward compatibility
  contact_name?: string
  phone?: string
  email?: string
  is_primary?: boolean
  note?: string
}

