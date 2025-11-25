/**
 * Unit API 函数
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  Unit,
  Building,
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
  GetRoomsParams,
  GetBedsParams,
} from './model/unitModel'

export enum Api {
  CreateBuilding = '/admin/api/v1/buildings',
  GetBuildings = '/admin/api/v1/buildings',
  UpdateBuilding = '/admin/api/v1/buildings/:id',
  DeleteBuilding = '/admin/api/v1/buildings/:id',
  CreateUnit = '/admin/api/v1/units',
  GetUnits = '/admin/api/v1/units',
  GetUnitDetail = '/admin/api/v1/units/:id',
  UpdateUnit = '/admin/api/v1/units/:id',
  DeleteUnit = '/admin/api/v1/units/:id',
  GetRooms = '/admin/api/v1/rooms',
  CreateRoom = '/admin/api/v1/rooms',
  UpdateRoom = '/admin/api/v1/rooms/:id',
  DeleteRoom = '/admin/api/v1/rooms/:id',
  GetBeds = '/admin/api/v1/beds',
  CreateBed = '/admin/api/v1/beds',
  UpdateBed = '/admin/api/v1/beds/:id',
  DeleteBed = '/admin/api/v1/beds/:id',
}

// Mock mode: In development, use mock data instead of real API calls
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

if (useMock) {
  console.log('%c[Mock] Unit API Mock enabled', 'color: #52c41a; font-weight: bold')
}

/**
 * 创建 Building
 * 前端传入的 params 中可能包含 tag_name（UI显示用），需要转换为 location_tag
 */
export async function createBuildingApi(
  params: CreateBuildingParams & { tag_name?: string },
  mode: ErrorMessageMode = 'modal'
): Promise<Building> {
  if (useMock) {
    const { unit } = await import('@test/index')
    // Mock 层：兼容 tag_name 和 location_tag
    const mockParams: CreateBuildingParams = {
      building_name: params.building_name,
      floors: params.floors,
      location_tag: (params as any).tag_name || params.location_tag,
    }
    return unit.mock.mockCreateBuilding(mockParams)
  }

  // 兼容 tag_name 和 location_tag
  const apiParams: CreateBuildingParams = {
    building_name: params.building_name,
    floors: params.floors,
    location_tag: (params as any).tag_name || params.location_tag,
  }

  return defHttp.post<Building>(
    {
      url: Api.CreateBuilding,
      data: apiParams,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 获取 Building 列表
 * API 返回的 location_tag，前端UI显示时会映射为 tag_name
 */
export async function getBuildingsApi(
  mode: ErrorMessageMode = 'none'
): Promise<Building[]> {
  if (useMock) {
    const { unit } = await import('@test/index')
    return unit.mock.mockGetBuildings()
  }

  return defHttp.get<Building[]>(
    {
      url: Api.GetBuildings,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 更新 Building
 * 前端传入的 params 中可能包含 tag_name（UI显示用），需要转换为 location_tag
 */
export async function updateBuildingApi(
  id: string,
  params: UpdateBuildingParams & { tag_name?: string },
  mode: ErrorMessageMode = 'modal'
): Promise<Building> {
  if (useMock) {
    const { unit } = await import('@test/index')
    // Mock 层：兼容 tag_name 和 location_tag
    const mockParams: UpdateBuildingParams = {
      building_name: params.building_name,
      floors: params.floors,
      location_tag: (params as any).tag_name || params.location_tag,
    }
    return unit.mock.mockUpdateBuilding(id, mockParams)
  }

  // 兼容 tag_name 和 location_tag
  const apiParams: UpdateBuildingParams = {
    building_name: params.building_name,
    floors: params.floors,
    location_tag: (params as any).tag_name || params.location_tag,
  }

  return defHttp.put<Building>(
    {
      url: Api.UpdateBuilding.replace(':id', id),
      data: apiParams,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 删除 Building
 */
export async function deleteBuildingApi(
  id: string,
  mode: ErrorMessageMode = 'modal'
): Promise<void> {
  if (useMock) {
    const { unit } = await import('@test/index')
    return unit.mock.mockDeleteBuilding(id)
  }

  return defHttp.delete<void>(
    {
      url: Api.DeleteBuilding.replace(':id', id),
    },
    { errorMessageMode: mode }
  )
}

/**
 * 创建 Unit
 */
export async function createUnitApi(
  params: CreateUnitParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Unit> {
  if (useMock) {
    const { unit } = await import('@test/index')
    return unit.mock.mockCreateUnit(params)
  }

  return defHttp.post<Unit>(
    {
      url: Api.CreateUnit,
      data: params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 获取 Unit 列表
 */
export async function getUnitsApi(
  params: GetUnitsParams,
  mode: ErrorMessageMode = 'none'
): Promise<GetUnitsResult> {
  if (useMock) {
    const { unit } = await import('@test/index')
    return unit.mock.mockGetUnits(params)
  }

  return defHttp.get<GetUnitsResult>(
    {
      url: Api.GetUnits,
      params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 获取 Unit 详情
 */
export async function getUnitDetailApi(
  id: string,
  mode: ErrorMessageMode = 'modal'
): Promise<Unit> {
  if (useMock) {
    const { unit } = await import('@test/index')
    return unit.mock.mockGetUnitDetail(id)
  }

  return defHttp.get<Unit>(
    {
      url: Api.GetUnitDetail.replace(':id', id),
    },
    { errorMessageMode: mode }
  )
}

/**
 * 更新 Unit
 */
export async function updateUnitApi(
  id: string,
  params: UpdateUnitParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Unit> {
  if (useMock) {
    const { unit } = await import('@test/index')
    return unit.mock.mockUpdateUnit(id, params)
  }

  return defHttp.put<Unit>(
    {
      url: Api.UpdateUnit.replace(':id', id),
      data: params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 删除 Unit
 */
export async function deleteUnitApi(
  id: string,
  mode: ErrorMessageMode = 'modal'
): Promise<void> {
  if (useMock) {
    const { unit } = await import('@test/index')
    return unit.mock.mockDeleteUnit(id)
  }

  return defHttp.delete<void>(
    {
      url: Api.DeleteUnit.replace(':id', id),
    },
    { errorMessageMode: mode }
  )
}

/**
 * 获取 Unit 下的 Room 列表（包含 Bed）
 */
export async function getRoomsApi(
  params: GetRoomsParams,
  mode: ErrorMessageMode = 'none'
): Promise<RoomWithBeds[]> {
  if (useMock) {
    const { unit } = await import('@test/index')
    return unit.mock.mockGetRooms(params.unit_id)
  }

  return defHttp.get<RoomWithBeds[]>(
    {
      url: Api.GetRooms,
      params: { unit_id: params.unit_id },
    },
    { errorMessageMode: mode }
  )
}

/**
 * 创建 Room
 */
export async function createRoomApi(
  params: CreateRoomParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Room> {
  if (useMock) {
    const { unit } = await import('@test/index')
    return unit.mock.mockCreateRoom(params)
  }

  return defHttp.post<Room>(
    {
      url: Api.CreateRoom,
      data: params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 更新 Room
 */
export async function updateRoomApi(
  id: string,
  params: UpdateRoomParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Room> {
  if (useMock) {
    const { unit } = await import('@test/index')
    return unit.mock.mockUpdateRoom(id, params)
  }

  return defHttp.put<Room>(
    {
      url: Api.UpdateRoom.replace(':id', id),
      data: params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 删除 Room
 */
export async function deleteRoomApi(
  id: string,
  mode: ErrorMessageMode = 'modal'
): Promise<void> {
  if (useMock) {
    const { unit } = await import('@test/index')
    return unit.mock.mockDeleteRoom(id)
  }

  return defHttp.delete<void>(
    {
      url: Api.DeleteRoom.replace(':id', id),
    },
    { errorMessageMode: mode }
  )
}

/**
 * 创建 Bed
 */
export async function createBedApi(
  params: CreateBedParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Bed> {
  if (useMock) {
    const { unit } = await import('@test/index')
    return unit.mock.mockCreateBed(params)
  }

  return defHttp.post<Bed>(
    {
      url: Api.CreateBed,
      data: params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 更新 Bed
 */
export async function updateBedApi(
  id: string,
  params: UpdateBedParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Bed> {
  if (useMock) {
    const { unit } = await import('@test/index')
    return unit.mock.mockUpdateBed(id, params)
  }

  return defHttp.put<Bed>(
    {
      url: Api.UpdateBed.replace(':id', id),
      data: params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 删除 Bed
 */
export async function deleteBedApi(
  id: string,
  mode: ErrorMessageMode = 'modal'
): Promise<void> {
  if (useMock) {
    const { unit } = await import('@test/index')
    return unit.mock.mockDeleteBed(id)
  }

  return defHttp.delete<void>(
    {
      url: Api.DeleteBed.replace(':id', id),
    },
    { errorMessageMode: mode }
  )
}

