/**
 * Address API data model
 * Address is the parent of Unit, one Address can contain multiple Units
 */

export interface Address {
  address_id: string
  tenant_id: string
  address_name: string // Address name
  address_type?: 'home' | 'institution' // Address type
  description?: string // Description
  is_active: boolean // Status (active/disabled)
  created_at?: string
  updated_at?: string
}

export interface CreateAddressParams {
  address_name: string
  address_type?: 'home' | 'institution'
  description?: string
}

export interface UpdateAddressParams {
  address_name?: string
  address_type?: 'home' | 'institution'
  description?: string
  is_active?: boolean
}

export interface GetAddressesParams {
  tenant_id?: string
  address_name?: string
  address_type?: 'home' | 'institution'
  is_active?: boolean
  page?: number
  size?: number
}

export interface GetAddressesResult {
  items: Address[]
  total: number
}

/**
 * Allocate related interfaces (reserved, to be implemented later)
 */
export interface AllocateCarrierParams {
  address_id: string
  carrier_id: string
  // Other allocation related fields
}

export interface AllocateResidentParams {
  address_id: string
  resident_id: string
  // Other allocation related fields
}

export interface AllocateDeviceParams {
  address_id: string
  device_id: string
  // Other allocation related fields
}

