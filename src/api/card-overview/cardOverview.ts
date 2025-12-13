/**
 * Card Overview API
 * For managing card overview display data
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  CardOverviewItem,
  GetCardOverviewParams,
  GetCardOverviewResult,
} from './model/cardOverviewModel'

// Define API path enum
export enum Api {
  GetList = '/admin/api/v1/card-overview',
}

/**
 * @description: Get card overview list
 */
export function getCardOverviewApi(
  params?: GetCardOverviewParams,
  mode: ErrorMessageMode = 'modal',
) {
  // In development: Use mock data if available
  // DEV 默认走真实后端；只有显式设置 VITE_USE_MOCK='true' 才启用 mock
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true') {
    return import('@test/index').then(({ cardOverview }) => {
      console.log('%c[Mock] Get Card Overview API Request', 'color: #1890ff; font-weight: bold', {
        params,
      })
      return cardOverview.mock.mockGetCardOverview(params).then((result) => {
        console.log(
          '%c[Mock] Get Card Overview API - Success',
          'color: #52c41a; font-weight: bold',
          { result },
        )
        return result
      }).catch((error: any) => {
        console.log(
          '%c[Mock] Get Card Overview API - Failed',
          'color: #ff4d4f; font-weight: bold',
          { error: error.message },
        )
        throw error
      })
    })
  }

  return defHttp.get<GetCardOverviewResult>(
    {
      url: Api.GetList,
      params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

