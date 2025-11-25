/**
 * Device API 接口定义
 * 用于管理 devices 表中的设备
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  Device,
  GetDevicesParams,
  GetDevicesResult,
  UpdateDeviceParams,
} from './model/deviceModel'

// 定义 API 路径枚举
export enum Api {
  GetList = '/admin/api/v1/devices',
  GetDetail = '/admin/api/v1/devices/:id',
  Update = '/admin/api/v1/devices/:id',
  Delete = '/admin/api/v1/devices/:id',
}

// Mock mode: In development, use mock data instead of real API calls
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

// Display mock status in console
if (useMock) {
  console.log('%c[Mock] Device API Mock enabled - Using test data', 'color: #52c41a; font-weight: bold')
}

/**
 * @description: 获取设备列表
 * @param params - 查询参数
 * @param mode - 错误消息模式
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
 * @description: 获取设备详情
 * @param deviceId - 设备 ID
 * @param mode - 错误消息模式
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
 * @description: 更新设备信息
 * @param deviceId - 设备 ID
 * @param params - 更新设备参数
 * @param mode - 错误消息模式
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
 * @description: 删除设备
 * @param deviceId - 设备 ID
 * @param mode - 错误消息模式
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
  // 注意：由 server 判断是物理删除还是软删除（设置 status = 'disabled'）
  return defHttp.delete<{ success: boolean }>(
    {
      url: Api.Delete.replace(':id', deviceId),
    },
    { errorMessageMode: mode },
  )
}

