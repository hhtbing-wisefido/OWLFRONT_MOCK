/**
 * Address API 数据模型
 * Address 是 Unit 的父级，一个 Address 可以包含多个 Unit
 */

export interface Address {
  address_id: string
  tenant_id: string
  address_name: string // 地址名称
  address_type?: 'home' | 'institution' // 地址类型
  description?: string // 描述
  is_active: boolean // 状态（active/disabled）
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
 * Allocate 相关接口（预留，后续实现）
 */
export interface AllocateCarrierParams {
  address_id: string
  carrier_id: string
  // 其他分配相关字段
}

export interface AllocateResidentParams {
  address_id: string
  resident_id: string
  // 其他分配相关字段
}

export interface AllocateDeviceParams {
  address_id: string
  device_id: string
  // 其他分配相关字段
}

