/**
 * Report API interface definition
 * For managing sleep reports
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  GetSleepaceReportsResultModel,
  SleepaceReportDetail,
} from './model/reportModel'

// Define API path enum
export enum Api {
  SleepaceReports = '/sleepace/api/v1/sleepace/reports/:id',
  SleepaceReportDetail = '/sleepace/api/v1/sleepace/reports/:id/detail',
  SleepaceReportsDates = '/sleepace/api/v1/sleepace/reports/:id/dates',
}

// Mock mode: In development, use mock data instead of real API calls
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

// Display mock status in console
if (useMock) {
  console.log('%c[Mock] Report API Mock enabled - Using test data', 'color: #52c41a; font-weight: bold')
}

/**
 * Get sleepace reports list
 */
export function getSleepaceReportsApi(
  id: string,
  params?: Record<string, any>,
  mode: ErrorMessageMode = 'modal',
) {
  if (useMock) {
    // TODO: Implement mock when available
    return Promise.resolve({
      items: [],
      pagination: {
        page: 1,
        size: 8,
        count: 0,
        sort: '',
        direction: 0,
      },
    } as GetSleepaceReportsResultModel)
  }

  return defHttp.get<GetSleepaceReportsResultModel>(
    {
      url: Api.SleepaceReports.replace(':id', id),
      params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * Get sleepace report detail
 */
export function getSleepaceReportDetailApi(
  id: string,
  date: number,
  mode: ErrorMessageMode = 'modal',
) {
  if (useMock) {
    // TODO: Implement mock when available
    return Promise.resolve({
      id: 0,
      deviceId: id,
      deviceCode: '',
      recordCount: 0,
      startTime: 0,
      endTime: 0,
      date,
      stopMode: 0,
      timeStep: 60,
      timezone: 0,
      report: '{}',
    } as SleepaceReportDetail)
  }

  return defHttp.get<SleepaceReportDetail>(
    {
      url: Api.SleepaceReportDetail.replace(':id', id),
      params: { date },
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * Get sleepace reports dates (list of dates that have data)
 */
export function getSleepaceReportsDatesApi(
  id: string,
  mode: ErrorMessageMode = 'modal',
) {
  if (useMock) {
    // TODO: Implement mock when available
    return Promise.resolve([] as number[])
  }

  return defHttp.get<number[]>(
    {
      url: Api.SleepaceReportsDates.replace(':id', id),
    },
    {
      errorMessageMode: mode,
    },
  )
}



