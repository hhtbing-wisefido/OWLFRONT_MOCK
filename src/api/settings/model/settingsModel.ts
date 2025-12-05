/**
 * Device Monitor Settings Models
 * Note: All field names use snake_case to match database schema
 */

/**
 * Alarm Level Options
 * 'disabled' means the monitoring item is disabled
 * '0'-'7' are standard alarm levels
 */
export type AlarmLevel = 'disabled' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7'

/**
 * Sleepace Device Monitor Settings
 */
export interface SleepaceMonitorSettings {
  // Sleep duration
  left_bed_start_hour: number  // Went to bed hour (0-23)
  left_bed_start_minute: number  // Went to bed minute (0-59)
  left_bed_end_hour: number  // Get up hour (0-23)
  left_bed_end_minute: number  // Get up minute (0-59)
  
  // Leave bed
  left_bed_duration: number  // Duration in seconds
  left_bed_alarm_level: AlarmLevel  // Alarm level or 'disabled'
  
  // Heart rate too slow
  min_heart_rate: number  // Minimum heart rate (bpm)
  heart_rate_slow_duration: number  // Duration in seconds
  heart_rate_slow_alarm_level: AlarmLevel
  
  // Heart rate too fast
  max_heart_rate: number  // Maximum heart rate (bpm)
  heart_rate_fast_duration: number  // Duration in seconds
  heart_rate_fast_alarm_level: AlarmLevel
  
  // Breath rate too slow
  min_breath_rate: number  // Minimum breath rate (rpm)
  breath_rate_slow_duration: number  // Duration in seconds
  breath_rate_slow_alarm_level: AlarmLevel
  
  // Breath rate too fast
  max_breath_rate: number  // Maximum breath rate (rpm)
  breath_rate_fast_duration: number  // Duration in seconds
  breath_rate_fast_alarm_level: AlarmLevel
  
  // Breath pause (apnea)
  breath_pause_duration: number  // Duration in seconds
  breath_pause_alarm_level: AlarmLevel
  
  // Body move
  body_move_duration: number  // Duration in seconds
  body_move_alarm_level: AlarmLevel
  
  // No body move
  nobody_move_duration: number  // Duration in seconds
  nobody_move_alarm_level: AlarmLevel
  
  // No turn over
  no_turn_over_duration: number  // Duration in seconds
  no_turn_over_alarm_level: AlarmLevel
  
  // Sit up
  situp_alarm_level: AlarmLevel
  
  // On bed
  onbed_duration: number  // Duration in seconds
  onbed_alarm_level: AlarmLevel
  
  // Sensor fall
  fall_alarm_level: AlarmLevel
}

/**
 * Update Sleepace Monitor Settings Parameters
 */
export interface UpdateSleepaceMonitorSettingsParams {
  left_bed_start_hour: number
  left_bed_start_minute: number
  left_bed_end_hour: number
  left_bed_end_minute: number
  left_bed_duration: number
  left_bed_alarm_level: AlarmLevel
  min_heart_rate: number
  heart_rate_slow_duration: number
  heart_rate_slow_alarm_level: AlarmLevel
  max_heart_rate: number
  heart_rate_fast_duration: number
  heart_rate_fast_alarm_level: AlarmLevel
  min_breath_rate: number
  breath_rate_slow_duration: number
  breath_rate_slow_alarm_level: AlarmLevel
  max_breath_rate: number
  breath_rate_fast_duration: number
  breath_rate_fast_alarm_level: AlarmLevel
  breath_pause_duration: number
  breath_pause_alarm_level: AlarmLevel
  body_move_duration: number
  body_move_alarm_level: AlarmLevel
  nobody_move_duration: number
  nobody_move_alarm_level: AlarmLevel
  no_turn_over_duration: number
  no_turn_over_alarm_level: AlarmLevel
  situp_alarm_level: AlarmLevel
  onbed_duration: number
  onbed_alarm_level: AlarmLevel
  fall_alarm_level: AlarmLevel
}

/**
 * Radar Device Monitor Settings
 */
export interface RadarMonitorSettings {
  // Monitoring mode
  radar_function_mode: number  // 3=People Tracking, 7=Fall Monitoring, 11=Sleep Monitoring, 15=Full Function
  
  // Fall detection
  suspected_fall_duration: number  // Duration in seconds (0-300)
  fall_alarm_level: AlarmLevel
  
  // Posture detection
  posture_detection_alarm_level: AlarmLevel
  
  // Sitting on ground
  sitting_on_ground_duration: number  // Duration in seconds (0-600)
  sitting_on_ground_alarm_level: AlarmLevel
  
  // Stay
  stay_detection_duration: number  // Duration in minutes (0-120)
  stay_alarm_level: AlarmLevel
  
  // Leave bed
  leave_detection_start_hour: number  // Went to bed hour (0-23)
  leave_detection_start_minute: number  // Went to bed minute (0-59)
  leave_detection_end_hour: number  // Get up hour (0-23)
  leave_detection_end_minute: number  // Get up minute (0-59)
  leave_detection_duration: number  // Duration in minutes
  leave_alarm_level: AlarmLevel
  
  // Heart rate too slow
  lower_heart_rate: number  // Lower heart rate threshold (bpm, 0-60)
  heart_rate_slow_alarm_level: AlarmLevel
  
  // Heart rate too fast
  upper_heart_rate: number  // Upper heart rate threshold (bpm, 70-150)
  heart_rate_fast_alarm_level: AlarmLevel
  
  // Breath rate too slow
  lower_breath_rate: number  // Lower breath rate threshold (rpm, 6-20)
  breath_rate_slow_alarm_level: AlarmLevel
  
  // Breath rate too fast
  upper_breath_rate: number  // Upper breath rate threshold (rpm, 22-40)
  breath_rate_fast_alarm_level: AlarmLevel
  
  // Breath pause (apnea)
  breath_pause_alarm_level: AlarmLevel
  
  // Weak vital sign
  weak_vital_duration: number  // Duration in minutes (1-15)
  weak_vital_sensitivity: number  // Sensitivity (1-99)
  weak_vital_alarm_level: AlarmLevel
  
  // Inactivity
  inactivity_alarm_level: AlarmLevel
}

/**
 * Update Radar Monitor Settings Parameters
 */
export interface UpdateRadarMonitorSettingsParams {
  radar_function_mode: number
  suspected_fall_duration: number
  fall_alarm_level: AlarmLevel
  posture_detection_alarm_level: AlarmLevel
  sitting_on_ground_duration: number
  sitting_on_ground_alarm_level: AlarmLevel
  stay_detection_duration: number
  stay_alarm_level: AlarmLevel
  leave_detection_start_hour: number
  leave_detection_start_minute: number
  leave_detection_end_hour: number
  leave_detection_end_minute: number
  leave_detection_duration: number
  leave_alarm_level: AlarmLevel
  lower_heart_rate: number
  heart_rate_slow_alarm_level: AlarmLevel
  upper_heart_rate: number
  heart_rate_fast_alarm_level: AlarmLevel
  lower_breath_rate: number
  breath_rate_slow_alarm_level: AlarmLevel
  upper_breath_rate: number
  breath_rate_fast_alarm_level: AlarmLevel
  breath_pause_alarm_level: AlarmLevel
  weak_vital_duration: number
  weak_vital_sensitivity: number
  weak_vital_alarm_level: AlarmLevel
  inactivity_alarm_level: AlarmLevel
}

