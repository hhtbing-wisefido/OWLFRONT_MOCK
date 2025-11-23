/**
 * 测试环境配置
 * 在每个测试文件运行前执行
 */

import { config } from '@vue/test-utils'
import { vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

// 初始化 Pinia
const pinia = createPinia()
setActivePinia(pinia)

// 创建测试用的 Router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: { template: '<div>Home</div>' },
    },
    {
      path: '/login',
      name: 'login',
      component: { template: '<div>Login</div>' },
    },
    {
      path: '/monitoring/vital-focus',
      name: 'vital-focus',
      component: { template: '<div>Vital Focus</div>' },
    },
    {
      path: '/monitoring/vital-focus/:cardId',
      name: 'VitalFocusDetail',
      component: { template: '<div>Vital Focus Detail</div>' },
    },
  ],
})

// 配置全局插件
config.global.plugins = [pinia, router]

// 配置 Ant Design Vue 组件
config.global.stubs = {
  // 可以在这里配置需要 stub 的组件
}

// Mock Ant Design Vue 的 message
vi.mock('ant-design-vue', async () => {
  const actual = await vi.importActual('ant-design-vue')
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  }
})

