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