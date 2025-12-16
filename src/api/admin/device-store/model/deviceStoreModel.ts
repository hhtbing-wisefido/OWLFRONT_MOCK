/**
 * Device Store models (DB-backed).
 * Mirrors owlRD/db/13_device_store.sql and frontend table fields.
 */

export interface DeviceStore {
  device_store_id: string
  device_type: string
  device_model?: string | null
  serial_number?: string | null
  uid?: string | null
  imei?: string | null
  comm_mode?: string | null
  mcu_model?: string | null
  firmware_version?: string | null
  ota_target_firmware_version?: string | null
  ota_target_mcu_model?: string | null
  tenant_id?: string | null
  tenant_name?: string | null
  allow_access: boolean
  import_date?: string | null
  allocate_time?: string | null
}

export interface GetDeviceStoresParams {
  page?: number
  size?: number
  search?: string
}

export interface GetDeviceStoresResult {
  items: DeviceStore[]
  total: number
}

export interface BatchUpdateDeviceStoresParams {
  updates: Array<{ device_store_id: string; data: Partial<DeviceStore> }>
}

export interface TenantLite {
  tenant_id: string
  tenant_name: string
}

/**
 * Import device stores response
 */
export interface ImportDeviceStoresResult {
  success: boolean
  total: number
  success_count: number
  failed_count: number
  skipped_count: number
  errors?: Array<{
    row: number
    serial_number?: string
    uid?: string
    error: string
  }>
  skipped?: Array<{
    row: number
    serial_number?: string
    uid?: string
    reason: string
  }>
}

/**
 * Export device stores parameters
 */
export interface ExportDeviceStoresParams {
  format?: 'excel' | 'csv'
  tenant_id?: string
  device_type?: string
  search?: string
}
