/**
 * Location API 数据模型
 */

export interface Location {
  location_id: string
  tenant_id: string
  door_number: string // 门牌号（数字化、准确）
  location_name: string // 位置名称（口语化、易记）
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
  tag_name?: string // 标签名称
}

export interface CreateBuildingParams {
  building_name: string
  floors: number
  tag_name?: string // 标签名称
}

export interface UpdateBuildingParams {
  building_name?: string
  floors?: number
  tag_name?: string // 标签名称
}

export interface CreateLocationParams {
  door_number: string
  location_name: string
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
  door_number?: string
  location_name?: string
  is_active?: boolean
  page?: number
  size?: number
}

export interface GetLocationsResult {
  items: Location[]
  total: number
}

export interface UpdateLocationParams {
  location_name?: string
  building?: string
  floor?: string
  location_tag?: string
  area_tag?: string
}

