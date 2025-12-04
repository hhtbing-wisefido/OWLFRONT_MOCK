/**
 * Alarm Events Mock Functions
 * Mock API functions for alarm_events
 */

import type { GetAlarmEventsParams, GetAlarmEventsResult, HandleAlarmEventParams } from '@/api/alarm/model/alarmModel'
import { mockAlarmEvents, generateAlarmEventsResult } from './data'
import { delay } from '../utils/generator'

/**
 * Mock get alarm events API
 */
export async function mockGetAlarmEvents(
  params: GetAlarmEventsParams,
): Promise<GetAlarmEventsResult> {
  await delay(300) // Simulate network delay

  let filteredEvents = [...mockAlarmEvents]

  // Filter by status
  if (params.status) {
    filteredEvents = filteredEvents.filter((event) => event.alarm_status === params.status)
  }

  // Filter by date range
  if (params.alarm_time_start) {
    filteredEvents = filteredEvents.filter(
      (event) => event.triggered_at >= params.alarm_time_start!,
    )
  }
  if (params.alarm_time_end) {
    filteredEvents = filteredEvents.filter(
      (event) => event.triggered_at <= params.alarm_time_end!,
    )
  }

  // Filter by resident search
  if (params.resident) {
    const searchLower = params.resident.toLowerCase()
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.resident_name?.toLowerCase().includes(searchLower) ||
        event.resident_id?.toLowerCase().includes(searchLower),
    )
  }

  // Filter by location_tag search
  if (params.location_tag) {
    const searchLower = params.location_tag.toLowerCase()
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.location_tag?.toLowerCase().includes(searchLower) ||
        event.address_display?.toLowerCase().includes(searchLower),
    )
  }

  // Filter by unit_name search
  if (params.unit_name) {
    const searchLower = params.unit_name.toLowerCase()
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.unit_name?.toLowerCase().includes(searchLower) ||
        event.address_display?.toLowerCase().includes(searchLower),
    )
  }

  // Filter by device_name search
  if (params.device_name) {
    const searchLower = params.device_name.toLowerCase()
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.device_name?.toLowerCase().includes(searchLower) ||
        event.device_id?.toLowerCase().includes(searchLower),
    )
  }

  // Filter by event_types
  if (params.event_types && params.event_types.length > 0) {
    // Known event types (excluding 'Other')
    const knownEventTypes = [
      'Fall',
      'Radar_AbnormalHeartRate',
      'Radar_AbnormalRespiratoryRate',
      'Radar_ApneaHypopnea',
      'Radar_LeftBed',
      'SleepPad_LeftBed',
      'SleepPad_ApneaHypopnea',
      'SleepPad_AbnormalHeartRate',
      'SleepPad_AbnormalRespiratoryRate',
      'OfflineAlarm',
      'LowBattery',
      'DeviceFailure',
    ]
    
    const hasOther = params.event_types.includes('Other')
    const otherEventTypes = params.event_types.filter((type) => type !== 'Other')
    
    if (hasOther && otherEventTypes.length > 0) {
      // Both 'Other' and specific types selected: show events matching specific types OR unknown types
      filteredEvents = filteredEvents.filter(
        (event) =>
          otherEventTypes.includes(event.event_type) ||
          !knownEventTypes.includes(event.event_type),
      )
    } else if (hasOther) {
      // Only 'Other' selected: show only unknown event types
      filteredEvents = filteredEvents.filter(
        (event) => !knownEventTypes.includes(event.event_type),
      )
    } else {
      // Only specific types selected
      filteredEvents = filteredEvents.filter((event) =>
        params.event_types!.includes(event.event_type),
      )
    }
  }

  // Filter by categories
  if (params.categories && params.categories.length > 0) {
    filteredEvents = filteredEvents.filter(
      (event) => event.category && params.categories!.includes(event.category),
    )
  }

  // Filter by alarm_levels
  if (params.alarm_levels && params.alarm_levels.length > 0) {
    filteredEvents = filteredEvents.filter((event) => {
      const levelStr = String(event.alarm_level)
      return params.alarm_levels!.some((level) => level === levelStr || level === event.alarm_level)
    })
  }

  // Sort by triggered_at (descending)
  filteredEvents.sort((a, b) => b.triggered_at - a.triggered_at)

  // Pagination
  const page = params.page || 1
  const pageSize = params.page_size || 10

  return generateAlarmEventsResult(filteredEvents, page, pageSize)
}

/**
 * Mock handle alarm event API
 */
export async function mockHandleAlarmEvent(
  eventId: string,
  params: HandleAlarmEventParams,
): Promise<{ success: boolean }> {
  await delay(300) // Simulate network delay

  // Find the event in mock data and update its status
  const event = mockAlarmEvents.find((e) => e.event_id === eventId)
  if (event) {
    event.alarm_status = params.alarm_status
    // Note: handle_type and remarks would be stored in backend, not in mock data
  }

  return { success: true }
}

