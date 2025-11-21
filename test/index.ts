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
export * as resident from './resident'
export * as staff from './staff'

// 工具函数
export * from './utils/generator'
