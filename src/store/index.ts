/**
 * Pinia Store entry file
 * Create Pinia instance and export all stores
 */

import { createPinia } from 'pinia'

const store = createPinia()

export { store }

// Export all stores for use outside setup
export * from './modules/user'
export * from './modules/tags'
export * from './modules/card'
// export * from './modules/app'
// export * from './modules/permission'

