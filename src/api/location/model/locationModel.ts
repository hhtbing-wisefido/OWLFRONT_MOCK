/**
 * Location API 数据模型
 */

export interface Location {
  location_id: string
  tenant_id: string
  unit_number: string // 单元号（数字化、准确）
  unit_name: string // 单元名称（口语化、易记）
  building?: string // 建筑标签
  floor?: string // 楼层标签
  location_tag?: string // 位置标签
  area_tag?: string // 区域标签
  location_type: 'home' | 'institution' // 位置类型
  is_active: boolean // 状态（active/disabled）
  created_at?: string
  updated_at?: string
}

export interface Building {
  building_id?: string
  building_name: string
  floors: number // 楼层数量
  tenant_id?: string
  location_tag?: string // API层使用 location_tag
}

export interface CreateBuildingParams {
  building_name: string
  floors: number
  location_tag?: string // API层使用 location_tag
}

export interface UpdateBuildingParams {
  building_name?: string
  floors?: number
  location_tag?: string // API层使用 location_tag
}

export interface CreateLocationParams {
  unit_number: string
  unit_name: string
  building?: string
  floor?: string
  location_tag?: string
  area_tag?: string
  location_type: 'home' | 'institution'
}

export interface GetLocationsParams {
  tenant_id?: string
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

export interface GetLocationsResult {
  items: Location[]
  total: number
}

export interface UpdateLocationParams {
  unit_name?: string
  building?: string
  floor?: string
  location_tag?: string
  area_tag?: string
}

export interface Room {
  room_id: string
  location_id: string
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
  location_id: string
  room_name: string
  is_default?: boolean
}

export interface CreateBedParams {
  room_id: string
  bed_name: string
}

export interface GetRoomsParams {
  location_id: string
}

export interface GetBedsParams {
  room_id: string
}

