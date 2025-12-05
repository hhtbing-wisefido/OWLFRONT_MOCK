/**
 * Card Overview API Model
 * Based on card_overview table structure
 */

/**
 * Device Info (for card overview display)
 * Extended with detailed information for card detail page
 */
export interface CardOverviewDevice {
  device_id: string
  device_name: string
  device_type?: number  // 1=sleepace, 2=radar, etc.
  device_model?: string
  // Extended fields for detail page
  serial_number?: string  // Device serial number
  uid?: string  // Device UID
  status?: 'online' | 'offline' | 'error' | 'disabled'  // Device online status
  business_access?: 'pending' | 'approved' | 'rejected'  // Business access permission
  monitoring_enabled?: boolean  // Monitoring enabled status
  bound_room_id?: string | null  // Bound to room
  bound_bed_id?: string | null  // Bound to bed
}

/**
 * Resident Info (for card overview display)
 * Extended with detailed information for card detail page
 */
export interface CardOverviewResident {
  resident_id: string
  last_name: string
  first_name?: string
  nickname?: string
  service_level?: string  // e.g., 'L1', 'L2'
  // Extended fields for detail page
  phi?: {
    gender?: string  // 'Male' | 'Female' | 'Other' | 'Unknown'
    date_of_birth?: string  // ISO 8601 format, for calculating age
    // ... other PHI fields as needed
  }
  contacts?: Array<{
    contact_id?: string
    contact_first_name?: string
    contact_last_name?: string
    relationship?: string  // 'Child' | 'Spouse' | 'Friend' | 'Caregiver' | ...
    contact_phone?: string
    contact_email?: string
    is_primary?: boolean
  }>
}

/**
 * Caregiver Group Info (for card overview display)
 */
export interface CardOverviewCaregiverGroup {
  group_id: string
  group_name: string
}

/**
 * Caregiver Info (for card overview display)
 * Extended with detailed information for card detail page
 */
export interface CardOverviewCaregiver {
  caregiver_id: string
  caregiver_name: string  // nickname or user_account
  role?: string
  // Extended fields for detail page
  phone?: string  // Phone number
  email?: string  // Email address
}

/**
 * Card Overview Item
 * Display-ready card information from card_overview table
 */
export interface CardOverviewItem {
  card_id: string
  card_name: string
  card_address: string  // location_tag-building-unit_name
  
  // Space type fields
  unit_type: 'Facility' | 'Home'
  is_multi_person_room: boolean  // Shared/Private
  is_public_space: boolean  // Public/非Public
  
  // Family view
  family_view: boolean  // 是否允许家属查看 (对应数据库字段 public)
  
  // Aggregated data (JSONB format for easy frontend use)
  devices: CardOverviewDevice[]
  residents: CardOverviewResident[]
  caregiver_groups: CardOverviewCaregiverGroup[]
  caregivers: CardOverviewCaregiver[]
  
  // Counts (for quick display)
  device_count: number
  resident_count: number
  caregiver_group_count: number
  caregiver_count: number
  
  // Tenant
  tenant_id: string
}

/**
 * Get Card Overview Parameters
 * Supports both list query and single card query
 */
export interface GetCardOverviewParams {
  card_id?: string  // Query single card by ID (when provided, returns single card or empty array)
  tenant_id?: string
  search?: string  // Search by card_name or card_address
  unit_type?: 'Facility' | 'Home'
  is_multi_person_room?: boolean
  is_public_space?: boolean
  family_view?: boolean  // Family view filter
  page?: number
  size?: number
  sort?: string
  direction?: 'asc' | 'desc'
}

/**
 * Get Card Overview Result
 */
export interface GetCardOverviewResult {
  items: CardOverviewItem[]
  pagination: {
    size: number
    page: number
    count: number
    total?: number
    sort?: string
    direction?: number
  }
}

