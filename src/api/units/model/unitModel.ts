/**
 * Unit API 数据模型
 */

export interface Unit {
  unit_id: string
  tenant_id: string
  address_id?: string // 关联的 Address ID（新增）
  unit_number: string // 单元号（数字化、准确）
  unit_name: string // 单元名称（口语化、易记）
  unit_type: 'Facility' | 'Home' // Facility / Home 等场景类型（替代了 location_type）
  building?: string // 建筑标签（可选，Home 类型可能没有）
  floor?: string // 楼层标签（可选，Home 类型可能没有）
  location_tag?: string // 位置标签
  area_tag?: string // 区域标签
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

export interface CreateUnitParams {
  address_id?: string // 关联的 Address ID（新增）
  unit_number: string
  unit_name: string
  unit_type: 'Facility' | 'Home' // Facility / Home 等场景类型（替代了 location_type）
  building?: string // 建筑标签（可选，Home 类型可能没有）
  floor?: string // 楼层标签（可选，Home 类型可能没有）
  location_tag?: string
  area_tag?: string
}

export interface GetUnitsParams {
  tenant_id?: string
  address_id?: string // 按 Address ID 筛选（新增）
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
  unit_type?: 'Facility' | 'Home'
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

