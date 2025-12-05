/**
 * Settings Mock Data
 * 对应 src/api/settings/model/settingsModel.ts
 */

import type { SleepaceMonitorSettings, RadarMonitorSettings } from '@/api/settings/model/settingsModel'

/**
 * Default Sleepace Monitor Settings
 */
export const defaultSleepaceSettings: SleepaceMonitorSettings = {
  // Sleep duration
  left_bed_start_hour: 22,
  left_bed_start_minute: 0,
  left_bed_end_hour: 6,
  left_bed_end_minute: 0,
  
  // Leave bed
  left_bed_duration: 0,
  left_bed_alarm_level: 'disabled',
  
  // Heart rate too slow
  min_heart_rate: 45,
  heart_rate_slow_duration: 0,
  heart_rate_slow_alarm_level: 'disabled',
  
  // Heart rate too fast
  max_heart_rate: 110,
  heart_rate_fast_duration: 0,
  heart_rate_fast_alarm_level: 'disabled',
  
  // Breath rate too slow
  min_breath_rate: 10,
  breath_rate_slow_duration: 0,
  breath_rate_slow_alarm_level: 'disabled',
  
  // Breath rate too fast
  max_breath_rate: 22,
  breath_rate_fast_duration: 0,
  breath_rate_fast_alarm_level: 'disabled',
  
  // Breath pause (apnea)
  breath_pause_duration: 15,
  breath_pause_alarm_level: 'disabled',
  
  // Body move
  body_move_duration: 5,
  body_move_alarm_level: 'disabled',
  
  // No body move
  nobody_move_duration: 45,
  nobody_move_alarm_level: 'disabled',
  
  // No turn over
  no_turn_over_duration: 45,
  no_turn_over_alarm_level: 'disabled',
  
  // Sit up
  situp_alarm_level: 'disabled',
  
  // On bed
  onbed_duration: 3 * 60,
  onbed_alarm_level: 'disabled',
  
  // Sensor fall
  fall_alarm_level: 'disabled',
}

/**
 * Default Radar Monitor Settings
 */
export const defaultRadarSettings: RadarMonitorSettings = {
  // Monitoring mode
  radar_function_mode: 15, // Full Function
  
  // Fall detection
  suspected_fall_duration: 0,
  fall_alarm_level: 'disabled',
  
  // Posture detection
  posture_detection_alarm_level: 'disabled',
  
  // Sitting on ground
  sitting_on_ground_duration: 0,
  sitting_on_ground_alarm_level: 'disabled',
  
  // Stay
  stay_detection_duration: 0,
  stay_alarm_level: 'disabled',
  
  // Leave bed
  leave_detection_start_hour: 22,
  leave_detection_start_minute: 0,
  leave_detection_end_hour: 6,
  leave_detection_end_minute: 0,
  leave_detection_duration: 0,
  leave_alarm_level: 'disabled',
  
  // Heart rate too slow
  lower_heart_rate: 0,
  heart_rate_slow_alarm_level: 'disabled',
  
  // Heart rate too fast
  upper_heart_rate: 0,
  heart_rate_fast_alarm_level: 'disabled',
  
  // Breath rate too slow
  lower_breath_rate: 0,
  breath_rate_slow_alarm_level: 'disabled',
  
  // Breath rate too fast
  upper_breath_rate: 0,
  breath_rate_fast_alarm_level: 'disabled',
  
  // Breath pause (apnea)
  breath_pause_alarm_level: 'disabled',
  
  // Weak vital sign
  weak_vital_duration: 0,
  weak_vital_sensitivity: 0,
  weak_vital_alarm_level: 'disabled',
  
  // Inactivity
  inactivity_alarm_level: 'disabled',
}

