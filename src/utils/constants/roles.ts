/**
 * Role definitions
 * 9 roles based on permission matrix
 */

export interface RoleDefinition {
  code: string
  name: string
  description: string
  mainFunction: string
}

export const ROLES: readonly RoleDefinition[] = [
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
    description: 'Executive Director / Director of Nursing',
    mainFunction: 'Business management: Staff, Unit, Resident manager, Device, Alarm setting for Branch',
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
    mainFunction: "View family member's wellness & safety info, alarm info, special environment: handle alarm event",
  },
] as const
