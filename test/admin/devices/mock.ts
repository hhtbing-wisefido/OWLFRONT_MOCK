/**
 * Devices Mock 函数
 * 模拟 devices API 调用
 */

import { delay } from '../../utils/generator'
import type {
  Device,
  GetDevicesParams,
  GetDevicesResult,
  UpdateDeviceParams,
  DeleteDeviceParams,
} from '@/api/device/model/deviceModel'
import { mockDevicesData } from './data'

/**
 * Mock: 获取设备列表
 */
export async function mockGetDevices(params?: GetDevicesParams): Promise<GetDevicesResult> {
  await delay(200)
  
  let filteredDevices = [...mockDevicesData]
  
  // 按 tenant_id 过滤
  if (params?.tenant_id) {
    filteredDevices = filteredDevices.filter(device => device.tenant_id === params.tenant_id)
  }
  
  // 按 device_type 过滤
  if (params?.device_type) {
    filteredDevices = filteredDevices.filter(device => device.device_type === params.device_type)
  }
  
  // 按 status 过滤（数组）
  if (params?.status && params.status.length > 0) {
    filteredDevices = filteredDevices.filter(device => params.status!.includes(device.status))
  } else {
    // 默认过滤掉 disabled 状态的设备
    filteredDevices = filteredDevices.filter(device => device.status !== 'disabled')
  }
  
  // 按 business_access 过滤
  if (params?.business_access) {
    filteredDevices = filteredDevices.filter(device => device.business_access === params.business_access)
  }
  
  // 按搜索关键词过滤
  if (params?.search_keyword && params?.search_type) {
    const keyword = params.search_keyword.toLowerCase()
    filteredDevices = filteredDevices.filter(device => {
      const searchField = device[params.search_type!]
      if (!searchField) return false
      return searchField.toLowerCase().includes(keyword)
    })
  }
  
  // 排序
  if (params?.sort) {
    const direction = params.direction === 'desc' ? -1 : 1
    filteredDevices.sort((a, b) => {
      const aValue = (a as any)[params.sort!]
      const bValue = (b as any)[params.sort!]
      if (aValue < bValue) return -1 * direction
      if (aValue > bValue) return 1 * direction
      return 0
    })
  }
  
  // 分页
  const page = params?.page || 1
  const size = params?.size || 10
  const start = (page - 1) * size
  const end = start + size
  const paginatedDevices = filteredDevices.slice(start, end)
  
  return {
    items: paginatedDevices,
    total: filteredDevices.length,
  }
}

/**
 * Mock: 获取设备详情
 */
export async function mockGetDeviceDetail(deviceId: string): Promise<Device> {
  await delay(200)
  
  const device = mockDevicesData.find(d => d.device_id === deviceId)
  if (!device) {
    throw new Error(`Device with id "${deviceId}" not found`)
  }
  
  return { ...device }
}

/**
 * Mock: 更新设备信息
 */
export async function mockUpdateDevice(deviceId: string, params: UpdateDeviceParams): Promise<{ success: boolean }> {
  await delay(300)
  
  const device = mockDevicesData.find(d => d.device_id === deviceId)
  if (!device) {
    throw new Error(`Device with id "${deviceId}" not found`)
  }
  
  // 更新字段
  if (params.device_name !== undefined) {
    device.device_name = params.device_name
  }
  if (params.business_access !== undefined) {
    device.business_access = params.business_access
  }
  
  return { success: true }
}

/**
 * Mock: 删除设备
 * 注意：由 server 判断是物理删除还是软删除（设置 status = 'disabled'）
 * 这里模拟：如果设备有使用过（可以通过检查某些条件），则软删除，否则物理删除
 */
export async function mockDeleteDevice(deviceId: string): Promise<{ success: boolean }> {
  await delay(300)
  
  const deviceIndex = mockDevicesData.findIndex(d => d.device_id === deviceId)
  if (deviceIndex === -1) {
    throw new Error(`Device with id "${deviceId}" not found`)
  }
  
  const device = mockDevicesData[deviceIndex]
  
  // 模拟判断：如果设备状态是 online 或 error，说明可能使用过，则软删除
  // 否则物理删除
  if (device.status === 'online' || device.status === 'error') {
    // 软删除：设置 status = 'disabled'
    device.status = 'disabled'
  } else {
    // 物理删除：从数组中移除
    mockDevicesData.splice(deviceIndex, 1)
  }
  
  return { success: true }
}

