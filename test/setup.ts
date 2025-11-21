/**
 * 测试环境配置
 * 在每个测试文件运行前执行
 */

import { config } from '@vue/test-utils'
import { vi } from 'vitest'

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

