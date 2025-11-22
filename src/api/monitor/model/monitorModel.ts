/**
 * Monitor API models
 * Note: All field names use snake_case to match database schema (PostgreSQL standard)
 */

import { BackendPagination } from '@/api/model/pagination'

/**
 * Service Level Info (from service_levels table)
 * Used to display color_point for residents
 */
export interface ServiceLevelInfo {
  level_code: string  // e.g., 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'
  display_name: string  // e.g., 'Independent', 'Assisted'
  display_name_cn?: string  // e.g., '无需协助', '需部分协助'
  color_tag: string  // e.g., 'green', 'blue', 'yellow', 'orange', 'red', 'purple', 'gray'
  color_hex: string  // e.g., '#28a745', '#007bff'
  priority: number  // 1=最低风险, 6=最高风险
}

/**
 * Resident Info (for card display)
 */
export interface CardResident {
  resident_id: string
  last_name: string  // Used for card name display
  first_name?: string
  nickname?: string
  service_level?: string  // e.g., 'L1', 'L2' - used to fetch ServiceLevelInfo
  service_level_info?: ServiceLevelInfo  // Color info for color_point display
}

/**
 * Device Info (for card display)
 */
export interface CardDevice {
  device_id: string
  device_name: string
  device_type: number  // 1=sleepace, 2=radar, etc.
  device_model?: string
  binding_type: 'direct' | 'indirect'  // 'direct' = bound to bed, 'indirect' = bound to location
}

/**
 * Vital Focus Card
 * Based on cards table with card_name and card_address
 */
export interface VitalFocusCard {
  card_id: string
  tenant_id: string
  card_type: 'ActiveBed' | 'Location'
  bed_id?: string  // For ActiveBed cards
  location_id?: string  // For Location cards
  card_name: string  // Card name (from cards.card_name) - replaces residents.map(name).join(', ')
  card_address: string  // Card address (from cards.card_address) - replaces addressName
  primary_resident_id?: string  // Primary resident for ActiveBed cards
  
  // Residents associated with this card
  residents: CardResident[]
  
  // Devices bound to this card
  devices: CardDevice[]
  
  // Device counts
  device_count: number
  resident_count: number
  
  // Alarm info (from cards table)
  // 未处理报警统计（按级别分别统计）
  unhandled_alarm_0?: number  // EMERG(0) 未处理报警数量
  unhandled_alarm_1?: number  // ALERT(1) 未处理报警数量
  unhandled_alarm_2?: number  // CRIT(2) 未处理报警数量
  unhandled_alarm_3?: number  // ERR(3) 未处理报警数量
  unhandled_alarm_4?: number  // WARNING(4) 未处理报警数量
  total_unhandled_alarms?: number  // 总未处理报警数量（自动计算）
  
  // 报警显示控制（from cards table）
  icon_alarm_level?: number   // 图标报警级别阈值（默认 3/ERR）
  pop_alarm_emerge?: number   // 弹出报警级别阈值（默认 0/EMERG）
  
  // Device connection status (to be added when device status API is ready)
  r_connection?: number  // Radar connection: 0=offline, 1=online
  s_connection?: number  // Sleepace connection: 0=offline, 1=online
  
  // Real-time data (to be added when real-time API is ready)
  // Note: Backend may return data directly or in a 'statuses' object (for v1.0 compatibility)
  statuses?: Record<string, any>  // Optional: statuses object (v1.0 style) - contains real-time data
  breath?: number
  heart?: number
  bed_status?: number
  timestamp?: number  // Last update timestamp
  sleep_stage?: number  // Sleep stage: 1=awake, 2=light sleep, 4=deep sleep
  heart_source?: string  // Source of heart rate data (lowercase: 's'=sleepace, 'r'=radar) - as in v1.0
  breath_source?: string  // Source of breath rate data (lowercase: 's'=sleepace, 'r'=radar) - as in v1.0
  person_count?: number  // Number of persons detected (for Location cards)
  postures?: number[]  // Posture array: 1=walk, 2=suspected-fall, 3=sitting, 4=stand, 5=fall, 6=lying
  
  // Alarm items (from alarm_events table, for alarm bar display)
  alarms?: Array<{
    event_id: string  // UUID
    event_type: string  // e.g., 'Fall', 'Radar_AbnormalHeartRate', 'OfflineAlarm'
    alarm_level: string | number  // '0'/'EMERG', '1'/'ALERT', '2'/'CRIT', '3'/'ERR', '4'/'WARNING'
    alarm_status: 'active' | 'acknowledged'  // 报警状态
    triggered_at: number  // timestamp
  }>
  // ... other real-time fields
}

/**
 * Get Vital Focus Cards Response
 */
export interface GetVitalFocusCardsModel {
  items: VitalFocusCard[]
  timestamp: number
  pagination: BackendPagination
}

/**
 * Vital Focus Card Detail (for detail page)
 */
export interface VitalFocusCardInfo {
  card_id: string
  tenant_id: string
  card_type: 'ActiveBed' | 'Location'
  bed_id?: string
  location_id?: string
  card_name: string
  card_address: string
  primary_resident_id?: string
  residents: CardResident[]
  devices: CardDevice[]
}

