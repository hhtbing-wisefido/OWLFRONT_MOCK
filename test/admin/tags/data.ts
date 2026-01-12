/**
 * Tags 测试数据
 * 对应 src/api/admin/tags/tags.ts 和 owlRD/db/20_tags_catalog.sql
 */

import type { TagCatalogItem } from '@/api/admin/tags/model/tagsModel'

/**
 * 模拟 Tags 数据
 */
export const mockTagsData: TagCatalogItem[] = [
  {
    tag_id: '1',
    tenant_id: 'mapleview-001',
    tag_type: 'user_tag',
    tag_name: 'Management',
    tag_objects: {
      user: {
        'user-001': 'Admin User',
        'user-002': 'Manager User',
      },
    },
  },
  {
    tag_id: '2',
    tenant_id: 'mapleview-001',
    tag_type: 'user_tag',
    tag_name: 'System',
    tag_objects: {
      user: {
        'user-003': 'IT User',
      },
    },
  },
  {
    tag_id: '3',
    tenant_id: 'mapleview-001',
    tag_type: 'user_tag',
    tag_name: 'Technical',
    tag_objects: {
      user: {
        'user-004': 'Tech User 1',
        'user-005': 'Tech User 2',
      },
      location: {
        'loc-001': 'Tech Lab',
      },
    },
  },
  {
    tag_id: '5',
    tenant_id: 'mapleview-001',
    tag_type: 'user_tag',
    tag_name: 'NightShift',
    tag_objects: {
      user: {
        'user-006': 'Night Nurse 1',
        'user-007': 'Night Nurse 2',
        'user-008': 'Night Caregiver',
      },
    },
  },
  {
    tag_id: '6',
    tenant_id: 'mapleview-001',
    tag_type: 'family_tag',
    tag_name: 'Group.A',
    tag_objects: {
      resident: {
        'res-001': 'Resident A1',
        'res-002': 'Resident A2',
      },
    },
  },
  {
    tag_id: '7',
    tenant_id: 'mapleview-001',
    tag_type: 'location_tag',
    tag_name: 'DV1',
    tag_objects: {
      location: {
        'building-1': 'Building A',
      },
    },
  },
  {
    tag_id: '10',
    tenant_id: 'mapleview-001',
    tag_type: 'location_tag',
    tag_name: 'SPR',
    tag_objects: {
      location: {
        'building-2': 'Building B',
      },
    },
  },
  {
    tag_id: '14',
    tenant_id: 'mapleview-001',
    tag_type: 'location_tag',
    tag_name: 'BD1',
    tag_objects: {
      location: {
        'unit-7': 'BD02',
        'unit-8': 'BD_king',
      },
    },
  },
  {
    tag_id: '8',
    tenant_id: 'mapleview-001',
    tag_type: 'location_tag', // Changed from nursestation_tag (not in schema)
    tag_name: 'Station-A',
    tag_objects: {
      location: {
        'loc-006': 'Nurse Station A',
      },
    },
  },
  {
    tag_id: '9',
    tenant_id: 'mapleview-001',
    tag_type: 'user_tag', // 用户标签（默认类型）
    tag_name: 'Custom-Tag-1',
    tag_objects: {},
  },
  {
    tag_id: '11',
    tenant_id: 'mapleview-001',
    tag_type: 'area_tag',
    tag_name: 'East',
    tag_objects: {},
  },
  {
    tag_id: '12',
    tenant_id: 'mapleview-001',
    tag_type: 'area_tag',
    tag_name: 'West',
    tag_objects: {},
  },
  {
    tag_id: '13',
    tenant_id: 'mapleview-001',
    tag_type: 'area_tag',
    tag_name: 'MemaryCare',
    tag_objects: {},
  },
]

