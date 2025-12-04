/**
 * Alarm Cloud Mock Functions
 * Mock API functions for alarm_cloud table
 */

import type { AlarmCloud, AlarmCloudResult, GetAlarmCloudParams, UpdateAlarmCloudParams } from '@/api/alarm/model/alarmModel'
import { defaultAlarmCloudConfig } from './data'

// Store tenant-specific configurations (in-memory)
const tenantConfigs: Map<string | null, AlarmCloud> = new Map()

// Initialize with system default
tenantConfigs.set(null, JSON.parse(JSON.stringify(defaultAlarmCloudConfig)))

/**
 * Mock: Get alarm cloud configuration
 */
export async function mockGetAlarmCloud(params?: GetAlarmCloudParams): Promise<AlarmCloudResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const tenantId = params?.tenant_id ?? null

  // If tenant has specific config, return it; otherwise return system default
  if (tenantConfigs.has(tenantId)) {
    return JSON.parse(JSON.stringify(tenantConfigs.get(tenantId)!))
  }

  // Return system default
  return JSON.parse(JSON.stringify(tenantConfigs.get(null)!))
}

/**
 * Mock: Update alarm cloud configuration
 */
export async function mockUpdateAlarmCloud(params: UpdateAlarmCloudParams): Promise<AlarmCloudResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In real scenario, we would get tenant_id from user context
  // For mock, we'll use null (system default) or create tenant-specific config
  const tenantId = null // TODO: Get from user context

  // Get existing config or use default
  const existingConfig = tenantConfigs.get(tenantId) || JSON.parse(JSON.stringify(defaultAlarmCloudConfig))

  // Merge with update params
  const updatedConfig: AlarmCloud = {
    ...existingConfig,
    ...params,
    device_alarms: {
      ...existingConfig.device_alarms,
      ...(params.device_alarms || {}),
    },
    conditions: params.conditions || existingConfig.conditions,
    notification_rules: params.notification_rules || existingConfig.notification_rules,
  }

  // Save to store
  tenantConfigs.set(tenantId, updatedConfig)

  return JSON.parse(JSON.stringify(updatedConfig))
}

