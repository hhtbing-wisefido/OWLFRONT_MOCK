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
  
  // 生成30个模拟居民数据
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Wilson']
  const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara', 'David', 'Elizabeth']
  const serviceLevels = [
    { code: 'L1', name: 'Independent' },
    { code: 'L2', name: 'Assisted' },
    { code: 'L3', name: 'Memory Care' },
    { code: 'L4', name: 'Skilled Nursing' }
  ]
  
  const residents = []
  for (let i = 0; i < 30; i++) {
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const serviceLevel = serviceLevels[Math.floor(Math.random() * serviceLevels.length)]
    const floor = Math.floor(i / 10) + 1
    const room = (i % 10) + 1
    
    residents.push({
      id: `resident_${String(i + 1).padStart(3, '0')}`,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      dateOfBirth: `19${30 + Math.floor(Math.random() * 40)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      roomNumber: `${floor}0${room}`,
      building: `Building ${String.fromCharCode(65 + Math.floor(i / 20))}`,
      serviceLevel: serviceLevel.code,
      serviceLevelName: serviceLevel.name,
      admissionDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      status: Math.random() > 0.9 ? 'Discharged' : 'Active',
      emergencyContact: {
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        relationship: Math.random() > 0.5 ? 'Son' : 'Daughter',
        phone: `555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`
      },
      hasVitalMonitor: Math.random() > 0.2,
      hasSleepMonitor: Math.random() > 0.3
    })
  }
  
  return {
    code: 2000,
    result: {
      items: residents,
      total: 30,
      page: 1,
      pageSize: 30
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
