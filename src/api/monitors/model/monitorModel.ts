/**
 * Monitor API models
 * Note: All field names use snake_case to match database schema (PostgreSQL standard)
 * 
 * Data Source Strategy:
 * - Real-time data: Redis cache (priority) → TimescaleDB (fallback)
 *   - Query condition: data_type = 'observation' (monitoring data, no danger level)
 * - Alarm data: PostgreSQL (direct query from alarm_events table)
 * 
 * Data Format:
 * - Observation (data_type = 'observation'): 
 *   - vital-signs: HR, RR (raw values)
 *   - activity: posture, sleep state, behavior events
 * - Alarm (data_type = 'alarm', stored in alarm_events):
 *   - safety: Fall, SuspectedFall, ProlongedStay, NoActivity24h
 *   - clinical: Tachycardia, Bradycardia, Apnea
 *   - behavioral: NoTurning2H, NoBodyMovement2H, Wandering
 *   - device: OfflineAlarm, DeviceFailure, LowBattery
 * 
 * FHIR Category:
 * - Observation Category: vital-signs, activity, social-history
 * - Flag Category: safety, clinical, behavioral, device
 * 
 * See: owlRD/docs/06_FHIR_Simple_Conversion_Guide.md for detailed documentation
 * See: owlRD/db/12_iot_timeseries.sql for database schema
 * See: owlRD/db/24_alarm_events.sql for alarm events schema
 */

import type { BackendPagination } from '@/api/model/pagination'

/**
 * Service Level Info (from service_levels table)
 * Used to display color_point for residents
 */
export interface ServiceLevelInfo {
  level_code: string  // e.g., 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'
  display_name: string  // e.g., 'Independent', 'Assisted'
  display_name_cn?: string  // e.g., '无需协助', '需部分协助' (Chinese display name, optional)
  color_tag: string  // e.g., 'green', 'blue', 'yellow', 'orange', 'red', 'purple', 'gray'
  color_hex: string  // e.g., '#28a745', '#007bff'
  priority: number  // 1=lowest risk, 6=highest risk
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
  // Unhandled alarm statistics (counted by level)
  unhandled_alarm_0?: number  // EMERG(0) unhandled alarm count
  unhandled_alarm_1?: number  // ALERT(1) unhandled alarm count
  unhandled_alarm_2?: number  // CRIT(2) unhandled alarm count
  unhandled_alarm_3?: number  // ERR(3) unhandled alarm count
  unhandled_alarm_4?: number  // WARNING(4) unhandled alarm count
  total_unhandled_alarms?: number  // Total unhandled alarm count (auto-calculated)
  
  // Alarm display control (from cards table)
  icon_alarm_level?: number   // Icon alarm level threshold (default 3/ERR)
  pop_alarm_emerge?: number   // Popup alarm level threshold (default 0/EMERG)
  
  // Device connection status (to be added when device status API is ready)
  r_connection?: number  // Radar connection: 0=offline, 1=online
  s_connection?: number  // Sleepace connection: 0=offline, 1=online
  
  // Real-time data (from iot_timeseries table via Redis cache or TimescaleDB)
  // Note: Backend may return data directly or in a 'statuses' object (for v1.0 compatibility)
  // Query condition: data_type = 'observation' (monitoring data, no danger level)
  statuses?: Record<string, any>  // Optional: statuses object (v1.0 style) - contains real-time data
  
  // Physiological data (from iot_timeseries.heart_rate, respiratory_rate, category: 'vital-signs')
  breath?: number  // Respiratory rate (breaths/min) - from iot_timeseries.respiratory_rate
  heart?: number   // Heart rate (bpm) - from iot_timeseries.heart_rate
  breath_source?: 's' | 'r' | '-'  // Source: 's'=sleepace, 'r'=radar, '-'=no data (lowercase, as in v1.0)
  heart_source?: 's' | 'r' | '-'   // Source: 's'=sleepace, 'r'=radar, '-'=no data (lowercase, as in v1.0)
  
  // Sleep state (from iot_timeseries.sleep_state_snomed_code, category: 'activity')
  // Note: Sleep state is always pushed together with HR/RR data
  sleep_stage?: number  // Sleep stage: 1=awake, 2=light sleep, 4=deep sleep
  sleep_state_snomed_code?: string  // SNOMED CT code (see owlRD/docs/06_FHIR_Simple_Conversion_Guide.md)
  sleep_state_display?: string       // Display name (standard English name): 'Awake', 'Light sleep', 'Deep sleep'
  
  // Bed status (from iot_timeseries.event_type: 'ENTER_BED', 'LEFT_BED', category: 'activity')
  bed_status?: number  // 0=in bed, 1=out of bed
  
  // Posture data (from iot_timeseries.posture_snomed_code, category: 'activity', for Location cards)
  person_count?: number  // Number of persons detected (sum of all tracking_ids from all radars, no deduplication)
  postures?: number[]    // Posture array: 1=walk, 2=suspected-fall, 3=sitting, 4=stand, 5=fall, 6=lying
  
  // Time information (for ActiveBed cards, formatted by backend with location timezone consideration)
  // Note: When bed_status changes (ENTER_BED or LEFT_BED event), record the event timestamp
  bed_status_timestamp?: string  // Bed status change event local time (formatted, timezone-aware): e.g., "05:52:30" (hh:mm:ss format)
  status_duration?: string       // Duration from bed status change event to current time (formatted): e.g., "01:10" (HH:MM format, 1h 10m) or "00:45" (45m)
  
  // Alarm items (from alarm_events table, for alarm bar display)
  // Note: Alarm events correspond to FHIR Flag resources
  alarms?: Array<{
    event_id: string  // UUID (from alarm_events.event_id)
    event_type: string  // e.g., 'Fall', 'Radar_AbnormalHeartRate', 'SleepPad_LeftBed', 'OfflineAlarm'
    category?: 'safety' | 'clinical' | 'behavioral' | 'device'  // FHIR Flag Category (not TDP Tag Category)
    alarm_level: string | number  // '0'/'EMERG', '1'/'ALERT', '2'/'CRIT', '3'/'ERR', '4'/'WARNING'
    alarm_status: 'active' | 'acknowledged'  // Alarm status
    triggered_at: number  // timestamp (from alarm_events.triggered_at)
    triggered_by?: string  // Device name (e.g., 'Radar01') or 'Cloud'
    trigger_data?: {
      heart_rate?: number
      respiratory_rate?: number
      posture?: string  // Posture display name (standard English name)
      event_type?: string
      confidence?: number
      duration_sec?: number
      threshold?: { min?: number; max?: number }
      snomed_code?: string  // SNOMED CT code (see owlRD/docs/06_FHIR_Simple_Conversion_Guide.md)
      snomed_display?: string  // SNOMED display name (standard English name)
    }
    iot_timeseries_id?: number  // Associated iot_timeseries record ID (for tracing original data)
  }>
}

/**
 * Get Vital Focus Cards Response
 */
export interface GetVitalFocusCardsModel {
  items: VitalFocusCard[]
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

