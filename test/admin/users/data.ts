/**
 * Users 测试数据
 * 对应 src/views/admin/users/UserList.vue 和 src/api/admin/user/user.ts
 */

import type { User } from '@/api/admin/user/model/userModel'

/**
 * 模拟用户数据
 * 对应 owlRD/db/03_users.sql 中的 users 表结构
 */
export const mockUsersData: User[] = [
  {
    user_id: '1',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000',
    user_account: 'admin',
    nickname: 'Admin User',
    email: 'admin@test.com',
    phone: '720101001',
    role: 'Admin',
    status: 'active',
    alarm_levels: ['0', '1', '2', '3', '4'],
    alarm_channels: ['APP', 'EMAIL'],
    alarm_scope: 'ALL',
    tags: ['Management', 'System'],
    last_login_at: '2024-01-15T10:30:00Z',
  },
  {
    user_id: '2',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000',
    user_account: 'manager1',
    nickname: 'Manager One',
    email: 'manager1@test.com',
    phone: '720101002',
    role: 'Manager',
    status: 'active',
    alarm_levels: ['0', '1', '2'],
    alarm_channels: ['APP', 'EMAIL', 'SMS'],
    alarm_scope: 'ALL',
    tags: ['Management', 'NightShift'],
    last_login_at: '2024-01-15T09:15:00Z',
  },
  {
    user_id: '3',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000',
    user_account: 'nurse1',
    nickname: 'Nurse One',
    email: 'nurse1@test.com',
    phone: '720101003',
    role: 'Nurse',
    status: 'active',
    alarm_levels: ['0'],
    alarm_channels: ['APP'],
    alarm_scope: 'ASSIGNED_ONLY',
    tags: ['Group.A'],
    last_login_at: '2024-01-15T08:00:00Z',
  },
  {
    user_id: '4',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000',
    user_account: 'caregiver1',
    nickname: 'Caregiver One',
    email: 'caregiver1@test.com',
    phone: '720101004',
    role: 'Caregiver',
    status: 'active',
    alarm_levels: [],
    alarm_channels: [],
    alarm_scope: 'ASSIGNED_ONLY',
    tags: ['Group.B'],
    last_login_at: '2024-01-14T20:30:00Z',
  },
  {
    user_id: '5',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000',
    user_account: 'it1',
    nickname: 'IT Support',
    email: 'it1@test.com',
    phone: '720101005',
    role: 'IT',
    status: 'active',
    alarm_levels: ['0', '1', '2', '3', '4'],
    alarm_channels: ['APP', 'EMAIL'],
    alarm_scope: 'ALL',
    tags: ['Technical', 'DeviceManagement'],
    last_login_at: '2024-01-15T11:00:00Z',
  },
  {
    user_id: '6',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000',
    user_account: 'disabled_user',
    nickname: 'Disabled User',
    email: 'disabled@test.com',
    phone: '720101006',
    role: 'Nurse',
    status: 'disabled',
    alarm_levels: [],
    alarm_channels: [],
    alarm_scope: 'ASSIGNED_ONLY',
    tags: [],
    last_login_at: '2024-01-10T15:00:00Z',
  },
]

