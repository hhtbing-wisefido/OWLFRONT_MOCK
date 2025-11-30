/**
 * Role Permission API data model definition
 * Corresponds to role_permissions table structure in owlRD/db/21_role_permissions.sql
 */

/**
 * Permission type
 */
export type PermissionType = 'read' | 'create' | 'update' | 'delete' | 'manage'

/**
 * Permission scope
 */
export type PermissionScope = 'all' | 'assigned_only' | 'location_tag'

/**
 * Role permission data model
 */
export interface RolePermission {
  permission_id: string
  role_code: string
  resource_type: string
  permission_type: PermissionType
  scope: PermissionScope
  is_active: boolean
  created_at?: string
  updated_at?: string
}

/**
 * Get role permission list request parameters
 */
export interface GetRolePermissionsParams {
  role_code?: string // Role code (optional, for filtering permissions of specific role)
  resource_type?: string // Resource type (optional, for filtering permissions of specific resource)
  permission_type?: PermissionType // Permission type (optional, for filtering specific permission type)
  is_active?: boolean // Whether enabled (optional, for filtering enabled/disabled permissions)
}

/**
 * Get role permission list response
 */
export interface GetRolePermissionsResult {
  items: RolePermission[]
  total: number
}

/**
 * Create role permission request parameters
 */
export interface CreateRolePermissionParams {
  role_code: string
  resource_type: string
  permission_type: PermissionType
  scope?: PermissionScope
  is_active?: boolean
}

/**
 * Create role permission response
 */
export interface CreateRolePermissionResult {
  permission_id: string
}

/**
 * Batch create role permissions request parameters
 */
export interface BatchCreateRolePermissionsParams {
  role_code: string
  permissions: Array<{
    resource_type: string
    permission_type: PermissionType
    scope?: PermissionScope
    is_active?: boolean
  }>
}

/**
 * Update role permission request parameters
 */
export interface UpdateRolePermissionParams {
  scope?: PermissionScope
  is_active?: boolean
}

/**
 * Update role permission status request parameters
 */
export interface UpdateRolePermissionStatusParams {
  is_active: boolean
}

/**
 * Resource type options (for dropdown selection)
 */
export const RESOURCE_TYPES = [
  'vital_monitor',
  'roles',
  'role_permissions',
  'tenants',
  'users',
  'locations',
  'rooms',
  'beds',
  'residents',
  'resident_phi',
  'resident_contacts',
  'resident_caregivers',
  'devices',
  'device_store',
  'iot_timeseries',
  'iot_monitor_alarms',
  'cloud_alarm_policies',
  'config_versions',
  'service_levels',
  'color_tags',
  'tags_catalog',
  'cards',
  'event_mapping',
  'posture_mapping',
  'alarm_events',
  'rounds',
  'round_details',
] as const

/**
 * Permission type options (for dropdown selection)
 */
export const PERMISSION_TYPES: PermissionType[] = ['read', 'create', 'update', 'delete', 'manage']

/**
 * Permission scope options (for dropdown selection)
 */
export const PERMISSION_SCOPES: PermissionScope[] = ['all', 'assigned_only', 'location_tag']

/**
 * Get resource types response
 */
export interface GetResourceTypesResult {
  resource_types: string[]
}

