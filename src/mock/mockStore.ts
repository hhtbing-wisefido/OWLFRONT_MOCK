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
  
  // 从卡片数据提取居民列表（完整版）
  const residents = cards
    .filter((card: VitalFocusCard) => card.card_type === 'ActiveBed' && card.residents && card.residents.length > 0)
    .map((card: VitalFocusCard, index: number) => {
      const resident = card.residents?.[0]
      if (!resident) return null
      
      const admissionDaysAgo = Math.floor(Math.random() * 730) + 30 // 30-760 days ago
      const admissionDate = new Date(Date.now() - admissionDaysAgo * 86400000)
      const birthYear = 1940 + (index % 30)
      const birthMonth = index % 12
      const birthDay = (index % 28) + 1
      
      return {
        resident_id: resident.resident_id,
        tenant_id: 'demo_tenant_001',
        resident_account: `R${String(index + 1).padStart(4, '0')}`,
        nickname: `${resident.first_name} ${resident.last_name}`,
        email: `${resident.first_name.toLowerCase()}.${resident.last_name.toLowerCase()}@demo.com`,
        phone: `+1-555-${String(1000 + index).slice(-4)}`,
        status: 'active' as const,
        service_level: ['Standard', 'Enhanced', 'Premium', 'VIP'][index % 4],
        admission_date: admissionDate.toISOString().split('T')[0],
        discharge_date: null,
        note: index % 5 === 0 ? `Special care instructions for ${resident.first_name}` : undefined,
        unit_id: card.unit_id || `unit-${index + 1}`,
        unit_name: card.card_address.match(/Room \d+/)?.[0] || `Room ${index + 101}`,
        branch_tag: ['Main', 'West Wing', 'East Wing', 'North Tower'][Math.floor(index / 50) % 4],
        building: card.card_address.split(' / ')[0] || 'Building A',
        area_tag: card.card_address.split(' / ')[1]?.split(' ')[0] || `Floor ${1 + Math.floor((index % 25) / 5)}`,
        unit_number: card.card_address.match(/Room (\d+)/)?.[1] || String(index + 101),
        is_multi_person_room: index % 10 === 0,
        room_id: `room-${Math.floor(index / 2) + 1}`,
        room_name: `Room ${index + 101}`,
        bed_id: card.devices?.[0]?.device_id || `bed-${index + 1}`,
        bed_name: ['Bed A', 'Bed B'][index % 2],
        is_access_enabled: index % 3 !== 0,
        family_tag: index % 5 === 0 ? `F${String(Math.floor(index / 5) + 1).padStart(4, '0')}` : undefined,
        phi: {
          phi_id: `phi-${index + 1}`,
          resident_id: resident.resident_id,
          first_name: resident.first_name,
          middle_name: index % 3 === 0 ? ['M', 'J', 'L', 'R'][index % 4] : undefined,
          last_name: resident.last_name,
          gender: index % 2 === 0 ? 'Male' : 'Female',
          date_of_birth: `${birthYear}-${String(birthMonth + 1).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
          ssn_last_four: String(1000 + (index * 17) % 9000),
          medical_record_number: `MRN${String(10000 + index).slice(-5)}`,
          emergency_contact_name: `Emergency Contact ${index + 1}`,
          emergency_contact_phone: `+1-555-${String(2000 + index).slice(-4)}`,
          emergency_contact_relationship: ['Spouse', 'Child', 'Sibling', 'Friend'][index % 4],
          primary_diagnosis: ['Dementia', 'Diabetes', 'Heart Disease', 'Hypertension', 'Arthritis'][index % 5],
          allergies: index % 3 === 0 ? 'Penicillin, Sulfa drugs' : undefined,
          medications: ['Medication A', 'Medication B', 'Medication C'].slice(0, (index % 3) + 1).join(', '),
          special_dietary_needs: index % 4 === 0 ? ['Low sodium', 'Diabetic', 'Soft food', 'Pureed'][index % 4] : undefined,
          mobility_status: ['Independent', 'Walker', 'Wheelchair', 'Bedridden'][index % 4],
          cognitive_status: ['Alert', 'Mild impairment', 'Moderate impairment', 'Severe impairment'][index % 4],
          do_not_resuscitate: index % 7 === 0,
          advanced_directives: index % 5 === 0,
          insurance_provider: ['Medicare', 'Medicaid', 'Private Insurance', 'Self-Pay'][index % 4],
          insurance_policy_number: `POL${String(100000 + index).slice(-6)}`,
          physician_name: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][index % 5]}`,
          physician_phone: `+1-555-${String(3000 + index).slice(-4)}`
        },
        contacts: [
          {
            contact_id: `contact-${index * 2 + 1}`,
            resident_id: resident.resident_id,
            contact_type: 'family',
            first_name: `Family${index + 1}`,
            last_name: resident.last_name,
            relationship: ['Child', 'Spouse', 'Sibling', 'Parent'][index % 4],
            phone: `+1-555-${String(4000 + index).slice(-4)}`,
            email: `family${index + 1}@demo.com`,
            is_emergency_contact: true,
            is_authorized_visitor: true,
            contact_family_tag: index % 5 === 0 ? `F${String(Math.floor(index / 5) + 1).padStart(4, '0')}` : undefined,
            notes: index % 3 === 0 ? 'Primary contact person' : undefined
          },
          {
            contact_id: `contact-${index * 2 + 2}`,
            resident_id: resident.resident_id,
            contact_type: 'friend',
            first_name: `Friend${index + 1}`,
            last_name: `Visitor${index + 1}`,
            relationship: 'Friend',
            phone: `+1-555-${String(5000 + index).slice(-4)}`,
            email: `friend${index + 1}@demo.com`,
            is_emergency_contact: false,
            is_authorized_visitor: true,
            contact_family_tag: undefined,
            notes: undefined
          }
        ],
        createdAt: new Date(Date.now() - index * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
  
  // 从卡片数据提取设备列表（完整版）
  const deviceModels = ['S100', 'S200', 'R100', 'R200', 'R300']
  const firmwareVersions = ['v1.2.3', 'v1.2.4', 'v1.3.0', 'v1.3.1']
  const mcuModels = ['STM32F407', 'STM32F103', 'ESP32', 'Nordic nRF52']
  const commModes = ['WiFi', '4G', 'Ethernet', 'LoRa']
  
  const devices = cards.flatMap((card: VitalFocusCard, cardIndex: number) => {
    if (!card.devices || card.devices.length === 0) return []
    
    return card.devices.map((device, deviceIndex) => {
      const deviceType = device.device_type === 1 ? 'Sleepace' : device.device_type === 2 ? 'Radar' : 'Unknown'
      const serialNumber = `SN${String(cardIndex * 10 + deviceIndex).padStart(6, '0')}`
      const imei = device.device_type === 1 ? `86${String(Math.floor(Math.random() * 10000000000000)).padStart(13, '0')}` : null
      
      return {
        id: device.device_id,
        name: `${deviceType}-${card.card_address.match(/Room (\d+)/)?.[1] || cardIndex + 101}`,
        deviceType: deviceType,
        deviceModel: deviceModels[cardIndex % deviceModels.length],
        serialNumber: serialNumber,
        uid: device.device_id,
        imei: imei,
        commMode: commModes[cardIndex % commModes.length],
        firmwareVersion: firmwareVersions[cardIndex % firmwareVersions.length],
        mcuModel: mcuModels[cardIndex % mcuModels.length],
        internalCode: device.device_id,
        type: device.device_type,
        status: card.s_connection === 1 || card.r_connection === 1 ? 'online' : 'offline',
        building: card.card_address.split(' / ')[0] || 'Building A',
        floor: 1 + Math.floor((cardIndex % 25) / 5),
        room: card.card_address.match(/Room (\d+)/)?.[1] || `${cardIndex + 101}`,
        monitor: card.residents && card.residents[0] ? `${card.residents[0].first_name} ${card.residents[0].last_name}` : 'Unassigned',
        businessAccess: 'Mapleview Care',
        residentId: card.card_type === 'ActiveBed' && card.residents && card.residents[0] 
          ? card.residents[0].resident_id 
          : null,
        residentName: card.card_type === 'ActiveBed' && card.residents && card.residents[0]
          ? `${card.residents[0].first_name} ${card.residents[0].last_name}`
          : null,
        lastOnline: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
        createdAt: new Date(Date.now() - cardIndex * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    })
  })
  
  // 用户列表（20个管理员用户 - 更真实的数据）
  const userFirstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Lisa', 'James', 'Jennifer', 'William', 'Mary', 'Richard', 'Patricia', 'Thomas', 'Linda', 'Charles', 'Barbara', 'Daniel', 'Susan']
  const userLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White']
  const userRoles = ['Admin', 'Manager', 'Staff', 'Nurse', 'Caregiver']
  
  const users = Array.from({ length: 20 }, (_, i) => {
    const firstName = userFirstNames[i % userFirstNames.length]
    const lastName = userLastNames[i % userLastNames.length]
    const role = i < 2 ? 'Admin' : i < 5 ? 'Manager' : i < 10 ? 'Staff' : i < 15 ? 'Nurse' : 'Caregiver'
    
    return {
      id: `user-${String(i + 1).padStart(3, '0')}`,
      userId: `user-${String(i + 1).padStart(3, '0')}`,
      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mapleview.com`,
      firstName: firstName,
      lastName: lastName,
      fullName: `${firstName} ${lastName}`,
      phone: `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      role: role,
      roleId: role.toLowerCase(),
      roleName: role,
      department: role === 'Admin' ? 'Administration' : 
                  role === 'Manager' ? 'Management' : 
                  role === 'Staff' ? 'Operations' : 
                  role === 'Nurse' ? 'Medical' : 'Care Services',
      status: i === 19 ? 'inactive' : 'active',
      lastLogin: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toISOString(),
      createdAt: new Date(Date.now() - i * 86400000 * 30).toISOString(),
      updatedAt: new Date().toISOString()
    }
  })
  
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
  
  // 单元列表（完整版 - 符合Unit接口）
  const units = buildings.flatMap(building => {
    const unitCount = building.floors * 5 // 每层5个单元
    return Array.from({ length: unitCount }, (_, index) => {
      const floor = Math.floor(index / 5) + 1
      const unitNumberOnFloor = (index % 5) + 1
      const unitNumber = `${floor}${String(unitNumberOnFloor).padStart(2, '0')}` // 例如: 101, 102, 201, 202
      const unitId = `unit-${building.code}-${unitNumber}`
      
      // 找到该单元的住户
      const resident = residents.find(r => 
        r.building === building.name && 
        r.unit_number === unitNumber
      )
      
      return {
        unit_id: unitId,
        tenant_id: 'demo_tenant_001',
        branch_name: building.address,
        unit_name: `${building.name} - ${unitNumber}`,
        building: building.name,
        floor: `${floor}F`,
        unit_number: unitNumber,
        layout_config: {
          beds: index % 10 === 0 ? 2 : 1,
          bathrooms: 1,
          livingArea: index % 3 === 0 ? 'Yes' : 'No'
        },
        unit_type: 'Facility' as const,
        primary_resident_id: resident?.resident_id || undefined,
        is_public_space: index % 20 === 0,
        is_multi_person_room: index % 10 === 0,
        timezone: 'America/Los_Angeles',
        alarm_user_ids: index % 3 === 0 ? ['user-001', 'user-002'] : undefined,
        alarm_tags: index % 2 === 0 ? ['urgent', 'high-priority'] : undefined,
        status: 'active' as const,
        occupancy: resident ? 'occupied' : 'vacant',
        residentName: resident ? resident.nickname : undefined,
        createdAt: building.createdAt,
        updatedAt: building.updatedAt
      }
    })
  })
  
  // 角色列表（更完整的角色定义）
  const roles = [
    { 
      id: 'role-001', 
      roleId: 'role-001',
      name: 'Super Administrator', 
      code: 'super_admin',
      description: 'Full system access with all permissions', 
      permissions: ['*'],
      userCount: 2,
      level: 1
    },
    { 
      id: 'role-002', 
      roleId: 'role-002',
      name: 'Administrator', 
      code: 'admin',
      description: 'Admin access to manage system', 
      permissions: ['users.read', 'users.create', 'users.update', 'users.delete', 'devices.read', 'devices.update', 'residents.read', 'residents.create', 'residents.update'],
      userCount: 3,
      level: 2
    },
    { 
      id: 'role-003', 
      roleId: 'role-003',
      name: 'Manager', 
      code: 'manager',
      description: 'Manager access to oversee operations', 
      permissions: ['users.read', 'devices.read', 'residents.read', 'residents.update', 'reports.read'],
      userCount: 5,
      level: 3
    },
    { 
      id: 'role-004', 
      roleId: 'role-004',
      name: 'Nurse', 
      code: 'nurse',
      description: 'Medical staff access to patient care', 
      permissions: ['residents.read', 'residents.update', 'vitals.read', 'vitals.update', 'alarms.read', 'alarms.acknowledge'],
      userCount: 8,
      level: 4
    },
    { 
      id: 'role-005', 
      roleId: 'role-005',
      name: 'Caregiver', 
      code: 'caregiver',
      description: 'Care staff access to daily activities', 
      permissions: ['residents.read', 'vitals.read', 'alarms.read'],
      userCount: 12,
      level: 5
    },
    { 
      id: 'role-006', 
      roleId: 'role-006',
      name: 'Staff', 
      code: 'staff',
      description: 'General staff access', 
      permissions: ['residents.read', 'devices.read', 'alarms.read'],
      userCount: 7,
      level: 6
    },
    { 
      id: 'role-007', 
      roleId: 'role-007',
      name: 'Viewer', 
      code: 'viewer',
      description: 'Read-only access to view information', 
      permissions: ['residents.read', 'vitals.read', 'reports.read'],
      userCount: 4,
      level: 7
    }
  ].map(role => ({
    ...role,
    status: 'active',
    isSystem: role.level <= 2,
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 365).toISOString(),
    updatedAt: new Date().toISOString()
  }))
  
  // 标签列表（扩展更多标签）
  const tags = [
    { tag_id: 'tag-001', tag_name: 'High Risk', tag_type: 'risk', color: '#f5222d', count: 15, description: 'High risk patients requiring close monitoring' },
    { tag_id: 'tag-002', tag_name: 'Fall Prevention', tag_type: 'care', color: '#fa8c16', count: 32, description: 'Patients at risk of falling' },
    { tag_id: 'tag-003', tag_name: 'Night Care', tag_type: 'care', color: '#1890ff', count: 28, description: 'Patients requiring special night care' },
    { tag_id: 'tag-004', tag_name: 'Dementia', tag_type: 'condition', color: '#722ed1', count: 18, description: 'Patients with dementia diagnosis' },
    { tag_id: 'tag-005', tag_name: 'Diabetes', tag_type: 'condition', color: '#52c41a', count: 24, description: 'Diabetic patients' },
    { tag_id: 'tag-006', tag_name: 'VIP', tag_type: 'level', color: '#faad14', count: 8, description: 'VIP residents' },
    { tag_id: 'tag-007', tag_name: 'Cardiac', tag_type: 'condition', color: '#eb2f96', count: 14, description: 'Patients with heart conditions' },
    { tag_id: 'tag-008', tag_name: 'Mobility Issues', tag_type: 'care', color: '#13c2c2', count: 22, description: 'Patients with mobility limitations' },
    { tag_id: 'tag-009', tag_name: 'Respiratory', tag_type: 'condition', color: '#2f54eb', count: 11, description: 'Patients with respiratory issues' },
    { tag_id: 'tag-010', tag_name: 'New Admission', tag_type: 'status', color: '#a0d911', count: 5, description: 'Recently admitted residents' }
  ].map(tag => ({
    ...tag,
    tenant_id: 'demo_tenant_001',
    status: 'active',
    createdBy: 'admin',
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
