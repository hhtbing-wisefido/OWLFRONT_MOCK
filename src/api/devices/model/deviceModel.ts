/**
 * Device API data model definition
 * Corresponds to devices table structure in owlRD/db/11_devices.sql
 */

/**
 * Device basic information (tenant device management interface)
 */
export interface Device {
  device_id: string
  tenant_id: string
  device_name: string // Editable
  device_model: string // Read-only, read from device
  device_type: string // 'Radar' | 'SleepPad' | 'VibrationSensor' | 'Gateway' | ..., read-only, read from device
  serial_number?: string // Read-only, read from device
  uid?: string // Read-only, read from device
  imei?: string // Read-only, read from device
  comm_mode: string // 'WiFi' | 'LTE' | 'Zigbee' | ..., read-only, read from device
  firmware_version: string // Read-only, read from device
  mcu_model?: string // Read-only, read from device
  status: 'online' | 'offline' | 'error' | 'disabled' // Read-only, read from device
  business_access: 'pending' | 'approved' | 'rejected' // Editable, tenant business access permission
  monitoring_enabled?: boolean // Monitoring enabled status
  device_code?: string // Device code
  // The following fields are not handled in tenant device management interface:
  // location_id?: string // Handled in Location module
  // bound_room_id?: string // Handled in Location module
  // bound_bed_id?: string // Handled in Location module
  // metadata?: Record<string, any> // Handled in alarm/IoT alarm monitor module
}

/**
 * Get device list request parameters
 */
export interface GetDevicesParams {
  tenant_id?: string // Tenant ID (optional, if not provided, use current user's tenant_id)
  device_type?: string // Device type filter (optional)
  status?: string[] // Status filter (optional, array: ['online', 'offline', 'error', 'disabled'])
  business_access?: 'pending' | 'approved' | 'rejected' // Approval status filter (optional)
  search_type?: 'device_name' | 'serial_number' | 'uid' // Search type (optional)
  search_keyword?: string // Search keyword (optional)
  page?: number // Page number (optional)
  size?: number // Page size (optional)
  sort?: string // Sort field (optional)
  direction?: 'asc' | 'desc' // Sort direction (optional)
}

/**
 * Get device list response
 */
export interface GetDevicesResult {
  items: Device[]
  total: number
}

/**
 * Update device request parameters
 */
export interface UpdateDeviceParams {
  device_name?: string
  business_access?: 'pending' | 'approved' | 'rejected'
  // Device binding fields
  location_id?: string | null // Bind to Unit (location)
  bound_room_id?: string | null // Bind to Room
  bound_bed_id?: string | null // Bind to Bed
}

/**
 * Delete device request parameters
 */
export interface DeleteDeviceParams {
  device_id: string
}

