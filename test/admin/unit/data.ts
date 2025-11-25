/**
 * Unit Mock 数据
 */

import type { Building, Unit } from '@/api/units/model/unitModel'

export const mockBuildingsData: Building[] = [
  {
    building_id: 'building-1',
    building_name: 'A',
    floors: 2,
    tenant_id: 'tenant-1',
  },
  {
    building_id: 'building-2',
    building_name: 'B',
    floors: 2,
    tenant_id: 'tenant-1',
  },
]

export const mockUnitsData: Unit[] = [
  // Building A - 1F
  {
    unit_id: 'unit-1',
    tenant_id: 'tenant-1',
    unit_number: '101',
    unit_name: 'Room 101',
    building: 'A',
    floor: '1F',
    location_tag: 'VIP',
    area_tag: 'East',
    location_type: 'institution',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    unit_id: 'unit-2',
    tenant_id: 'tenant-1',
    unit_number: '102',
    unit_name: 'Room 102',
    building: 'A',
    floor: '1F',
    location_tag: 'VIP',
    area_tag: 'East',
    location_type: 'institution',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  // Building A - 2F
  {
    unit_id: 'unit-3',
    tenant_id: 'tenant-1',
    unit_number: '201',
    unit_name: 'Room 201',
    building: 'A',
    floor: '2F',
    location_tag: 'Standard',
    area_tag: 'West',
    location_type: 'institution',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    unit_id: 'unit-4',
    tenant_id: 'tenant-1',
    unit_number: '202',
    unit_name: 'Room 202',
    building: 'A',
    floor: '2F',
    location_tag: 'Standard',
    area_tag: 'West',
    location_type: 'institution',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  // Building B - 1F
  {
    unit_id: 'unit-5',
    tenant_id: 'tenant-1',
    unit_number: '101',
    unit_name: 'Room 101',
    building: 'B',
    floor: '1F',
    location_tag: 'VIP',
    area_tag: 'East',
    location_type: 'institution',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  // Building B - 2F
  {
    unit_id: 'unit-6',
    tenant_id: 'tenant-1',
    unit_number: '201',
    unit_name: 'Room 201',
    building: 'B',
    floor: '2F',
    location_tag: 'Standard',
    area_tag: 'West',
    location_type: 'institution',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

