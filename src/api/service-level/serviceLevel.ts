/**
 * Service Level API interface definition
 * Backend API calls related to service level management
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  ServiceLevel,
  GetServiceLevelsResult,
} from './model/serviceLevelModel'

// Export ServiceLevel type for use by other modules
export type { ServiceLevel } from './model/serviceLevelModel'

// Define API path enum
export enum Api {
  GetList = '/admin/api/v1/service-levels',
}

// Mock mode: In development, use mock data instead of real API calls
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

// Display mock status in console
if (useMock) {
  console.log('%c[Mock] Service Level API Mock enabled - Using test data', 'color: #52c41a; font-weight: bold')
}

/**
 * @description: Get service level list
 * @param mode - Error message mode
 */
export function getServiceLevelsApi(mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ serviceLevels }) => {
      console.log('%c[Mock] Get Service Levels API Request', 'color: #1890ff; font-weight: bold')
      return serviceLevels.mockGetServiceLevels().then((result) => {
        console.log('%c[Mock] Get Service Levels API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Get Service Levels API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  return defHttp.get<GetServiceLevelsResult>(
    {
      url: Api.GetList,
    },
    { errorMessageMode: mode },
  )
}

