/**
 * Role Permission 测试数据
 * 对应 owlRD/db/21_role_permissions.sql 中的预置权限配置
 */

import type { RolePermission } from '@/api/admin/role-permission/model/rolePermissionModel'

/**
 * 角色定义（每个角色单独列出）
 * 与 owlRD/db/02_roles.sql 保持一致，使用新的简化角色系统
 */
export const ROLES = [
  {
    code: 'SystemAdmin',
    name: 'System Administrator',
    description: 'System Administrator (Cross-Tenant)',
    mainFunction: 'Manage system-level resources, business data read-only',
  },
  {
    code: 'Admin',
    name: 'Administrator',
    description: 'Administrator',
    mainFunction: 'Full resource management permissions within tenant',
  },
  {
    code: 'Manager',
    name: 'Manager',
    description: 'Executive Director / Facility Director',
    mainFunction: 'Business management: Staff, Unit, Resident manager, Device, Alarm setting',
  },
  {
    code: 'IT',
    name: 'IT Support',
    description: 'IT Support',
    mainFunction: 'Device management, Layout management, user account management, device configuration',
  },
  {
    code: 'Nurse',
    name: 'Nurse',
    description: 'Nurse',
    mainFunction: 'View assigned residents monitor, handle alarm event, set special alarm',
  },
  {
    code: 'Caregiver',
    name: 'Caregiver',
    description: 'Caregiver',
    mainFunction: 'View assigned residents monitor, handle alarm event, set special alarm',
  },
  {
    code: 'Resident',
    name: 'Resident',
    description: 'Resident',
    mainFunction: 'View self wellness & safety, authorize emergency contact, special environment: handle self alarm event',
  },
  {
    code: 'Family',
    name: 'Family',
    description: 'Family',
    mainFunction: 'View family member\'s wellness & safety info, alarm info, special environment: handle alarm event',
  },
] as const

/**
 * 权限数据（根据权限表设置）
 */
export const mockRolePermissionsData: RolePermission[] = [
  // ========== Admin（超级管理员）==========
  { permission_id: '0', role_code: 'Admin', resource_type: 'vital_monitor', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-1', role_code: 'Admin', resource_type: 'roles', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-1-1', role_code: 'Admin', resource_type: 'role_permissions', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-2', role_code: 'Admin', resource_type: 'users', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-3', role_code: 'Admin', resource_type: 'residents', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-4', role_code: 'Admin', resource_type: 'resident_phi', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-5', role_code: 'Admin', resource_type: 'resident_contacts', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-6', role_code: 'Admin', resource_type: 'resident_caregivers', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-7', role_code: 'Admin', resource_type: 'cloud_alarm_policies', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-8', role_code: 'Admin', resource_type: 'iot_monitor_alarms', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-9', role_code: 'Admin', resource_type: 'service_levels', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-10', role_code: 'Admin', resource_type: 'alarm_events', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-11', role_code: 'Admin', resource_type: 'rounds', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-12', role_code: 'Admin', resource_type: 'locations', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-13', role_code: 'Admin', resource_type: 'rooms', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-14', role_code: 'Admin', resource_type: 'beds', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '0-15', role_code: 'Admin', resource_type: 'devices', permission_type: 'manage', scope: 'all', is_active: true },

  // ========== Director（院长）==========
  { permission_id: '1', role_code: 'Director', resource_type: 'vital_monitor', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '1-1', role_code: 'Director', resource_type: 'roles', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '1-1-1', role_code: 'Director', resource_type: 'role_permissions', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '2', role_code: 'Director', resource_type: 'users', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '3', role_code: 'Director', resource_type: 'residents', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '4', role_code: 'Director', resource_type: 'resident_phi', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '5', role_code: 'Director', resource_type: 'resident_contacts', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '6', role_code: 'Director', resource_type: 'resident_caregivers', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '7', role_code: 'Director', resource_type: 'cloud_alarm_policies', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '8', role_code: 'Director', resource_type: 'iot_monitor_alarms', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '9', role_code: 'Director', resource_type: 'service_levels', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '10', role_code: 'Director', resource_type: 'alarm_events', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '11', role_code: 'Director', resource_type: 'rounds', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '12', role_code: 'Director', resource_type: 'locations', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '13', role_code: 'Director', resource_type: 'rooms', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '14', role_code: 'Director', resource_type: 'beds', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '15', role_code: 'Director', resource_type: 'devices', permission_type: 'manage', scope: 'all', is_active: true },

  // ========== DON（护士长）==========
  { permission_id: '16', role_code: 'DON', resource_type: 'vital_monitor', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '16-1', role_code: 'DON', resource_type: 'roles', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '16-2', role_code: 'DON', resource_type: 'role_permissions', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '17', role_code: 'DON', resource_type: 'users', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '18', role_code: 'DON', resource_type: 'residents', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '19', role_code: 'DON', resource_type: 'resident_phi', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '20', role_code: 'DON', resource_type: 'resident_contacts', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '21', role_code: 'DON', resource_type: 'resident_caregivers', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '22', role_code: 'DON', resource_type: 'cloud_alarm_policies', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '23', role_code: 'DON', resource_type: 'iot_monitor_alarms', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '24', role_code: 'DON', resource_type: 'service_levels', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '25', role_code: 'DON', resource_type: 'alarm_events', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '26', role_code: 'DON', resource_type: 'rounds', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '27', role_code: 'DON', resource_type: 'locations', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '28', role_code: 'DON', resource_type: 'rooms', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '29', role_code: 'DON', resource_type: 'beds', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '30', role_code: 'DON', resource_type: 'devices', permission_type: 'manage', scope: 'all', is_active: true },

  // ========== CM（护理主管）==========
  { permission_id: '31', role_code: 'CM', resource_type: 'vital_monitor', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '32', role_code: 'CM', resource_type: 'users', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '33', role_code: 'CM', resource_type: 'residents', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '34', role_code: 'CM', resource_type: 'resident_phi', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '35', role_code: 'CM', resource_type: 'resident_contacts', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '36', role_code: 'CM', resource_type: 'resident_caregivers', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '37', role_code: 'CM', resource_type: 'cloud_alarm_policies', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '38', role_code: 'CM', resource_type: 'iot_monitor_alarms', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '39', role_code: 'CM', resource_type: 'service_levels', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '40', role_code: 'CM', resource_type: 'alarm_events', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '41', role_code: 'CM', resource_type: 'rounds', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '42', role_code: 'CM', resource_type: 'locations', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '43', role_code: 'CM', resource_type: 'locations', permission_type: 'update', scope: 'all', is_active: true },
  { permission_id: '44', role_code: 'CM', resource_type: 'rooms', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '45', role_code: 'CM', resource_type: 'rooms', permission_type: 'update', scope: 'all', is_active: true },
  { permission_id: '46', role_code: 'CM', resource_type: 'beds', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '47', role_code: 'CM', resource_type: 'beds', permission_type: 'update', scope: 'all', is_active: true },
  { permission_id: '48', role_code: 'CM', resource_type: 'devices', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '49', role_code: 'CM', resource_type: 'devices', permission_type: 'update', scope: 'all', is_active: true },

  // ========== CS（临床主管）==========
  { permission_id: '50', role_code: 'CS', resource_type: 'vital_monitor', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '51', role_code: 'CS', resource_type: 'residents', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '52', role_code: 'CS', resource_type: 'resident_phi', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '53', role_code: 'CS', resource_type: 'resident_contacts', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '54', role_code: 'CS', resource_type: 'resident_caregivers', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '55', role_code: 'CS', resource_type: 'cloud_alarm_policies', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '56', role_code: 'CS', resource_type: 'iot_monitor_alarms', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '57', role_code: 'CS', resource_type: 'service_levels', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '58', role_code: 'CS', resource_type: 'alarm_events', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '59', role_code: 'CS', resource_type: 'rounds', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '60', role_code: 'CS', resource_type: 'locations', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '61', role_code: 'CS', resource_type: 'locations', permission_type: 'update', scope: 'all', is_active: true },
  { permission_id: '62', role_code: 'CS', resource_type: 'rooms', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '63', role_code: 'CS', resource_type: 'beds', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '64', role_code: 'CS', resource_type: 'devices', permission_type: 'read', scope: 'all', is_active: true },

  // ========== CO（合规官）==========
  { permission_id: '65', role_code: 'CO', resource_type: 'vital_monitor', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '66', role_code: 'CO', resource_type: 'roles', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '66-1', role_code: 'CO', resource_type: 'role_permissions', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '67', role_code: 'CO', resource_type: 'users', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '68', role_code: 'CO', resource_type: 'residents', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '69', role_code: 'CO', resource_type: 'resident_phi', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '70', role_code: 'CO', resource_type: 'resident_contacts', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '71', role_code: 'CO', resource_type: 'resident_caregivers', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '72', role_code: 'CO', resource_type: 'cloud_alarm_policies', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '73', role_code: 'CO', resource_type: 'iot_monitor_alarms', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '74', role_code: 'CO', resource_type: 'service_levels', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '75', role_code: 'CO', resource_type: 'alarm_events', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '76', role_code: 'CO', resource_type: 'rounds', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '77', role_code: 'CO', resource_type: 'locations', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '78', role_code: 'CO', resource_type: 'rooms', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '79', role_code: 'CO', resource_type: 'beds', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '80', role_code: 'CO', resource_type: 'devices', permission_type: 'read', scope: 'all', is_active: true },

  // ========== IT（IT支持）==========
  // IT 没有 vital_monitor 权限（根据权限表）
  { permission_id: '82', role_code: 'IT', resource_type: 'roles', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '82-1', role_code: 'IT', resource_type: 'role_permissions', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '83', role_code: 'IT', resource_type: 'users', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '84', role_code: 'IT', resource_type: 'residents', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '85', role_code: 'IT', resource_type: 'resident_caregivers', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '86', role_code: 'IT', resource_type: 'devices', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '87', role_code: 'IT', resource_type: 'locations', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '88', role_code: 'IT', resource_type: 'rooms', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '89', role_code: 'IT', resource_type: 'beds', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: '90', role_code: 'IT', resource_type: 'iot_monitor_alarms', permission_type: 'manage', scope: 'all', is_active: true },

  // ========== Nurse（护士）==========
  { permission_id: '91', role_code: 'Nurse', resource_type: 'vital_monitor', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '92', role_code: 'Nurse', resource_type: 'residents', permission_type: 'manage', scope: 'assigned_only', is_active: true },
  { permission_id: '93', role_code: 'Nurse', resource_type: 'resident_phi', permission_type: 'manage', scope: 'assigned_only', is_active: true },
  { permission_id: '94', role_code: 'Nurse', resource_type: 'resident_contacts', permission_type: 'manage', scope: 'assigned_only', is_active: true },
  { permission_id: '95', role_code: 'Nurse', resource_type: 'resident_caregivers', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '96', role_code: 'Nurse', resource_type: 'cloud_alarm_policies', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '97', role_code: 'Nurse', resource_type: 'iot_monitor_alarms', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '98', role_code: 'Nurse', resource_type: 'iot_monitor_alarms', permission_type: 'manage', scope: 'assigned_only', is_active: true },
  { permission_id: '99', role_code: 'Nurse', resource_type: 'service_levels', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '100', role_code: 'Nurse', resource_type: 'alarm_events', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: '101', role_code: 'Nurse', resource_type: 'alarm_events', permission_type: 'update', scope: 'assigned_only', is_active: true },
  { permission_id: '102', role_code: 'Nurse', resource_type: 'rounds', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: '103', role_code: 'Nurse', resource_type: 'rounds', permission_type: 'create', scope: 'assigned_only', is_active: true },
  { permission_id: '104', role_code: 'Nurse', resource_type: 'rounds', permission_type: 'update', scope: 'assigned_only', is_active: true },
  { permission_id: '105', role_code: 'Nurse', resource_type: 'locations', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '106', role_code: 'Nurse', resource_type: 'rooms', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '107', role_code: 'Nurse', resource_type: 'beds', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '108', role_code: 'Nurse', resource_type: 'devices', permission_type: 'read', scope: 'all', is_active: true },

  // ========== Caregiver（护工）==========
  { permission_id: '109', role_code: 'Caregiver', resource_type: 'vital_monitor', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '110', role_code: 'Caregiver', resource_type: 'residents', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: '111', role_code: 'Caregiver', resource_type: 'resident_phi', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: '112', role_code: 'Caregiver', resource_type: 'resident_contacts', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: '113', role_code: 'Caregiver', resource_type: 'resident_caregivers', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '114', role_code: 'Caregiver', resource_type: 'cloud_alarm_policies', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '115', role_code: 'Caregiver', resource_type: 'iot_monitor_alarms', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '116', role_code: 'Caregiver', resource_type: 'iot_monitor_alarms', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: '117', role_code: 'Caregiver', resource_type: 'service_levels', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '118', role_code: 'Caregiver', resource_type: 'alarm_events', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: '119', role_code: 'Caregiver', resource_type: 'alarm_events', permission_type: 'update', scope: 'assigned_only', is_active: true },
  { permission_id: '120', role_code: 'Caregiver', resource_type: 'rounds', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: '121', role_code: 'Caregiver', resource_type: 'rounds', permission_type: 'create', scope: 'assigned_only', is_active: true },
  { permission_id: '122', role_code: 'Caregiver', resource_type: 'rounds', permission_type: 'update', scope: 'assigned_only', is_active: true },
  { permission_id: '123', role_code: 'Caregiver', resource_type: 'locations', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: '124', role_code: 'Caregiver', resource_type: 'rooms', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '125', role_code: 'Caregiver', resource_type: 'beds', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '126', role_code: 'Caregiver', resource_type: 'devices', permission_type: 'read', scope: 'all', is_active: true },

  // ========== ResidentsFamily（住户及家属）==========
  { permission_id: '127', role_code: 'ResidentsFamily', resource_type: 'vital_monitor', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: '128', role_code: 'ResidentsFamily', resource_type: 'resident_contacts', permission_type: 'manage', scope: 'assigned_only', is_active: true },
  { permission_id: '129', role_code: 'ResidentsFamily', resource_type: 'resident_caregivers', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: '130', role_code: 'ResidentsFamily', resource_type: 'locations', permission_type: 'read', scope: 'all', is_active: true },
]
