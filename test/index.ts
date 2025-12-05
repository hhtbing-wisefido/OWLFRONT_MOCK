/**
 * 测试数据入口文件
 * 统一导出所有测试数据和 Mock 函数
 * 
 * 组织原则：
 * - 按功能模块组织（login, resident, staff 等）
 * - 每个模块对应一个 Vue 页面和一个 API 模块
 * - 每个模块包含：data.ts（页面数据）、api.ts（API 数据）、mock.ts（Mock 函数）
 */

// 功能模块测试数据
export * as login from './login'
export * as forgotPassword from './forgot-password'
export * as vitalFocus from './vital-focus'
export * as resident from './resident'
export * as staff from './staff'
export * as roles from './admin/roles'
export * as rolePermissions from './admin/role-permissions'
export * as users from './admin/users'
export * as residents from './admin/residents'
export * as tags from './admin/tags'
export * as devices from './admin/devices'
export * as unit from './admin/unit'
export * as serviceLevels from './service-levels'
export * as alarmCloud from './alarm-cloud'
export * as alarmEvents from './alarm-events'
export * as cardOverview from './card-overview'
export * as settings from './settings'

// 工具函数
export * from './utils/generator'
