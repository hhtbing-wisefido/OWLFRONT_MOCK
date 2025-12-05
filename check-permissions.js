/**
 * 权限配置检查脚本
 * 用于验证权限配置是否与权限对照表一致
 * 
 * 使用方法：
 * node check-permissions.js
 */

// 从 route.md 提取的权限对照表（标准答案）
const permissionTable = {
  '/monitoring/overview': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  '/alarm/records': ['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  '/alarm/settings': ['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  '/admin/alarm-cloud': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  '/residents': ['Admin', 'Manager', 'Nurse', 'Caregiver'],
  '/resident/:id/profile': ['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  '/resident/:id/phi': ['Admin', 'Manager', 'Nurse', 'Caregiver'],
  '/resident/:id/contacts': ['Admin', 'Manager', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  '/care-coordination/card-overview': ['Admin', 'Manager', 'IT', 'Nurse'],
  '/devices': ['Admin', 'Manager', 'IT'],
  '/admin/device-store': ['SystemAdmin'],
  '/units': ['Admin', 'Manager', 'IT'],
  '/admin/users': ['Admin', 'Manager', 'IT'],
  '/admin/roles': ['SystemAdmin', 'Admin', 'Manager', 'IT'],
  '/admin/permissions': ['SystemAdmin'],
  '/admin/tags': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver'],
}

// 从 user.ts 提取的当前配置（需要手动更新）
const currentConfig = {
  '/monitoring/overview': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  '/alarm/records': ['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  '/alarm/settings': ['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  '/admin/alarm-cloud': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  '/residents': ['Admin', 'Manager', 'Nurse', 'Caregiver'],
  '/resident/:id/profile': ['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  '/resident/:id/phi': ['Admin', 'Manager', 'Nurse', 'Caregiver'],
  '/resident/:id/contacts': ['Admin', 'Manager', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  '/care-coordination/card-overview': ['Admin', 'Manager', 'IT', 'Nurse'],
  '/devices': ['Admin', 'Manager', 'IT'],
  '/admin/device-store': ['SystemAdmin'],
  '/units': ['Admin', 'Manager', 'IT'],
  '/admin/users': ['Admin', 'Manager', 'IT'],
  '/admin/roles': ['SystemAdmin', 'Admin', 'Manager', 'IT'],
  '/admin/permissions': ['SystemAdmin'],
  '/admin/tags': ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver'],
}

// 所有角色列表
const allRoles = ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family']

// 页面名称映射
const pageNames = {
  '/monitoring/overview': 'Monitoring Overview',
  '/alarm/records': 'Alarm Records',
  '/alarm/settings': 'Alarm Settings',
  '/admin/alarm-cloud': 'Alarm Cloud',
  '/residents': 'Resident Management',
  '/resident/:id/profile': 'Resident Profile Tab',
  '/resident/:id/phi': 'Resident PHI Tab',
  '/resident/:id/contacts': 'Resident Contacts Tab',
  '/care-coordination/card-overview': 'Card Overview',
  '/devices': 'Device Management',
  '/admin/device-store': 'Device Store',
  '/units': 'Unit Management',
  '/admin/users': 'User Management',
  '/admin/roles': 'Role Management',
  '/admin/permissions': 'Permission Management',
  '/admin/tags': 'Tag Management',
}

// 检查函数
function checkPermissions() {
  console.log('='.repeat(80))
  console.log('权限配置检查报告')
  console.log('='.repeat(80))
  console.log()

  // 1. 按页面检查
  console.log('【按页面检查】')
  console.log('-'.repeat(80))
  let hasError = false
  
  for (const [path, expectedRoles] of Object.entries(permissionTable)) {
    const currentRoles = currentConfig[path] || []
    const expectedSet = new Set(expectedRoles.sort())
    const currentSet = new Set(currentRoles.sort())
    
    const missing = expectedRoles.filter(r => !currentRoles.includes(r))
    const extra = currentRoles.filter(r => !expectedRoles.includes(r))
    
    if (missing.length > 0 || extra.length > 0) {
      hasError = true
      console.log(`❌ ${pageNames[path] || path}`)
      if (missing.length > 0) {
        console.log(`   缺少角色: ${missing.join(', ')}`)
      }
      if (extra.length > 0) {
        console.log(`   多余角色: ${extra.join(', ')}`)
      }
    } else {
      console.log(`✅ ${pageNames[path] || path}`)
    }
  }
  
  console.log()
  
  // 2. 按角色检查
  console.log('【按角色检查 - 每个角色可访问的页面】')
  console.log('-'.repeat(80))
  
  for (const role of allRoles) {
    const accessiblePages = []
    for (const [path, roles] of Object.entries(currentConfig)) {
      if (roles.includes(role)) {
        accessiblePages.push(pageNames[path] || path)
      }
    }
    console.log(`${role}: ${accessiblePages.length} 个页面`)
    console.log(`  ${accessiblePages.join(', ')}`)
    console.log()
  }
  
  // 3. 统计信息
  console.log('【统计信息】')
  console.log('-'.repeat(80))
  console.log(`总页面数: ${Object.keys(permissionTable).length}`)
  console.log(`总角色数: ${allRoles.length}`)
  console.log()
  
  if (!hasError) {
    console.log('✅ 所有权限配置正确！')
  } else {
    console.log('❌ 发现权限配置错误，请检查上述问题')
  }
  
  console.log('='.repeat(80))
}

// 运行检查
checkPermissions()

