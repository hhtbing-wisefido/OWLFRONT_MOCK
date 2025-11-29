/**
 * Roles 测试数据
 * 对应 src/views/admin/roles/RoleList.vue 和 src/api/admin/role/role.ts
 * 
 * 注意：角色已更新为简化版本，与 owlRD/db/02_roles.sql 保持一致
 * - 系统内置角色（is_system: true, tenant_id: null）：仅 SystemAdmin 可以全局修改
 * - 租户自定义角色（is_system: false, tenant_id IS NOT NULL）：租户可以创建、修改、删除
 */

import type { Role } from '@/api/admin/role/model/roleModel'

/**
 * 预置系统角色数据
 * 与 owlRD/db/02_roles.sql 中的 INSERT 语句保持一致
 * 注意：数据库表中只有 description 字段，没有 display_name 字段
 * 前端使用 display_name 作为 description 的显示名称
 */
export const mockRolesData: Role[] = [
  {
    role_id: '1',
    tenant_id: null,
    role_code: 'SystemAdmin',
    display_name: 'System Administrator (Cross-Tenant)',
    description: 'System Administrator (Cross-Tenant)',
    is_system: true,
    is_active: true,
  },
  {
    role_id: '2',
    tenant_id: null,
    role_code: 'Admin',
    display_name: 'Tenant Administrator',
    description: 'Tenant Administrator',
    is_system: true,
    is_active: true,
  },
  {
    role_id: '3',
    tenant_id: null,
    role_code: 'Manager',
    display_name: 'Executive Director / Facility Director',
    description: 'Executive Director / Facility Director',
    is_system: true,
    is_active: true,
  },
  {
    role_id: '4',
    tenant_id: null,
    role_code: 'IT',
    display_name: 'IT Support',
    description: 'IT Support',
    is_system: true,
    is_active: true,
  },
  {
    role_id: '5',
    tenant_id: null,
    role_code: 'Nurse',
    display_name: 'Nurse',
    description: 'Nurse',
    is_system: true,
    is_active: true,
  },
  {
    role_id: '6',
    tenant_id: null,
    role_code: 'Caregiver',
    display_name: 'Caregiver',
    description: 'Caregiver',
    is_system: true,
    is_active: true,
  },
  {
    role_id: '7',
    tenant_id: null,
    role_code: 'Resident',
    display_name: 'Resident',
    description: 'Resident',
    is_system: true,
    is_active: true,
  },
  {
    role_id: '8',
    tenant_id: null,
    role_code: 'Family',
    display_name: 'Family',
    description: 'Family',
    is_system: true,
    is_active: true,
  },
]

