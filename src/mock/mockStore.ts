/**
 * Mock数据存储 - 用于在会话期间保持数据修改
 * 这是一个内存存储，重新加载页面会重置
 */

import { mockCards } from './mockData'
import type { VitalFocusCard } from '@/api/monitors/model/monitorModel'

// 数据存储接口
interface MockDataStore {
  residents: any[]
  devices: any[]
  users: any[]
  buildings: any[]
  units: any[]
  tags: any[]
  roles: any[]
  cards: VitalFocusCard[]
  alarmEvents: any[]
  alarmCloudConfig: any[]
}

// 初始化数据存储
let dataStore: MockDataStore | null = null

/**
 * 获取数据存储实例（单例模式）
 */
export function getDataStore(): MockDataStore {
  if (!dataStore) {
    console.log('🔄 初始化Mock数据存储')
    dataStore = initializeStore()
  }
  return dataStore
}

/**
 * 重置数据存储（用于测试）
 */
export function resetDataStore() {
  console.log('🔄 重置Mock数据存储')
  dataStore = initializeStore()
  return dataStore
}

/**
 * 初始化存储数据
 */
function initializeStore(): MockDataStore {
  const cards = mockCards
  
  // 从卡片数据提取居民列表（简化版）
  const residents = cards
    .filter((card: VitalFocusCard) => card.card_type === 'ActiveBed' && card.residents && card.residents.length > 0)
    .map((card: VitalFocusCard, index: number) => {
      const resident = card.residents?.[0]
      if (!resident) return null
      
      return {
        id: resident.resident_id,
        name: `${resident.first_name} ${resident.last_name}`,
        firstName: resident.first_name,
        lastName: resident.last_name,
        gender: index % 2 === 0 ? 'Male' : 'Female',
        birthday: new Date(1940 + index % 30, index % 12, (index % 28) + 1).toISOString().split('T')[0],
        room: card.card_address.match(/Room (\d+)/)?.[1] || `${index + 101}`,
        building: card.card_address.split(' / ')[0] || 'Building A',
        floor: 1 + Math.floor((index % 25) / 5),
        status: 'active',
        deviceId: card.devices?.[0]?.device_id || null,
        createdAt: new Date(Date.now() - index * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
  
  // 从卡片数据提取设备列表（简化版）
  const devices = cards.flatMap((card: VitalFocusCard, cardIndex: number) => {
    if (!card.devices || card.devices.length === 0) return []
    
    return card.devices.map(device => ({
      id: device.device_id,
      name: `Device-${device.device_id}`,
      internalCode: device.device_id,
      type: device.device_type,
      status: 'online',
      building: card.card_address.split(' / ')[0] || 'Building A',
      floor: 1 + Math.floor((cardIndex % 25) / 5),
      room: card.card_address.match(/Room (\d+)/)?.[1] || `${cardIndex + 101}`,
      residentId: card.card_type === 'ActiveBed' && card.residents && card.residents[0] 
        ? card.residents[0].resident_id 
        : null,
      residentName: card.card_type === 'ActiveBed' && card.residents && card.residents[0]
        ? `${card.residents[0].first_name} ${card.residents[0].last_name}`
        : null,
      createdAt: new Date(Date.now() - cardIndex * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }))
  })
  
  // 用户列表（10个管理员用户）
  const users = Array.from({ length: 10 }, (_, i) => ({
    id: `user-${i + 1}`,
    username: `admin${i + 1}`,
    email: `admin${i + 1}@example.com`,
    firstName: `Admin`,
    lastName: `User${i + 1}`,
    roleId: i < 3 ? 'super-admin' : i < 7 ? 'admin' : 'viewer',
    roleName: i < 3 ? 'Super Administrator' : i < 7 ? 'Administrator' : 'Viewer',
    status: 'active',
    createdAt: new Date(Date.now() - i * 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString()
  }))
  
  // 建筑列表（8栋建筑）
  const buildings = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter, i) => ({
    id: `building-${letter}`,
    name: `Building ${letter}`,
    code: letter,
    address: `${letter} Street, City`,
    floors: 5,
    rooms: 25, // 5层 x 5房间
    status: 'active',
    createdAt: new Date(Date.now() - i * 86400000 * 365).toISOString(),
    updatedAt: new Date().toISOString()
  }))
  
  // 单元列表
  const units = buildings.flatMap(building =>
    Array.from({ length: building.floors }, (_, floor) => ({
      id: `unit-${building.code}-${floor + 1}`,
      name: `${building.name} - Floor ${floor + 1}`,
      buildingId: building.id,
      buildingName: building.name,
      floor: floor + 1,
      rooms: 5,
      status: 'active',
      createdAt: building.createdAt,
      updatedAt: building.updatedAt
    }))
  )
  
  // 标签列表
  const tags = [
    { tag_id: 'tag-1', tag_name: 'High Risk', tag_type: 'risk', color: '#f5222d', count: 15, tenant_id: 'demo_tenant_001' },
    { tag_id: 'tag-2', tag_name: 'Fall Prevention', tag_type: 'care', color: '#fa8c16', count: 32, tenant_id: 'demo_tenant_001' },
    { tag_id: 'tag-3', tag_name: 'Night Care', tag_type: 'care', color: '#1890ff', count: 28, tenant_id: 'demo_tenant_001' },
    { tag_id: 'tag-4', tag_name: 'Dementia', tag_type: 'condition', color: '#722ed1', count: 18, tenant_id: 'demo_tenant_001' },
    { tag_id: 'tag-5', tag_name: 'Diabetes', tag_type: 'condition', color: '#52c41a', count: 24, tenant_id: 'demo_tenant_001' },
    { tag_id: 'tag-6', tag_name: 'VIP', tag_type: 'level', color: '#faad14', count: 8, tenant_id: 'demo_tenant_001' }
  ].map(tag => ({
    ...tag,
    status: 'active',
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 365).toISOString(),
    updatedAt: new Date().toISOString()
  }))
  
  // 角色列表
  const roles = [
    { id: 'super-admin', name: 'Super Administrator', description: 'Full system access', permissions: ['*'] },
    { id: 'admin', name: 'Administrator', description: 'Admin access', permissions: ['read', 'create', 'update', 'delete'] },
    { id: 'manager', name: 'Manager', description: 'Manager access', permissions: ['read', 'create', 'update'] },
    { id: 'staff', name: 'Staff', description: 'Staff access', permissions: ['read', 'update'] },
    { id: 'viewer', name: 'Viewer', description: 'View only access', permissions: ['read'] }
  ].map(role => ({
    ...role,
    status: 'active',
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 365).toISOString(),
    updatedAt: new Date().toISOString()
  }))
  
  // 报警事件（从卡片数据生成）
  const alarmEvents = cards
    .filter((card: VitalFocusCard) => card.alarms && card.alarms.length > 0)
    .flatMap((card: VitalFocusCard, cardIndex: number) => {
      const resident = card.residents && card.residents[0]
      return card.alarms!.map((alarm, alarmIndex) => ({
        id: alarm.event_id || `alarm-${Date.now()}-${cardIndex}-${alarmIndex}`,
        residentId: resident ? resident.resident_id : `unknown-${cardIndex}`,
        residentName: resident ? `${resident.first_name} ${resident.last_name}` : 'Unknown',
        deviceId: card.devices && card.devices[0] ? card.devices[0].device_id : `device-${cardIndex}`,
        building: card.card_address.split(' / ')[0] || 'Building A',
        floor: 1 + Math.floor((cardIndex % 25) / 5),
        room: card.card_address.match(/Room (\d+)/)?.[1] || `${cardIndex + 101}`,
        type: alarm.event_type || 'general',
        severity: typeof alarm.alarm_level === 'string' ? alarm.alarm_level : alarm.alarm_level <= 2 ? 'high' : 'medium',
        message: `${alarm.event_type} detected`,
        status: alarm.alarm_status === 'acknowledged' ? 'acknowledged' : 'pending',
        createdAt: alarm.triggered_at ? new Date(alarm.triggered_at).toISOString() : new Date(Date.now() - Math.floor(Math.random() * 7200000)).toISOString(),
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 1800000)).toISOString(),
        acknowledgedBy: null,
        acknowledgedAt: null,
        resolvedBy: null,
        resolvedAt: null
      }))
    })
  
  // 报警云配置
  const alarmCloudConfig = [
    {
      id: 'alarm-config-1',
      type: 'heart_rate',
      enabled: true,
      thresholdLow: 50,
      thresholdHigh: 120,
      priority: 'high',
      notifyEmail: true,
      notifySMS: false,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'alarm-config-2',
      type: 'fall_detection',
      enabled: true,
      sensitivity: 'high',
      priority: 'critical',
      notifyEmail: true,
      notifySMS: true,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'alarm-config-3',
      type: 'bed_exit',
      enabled: true,
      duration: 30, // 秒
      priority: 'medium',
      notifyEmail: true,
      notifySMS: false,
      updatedAt: new Date().toISOString()
    }
  ]
  
  return {
    residents,
    devices,
    users,
    buildings,
    units,
    tags,
    roles,
    cards,
    alarmEvents,
    alarmCloudConfig
  }
}

/**
 * 生成唯一ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
