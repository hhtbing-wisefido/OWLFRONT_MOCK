/**
 * Card Overview API Model
 * Based on card_overview table structure
 */

/**
 * Device Info (for card overview display)
 */
export interface CardOverviewDevice {
  device_id: string
  device_name: string
  device_type?: number  // 1=sleepace, 2=radar, etc.
  device_model?: string
}

/**
 * Resident Info (for card overview display)
 */
export interface CardOverviewResident {
  resident_id: string
  last_name: string
  first_name?: string
  nickname?: string
  service_level?: string  // e.g., 'L1', 'L2'
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
 */
export interface CardOverviewCaregiver {
  caregiver_id: string
  caregiver_name: string  // nickname or user_account
  role?: string
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
 */
export interface GetCardOverviewParams {
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

