import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  BatchUpdateDeviceStoresParams,
  GetDeviceStoresParams,
  GetDeviceStoresResult,
} from './model/deviceStoreModel'

export enum Api {
  DeviceStore = '/admin/api/v1/device-store',
  DeviceStoreBatch = '/admin/api/v1/device-store/batch',
}

// DEV 默认走真实后端；只有显式设置 VITE_USE_MOCK='true' 才启用 mock
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

export async function getDeviceStoresApi(
  params: GetDeviceStoresParams = {},
  mode: ErrorMessageMode = 'none',
): Promise<GetDeviceStoresResult> {
  if (useMock) {
    const { deviceStore } = await import('@test/index')
    const data = await deviceStore.mock.mockGetDeviceStores()
    return { items: data.items, total: data.items.length }
  }
  return defHttp.get<GetDeviceStoresResult>(
    {
      url: Api.DeviceStore,
      params,
    },
    { errorMessageMode: mode },
  )
}

export async function batchUpdateDeviceStoresApi(
  updates: BatchUpdateDeviceStoresParams['updates'],
  mode: ErrorMessageMode = 'modal',
): Promise<{ success: boolean; updated?: number } | any> {
  if (useMock) {
    const { deviceStore } = await import('@test/index')
    await deviceStore.mock.mockBatchUpdateDeviceStores(updates)
    return { success: true, updated: updates.length }
  }

  return defHttp.put(
    {
      url: Api.DeviceStoreBatch,
      data: { updates },
    },
    { errorMessageMode: mode },
  )
}
