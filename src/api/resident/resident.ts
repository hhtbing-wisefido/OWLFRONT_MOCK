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
}

// Mock mode: In development, use mock data instead of real API calls
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

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
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ residents }) => {
      console.log('%c[Mock] Get Residents API Request', 'color: #1890ff; font-weight: bold', { params })
      return residents.mockGetResidents(params).then((result) => {
        console.log('%c[Mock] Get Residents API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Get Residents API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real API
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
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ residents }) => {
      console.log('%c[Mock] Get Resident API Request', 'color: #1890ff; font-weight: bold', { residentId, params })
      return residents.mockGetResident(residentId, params).then((result) => {
        console.log('%c[Mock] Get Resident API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Get Resident API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real API
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
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ residents }) => {
      console.log('%c[Mock] Create Resident API Request', 'color: #1890ff; font-weight: bold', { params })
      return residents.mockCreateResident(params).then((result) => {
        console.log('%c[Mock] Create Resident API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Create Resident API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real API
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
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ residents }) => {
      console.log('%c[Mock] Update Resident API Request', 'color: #1890ff; font-weight: bold', { residentId, params })
      return residents.mockUpdateResident(residentId, params).then((result) => {
        console.log('%c[Mock] Update Resident API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Update Resident API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real API
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
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ residents }) => {
      console.log('%c[Mock] Delete Resident API Request', 'color: #1890ff; font-weight: bold', { residentId })
      return residents.mockDeleteResident(residentId).then((result) => {
        console.log('%c[Mock] Delete Resident API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Delete Resident API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real API
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
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ residents }) => {
      console.log('%c[Mock] Update Resident PHI API Request', 'color: #1890ff; font-weight: bold', { residentId, params })
      return residents.mockUpdateResidentPHI(residentId, params).then((result) => {
        console.log('%c[Mock] Update Resident PHI API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Update Resident PHI API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.put<{ success: boolean }>(
    {
      url: Api.UpdatePHI.replace(':id', residentId),
      data: params,
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
  // 如果提供了 contact_id，使用 contact_id；否则使用 slot
  // API 路径可能需要调整，这里先保持原样
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ residents }) => {
      console.log('%c[Mock] Update Resident Contact API Request', 'color: #1890ff; font-weight: bold', { residentId, params })
      return residents.mockUpdateResidentContact(residentId, params).then((result) => {
        console.log('%c[Mock] Update Resident Contact API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Update Resident Contact API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real API
  return defHttp.put<{ success: boolean }>(
    {
      url: Api.UpdateContact.replace(':id', residentId),
      data: params,
    },
    { errorMessageMode: mode },
  )
}

