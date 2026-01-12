/**
 * Monitor API
 * Note: All field names use snake_case to match database schema (PostgreSQL standard)
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  GetVitalFocusCardsModel,
  VitalFocusCardInfo,
} from './model/monitorModel'

enum Api {
  GetVitalFocusCards = '/data/api/v1/data/vital-focus/cards',
  GetVitalFocusCardByResident = '/data/api/v1/data/vital-focus/card/:residentId',
  GetVitalFocusCardDetail = '/data/api/v1/data/vital-focus/card/:cardId',
  SaveVitalFocusSelection = '/data/api/v1/data/vital-focus/selection',
}

// Mock mode: In development, use mock data instead of real API calls
// Check VITE_USE_MOCK='true' in .env file to enable mock
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

// Display mock status in console
if (useMock) {
  console.log('%c[Mock] Monitor API Mock enabled - Using test data', 'color: #52c41a; font-weight: bold')
}

/**
 * Get Vital Focus Cards
 * Returns cards list with card_name and card_address
 * 
 * In development: Returns mock data directly for testing Vue components
 * In production: Calls real backend API
 */
export function getVitalFocusCardsApi(
  mode: ErrorMessageMode = 'modal',
  params?: Record<string, any>,
) {
  return defHttp.get<GetVitalFocusCardsModel>(
    {
      url: Api.GetVitalFocusCards,
      params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * Get Vital Focus Card by Resident ID
 * Returns card info for a specific resident
 */
export function getVitalFocusCardByResidentApi(
  residentId: string,
  mode: ErrorMessageMode = 'modal',
) {
  return defHttp.get<VitalFocusCardInfo>(
    {
      url: Api.GetVitalFocusCardByResident.replace(':residentId', residentId),
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * Get Vital Focus Card Detail by Card ID
 * Returns detailed card info
 */
export function getVitalFocusCardDetailApi(
  cardId: string,
  mode: ErrorMessageMode = 'modal',
) {
  return defHttp.get<VitalFocusCardInfo>(
    {
      url: Api.GetVitalFocusCardDetail.replace(':cardId', cardId),
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * Save Vital Focus Card Selection
 * Saves user's selected card IDs to server
 */
export interface SaveVitalFocusSelectionParams {
  selected_card_ids: string[]
}

export interface SaveVitalFocusSelectionResult {
  success: boolean
  message?: string
}

export function saveVitalFocusSelectionApi(
  params: SaveVitalFocusSelectionParams,
  mode: ErrorMessageMode = 'modal',
) {
  return defHttp.post<SaveVitalFocusSelectionResult>(
    {
      url: Api.SaveVitalFocusSelection,
      data: params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

