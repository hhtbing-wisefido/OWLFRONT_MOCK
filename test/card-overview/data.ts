/**
 * Card Overview Test Data
 * For testing card overview API
 */

import type {
  CardOverviewItem,
  GetCardOverviewResult,
} from '@/api/card-overview/model/cardOverviewModel'
import { institutions } from '../login/data'

// Mock card overview data
export const mockCardOverviewItems: CardOverviewItem[] = [
  {
    card_id: 'card-001',
    card_name: 'Smith',
    card_address: 'Building A-A-E203',
    unit_type: 'Facility',
    is_multi_person_room: false,
    is_public_space: false,
    family_view: true,
    devices: [
      { device_id: 'device-001', device_name: 'Radar-001', device_type: 2 },
      { device_id: 'device-002', device_name: 'Sleepace-001', device_type: 1 },
    ],
    residents: [
      {
        resident_id: 'resident-001',
        last_name: 'Smith',
        first_name: 'John',
        nickname: 'Smith',
        service_level: 'L2',
      },
    ],
    caregiver_groups: [
      { group_id: 'group-001', group_name: 'Group-A' },
    ],
    caregivers: [],
    device_count: 2,
    resident_count: 1,
    caregiver_group_count: 1,
    caregiver_count: 0,
    tenant_id: institutions.sunset.id,
  },
  {
    card_id: 'card-002',
    card_name: 'E203',
    card_address: 'Building A-A-E203',
    unit_type: 'Facility',
    is_multi_person_room: true,
    is_public_space: false,
    family_view: false,
    devices: [
      { device_id: 'device-003', device_name: 'Radar-003', device_type: 2 },
    ],
    residents: [
      {
        resident_id: 'resident-001',
        last_name: 'Smith',
        first_name: 'John',
        nickname: 'Smith',
        service_level: 'L2',
      },
      {
        resident_id: 'resident-004',
        last_name: 'Johnson',
        first_name: 'Mary',
        nickname: 'Johnson',
        service_level: 'L3',
      },
    ],
    caregiver_groups: [
      { group_id: 'group-002', group_name: 'Group-B' },
    ],
    caregivers: [
      { caregiver_id: 'user-001', caregiver_name: 'Alice', role: 'Nurse' },
    ],
    device_count: 1,
    resident_count: 2,
    caregiver_group_count: 1,
    caregiver_count: 1,
    tenant_id: institutions.sunset.id,
  },
  {
    card_id: 'card-003',
    card_name: 'Lobby',
    card_address: 'Building A-A-Lobby',
    unit_type: 'Facility',
    is_multi_person_room: false,
    is_public_space: true,
    family_view: false,
    devices: [
      { device_id: 'device-005', device_name: 'Radar-005', device_type: 2 },
    ],
    residents: [],
    caregiver_groups: [],
    caregivers: [],
    device_count: 1,
    resident_count: 0,
    caregiver_group_count: 0,
    caregiver_count: 0,
    tenant_id: institutions.sunset.id,
  },
  {
    card_id: 'card-004',
    card_name: 'Home-001',
    card_address: 'Home-001',
    unit_type: 'Home',
    is_multi_person_room: false,
    is_public_space: false,
    family_view: true,
    devices: [
      { device_id: 'device-010', device_name: 'Radar-010', device_type: 2 },
    ],
    residents: [
      {
        resident_id: 'resident-001',
        last_name: 'Smith',
        first_name: 'John',
        nickname: 'Smith',
        service_level: 'L2',
      },
    ],
    caregiver_groups: [],
    caregivers: [],
    device_count: 1,
    resident_count: 1,
    caregiver_group_count: 0,
    caregiver_count: 0,
    tenant_id: institutions.sunset.id,
  },
]

/**
 * Generate mock card overview result
 */
export function generateCardOverviewResult(
  items: CardOverviewItem[],
  page: number = 1,
  pageSize: number = 10,
): GetCardOverviewResult {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedItems = items.slice(start, end)

  return {
    items: paginatedItems,
    pagination: {
      size: pageSize,
      page: page,
      count: paginatedItems.length,
      total: items.length,
    },
  }
}

