/**
 * Location API Mock 实现
 */

import type {
  Building,
  Location,
  CreateBuildingParams,
  UpdateBuildingParams,
  CreateLocationParams,
  GetLocationsParams,
  GetLocationsResult,
  UpdateLocationParams,
} from '@/api/location/model/locationModel'
import { mockBuildingsData, mockLocationsData } from './data'

let buildings: Building[] = [...mockBuildingsData]
let locations: Location[] = [...mockLocationsData]
let buildingIdCounter = buildings.length + 1
let locationIdCounter = locations.length + 1

export function mockCreateBuilding(params: CreateBuildingParams & { tag_name?: string }): Building {
  const newBuilding: Building & { tag_name?: string } = {
    building_id: `building-${buildingIdCounter++}`,
    building_name: params.building_name,
    floors: params.floors,
    tenant_id: 'tenant-1',
    tag_name: params.tag_name,
  }
  buildings.push(newBuilding as Building)
  return newBuilding as Building
}

export function mockGetBuildings(): Building[] {
  return [...buildings]
}

export function mockUpdateBuilding(id: string, params: UpdateBuildingParams): Building {
  const index = buildings.findIndex((b) => b.building_id === id)
  if (index === -1) {
    throw new Error(`Building with id ${id} not found`)
  }
  const updated = {
    ...buildings[index],
    ...params,
  }
  buildings[index] = updated
  return { ...updated }
}

export function mockDeleteBuilding(id: string): void {
  const index = buildings.findIndex((b) => b.building_id === id)
  if (index === -1) {
    throw new Error(`Building with id ${id} not found`)
  }
  buildings.splice(index, 1)
}

export function mockCreateLocation(params: CreateLocationParams): Location {
  const newLocation: Location = {
    location_id: `location-${locationIdCounter++}`,
    tenant_id: 'tenant-1',
    door_number: params.door_number,
    location_name: params.location_name,
    building: params.building,
    floor: params.floor,
    location_tag: params.location_tag,
    area_tag: params.area_tag,
    location_type: params.location_type,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  locations.push(newLocation)
  return newLocation
}

export function mockGetLocations(params: GetLocationsParams): GetLocationsResult {
  let filtered = [...locations]

  // 过滤
  if (params.building) {
    filtered = filtered.filter((loc) => loc.building === params.building)
  }
  if (params.floor) {
    filtered = filtered.filter((loc) => loc.floor === params.floor)
  }
  if (params.location_tag) {
    filtered = filtered.filter((loc) => loc.location_tag === params.location_tag)
  }
  if (params.area_tag) {
    filtered = filtered.filter((loc) => loc.area_tag === params.area_tag)
  }
  if (params.door_number) {
    filtered = filtered.filter((loc) =>
      loc.door_number.toLowerCase().includes(params.door_number!.toLowerCase())
    )
  }
  if (params.location_name) {
    filtered = filtered.filter((loc) =>
      loc.location_name.toLowerCase().includes(params.location_name!.toLowerCase())
    )
  }
  if (params.is_active !== undefined) {
    filtered = filtered.filter((loc) => loc.is_active === params.is_active)
  } else {
    // 默认只返回 active 的
    filtered = filtered.filter((loc) => loc.is_active)
  }

  // 分页
  const page = params.page || 1
  const size = params.size || 100
  const start = (page - 1) * size
  const end = start + size
  const items = filtered.slice(start, end)

  return {
    items,
    total: filtered.length,
  }
}

export function mockGetLocationDetail(id: string): Location {
  const location = locations.find((loc) => loc.location_id === id)
  if (!location) {
    throw new Error(`Location with id ${id} not found`)
  }
  return { ...location }
}

export function mockUpdateLocation(id: string, params: UpdateLocationParams): Location {
  const index = locations.findIndex((loc) => loc.location_id === id)
  if (index === -1) {
    throw new Error(`Location with id ${id} not found`)
  }
  const updated = {
    ...locations[index],
    ...params,
    updated_at: new Date().toISOString(),
  }
  locations[index] = updated
  return { ...updated }
}

export function mockDeleteLocation(id: string): void {
  const index = locations.findIndex((loc) => loc.location_id === id)
  if (index === -1) {
    throw new Error(`Location with id ${id} not found`)
  }
  // 软删除
  locations[index].is_active = false
}

