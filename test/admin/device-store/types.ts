/**
 * Device Store 类型定义
 * 对应 device_store 表结构
 */

export interface DeviceStore {
  device_store_id: string
  device_type: string
  device_model?: string
  serial_number?: string
  uid?: string
  imei?: string
  comm_mode?: string
  mcu_model?: string
  firmware_version?: string
  ota_target_firmware_version?: string
  ota_target_mcu_model?: string
  tenant_id?: string | null
  tenant_name?: string | null // Joined from tenants table
  allow_access: boolean
  import_date?: string
  allocate_time?: string | null
}

export interface Tenant {
  tenant_id: string
  tenant_name: string
}

