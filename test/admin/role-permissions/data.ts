/**
 * Role Permission Test Data
 * Corresponds to owlRD/db/03_role_permissions.sql preset permission configuration
 * Updated to match the permission matrix table
 */

import type { RolePermission } from '@/api/admin/role-permission/model/rolePermissionModel'

/**
 * Role definitions (each role listed separately)
 * Consistent with owlRD/db/02_roles.sql, using the new simplified role system
 */
export const ROLES = [
  {
    code: 'SystemAdmin',
    name: 'System Administrator',
    description: 'System Administrator (Cross-Tenant)',
    mainFunction: 'Manage system-level resources, business data read-only',
  },
  {
    code: 'SystemOperator',
    name: 'System Operator',
    description: 'System Operator (Platform Ops)',
    mainFunction: 'Platform operations: manage tenants, device_store, alarm_cloud',
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
 * Permission data (based on permission matrix table)
 * Resource type mapping:
 * - cards(vital-monitor) → cards
 * - cloud_alarm_polices → alarm_cloud
 * - Iot_Monitor_alarm → alarm_device
 * - device-store → device_store
 * - role-permissions → role_permissions
 * - service_level → service_levels
 * - alarm_event → alarm_events
 * - device → devices
 */
export const mockRolePermissionsData: RolePermission[] = [
  // ========== SystemAdmin: System-level administrator ==========
  // Matrix: roles (RCDU), role-permissions (RCDU), tenants (RCDU), tags_catalog (RCDU), device-store (RCDU)
  { permission_id: 'sa-1', role_code: 'SystemAdmin', resource_type: 'roles', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'sa-2', role_code: 'SystemAdmin', resource_type: 'role_permissions', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'sa-3', role_code: 'SystemAdmin', resource_type: 'tenants', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'sa-4', role_code: 'SystemAdmin', resource_type: 'tags_catalog', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'sa-5', role_code: 'SystemAdmin', resource_type: 'device_store', permission_type: 'manage', scope: 'all', is_active: true },

  // ========== Admin: Tenant administrator ==========
  // Matrix: cards (RCDU), roles (RU), users (RCDU), resident (RCDU), resident_phi (RCDU), resident_contacts (RCDU),
  //         resident_caregivers (RCDU), cloud_alarm_polices (RCDU), Iot_Monitor_alarm (RCDU), tags_catalog (RCDU),
  //         service_level (RCDU), alarm_event (RCDU), rounds (RCDU), round_details (RCDU), units (RCDU),
  //         rooms (RCDU), beds (RCDU), device (RCDU), config_versions (RCDU), iot_timeseries (RCDU),
  //         role-permissions (R), device-store (R - read only, assigned_only)
  { permission_id: 'admin-1', role_code: 'Admin', resource_type: 'cards', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-2', role_code: 'Admin', resource_type: 'roles', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'admin-3', role_code: 'Admin', resource_type: 'roles', permission_type: 'update', scope: 'all', is_active: true },
  { permission_id: 'admin-4', role_code: 'Admin', resource_type: 'role_permissions', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'admin-5', role_code: 'Admin', resource_type: 'users', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-6', role_code: 'Admin', resource_type: 'residents', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-7', role_code: 'Admin', resource_type: 'resident_phi', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-8', role_code: 'Admin', resource_type: 'resident_contacts', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-9', role_code: 'Admin', resource_type: 'resident_caregivers', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-10', role_code: 'Admin', resource_type: 'alarm_cloud', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-11', role_code: 'Admin', resource_type: 'alarm_device', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-12', role_code: 'Admin', resource_type: 'tags_catalog', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-13', role_code: 'Admin', resource_type: 'service_levels', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-14', role_code: 'Admin', resource_type: 'alarm_events', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-15', role_code: 'Admin', resource_type: 'rounds', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-16', role_code: 'Admin', resource_type: 'round_details', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-17', role_code: 'Admin', resource_type: 'units', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-18', role_code: 'Admin', resource_type: 'rooms', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-19', role_code: 'Admin', resource_type: 'beds', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-20', role_code: 'Admin', resource_type: 'devices', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-21', role_code: 'Admin', resource_type: 'config_versions', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-22', role_code: 'Admin', resource_type: 'iot_timeseries', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'admin-23', role_code: 'Admin', resource_type: 'device_store', permission_type: 'read', scope: 'assigned_only', is_active: true },

  // ========== Manager: Executive Director / Facility Director ==========
  // Matrix: cards (R), roles (RU), users (RCDU), resident (RCDU), resident_phi (RCDU), resident_contacts (RCDU),
  //         resident_caregivers (RCDU), cloud_alarm_polices (RCDU), Iot_Monitor_alarm (RCDU), tags_catalog (RCDU),
  //         service_level (RCDU), alarm_event (RCDU), rounds (RCDU), round_details (RCDU), units (RCDU),
  //         rooms (RCDU), beds (RCDU), device (RCDU), iot_timeseries (R), role-permissions (R), device-store (R - read only, assigned_only)
  { permission_id: 'mgr-1', role_code: 'Manager', resource_type: 'cards', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'mgr-2', role_code: 'Manager', resource_type: 'roles', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'mgr-3', role_code: 'Manager', resource_type: 'roles', permission_type: 'update', scope: 'all', is_active: true },
  { permission_id: 'mgr-4', role_code: 'Manager', resource_type: 'role_permissions', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'mgr-5', role_code: 'Manager', resource_type: 'users', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-6', role_code: 'Manager', resource_type: 'residents', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-7', role_code: 'Manager', resource_type: 'resident_phi', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-8', role_code: 'Manager', resource_type: 'resident_contacts', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-9', role_code: 'Manager', resource_type: 'resident_caregivers', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-10', role_code: 'Manager', resource_type: 'alarm_cloud', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-11', role_code: 'Manager', resource_type: 'alarm_device', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-12', role_code: 'Manager', resource_type: 'tags_catalog', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-13', role_code: 'Manager', resource_type: 'service_levels', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-14', role_code: 'Manager', resource_type: 'alarm_events', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-15', role_code: 'Manager', resource_type: 'rounds', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-16', role_code: 'Manager', resource_type: 'round_details', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-17', role_code: 'Manager', resource_type: 'units', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-18', role_code: 'Manager', resource_type: 'rooms', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-19', role_code: 'Manager', resource_type: 'beds', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-20', role_code: 'Manager', resource_type: 'devices', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'mgr-21', role_code: 'Manager', resource_type: 'iot_timeseries', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'mgr-22', role_code: 'Manager', resource_type: 'device_store', permission_type: 'read', scope: 'assigned_only', is_active: true },

  // ========== IT: IT Support ==========
  // Matrix: roles (read), users (RCDU), resident (read), resident_caregivers (read), Iot_Monitor_alarm (RCDU),
  //         tags_catalog (RCDU), alarm_event (R), units (RCDU), rooms (RCDU), beds (RCDU), device (RCDU),
  //         config_versions (RCDU), role-permissions (R), device-store (RA - read only, assigned_only)
  { permission_id: 'it-1', role_code: 'IT', resource_type: 'roles', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'it-2', role_code: 'IT', resource_type: 'role_permissions', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'it-3', role_code: 'IT', resource_type: 'users', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'it-4', role_code: 'IT', resource_type: 'residents', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'it-5', role_code: 'IT', resource_type: 'resident_caregivers', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'it-6', role_code: 'IT', resource_type: 'alarm_device', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'it-7', role_code: 'IT', resource_type: 'tags_catalog', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'it-8', role_code: 'IT', resource_type: 'alarm_events', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'it-9', role_code: 'IT', resource_type: 'units', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'it-10', role_code: 'IT', resource_type: 'rooms', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'it-11', role_code: 'IT', resource_type: 'beds', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'it-12', role_code: 'IT', resource_type: 'devices', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'it-13', role_code: 'IT', resource_type: 'config_versions', permission_type: 'manage', scope: 'all', is_active: true },
  { permission_id: 'it-14', role_code: 'IT', resource_type: 'device_store', permission_type: 'read', scope: 'assigned_only', is_active: true },

  // ========== Nurse: Clinical intervention ==========
  // Matrix: cards (R), resident (RA/UA), resident_phi (RA), resident_contacts (RA/UA), resident_caregivers (R),
  //         cloud_alarm_polices (R), Iot_Monitor_alarm (R/CA/UA), tags_catalog (R), service_level (R),
  //         alarm_event (RU), rounds (RCU), round_details (RCU), units (R), rooms (R), beds (R), device (R)
  // Note: units/rooms/beds/devices read permissions (all scope) allow Nurse to know all units/rooms/beds/devices for workflow, does not expose resident information
  { permission_id: 'nurse-1', role_code: 'Nurse', resource_type: 'cards', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'nurse-2', role_code: 'Nurse', resource_type: 'residents', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-3', role_code: 'Nurse', resource_type: 'residents', permission_type: 'update', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-4', role_code: 'Nurse', resource_type: 'resident_phi', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-5', role_code: 'Nurse', resource_type: 'resident_contacts', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-6', role_code: 'Nurse', resource_type: 'resident_contacts', permission_type: 'update', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-7', role_code: 'Nurse', resource_type: 'resident_caregivers', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'nurse-8', role_code: 'Nurse', resource_type: 'alarm_cloud', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'nurse-9', role_code: 'Nurse', resource_type: 'alarm_device', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'nurse-10', role_code: 'Nurse', resource_type: 'alarm_device', permission_type: 'create', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-11', role_code: 'Nurse', resource_type: 'alarm_device', permission_type: 'update', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-12', role_code: 'Nurse', resource_type: 'tags_catalog', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'nurse-13', role_code: 'Nurse', resource_type: 'service_levels', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'nurse-14', role_code: 'Nurse', resource_type: 'alarm_events', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-15', role_code: 'Nurse', resource_type: 'alarm_events', permission_type: 'update', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-16', role_code: 'Nurse', resource_type: 'rounds', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-17', role_code: 'Nurse', resource_type: 'rounds', permission_type: 'create', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-18', role_code: 'Nurse', resource_type: 'rounds', permission_type: 'update', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-19', role_code: 'Nurse', resource_type: 'round_details', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-20', role_code: 'Nurse', resource_type: 'round_details', permission_type: 'create', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-21', role_code: 'Nurse', resource_type: 'round_details', permission_type: 'update', scope: 'assigned_only', is_active: true },
  { permission_id: 'nurse-22', role_code: 'Nurse', resource_type: 'units', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'nurse-23', role_code: 'Nurse', resource_type: 'rooms', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'nurse-24', role_code: 'Nurse', resource_type: 'beds', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'nurse-25', role_code: 'Nurse', resource_type: 'devices', permission_type: 'read', scope: 'all', is_active: true },
  // Note: Nurse needs read permission (all scope) for units, rooms, beds, devices to know all units/rooms/beds/devices for workflow, does not expose resident information

  // ========== Caregiver: Basic first aid (CPR) ==========
  // Matrix: cards (RA), resident (RA), resident_phi (RA), resident_contacts (RA), resident_caregivers (R),
  //         cloud_alarm_polices (R), Iot_Monitor_alarm (RA), tags_catalog (R), service_level (R),
  //         alarm_event (RU), rounds (RCU), round_details (RCU), units (R), rooms (R), beds (R), device (R)
  // Note: units/rooms/beds/devices read permissions (all scope) allow Caregiver to know all units/rooms/beds/devices to avoid workflow blocking, does not expose resident information
  { permission_id: 'cg-1', role_code: 'Caregiver', resource_type: 'cards', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: 'cg-2', role_code: 'Caregiver', resource_type: 'residents', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: 'cg-3', role_code: 'Caregiver', resource_type: 'resident_phi', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: 'cg-4', role_code: 'Caregiver', resource_type: 'resident_contacts', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: 'cg-5', role_code: 'Caregiver', resource_type: 'resident_caregivers', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'cg-6', role_code: 'Caregiver', resource_type: 'alarm_cloud', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'cg-7', role_code: 'Caregiver', resource_type: 'alarm_device', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: 'cg-8', role_code: 'Caregiver', resource_type: 'tags_catalog', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'cg-9', role_code: 'Caregiver', resource_type: 'service_levels', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'cg-10', role_code: 'Caregiver', resource_type: 'alarm_events', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: 'cg-11', role_code: 'Caregiver', resource_type: 'alarm_events', permission_type: 'update', scope: 'assigned_only', is_active: true },
  { permission_id: 'cg-12', role_code: 'Caregiver', resource_type: 'rounds', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: 'cg-13', role_code: 'Caregiver', resource_type: 'rounds', permission_type: 'create', scope: 'assigned_only', is_active: true },
  { permission_id: 'cg-14', role_code: 'Caregiver', resource_type: 'rounds', permission_type: 'update', scope: 'assigned_only', is_active: true },
  { permission_id: 'cg-15', role_code: 'Caregiver', resource_type: 'round_details', permission_type: 'read', scope: 'assigned_only', is_active: true },
  { permission_id: 'cg-16', role_code: 'Caregiver', resource_type: 'round_details', permission_type: 'create', scope: 'assigned_only', is_active: true },
  { permission_id: 'cg-17', role_code: 'Caregiver', resource_type: 'round_details', permission_type: 'update', scope: 'assigned_only', is_active: true },
  { permission_id: 'cg-18', role_code: 'Caregiver', resource_type: 'units', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'cg-19', role_code: 'Caregiver', resource_type: 'rooms', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'cg-20', role_code: 'Caregiver', resource_type: 'beds', permission_type: 'read', scope: 'all', is_active: true },
  { permission_id: 'cg-21', role_code: 'Caregiver', resource_type: 'devices', permission_type: 'read', scope: 'all', is_active: true },
  // Note: Caregiver needs read permission (all scope) for units, rooms, beds, devices to avoid workflow blocking, does not expose resident information

  // ========== Resident: Can only see own cards ==========
  // Matrix: resident_contacts (RA/UA/CA), alarm_event (RA/UA(homecare))
  // Note: cards permission is handled at application layer (self_only scope)
  { permission_id: 'res-1', role_code: 'Resident', resource_type: 'cards', permission_type: 'read', scope: 'self_only', is_active: true },
  { permission_id: 'res-2', role_code: 'Resident', resource_type: 'resident_contacts', permission_type: 'read', scope: 'self_only', is_active: true },
  { permission_id: 'res-3', role_code: 'Resident', resource_type: 'resident_contacts', permission_type: 'update', scope: 'self_only', is_active: true },
  { permission_id: 'res-4', role_code: 'Resident', resource_type: 'resident_contacts', permission_type: 'create', scope: 'self_only', is_active: true },
  { permission_id: 'res-5', role_code: 'Resident', resource_type: 'alarm_events', permission_type: 'read', scope: 'self_only', is_active: true },
  { permission_id: 'res-6', role_code: 'Resident', resource_type: 'alarm_events', permission_type: 'update', scope: 'self_only', is_active: true },
  // Note: alarm_events update permission varies by scenario (Facility vs Homecare) - handled at application layer
  // Note: Resident cannot create alarm events, only read and update existing ones

  // ========== Family: Can only see linked residents' cards ==========
  // Matrix: cards (RA), resident_contacts (RA/UA/CA), alarm_event (RA/UA(homecare))
  // Note: cards permission is handled at application layer (linked_residents_only scope)
  { permission_id: 'fam-1', role_code: 'Family', resource_type: 'cards', permission_type: 'read', scope: 'linked_residents_only', is_active: true },
  { permission_id: 'fam-2', role_code: 'Family', resource_type: 'resident_contacts', permission_type: 'read', scope: 'linked_residents_only', is_active: true },
  { permission_id: 'fam-3', role_code: 'Family', resource_type: 'resident_contacts', permission_type: 'update', scope: 'linked_residents_only', is_active: true },
  { permission_id: 'fam-4', role_code: 'Family', resource_type: 'resident_contacts', permission_type: 'create', scope: 'linked_residents_only', is_active: true },
  { permission_id: 'fam-5', role_code: 'Family', resource_type: 'alarm_events', permission_type: 'read', scope: 'linked_residents_only', is_active: true },
  { permission_id: 'fam-6', role_code: 'Family', resource_type: 'alarm_events', permission_type: 'update', scope: 'linked_residents_only', is_active: true },
  // Note: alarm_events update permission varies by scenario (Facility vs Homecare) - handled at application layer
  // Note: Family cannot create alarm events, only read and update existing ones
]
