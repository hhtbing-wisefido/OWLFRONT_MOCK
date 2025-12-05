/**
 * Residents 测试数据
 * 对应 src/views/residents/ResidentList.vue 和 src/api/resident/resident.ts
 */

import type { Resident, ResidentContact } from '@/api/resident/model/residentModel'

/**
 * 模拟住户数据
 * 对应 owlRD/db/08_residents.sql 中的 residents 表结构
 */
export const mockResidentsData: Resident[] = [
  {
    resident_id: '1',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000',
    resident_account: 'R001',
    nickname: 'John Doe',
    email: 'john.doe@example.com',
    phone: '820101001',
    status: 'active',
    service_level: 'Independent',
    admission_date: '2024-01-15',
    unit_id: 'unit-1',
    unit_name: 'E203',
    location_tag: 'Building A - Main Wing',
    building: 'A',
    area_tag: 'East Wing',
    unit_number: '203',
    is_multi_person_room: false,
    note: 'First floor resident',
    contacts: [
      {
        contact_id: '1',
        resident_id: '1',
        contact_name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '820101002',
        email: 'jane.doe@example.com',
        is_primary: true,
      },
    ],
  },
  {
    resident_id: '2',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000',
    resident_account: 'R002',
    nickname: 'Mary Smith',
    email: 'mary.smith@example.com',
    phone: '820101003',
    status: 'active',
    service_level: 'Assisted',
    admission_date: '2024-01-20',
    unit_id: 'unit-2',
    unit_name: 'E204',
    location_tag: 'Building A - Main Wing',
    building: 'A',
    area_tag: 'East Wing',
    unit_number: '204',
    is_multi_person_room: true,
    room_name: 'Room 204',
    bed_name: 'BedA',
    note: 'Second floor resident',
    contacts: [
      {
        contact_id: '2',
        resident_id: '2',
        contact_name: 'Tom Smith',
        relationship: 'Son',
        phone: '820101004',
        email: 'tom.smith@example.com',
        is_primary: true,
      },
    ],
  },
  {
    resident_id: '3',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000',
    resident_account: 'R003',
    nickname: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    phone: '820101005',
    status: 'discharged',
    service_level: 'Independent',
    admission_date: '2023-12-01',
    discharge_date: '2024-01-10',
    unit_id: 'unit-3',
    unit_name: 'E205',
    location_tag: 'Building A - Main Wing',
    building: 'A',
    area_tag: 'East Wing',
    unit_number: '205',
    is_multi_person_room: false,
    note: 'Discharged resident',
    contacts: [],
  },
]

