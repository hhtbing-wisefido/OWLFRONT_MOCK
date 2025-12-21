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
    branch_tag: 'DV1',  // 改为 branch_tag，与实际 API 一致
  },
  {
    building_id: 'building-2',
    building_name: 'B',
    floors: 1,
    tenant_id: 'tenant-1',
    branch_tag: 'SPR',  // 改为 branch_tag，与实际 API 一致
  },
]

export const mockUnitsData: Unit[] = [
  // Building A - 1F - DV1 - East
  {
    unit_id: 'unit-1',
    tenant_id: 'tenant-1',
    unit_number: '101',
    unit_name: 'E101',
    unit_type: 'Facility',
    building: 'A',
    floor: '1F',
    branch_tag: 'DV1',
    area_tag: 'East',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    unit_id: 'unit-2',
    tenant_id: 'tenant-1',
    unit_number: '102',
    unit_name: 'E102',
    unit_type: 'Facility',
    building: 'A',
    floor: '1F',
    branch_tag: 'DV1',
    area_tag: 'East',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  // Building A - 2F - DV1 - West
  {
    unit_id: 'unit-3',
    tenant_id: 'tenant-1',
    unit_number: '201',
    unit_name: 'W201',
    unit_type: 'Facility',
    building: 'A',
    floor: '2F',
    branch_tag: 'DV1',
    area_tag: 'West',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    unit_id: 'unit-4',
    tenant_id: 'tenant-1',
    unit_number: '202',
    unit_name: 'W202',
    unit_type: 'Facility',
    building: 'A',
    floor: '2F',
    branch_tag: 'DV1',
    area_tag: 'West',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  // Building B - 1F - SPR - MemaryCare
  {
    unit_id: 'unit-5',
    tenant_id: 'tenant-1',
    unit_number: '110',
    unit_name: 'M110',
    unit_type: 'Facility',
    building: 'B',
    floor: '1F',
    branch_tag: 'SPR',
    area_tag: 'MemaryCare',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    unit_id: 'unit-6',
    tenant_id: 'tenant-1',
    unit_number: '120',
    unit_name: 'M120',
    unit_type: 'Facility',
    building: 'B',
    floor: '1F',
    branch_tag: 'SPR',
    area_tag: 'MemaryCare',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  // BD1 - No Building - No Floor - No area_tag (DB default: building="-", floor="1F")
  {
    unit_id: 'unit-7',
    tenant_id: 'tenant-1',
    unit_number: '002',
    unit_name: 'BD02',
    unit_type: 'Facility',
    building: '-',
    floor: '1F',
    branch_tag: 'BD1',
    area_tag: undefined,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    unit_id: 'unit-8',
    tenant_id: 'tenant-1',
    unit_number: '003',
    unit_name: 'BD_king',
    unit_type: 'Home',
    building: '-',
    floor: '1F',
    branch_tag: 'BD1',
    area_tag: undefined,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

