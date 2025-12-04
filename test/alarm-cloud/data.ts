/**
 * Alarm Cloud Test Data
 * Default configuration for alarm_cloud table
 */

import type { AlarmCloud } from '@/api/alarm/model/alarmModel'

export const defaultAlarmCloudConfig: AlarmCloud = {
  tenant_id: null, // System default
  OfflineAlarm: 'ERROR',
  LowBattery: 'WARNING',
  DeviceFailure: 'ERROR',
  device_alarms: {
    Radar: {
      Fall: 'EMERGENCY',
      Radar_ApneaHypopnea: 'EMERGENCY',
      Radar_AbnormalHeartRate: 'EMERGENCY',
      Radar_AbnormalRespiratoryRate: 'EMERGENCY',
      Radar_LeftBed: 'WARNING',
      SuspectedFall: 'WARNING',
      VitalsWeak: 'WARNING',
      Stay: 'WARNING',
      NoActivity24h: 'EMERGENCY',
      AngleException: 'WARNING',
    },
    SleepPad: {
      SleepPad_LeftBed: 'WARNING',
      SleepPad_SitUp: 'WARNING',
      SleepPad_ApneaHypopnea: 'EMERGENCY',
      SleepPad_AbnormalHeartRate: 'EMERGENCY',
      SleepPad_AbnormalRespiratoryRate: 'EMERGENCY',
      SleepPad_AbnormalBodyMovement: 'WARNING',
      SleepPad_InBed: 'DISABLE',
    },
  },
  conditions: {
    heart_rate: {
      EMERGENCY: {
        ranges: [{ min: 0, max: 44 }, { min: 116, max: null }],
        duration_sec: 60,
      },
      WARNING: {
        ranges: [{ min: 45, max: 54 }, { min: 96, max: 115 }],
        duration_sec: 300,
      },
      Normal: {
        ranges: [{ min: 55, max: 95 }],
        duration_sec: 0,
      },
    },
    respiratory_rate: {
      EMERGENCY: {
        ranges: [{ min: 0, max: 7 }, { min: 27, max: null }],
        duration_sec: 60,
      },
      WARNING: {
        ranges: [{ min: 8, max: 9 }, { min: 24, max: 26 }],
        duration_sec: 300,
      },
      Normal: {
        ranges: [{ min: 10, max: 23 }],
        duration_sec: 0,
      },
    },
  },
  notification_rules: {
    channels: {
      EMERGENCY: ['WEB', 'APP'],
      ALERT: ['WEB', 'APP'],
      CRITICAL: ['WEB', 'APP'],
      ERROR: ['WEB', 'APP'],
      WARNING: ['WEB', 'APP'],
    },
    immediate: true,
    repeat_interval_sec: 300,
  },
}

