import type { Device, DeviceStatus, AlarmEvent } from '@/types/device'
import { mockDevices, mockAlarms, generateDeviceStatus, delay } from '@/mock/data'

// 获取所有设备
export async function fetchDevices(): Promise<Device[]> {
  await delay()
  return [...mockDevices]
}

// 获取单个设备状态
export async function fetchDeviceStatus(deviceId: string): Promise<DeviceStatus> {
  await delay(200)
  return generateDeviceStatus(deviceId)
}

// 获取报警列表
export async function fetchAlarms(): Promise<AlarmEvent[]> {
  await delay()
  return [...mockAlarms]
}

// 解决报警
export async function resolveAlarm(alarmId: string): Promise<void> {
  await delay()
  const alarm = mockAlarms.find(a => a.id === alarmId)
  if (alarm) {
    alarm.resolved = true
  }
}
