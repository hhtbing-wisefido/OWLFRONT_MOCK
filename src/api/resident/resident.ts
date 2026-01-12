/**
 * Resident API interface definition
 * Backend API calls related to resident management
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  Resident,
  GetResidentsParams,
  GetResidentsResult,
  GetResidentParams,
  CreateResidentParams,
  CreateResidentResult,
  UpdateResidentParams,
  UpdateResidentPHIParams,
  UpdateResidentContactParams,
} from './model/residentModel'

// Export Resident type for use by other modules
export type { Resident } from './model/residentModel'

// Define API path enum
export enum Api {
  GetList = '/admin/api/v1/residents',
  GetDetail = '/admin/api/v1/residents/:id',
  Create = '/admin/api/v1/residents',
  Update = '/admin/api/v1/residents/:id',
  Delete = '/admin/api/v1/residents/:id',
  UpdatePHI = '/admin/api/v1/residents/:id/phi',
  UpdateContact = '/admin/api/v1/residents/:id/contacts',
  ResetPassword = '/admin/api/v1/residents/:id/reset-password',
  ResetContactPassword = '/admin/api/v1/residents/:id/contacts/:slot/reset-password', // Old format (backward compatibility)
  ResetContactPasswordByID = '/admin/api/v1/contacts/:contact_id/reset-password', // New format (uses contact_id directly)
  GetAccountSettings = '/admin/api/v1/residents/:id/account-settings',
  UpdateAccountSettings = '/admin/api/v1/residents/:id/account-settings',
}

// Mock mode: In development, use mock data instead of real API calls
// Check VITE_USE_MOCK='true' in .env file to enable mock
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

// Display mock status in console
if (useMock) {
  console.log('%c[Mock] Resident API Mock enabled - Using test data', 'color: #52c41a; font-weight: bold')
}

/**
 * @description: Get resident list
 * @param params - Query parameters (optional search keyword, status filter, etc.)
 * @param mode - Error message mode
 */
export function getResidentsApi(params?: GetResidentsParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.get<GetResidentsResult>(
    {
      url: Api.GetList,
      params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Get resident detail
 * @param residentId - Resident ID
 * @param params - Query parameters (include_phi, include_contacts)
 * @param mode - Error message mode
 */
export function getResidentApi(
  residentId: string,
  params?: GetResidentParams,
  mode: ErrorMessageMode = 'modal',
) {
  return defHttp.get<Resident>(
    {
      url: Api.GetDetail.replace(':id', residentId),
      params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Create resident
 * @param params - Create resident parameters
 * @param mode - Error message mode
 */
export function createResidentApi(params: CreateResidentParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<CreateResidentResult>(
    {
      url: Api.Create,
      data: params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Update resident
 * @param residentId - Resident ID
 * @param params - Update resident parameters
 * @param mode - Error message mode
 */
export function updateResidentApi(
  residentId: string,
  params: UpdateResidentParams,
  mode: ErrorMessageMode = 'modal',
) {
  return defHttp.put<{ success: boolean }>(
    {
      url: Api.Update.replace(':id', residentId),
      data: params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Delete resident
 * @param residentId - Resident ID
 * @param mode - Error message mode
 */
export function deleteResidentApi(residentId: string, mode: ErrorMessageMode = 'modal') {
  return defHttp.delete<{ success: boolean }>(
    {
      url: Api.Delete.replace(':id', residentId),
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Update resident PHI
 * @param residentId - Resident ID
 * @param params - Update PHI parameters
 * @param mode - Error message mode
 */
export function updateResidentPHIApi(
  residentId: string,
  params: UpdateResidentPHIParams,
  mode: ErrorMessageMode = 'modal',
) {
  return defHttp.put<{ success: boolean }>(
    {
      url: Api.UpdatePHI.replace(':id', residentId),
      data: params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Reset resident password
 * @param residentId - Resident ID
 * @param password - New password
 * @param mode - Error message mode
 */
export function resetResidentPasswordApi(
  residentId: string,
  password: string,
  mode: ErrorMessageMode = 'modal',
) {
  console.log('%c[Mock] Reset Resident Password API Request', 'color: #1890ff; font-weight: bold', { residentId, password })
  
  return defHttp.post(
    {
      url: Api.ResetPassword.replace(':id', residentId),
      data: { password_hash: password },
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Reset contact password by contact_id (recommended - each slot is independent)
 * @param contactId - Contact ID (UUID)
 * @param password - New password (plain text, will be hashed before sending)
 * @param mode - Error message mode
 */
export async function resetContactPasswordApi(
  contactId: string,
  password: string,
  mode: ErrorMessageMode = 'modal',
) {
  // Import hashPassword function
  const { hashPassword } = await import('@/utils/crypto')
  
  // Hash password: SHA256(password) → hex string
  const passwordHash = await hashPassword(password)
  
  console.log('%c[Mock] Reset Contact Password API Request', 'color: #1890ff; font-weight: bold', { contactId, passwordHash })
  
  return defHttp.post(
    {
      url: Api.ResetContactPasswordByID.replace(':contact_id', contactId),
      data: { password_hash: passwordHash }, // Send hashed password (hex string)
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Reset contact password by resident_id and slot (backward compatibility)
 * @param residentId - Resident ID
 * @param slot - Contact slot (A, B, C, D, E)
 * @param password - New password
 * @param mode - Error message mode
 * @deprecated Use resetContactPasswordApi(contactId, password) instead
 */
export function resetContactPasswordBySlotApi(
  residentId: string,
  slot: string,
  password: string,
  mode: ErrorMessageMode = 'modal',
) {
  console.log('%c[Mock] Reset Contact Password API Request', 'color: #1890ff; font-weight: bold', { residentId, slot, password })
  
  return defHttp.post(
    {
      url: Api.ResetContactPassword.replace(':id', residentId).replace(':slot', slot),
      data: { password },
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Update resident contact
 * @param residentId - Resident ID
 * @param params - Update contact parameters
 * @param mode - Error message mode
 */
export function updateResidentContactApi(
  residentId: string,
  params: UpdateResidentContactParams,
  mode: ErrorMessageMode = 'modal',
) {
  // Update contact by resident ID and contact params
  return defHttp.put<{ success: boolean }>(
    {
      url: Api.UpdateContact.replace(':id', residentId),
      data: params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @deprecated Use /api/account/accountSettings.ts instead
 * This function was used by Sidebar.vue but has been moved to accountSettings API
 * 
 * @description: Get resident/contact account settings
 * @param residentId - Resident ID or contact ID
 * @param mode - Error message mode
 */
/*
export function getResidentAccountSettingsApi(residentId: string, mode: ErrorMessageMode = 'modal') {
  // Production: Call real backend API
  return defHttp.get<{
    resident_account?: string
    nickname: string
    email?: string
    phone?: string
    is_contact: boolean
    save_email?: boolean
    save_phone?: boolean
  }>(
    {
      url: Api.GetAccountSettings.replace(':id', residentId),
    },
    { errorMessageMode: mode },
  )
}
*/

/**
 * @deprecated Use /api/account/accountSettings.ts instead
 * This function was used by Sidebar.vue but has been moved to accountSettings API
 * 
 * @description: Update resident/contact account settings (unified API)
 * @param residentId - Resident ID or contact ID
 * @param params - Update account settings parameters
 * @param mode - Error message mode
 */
/*
export function updateResidentAccountSettingsApi(
  residentId: string,
  params: {
    password_hash?: string
    email?: string | null
    email_hash?: string
    phone?: string | null
    phone_hash?: string
    save_email?: boolean
    save_phone?: boolean
  },
  mode: ErrorMessageMode = 'modal',
) {
  // Production: Call real backend API
  return defHttp.put<{ success: boolean; message?: string }>(
    {
      url: Api.UpdateAccountSettings.replace(':id', residentId),
      data: params,
    },
    { errorMessageMode: mode },
  )
}
*/

