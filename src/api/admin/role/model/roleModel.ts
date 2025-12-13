/**
 * Role API data model definition
 * Corresponds to roles table structure in owlRD/db/02_roles.sql
 */

/**
 * Role data model
 */
export interface Role {
  role_id: string
  tenant_id?: string | null
  role_code: string
  display_name: string
  description?: string
  is_system: boolean
  is_active: boolean
}

/**
 * Get role list request parameters
 */
export interface GetRolesParams {
  search?: string // Search keyword (optional, for searching role_code, display_name, or description)
}

/**
 * Get role list response
 */
export interface GetRolesResult {
  items: Role[]
  total: number
}

/**
 * Create role request parameters
 */
export interface CreateRoleParams {
  role_code: string
  display_name: string
  description?: string
}

/**
 * Create role response
 */
export interface CreateRoleResult {
  role_id: string
}

/**
 * Update role request parameters
 * Used for edit, delete, disable operations
 */
export interface UpdateRoleParams {
  display_name?: string // Used when editing
  description?: string // Used when editing
  is_active?: boolean // Used when disabling (true: enable, false: disable)
  _delete?: boolean // Used when deleting (true: delete)
}

/**
 * Update role status request parameters (enable/disable)
 * Used by: PUT /admin/api/v1/roles/:id/status
 */
export interface UpdateRoleStatusParams {
  is_active: boolean
}

