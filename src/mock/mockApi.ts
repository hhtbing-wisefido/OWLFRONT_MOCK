import { mockCards, mockAccounts } from './mockData'
import { hashAccount, hashPassword } from '@/utils/crypto'

// Mock API延迟模拟
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Mock登录
export async function mockLogin(body: any) {
  await delay(500)
  
  console.log('🔍 Mock登录请求数据:', body)
  
  // 支持两种格式：
  // 1. 原始格式: { username, password }
  // 2. Hash格式: { accountHash, passwordHash }
  
  let matchedAccount = null
  
  if (body.accountHash && body.passwordHash) {
    // Hash模式：验证所有账号的hash
    for (const acc of mockAccounts) {
      const accHash = await hashAccount(acc.username)
      const pwdHash = await hashPassword(acc.password)
      if (accHash === body.accountHash && pwdHash === body.passwordHash) {
        matchedAccount = acc
        break
      }
    }
  } else {
    // 直接模式
    const { username, password, account } = body
    const loginAccount = username || account
    matchedAccount = mockAccounts.find(
      acc => acc.username === loginAccount && acc.password === password
    )
  }
  
  if (!matchedAccount) {
    throw new Error('Invalid username or password')
  }
  
  return {
    code: 2000, // ResultEnum.SUCCESS
    result: {  // ← 使用result而不是data
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      userId: matchedAccount.userId,
      user_account: matchedAccount.username,
      userType: matchedAccount.user_type,
      role: matchedAccount.role,
      nickName: matchedAccount.fullName,
      tenant_id: 'mapleview-001',
      tenant_name: 'Mapleview Care Community',
      domain: 'mapleview.owlcare.local',
      branchTag: 'MAIN',
      locationName: 'Main Floor',
      homePath: matchedAccount.role === 'SystemOperator' ? '/admin/tenants' 
              : matchedAccount.role === 'SystemAdmin' ? '/admin/permissions'
              : matchedAccount.role === 'Nurse' ? '/residents'
              : matchedAccount.role === 'Caregiver' ? '/residents'
              : matchedAccount.role === 'Resident' ? '/residents'
              : '/monitoring/overview',
      avatar: matchedAccount.avatar
    },
    message: 'Login successful'
  }
}

// Mock机构搜索
export async function mockSearchInstitutions(params?: any) {
  await delay(200)
  
  // 返回Mock机构
  return {
    code: 2000, // ResultEnum.SUCCESS
    result: [  // ← 使用result而不是data
      {
        id: 'mapleview-001',
        name: 'Mapleview Care Community'
      }
    ],
    message: 'Success'
  }
}

// Mock获取居民列表
export async function mockGetResidents(params?: any) {
  await delay()
  
  // 🔴 从数据存储读取居民列表（支持修改后保持）
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  let residents = [...store.residents]
  
  // 应用搜索过滤
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    residents = residents.filter(r => 
      r.name?.toLowerCase().includes(searchLower) ||
      r.room?.includes(searchLower) ||
      r.building?.toLowerCase().includes(searchLower)
    )
  }
  
  // 应用状态过滤
  if (params?.status && params.status !== 'all') {
    residents = residents.filter(r => r.status === params.status)
  }
  
  // 应用分页
  const page = params?.page || 1
  const pageSize = params?.pageSize || params?.size || 20
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedResidents = residents.slice(start, end)
  
  return {
    code: 2000,
    result: {
      items: paginatedResidents,
      total: residents.length,
      page: page,
      pageSize: pageSize,
      size: pageSize
    },
    message: 'Residents retrieved successfully'
  }
}

// Mock获取单个居民
export async function mockGetResident(params?: any, residentId?: string) {
  await delay()
  
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  
  // 查找 resident - 支持多种 ID 格式
  const resident = store.residents.find(r => 
    r.resident_id === residentId || 
    r.id === residentId ||
    r.resident_account === residentId
  )
  
  if (!resident) {
    console.log('❌ 找不到居民:', residentId, '可用ID:', store.residents.slice(0, 3).map(r => r.resident_id))
    throw new Error('Resident not found')
  }
  
  console.log('✅ 获取居民成功:', resident.resident_id)
  
  return {
    code: 2000,
    result: resident,
    message: 'Resident retrieved successfully'
  }
}

// Mock获取服务级别列表
export async function mockGetServiceLevels(params?: any) {
  await delay()
  
  const serviceLevels = [
    { id: 'sl-001', name: 'Standard', description: 'Basic care services', price: 2500, color: '#52c41a' },
    { id: 'sl-002', name: 'Enhanced', description: 'Enhanced care with additional support', price: 3500, color: '#1890ff' },
    { id: 'sl-003', name: 'Premium', description: 'Premium care with 24/7 monitoring', price: 5000, color: '#722ed1' },
    { id: 'sl-004', name: 'VIP', description: 'VIP care with personal attendant', price: 8000, color: '#eb2f96' },
  ]
  
  return {
    code: 2000,
    result: {
      items: serviceLevels,
      total: serviceLevels.length
    },
    message: 'Service levels retrieved successfully'
  }
}

// Mock获取卡片列表 (Overview页面)
export async function mockGetCards() {
  await delay()
  return {
    code: 2000, // ResultEnum.SUCCESS
    result: {  // ← 使用result而不是data
      items: mockCards,
      pagination: {
        total: mockCards.length,
        page: 1,
        page_size: 100,
        total_pages: 1
      }
    },
    message: 'Success'
  }
}

// Mock获取单个卡片详情
export async function mockGetCardDetail(params?: any, cardId?: string) {
  await delay()
  const card = mockCards.find(c => c.card_id === cardId)
  if (!card) {
    throw new Error('Card not found')
  }
  return {
    code: 2000, // ResultEnum.SUCCESS
    result: card,  // ← 使用result而不是data
    message: 'Success'
  }
}

// Mock获取报警列表
export async function mockGetAlarms(params?: any) {
  await delay()
  const alarms = mockCards
    .filter(card => card.alarms && card.alarms.length > 0)
    .flatMap(card => card.alarms!)
  
  return {
    code: 2000, // ResultEnum.SUCCESS
    result: {  // ← 使用result而不是data
      items: alarms,
      pagination: {
        total: alarms.length,
        page: 1,
        page_size: 100,
        total_pages: 1
      }
    },
    message: 'Success'
  }
}

// Mock解决报警
export async function mockResolveAlarm(body: any) {
  await delay()
  const { alarmId, id } = body
  const targetId = alarmId || id
  
  for (const card of mockCards) {
    if (card.alarms) {
      const alarm = card.alarms.find(a => a.event_id === targetId)
      if (alarm) {
        alarm.alarm_status = 'acknowledged'
        return {
          code: 2000, // ResultEnum.SUCCESS
          result: null,  // ← 使用result
          message: 'Alarm resolved'
        }
      }
    }
  }
  throw new Error('Alarm not found')
}

// Mock获取角色权限列表 (Permission Management页面)
export async function mockGetRolePermissions() {
  await delay()
  
  // 生成模拟的角色权限数据
  const roles = ['SystemAdmin', 'Admin', 'Director', 'Manager', 'Nurse', 'Caregiver', 'IT']
  const permissions = [
    'monitoring:overview:view',
    'alarm:records:view',
    'alarm:records:acknowledge',
    'residents:list:view',
    'residents:create',
    'residents:edit',
    'residents:delete',
    'devices:view',
    'devices:manage',
    'users:view',
    'users:manage',
    'roles:view',
    'roles:manage',
    'permissions:view',
    'permissions:manage'
  ]
  
  const rolePermissions = roles.map((role, index) => ({
    id: `role_${index + 1}`,
    role_name: role,
    permissions: permissions.filter(() => Math.random() > 0.3), // 随机分配权限
    description: `${role} role with standard permissions`,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-30T00:00:00Z'
  }))
  
  return {
    code: 2000,
    result: {
      items: rolePermissions,
      total: rolePermissions.length,
      page: 1,
      pageSize: 20
    },
    message: 'Role permissions retrieved successfully'
  }
}

// Mock获取报警事件/记录
export async function mockGetAlarmEvents(params?: any) {
  await delay()
  
  // 解析请求参数
  const statusFilter = params?.status || params?.alarm_status || null  // 'active' | 'resolved' | null
  
  // 处理人员名称列表（用于 resolved 报警）
  const handlerNames = ['Dr. Smith', 'Nurse Johnson', 'Caregiver Williams', 'Admin Chen', 'Supervisor Lee']
  // 处理状态列表
  const handlingStates = ['verified', 'false_alarm', 'test']
  // 处理详情模板
  const handlingDetailsTemplates = [
    'Resident verified safe, vitals normal',
    'False alarm triggered by equipment adjustment',
    'Test event for system verification',
    'Checked and confirmed resident is fine',
    'Nurse responded and provided assistance',
    'Caregiver verified condition stable'
  ]
  
  let events = mockCards
    .filter(card => card.alarms && card.alarms.length > 0)
    .flatMap(card => {
      // 获取居民信息
      const resident = card.residents && card.residents[0]
      const residentName = resident ? `${resident.first_name} ${resident.last_name}` : (card.card_name || '-')
      
      // 获取设备信息
      const device = card.devices && card.devices[0]
      const deviceName = device ? device.device_name : '-'
      
      // 构建地址显示
      const addressDisplay = card.card_address || '-'
      
      return card.alarms!.map((alarm, index) => {
        // 基础报警数据
        const baseAlarm = {
          ...alarm,
          // Alarm Records页面需要的字段
          resident_name: residentName,
          address_display: addressDisplay,
          device_name: deviceName,
          // 其他关联字段
          card_id: card.card_id,
          resident_id: resident?.resident_id,
          device_id: device?.device_id,
          // 位置字段
          branch_tag: card.card_address?.split(' / ')[0] || 'Building A',
          building: card.card_address?.split(' / ')[1] || 'Main',
          floor: card.card_address?.match(/Floor (\d+)/i)?.[1] || '1',
          area_tag: 'Care Zone',
          unit_name: card.card_name || 'Unit',
          room_name: card.card_address?.match(/Room (\d+)/i)?.[1] || '101',
          bed_name: card.card_address?.match(/Bed (\w+)/i)?.[1] || 'A'
        }
        
        // 如果是 resolved 状态，添加处理信息
        if (alarm.alarm_status === 'resolved' || alarm.alarm_status === 'acknowledged') {
          const triggeredAt = alarm.triggered_at || Date.now() - 3600000
          const handledDelay = Math.floor(Math.random() * 600000) + 60000 // 1-11分钟后处理
          
          return {
            ...baseAlarm,
            alarm_status: 'resolved',
            // 处理信息字段
            handling_state: handlingStates[Math.floor(Math.random() * handlingStates.length)],
            handling_details: handlingDetailsTemplates[Math.floor(Math.random() * handlingDetailsTemplates.length)],
            handler_name: handlerNames[Math.floor(Math.random() * handlerNames.length)],
            handled_at: triggeredAt + handledDelay
          }
        }
        
        return baseAlarm
      })
    })
  
  // 按状态过滤
  if (statusFilter) {
    events = events.filter(e => {
      if (statusFilter === 'active') {
        return e.alarm_status === 'active' || !e.alarm_status
      } else if (statusFilter === 'resolved') {
        return e.alarm_status === 'resolved' || e.alarm_status === 'acknowledged'
      }
      return true
    })
  }
  
  // 为了演示，生成一些额外的 resolved 报警记录
  if (statusFilter === 'resolved' && events.length < 10) {
    // 复制一些 active 报警并标记为 resolved
    const additionalResolved = mockCards
      .filter(card => card.alarms && card.alarms.length > 0)
      .slice(0, 15)
      .flatMap((card, cardIndex) => {
        const resident = card.residents && card.residents[0]
        const residentName = resident ? `${resident.first_name} ${resident.last_name}` : (card.card_name || '-')
        const device = card.devices && card.devices[0]
        const deviceName = device ? device.device_name : '-'
        const addressDisplay = card.card_address || '-'
        
        return [{
          event_id: `resolved_event_${cardIndex}_${Date.now()}`,
          event_type: ['Fall', 'Radar_AbnormalHeartRate', 'Radar_AbnormalRespiratoryRate', 'Out_of_Bed', 'Low_Battery'][cardIndex % 5],
          category: ['safety', 'clinical', 'device'][cardIndex % 3],
          alarm_level: [0, 1, 2, 3][cardIndex % 4],
          alarm_status: 'resolved',
          triggered_at: Date.now() - (3600000 * (cardIndex + 1)),  // 过去几小时
          resident_name: residentName,
          address_display: addressDisplay,
          device_name: deviceName,
          card_id: card.card_id,
          resident_id: resident?.resident_id,
          device_id: device?.device_id,
          branch_tag: card.card_address?.split(' / ')[0] || 'Building A',
          building: card.card_address?.split(' / ')[1] || 'Main',
          // 处理信息
          handling_state: handlingStates[cardIndex % handlingStates.length],
          handling_details: handlingDetailsTemplates[cardIndex % handlingDetailsTemplates.length],
          handler_name: handlerNames[cardIndex % handlerNames.length],
          handled_at: Date.now() - (3600000 * cardIndex) + 300000  // 触发后5分钟处理
        }]
      })
    
    events = [...events, ...additionalResolved]
  }
  
  return {
    code: 2000,
    result: {
      items: events,
      total: events.length,
      page: params?.page || 1,
      pageSize: params?.pageSize || 20
    },
    message: 'Alarm events retrieved successfully'
  }
}

// Mock获取报警云配置
export async function mockGetAlarmCloudConfig() {
  await delay()
  
  // 返回符合AlarmCloud.vue期望的数据格式
  return {
    code: 2000,
    result: {
      tenant_id: 'demo_tenant_001',
      // Common alarms - 使用字符串类型的级别
      OfflineAlarm: 'WARNING',
      LowBattery: 'WARNING', 
      DeviceFailure: 'EMERGENCY',
      // Device-specific alarms
      device_alarms: {
        SleepPad: {
          SleepPad_HeartRate: 'WARNING',
          SleepPad_RespiratoryRate: 'WARNING',
          SleepPad_BodyMovement: 'DISABLE',
          SleepPad_OutOfBed: 'WARNING',
          SleepPad_GoToBed: 'DISABLE'
        },
        Radar: {
          Radar_HeartRate: 'WARNING',
          Radar_RespiratoryRate: 'WARNING',
          Radar_Fall: 'EMERGENCY',
          Radar_OutOfBed: 'WARNING',
          Radar_InRoom: 'DISABLE',
          Radar_BodyMovement: 'DISABLE'
        }
      },
      // Threshold conditions
      conditions: {
        heart_rate: {
          EMERGENCY: {
            ranges: [
              { min: 0, max: 44 },
              { min: 116, max: 999 }
            ],
            duration_sec: 60
          },
          WARNING: {
            ranges: [
              { min: 45, max: 54 },
              { min: 96, max: 115 }
            ],
            duration_sec: 300
          },
          Normal: {
            ranges: [
              { min: 55, max: 95 }
            ],
            duration_sec: 0
          }
        },
        respiratory_rate: {
          EMERGENCY: {
            ranges: [
              { min: 0, max: 7 },
              { min: 27, max: 999 }
            ],
            duration_sec: 60
          },
          WARNING: {
            ranges: [
              { min: 8, max: 9 },
              { min: 24, max: 26 }
            ],
            duration_sec: 300
          },
          Normal: {
            ranges: [
              { min: 10, max: 23 }
            ],
            duration_sec: 0
          }
        }
      },
      notification_rules: {
        email: true,
        sms: false,
        push: true
      }
    },
    message: 'Alarm cloud configuration retrieved successfully'
  }
}

// Mock获取卡片概览
export async function mockGetCardOverview(params?: any) {
  await delay()
  
  // 模拟Caregiver Groups和Caregivers数据 (使用对象格式以匹配前端期望)
  const caregiverGroupPool = [
    { group_id: 'grp-001', group_name: 'Day Shift Team' },
    { group_id: 'grp-002', group_name: 'Night Shift Team' },
    { group_id: 'grp-003', group_name: 'Weekend Team' },
    { group_id: 'grp-004', group_name: 'Emergency Response' },
    { group_id: 'grp-005', group_name: 'Medical Team A' },
    { group_id: 'grp-006', group_name: 'Medical Team B' },
    { group_id: 'grp-007', group_name: 'Support Staff' }
  ]
  const caregiverPool = [
    { caregiver_id: 'cg-001', caregiver_name: 'Sarah Johnson' },
    { caregiver_id: 'cg-002', caregiver_name: 'Michael Chen' },
    { caregiver_id: 'cg-003', caregiver_name: 'Emily Davis' },
    { caregiver_id: 'cg-004', caregiver_name: 'Robert Wilson' },
    { caregiver_id: 'cg-005', caregiver_name: 'Lisa Martinez' },
    { caregiver_id: 'cg-006', caregiver_name: 'David Brown' },
    { caregiver_id: 'cg-007', caregiver_name: 'Jennifer Lee' },
    { caregiver_id: 'cg-008', caregiver_name: 'James Taylor' }
  ]
  
  // 🔴 修正：Card Overview页面期望的是卡片列表，不是统计数据
  // 从mockCards转换为CardOverviewItem格式
  const cardOverviewItems = mockCards
    .filter(card => card.card_type === 'ActiveBed') // 只包含ActiveBed卡片
    .map((card, index) => {
      // 为每个卡片分配1-3个caregiver groups
      const groupCount = (index % 3) + 1
      const startGroupIdx = index % caregiverGroupPool.length
      const groups = []
      for (let i = 0; i < groupCount; i++) {
        groups.push(caregiverGroupPool[(startGroupIdx + i) % caregiverGroupPool.length])
      }
      
      // 为每个卡片分配1-4个caregivers
      const cgCount = (index % 4) + 1
      const startCgIdx = index % caregiverPool.length
      const caregivers = []
      for (let i = 0; i < cgCount; i++) {
        caregivers.push(caregiverPool[(startCgIdx + i) % caregiverPool.length])
      }
      
      // 每10个卡片有1个是公共空间
      const isPublicSpace = index % 10 === 5
      // 每5个卡片有1个是多人房间
      const isMultiPersonRoom = index % 5 === 3
      // 每3个卡片有1个是家庭公寓类型
      const unitType = index % 3 === 0 ? 'Family Apartment' : 'Facility'
      
      return {
        card_id: card.card_id,
        card_name: card.card_name,
        card_address: card.card_address,
        unit_type: unitType as 'Facility' | 'Family Apartment',
        is_multi_person_room: isMultiPersonRoom,
        is_public_space: isPublicSpace,
        family_view: !isPublicSpace, // 公共空间不显示家庭视图
        devices: card.devices || [],
        residents: card.residents || [],
        caregiver_groups: groups,
        caregivers: caregivers,
        device_count: card.device_count || 0,
        resident_count: card.resident_count || 1,
        caregiver_group_count: groups.length,
        caregiver_count: caregivers.length,
        tenant_id: card.tenant_id
      }
    })
  
  // 应用搜索过滤
  let filteredItems = cardOverviewItems
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    filteredItems = filteredItems.filter(item => 
      item.card_name.toLowerCase().includes(searchLower) ||
      item.card_address.toLowerCase().includes(searchLower)
    )
  }
  
  // 应用分页
  const page = params?.page || 1
  const size = params?.size || 20
  const start = (page - 1) * size
  const end = start + size
  const paginatedItems = filteredItems.slice(start, end)
  
  return {
    code: 2000,
    result: {
      items: paginatedItems,
      pagination: {
        size: size,
        page: page,
        count: paginatedItems.length,
        total: filteredItems.length,
        sort: params?.sort,
        direction: params?.direction === 'asc' ? 1 : -1
      }
    },
    message: 'Card overview retrieved successfully'
  }
}

// Mock获取分支/单元列表
// Mock获取建筑列表 - 返回格式必须是Building[]数组
export async function mockGetBuildings(params?: any) {
  await delay()
  
  // 从数据存储读取建筑列表
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  let buildings = [...store.buildings]
  
  // 返回Building[]数组（transformResponseHook会从result字段提取）
  return {
    code: 2000,
    result: buildings,
    message: 'Buildings retrieved successfully'
  }
}

export async function mockGetBranches(params?: any) {
  await delay()
  
  // 返回符合GetBranchesResult接口的数据格式 { items: Branch[], total: number }
  const branches = [
    { branch_id: 'branch-001', branch_name: 'DV', tenant_id: 'demo_tenant_001', description: 'DV branch' },
    { branch_id: 'branch-002', branch_name: 'SP', tenant_id: 'demo_tenant_001', description: 'SP branch' },
    { branch_id: 'branch-003', branch_name: 'MC', tenant_id: 'demo_tenant_001', description: 'Memory Care branch' },
    { branch_id: 'branch-004', branch_name: 'AL', tenant_id: 'demo_tenant_001', description: 'Assisted Living branch' }
  ]
  
  return {
    code: 2000,
    result: {
      items: branches,
      total: branches.length
    },
    message: 'Branches retrieved successfully'
  }
}

// Mock获取所有单元 - 支持building和branch_name过滤
export async function mockGetAllUnits(params?: any) {
  await delay()
  
  // 从数据存储读取单元列表
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  let units = [...store.units]
  
  // 按building过滤
  if (params?.building) {
    units = units.filter(u => u.building === params.building)
  }
  
  // 按branch_name过滤
  if (params?.branch_name !== undefined) {
    // 空字符串表示查询branch_name为NULL的情况
    if (params.branch_name === '') {
      units = units.filter(u => !u.branch_name)
    } else {
      units = units.filter(u => u.branch_name === params.branch_name)
    }
  }
  
  // 按floor过滤
  if (params?.floor) {
    units = units.filter(u => u.floor === params.floor)
  }
  
  // 应用搜索过滤
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    units = units.filter(u => 
      u.unit_name?.toLowerCase().includes(searchLower) ||
      u.unit_number?.includes(searchLower) ||
      u.building?.toLowerCase().includes(searchLower)
    )
  }
  
  // 应用分页
  const page = params?.page || 1
  const pageSize = params?.pageSize || params?.size || 100
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedUnits = units.slice(start, end)
  
  return {
    code: 2000,
    result: {
      items: paginatedUnits,
      total: units.length,
      page: page,
      pageSize: pageSize
    },
    message: 'Units retrieved successfully'
  }
}

// Mock获取设备列表
// Mock获取设备列表
export async function mockGetDevices(params?: any) {
  await delay()
  
  // 从数据存储读取设备列表
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  let devices = [...store.devices]
  
  // 应用搜索过滤
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    devices = devices.filter(d => 
      d.name?.toLowerCase().includes(searchLower) ||
      d.internalCode?.toLowerCase().includes(searchLower) ||
      d.room?.includes(searchLower)
    )
  }
  
  // 应用分页
  const page = params?.page || 1
  const pageSize = params?.pageSize || 50
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedDevices = devices.slice(start, end)
  
  return {
    code: 2000,
    result: {
      items: paginatedDevices,
      total: devices.length,
      page: page,
      pageSize: pageSize
    },
    message: 'Devices retrieved successfully'
  }
}

// Mock获取用户列表
export async function mockGetUsers(params?: any) {
  await delay()
  
  // 从数据存储读取用户列表
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  let users = [...store.users]
  
  // 应用搜索过滤
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    users = users.filter(u => 
      u.username?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower) ||
      u.firstName?.toLowerCase().includes(searchLower) ||
      u.lastName?.toLowerCase().includes(searchLower)
    )
  }
  
  // 应用分页
  const page = params?.page || 1
  const pageSize = params?.pageSize || 20
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedUsers = users.slice(start, end)
  
  return {
    code: 2000,
    result: {
      items: paginatedUsers,
      total: users.length,
      page: page,
      pageSize: pageSize
    },
    message: 'Users retrieved successfully'
  }
}

// Mock获取单个用户详情
export async function mockGetUser(userId: string) {
  await delay()
  
  // 从数据存储读取用户
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  const user = store.users.find(u => u.id === userId)
  
  if (!user) {
    return {
      code: 4040,
      result: null,
      message: `User not found: ${userId}`
    }
  }
  
  return {
    code: 2000,
    result: user,
    message: 'User retrieved successfully'
  }
}

// Mock获取标签列表
export async function mockGetTags(params?: any) {
  await delay()
  
  // 从数据存储读取标签列表
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  let tags = [...store.tags]
  
  return {
    code: 2000,
    result: {
      items: tags,
      total: tags.length,
      page: 1,
      pageSize: 20
    },
    message: 'Tags retrieved successfully'
  }
}

// Mock获取分支标签
export async function mockGetBranchTags(params?: any) {
  await delay()
  
  const branchTags = [
    { id: 'btag_001', branchId: 'branch_001', name: 'Floor 1', color: '#3366ff' },
    { id: 'btag_002', branchId: 'branch_002', name: 'Floor 2', color: '#ff6633' },
    { id: 'btag_003', branchId: 'branch_003', name: 'Memory Unit', color: '#9933ff' }
  ]
  
  return {
    code: 2000,
    result: {
      items: branchTags,
      total: branchTags.length,
      page: 1,
      pageSize: 20
    },
    message: 'Branch tags retrieved successfully'
  }
}

// Mock获取角色列表
export async function mockGetRoles(params?: any) {
  await delay()
  
  // 从数据存储读取角色列表
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  let roles = [...store.roles]
  
  return {
    code: 2000,
    result: {
      items: roles,
      total: roles.length,
      page: 1,
      pageSize: 20
    },
    message: 'Roles retrieved successfully'
  }
}

// ==================== CRUD操作 Mock ====================
// 以下函数实现真实的增删改查操作

import { getDataStore, generateId } from './mockStore'

// -------------------- 居民管理 CRUD --------------------

/**
 * 创建居民
 */
export async function mockCreateResident(body: any) {
  await delay(500)
  
  const store = getDataStore()
  const newResident = {
    id: generateId('resident'),
    ...body,
    status: body.status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  store.residents.push(newResident)
  console.log('✅ 创建居民成功:', newResident)
  
  return {
    code: 2000,
    result: newResident,
    message: 'Resident created successfully'
  }
}

/**
 * 更新居民
 */
export async function mockUpdateResident(body: any, residentId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = residentId || body.resident_id || body.id
  
  // 支持多种 ID 格式查找
  const index = store.residents.findIndex(r => 
    r.resident_id === id || 
    r.id === id ||
    r.resident_account === id
  )
  
  if (index === -1) {
    console.log('❌ 更新失败 - 找不到居民:', id)
    console.log('  可用的 resident_id:', store.residents.slice(0, 5).map(r => r.resident_id))
    throw new Error('Resident not found')
  }
  
  store.residents[index] = {
    ...store.residents[index],
    ...body,
    resident_id: store.residents[index].resident_id, // 保持ID不变
    updatedAt: new Date().toISOString()
  }
  
  console.log('✅ 更新居民成功:', store.residents[index].resident_id)
  
  return {
    code: 2000,
    result: store.residents[index],
    message: 'Resident updated successfully'
  }
}

/**
 * 删除居民
 */
export async function mockDeleteResident(params: any, residentId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = residentId || params.resident_id || params.id
  
  // 支持多种 ID 格式查找
  const index = store.residents.findIndex(r => 
    r.resident_id === id || 
    r.id === id ||
    r.resident_account === id
  )
  
  if (index === -1) {
    console.log('❌ 删除失败 - 找不到居民:', id)
    throw new Error('Resident not found')
  }
  
  const deleted = store.residents.splice(index, 1)[0]
  console.log('✅ 删除居民成功:', deleted.resident_id)
  
  return {
    code: 2000,
    result: { id: deleted.resident_id },
    message: 'Resident deleted successfully'
  }
}

// -------------------- 设备管理 CRUD --------------------

/**
 * 更新设备
 */
export async function mockUpdateDevice(body: any, deviceId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = deviceId || body.id
  const index = store.devices.findIndex(d => d.id === id)
  
  if (index === -1) {
    throw new Error('Device not found')
  }
  
  store.devices[index] = {
    ...store.devices[index],
    ...body,
    id,
    updatedAt: new Date().toISOString()
  }
  
  console.log('✅ 更新设备成功:', store.devices[index])
  
  return {
    code: 2000,
    result: store.devices[index],
    message: 'Device updated successfully'
  }
}

/**
 * 删除设备
 */
export async function mockDeleteDevice(params: any, deviceId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = deviceId || params.id
  const index = store.devices.findIndex(d => d.id === id)
  
  if (index === -1) {
    throw new Error('Device not found')
  }
  
  const deleted = store.devices.splice(index, 1)[0]
  console.log('✅ 删除设备成功:', deleted)
  
  return {
    code: 2000,
    result: { id },
    message: 'Device deleted successfully'
  }
}

// -------------------- 用户管理 CRUD --------------------

/**
 * 创建用户
 */
export async function mockCreateUser(body: any) {
  await delay(500)
  
  const store = getDataStore()
  const newUser = {
    id: generateId('user'),
    ...body,
    status: body.status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  store.users.push(newUser)
  console.log('✅ 创建用户成功:', newUser)
  
  return {
    code: 2000,
    result: newUser,
    message: 'User created successfully'
  }
}

/**
 * 更新用户
 */
export async function mockUpdateUser(body: any, userId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = userId || body.id
  const index = store.users.findIndex(u => u.id === id)
  
  if (index === -1) {
    throw new Error('User not found')
  }
  
  store.users[index] = {
    ...store.users[index],
    ...body,
    id,
    updatedAt: new Date().toISOString()
  }
  
  console.log('✅ 更新用户成功:', store.users[index])
  
  return {
    code: 2000,
    result: store.users[index],
    message: 'User updated successfully'
  }
}

/**
 * 删除用户
 */
export async function mockDeleteUser(params: any, userId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = userId || params.id
  const index = store.users.findIndex(u => u.id === id)
  
  if (index === -1) {
    throw new Error('User not found')
  }
  
  const deleted = store.users.splice(index, 1)[0]
  console.log('✅ 删除用户成功:', deleted)
  
  return {
    code: 2000,
    result: { id },
    message: 'User deleted successfully'
  }
}

// -------------------- 报警管理 --------------------

/**
 * 处理报警事件（确认/解决）
 */
export async function mockHandleAlarmEvent(body: any, eventId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = eventId || body.id || body.eventId
  const index = store.alarmEvents.findIndex(e => e.id === id)
  
  if (index === -1) {
    throw new Error('Alarm event not found')
  }
  
  const action = body.action || 'acknowledge' // acknowledge, resolve, ignore
  const userId = body.userId || 'current-user'
  
  if (action === 'acknowledge') {
    store.alarmEvents[index].status = 'acknowledged'
    store.alarmEvents[index].acknowledgedBy = userId
    store.alarmEvents[index].acknowledgedAt = new Date().toISOString()
  } else if (action === 'resolve') {
    store.alarmEvents[index].status = 'resolved'
    store.alarmEvents[index].resolvedBy = userId
    store.alarmEvents[index].resolvedAt = new Date().toISOString()
  }
  
  store.alarmEvents[index].updatedAt = new Date().toISOString()
  
  console.log(`✅ 报警事件${action}成功:`, store.alarmEvents[index])
  
  return {
    code: 2000,
    result: store.alarmEvents[index],
    message: `Alarm event ${action}d successfully`
  }
}

/**
 * 更新报警云配置（如果不存在则创建）
 */
export async function mockUpdateAlarmCloudConfig(body: any, configId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = configId || body.id || `alarm-cloud-${Date.now()}`
  const index = store.alarmCloudConfig.findIndex(c => c.id === id)
  
  if (index === -1) {
    // 配置不存在，创建新配置
    const newConfig = {
      ...body,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    store.alarmCloudConfig.push(newConfig)
    console.log('✅ 创建报警云配置成功:', newConfig)
    
    return {
      code: 2000,
      result: newConfig,
      message: 'Alarm cloud config created successfully'
    }
  }
  
  // 配置存在，更新
  store.alarmCloudConfig[index] = {
    ...store.alarmCloudConfig[index],
    ...body,
    id,
    updatedAt: new Date().toISOString()
  }
  
  console.log('✅ 更新报警云配置成功:', store.alarmCloudConfig[index])
  
  return {
    code: 2000,
    result: store.alarmCloudConfig[index],
    message: 'Alarm cloud config updated successfully'
  }
}

// -------------------- 标签管理 CRUD --------------------

/**
 * 创建标签
 */
export async function mockCreateTag(body: any) {
  await delay(500)
  
  const store = getDataStore()
  const newTag = {
    tag_id: generateId('tag'),
    tenant_id: body.tenant_id || 'demo_tenant_001',
    tag_name: body.tag_name,
    tag_type: body.tag_type || 'custom_tag',
    count: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  store.tags.push(newTag)
  console.log('✅ 创建标签成功:', newTag)
  
  return {
    code: 2000,
    result: { tag_id: newTag.tag_id },
    message: 'Tag created successfully'
  }
}

/**
 * 更新标签
 */
export async function mockUpdateTag(body: any, tagId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = tagId || body.tag_id
  const index = store.tags.findIndex(t => t.tag_id === id)
  
  if (index === -1) {
    throw new Error('Tag not found')
  }
  
  store.tags[index] = {
    ...store.tags[index],
    tag_name: body.tag_name || store.tags[index].tag_name,
    tag_type: body.tag_type || store.tags[index].tag_type,
    updatedAt: new Date().toISOString()
  }
  
  console.log('✅ 更新标签成功:', store.tags[index])
  
  return {
    code: 2000,
    result: store.tags[index],
    message: 'Tag updated successfully'
  }
}

/**
 * 删除标签
 */
export async function mockDeleteTag(params: any, tagId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = tagId || params.tag_id
  const index = store.tags.findIndex(t => t.tag_id === id)
  
  if (index === -1) {
    throw new Error('Tag not found')
  }
  
  const deleted = store.tags.splice(index, 1)[0]
  console.log('✅ 删除标签成功:', deleted)
  
  return {
    code: 2000,
    result: { tag_id: id },
    message: 'Tag deleted successfully'
  }
}

// -------------------- 建筑/单元管理 CRUD --------------------

/**
 * 创建建筑
 */
export async function mockCreateBuilding(body: any) {
  await delay(500)
  
  const store = getDataStore()
  const newBuilding = {
    id: generateId('building'),
    ...body,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  store.buildings.push(newBuilding)
  console.log('✅ 创建建筑成功:', newBuilding)
  
  return {
    code: 2000,
    result: newBuilding,
    message: 'Building created successfully'
  }
}

/**
 * 更新建筑
 */
export async function mockUpdateBuilding(body: any, buildingId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = buildingId || body.id
  const index = store.buildings.findIndex(b => b.id === id)
  
  if (index === -1) {
    throw new Error('Building not found')
  }
  
  store.buildings[index] = {
    ...store.buildings[index],
    ...body,
    id,
    updatedAt: new Date().toISOString()
  }
  
  console.log('✅ 更新建筑成功:', store.buildings[index])
  
  return {
    code: 2000,
    result: store.buildings[index],
    message: 'Building updated successfully'
  }
}

/**
 * 删除建筑（硬删除）
 */
export async function mockDeleteBuilding(params: any, buildingId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = buildingId || params.building_id || params.id
  
  // 使用正确的字段名 building_id
  const index = store.buildings.findIndex(b => b.building_id === id)
  
  if (index === -1) {
    console.log('❌ 删除建筑失败 - 找不到建筑:', id)
    throw new Error('Building not found')
  }
  
  const deleted = store.buildings.splice(index, 1)[0]
  console.log('✅ 删除建筑成功:', deleted.building_name, 'ID:', id)
  
  return {
    code: 2000,
    result: { building_id: id },
    message: 'Building deleted successfully'
  }
}

// -------------------- Unit管理 CRUD --------------------

/**
 * 创建Unit
 */
export async function mockCreateUnit(body: any) {
  await delay(500)
  
  const store = getDataStore()
  
  const newUnit = {
    unit_id: `unit-${Date.now()}`,
    unit_name: body.unit_name,
    unit_number: body.unit_number || body.unit_name,
    unit_type: body.unit_type || 'Facility',
    building: body.building,
    building_id: body.building_id,
    branch_name: body.branch_name,
    floor: body.floor || '1F',
    is_public_space: body.is_public_space || false,
    is_multi_person_room: body.is_multi_person_room || false,
    timezone: body.timezone || 'America/Denver',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  store.units.push(newUnit)
  console.log('✅ 创建Unit成功:', newUnit.unit_name, 'Total:', store.units.length)
  
  return {
    code: 2000,
    result: newUnit,
    message: 'Unit created successfully'
  }
}

/**
 * 更新Unit
 */
export async function mockUpdateUnit(body: any, unitId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = unitId || body.unit_id
  
  const index = store.units.findIndex(u => u.unit_id === id)
  if (index !== -1) {
    store.units[index] = {
      ...store.units[index],
      ...body,
      unit_id: id,
      updated_at: new Date().toISOString()
    }
    console.log('✅ 更新Unit成功:', store.units[index].unit_name)
  }
  
  const result = index !== -1 ? { ...store.units[index] } : { unit_id: id, ...body }
  
  return {
    code: 2000,
    result: result,
    message: 'Unit updated successfully'
  }
}

/**
 * 删除Unit（硬删除）
 */
export async function mockDeleteUnit(params: any, unitId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = unitId || params.unit_id || params.id
  
  const index = store.units.findIndex(u => u.unit_id === id)
  
  if (index === -1) {
    console.log('❌ 删除Unit失败 - 找不到Unit:', id)
    throw new Error('Unit not found')
  }
  
  const deleted = store.units.splice(index, 1)[0]
  console.log('✅ 删除Unit成功:', deleted.unit_name, 'ID:', id)
  
  return {
    code: 2000,
    result: { unit_id: id },
    message: 'Unit deleted successfully'
  }
}

/**
 * 获取房间列表（包含床位）- 按unit_id过滤
 */
export async function mockGetRooms(params?: any) {
  await delay()
  
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  
  let rooms = [...store.rooms]
  
  // 按unit_id过滤
  if (params?.unit_id) {
    rooms = rooms.filter(r => r.unit_id === params.unit_id)
  }
  
  console.log(`📦 mockGetRooms - unit_id: ${params?.unit_id}, found: ${rooms.length} rooms`)
  
  // getRoomsApi期望直接返回RoomWithBeds[]数组
  return {
    code: 2000,
    result: rooms,
    message: 'Rooms retrieved successfully'
  }
}

/**
 * 创建房间
 */
export async function mockCreateRoom(body: any) {
  await delay()
  
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  
  const data = typeof body === 'string' ? JSON.parse(body) : body
  
  const newRoom = {
    room_id: `room-${Date.now()}`,
    tenant_id: 'demo_tenant_001',
    unit_id: data.unit_id,
    room_name: data.room_name,
    is_default: false,
    layout_config: {},
    beds: []
  }
  
  store.rooms.push(newRoom)
  console.log('✅ 创建Room成功:', newRoom.room_name, 'ID:', newRoom.room_id)
  
  return {
    code: 2000,
    result: newRoom,
    message: 'Room created successfully'
  }
}

/**
 * 更新房间
 */
export async function mockUpdateRoom(body: any, roomId?: string) {
  await delay()
  
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  
  const data = typeof body === 'string' ? JSON.parse(body) : body
  const id = roomId || data.room_id
  
  const index = store.rooms.findIndex((r: any) => r.room_id === id)
  if (index === -1) {
    console.log('❌ Room不存在:', id)
    return {
      code: 4004,
      result: null,
      message: 'Room not found'
    }
  }
  
  store.rooms[index] = { ...store.rooms[index], ...data }
  console.log('✅ 更新Room成功:', store.rooms[index].room_name, 'ID:', id)
  
  return {
    code: 2000,
    result: store.rooms[index],
    message: 'Room updated successfully'
  }
}

/**
 * 删除房间
 */
export async function mockDeleteRoom(params: any, roomId?: string) {
  await delay()
  
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  
  const id = roomId || params?.room_id
  
  const index = store.rooms.findIndex((r: any) => r.room_id === id)
  if (index === -1) {
    console.log('❌ Room不存在:', id)
    return {
      code: 4004,
      result: null,
      message: 'Room not found'
    }
  }
  
  const deleted = store.rooms.splice(index, 1)[0]
  console.log('✅ 删除Room成功:', deleted.room_name, 'ID:', id)
  
  return {
    code: 2000,
    result: { room_id: id },
    message: 'Room deleted successfully'
  }
}

/**
 * 创建床位
 */
export async function mockCreateBed(body: any) {
  await delay()
  
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  
  const data = typeof body === 'string' ? JSON.parse(body) : body
  
  const newBed = {
    bed_id: `bed-${Date.now()}`,
    tenant_id: 'demo_tenant_001',
    room_id: data.room_id,
    bed_name: data.bed_name,
    bed_type: data.bed_type || 'ActiveBed',
    resident_id: data.resident_id || undefined
  }
  
  // 同时添加到对应的room的beds数组中
  const roomIndex = store.rooms.findIndex((r: any) => r.room_id === data.room_id)
  if (roomIndex !== -1) {
    if (!store.rooms[roomIndex].beds) {
      store.rooms[roomIndex].beds = []
    }
    store.rooms[roomIndex].beds.push(newBed)
  }
  
  console.log('✅ 创建Bed成功:', newBed.bed_name, 'ID:', newBed.bed_id)
  
  return {
    code: 2000,
    result: newBed,
    message: 'Bed created successfully'
  }
}

/**
 * 更新床位
 */
export async function mockUpdateBed(body: any, bedId?: string) {
  await delay()
  
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  
  const data = typeof body === 'string' ? JSON.parse(body) : body
  const id = bedId || data.bed_id
  
  // 在所有room中查找并更新bed
  for (const room of store.rooms) {
    if (room.beds) {
      const bedIndex = room.beds.findIndex((b: any) => b.bed_id === id)
      if (bedIndex !== -1) {
        room.beds[bedIndex] = { ...room.beds[bedIndex], ...data }
        console.log('✅ 更新Bed成功:', room.beds[bedIndex].bed_name, 'ID:', id)
        
        return {
          code: 2000,
          result: room.beds[bedIndex],
          message: 'Bed updated successfully'
        }
      }
    }
  }
  
  console.log('❌ Bed不存在:', id)
  return {
    code: 4004,
    result: null,
    message: 'Bed not found'
  }
}

/**
 * 删除床位
 */
export async function mockDeleteBed(params: any, bedId?: string) {
  await delay()
  
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  
  const id = bedId || params?.bed_id
  
  // 在所有room中查找并删除bed
  for (const room of store.rooms) {
    if (room.beds) {
      const bedIndex = room.beds.findIndex((b: any) => b.bed_id === id)
      if (bedIndex !== -1) {
        const deleted = room.beds.splice(bedIndex, 1)[0]
        console.log('✅ 删除Bed成功:', deleted.bed_name, 'ID:', id)
        
        return {
          code: 2000,
          result: { bed_id: id },
          message: 'Bed deleted successfully'
        }
      }
    }
  }
  
  console.log('❌ Bed不存在:', id)
  return {
    code: 4004,
    result: null,
    message: 'Bed not found'
  }
}

// ==================== Device Store ====================

/**
 * 获取设备库存列表
 */
export async function mockGetDeviceStores(params?: any) {
  await delay()
  
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  
  // 从设备列表转换为 DeviceStore 格式
  const deviceStores = store.devices.map((device: any, index: number) => ({
    device_store_id: `ds-${device.device_id}`,
    device_type: device.device_type || 'SleepPad',
    device_model: device.device_model || 'S100',
    serial_number: device.serial_number || `SN${String(index).padStart(6, '0')}`,
    uid: device.uid || device.device_id,
    imei: device.imei || null,
    comm_mode: device.comm_mode || 'WiFi',
    mcu_model: device.mcu_model || 'STM32F407',
    firmware_version: device.firmware_version || 'v1.2.3',
    ota_target_firmware_version: null,
    ota_target_mcu_model: null,
    tenant_id: 'demo_tenant_001',
    tenant_name: 'Mapleview Care',
    allow_access: device.business_access === 'approved',
    import_date: new Date(Date.now() - index * 86400000 * 30).toISOString().split('T')[0],
    allocate_time: new Date(Date.now() - index * 86400000 * 10).toISOString()
  }))
  
  // 搜索过滤
  let filtered = deviceStores
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    filtered = deviceStores.filter((ds: any) => 
      ds.serial_number?.toLowerCase().includes(searchLower) ||
      ds.uid?.toLowerCase().includes(searchLower) ||
      ds.imei?.toLowerCase().includes(searchLower)
    )
  }
  
  console.log(`📦 mockGetDeviceStores - total: ${filtered.length} device stores`)
  
  return {
    code: 2000,
    result: {
      items: filtered,
      total: filtered.length
    },
    message: 'Device stores retrieved successfully'
  }
}

/**
 * 批量更新设备库存
 */
export async function mockBatchUpdateDeviceStores(body: any) {
  await delay(500)
  
  const updates = body?.updates || []
  console.log(`📦 mockBatchUpdateDeviceStores - updating ${updates.length} devices`)
  
  return {
    code: 2000,
    result: {
      success: true,
      updated: updates.length
    },
    message: `${updates.length} device stores updated successfully`
  }
}

/**
 * 获取租户列表（用于 Device Store 分配）
 */
export async function mockGetTenantList() {
  await delay()
  
  const tenants = [
    { tenant_id: 'demo_tenant_001', tenant_name: 'Mapleview Care', domain: 'mapleview.care', status: 'active' as const },
    { tenant_id: 'demo_tenant_002', tenant_name: 'Sunrise Senior Living', domain: 'sunrise.care', status: 'active' as const },
    { tenant_id: 'demo_tenant_003', tenant_name: 'Golden Years Care', domain: 'goldenyears.care', status: 'active' as const }
  ]
  
  return {
    code: 2000,
    result: {
      items: tenants,
      total: tenants.length
    },
    message: 'Tenants retrieved successfully'
  }
}

/**
 * 下载设备导入模板
 */
export async function mockGetImportTemplate() {
  await delay(300)
  
  // 创建完整的CSV模板，包含所有Device Store表格的列
  const csvContent = `Serial Number,UID,IMEI,Device Type,Tenant,Branch,Unit,Resident,Device Status,Firmware Version,OTA Target Version,Last Online,Notes
SN-EXAMPLE-001,UID-001,IMEI-001,SleepPad,Mapleview Care,East Wing,Room 101,John Smith,Active,1.0.0,1.0.1,2024-01-01 10:00:00,Example sleeppad device
SN-EXAMPLE-002,UID-002,IMEI-002,Radar,Mapleview Care,West Wing,Room 201,Jane Doe,Active,2.0.0,2.0.1,2024-01-02 15:30:00,Example radar device
SN-EXAMPLE-003,UID-003,IMEI-003,Gateway,Sunrise Living,,,,Inactive,1.5.0,,2024-01-03 08:00:00,Unassigned gateway`
  
  // 添加BOM头以确保Excel正确识别UTF-8编码
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  
  console.log('📥 Mock: Generating import template (CSV format)')
  
  return blob
}

/**
 * 导入设备库存
 */
export async function mockImportDeviceStores(formData: any) {
  await delay(1000)
  
  console.log('📤 Mock: Importing device stores', formData)
  
  // 模拟导入结果
  return {
    code: 2000,
    result: {
      success: true,
      success_count: 10,
      failed_count: 2,
      skipped_count: 1,
      errors: [
        { row: 5, error: 'Invalid serial number format' },
        { row: 8, error: 'Duplicate UID' }
      ]
    },
    message: 'Import completed with some errors'
  }
}

/**
 * 导出设备库存
 */
export async function mockExportDeviceStores() {
  await delay(500)
  
  const store = getDataStore()
  
  // 转换为完整的CSV格式，与模板列保持一致
  const headers = 'Serial Number,UID,IMEI,Device Type,Tenant,Branch,Unit,Resident,Device Status,Firmware Version,OTA Target Version,Last Online,Notes\n'
  const rows = store.deviceStores.map(ds => 
    `${ds.serial_number || ''},${ds.uid || ''},${ds.imei || ''},${ds.device_type || ''},${ds.tenant_name || 'Unallocated'},${ds.branch || ''},${ds.unit_name || ''},${ds.resident_name || ''},${ds.status || 'Active'},${ds.firmware_version || ''},${ds.ota_target_firmware_version || ''},${ds.last_online || ''},${ds.notes || ''}`
  ).join('\n')
  
  // 添加BOM头以确保Excel正确识别UTF-8编码
  const BOM = '\uFEFF'
  const csvContent = BOM + headers + rows
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  console.log('📥 Mock: Exporting device stores, total:', store.deviceStores.length)
  
  return blob
}

// -------------------- 租户管理 CRUD --------------------

/**
 * 获取租户列表
 */
export async function mockGetTenants(params?: any) {
  await delay(300)
  
  const store = getDataStore()
  const allTenants = store.tenants || []
  
  // 返回所有租户（包括deleted状态），因为：
  // 1. 用户可以创建deleted状态的租户
  // 2. 软删除后显示Restore按钮，用户可以恢复
  // 返回深拷贝以确保Vue能检测到变化
  const result = allTenants.map((t: any) => ({ ...t }))
  
  console.log(`📦 mockGetTenants - total: ${allTenants.length} tenants`)
  
  return {
    code: 2000,
    result: {
      items: result,
      total: result.length
    },
    message: 'Tenants retrieved successfully'
  }
}

/**
 * 创建租户
 */
export async function mockCreateTenant(body: any) {
  await delay(500)
  
  const store = getDataStore()
  
  const newTenant = {
    tenant_id: `tenant_${Date.now()}`,
    tenant_name: body.tenant_name,
    domain: body.domain || '',
    email: body.email || '',
    phone: body.phone || '',
    status: body.status || 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  // 添加到store
  store.tenants.push(newTenant)
  
  console.log('✅ 创建租户成功:', newTenant.tenant_name, 'Total:', store.tenants.length)
  
  return {
    code: 2000,
    result: newTenant,
    message: 'Tenant created successfully'
  }
}

/**
 * 更新租户
 */
export async function mockUpdateTenant(body: any, tenantId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = tenantId || body.tenant_id
  
  const index = store.tenants.findIndex((t: any) => t.tenant_id === id)
  if (index !== -1) {
    // 更新store中的数据
    store.tenants[index] = {
      ...store.tenants[index],
      ...body,
      tenant_id: id, // 保持ID不变
      updated_at: new Date().toISOString()
    }
    console.log('✅ 更新租户成功:', store.tenants[index].tenant_name, 'status:', store.tenants[index].status)
  }
  
  // 返回深拷贝
  const result = index !== -1 ? { ...store.tenants[index] } : { tenant_id: id, ...body }
  
  return {
    code: 2000,
    result: result,
    message: 'Tenant updated successfully'
  }
}

/**
 * 删除租户（软删除）
 */
export async function mockDeleteTenant(params: any, tenantId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = tenantId || params
  
  const index = store.tenants.findIndex((t: any) => t.tenant_id === id)
  if (index !== -1) {
    store.tenants[index].status = 'deleted'
    store.tenants[index].updated_at = new Date().toISOString()
    console.log('✅ 删除租户成功(软删除):', store.tenants[index].tenant_name, '- 将从列表中隐藏')
  }
  
  return {
    code: 2000,
    result: { success: true },
    message: 'Tenant deleted successfully'
  }
}

/**
 * 重置租户管理员密码
 */
export async function mockResetTenantAdminPassword(body: any, tenantId?: string) {
  await delay(500)
  
  const id = tenantId || body.tenant_id
  
  console.log('✅ 重置管理员密码成功:', { tenant_id: id, username: body.username })
  
  return {
    code: 2000,
    result: { 
      success: true,
      message: 'Admin password reset successfully'
    },
    message: 'Password reset successfully'
  }
}

