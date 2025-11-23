/**
 * Role Permissions API Mock 函数
 * 对应 src/api/admin/role-permission/rolePermission.ts
 * 用于开发环境模拟后端 API 响应
 */

import type {
  GetRolePermissionsParams,
  GetRolePermissionsResult,
  CreateRolePermissionParams,
  CreateRolePermissionResult,
  BatchCreateRolePermissionsParams,
  UpdateRolePermissionParams,
  UpdateRolePermissionStatusParams,
  RolePermission,
} from '@/api/admin/role-permission/model/rolePermissionModel'
import { mockRolePermissionsData } from './data'
import { delay } from '../../utils/generator'

// 模拟内存存储（用于模拟创建、更新、删除操作）
// 初始化时确保数据已加载
let permissionsStore: RolePermission[] = []
let nextPermissionId = 200 // 默认起始ID

// 初始化权限存储
function initializePermissionsStore() {
  if (permissionsStore.length === 0 && mockRolePermissionsData.length > 0) {
    permissionsStore = [...mockRolePermissionsData]
    // 计算下一个可用的权限ID（基于现有数据的最大ID + 1）
    const maxId = Math.max(...mockRolePermissionsData.map(p => {
      const id = parseInt(p.permission_id)
      return isNaN(id) ? 0 : id
    }), 0)
    nextPermissionId = maxId + 1
    console.log('[Mock] Initialized permissionsStore with', permissionsStore.length, 'permissions')
    console.log('[Mock] Next permission ID will be:', nextPermissionId)
  }
}

// 立即初始化
initializePermissionsStore()

/**
 * Mock: 获取角色权限列表
 * 对应 getRolePermissionsApi
 */
export async function mockGetRolePermissions(
  params?: GetRolePermissionsParams,
): Promise<GetRolePermissionsResult> {
  // 确保权限存储已初始化
  initializePermissionsStore()
  
  // 模拟网络延迟
  await delay(300)

  let filteredPermissions = [...permissionsStore]
  
  // 调试日志
  console.log('[Mock] mockGetRolePermissions - permissionsStore length:', permissionsStore.length)
  console.log('[Mock] mockGetRolePermissions - mockRolePermissionsData length:', mockRolePermissionsData.length)
  console.log('[Mock] mockGetRolePermissions - params:', params)

  // 根据参数过滤
  if (params?.role_code) {
    filteredPermissions = filteredPermissions.filter((p) => p.role_code === params.role_code)
  }
  if (params?.resource_type) {
    filteredPermissions = filteredPermissions.filter(
      (p) => p.resource_type === params.resource_type,
    )
  }
  if (params?.permission_type) {
    filteredPermissions = filteredPermissions.filter(
      (p) => p.permission_type === params.permission_type,
    )
  }
  if (params?.is_active !== undefined) {
    filteredPermissions = filteredPermissions.filter((p) => p.is_active === params.is_active)
  }

  return {
    items: filteredPermissions,
    total: filteredPermissions.length,
  }
}

/**
 * Mock: 创建角色权限
 * 对应 createRolePermissionApi
 */
export async function mockCreateRolePermission(
  params: CreateRolePermissionParams,
): Promise<CreateRolePermissionResult> {
  // 模拟网络延迟
  await delay(500)

  // 检查是否已存在（唯一约束：role_code + resource_type + permission_type）
  const existing = permissionsStore.find(
    (p) =>
      p.role_code === params.role_code &&
      p.resource_type === params.resource_type &&
      p.permission_type === params.permission_type,
  )
  if (existing) {
    throw new Error(
      `Permission already exists for role "${params.role_code}" on resource "${params.resource_type}" with type "${params.permission_type}"`,
    )
  }

  // 创建新权限
  const newPermission: RolePermission = {
    permission_id: String(nextPermissionId++),
    role_code: params.role_code,
    resource_type: params.resource_type,
    permission_type: params.permission_type,
    scope: params.scope || 'all',
    is_active: params.is_active !== undefined ? params.is_active : true,
  }

  permissionsStore.push(newPermission)

  return {
    permission_id: newPermission.permission_id,
  }
}

/**
 * Mock: 批量创建角色权限
 * 对应 batchCreateRolePermissionsApi
 */
export async function mockBatchCreateRolePermissions(
  params: BatchCreateRolePermissionsParams,
): Promise<{ success_count: number; failed_count: number }> {
  // 模拟网络延迟
  await delay(800)

  let successCount = 0
  let failedCount = 0

  for (const perm of params.permissions) {
    try {
      // 检查是否已存在
      const existing = permissionsStore.find(
        (p) =>
          p.role_code === params.role_code &&
          p.resource_type === perm.resource_type &&
          p.permission_type === perm.permission_type,
      )
      if (existing) {
        failedCount++
        continue
      }

      // 创建新权限
      const newPermission: RolePermission = {
        permission_id: String(nextPermissionId++),
        role_code: params.role_code,
        resource_type: perm.resource_type,
        permission_type: perm.permission_type,
        scope: perm.scope || 'all',
        is_active: perm.is_active !== undefined ? perm.is_active : true,
      }

      permissionsStore.push(newPermission)
      successCount++
    } catch (error) {
      failedCount++
    }
  }

  return {
    success_count: successCount,
    failed_count: failedCount,
  }
}

/**
 * Mock: 更新角色权限
 * 对应 updateRolePermissionApi
 */
export async function mockUpdateRolePermission(
  permissionId: string,
  params: UpdateRolePermissionParams,
): Promise<void> {
  // 模拟网络延迟
  await delay(500)

  const permissionIndex = permissionsStore.findIndex((p) => p.permission_id === permissionId)
  if (permissionIndex === -1) {
    throw new Error(`Permission with ID "${permissionId}" not found`)
  }

  // 更新权限信息
  if (params.scope !== undefined) {
    permissionsStore[permissionIndex].scope = params.scope
  }
  if (params.is_active !== undefined) {
    permissionsStore[permissionIndex].is_active = params.is_active
  }
}

/**
 * Mock: 删除角色权限
 * 对应 deleteRolePermissionApi
 */
export async function mockDeleteRolePermission(permissionId: string): Promise<void> {
  // 模拟网络延迟
  await delay(500)

  const permissionIndex = permissionsStore.findIndex((p) => p.permission_id === permissionId)
  if (permissionIndex === -1) {
    throw new Error(`Permission with ID "${permissionId}" not found`)
  }

  // 删除权限
  permissionsStore.splice(permissionIndex, 1)
}

/**
 * Mock: 更新角色权限状态（启用/禁用）
 * 对应 changeRolePermissionStatusApi
 */
export async function mockChangeRolePermissionStatus(
  permissionId: string,
  params: UpdateRolePermissionStatusParams,
): Promise<void> {
  // 模拟网络延迟
  await delay(500)

  const permissionIndex = permissionsStore.findIndex((p) => p.permission_id === permissionId)
  if (permissionIndex === -1) {
    throw new Error(`Permission with ID "${permissionId}" not found`)
  }

  // 更新权限状态
  permissionsStore[permissionIndex].is_active = params.is_active
}

