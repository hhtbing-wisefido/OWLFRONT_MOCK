/**
 * Device Store API Mock 函数
 * 对应 src/api/admin/device-store/deviceStore.ts
 * 用于开发环境模拟后端 API 响应
 */

import type { DeviceStore } from './types'
import { mockDeviceStores, mockTenants } from './data'
import { delay } from '../../utils/generator'

// 模拟内存存储（用于模拟更新操作）
let deviceStoreData: DeviceStore[] = [...mockDeviceStores]

/**
 * Mock: 获取设备库存列表
 */
export async function mockGetDeviceStores(): Promise<{ items: DeviceStore[] }> {
  await delay(300)
  
  // 返回所有设备（包含 tenant_name，通过 JOIN tenants 表）
  return {
    items: deviceStoreData.map((device) => ({
      ...device,
      // tenant_name 已经在数据中，如果 tenant_id 存在但 tenant_name 为空，需要查找
      tenant_name: device.tenant_id
        ? mockTenants.find((t) => t.tenant_id === device.tenant_id)?.tenant_name || null
        : null,
    })),
  }
}

/**
 * Mock: 获取租户列表
 */
export async function mockGetTenants(): Promise<{ items: typeof mockTenants }> {
  await delay(200)
  return {
    items: mockTenants,
  }
}

/**
 * Mock: 更新设备库存信息
 */
export async function mockUpdateDeviceStore(
  device_store_id: string,
  data: Partial<DeviceStore>,
): Promise<{ success: boolean }> {
  await delay(300)
  
  const index = deviceStoreData.findIndex((d) => d.device_store_id === device_store_id)
  if (index === -1) {
    throw new Error('Device store not found')
  }
  
  // 更新数据
  deviceStoreData[index] = {
    ...deviceStoreData[index],
    ...data,
    // 如果更新了 tenant_id，更新 tenant_name
    tenant_name: data.tenant_id
      ? mockTenants.find((t) => t.tenant_id === data.tenant_id)?.tenant_name || null
      : null,
    // 如果分配了租户，设置 allocate_time
    allocate_time: data.tenant_id && !deviceStoreData[index].tenant_id
      ? new Date().toISOString()
      : data.tenant_id === null
      ? null
      : deviceStoreData[index].allocate_time,
  }
  
  return { success: true }
}

/**
 * Mock: 批量更新设备库存信息
 */
export async function mockBatchUpdateDeviceStores(
  updates: Array<{ device_store_id: string; data: Partial<DeviceStore> }>,
): Promise<{ success: boolean }> {
  await delay(500)
  
  for (const update of updates) {
    await mockUpdateDeviceStore(update.device_store_id, update.data)
  }
  
  return { success: true }
}

