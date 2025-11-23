/**
 * Role API 数据模型定义
 * 对应 owlRD/db/02_roles.sql 中的 roles 表结构
 */

/**
 * 角色数据模型
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
 * 获取角色列表请求参数
 */
export interface GetRolesParams {
  search?: string // 搜索关键词（可选，用于搜索 role_code 或 display_name 或 description）
}

/**
 * 获取角色列表响应
 */
export interface GetRolesResult {
  items: Role[]
  total: number
}

/**
 * 创建角色请求参数
 */
export interface CreateRoleParams {
  role_code: string
  display_name: string
  description?: string
}

/**
 * 创建角色响应
 */
export interface CreateRoleResult {
  role_id: string
}

/**
 * 更新角色请求参数
 * 用于编辑、删除、禁用操作
 */
export interface UpdateRoleParams {
  display_name?: string // 编辑时使用
  description?: string // 编辑时使用
  is_active?: boolean // 禁用时使用（true：启用，false：禁用）
  _delete?: boolean // 删除时使用（true：删除）
}

