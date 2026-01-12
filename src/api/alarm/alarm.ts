/**
 * Alarm Cloud API interface definition
 * For managing alarm_cloud table configuration
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  AlarmCloudResult,
  GetAlarmCloudParams,
  UpdateAlarmCloudParams,
  GetAlarmEventsParams,
  GetAlarmEventsResult,
  HandleAlarmEventParams,
} from './model/alarmModel'

// Define API path enum
export enum Api {
  GetConfig = '/admin/api/v1/alarm-cloud',
  UpdateConfig = '/admin/api/v1/alarm-cloud',
  GetEvents = '/admin/api/v1/alarm-events',
  HandleEvent = '/admin/api/v1/alarm-events/:id/handle',
}

// Mock mode: In development, use mock data instead of real API calls
// DEV 榛樿璧扮湡瀹炲悗绔紱鍙湁鏄惧紡璁剧�?VITE_USE_MOCK='true' 鎵嶅惎鐢?mock
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

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

/**
 * @description: Get alarm events (alarm records)
 * @param params - Query parameters (status, search, filters, pagination)
 * @param mode - Error message mode
 */
export function getAlarmEventsApi(params: GetAlarmEventsParams, mode: ErrorMessageMode = 'modal') {
  // Production: Call real backend API
  return defHttp.get<GetAlarmEventsResult>(
    {
      url: Api.GetEvents,
      params: params || {},
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: Handle alarm event (update alarm_status)
 * @param eventId - Alarm event ID
 * @param params - Handle parameters (alarm_status: 'acknowledged' | 'resolved')
 * @param mode - Error message mode
 */
export function handleAlarmEventApi(
  eventId: string,
  params: HandleAlarmEventParams,
  mode: ErrorMessageMode = 'modal',
) {
  // Production: Call real backend API
  return defHttp.put<{ success: boolean }>(
    {
      url: Api.HandleEvent.replace(':id', eventId),
      data: params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

