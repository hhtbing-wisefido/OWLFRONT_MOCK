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
  rooms: any[]
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
      const firstName = resident.first_name || `Resident${index + 1}`
      const lastName = resident.last_name || 'Demo'
      const unitId = card.card_id || `unit-${index + 1}`
      
      return {
        resident_id: resident.resident_id,
        tenant_id: 'demo_tenant_001',
        resident_account: `R${String(index + 1).padStart(4, '0')}`,
        nickname: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@demo.com`,
        phone: `+1-555-${String(1000 + index).slice(-4)}`,
        status: 'active' as const,
        service_level: ['Standard', 'Enhanced', 'Premium', 'VIP'][index % 4],
        admission_date: admissionDate.toISOString().split('T')[0],
        discharge_date: null,
        note: index % 5 === 0 ? `Special care instructions for ${firstName}` : undefined,
        unit_id: unitId,
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
      const deviceType = device.device_type === 1 ? 'SleepPad' : device.device_type === 2 ? 'Radar' : 'Unknown'
      const serialNumber = `SN${String(cardIndex * 10 + deviceIndex).padStart(6, '0')}`
      const imei = device.device_type === 1 ? `86${String(Math.floor(Math.random() * 10000000000000)).padStart(13, '0')}` : null
      const roomNumber = card.card_address.match(/Room (\d+)/)?.[1] || String(cardIndex + 101)
      
      // 计算unit_id以匹配rooms数据
      const parts = card.card_address.split(' / ')
      const buildingPart = parts[0] || 'Building A'
      const buildingLetter = buildingPart.replace('Building ', '')
      const unitId = `unit-${buildingLetter}-${roomNumber}`
      
      // 绑定到unit_room（主房间）和第一个床位
      const boundRoomId = `room-${unitId}-main`
      const boundBedId = `bed-${unitId}-${deviceIndex + 1}`
      
      return {
        // 使用snake_case以匹配前端期望
        id: device.device_id,
        device_id: device.device_id,
        device_name: `${deviceType}-Room${roomNumber}`,
        device_type: deviceType,
        device_model: deviceModels[cardIndex % deviceModels.length],
        serial_number: serialNumber,
        uid: device.device_id,
        imei: imei,
        comm_mode: commModes[cardIndex % commModes.length],
        firmware_version: firmwareVersions[cardIndex % firmwareVersions.length],
        mcu_model: mcuModels[cardIndex % mcuModels.length],
        internal_code: device.device_id,
        type: device.device_type,
        status: card.s_connection === 1 || card.r_connection === 1 ? 'online' : 'offline',
        monitoring_enabled: true,
        business_access: 'Mapleview Care',
        building: card.card_address.split(' / ')[0] || 'Building A',
        floor: 1 + Math.floor((cardIndex % 25) / 5),
        room: roomNumber,
        // 添加绑定字段
        bound_room_id: boundRoomId,
        bound_bed_id: boundBedId,
        resident_id: card.card_type === 'ActiveBed' && card.residents && card.residents[0] 
          ? card.residents[0].resident_id 
          : null,
        resident_name: card.card_type === 'ActiveBed' && card.residents && card.residents[0]
          ? `${card.residents[0].first_name} ${card.residents[0].last_name}`
          : null,
        last_online: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
        created_at: new Date(Date.now() - cardIndex * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      }
    })
  })
  
  // 用户列表（20个管理员用户 - 更真实的数据）
  const userFirstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Lisa', 'James', 'Jennifer', 'William', 'Mary', 'Richard', 'Patricia', 'Thomas', 'Linda', 'Charles', 'Barbara', 'Daniel', 'Susan']
  const userLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White']
  const branchTags = ['Main', 'West Wing', 'East Wing', 'North Tower']
  const alarmLevels = [['EMERGENCY', 'WARNING'], ['EMERGENCY'], ['WARNING'], ['EMERGENCY', 'WARNING', 'INFORMATIONAL']]
  const alarmChannels = [['email', 'sms'], ['email'], ['sms', 'push'], ['email', 'sms', 'push']]
  const alarmScopes = ['all', 'assigned_only', 'branch_only', 'all']
  
  const users = Array.from({ length: 20 }, (_, i) => {
    const firstName = userFirstNames[i % userFirstNames.length] || `User${i + 1}`
    const lastName = userLastNames[i % userLastNames.length] || 'Demo'
    const role = i < 2 ? 'Admin' : i < 5 ? 'Manager' : i < 10 ? 'Staff' : i < 15 ? 'Nurse' : 'Caregiver'
    
    return {
      // 使用snake_case以匹配前端期望
      id: `user-${String(i + 1).padStart(3, '0')}`,
      user_id: `user-${String(i + 1).padStart(3, '0')}`,
      user_account: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
      nickname: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mapleview.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      role: role,
      role_id: role.toLowerCase(),
      branch_tag: branchTags[i % branchTags.length],
      status: i === 19 ? 'inactive' : 'active',
      alarm_levels: alarmLevels[i % alarmLevels.length],
      alarm_channels: alarmChannels[i % alarmChannels.length],
      alarm_scope: alarmScopes[i % alarmScopes.length],
      tags: i % 3 === 0 ? ['tag-001', 'tag-002'] : i % 3 === 1 ? ['tag-003'] : [],
      department: role === 'Admin' ? 'Administration' : 
                  role === 'Manager' ? 'Management' : 
                  role === 'Staff' ? 'Operations' : 
                  role === 'Nurse' ? 'Medical' : 'Care Services',
      last_login: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toISOString(),
      created_at: new Date(Date.now() - i * 86400000 * 30).toISOString(),
      updated_at: new Date().toISOString()
    }
  })
  
  // 建筑列表 - 格式：显示为 ${branch_name}-${building_name}
  // 示例：DV-A, DV-B, SP-H 等
  // 从卡片数据中提取唯一的building组合
  const buildingsFromCards = new Map<string, { branch_name: string; building_name: string }>()
  
  // 从200张卡片中提取建筑信息
  cards.forEach((card: VitalFocusCard) => {
    if (card.card_type === 'ActiveBed' && card.card_address) {
      // card_address格式: "Building A / Room 101 / Bed 1"
      const parts = card.card_address.split(' / ')
      const buildingPart = parts[0] || 'Building A' // e.g., "Building A"
      const buildingLetter = buildingPart.replace('Building ', '') // e.g., "A"
      
      // 根据building分配branch (模拟真实场景)
      let branchName: string
      if (['A', 'B', 'C'].includes(buildingLetter)) {
        branchName = 'DV' // DaVita branch
      } else if (['D', 'E'].includes(buildingLetter)) {
        branchName = 'SP' // Special Care branch
      } else if (['F', 'G'].includes(buildingLetter)) {
        branchName = 'MC' // Memory Care branch
      } else {
        branchName = 'AL' // Assisted Living branch
      }
      
      const key = `${branchName}-${buildingLetter}`
      if (!buildingsFromCards.has(key)) {
        buildingsFromCards.set(key, {
          branch_name: branchName,
          building_name: buildingLetter
        })
      }
    }
  })
  
  // 转换为Building数组
  const buildings = Array.from(buildingsFromCards.entries()).map(([key, value]) => ({
    building_id: `building-${key}`,
    building_name: value.building_name,
    tenant_id: 'demo_tenant_001',
    branch_id: `branch-${value.branch_name.toLowerCase()}`,
    branch_name: value.branch_name
  }))
  
  // 单元列表 - 从卡片数据中提取
  // 根据card_address解析出unit信息
  const unitsFromCards = new Map<string, any>()
  
  cards.forEach((card: VitalFocusCard, cardIndex: number) => {
    if (card.card_type === 'ActiveBed' && card.card_address) {
      // card_address格式: "Building A / Room 101 / Bed 1"
      const parts = card.card_address.split(' / ')
      const buildingPart = parts[0] || 'Building A'
      const roomPart = parts[1] || 'Room 101'
      
      const buildingLetter = buildingPart.replace('Building ', '') // e.g., "A"
      const roomNumber = roomPart.replace('Room ', '') // e.g., "101"
      const floor = roomNumber.charAt(0) // e.g., "1"
      
      // 根据building分配branch
      let branchName: string
      if (['A', 'B', 'C'].includes(buildingLetter)) {
        branchName = 'DV'
      } else if (['D', 'E'].includes(buildingLetter)) {
        branchName = 'SP'
      } else if (['F', 'G'].includes(buildingLetter)) {
        branchName = 'MC'
      } else {
        branchName = 'AL'
      }
      
      const unitId = `unit-${buildingLetter}-${roomNumber}`
      
      if (!unitsFromCards.has(unitId)) {
        // 找到该单元的住户
        const resident = card.residents && card.residents[0]
        
        unitsFromCards.set(unitId, {
          unit_id: unitId,
          tenant_id: 'demo_tenant_001',
          branch_name: branchName,
          unit_name: roomNumber,
          building: buildingLetter,
          floor: `${floor}F`,
          unit_number: roomNumber,
          layout_config: {
            beds: cardIndex % 10 === 0 ? 2 : 1,
            bathrooms: 1,
            livingArea: cardIndex % 3 === 0 ? 'Yes' : 'No'
          },
          unit_type: 'Facility' as const,
          primary_resident_id: resident?.resident_id || undefined,
          is_public_space: false,
          is_multi_person_room: cardIndex % 10 === 0,
          timezone: 'America/Los_Angeles',
          alarm_user_ids: cardIndex % 3 === 0 ? ['user-001', 'user-002'] : undefined,
          alarm_tags: cardIndex % 2 === 0 ? ['urgent', 'high-priority'] : undefined,
          status: 'active' as const,
          occupancy: resident ? 'occupied' : 'vacant',
          residentName: resident ? `${resident.first_name} ${resident.last_name}` : undefined,
          createdAt: new Date(Date.now() - cardIndex * 86400000).toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
    }
  })
  
  const units = Array.from(unitsFromCards.values())
  
  // 房间列表 - 每个unit至少有一个unit_room（同名房间），部分有额外房间和床位
  const rooms: any[] = []
  units.forEach((unit: any, index: number) => {
    const unitId = unit.unit_id
    const unitName = unit.unit_name
    
    // 创建unit_room（与unit同名的默认房间）
    const unitRoomId = `room-${unitId}-main`
    const unitRoom = {
      room_id: unitRoomId,
      tenant_id: 'demo_tenant_001',
      unit_id: unitId,
      room_name: unitName, // room_name === unit_name 表示这是unit_room
      is_default: true,
      layout_config: {},
      beds: [] as any[]
    }
    
    // 为unit_room添加床位（每个unit至少一个床位）
    const bedCount = unit.is_multi_person_room ? 2 : 1
    for (let bedIndex = 0; bedIndex < bedCount; bedIndex++) {
      unitRoom.beds.push({
        bed_id: `bed-${unitId}-${bedIndex + 1}`,
        tenant_id: 'demo_tenant_001',
        room_id: unitRoomId,
        bed_name: `Bed ${String.fromCharCode(65 + bedIndex)}`, // Bed A, Bed B
        bed_type: 'ActiveBed',
        resident_id: bedIndex === 0 ? unit.primary_resident_id : undefined
      })
    }
    
    rooms.push(unitRoom)
    
    // 部分unit有额外房间（如bathroom, living room）
    if (index % 3 === 0) {
      rooms.push({
        room_id: `room-${unitId}-bathroom`,
        tenant_id: 'demo_tenant_001',
        unit_id: unitId,
        room_name: 'Bathroom',
        is_default: false,
        layout_config: {},
        beds: []
      })
    }
    
    if (index % 5 === 0) {
      rooms.push({
        room_id: `room-${unitId}-living`,
        tenant_id: 'demo_tenant_001',
        unit_id: unitId,
        room_name: 'Living Room',
        is_default: false,
        layout_config: {},
        beds: []
      })
    }
  })
  
  // 角色列表（更完整的角色定义 - 使用snake_case以匹配前端）
  const roles = [
    { 
      id: 'role-001', 
      role_id: 'role-001',
      role_code: 'SuperAdmin', 
      display_name: 'Super Administrator',
      description: 'Full system access with all permissions', 
      permissions: ['*'],
      user_count: 2,
      level: 1,
      is_active: true,
      is_system: true
    },
    { 
      id: 'role-002', 
      role_id: 'role-002',
      role_code: 'Admin',
      display_name: 'Administrator', 
      description: 'Admin access to manage system', 
      permissions: ['users.read', 'users.create', 'users.update', 'users.delete', 'devices.read', 'devices.update', 'residents.read', 'residents.create', 'residents.update'],
      user_count: 3,
      level: 2,
      is_active: true,
      is_system: true
    },
    { 
      id: 'role-003', 
      role_id: 'role-003',
      role_code: 'Manager',
      display_name: 'Manager', 
      description: 'Manager access to oversee operations', 
      permissions: ['users.read', 'devices.read', 'residents.read', 'residents.update', 'reports.read'],
      user_count: 5,
      level: 3,
      is_active: true,
      is_system: false
    },
    { 
      id: 'role-004', 
      role_id: 'role-004',
      role_code: 'Nurse',
      display_name: 'Nurse', 
      description: 'Medical staff access to patient care', 
      permissions: ['residents.read', 'residents.update', 'vitals.read', 'vitals.update', 'alarms.read', 'alarms.acknowledge'],
      user_count: 8,
      level: 4,
      is_active: true,
      is_system: false
    },
    { 
      id: 'role-005', 
      role_id: 'role-005',
      role_code: 'Caregiver',
      display_name: 'Caregiver', 
      description: 'Care staff access to daily activities', 
      permissions: ['residents.read', 'vitals.read', 'alarms.read'],
      user_count: 12,
      level: 5,
      is_active: true,
      is_system: false
    },
    { 
      id: 'role-006', 
      role_id: 'role-006',
      role_code: 'Staff',
      display_name: 'Staff', 
      description: 'General staff access', 
      permissions: ['residents.read', 'devices.read', 'alarms.read'],
      user_count: 7,
      level: 6,
      is_active: true,
      is_system: false
    },
    { 
      id: 'role-007', 
      role_id: 'role-007',
      role_code: 'Viewer',
      display_name: 'Viewer', 
      description: 'Read-only access to view information', 
      permissions: ['residents.read', 'vitals.read', 'reports.read'],
      user_count: 4,
      level: 7,
      is_active: false,
      is_system: false
    }
  ].map(role => ({
    ...role,
    tenant_id: 'demo_tenant_001',
    created_at: new Date(Date.now() - Math.random() * 86400000 * 365).toISOString(),
    updated_at: new Date().toISOString()
  }))
  
  // 标签列表（使用tag_objects格式以匹配前端TagList.vue期望的数据结构）
  // tag_objects格式: { object_type: { object_id: object_name } }
  const tags = [
    { 
      tag_id: 'tag-001', 
      tag_name: 'High Risk', 
      tag_type: 'user_tag', 
      color: '#f5222d', 
      tag_objects: { 
        resident: { 
          'res-001': 'Resident 001', 
          'res-005': 'Resident 005', 
          'res-012': 'Resident 012' 
        } 
      }, 
      description: 'High risk patients requiring close monitoring' 
    },
    { 
      tag_id: 'tag-002', 
      tag_name: 'Fall Prevention', 
      tag_type: 'user_tag', 
      color: '#fa8c16', 
      tag_objects: { 
        resident: { 
          'res-002': 'Resident 002', 
          'res-008': 'Resident 008', 
          'res-015': 'Resident 015', 
          'res-022': 'Resident 022' 
        } 
      }, 
      description: 'Patients at risk of falling' 
    },
    { 
      tag_id: 'tag-003', 
      tag_name: 'Night Care', 
      tag_type: 'user_tag', 
      color: '#1890ff', 
      tag_objects: { 
        user: { 
          'user-006': 'Night Nurse 1', 
          'user-007': 'Night Nurse 2', 
          'user-008': 'Night Caregiver' 
        } 
      }, 
      description: 'Night shift staff' 
    },
    { 
      tag_id: 'tag-004', 
      tag_name: 'Group.A', 
      tag_type: 'family_tag', 
      color: '#722ed1', 
      tag_objects: { 
        resident: { 
          'res-004': 'Resident A1', 
          'res-013': 'Resident A2' 
        } 
      }, 
      description: 'Family group A' 
    },
    { 
      tag_id: 'tag-005', 
      tag_name: 'Management', 
      tag_type: 'user_tag', 
      color: '#52c41a', 
      tag_objects: { 
        user: { 
          'user-001': 'Admin User', 
          'user-002': 'Manager User' 
        } 
      }, 
      description: 'Management staff' 
    },
    { 
      tag_id: 'tag-006', 
      tag_name: 'VIP', 
      tag_type: 'user_tag', 
      color: '#faad14', 
      tag_objects: { 
        resident: { 
          'res-007': 'VIP Resident 1', 
          'res-018': 'VIP Resident 2' 
        } 
      }, 
      description: 'VIP residents' 
    },
    { 
      tag_id: 'tag-007', 
      tag_name: 'Main', 
      tag_type: 'branch_tag', 
      color: '#eb2f96', 
      tag_objects: { 
        location: { 
          'building-A': 'Building A', 
          'building-B': 'Building B' 
        } 
      }, 
      description: 'Main building branch' 
    },
    { 
      tag_id: 'tag-008', 
      tag_name: 'West Wing', 
      tag_type: 'branch_tag', 
      color: '#13c2c2', 
      tag_objects: { 
        location: { 
          'building-C': 'Building C' 
        } 
      }, 
      description: 'West Wing branch' 
    },
    { 
      tag_id: 'tag-009', 
      tag_name: 'Floor 1', 
      tag_type: 'area_tag', 
      color: '#2f54eb', 
      tag_objects: { 
        location: { 
          'unit-101': 'Room 101', 
          'unit-102': 'Room 102', 
          'unit-103': 'Room 103', 
          'unit-104': 'Room 104', 
          'unit-105': 'Room 105' 
        } 
      }, 
      description: 'First floor area' 
    },
    { 
      tag_id: 'tag-010', 
      tag_name: 'Floor 2', 
      tag_type: 'area_tag', 
      color: '#a0d911', 
      tag_objects: { 
        location: { 
          'unit-201': 'Room 201', 
          'unit-202': 'Room 202', 
          'unit-203': 'Room 203', 
          'unit-204': 'Room 204', 
          'unit-205': 'Room 205' 
        } 
      }, 
      description: 'Second floor area' 
    },
    { 
      tag_id: 'tag-011', 
      tag_name: 'Technical', 
      tag_type: 'user_tag', 
      color: '#ff4d4f', 
      tag_objects: { 
        user: { 
          'user-004': 'Tech User 1', 
          'user-005': 'Tech User 2' 
        },
        location: {
          'loc-001': 'Tech Lab'
        }
      }, 
      description: 'Technical staff' 
    },
    { 
      tag_id: 'tag-012', 
      tag_name: 'System', 
      tag_type: 'user_tag', 
      color: '#9254de', 
      tag_objects: { 
        user: { 
          'user-003': 'IT User' 
        } 
      }, 
      description: 'System administrators' 
    }
  ].map(tag => ({
    ...tag,
    tenant_id: 'demo_tenant_001',
    status: 'active',
    created_by: 'admin',
    created_at: new Date(Date.now() - Math.random() * 86400000 * 365).toISOString(),
    updated_at: new Date().toISOString()
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
    rooms,
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
