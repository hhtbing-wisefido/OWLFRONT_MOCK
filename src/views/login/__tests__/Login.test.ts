/**
 * Login 页面测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Login from '../Login.vue'

describe('Login', () => {
  it('应该渲染登录页面', () => {
    const wrapper = mount(Login)
    
    expect(wrapper.find('.login-container').exists()).toBe(true)
    expect(wrapper.find('.login-wrapper').exists()).toBe(true)
  })

  it('应该显示登录表单', () => {
    const wrapper = mount(Login)
    
    // 验证登录表单的关键元素（Welcome Back 已移除）
    expect(wrapper.text()).toContain('Staff')
    expect(wrapper.text()).toContain('Resident')
    expect(wrapper.text()).toContain('Sign In')
  })

  // Logo 图标现在在 LoginForm 组件中，不在 Login 组件中
  // 这个测试已经移到 LoginForm.test.ts

  it('应该显示右侧标语', () => {
    const wrapper = mount(Login)
    
    expect(wrapper.text()).toContain('Your Space. Simply Yours.')
    expect(wrapper.text()).toContain('Seamlessly Safe.')
  })

  it('应该包含 LoginForm 组件', () => {
    const wrapper = mount(Login)
    
    expect(wrapper.findComponent({ name: 'LoginForm' }).exists()).toBe(true)
  })
})

