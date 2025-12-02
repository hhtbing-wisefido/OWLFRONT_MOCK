/**
 * Service Level mock API functions
 */

import type { GetServiceLevelsResult } from '@/api/service-level/model/serviceLevelModel'
import { serviceLevels } from './data'
import { delay } from '../utils/generator'

/**
 * Mock: Get service level list
 */
export async function mockGetServiceLevels(): Promise<GetServiceLevelsResult> {
  await delay(200)
  return {
    items: serviceLevels,
    total: serviceLevels.length,
  }
}

