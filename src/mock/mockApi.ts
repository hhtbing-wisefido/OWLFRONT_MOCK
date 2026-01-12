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
// Mock获取建筑列表
export async function mockGetBuildings(params?: any) {
  await delay()
  
  // 从数据存储读取建筑列表
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  let buildings = [...store.buildings]
  
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
  
  // 从数据存储读取单元列表
  const { getDataStore } = await import('./mockStore')
  const store = getDataStore()
  let units = [...store.units]
  
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
  const id = residentId || body.id
  const index = store.residents.findIndex(r => r.id === id)
  
  if (index === -1) {
    throw new Error('Resident not found')
  }
  
  store.residents[index] = {
    ...store.residents[index],
    ...body,
    id, // 保持ID不变
    updatedAt: new Date().toISOString()
  }
  
  console.log('✅ 更新居民成功:', store.residents[index])
  
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
  const id = residentId || params.id
  const index = store.residents.findIndex(r => r.id === id)
  
  if (index === -1) {
    throw new Error('Resident not found')
  }
  
  const deleted = store.residents.splice(index, 1)[0]
  console.log('✅ 删除居民成功:', deleted)
  
  return {
    code: 2000,
    result: { id },
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
 * 更新报警云配置
 */
export async function mockUpdateAlarmCloudConfig(body: any, configId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = configId || body.id
  const index = store.alarmCloudConfig.findIndex(c => c.id === id)
  
  if (index === -1) {
    throw new Error('Alarm cloud config not found')
  }
  
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
 * 删除建筑
 */
export async function mockDeleteBuilding(params: any, buildingId?: string) {
  await delay(500)
  
  const store = getDataStore()
  const id = buildingId || params.id
  const index = store.buildings.findIndex(b => b.id === id)
  
  if (index === -1) {
    throw new Error('Building not found')
  }
  
  const deleted = store.buildings.splice(index, 1)[0]
  console.log('✅ 删除建筑成功:', deleted)
  
  return {
    code: 2000,
    result: { id },
    message: 'Building deleted successfully'
  }
}
