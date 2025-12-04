/**
 * Alarm Cloud API Model
 * Based on alarm_cloud.sql table structure
 */

export type DangerLevel = 'DISABLE' | 'EMERGENCY' | 'WARNING' | 'ERROR' | 'INFORMATIONAL' | 'CRITICAL'

/**
 * Alarm Cloud Configuration
 * Tenant-level alarm strategy configuration (template)
 */
export interface AlarmCloud {
  tenant_id: string | null // null = system default, specific ID = tenant-specific
  OfflineAlarm?: DangerLevel
  LowBattery?: DangerLevel
  DeviceFailure?: DangerLevel
  device_alarms: {
    [deviceType: string]: {
      [alarmType: string]: DangerLevel
    }
  }
  conditions?: VitalAlarmConditions
  notification_rules?: NotificationRules
  metadata?: Record<string, any>
}

/**
 * Vital Alarm Conditions (HR/RR thresholds)
 * Cloud-based evaluation thresholds
 */
export interface VitalAlarmConditions {
  heart_rate?: {
    EMERGENCY?: {
      ranges: Array<{ min: number | null; max: number | null }>
      duration_sec: number
    }
    WARNING?: {
      ranges: Array<{ min: number | null; max: number | null }>
      duration_sec: number
    }
    Normal?: {
      ranges: Array<{ min: number | null; max: number | null }>
      duration_sec: number
    }
  }
  respiratory_rate?: {
    EMERGENCY?: {
      ranges: Array<{ min: number | null; max: number | null }>
      duration_sec: number
    }
    WARNING?: {
      ranges: Array<{ min: number | null; max: number | null }>
      duration_sec: number
    }
    Normal?: {
      ranges: Array<{ min: number | null; max: number | null }>
      duration_sec: number
    }
  }
}

/**
 * Notification Rules
 * Default notification configuration
 */
export interface NotificationRules {
  channels?: {
    [level: string]: ('WEB' | 'APP' | 'EMAIL' | 'SMS')[]
  }
  immediate?: boolean
  repeat_interval_sec?: number
  escalation?: Record<string, any>
  suppression?: Record<string, any>
  silence?: Record<string, any>
}

/**
 * Get Alarm Cloud Configuration Params
 */
export interface GetAlarmCloudParams {
  tenant_id?: string | null // null = system default
}

/**
 * Update Alarm Cloud Configuration Params
 */
export interface UpdateAlarmCloudParams {
  OfflineAlarm?: DangerLevel
  LowBattery?: DangerLevel
  DeviceFailure?: DangerLevel
  device_alarms?: {
    [deviceType: string]: {
      [alarmType: string]: DangerLevel
    }
  }
  conditions?: VitalAlarmConditions
  notification_rules?: NotificationRules
  metadata?: Record<string, any>
}

/**
 * Alarm Cloud API Result
 */
export interface AlarmCloudResult extends AlarmCloud {}

/**
 * Alarm Event (from alarm_events table)
 * Backend should JOIN with related tables to return complete data
 */
export interface AlarmEvent {
  event_id: string  // UUID
  event_type: string  // e.g., 'Fall', 'Radar_AbnormalHeartRate', 'SleepPad_LeftBed', 'OfflineAlarm'
  category: 'safety' | 'clinical' | 'behavioral' | 'device'  // FHIR Flag Category
  alarm_level: string | number  // '0'/'EMERG', '1'/'ALERT', '2'/'CRIT', '3'/'ERR', '4'/'WARNING'
  alarm_status: 'active' | 'acknowledged' | 'resolved'
  triggered_at: number  // timestamp
  
  // Handling information (for resolved alarms)
  handling_state?: 'verified' | 'false_alarm' | 'test'  // Handle type
  handling_details?: string  // Remarks/notes from handling
  handler_id?: string  // User ID who handled the alarm
  handler_name?: string  // User name who handled the alarm
  handled_at?: number  // timestamp when alarm was handled
  
  // Related data (from JOIN queries)
  card_id?: string
  device_id?: string
  device_name?: string  // from devices table
  
  resident_id?: string
  resident_name?: string  // from residents table (nickname or first_name + last_name)
  resident_gender?: string  // from residents.phi table (gender)
  resident_age?: number  // calculated from residents.phi.birth_date
  resident_network?: string  // from residents table or related data
  
  // Address information (from cards → units → locations)
  location_tag?: string  // from locations table
  building?: string     // from locations table
  floor?: string        // from locations table (e.g., "2F")
  unit_name?: string     // from units table
  // Formatted address display: "location_tag-Building-UnitName"
  address_display?: string
}

/**
 * Get Alarm Events Parameters
 */
export interface GetAlarmEventsParams {
  status: 'active' | 'resolved'  // Filter by alarm status
  // Search parameters
  alarm_time_start?: number  // timestamp (start of time range)
  alarm_time_end?: number    // timestamp (end of time range)
  resident?: string          // Search text (resident name or account)
  location_tag?: string      // Search text (location tag)
  unit_name?: string         // Search text (unit name)
  device_name?: string       // Search text (device name)
  // Filter parameters
  event_types?: string[]     // Multiple selection (event_type filter)
  categories?: string[]       // Multiple selection (category filter)
  alarm_levels?: string[]     // Multiple selection (alarm_level filter)
  // Pagination
  page?: number
  page_size?: number
}

/**
 * Get Alarm Events Result
 */
export interface GetAlarmEventsResult {
  items: AlarmEvent[]
  pagination: {
    size: number
    page: number
    count: number
    total?: number  // Total count of all records (before pagination)
  }
}

/**
 * Handle Alarm Event Parameters
 * Update alarm_status from 'active' to 'acknowledged' or 'resolved'
 */
export interface HandleAlarmEventParams {
  alarm_status: 'acknowledged' | 'resolved'  // Target status after handling
  handle_type?: 'verified' | 'false_alarm' | 'test'  // Handle type: Verified and processed / False Alarm / Test
  remarks?: string  // Remarks/notes
}

