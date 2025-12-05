/**
 * Settings API Mock 函数
 * 对应 src/api/settings/settings.ts
 * 用于开发环境模拟后端 API 响应
 */

import type {
  SleepaceMonitorSettings,
  RadarMonitorSettings,
  UpdateSleepaceMonitorSettingsParams,
  UpdateRadarMonitorSettingsParams,
} from '@/api/settings/model/settingsModel'
import { defaultSleepaceSettings, defaultRadarSettings } from './data'
import { delay } from '../utils/generator'

// In-memory storage for mock settings (simulate database)
const sleepaceSettingsStore = new Map<string, SleepaceMonitorSettings>()
const radarSettingsStore = new Map<string, RadarMonitorSettings>()

/**
 * Mock: Get Sleepace Device Monitor Settings
 */
export async function mockGetSleepaceSettings(
  deviceId: string,
): Promise<SleepaceMonitorSettings> {
  await delay(300) // 模拟网络延迟
  
  // If settings exist in store, return them; otherwise return default
  if (sleepaceSettingsStore.has(deviceId)) {
    return sleepaceSettingsStore.get(deviceId)!
  }
  
  // Return default settings
  return { ...defaultSleepaceSettings }
}

/**
 * Mock: Update Sleepace Device Monitor Settings
 */
export async function mockUpdateSleepaceSettings(
  deviceId: string,
  params: UpdateSleepaceMonitorSettingsParams,
): Promise<void> {
  await delay(500) // 模拟网络延迟
  
  // Update settings in store
  sleepaceSettingsStore.set(deviceId, params as SleepaceMonitorSettings)
  
  console.log('%c[Mock] Sleepace settings updated', 'color: #52c41a; font-weight: bold', {
    deviceId,
    params,
  })
}

/**
 * Mock: Get Radar Device Monitor Settings
 */
export async function mockGetRadarSettings(
  deviceId: string,
): Promise<RadarMonitorSettings> {
  await delay(300) // 模拟网络延迟
  
  // If settings exist in store, return them; otherwise return default
  if (radarSettingsStore.has(deviceId)) {
    return radarSettingsStore.get(deviceId)!
  }
  
  // Return default settings
  return { ...defaultRadarSettings }
}

/**
 * Mock: Update Radar Device Monitor Settings
 */
export async function mockUpdateRadarSettings(
  deviceId: string,
  params: UpdateRadarMonitorSettingsParams,
): Promise<void> {
  await delay(500) // 模拟网络延迟
  
  // Update settings in store
  radarSettingsStore.set(deviceId, params as RadarMonitorSettings)
  
  console.log('%c[Mock] Radar settings updated', 'color: #52c41a; font-weight: bold', {
    deviceId,
    params,
  })
}

