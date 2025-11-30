/**
 * Tags Mock 函数
 * 模拟 tags_catalog API 调用
 */

import { delay } from '../../utils/generator'
import type {
  TagCatalogItem,
  GetTagsParams,
  GetTagsResult,
  CreateTagParams,
  CreateTagResult,
  UpdateTagParams,
  DeleteTagParams,
  RemoveTagObjectsParams,
  DeleteTagTypeParams,
  GetTagsForObjectParams,
  TagForObject,
} from '@/api/admin/tags/model/tagsModel'
import { mockTagsData } from './data'

/**
 * Mock: 获取 Tags 列表
 */
export async function mockGetTags(params?: GetTagsParams): Promise<GetTagsResult> {
  await delay(200)
  
  let filteredTags = [...mockTagsData]
  
  // 按 tenant_id 过滤
  if (params?.tenant_id) {
    filteredTags = filteredTags.filter(tag => tag.tenant_id === params.tenant_id)
  }
  
  // 按 tag_type 过滤
  if (params?.tag_type) {
    filteredTags = filteredTags.filter(tag => tag.tag_type === params.tag_type)
  }
  
  // 按 include_system_tag_types 过滤（默认包含系统预定义 tag_type）
  const includeSystemTagTypes = params?.include_system_tag_types !== false // 默认 true
  if (!includeSystemTagTypes) {
    // System predefined types: alarm_tag, location_tag, family_tag, area_tag
    const systemPredefinedTypes = ['alarm_tag', 'location_tag', 'family_tag', 'area_tag']
    filteredTags = filteredTags.filter(tag => !systemPredefinedTypes.includes(tag.tag_type))
  }
  
  return {
    items: filteredTags,
    total: filteredTags.length,
    // Provide available tag types from server (all available tag types)
    // This avoids hardcoding tag_type values in frontend
    available_tag_types: [
      'alarm_tag',
      'location_tag',
      'family_tag',
      'area_tag',
      'user_tag',
      'custom_tag',
    ],
    // System predefined tag types (cannot be deleted, only SystemAdmin can modify)
    // These are the built-in tag types: alarm_tag, location_tag, family_tag, area_tag
    system_predefined_tag_types: [
      'alarm_tag',
      'location_tag',
      'family_tag',
      'area_tag',
    ],
  }
}

/**
 * Mock: 创建 Tag
 */
export async function mockCreateTag(params: CreateTagParams): Promise<CreateTagResult> {
  await delay(300)
  
  // 检查是否已存在（tag_name 在同一 tenant_id 下全局唯一，跨所有 tag_type）
  const existingTag = mockTagsData.find(
    tag => tag.tenant_id === params.tenant_id && tag.tag_name === params.tag_name
  )
  
  if (existingTag) {
    throw new Error(`Tag name "${params.tag_name}" already exists. Tag names must be unique across all tag types.`)
  }
  
  // tag_type is now required (NOT NULL), default to 'custom_tag' if not provided
  const tagType = params.tag_type || 'custom_tag'
  
  const newTag: TagCatalogItem = {
    tag_id: String(mockTagsData.length + 1),
    tenant_id: params.tenant_id,
    tag_type: tagType,
    tag_name: params.tag_name,
    tag_objects: {},
  }
  
  mockTagsData.push(newTag)
  
  return {
    tag_id: newTag.tag_id,
  }
}

/**
 * Mock: 更新 Tag
 */
export async function mockUpdateTag(tagId: string, params: UpdateTagParams): Promise<{ success: boolean }> {
  await delay(300)
  
  const tag = mockTagsData.find(t => t.tag_id === tagId)
  if (!tag) {
    throw new Error(`Tag with id "${tagId}" not found`)
  }
  
  if (params.tag_name !== undefined) {
    tag.tag_name = params.tag_name
  }
  if (params.tag_type !== undefined) {
    tag.tag_type = params.tag_type || 'custom_tag'
  }
  
  return { success: true }
}

/**
 * Mock: 删除 Tag
 */
export async function mockDeleteTag(params: DeleteTagParams): Promise<{ success: boolean }> {
  await delay(300)
  
  // tag_name 全局唯一，不需要 tag_type
  const tagIndex = mockTagsData.findIndex(
    tag => tag.tenant_id === params.tenant_id && tag.tag_name === params.tag_name
  )
  
  if (tagIndex === -1) {
    throw new Error(`Tag "${params.tag_name}" not found`)
  }
  
  const tag = mockTagsData[tagIndex]
  if (!tag) {
    throw new Error(`Tag "${params.tag_name}" not found`)
  }
  
  // System predefined tag types cannot be deleted (alarm_tag, location_tag, family_tag, area_tag)
  const systemPredefinedTypes = ['alarm_tag', 'location_tag', 'family_tag', 'area_tag']
  if (tag.tag_type && systemPredefinedTypes.includes(tag.tag_type)) {
    throw new Error(`Cannot delete system predefined tag_type: "${params.tag_name}" (type: ${tag.tag_type}). System predefined tag types cannot be deleted because they are used by other tables.`)
  }
  
  // 检查 tag_name 下面是否有对象
  const hasObjects = tag.tag_objects && Object.keys(tag.tag_objects).length > 0
  if (hasObjects) {
    throw new Error(`Cannot delete tag_name "${params.tag_name}" (type: ${tag.tag_type || 'NULL'}) because it still has objects. Please remove all objects first.`)
  }
  
  mockTagsData.splice(tagIndex, 1)
  
  return { success: true }
}

/**
 * Mock: 删除 Tag 中的对象
 */
export async function mockRemoveTagObjects(params: RemoveTagObjectsParams): Promise<{ success: boolean }> {
  await delay(300)
  
  const tag = mockTagsData.find(t => t.tag_id === params.tag_id)
  if (!tag) {
    throw new Error(`Tag with id "${params.tag_id}" not found`)
  }
  
  if (!tag.tag_objects) {
    tag.tag_objects = {}
  }
  
  // 获取该类型的对象列表
  const typeObjects = tag.tag_objects[params.object_type] || {}
  
  // 删除指定的对象
  params.object_ids.forEach(objectId => {
    delete typeObjects[objectId]
  })
  
  // 更新 tag_objects
  if (Object.keys(typeObjects).length === 0) {
    // 如果该类型的对象列表为空，删除该键
    delete tag.tag_objects[params.object_type]
  } else {
    tag.tag_objects[params.object_type] = typeObjects
  }
  
  return { success: true }
}

/**
 * Mock: 删除 Tag Type
 */
export async function mockDeleteTagType(params: DeleteTagTypeParams): Promise<{ success: boolean }> {
  await delay(300)
  
  // 检查 tag_type 是否存在
  const tagsOfType = mockTagsData.filter(
    tag => tag.tenant_id === params.tenant_id && tag.tag_type === params.tag_type
  )
  
  if (tagsOfType.length === 0) {
    throw new Error(`Tag type not found: ${params.tag_type}`)
  }
  
  // Check if it's a system predefined tag_type (cannot be deleted)
  const systemPredefinedTypes = ['alarm_tag', 'location_tag', 'family_tag', 'area_tag']
  if (systemPredefinedTypes.includes(params.tag_type)) {
    throw new Error(`Cannot delete system predefined tag_type: ${params.tag_type}. System predefined tag types cannot be deleted because they are used by other tables.`)
  }
  
  // 检查是否还有 tag_name
  if (tagsOfType.length > 0) {
    throw new Error(`Cannot delete tag_type "${params.tag_type}" because it still has ${tagsOfType.length} tag_name(s). Please delete all tag_names first.`)
  }
  
  // 理论上不会执行到这里（因为如果 tag_type 存在，tagsOfType.length 肯定 > 0）
  return { success: true }
}

/**
 * Mock: 查询对象在哪些 tag 中被使用
 */
export async function mockGetTagsForObject(params: GetTagsForObjectParams): Promise<TagForObject[]> {
  await delay(200)
  
  const result: TagForObject[] = []
  
  // 遍历所有 tags，查找包含该对象的 tag
  for (const tag of mockTagsData) {
    if (tag.tenant_id !== params.tenant_id) {
      continue
    }
    
    if (!tag.tag_objects || !tag.tag_objects[params.object_type]) {
      continue
    }
    
    const typeObjects = tag.tag_objects[params.object_type]
    if (!typeObjects) {
      continue
    }
    const objectName = typeObjects[params.object_id]
    if (objectName && tag.tag_type) {
      result.push({
        tag_id: tag.tag_id,
        tag_type: tag.tag_type, // tag_type is required (NOT NULL)
        tag_name: tag.tag_name,
        object_name_in_tag: objectName,
      })
    }
  }
  
  return result
}

