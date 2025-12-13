export type TenantStatus = 'active' | 'suspended' | 'deleted'

export interface Tenant {
  tenant_id: string
  tenant_name: string
  domain?: string
  email?: string
  phone?: string
  status: TenantStatus
  metadata?: any
}

export interface GetTenantsParams {
  status?: TenantStatus
  page?: number
  size?: number
}

export interface GetTenantsResult {
  items: Tenant[]
  total: number
}

export interface CreateTenantParams {
  tenant_name: string
  domain?: string
  email?: string
  phone?: string
  status?: TenantStatus
  metadata?: any
}

export interface UpdateTenantParams {
  tenant_name?: string
  domain?: string
  email?: string
  phone?: string
  status?: TenantStatus
  metadata?: any
}


