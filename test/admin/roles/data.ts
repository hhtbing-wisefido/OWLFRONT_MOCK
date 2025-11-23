/**
 * Roles 测试数据
 * 对应 src/views/admin/roles/RoleList.vue 和 src/api/admin/role/role.ts
 */

import type { Role } from '@/api/admin/role/model/roleModel'

/**
 * 预置系统角色数据
 * 与 owlRD/db/02_roles.sql 中的 INSERT 语句保持一致
 * 注意：数据库表中没有 display_name_cn 和 priority 字段
 */
export const mockRolesData: Role[] = [
  {
    role_id: '1',
    tenant_id: null,
    role_code: 'Admin',
    display_name: 'System Administrator',
    description: 'System Administrator: Has full permissions (read, create, update, delete) on all tables and resources. Can manage all tenant data, users, devices, configurations, etc.',
    is_system: true,
    is_active: true,
  },
  {
    role_id: '2',
    tenant_id: null,
    role_code: 'Director',
    display_name: 'Executive Director / Facility Director',
    description: 'Executive Director / Facility Director: Responsible for overall facility operations management. Can view and manage all business data, users, residents, device configurations, etc.',
    is_system: false,
    is_active: true,
  },
  {
    role_id: '3',
    tenant_id: null,
    role_code: 'DON',
    display_name: 'DON (Director of Nursing)',
    description: 'Director of Nursing (DON): Responsible for nursing team management. Can manage residents, care levels, alarm policies, IoT monitoring alarms, event records, etc.',
    is_system: false,
    is_active: true,
  },
  {
    role_id: '4',
    tenant_id: null,
    role_code: 'NurseManager',
    display_name: 'Nurse Manager',
    description: 'Nurse Manager: Responsible for nursing team management. Can manage residents, care levels, alarm policies, IoT monitoring alarms, event records, etc. (Legacy name, equivalent to DON)',
    is_system: false,
    is_active: true,
  },
  {
    role_id: '5',
    tenant_id: null,
    role_code: 'CM',
    display_name: 'CM (Care Manager / Case Manager)',
    description: 'Care Manager / Case Manager (CM): Responsible for care plan development and case management. Can manage residents, care levels, alarm policies, IoT monitoring alarms, event records, etc.',
    is_system: false,
    is_active: true,
  },
  {
    role_id: '6',
    tenant_id: null,
    role_code: 'CS',
    display_name: 'CS (Clinical Supervisor)',
    description: 'Clinical Supervisor (CS): Responsible for clinical supervision and guidance. Can manage residents, view alarm policies, etc.',
    is_system: false,
    is_active: true,
  },
  {
    role_id: '7',
    tenant_id: null,
    role_code: 'CO',
    display_name: 'CO (Compliance Officer)',
    description: 'Compliance Officer (CO): Responsible for compliance management and auditing. Can manage roles and users, view all data.',
    is_system: false,
    is_active: true,
  },
  {
    role_id: '8',
    tenant_id: null,
    role_code: 'Nurse',
    display_name: 'Nurse',
    description: 'Nurse: Responsible for daily nursing work, can perform clinical interventions. Can view and manage assigned residents, care levels, alarm policies, IoT monitoring alarms, event records, etc.',
    is_system: false,
    is_active: true,
  },
  {
    role_id: '9',
    tenant_id: null,
    role_code: 'Caregiver',
    display_name: 'Caregiver',
    description: 'Caregiver: Responsible for daily care work, can perform basic first aid (CPR). Can view assigned resident information, record events and incidents (HomeCare mode).',
    is_system: false,
    is_active: true,
  },
  {
    role_id: '10',
    tenant_id: null,
    role_code: 'IT',
    display_name: 'IT (IT Support)',
    description: 'IT Support: Responsible for IoT device installation, inventory, Layout management, user account management, and other technical maintenance work.',
    is_system: false,
    is_active: true,
  },
  {
    role_id: '11',
    tenant_id: null,
    role_code: 'SocialWork',
    display_name: 'Social Worker',
    description: 'Social Worker: Responsible for providing social services, coordinating family relationships, managing family contacts, etc.',
    is_system: false,
    is_active: true,
  },
]

