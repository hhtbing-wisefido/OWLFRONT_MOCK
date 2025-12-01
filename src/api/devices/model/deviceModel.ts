/**
 * Device API data model definition
 * Corresponds to devices table structure in owlRD/db/12_devices.sql
 * 
 * Note: Physical attributes (device_type, device_model, imei, comm_mode, mcu_model, firmware_version)
 * are stored in device_store table and retrieved via device_store_id JOIN.
 */

/**
 * Device basic information (tenant device management interface)
 */
export interface Device {
  device_id: string
  tenant_id: string
  device_store_id?: string // Reference to device_store table (for physical attributes and firmware version)
  device_name: string // Editable
  // Physical attributes (read-only, retrieved from device_store via device_store_id JOIN)
  device_model?: string // Read-only, from device_store.device_model
  device_type?: string // 'Radar' | 'SleepPad' | 'VibrationSensor' | 'Gateway' | ..., read-only, from device_store.device_type
  serial_number?: string // Read-only, from devices.serial_number
  uid?: string // Read-only, from devices.uid
  imei?: string // Read-only, from device_store.imei
  comm_mode?: string // 'WiFi' | 'LTE' | 'Zigbee' | ..., read-only, from device_store.comm_mode
  firmware_version?: string // Read-only, from device_store.firmware_version
  mcu_model?: string // Read-only, from device_store.mcu_model
  // Status and permissions
  status: 'online' | 'offline' | 'error' | 'disabled' // Read-only, real-time status snapshot
  business_access: 'pending' | 'approved' | 'rejected' // Editable, tenant business access permission
  monitoring_enabled?: boolean // Monitoring enabled status
  // Location binding (mutually exclusive: device must bind to Room OR Bed, not both)
  unit_id?: string | null // For quick query (device must be bound to room or bed via bound_room_id or bound_bed_id)
  bound_room_id?: string | null // Bind to Room (mutually exclusive with bound_bed_id)
  bound_bed_id?: string | null // Bind to Bed (mutually exclusive with bound_room_id)
  // Extended configuration / tags
  metadata?: Record<string, any> // IoT device properties snapshot (e.g., RadarSpecificProperties from vue_radar)
  // Legacy field (may not exist in database)
  device_code?: string // Device code (if needed)
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
  // Device binding fields (mutually exclusive: device must bind to Room OR Bed, not both)
  // Note: When binding to unit, application layer should create unit_room (room_name === unit_name) and set bound_room_id
  bound_room_id?: string | null // Bind to Room (mutually exclusive with bound_bed_id)
  bound_bed_id?: string | null // Bind to Bed (mutually exclusive with bound_room_id)
  // unit_id is kept for quick query and initial binding state, but device must be bound to room or bed
  unit_id?: string | null // For quick query (device must be bound to room or bed via bound_room_id or bound_bed_id)
}

/**
 * Delete device request parameters
 */
export interface DeleteDeviceParams {
  device_id: string
}

