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
  
  // 🔴 修正：从mockCards提取居民数据，确保与卡片同步
  const residents = mockCards
    .filter(card => card.card_type === 'ActiveBed' && card.residents && card.residents.length > 0)
    .map((card, index) => {
      const resident = card.residents![0]
      const address = card.card_address.split(' / ')
      const building = address[0] || 'Building A'
      const roomMatch = address[1]?.match(/Room (\d+)/)
      const roomNumber = roomMatch ? roomMatch[1] : `${Math.floor(index / 10) + 1}0${(index % 10) + 1}`
      
      // 使用index生成固定的值，确保每次刷新数据一致
      const birthYear = 1930 + (index % 40)
      const birthMonth = ((index * 7) % 12) + 1
      const birthDay = ((index * 13) % 28) + 1
      const admitMonth = ((index * 5) % 12) + 1
      const admitDay = ((index * 11) % 28) + 1
      const phoneArea = 100 + (index % 900)
      const phoneExchange = 1000 + (index * 37) % 9000
      
      return {
        id: resident.resident_id,
        resident_id: resident.resident_id,
        firstName: resident.first_name,
        lastName: resident.last_name,
        fullName: `${resident.first_name} ${resident.last_name}`,
        first_name: resident.first_name,
        last_name: resident.last_name,
        full_name: `${resident.first_name} ${resident.last_name}`,
        dateOfBirth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
        date_of_birth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
        gender: index % 2 === 0 ? 'Male' : 'Female',
        roomNumber: roomNumber,
        room_number: roomNumber,
        building: building,
        serviceLevel: resident.service_level,
        service_level: resident.service_level,
        serviceLevelName: resident.service_level_info?.display_name || 'Independent',
        service_level_name: resident.service_level_info?.display_name || 'Independent',
        admissionDate: `2024-${String(admitMonth).padStart(2, '0')}-${String(admitDay).padStart(2, '0')}`,
        admission_date: `2024-${String(admitMonth).padStart(2, '0')}-${String(admitDay).padStart(2, '0')}`,
        status: 'Active',
        emergencyContact: {
          name: `John ${resident.last_name}`,
          relationship: 'Son',
          phone: `555-${String(phoneArea).padStart(3, '0')}-${String(phoneExchange).padStart(4, '0')}`
        },
        emergency_contact: {
          name: `John ${resident.last_name}`,
          relationship: 'Son',
          phone: `555-${String(phoneArea).padStart(3, '0')}-${String(phoneExchange).padStart(4, '0')}`
        },
        hasVitalMonitor: card.device_count > 0,
        has_vital_monitor: card.device_count > 0,
        hasSleepMonitor: card.devices?.some(d => d.device_type === 1),
        has_sleep_monitor: card.devices?.some(d => d.device_type === 1),
        card_id: card.card_id,
        unit_id: card.bed_id,
        tenant_id: card.tenant_id
      }
    })
  
  // 应用搜索过滤
  let filteredResidents = residents
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    filteredResidents = filteredResidents.filter(r => 
      r.fullName.toLowerCase().includes(searchLower) ||
      r.roomNumber.includes(searchLower)
    )
  }
  
  // 应用状态过滤
  if (params?.status && params.status !== 'all') {
    filteredResidents = filteredResidents.filter(r => r.status === params.status)
  }
  
  // 应用分页
  const page = params?.page || 1
  const pageSize = params?.pageSize || params?.size || 20
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedResidents = filteredResidents.slice(start, end)
  
  return {
    code: 2000,
    result: {
      items: paginatedResidents,
      total: filteredResidents.length,
      page: page,
      pageSize: pageSize,
      size: pageSize
    },
    message: 'Residents retrieved successfully'
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
  
  const events = mockCards
    .filter(card => card.alarms && card.alarms.length > 0)
    .flatMap(card => card.alarms!.map(alarm => ({
      ...alarm,
      resident_name: card.resident_name,
      room_number: card.room_number,
      card_id: card.card_id
    })))
  
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
  
  return {
    code: 2000,
    result: {
      heartRate: {
        emergency: { low: 0, high: 44, duration: 60 },
        warning: { low: 45, high: 54, duration: 300 },
        normal: { low: 55, high: 95 }
      },
      respiratoryRate: {
        emergency: { low: 0, high: 7, duration: 60 },
        warning: { low: 8, high: 9, duration: 300 },
        normal: { low: 10, high: 23 }
      }
    },
    message: 'Alarm cloud configuration retrieved successfully'
  }
}

// Mock获取卡片概览
export async function mockGetCardOverview(params?: any) {
  await delay()
  
  // 🔴 修正：Card Overview页面期望的是卡片列表，不是统计数据
  // 从mockCards转换为CardOverviewItem格式
  const cardOverviewItems = mockCards
    .filter(card => card.card_type === 'ActiveBed') // 只包含ActiveBed卡片
    .map(card => ({
      card_id: card.card_id,
      card_name: card.card_name,
      card_address: card.card_address,
      unit_type: 'Facility' as const,
      is_multi_person_room: false,
      is_public_space: false,
      family_view: true,
      devices: card.devices || [],
      residents: card.residents || [],
      caregiver_groups: [],
      caregivers: [],
      device_count: card.device_count || 0,
      resident_count: card.resident_count || 1,
      caregiver_group_count: 0,
      caregiver_count: 0,
      tenant_id: card.tenant_id
    }))
  
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
export async function mockGetBuildings(params?: any) {
  await delay()
  
  // Mock建筑数据
  const buildings = [
    {
      building_id: 'building_001',
      building_name: 'Building A',
      tenant_id: 'tenant_001',
      branch_id: 'branch_001',
      branch_name: 'Main Campus'
    },
    {
      building_id: 'building_002',
      building_name: 'Building B',
      tenant_id: 'tenant_001',
      branch_id: 'branch_001',
      branch_name: 'Main Campus'
    },
    {
      building_id: 'building_003',
      building_name: 'Building C',
      tenant_id: 'tenant_001',
      branch_id: 'branch_002',
      branch_name: 'North Wing'
    },
    {
      building_id: 'building_004',
      building_name: 'Building D',
      tenant_id: 'tenant_001',
      branch_id: 'branch_002',
      branch_name: 'North Wing'
    },
    {
      building_id: 'building_005',
      building_name: 'Building E',
      tenant_id: 'tenant_001',
      branch_id: 'branch_003',
      branch_name: 'Memory Care'
    }
  ]
  
  return {
    code: 2000,
    result: {
      items: buildings,
      total: buildings.length,
      page: 1,
      pageSize: 20
    },
    message: 'Buildings retrieved successfully'
  }
}

export async function mockGetBranches(params?: any) {
  await delay()
  
  const branches = [
    { id: 'branch_001', name: 'Main Floor', building: 'Building A', floor: 1, units: 30 },
    { id: 'branch_002', name: 'Second Floor', building: 'Building A', floor: 2, units: 25 },
    { id: 'branch_003', name: 'Memory Care Unit', building: 'Building B', floor: 1, units: 20 }
  ]
  
  return {
    code: 2000,
    result: {
      items: branches,
      total: branches.length,
      page: 1,
      pageSize: 20
    },
    message: 'Branches retrieved successfully'
  }
}

// Mock获取所有单元
export async function mockGetAllUnits(params?: any) {
  await delay()
  
  const units = []
  for (let i = 1; i <= 75; i++) {
    const floor = Math.floor((i - 1) / 30) + 1
    const room = ((i - 1) % 30) + 1
    units.push({
      id: `unit_${String(i).padStart(3, '0')}`,
      roomNumber: `${floor}${String(room).padStart(2, '0')}`,
      building: floor <= 2 ? 'Building A' : 'Building B',
      floor: floor,
      status: Math.random() > 0.8 ? 'vacant' : 'occupied',
      residentId: Math.random() > 0.8 ? null : `resident_${String(Math.floor(Math.random() * 30) + 1).padStart(3, '0')}`
    })
  }
  
  return {
    code: 2000,
    result: {
      items: units,
      total: units.length,
      page: 1,
      pageSize: 100
    },
    message: 'Units retrieved successfully'
  }
}

// Mock获取设备列表
export async function mockGetDevices(params?: any) {
  await delay()
  
  const devices = []
  const deviceTypes = ['SleepPad', 'VitalMonitor', 'Gateway', 'Sensor']
  
  for (let i = 0; i < 50; i++) {
    const type = deviceTypes[Math.floor(Math.random() * deviceTypes.length)]
    devices.push({
      id: `device_${String(i + 1).padStart(3, '0')}`,
      deviceId: `DEV${String(i + 1).padStart(5, '0')}`,
      deviceType: type,
      serialNumber: `SN${type.toUpperCase()}${String(i + 1).padStart(6, '0')}`,
      status: Math.random() > 0.9 ? 'offline' : 'online',
      location: i < 30 ? `Room ${Math.floor(i / 10) + 1}${String((i % 10) + 1).padStart(2, '0')}` : 'Unassigned',
      lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      batteryLevel: type === 'Gateway' ? null : Math.floor(Math.random() * 100)
    })
  }
  
  return {
    code: 2000,
    result: {
      items: devices,
      total: devices.length,
      page: 1,
      pageSize: 50
    },
    message: 'Devices retrieved successfully'
  }
}

// Mock获取用户列表
export async function mockGetUsers(params?: any) {
  await delay()
  
  const users = mockAccounts.map((acc, index) => ({
    id: acc.userId,
    username: acc.username,
    fullName: acc.fullName,
    email: `${acc.username}@mapleview.com`,
    role: acc.role,
    userType: acc.user_type,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
  }))
  
  return {
    code: 2000,
    result: {
      items: users,
      total: users.length,
      page: 1,
      pageSize: 20
    },
    message: 'Users retrieved successfully'
  }
}

// Mock获取标签列表
export async function mockGetTags(params?: any) {
  await delay()
  
  const tags = [
    { id: 'tag_001', name: 'VIP', color: '#ff0000', description: 'VIP resident' },
    { id: 'tag_002', name: 'High Risk', color: '#ff9900', description: 'High risk of falls' },
    { id: 'tag_003', name: 'Diabetic', color: '#00cc00', description: 'Diabetes care required' },
    { id: 'tag_004', name: 'Dementia', color: '#0099ff', description: 'Memory care required' }
  ]
  
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
  
  const roles = [
    { id: 'role_001', name: 'SystemAdmin', displayName: 'System Administrator', description: 'Full system access' },
    { id: 'role_002', name: 'Admin', displayName: 'Administrator', description: 'Facility administration' },
    { id: 'role_003', name: 'Nurse', displayName: 'Nurse', description: 'Clinical care staff' },
    { id: 'role_004', name: 'Caregiver', displayName: 'Caregiver', description: 'Direct care staff' },
    { id: 'role_005', name: 'Resident', displayName: 'Resident/Family', description: 'Resident or family member' }
  ]
  
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
