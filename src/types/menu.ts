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
    permission: ['SystemAdmin', 'Admin', 'Manager', 'Nurse', 'Caregiver'],
  },
  {
    key: 'alarm-history',
    label: 'Alarm Records',
    icon: 'AlertOutlined',
    path: '/alarm/records',
    permission: ['SystemAdmin', 'Admin', 'Manager', 'Nurse', 'Caregiver'],
  },
  {
    key: 'alarm-settings',
    label: 'Alarm Settings',
    icon: 'SettingOutlined',
    path: '/alarm/settings',
    permission: ['SystemAdmin', 'Admin', 'Manager'],
  },
  // Data Management Area (with divider)
  {
    key: 'residents',
    label: 'Resident Management',
    icon: 'svg:resident',
    path: '/residents',
    permission: ['SystemAdmin', 'Admin', 'Manager', 'Nurse', 'Caregiver'],
    divider: true,
  },
  {
    key: 'resident-dashboard',
    label: 'Assignment Overview',
    icon: 'TableOutlined',
    path: '/care-coordination/resident-dashboard',
    permission: ['SystemAdmin', 'Admin', 'Manager'],
  },
  // System Settings Area (with divider)
  {
    key: 'devices',
    label: 'Device Management',
    icon: 'svg:device',
    path: '/devices',
    permission: ['SystemAdmin', 'Admin', 'Manager', 'IT'],
    divider: true,
  },
  {
    key: 'units',
    label: 'Unit Management',
    icon: 'HomeOutlined',
    path: '/units',
    permission: ['SystemAdmin', 'Admin', 'Manager', 'IT'],
  },
  {
    key: 'admin-users',
    label: 'User Management',
    icon: 'UserOutlined',
    path: '/admin/users',
    permission: ['SystemAdmin', 'Admin', 'IT'],
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
    permission: ['SystemAdmin', 'Admin', 'IT'],
  },
]

