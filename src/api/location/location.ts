/**
 * Location API 函数
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  Location,
  Building,
  CreateBuildingParams,
  UpdateBuildingParams,
  CreateLocationParams,
  GetLocationsParams,
  GetLocationsResult,
  UpdateLocationParams,
  Room,
  Bed,
  RoomWithBeds,
  CreateRoomParams,
  CreateBedParams,
  GetRoomsParams,
  GetBedsParams,
} from './model/locationModel'

export enum Api {
  CreateBuilding = '/admin/api/v1/buildings',
  GetBuildings = '/admin/api/v1/buildings',
  UpdateBuilding = '/admin/api/v1/buildings/:id',
  DeleteBuilding = '/admin/api/v1/buildings/:id',
  CreateLocation = '/admin/api/v1/locations',
  GetLocations = '/admin/api/v1/locations',
  GetLocationDetail = '/admin/api/v1/locations/:id',
  UpdateLocation = '/admin/api/v1/locations/:id',
  DeleteLocation = '/admin/api/v1/locations/:id',
  GetRooms = '/admin/api/v1/rooms',
  CreateRoom = '/admin/api/v1/rooms',
  DeleteRoom = '/admin/api/v1/rooms/:id',
  GetBeds = '/admin/api/v1/beds',
  CreateBed = '/admin/api/v1/beds',
  DeleteBed = '/admin/api/v1/beds/:id',
}

// Mock mode: In development, use mock data instead of real API calls
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

if (useMock) {
  console.log('%c[Mock] Location API Mock enabled', 'color: #52c41a; font-weight: bold')
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
    const { location } = await import('@test/index')
    // Mock 层也需要处理 tag_name -> location_tag 的转换
    const mockParams: CreateBuildingParams = {
      building_name: params.building_name,
      floors: params.floors,
      location_tag: (params as any).tag_name || params.location_tag,
    }
    return location.mock.mockCreateBuilding(mockParams)
  }

  // 将前端的 tag_name 转换为 API 的 location_tag
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
    const { location } = await import('@test/index')
    return location.mock.mockGetBuildings()
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
    const { location } = await import('@test/index')
    // Mock 层也需要处理 tag_name -> location_tag 的转换
    const mockParams: UpdateBuildingParams = {
      building_name: params.building_name,
      floors: params.floors,
      location_tag: (params as any).tag_name || params.location_tag,
    }
    return location.mock.mockUpdateBuilding(id, mockParams)
  }

  // 将前端的 tag_name 转换为 API 的 location_tag
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
    const { location } = await import('@test/index')
    return location.mock.mockDeleteBuilding(id)
  }

  return defHttp.delete<void>(
    {
      url: Api.DeleteBuilding.replace(':id', id),
    },
    { errorMessageMode: mode }
  )
}

/**
 * 创建 Location
 */
export async function createLocationApi(
  params: CreateLocationParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Location> {
  if (useMock) {
    const { location } = await import('@test/index')
    return location.mock.mockCreateLocation(params)
  }

  return defHttp.post<Location>(
    {
      url: Api.CreateLocation,
      data: params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 获取 Location 列表
 */
export async function getLocationsApi(
  params: GetLocationsParams,
  mode: ErrorMessageMode = 'none'
): Promise<GetLocationsResult> {
  if (useMock) {
    const { location } = await import('@test/index')
    return location.mock.mockGetLocations(params)
  }

  return defHttp.get<GetLocationsResult>(
    {
      url: Api.GetLocations,
      params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 获取 Location 详情
 */
export async function getLocationDetailApi(
  id: string,
  mode: ErrorMessageMode = 'modal'
): Promise<Location> {
  if (useMock) {
    const { location } = await import('@test/index')
    return location.mock.mockGetLocationDetail(id)
  }

  return defHttp.get<Location>(
    {
      url: Api.GetLocationDetail.replace(':id', id),
    },
    { errorMessageMode: mode }
  )
}

/**
 * 更新 Location
 */
export async function updateLocationApi(
  id: string,
  params: UpdateLocationParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Location> {
  if (useMock) {
    const { location } = await import('@test/index')
    return location.mock.mockUpdateLocation(id, params)
  }

  return defHttp.put<Location>(
    {
      url: Api.UpdateLocation.replace(':id', id),
      data: params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 删除 Location
 */
export async function deleteLocationApi(
  id: string,
  mode: ErrorMessageMode = 'modal'
): Promise<void> {
  if (useMock) {
    const { location } = await import('@test/index')
    return location.mock.mockDeleteLocation(id)
  }

  return defHttp.delete<void>(
    {
      url: Api.DeleteLocation.replace(':id', id),
    },
    { errorMessageMode: mode }
  )
}

/**
 * 获取 Location 下的 Room 列表（包含 Bed）
 */
export async function getRoomsApi(
  params: GetRoomsParams,
  mode: ErrorMessageMode = 'none'
): Promise<RoomWithBeds[]> {
  if (useMock) {
    const { location } = await import('@test/index')
    return location.mock.mockGetRooms(params.location_id)
  }

  return defHttp.get<RoomWithBeds[]>(
    {
      url: Api.GetRooms,
      params: { location_id: params.location_id },
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
    const { location } = await import('@test/index')
    return location.mock.mockCreateRoom(params)
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
 * 删除 Room
 */
export async function deleteRoomApi(
  id: string,
  mode: ErrorMessageMode = 'modal'
): Promise<void> {
  if (useMock) {
    const { location } = await import('@test/index')
    return location.mock.mockDeleteRoom(id)
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
    const { location } = await import('@test/index')
    return location.mock.mockCreateBed(params)
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
 * 删除 Bed
 */
export async function deleteBedApi(
  id: string,
  mode: ErrorMessageMode = 'modal'
): Promise<void> {
  if (useMock) {
    const { location } = await import('@test/index')
    return location.mock.mockDeleteBed(id)
  }

  return defHttp.delete<void>(
    {
      url: Api.DeleteBed.replace(':id', id),
    },
    { errorMessageMode: mode }
  )
}

