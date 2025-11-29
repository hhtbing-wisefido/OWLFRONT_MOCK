/**
 * Unit API data model
 */

export interface Unit {
  unit_id: string
  tenant_id: string
  address_id?: string // Associated Address ID (new)
  unit_number: string // Unit number (digitalized, accurate)
  unit_name: string // Unit name (colloquial, memorable)
  unit_type: 'Facility' | 'Home' // Facility / Home scenario types (replaces location_type)
  building?: string // Building tag
  floor?: string // Floor tag
  location_tag?: string // Location tag
  area_tag?: string // Area tag
  is_active: boolean // Status (active/disabled)
  created_at?: string
  updated_at?: string
}

export interface Building {
  building_id?: string
  building_name: string
  floors: number // Number of floors
  tenant_id?: string
  location_tag?: string // API layer uses location_tag
}

export interface CreateBuildingParams {
  building_name: string
  floors: number
  location_tag?: string // API layer uses location_tag
}

export interface UpdateBuildingParams {
  building_name?: string
  floors?: number
  location_tag?: string // API layer uses location_tag
}

export interface CreateUnitParams {
  address_id?: string // Associated Address ID (new)
  unit_number: string
  unit_name: string
  unit_type: 'Facility' | 'Home' // Facility / Home scenario types (replaces location_type)
  building?: string
  floor?: string
  location_tag?: string
  area_tag?: string
}

export interface GetUnitsParams {
  tenant_id?: string
  address_id?: string // Filter by Address ID (new)
  building?: string
  floor?: string
  location_tag?: string
  area_tag?: string
  unit_number?: string
  unit_name?: string
  is_active?: boolean
  page?: number
  size?: number
}

export interface GetUnitsResult {
  items: Unit[]
  total: number
}

export interface UpdateUnitParams {
  unit_name?: string
  building?: string
  floor?: string
  location_tag?: string
  area_tag?: string
}

export interface Room {
  room_id: string
  unit_id: string
  room_name: string
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export interface Bed {
  bed_id: string
  room_id: string
  bed_name: string
  created_at?: string
  updated_at?: string
}

export interface RoomWithBeds extends Room {
  beds: Bed[]
}

export interface CreateRoomParams {
  unit_id: string
  room_name: string
  is_default?: boolean
}

export interface CreateBedParams {
  room_id: string
  bed_name: string
}

export interface UpdateRoomParams {
  room_name?: string
  is_default?: boolean
}

export interface UpdateBedParams {
  bed_name?: string
}

export interface GetRoomsParams {
  unit_id: string
}

export interface GetBedsParams {
  room_id: string
}
