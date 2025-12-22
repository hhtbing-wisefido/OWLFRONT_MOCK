/**
 * Unit API data model
 */

export interface Unit {
  unit_id: string
  tenant_id: string
  branch_name?: string // Location name (e.g., "AreaA MainBuild", "Spring SP")
  unit_name: string // Unit name (colloquial, memorable, e.g., "E203", "201", "Home-001")
  building?: string // Building (Facility scenario, 允许 NULL/undefined)
  floor?: string // Floor (Facility scenario, default: "1F")
  area_name?: string // Area name (Facility scenario, uses tags_catalog)
  unit_number: string // Unit number (Facility scenario, e.g., "201", "E203")
  layout_config?: Record<string, any> // Layout configuration (JSONB)
  unit_type: 'Facility' | 'Home' // Facility / Home scenario types
  primary_resident_id?: string // Primary resident (unit can only bind one resident)
  is_public_space?: boolean // Is public space (default: false)
  is_multi_person_room?: boolean // Is multi-person room (default: false)
  timezone?: string // IANA timezone format (e.g., "America/Los_Angeles")
  alarm_user_ids?: string[] // Alarm notification user IDs (direct assignment)
  alarm_tags?: string[] // Alarm notification tags (match users.tags)
  // Note: created_at and updated_at are not in database schema (05_units.sql)
}

export interface Building {
  building_id?: string
  building_name?: string  // 允许 undefined/null（不再使用 '-' 作为默认值）
  tenant_id?: string
  branch_name?: string // API layer uses branch_name
}

export interface CreateBuildingParams {
  building_name: string
  branch_name?: string // API layer uses branch_name
}

export interface UpdateBuildingParams {
  building_name?: string
  branch_name?: string // API layer uses branch_name
}

export interface CreateUnitParams {
  branch_tag?: string
  unit_name: string
  building?: string // 允许 NULL/undefined（如果为 NULL，保存为 NULL）
  floor?: string // Default: "1F"
  area_tag?: string
  unit_number: string
  layout_config?: Record<string, any>
  unit_type: 'Facility' | 'Home'
  primary_resident_id?: string
  is_public_space?: boolean // Default: false
  is_multi_person_room?: boolean // Default: false
  timezone?: string
  alarm_user_ids?: string[]
  alarm_tags?: string[]
}

export interface GetUnitsParams {
  tenant_id?: string
  branch_tag?: string
  unit_name?: string
  building?: string
  floor?: string
  area_tag?: string
  unit_number?: string
  unit_type?: 'Facility' | 'Home'
  primary_resident_id?: string
  is_public_space?: boolean
  is_multi_person_room?: boolean
  page?: number
  size?: number
}

export interface GetUnitsResult {
  items: Unit[]
  total: number
}

export interface UpdateUnitParams {
  branch_tag?: string
  unit_name?: string
  building?: string
  floor?: string
  area_tag?: string
  unit_number?: string
  layout_config?: Record<string, any>
  primary_resident_id?: string
  is_public_space?: boolean
  is_multi_person_room?: boolean
  timezone?: string
  alarm_user_ids?: string[]
  alarm_tags?: string[]
}

export interface Room {
  room_id: string
  tenant_id?: string // From database, optional in frontend
  unit_id: string
  room_name: string
  // Note: is_default is calculated by application layer (room_name === unit_name)
  // Backend API should return this field for convenience, but it's not stored in database
  is_default?: boolean // Calculated field: room_name === unit_name (returned by API, not in DB)
  layout_config?: Record<string, any> // Room-level layout configuration (JSONB, optional)
  // Note: created_at and updated_at are not in database schema
}

export interface Bed {
  bed_id: string
  tenant_id?: string // From database, optional in frontend
  room_id: string
  bed_name: string
  bed_type?: 'ActiveBed' | 'NonActiveBed' // Bed type (calculated by application layer, not auto-derived in DB)
  mattress_material?: string // Mattress material
  mattress_thickness?: string // Mattress thickness ('< 7in', '7-10in', '11-14in', '14in+')
  resident_id?: string // Bound resident (can only bind to bed in unit_room, room_name === unit_name)
  bound_device_count?: number // Count of bound active monitoring devices (auto-maintained by trigger)
  // Note: created_at and updated_at are not in database schema (07_beds.sql)
}

export interface RoomWithBeds extends Room {
  beds: Bed[]
}

export interface CreateRoomParams {
  unit_id: string
  room_name: string
  layout_config?: Record<string, any> // Optional room-level layout configuration
  // Note: is_default is calculated (room_name === unit_name), not a parameter
}

export interface CreateBedParams {
  room_id: string
  bed_name: string
  mattress_material?: string
  mattress_thickness?: string
}

export interface UpdateRoomParams {
  room_name?: string
  layout_config?: Record<string, any> // Optional room-level layout configuration
  // Note: is_default is calculated (room_name === unit_name), not updatable
}

export interface UpdateBedParams {
  bed_name?: string
  mattress_material?: string
  mattress_thickness?: string
  resident_id?: string | null // Bind/unbind resident
}

export interface GetRoomsParams {
  unit_id: string
}

export interface GetBedsParams {
  room_id: string
}
