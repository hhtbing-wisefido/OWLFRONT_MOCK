/**
 * Service Level test data
 * Corresponds to service_levels table structure in owlRD/db/20_service_levels.sql
 */

import type { ServiceLevel } from '@/api/service-level/model/serviceLevelModel'

export const serviceLevels: ServiceLevel[] = [
  {
    level_code: 'Independent',
    description: 'Independent living, able to perform daily activities without assistance',
    color: 'green',
    color_hex: '#28a745',
    priority: 1,
  },
  {
    level_code: 'Assisted',
    description: 'Requires partial assistance with daily activities, but can complete some activities independently',
    color: 'blue',
    color_hex: '#007bff',
    priority: 2,
  },
  {
    level_code: 'MemoryCare',
    description: 'Requires cognitive support, may need memory aids and reminders',
    color: 'yellow',
    color_hex: '#ffc107',
    priority: 3,
  },
  {
    level_code: 'FallRisk',
    description: 'Fall risk, requires fall prevention and monitoring, may need assistive devices',
    color: 'orange',
    color_hex: '#fd7e14',
    priority: 4,
  },
  {
    level_code: 'VitalRisk',
    description: 'Vital signs risk, abnormal heart rate or breathing, requires close monitoring and medical intervention',
    color: 'red',
    color_hex: '#dc3545',
    priority: 5,
  },
  {
    level_code: 'Critical',
    description: 'Critical condition, requires 24-hour close monitoring and medical intervention, may need special care',
    color: 'red',
    color_hex: '#c82333',
    priority: 6,
  },
]

