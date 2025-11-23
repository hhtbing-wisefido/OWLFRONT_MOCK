/**
 * Role Permission API 数据模型定义
 * 对应 owlRD/db/21_role_permissions.sql 中的 role_permissions 表结构
 */

/**
 * 权限类型
 */
export type PermissionType = 'read' | 'create' | 'update' | 'delete' | 'manage'

/**
 * 权限范围
 */
export type PermissionScope = 'all' | 'assigned_only' | 'location_tag'

/**
 * 角色权限数据模型
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
 * 获取角色权限列表请求参数
 */
export interface GetRolePermissionsParams {
  role_code?: string // 角色编码（可选，用于过滤特定角色的权限）
  resource_type?: string // 资源类型（可选，用于过滤特定资源的权限）
  permission_type?: PermissionType // 权限类型（可选，用于过滤特定权限类型）
  is_active?: boolean // 是否启用（可选，用于过滤启用/禁用的权限）
}

/**
 * 获取角色权限列表响应
 */
export interface GetRolePermissionsResult {
  items: RolePermission[]
  total: number
}

/**
 * 创建角色权限请求参数
 */
export interface CreateRolePermissionParams {
  role_code: string
  resource_type: string
  permission_type: PermissionType
  scope?: PermissionScope
  is_active?: boolean
}

/**
 * 创建角色权限响应
 */
export interface CreateRolePermissionResult {
  permission_id: string
}

/**
 * 批量创建角色权限请求参数
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
 * 更新角色权限请求参数
 */
export interface UpdateRolePermissionParams {
  scope?: PermissionScope
  is_active?: boolean
}

/**
 * 更新角色权限状态请求参数
 */
export interface UpdateRolePermissionStatusParams {
  is_active: boolean
}

/**
 * 资源类型选项（用于下拉选择）
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
 * 权限类型选项（用于下拉选择）
 */
export const PERMISSION_TYPES: PermissionType[] = ['read', 'create', 'update', 'delete', 'manage']

/**
 * 权限范围选项（用于下拉选择）
 */
export const PERMISSION_SCOPES: PermissionScope[] = ['all', 'assigned_only', 'location_tag']

