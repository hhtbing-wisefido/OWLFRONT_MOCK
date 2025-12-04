/**
 * Alarm Cloud API interface definition
 * For managing alarm_cloud table configuration
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  AlarmCloud,
  AlarmCloudResult,
  GetAlarmCloudParams,
  UpdateAlarmCloudParams,
} from './model/alarmModel'

// Define API path enum
export enum Api {
  GetConfig = '/admin/api/v1/alarm-cloud',
  UpdateConfig = '/admin/api/v1/alarm-cloud',
}

// Mock mode: In development, use mock data instead of real API calls
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

// Display mock status in console
if (useMock) {
  console.log('%c[Mock] Alarm Cloud API Mock enabled - Using test data', 'color: #52c41a; font-weight: bold')
}

/**
 * @description: Get alarm cloud configuration
 * @param params - Query parameters (tenant_id: null for system default, specific ID for tenant-specific)
 * @param mode - Error message mode
 */
export function getAlarmCloudApi(params?: GetAlarmCloudParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ alarmCloud }) => {
      console.log('%c[Mock] Get Alarm Cloud API Request', 'color: #1890ff; font-weight: bold', { params })
      return alarmCloud.mock.mockGetAlarmCloud(params).then((result: AlarmCloudResult) => {
        console.log('%c[Mock] Get Alarm Cloud API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Get Alarm Cloud API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  return defHttp.get<AlarmCloudResult>(
    {
      url: Api.GetConfig,
      params: params || {},
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: Update alarm cloud configuration
 * @param params - Update parameters
 * @param mode - Error message mode
 */
export function updateAlarmCloudApi(params: UpdateAlarmCloudParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ alarmCloud }) => {
      console.log('%c[Mock] Update Alarm Cloud API Request', 'color: #1890ff; font-weight: bold', { params })
      return alarmCloud.mock.mockUpdateAlarmCloud(params).then((result: AlarmCloudResult) => {
        console.log('%c[Mock] Update Alarm Cloud API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Update Alarm Cloud API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  return defHttp.put<AlarmCloudResult>(
    {
      url: Api.UpdateConfig,
      params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

