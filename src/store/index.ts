/**
 * Pinia Store 入口文件
 * 创建 Pinia 实例，导出所有 store
 */

import { createPinia } from 'pinia'

const store = createPinia()

export { store }

// 导出所有 store，方便在 setup 外使用
export * from './modules/user'
// export * from './modules/app'
// export * from './modules/permission'

