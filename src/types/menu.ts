export interface MenuItem {
  key: string
  label: string
  icon?: string
  path?: string
  permission?: string[] // Allowed roles for this menu item
  divider?: boolean // Whether to show a divider before this item
}

export const menuItems: MenuItem[] = [
  // Core Operations Area
  {
    key: 'monitoring-overview',
    label: 'Monitoring Overview',
    icon: 'MonitorOutlined',
    path: '/monitoring/overview',
    permission: ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  },
  {
    key: 'alarm-history',
    label: 'Alarm Records',
    icon: 'AlertOutlined',
    path: '/alarm/records',
    permission: ['Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  },
  {
    key: 'alarm-cloud',
    label: 'Alarm Cloud',
    icon: 'CloudOutlined',
    path: '/alarm/cloud',
    permission: ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family'],
  },
  // Data Management Area (with divider)
  {
    key: 'residents',
    label: 'Resident Management',
    icon: 'svg:resident',
    path: '/residents',
    permission: ['Admin', 'Manager', 'Nurse', 'Caregiver', 'Resident', 'Family'],
    divider: true,
  },
  {
    key: 'card-overview',
    label: 'Card Overview',
    icon: 'TableOutlined',
    path: '/care-coordination/card-overview',
    permission: ['Admin', 'Manager', 'IT', 'Nurse'],
  },
  // System Settings Area (with divider)
  {
    key: 'devices',
    label: 'Device Management',
    icon: 'svg:device',
    path: '/devices',
    permission: ['Admin', 'Manager', 'IT'],
    divider: true,
  },
  {
    key: 'device-store',
    label: 'Device Store',
    icon: 'DatabaseOutlined',
    path: '/admin/devicestore',
    permission: ['SystemAdmin'],
  },
  {
    key: 'units',
    label: 'Unit Management',
    icon: 'HomeOutlined',
    path: '/units',
    permission: ['Admin', 'Manager', 'IT'],
  },
  {
    key: 'admin-users',
    label: 'User Management',
    icon: 'UserOutlined',
    path: '/admin/users',
    permission: ['Admin', 'Manager', 'IT'],
  },
  {
    key: 'admin-roles',
    label: 'Role Management',
    icon: 'SafetyOutlined',
    path: '/admin/roles',
    permission: ['SystemAdmin', 'Admin', 'Manager', 'IT'],
  },
  {
    key: 'admin-permissions',
    label: 'Permission Management',
    icon: 'KeyOutlined',
    path: '/admin/permissions',
    permission: ['SystemAdmin'], // Only SystemAdmin can access
  },
  {
    key: 'admin-tags',
    label: 'Tag Management',
    icon: 'TagOutlined',
    path: '/admin/tags',
    permission: ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver'],
  },
]

