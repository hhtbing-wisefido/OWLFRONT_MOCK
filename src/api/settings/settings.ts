/**
 * Device Monitor Settings API
 * For Sleepace and Radar device monitor settings
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '#/axios'
import type {
  SleepaceMonitorSettings,
  RadarMonitorSettings,
  UpdateSleepaceMonitorSettingsParams,
  UpdateRadarMonitorSettingsParams,
} from './model/settingsModel'

enum Api {
  GetSleepaceSettings = '/settings/api/v1/monitor/sleepace/:deviceId',
  UpdateSleepaceSettings = '/settings/api/v1/monitor/sleepace/:deviceId',
  GetRadarSettings = '/settings/api/v1/monitor/radar/:deviceId',
  UpdateRadarSettings = '/settings/api/v1/monitor/radar/:deviceId',
}

// Mock mode: In development, use mock data instead of real API calls
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

// Display mock status in console
if (useMock) {
  console.log('%c[Mock] Settings API Mock enabled - Using test data', 'color: #52c41a; font-weight: bold')
}

/**
 * Get Sleepace Device Monitor Settings
 */
export function getSleepaceDeviceMonitorSettingsApi(
  deviceId: string,
  mode: ErrorMessageMode = 'modal',
): Promise<SleepaceMonitorSettings> {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ settings }) => {
      console.log('%c[Mock] Get Sleepace Monitor Settings API Request', 'color: #1890ff; font-weight: bold', {
        deviceId,
      })
      return settings.mockGetSleepaceSettings(deviceId)
    })
  }

  // Production: Call real API
  return defHttp.get<SleepaceMonitorSettings>(
    {
      url: Api.GetSleepaceSettings.replace(':deviceId', deviceId),
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * Update Sleepace Device Monitor Settings
 */
export function updateSleepaceDeviceMonitorSettingsApi(
  deviceId: string,
  params: UpdateSleepaceMonitorSettingsParams,
  mode: ErrorMessageMode = 'modal',
): Promise<void> {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ settings }) => {
      console.log('%c[Mock] Update Sleepace Monitor Settings API Request', 'color: #1890ff; font-weight: bold', {
        deviceId,
        params,
      })
      return settings.mockUpdateSleepaceSettings(deviceId, params)
    })
  }

  // Production: Call real API
  return defHttp.put(
    {
      url: Api.UpdateSleepaceSettings.replace(':deviceId', deviceId),
      data: params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * Get Radar Device Monitor Settings
 */
export function getRadarDeviceMonitorSettingsApi(
  deviceId: string,
  mode: ErrorMessageMode = 'modal',
): Promise<RadarMonitorSettings> {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ settings }) => {
      console.log('%c[Mock] Get Radar Monitor Settings API Request', 'color: #1890ff; font-weight: bold', {
        deviceId,
      })
      return settings.mockGetRadarSettings(deviceId)
    })
  }

  // Production: Call real API
  return defHttp.get<RadarMonitorSettings>(
    {
      url: Api.GetRadarSettings.replace(':deviceId', deviceId),
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * Update Radar Device Monitor Settings
 */
export function updateRadarDeviceMonitorSettingsApi(
  deviceId: string,
  params: UpdateRadarMonitorSettingsParams,
  mode: ErrorMessageMode = 'modal',
): Promise<void> {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ settings }) => {
      console.log('%c[Mock] Update Radar Monitor Settings API Request', 'color: #1890ff; font-weight: bold', {
        deviceId,
        params,
      })
      return settings.mockUpdateRadarSettings(deviceId, params)
    })
  }

  // Production: Call real API
  return defHttp.put(
    {
      url: Api.UpdateRadarSettings.replace(':deviceId', deviceId),
      data: params,
    },
    {
      errorMessageMode: mode,
    },
  )
}














