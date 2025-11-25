/**
 * Location Mock 数据
 */

import type { Building, Location } from '@/api/location/model/locationModel'

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

export const mockLocationsData: Location[] = [
  // Building A - 1F
  {
    location_id: 'location-1',
    tenant_id: 'tenant-1',
    door_number: '101',
    location_name: '101房间',
    building: 'A',
    floor: '1F',
    location_tag: 'VIP',
    area_tag: '东区',
    location_type: 'institution',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    location_id: 'location-2',
    tenant_id: 'tenant-1',
    door_number: '102',
    location_name: '102房间',
    building: 'A',
    floor: '1F',
    location_tag: 'VIP',
    area_tag: '东区',
    location_type: 'institution',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  // Building A - 2F
  {
    location_id: 'location-3',
    tenant_id: 'tenant-1',
    door_number: '201',
    location_name: '201房间',
    building: 'A',
    floor: '2F',
    location_tag: '普通',
    area_tag: '西区',
    location_type: 'institution',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    location_id: 'location-4',
    tenant_id: 'tenant-1',
    door_number: '202',
    location_name: '202房间',
    building: 'A',
    floor: '2F',
    location_tag: '普通',
    area_tag: '西区',
    location_type: 'institution',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  // Building B - 1F
  {
    location_id: 'location-5',
    tenant_id: 'tenant-1',
    door_number: '101',
    location_name: '101房间',
    building: 'B',
    floor: '1F',
    location_tag: 'VIP',
    area_tag: '东区',
    location_type: 'institution',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  // Building B - 2F
  {
    location_id: 'location-6',
    tenant_id: 'tenant-1',
    door_number: '201',
    location_name: '201房间',
    building: 'B',
    floor: '2F',
    location_tag: '普通',
    area_tag: '西区',
    location_type: 'institution',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

