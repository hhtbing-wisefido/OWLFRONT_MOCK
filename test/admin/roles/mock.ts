/**
 * Roles API Mock 函数
 * 对应 src/api/admin/role/role.ts
 * 用于开发环境模拟后端 API 响应
 */

import type {
  GetRolesParams,
  GetRolesResult,
  CreateRoleParams,
  CreateRoleResult,
  UpdateRoleParams,
  UpdateRoleStatusParams,
  Role,
} from '@/api/admin/role/model/roleModel'
import { mockRolesData } from './data'
import { delay } from '../../utils/generator'

// 模拟内存存储（用于模拟创建、更新、删除操作）
let rolesStore: Role[] = [...mockRolesData]
let nextRoleId = 12 // 下一个可用的角色ID

/**
 * Mock: 获取角色列表
 * 对应 getRolesApi
 */
export async function mockGetRoles(params?: GetRolesParams): Promise<GetRolesResult> {
  // 模拟网络延迟
  await delay(300)

  let filteredRoles = [...rolesStore]

  // 如果有搜索关键词，进行过滤
  if (params?.search && params.search.trim()) {
    const searchLower = params.search.toLowerCase().trim()
    filteredRoles = rolesStore.filter((role) => {
      return (
        role.role_code.toLowerCase().includes(searchLower) ||
        role.display_name.toLowerCase().includes(searchLower) ||
        (role.description && role.description.toLowerCase().includes(searchLower))
      )
    })
  }

  return {
    items: filteredRoles,
    total: filteredRoles.length,
  }
}

/**
 * Mock: 创建角色
 * 对应 createRoleApi
 */
export async function mockCreateRole(params: CreateRoleParams): Promise<CreateRoleResult> {
  // 模拟网络延迟
  await delay(500)

  // 检查 role_code 是否已存在
  const existingRole = rolesStore.find((r) => r.role_code === params.role_code)
  if (existingRole) {
    throw new Error(`Role code "${params.role_code}" already exists`)
  }

  // 创建新角色
  const newRole: Role = {
    role_id: String(nextRoleId++),
    tenant_id: null, // 新创建的角色默认属于当前租户，这里模拟为 null（系统角色）
    role_code: params.role_code,
    display_name: params.display_name,
    description: params.description || '',
    is_system: false, // 新创建的角色都是自定义角色
    is_active: true, // 默认启用
  }

  rolesStore.push(newRole)

  return {
    role_id: newRole.role_id,
  }
}

/**
 * Mock: 更新角色
 * 对应 updateRoleApi
 */
export async function mockUpdateRole(roleId: string, params: UpdateRoleParams): Promise<void> {
  // 模拟网络延迟
  await delay(500)

  const roleIndex = rolesStore.findIndex((r) => r.role_id === roleId)
  if (roleIndex === -1) {
    throw new Error(`Role with ID "${roleId}" not found`)
  }

  const role = rolesStore[roleIndex]

  // 系统角色不允许修改 role_code
  if (role.is_system) {
    throw new Error('System roles cannot be modified')
  }

  // 更新角色信息
  if (params.display_name !== undefined) {
    rolesStore[roleIndex].display_name = params.display_name
  }
  if (params.description !== undefined) {
    rolesStore[roleIndex].description = params.description
  }
}

/**
 * Mock: 删除角色
 * 对应 deleteRoleApi
 */
export async function mockDeleteRole(roleId: string): Promise<void> {
  // 模拟网络延迟
  await delay(500)

  const roleIndex = rolesStore.findIndex((r) => r.role_id === roleId)
  if (roleIndex === -1) {
    throw new Error(`Role with ID "${roleId}" not found`)
  }

  const role = rolesStore[roleIndex]

  // 系统角色不允许删除
  if (role.is_system) {
    throw new Error('System roles cannot be deleted')
  }

  // 删除角色
  rolesStore.splice(roleIndex, 1)
}

/**
 * Mock: 更新角色状态（启用/禁用）
 * 对应 changeRoleStatusApi
 */
export async function mockChangeRoleStatus(
  roleId: string,
  params: UpdateRoleStatusParams,
): Promise<void> {
  // 模拟网络延迟
  await delay(500)

  const roleIndex = rolesStore.findIndex((r) => r.role_id === roleId)
  if (roleIndex === -1) {
    throw new Error(`Role with ID "${roleId}" not found`)
  }

  // 更新角色状态
  rolesStore[roleIndex].is_active = params.is_active
}

