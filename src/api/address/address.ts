/**
 * Address API functions
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  Address,
  CreateAddressParams,
  UpdateAddressParams,
  GetAddressesParams,
  GetAddressesResult,
  AllocateCarrierParams,
  AllocateResidentParams,
  AllocateDeviceParams,
} from './model/addressModel'

export enum Api {
  CreateAddress = '/admin/api/v1/addresses',
  GetAddresses = '/admin/api/v1/addresses',
  GetAddressDetail = '/admin/api/v1/addresses/:id',
  UpdateAddress = '/admin/api/v1/addresses/:id',
  DeleteAddress = '/admin/api/v1/addresses/:id',
  // Allocate related APIs (reserved, to be implemented later)
  AllocateCarrier = '/admin/api/v1/addresses/:id/allocate/carrier',
  AllocateResident = '/admin/api/v1/addresses/:id/allocate/resident',
  AllocateDevice = '/admin/api/v1/addresses/:id/allocate/device',
}

// Mock mode: In development, use mock data instead of real API calls
// DEV 默认走真实后端；只有显式设置 VITE_USE_MOCK='true' 才启用 mock
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

if (useMock) {
  console.log('%c[Mock] Address API Mock enabled', 'color: #52c41a; font-weight: bold')
}

/**
 * Create Address
 */
export async function createAddressApi(
  params: CreateAddressParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Address> {
  if (useMock) {
    // TODO: Implement Mock function
    const mockAddress: Address = {
      address_id: `addr-${Date.now()}`,
      tenant_id: 'default-tenant',
      address_name: params.address_name,
      address_type: params.address_type || 'institution',
      description: params.description,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return Promise.resolve(mockAddress)
  }

  return defHttp.post<Address>(
    {
      url: Api.CreateAddress,
      data: params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * Get Address list
 */
export async function getAddressesApi(
  params?: GetAddressesParams,
  mode: ErrorMessageMode = 'none'
): Promise<GetAddressesResult> {
  if (useMock) {
    // TODO: Implement Mock function
    const mockAddresses: Address[] = [
      {
        address_id: 'addr-1',
        tenant_id: 'default-tenant',
        address_name: 'Main Building',
        address_type: 'institution',
        is_active: true,
      },
    ]
    return Promise.resolve({
      items: mockAddresses,
      total: mockAddresses.length,
    })
  }

  return defHttp.get<GetAddressesResult>(
    {
      url: Api.GetAddresses,
      params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * Get Address detail
 */
export async function getAddressDetailApi(
  addressId: string,
  mode: ErrorMessageMode = 'none'
): Promise<Address> {
  if (useMock) {
    // TODO: Implement Mock function
    const mockAddress: Address = {
      address_id: addressId,
      tenant_id: 'default-tenant',
      address_name: 'Main Building',
      address_type: 'institution',
      is_active: true,
    }
    return Promise.resolve(mockAddress)
  }

  return defHttp.get<Address>(
    {
      url: Api.GetAddressDetail.replace(':id', addressId),
    },
    { errorMessageMode: mode }
  )
}

/**
 * Update Address
 */
export async function updateAddressApi(
  addressId: string,
  params: UpdateAddressParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Address> {
  if (useMock) {
    // TODO: Implement Mock function
    const mockAddress: Address = {
      address_id: addressId,
      tenant_id: 'default-tenant',
      address_name: params.address_name || 'Main Building',
      address_type: params.address_type || 'institution',
      is_active: params.is_active !== undefined ? params.is_active : true,
    }
    return Promise.resolve(mockAddress)
  }

  return defHttp.put<Address>(
    {
      url: Api.UpdateAddress.replace(':id', addressId),
      data: params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * Delete Address
 */
export async function deleteAddressApi(
  addressId: string,
  mode: ErrorMessageMode = 'modal'
): Promise<void> {
  if (useMock) {
    // TODO: Implement Mock function
    return Promise.resolve()
  }

  return defHttp.delete<void>(
    {
      url: Api.DeleteAddress.replace(':id', addressId),
    },
    { errorMessageMode: mode }
  )
}

/**
 * Allocate Carrier (reserved, to be implemented later)
 */
export async function allocateCarrierApi(
  addressId: string,
  params: AllocateCarrierParams,
  mode: ErrorMessageMode = 'modal'
): Promise<void> {
  if (useMock) {
    // TODO: Implement Mock function
    return Promise.resolve()
  }

  return defHttp.post<void>(
    {
      url: Api.AllocateCarrier.replace(':id', addressId),
      data: params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * Allocate Resident (reserved, to be implemented later)
 */
export async function allocateResidentApi(
  addressId: string,
  params: AllocateResidentParams,
  mode: ErrorMessageMode = 'modal'
): Promise<void> {
  if (useMock) {
    // TODO: Implement Mock function
    return Promise.resolve()
  }

  return defHttp.post<void>(
    {
      url: Api.AllocateResident.replace(':id', addressId),
      data: params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * Allocate Device (reserved, to be implemented later)
 */
export async function allocateDeviceApi(
  addressId: string,
  params: AllocateDeviceParams,
  mode: ErrorMessageMode = 'modal'
): Promise<void> {
  if (useMock) {
    // TODO: Implement Mock function
    return Promise.resolve()
  }

  return defHttp.post<void>(
    {
      url: Api.AllocateDevice.replace(':id', addressId),
      data: params,
    },
    { errorMessageMode: mode }
  )
}

