/**
 * Tags 状态管理 Store
 * 管理所有 tags 的缓存，避免重复 API 调用
 * 
 * 策略：
 * - 一次性获取所有 tags 并缓存
 * - 按 tag_type 分类存储
 * - 提供按类型过滤的方法
 * - 支持刷新缓存
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TagCatalogItem } from '@/api/admin/tags/model/tagsModel'
import { getTagsApi } from '@/api/admin/tags/tags'
import { useUserStore } from './user'

export const useTagsStore = defineStore('tags', () => {
  // 所有 tags 的缓存（按 tag_type 分类）
  const allTags = ref<TagCatalogItem[]>([])
  
  // 是否已加载过 tags
  const isLoaded = ref(false)
  
  // 加载状态
  const isLoading = ref(false)

  /**
   * 按 tag_type 过滤 tags
   */
  const getTagsByType = computed(() => {
    return (tagType: string | null) => {
      if (tagType === null || tagType === undefined) {
        return allTags.value.filter(tag => tag.tag_type === null)
      }
      return allTags.value.filter(tag => tag.tag_type === tagType)
    }
  })

  /**
   * 获取 location_tag 列表
   */
  const locationTags = computed(() => {
    return getTagsByType.value('location_tag')
  })

  /**
   * 获取 area_tag 列表
   */
  const areaTags = computed(() => {
    return getTagsByType.value('area_tag')
  })

  /**
   * 获取所有 tags（一次性获取）
   */
  const fetchAllTags = async () => {
    if (isLoading.value) {
      // 如果正在加载，等待加载完成
      return new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isLoading.value) {
            clearInterval(checkInterval)
            resolve()
          }
        }, 100)
      })
    }

    if (isLoaded.value && allTags.value.length > 0) {
      // 如果已加载且缓存不为空，直接返回
      return
    }

    try {
      isLoading.value = true
      const userStore = useUserStore()
      const userInfo = userStore.getUserInfo
      const tenantId = userInfo?.tenant_id

      if (!tenantId) {
        console.warn('No tenant ID available, cannot fetch tags')
        return
      }

      // 获取所有 tags（不指定 tag_type，获取所有类型）
      const result = await getTagsApi({
        tenant_id: tenantId,
      })

      allTags.value = result.items
      isLoaded.value = true
    } catch (error: any) {
      console.error('Failed to fetch tags:', error)
      allTags.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 刷新 tags 缓存（创建/更新/删除 tag 后调用）
   */
  const refreshTags = async () => {
    isLoaded.value = false
    await fetchAllTags()
  }

  /**
   * 清空缓存（登出时调用）
   */
  const clearTags = () => {
    allTags.value = []
    isLoaded.value = false
  }

  return {
    // State
    allTags,
    isLoaded,
    isLoading,
    
    // Getters
    getTagsByType,
    locationTags,
    areaTags,
    
    // Actions
    fetchAllTags,
    refreshTags,
    clearTags,
  }
})

