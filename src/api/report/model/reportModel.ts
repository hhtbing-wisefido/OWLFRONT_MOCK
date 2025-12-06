import type { BackendPagination } from '@/api/model/pagination'

export interface SleepaceReportItem {
  id: number
  deviceId: string
  deviceCode: string
  recordCount: number
  startTime: number
  endTime: number
  date: number
  stopMode: number
  timeStep: number
  timezone: number
  sleepState: string
}

export interface SleepaceReportDetail {
  id: number
  deviceId: string
  deviceCode: string
  recordCount: number
  startTime: number
  endTime: number
  date: number
  stopMode: number
  timeStep: number
  timezone: number
  report: string
}

export type GetSleepaceReportsResultModel = {
  items: SleepaceReportItem[]
  pagination: BackendPagination
}



