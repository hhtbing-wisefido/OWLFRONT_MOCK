/**
 * Device API interface definition
 * For managing devices in the devices table
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  Device,
  GetDevicesParams,
  GetDevicesResult,
  UpdateDeviceParams,
} from './model/deviceModel'

// Import DeviceRelations type (will be defined in deviceModel.ts)
export interface DeviceRelations {
  deviceId: string
  deviceName: string
  deviceInternalCode: string
  deviceType: number
  addressId: string
  addressName: string
  addressType: number
  residents: Array<{
    id: string
    name: string
    gender: string
    birthday: string
  }>
}

// Define API path enum
export enum Api {
  GetList = '/admin/api/v1/devices',
  GetDetail = '/admin/api/v1/devices/:id',
  Update = '/admin/api/v1/devices/:id',
  Delete = '/admin/api/v1/devices/:id',
  GetDeviceRelations = '/device/api/v1/device/:id/relations',
}

// Mock mode: In development, use mock data instead of real API calls
// DEV 默认走真实后端；只有显式设置 VITE_USE_MOCK='true' 才启用 mock
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

// Display mock status in console
if (useMock) {
  console.log('%c[Mock] Device API Mock enabled - Using test data', 'color: #52c41a; font-weight: bold')
}

/**
 * @description: Get device list
 * @param params - Query parameters
 * @param mode - Error message mode
 */
export function getDevicesApi(params?: GetDevicesParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ devices }) => {
      console.log('%c[Mock] Get Devices API Request', 'color: #1890ff; font-weight: bold', { params })
      return devices.mock.mockGetDevices(params).then((result: GetDevicesResult) => {
        console.log('%c[Mock] Get Devices API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Get Devices API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  return defHttp.get<GetDevicesResult>(
    {
      url: Api.GetList,
      params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Get device detail
 * @param deviceId - Device ID
 * @param mode - Error message mode
 */
export function getDeviceDetailApi(deviceId: string, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ devices }) => {
      console.log('%c[Mock] Get Device Detail API Request', 'color: #1890ff; font-weight: bold', { deviceId })
      return devices.mock.mockGetDeviceDetail(deviceId).then((result: Device) => {
        console.log('%c[Mock] Get Device Detail API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Get Device Detail API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  return defHttp.get<Device>(
    {
      url: Api.GetDetail.replace(':id', deviceId),
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Update device information
 * @param deviceId - Device ID
 * @param params - Update device parameters
 * @param mode - Error message mode
 */
export function updateDeviceApi(deviceId: string, params: UpdateDeviceParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ devices }) => {
      console.log('%c[Mock] Update Device API Request', 'color: #1890ff; font-weight: bold', { deviceId, params })
      return devices.mock.mockUpdateDevice(deviceId, params).then((result: { success: boolean }) => {
        console.log('%c[Mock] Update Device API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Update Device API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  return defHttp.put<{ success: boolean }>(
    {
      url: Api.Update.replace(':id', deviceId),
      data: params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Delete device
 * @param deviceId - Device ID
 * @param mode - Error message mode
 */
export function deleteDeviceApi(deviceId: string, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ devices }) => {
      console.log('%c[Mock] Delete Device API Request', 'color: #1890ff; font-weight: bold', { deviceId })
      return devices.mock.mockDeleteDevice(deviceId).then((result: { success: boolean }) => {
        console.log('%c[Mock] Delete Device API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Delete Device API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  // Note: Server determines whether it's physical delete or soft delete (set status = 'disabled')
  return defHttp.delete<{ success: boolean }>(
    {
      url: Api.Delete.replace(':id', deviceId),
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Get device relations (device info with address and residents)
 * @param deviceId - Device ID
 * @param mode - Error message mode
 */
export function getDeviceRelationsApi(deviceId: string, mode: ErrorMessageMode = 'modal') {
  if (useMock) {
    // TODO: Implement mock when available
    return Promise.resolve({
      deviceId,
      deviceName: 'Mock Device',
      deviceInternalCode: 'MOCK001',
      deviceType: 0,
      addressId: '',
      addressName: 'Mock Address',
      addressType: 0,
      residents: [],
    } as DeviceRelations)
  }

  return defHttp.get<DeviceRelations>(
    {
      url: Api.GetDeviceRelations.replace(':id', deviceId),
    },
    { errorMessageMode: mode },
  )
}

