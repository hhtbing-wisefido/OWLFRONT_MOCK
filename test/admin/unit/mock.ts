/**
 * Unit API Mock 实现
 */

import type {
  Building,
  Unit,
  CreateBuildingParams,
  UpdateBuildingParams,
  CreateUnitParams,
  GetUnitsParams,
  GetUnitsResult,
  UpdateUnitParams,
  Room,
  Bed,
  RoomWithBeds,
  CreateRoomParams,
  CreateBedParams,
  UpdateRoomParams,
  UpdateBedParams,
} from '@/api/units/model/unitModel'
import { mockBuildingsData, mockUnitsData } from './data'

let buildings: Building[] = [...mockBuildingsData]
let units: Unit[] = [...mockUnitsData]
let buildingIdCounter = buildings.length + 1
let unitIdCounter = units.length + 1

// Mock Room 和 Bed 数据
let rooms: Room[] = []
let beds: Bed[] = []
let roomIdCounter = 1
let bedIdCounter = 1

// 初始化一些 mock Room 和 Bed 数据
function initMockRoomsAndBeds() {
  // 为 unit-1 创建 Room 和 Bed
  const room1: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-1',
    room_name: 'BedRoom',
    is_default: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room1)

  const bed1: Bed = {
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room1.room_id,
    bed_name: 'BedA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  beds.push(bed1)

  const bed2: Bed = {
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room1.room_id,
    bed_name: 'BedB',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  beds.push(bed2)

  // 为 unit-1 创建第二个 Room
  const room2: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-1',
    room_name: 'BathRoom',
    is_default: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room2)

  const bed3: Bed = {
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room2.room_id,
    bed_name: 'BedA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  beds.push(bed3)
}

// 初始化 mock 数据
initMockRoomsAndBeds()

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

export function mockUpdateBuilding(id: string, params: UpdateBuildingParams & { tag_name?: string }): Building {
  const index = buildings.findIndex((b) => b.building_id === id)
  if (index === -1) {
    throw new Error(`Building with id ${id} not found`)
  }
  // Mock层：将前端的 tag_name 转换为 location_tag
  const updateData: UpdateBuildingParams = {
    building_name: params.building_name,
    floors: params.floors,
    location_tag: (params as any).tag_name || params.location_tag, // 前端传入 tag_name，转换为 location_tag
  }
  const updated = {
    ...buildings[index],
    ...updateData,
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

export function mockCreateUnit(params: CreateUnitParams): Unit {
  const newUnit: Unit = {
    unit_id: `unit-${unitIdCounter++}`,
    tenant_id: 'tenant-1',
    unit_number: params.unit_number,
    unit_name: params.unit_name,
    building: params.building,
    floor: params.floor,
    location_tag: params.location_tag,
    area_tag: params.area_tag,
    location_type: params.location_type,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  units.push(newUnit)
  return newUnit
}

export function mockGetUnits(params: GetUnitsParams): GetUnitsResult {
  let filtered = [...units]

  // 过滤
  if (params.building) {
    filtered = filtered.filter((unit) => unit.building === params.building)
  }
  if (params.floor) {
    filtered = filtered.filter((unit) => unit.floor === params.floor)
  }
  if (params.location_tag) {
    filtered = filtered.filter((unit) => unit.location_tag === params.location_tag)
  }
  if (params.area_tag) {
    filtered = filtered.filter((unit) => unit.area_tag === params.area_tag)
  }
  if (params.unit_number) {
    filtered = filtered.filter((unit) =>
      unit.unit_number.toLowerCase().includes(params.unit_number!.toLowerCase())
    )
  }
  if (params.unit_name) {
    filtered = filtered.filter((unit) =>
      unit.unit_name.toLowerCase().includes(params.unit_name!.toLowerCase())
    )
  }
  if (params.is_active !== undefined) {
    filtered = filtered.filter((unit) => unit.is_active === params.is_active)
  } else {
    // 默认只返回 active 的
    filtered = filtered.filter((unit) => unit.is_active)
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

export function mockGetUnitDetail(id: string): Unit {
  const unit = units.find((u) => u.unit_id === id)
  if (!unit) {
    throw new Error(`Unit with id ${id} not found`)
  }
  return { ...unit }
}

export function mockUpdateUnit(id: string, params: UpdateUnitParams): Unit {
  const index = units.findIndex((u) => u.unit_id === id)
  if (index === -1) {
    throw new Error(`Unit with id ${id} not found`)
  }
  const updated = {
    ...units[index],
    ...params,
    updated_at: new Date().toISOString(),
  }
  units[index] = updated
  return { ...updated }
}

export function mockDeleteUnit(id: string): void {
  const index = units.findIndex((u) => u.unit_id === id)
  if (index === -1) {
    throw new Error(`Unit with id ${id} not found`)
  }
  // 软删除
  units[index].is_active = false
}

export function mockGetRooms(unitId: string): RoomWithBeds[] {
  const unitRooms = rooms.filter((r) => r.unit_id === unitId)
  return unitRooms.map((room) => ({
    ...room,
    beds: beds.filter((b) => b.room_id === room.room_id),
  }))
}

export function mockCreateRoom(params: CreateRoomParams): Room {
  const newRoom: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: params.unit_id,
    room_name: params.room_name,
    is_default: params.is_default || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  rooms.push(newRoom)
  return newRoom
}

export function mockUpdateRoom(id: string, params: UpdateRoomParams): Room {
  const index = rooms.findIndex((r) => r.room_id === id)
  if (index === -1) {
    throw new Error(`Room with id ${id} not found`)
  }
  const updated = {
    ...rooms[index],
    ...params,
    updated_at: new Date().toISOString(),
  }
  rooms[index] = updated
  return { ...updated }
}

export function mockDeleteRoom(id: string): void {
  const index = rooms.findIndex((r) => r.room_id === id)
  if (index === -1) {
    throw new Error(`Room with id ${id} not found`)
  }
  // 删除该 Room 下的所有 Bed
  beds = beds.filter((b) => b.room_id !== id)
  rooms.splice(index, 1)
}

export function mockCreateBed(params: CreateBedParams): Bed {
  const newBed: Bed = {
    bed_id: `bed-${bedIdCounter++}`,
    room_id: params.room_id,
    bed_name: params.bed_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  beds.push(newBed)
  return newBed
}

export function mockUpdateBed(id: string, params: UpdateBedParams): Bed {
  const index = beds.findIndex((b) => b.bed_id === id)
  if (index === -1) {
    throw new Error(`Bed with id ${id} not found`)
  }
  const updated = {
    ...beds[index],
    ...params,
    updated_at: new Date().toISOString(),
  }
  beds[index] = updated
  return { ...updated }
}

export function mockDeleteBed(id: string): void {
  const index = beds.findIndex((b) => b.bed_id === id)
  if (index === -1) {
    throw new Error(`Bed with id ${id} not found`)
  }
  beds.splice(index, 1)
}

