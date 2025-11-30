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
  tag_type: string // Tag type: required, 'alarm_tag', 'location_tag', 'family_tag', 'area_tag', 'user_tag', 'custom_tag'
  tag_name: string // Tag name: required, globally unique within same tenant_id (across all tag_type)
  tag_objects?: Record<string, Record<string, string>> // JSONB format: {"resident": {"uuid1": "name1"}, "location": {"uuid2": "name2"}}
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
  // Available tag types (system predefined types that can be used)
  // This list is provided by the server to avoid hardcoding in frontend
  available_tag_types?: string[] // Optional: list of all available tag_type values (e.g., ['alarm_tag', 'location_tag', 'family_tag', 'area_tag', 'user_tag', 'custom_tag'])
  // System predefined tag types (cannot be deleted, only SystemAdmin can modify)
  // These are the built-in tag types: alarm_tag, location_tag, family_tag, area_tag
  system_predefined_tag_types?: string[] // Optional: list of system predefined tag_type values that cannot be deleted (e.g., ['alarm_tag', 'location_tag', 'family_tag', 'area_tag'])
}

/**
 * Create Tag request parameters
 */
export interface CreateTagParams {
  tenant_id: string
  tag_type: string | null // Tag type: optional, defaults to 'custom_tag' for non-SystemAdmin users. Only SystemAdmin can specify other tag_type values
  tag_name: string // Tag name: required, globally unique within same tenant_id (across all tag_type)
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
  tag_type?: string | null // Allow modifying tag_type (only SystemAdmin can modify)
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
}

