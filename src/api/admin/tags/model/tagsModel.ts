/**
 * Tags API 数据模型定义
 * 对应 owlRD/db/20_tags_catalog.sql 中的 tags_catalog 表结构
 */

/**
 * Tag 目录项
 */
export interface TagCatalogItem {
  tag_id: string
  tenant_id: string
  tag_type: string | null // Tag 类型：可选，'alarm_tag', 'location_tag', 'family_tag', 'nursestation_tag', 'user_tag', 'caregiver_tag' 或 NULL
  tag_name: string // Tag 名称：必填，在同一 tenant_id 下全局唯一（跨所有 tag_type）
  tag_objects?: Record<string, Record<string, string>> // JSONB 格式：{"resident": {"uuid1": "name1"}, "location": {"uuid2": "name2"}}
  is_system_tag_type: boolean // 是否为系统预定义 tag_type（TRUE 表示系统预定义，不能删除）
}

/**
 * 获取 Tags 列表请求参数
 */
export interface GetTagsParams {
  tenant_id?: string // 租户 ID（可选，如果不提供则使用当前用户的 tenant_id）
  tag_type?: string // Tag 类型过滤（可选）
  include_system_tag_types?: boolean // 是否包含系统预定义 tag_type（默认 true）
}

/**
 * 获取 Tags 列表响应
 */
export interface GetTagsResult {
  items: TagCatalogItem[]
  total: number
}

/**
 * 创建 Tag 请求参数
 */
export interface CreateTagParams {
  tenant_id: string
  tag_type: string | null // Tag 类型：可选，'alarm_tag', 'location_tag', 'family_tag', 'nursestation_tag', 'user_tag', 'caregiver_tag' 或 NULL
  tag_name: string // Tag 名称：必填，在同一 tenant_id 下全局唯一（跨所有 tag_type）
  // 注意：is_system_tag_type 由后端根据 tag_type 自动设置，不能手动指定
}

/**
 * 创建 Tag 响应
 */
export interface CreateTagResult {
  tag_id: string
}

/**
 * 更新 Tag 请求参数
 */
export interface UpdateTagParams {
  tag_name?: string
  tag_type?: string | null // 允许修改 tag_type
  // 注意：is_system_tag_type 不能修改
}

/**
 * 删除 Tag 请求参数
 */
export interface DeleteTagParams {
  tenant_id: string
  tag_name: string // tag_name 全局唯一，不需要 tag_type
}

/**
 * 删除 Tag 中的对象请求参数
 */
export interface RemoveTagObjectsParams {
  tag_id: string
  object_type: string // 对象类型：'resident', 'location', 'user', 'card', 'caregiver_group'
  object_ids: string[] // 要删除的对象 ID 列表
}

/**
 * 删除 Tag Type 请求参数
 */
export interface DeleteTagTypeParams {
  tenant_id: string
  tag_type: string
}

/**
 * 查询对象在哪些 tag 中被使用
 */
export interface GetTagsForObjectParams {
  tenant_id: string
  object_type: string // 对象类型：'resident', 'location', 'user', 'card', 'caregiver_group'
  object_id: string // 对象 ID
}

/**
 * 对象在 tag 中的使用信息
 */
export interface TagForObject {
  tag_id: string
  tag_type: string
  tag_name: string
  object_name_in_tag: string // tag_objects 中存储的对象名称（可能已过期）
  is_system_tag_type: boolean
}

