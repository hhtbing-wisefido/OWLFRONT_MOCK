/**
 * Tags API data model definition
 * Corresponds to tags_catalog table structure in owlRD/db/20_tags_catalog.sql
 */

/**
 * Tag catalog item
 */
export interface TagCatalogItem {
  tag_id: string
  tenant_id: string
  tag_type: string | null // Tag type: optional, 'alarm_tag', 'location_tag', 'family_tag', 'nursestation_tag', 'user_tag', 'caregiver_tag' or NULL
  tag_name: string // Tag name: required, globally unique within same tenant_id (across all tag_type)
  tag_objects?: Record<string, Record<string, string>> // JSONB format: {"resident": {"uuid1": "name1"}, "location": {"uuid2": "name2"}}
  is_system_tag_type: boolean // Whether it's a system predefined tag_type (TRUE means system predefined, cannot be deleted)
}

/**
 * Get Tags list request parameters
 */
export interface GetTagsParams {
  tenant_id?: string // Tenant ID (optional, if not provided, use current user's tenant_id)
  tag_type?: string // Tag type filter (optional)
  include_system_tag_types?: boolean // Whether to include system predefined tag_type (default true)
}

/**
 * Get Tags list response
 */
export interface GetTagsResult {
  items: TagCatalogItem[]
  total: number
}

/**
 * Create Tag request parameters
 */
export interface CreateTagParams {
  tenant_id: string
  tag_type: string | null // Tag type: optional, 'alarm_tag', 'location_tag', 'family_tag', 'nursestation_tag', 'user_tag', 'caregiver_tag' or NULL
  tag_name: string // Tag name: required, globally unique within same tenant_id (across all tag_type)
  // Note: is_system_tag_type is automatically set by backend based on tag_type, cannot be manually specified
}

/**
 * Create Tag response
 */
export interface CreateTagResult {
  tag_id: string
}

/**
 * Update Tag request parameters
 */
export interface UpdateTagParams {
  tag_name?: string
  tag_type?: string | null // Allow modifying tag_type
  // Note: is_system_tag_type cannot be modified
}

/**
 * Delete Tag request parameters
 */
export interface DeleteTagParams {
  tenant_id: string
  tag_name: string // tag_name is globally unique, tag_type not needed
}

/**
 * Remove objects from Tag request parameters
 */
export interface RemoveTagObjectsParams {
  tag_id: string
  object_type: string // Object type: 'resident', 'location', 'user', 'card', 'caregiver_group'
  object_ids: string[] // List of object IDs to remove
}

/**
 * Delete Tag Type request parameters
 */
export interface DeleteTagTypeParams {
  tenant_id: string
  tag_type: string
}

/**
 * Query which tags an object is used in
 */
export interface GetTagsForObjectParams {
  tenant_id: string
  object_type: string // Object type: 'resident', 'location', 'user', 'card', 'caregiver_group'
  object_id: string // Object ID
}

/**
 * Object usage information in tag
 */
export interface TagForObject {
  tag_id: string
  tag_type: string
  tag_name: string
  object_name_in_tag: string // Object name stored in tag_objects (may be outdated)
  is_system_tag_type: boolean
}

