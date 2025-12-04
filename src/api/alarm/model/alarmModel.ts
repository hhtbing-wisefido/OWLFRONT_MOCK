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

