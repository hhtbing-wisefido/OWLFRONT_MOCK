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
// DEV 榛樿璧扮湡瀹炲悗绔紱鍙湁鏄惧紡璁剧�?VITE_USE_MOCK='true' 鎵嶅惎鐢?mock
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

// Display mock status in console
if (useMock) {
  console.log('%c[Mock] Service Level API Mock enabled - Using test data', 'color: #52c41a; font-weight: bold')
}

/**
 * @description: Get service level list
 * @param mode - Error message mode
 */
export function getServiceLevelsApi(mode: ErrorMessageMode = 'modal') {
  // Production: Call real backend API
  return defHttp.get<GetServiceLevelsResult>(
    {
      url: Api.GetList,
    },
    { errorMessageMode: mode },
  )
}

