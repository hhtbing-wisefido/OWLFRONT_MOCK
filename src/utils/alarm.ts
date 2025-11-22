/**
 * Alarm utility functions
 * For formatting alarm types and levels
 */

/**
 * Convert alarm level to number (support both string and number format)
 */
export function parseAlarmLevel(level: string | number): number {
  if (typeof level === 'number') {
    return level
  }
  
  // String format: '0', '1', '2', '3', '4', 'EMERG', 'ALERT', 'CRIT', 'ERR', 'WARNING'
  switch (level.toUpperCase()) {
    case '0':
    case 'EMERG':
      return 0
    case '1':
    case 'ALERT':
      return 1
    case '2':
    case 'CRIT':
      return 2
    case '3':
    case 'ERR':
      return 3
    case '4':
    case 'WARNING':
      return 4
    default:
      return 999 // Unknown level
  }
}

/**
 * Get alarm color based on level
 * EMERG(0) and ALERT(1): red
 * CRIT(2), ERR(3), WARNING(4): orange
 */
export function getAlarmColor(level: number): string {
  if (level === 0 || level === 1) {
    return '#d32f2f' // Red
  } else if (level >= 2 && level <= 4) {
    return '#f3783f' // Orange
  } else {
    return '#a9a9a9' // Gray
  }
}

/**
 * Get highest alarm level from unhandled alarms (considering threshold)
 * Returns the highest level that has active alarms within the threshold
 * Returns -1 if no alarms found
 */
export function getHighestAlarmLevel(
  unhandledAlarms: {
    0: number
    1: number
    2: number
    3: number
    4: number
  },
  threshold: number = 4, // icon_alarm_level or pop_alarm_emerge
): number {
  // Search from highest to lowest priority (0 > 1 > 2 > 3 > 4)
  for (let level = 0; level <= threshold && level <= 4; level++) {
    if (unhandledAlarms[level] > 0) {
      return level
    }
  }
  return -1 // No alarms found
}

/**
 * Format alarm event type to display string
 * Converts event_type (e.g., 'OfflineAlarm', 'Fall', 'Radar_AbnormalHeartRate') to readable name
 */
export function formatAlarmTypeToString(eventType: string): string {
  // Map event_type to display name
  const typeMap: Record<string, string> = {
    // Device errors
    'OfflineAlarm': 'Offline',
    'LowBattery': 'Low Battery',
    'DeviceFailure': 'Device Failure',
    'DeviceOnline': 'Device Online',
    'DeviceRecovered': 'Device Recovered',
    
    // Safety alarms
    'Fall': 'Fall',
    'SuspectedFall': 'Suspected Fall',
    'Stay': 'Stay',
    'NoActivity24h': 'No Activity 24h',
    
    // Behavioral alarms
    'LeftBed': 'Left Bed',
    'SleepPad_LeftBed': 'Left Bed',
    'Radar_LeftBed': 'Left Bed',
    'SitUp': 'Sit Up',
    'NoTurning.2H': 'No Turning 2H',
    'NoBodyMovement.2H': 'No Body Movement 2H',
    
    // Physiological alarms
    'AbnormalHeartRate': 'Abnormal Heart Rate',
    'Radar_AbnormalHeartRate': 'Abnormal Heart Rate',
    'HeartRateFast': 'Heart Rate Fast',
    'HeartRateSlow': 'Heart Rate Slow',
    'AbnormalRespiratoryRate': 'Abnormal Respiratory Rate',
    'Radar_AbnormalRespiratoryRate': 'Abnormal Respiratory Rate',
    'BreathRateFast': 'Breath Rate Fast',
    'BreathRateSlow': 'Breath Rate Slow',
    'ApneaHypopnea': 'Apnea Hypopnea',
    'Radar_ApneaHypopnea': 'Apnea Hypopnea',
    
    // Other
    'AlarmAutoCancelled': 'Alarm Auto Cancelled',
    'PoorReception': 'Poor Reception',
    'AngleException': 'Angle Exception',
  }
  
  // Check exact match first
  if (typeMap[eventType]) {
    return typeMap[eventType]
  }
  
  // Try to match with common patterns
  if (eventType.includes('HeartRate')) {
    if (eventType.includes('Fast') || eventType.includes('High')) {
      return 'Heart Rate Fast'
    } else if (eventType.includes('Slow') || eventType.includes('Low')) {
      return 'Heart Rate Slow'
    }
    return 'Abnormal Heart Rate'
  }
  
  if (eventType.includes('RespiratoryRate') || eventType.includes('BreathRate')) {
    if (eventType.includes('Fast') || eventType.includes('High')) {
      return 'Breath Rate Fast'
    } else if (eventType.includes('Slow') || eventType.includes('Low')) {
      return 'Breath Rate Slow'
    }
    return 'Abnormal Respiratory Rate'
  }
  
  if (eventType.includes('Apnea')) {
    return 'Apnea Hypopnea'
  }
  
  if (eventType.includes('LeftBed') || eventType.includes('Left_Bed')) {
    return 'Left Bed'
  }
  
  // Default: return formatted event_type (replace underscores with spaces, capitalize)
  return eventType
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

