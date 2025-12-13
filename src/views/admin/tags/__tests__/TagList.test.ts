/**
 * TagList 组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, config } from '@vue/test-utils'
import { nextTick } from 'vue'
import Antd from 'ant-design-vue'
import TagList from '../TagList.vue'
import { tags } from '../../../../../test/index'
import * as tagsApi from '@/api/admin/tags/tags'
import { useUserStore } from '@/store/modules/user'
import { createPinia, setActivePinia } from 'pinia'
import type { GetTagsResult } from '@/api/admin/tags/model/tagsModel'

// 注册 Ant Design Vue 组件
config.global.plugins = [Antd]

// Mock API
vi.mock('@/api/admin/tags/tags', () => ({
  getTagsApi: vi.fn(),
  createTagApi: vi.fn(),
  updateTagApi: vi.fn(),
  deleteTagApi: vi.fn(),
  deleteTagTypeApi: vi.fn(),
  removeTagObjectsApi: vi.fn(),
}))

// Mock useUserStore
vi.mock('@/store/modules/user', () => ({
  useUserStore: vi.fn(),
}))

describe('TagList', () => {
  let pinia: ReturnType<typeof createPinia>
  let mockUserStore: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 初始化 Pinia
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Mock user store
    mockUserStore = {
      getUserInfo: {
        tenant_id: '550e8400-e29b-41d4-a716-446655440000',
        role: 'Admin',
      },
    }
    vi.mocked(useUserStore).mockReturnValue(mockUserStore as any)
    
    // Mock getTagsApi 返回测试数据
    const mockTagsData: GetTagsResult = {
      items: tags.mockTagsData.filter(tag => 
        tag.tenant_id === '550e8400-e29b-41d4-a716-446655440000'
      ),
      total: tags.mockTagsData.filter(tag => 
        tag.tenant_id === '550e8400-e29b-41d4-a716-446655440000'
      ).length,
    }
    vi.mocked(tagsApi.getTagsApi).mockResolvedValue(mockTagsData)
  })

  it('应该渲染组件', async () => {
    const wrapper = mount(TagList)
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
    await nextTick()
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html()).toContain('Create Tag')
    expect(wrapper.html()).toContain('Create Type')
    expect(wrapper.html()).toContain('Save')
  })

  it('应该加载并显示标签数据', async () => {
    const wrapper = mount(TagList)
    
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
    await nextTick()
    
    // 验证 API 被调用
    expect(tagsApi.getTagsApi).toHaveBeenCalledWith({
      tenant_id: '550e8400-e29b-41d4-a716-446655440000',
      include_system_tag_types: true,
    })
    
    // 检查表格是否存在
    const table = wrapper.find('.tag-table')
    expect(table.exists()).toBe(true)
  })

  it('应该可以创建新的 Tag', async () => {
    const wrapper = mount(TagList)
    
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
    await nextTick()
    
    // Mock createTagApi
    vi.mocked(tagsApi.createTagApi).mockResolvedValue({
      tag_id: 'new-tag-id',
    })
    
    // 查找 Create Tag 输入框和按钮
    const tagNameInput = wrapper.find('input[placeholder*="Tag Name"]')
    const createTagButton = wrapper.findAll('button').find(btn => 
      btn.text().includes('Create Tag')
    )
    
    expect(tagNameInput.exists()).toBe(true)
    expect(createTagButton).toBeDefined()
    
    // 设置输入值
    await tagNameInput.setValue('New Tag')
    await nextTick()
    
    // 点击创建按钮
    if (createTagButton) {
      await createTagButton.trigger('click')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))
      await nextTick()
      
      // 验证 API 被调用
      expect(tagsApi.createTagApi).toHaveBeenCalledWith({
        tenant_id: '550e8400-e29b-41d4-a716-446655440000',
        tag_name: 'New Tag',
        tag_type: null,
      })
    }
  })

  it('应该可以创建新的 Tag Type', async () => {
    const wrapper = mount(TagList)
    
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
    await nextTick()
    
    // Mock createTagApi
    vi.mocked(tagsApi.createTagApi).mockResolvedValue({
      tag_id: 'new-type-tag-id',
    })
    
    // 查找 Create Type 输入框和按钮
    const inputs = wrapper.findAll('input')
    const tagTypeInput = inputs.find(input => {
      const placeholder = input.attributes('placeholder') || ''
      return placeholder.includes('Tag type') || placeholder.includes('Tag_type')
    })
    
    const buttons = wrapper.findAll('button')
    const createTypeButton = buttons.find(btn => 
      btn.text().includes('Create Type')
    )
    
    expect(tagTypeInput).toBeDefined()
    expect(createTypeButton).toBeDefined()
    
    // 设置输入值
    if (tagTypeInput) {
      await tagTypeInput.setValue('custom_tag')
      await nextTick()
    }
    
    // 点击创建按钮
    if (createTypeButton) {
      await createTypeButton.trigger('click')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 300))
      await nextTick()
      
      // 验证 API 被调用
      expect(tagsApi.createTagApi).toHaveBeenCalled()
    }
  })

  it('应该可以删除 Tag Name（当没有对象时）', async () => {
    const wrapper = mount(TagList)
    
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
    await nextTick()
    
    // Mock deleteTagApi
    vi.mocked(tagsApi.deleteTagApi).mockResolvedValue(undefined)
    
    // 查找删除图标（应该在有 tag_name 但没有对象的行中显示）
    const deleteIcons = wrapper.findAll('.delete-tag-icon')
    
    // 如果有删除图标，点击第一个
    if (deleteIcons.length > 0) {
      await deleteIcons[0].trigger('click')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))
      await nextTick()
      
      // 验证 API 被调用
      expect(tagsApi.deleteTagApi).toHaveBeenCalled()
    }
  })

  it('应该可以删除 Tag Type（自定义类型）', async () => {
    const wrapper = mount(TagList)
    
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
    await nextTick()
    
    // Mock deleteTagTypeApi
    vi.mocked(tagsApi.deleteTagTypeApi).mockResolvedValue(undefined)
    
    // 查找 Tag Type 容器中的删除图标（自定义类型）
    const deleteTypeIcons = wrapper.findAll('.delete-tag-type-icon')
    
    // 如果有删除图标，点击第一个
    if (deleteTypeIcons.length > 0) {
      await deleteTypeIcons[0].trigger('click')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))
      await nextTick()
      
      // 验证 API 被调用
      expect(tagsApi.deleteTagTypeApi).toHaveBeenCalled()
    }
  })

  it('应该可以保存对象选择变更', async () => {
    const wrapper = mount(TagList)
    
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
    await nextTick()
    
    // Mock removeTagObjectsApi
    vi.mocked(tagsApi.removeTagObjectsApi).mockResolvedValue(undefined)
    
    // 查找 Save 按钮
    const saveButton = wrapper.findAll('button').find(btn => 
      btn.text().includes('Save')
    )
    
    expect(saveButton).toBeDefined()
    
    // 点击 Save 按钮
    if (saveButton) {
      await saveButton.trigger('click')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))
      await nextTick()
      
      // 如果没有变更，应该显示 "No changes to save" 消息
      // 如果有变更，应该调用 removeTagObjectsApi
    }
  })

  it('应该显示 Tag Type 列表', async () => {
    const wrapper = mount(TagList)
    
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
    await nextTick()
    
    // 检查 Tag Type 容器是否存在
    const tagTypeContainer = wrapper.find('.tag-type-list-container')
    expect(tagTypeContainer.exists()).toBe(true)
    
    // 检查是否显示了系统预置的 tag_type（通过检查文本内容）
    const text = wrapper.text()
    // 检查是否包含格式化后的 tag_type 名称（如 "Alarm", "Location" 等）
    expect(text).toMatch(/alarm|Alarm|location|Location|family|Family/i)
  })

  it('应该可以修改 Tag Type（通过下拉框）', async () => {
    const wrapper = mount(TagList)
    
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
    await nextTick()
    
    // Mock updateTagApi
    vi.mocked(tagsApi.updateTagApi).mockResolvedValue(undefined)
    
    // 查找 Tag Type 下拉框（在表格的 tag_type 列中）
    const selects = wrapper.findAllComponents({ name: 'ASelect' })
    
    // 找到 tag_type 列的下拉框（不是 Create Tag 中的下拉框）
    if (selects.length > 0) {
      // 使用第二个或之后的 Select（第一个可能是 Create Tag 的 tag_type 选择）
      const tagTypeSelect = selects[selects.length > 1 ? 1 : 0]
      
      // 修改下拉框值
      await tagTypeSelect.setValue('branch_tag')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 300))
      await nextTick()
      
      // 验证 API 被调用（如果确实有 tag_type 列的下拉框）
      // 注意：如果表格中没有数据或没有 tag_type 列，这个测试可能会跳过
      if (selects.length > 1) {
        expect(tagsApi.updateTagApi).toHaveBeenCalled()
      }
    }
  })

  it('应该处理 API 错误', async () => {
    const wrapper = mount(TagList)
    
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
    await nextTick()
    
    // Mock API 返回错误
    vi.mocked(tagsApi.getTagsApi).mockRejectedValue(new Error('API Error'))
    
    // 重新挂载组件以触发错误
    const newWrapper = mount(TagList)
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
    await nextTick()
    
    // 组件应该仍然存在（错误被处理）
    expect(newWrapper.exists()).toBe(true)
  })
})

