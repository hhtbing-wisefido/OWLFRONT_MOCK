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
}

// Mock mode: In development, use mock data instead of real API calls
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

if (useMock) {
  console.log('%c[Mock] Location API Mock enabled', 'color: #52c41a; font-weight: bold')
}

/**
 * 创建 Building
 */
export async function createBuildingApi(
  params: CreateBuildingParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Building> {
  if (useMock) {
    const { location } = await import('@test/index')
    return location.mock.mockCreateBuilding(params)
  }

  return defHttp.post<Building>(
    {
      url: Api.CreateBuilding,
      data: params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 获取 Building 列表
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
 */
export async function updateBuildingApi(
  id: string,
  params: UpdateBuildingParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Building> {
  if (useMock) {
    const { location } = await import('@test/index')
    return location.mock.mockUpdateBuilding(id, params)
  }

  return defHttp.put<Building>(
    {
      url: Api.UpdateBuilding.replace(':id', id),
      data: params,
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

