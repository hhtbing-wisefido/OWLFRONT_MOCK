// 设备类型定义
export interface Device {
  id: string
  name: string
  status: 'online' | 'offline' | 'alarm'
  location: string
  room: string
  bed: string
  radarId: string
  hasAlarm: boolean
  alarmType?: string
  lastUpdate: string
}

// 设备状态
export interface DeviceStatus {
  heartRate: number
  breathRate: number
  presence: boolean
  bodyMovement: number
  timestamp: string
}

// 报警事件
export interface AlarmEvent {
  id: string
  deviceId: string
  deviceName: string
  type: 'heart_rate' | 'breath_rate' | 'fall' | '离床' | 'unusual_movement'
  level: 'warning' | 'danger'
  message: string
  timestamp: string
  resolved: boolean
}
