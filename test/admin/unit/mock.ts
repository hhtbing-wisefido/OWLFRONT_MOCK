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
  // Unit E101 (unit-1): bedroom (BedA, BedB), bathroom (no beds)
  const room1: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-1',
    room_name: 'bedroom',
    is_default: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room1)
  beds.push({
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room1.room_id,
    bed_name: 'BedA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })
  beds.push({
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room1.room_id,
    bed_name: 'BedB',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })
  const room2: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-1',
    room_name: 'bathroom',
    is_default: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room2)

  // Unit E102 (unit-2): E102 room (BedA, BedB) - room_name = unit_name
  const room3: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-2',
    room_name: 'E102',
    is_default: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room3)
  beds.push({
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room3.room_id,
    bed_name: 'BedA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })
  beds.push({
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room3.room_id,
    bed_name: 'BedB',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })

  // Unit W201 (unit-3): bedroom (BedA), bathroom (no beds), W201 room (BedB) - room_name = unit_name
  const room4: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-3',
    room_name: 'bedroom',
    is_default: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room4)
  beds.push({
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room4.room_id,
    bed_name: 'BedA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })
  const room5: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-3',
    room_name: 'bathroom',
    is_default: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room5)
  const room6: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-3',
    room_name: 'W201',
    is_default: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room6)
  beds.push({
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room6.room_id,
    bed_name: 'BedB',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })

  // Unit W202 (unit-4): W202 room (BedA, BedB) - room_name = unit_name
  const room7: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-4',
    room_name: 'W202',
    is_default: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room7)
  beds.push({
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room7.room_id,
    bed_name: 'BedA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })
  beds.push({
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room7.room_id,
    bed_name: 'BedB',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })

  // Unit M110 (unit-5): LivingRoom (no beds), bedroom (BedA, BedB), bathroom (no beds)
  const room8: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-5',
    room_name: 'LivingRoom',
    is_default: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room8)
  const room9: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-5',
    room_name: 'bedroom',
    is_default: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room9)
  beds.push({
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room9.room_id,
    bed_name: 'BedA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })
  beds.push({
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room9.room_id,
    bed_name: 'BedB',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })
  const room10: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-5',
    room_name: 'bathroom',
    is_default: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room10)

  // Unit M120 (unit-6): M102 room (BedA, BedB) - Note: room_name is M102, unit_name is M120
  const room11: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-6',
    room_name: 'M102',
    is_default: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room11)
  beds.push({
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room11.room_id,
    bed_name: 'BedA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })
  beds.push({
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room11.room_id,
    bed_name: 'BedB',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })

  // Unit BD02 (unit-7): bedroom (BedA), bathroom (no beds)
  const room12: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-7',
    room_name: 'BedRoom',
    is_default: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room12)
  beds.push({
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room12.room_id,
    bed_name: 'BedA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })
  const room13: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-7',
    room_name: 'BathRoom',
    is_default: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room13)

  // Unit BD_king (unit-8): bedroom (BedA), bathroom (no beds)
  const room14: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-8',
    room_name: 'BedRoom',
    is_default: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room14)
  beds.push({
    bed_id: `bed-${bedIdCounter++}`,
    room_id: room14.room_id,
    bed_name: 'BedA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })
  const room15: Room = {
    room_id: `room-${roomIdCounter++}`,
    unit_id: 'unit-8',
    room_name: 'BathRoom',
    is_default: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
  rooms.push(room15)
}

// 初始化 mock 数据
initMockRoomsAndBeds()

export function mockCreateBuilding(params: CreateBuildingParams & { tag_name?: string }): Building {
  // 验证：branch_tag 或 building_name 必须有一个不为空
  const branchTag = params.branch_tag || (params as any).tag_name || ''
  const buildingName = params.building_name || ''
  
  if ((branchTag === '' || branchTag === '-') && (buildingName === '' || buildingName === '-')) {
    throw new Error('branch_tag or building_name must be provided (at least one must not be empty)')
  }
  
  // 设置默认值（与实际实现一致）
  const finalBranchTag = branchTag || '-'
  const finalBuildingName = buildingName || '-'
  
  const newBuilding: Building = {
    building_id: `building-${buildingIdCounter++}`,
    building_name: finalBuildingName,
    floors: params.floors,
    tenant_id: 'tenant-1',
    branch_tag: finalBranchTag,  // 使用 branch_tag，与实际 API 一致
  }
  buildings.push(newBuilding)
  return newBuilding
}

export function mockGetBuildings(): Building[] {
  return [...buildings]
}

export function mockUpdateBuilding(id: string, params: UpdateBuildingParams & { tag_name?: string }): Building {
  const index = buildings.findIndex((b) => b.building_id === id)
  if (index === -1) {
    throw new Error(`Building with id ${id} not found`)
  }
  
  // 获取旧值
  const oldBranchTag = buildings[index].branch_tag || '-'
  const oldBuildingName = buildings[index].building_name || '-'
  
  // 获取新值
  const newBranchTag = params.branch_tag || (params as any).tag_name || ''
  const newBuildingName = params.building_name || ''
  
  // 验证：如果提供了新值，必须至少有一个不为空
  if (newBranchTag !== '' || newBuildingName !== '') {
    if ((newBranchTag === '' || newBranchTag === '-') && (newBuildingName === '' || newBuildingName === '-')) {
      throw new Error('branch_tag or building_name must be provided (at least one must not be empty)')
    }
  }
  
  // 使用新值或保持旧值
  const finalBranchTag = newBranchTag || oldBranchTag
  const finalBuildingName = newBuildingName || oldBuildingName
  
  // Mock层：将前端的 tag_name 转换为 branch_tag（与实际 API 一致）
  const updateData: UpdateBuildingParams = {
    building_name: finalBuildingName,
    floors: params.floors,
    branch_tag: finalBranchTag,  // 使用 branch_tag，与实际 API 一致
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
    unit_type: params.unit_type,
    building: params.building,
    floor: params.floor,
    branch_tag: params.branch_tag,  // 改为 branch_tag，与实际 API 一致
    area_tag: params.area_tag,
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
  if (params.branch_tag) {
    filtered = filtered.filter((unit) => unit.branch_tag === params.branch_tag)
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

