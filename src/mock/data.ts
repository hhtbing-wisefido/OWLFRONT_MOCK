import type { Device, DeviceStatus, AlarmEvent } from '@/types/device'

// Mock设备数据
export const mockDevices: Device[] = [
  {
    id: '001',
    name: '101床位',
    status: 'online',
    location: '1号楼',
    room: '101房间',
    bed: '101床',
    radarId: 'radar_001',
    hasAlarm: false,
    lastUpdate: new Date().toISOString()
  },
  {
    id: '002',
    name: '102床位',
    status: 'alarm',
    location: '1号楼',
    room: '102房间',
    bed: '102床',
    radarId: 'radar_002',
    hasAlarm: true,
    alarmType: '心率异常',
    lastUpdate: new Date().toISOString()
  },
  {
    id: '003',
    name: '103床位',
    status: 'online',
    location: '1号楼',
    room: '103房间',
    bed: '103床',
    radarId: 'radar_003',
    hasAlarm: false,
    lastUpdate: new Date().toISOString()
  },
  {
    id: '004',
    name: '201床位',
    status: 'offline',
    location: '2号楼',
    room: '201房间',
    bed: '201床',
    radarId: 'radar_004',
    hasAlarm: false,
    lastUpdate: new Date().toISOString()
  }
]

// 生成随机设备状态
export function generateDeviceStatus(deviceId: string): DeviceStatus {
  return {
    heartRate: Math.floor(Math.random() * 40) + 60, // 60-100
    breathRate: Math.floor(Math.random() * 10) + 12, // 12-22
    presence: Math.random() > 0.2, // 80%在床
    bodyMovement: Math.floor(Math.random() * 100),
    timestamp: new Date().toISOString()
  }
}

// Mock报警事件
export const mockAlarms: AlarmEvent[] = [
  {
    id: 'alarm_001',
    deviceId: '002',
    deviceName: '102床位',
    type: 'heart_rate',
    level: 'danger',
    message: '心率过高：120次/分',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    resolved: false
  },
  {
    id: 'alarm_002',
    deviceId: '003',
    deviceName: '103床位',
    type: '离床',
    level: 'warning',
    message: '长时间离床',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    resolved: true
  }
]

// 模拟API延迟
export function delay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
