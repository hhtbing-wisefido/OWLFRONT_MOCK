import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  BatchUpdateDeviceStoresParams,
  GetDeviceStoresParams,
  GetDeviceStoresResult,
  ImportDeviceStoresResult,
  ExportDeviceStoresParams,
} from './model/deviceStoreModel'

export enum Api {
  DeviceStore = '/admin/api/v1/device-store',
  DeviceStoreBatch = '/admin/api/v1/device-store/batch',
  DeviceStoreImport = '/admin/api/v1/device-store/import',
  DeviceStoreImportTemplate = '/admin/api/v1/device-store/import-template',
  DeviceStoreExport = '/admin/api/v1/device-store/export',
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

  return defHttp.put<{ success: boolean; updated?: number }>(
    {
      url: Api.DeviceStoreBatch,
      data: { updates },
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Import device stores from file
 * @param file - Excel/CSV file to import
 * @param mode - Error message mode
 */
export async function importDeviceStoresApi(
  file: File,
  mode: ErrorMessageMode = 'modal',
): Promise<ImportDeviceStoresResult> {
  if (useMock) {
    const { deviceStore } = await import('@test/index')
    // TODO: Implement mock import when available
    return deviceStore.mock.mockImportDeviceStores(file).catch(() => ({
      success: true,
      total: 0,
      success_count: 0,
      failed_count: 0,
      skipped_count: 0,
    }))
  }

  const formData = new FormData()
  formData.append('file', file)

  return defHttp.post<ImportDeviceStoresResult>(
    {
      url: Api.DeviceStoreImport,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: Download import template
 * @param mode - Error message mode
 */
export async function getImportTemplateApi(
  mode: ErrorMessageMode = 'modal',
): Promise<Blob> {
  if (useMock) {
    // TODO: Return mock template file when available
    return Promise.resolve(new Blob(['Mock template'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  }

  return defHttp.get<Blob>(
    {
      url: Api.DeviceStoreImportTemplate,
      responseType: 'blob',
    },
    { errorMessageMode: mode, isReturnNativeResponse: true },
  ).then((response) => {
    // Extract blob from response
    return response instanceof Blob ? response : response.data
  })
}

/**
 * @description: Export device stores
 * @param params - Export parameters
 * @param mode - Error message mode
 */
export async function exportDeviceStoresApi(
  params: ExportDeviceStoresParams = {},
  mode: ErrorMessageMode = 'modal',
): Promise<Blob> {
  if (useMock) {
    // TODO: Return mock export file when available
    return Promise.resolve(new Blob(['Mock export'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  }

  const response = await defHttp.get<Blob>(
    {
      url: Api.DeviceStoreExport,
      params,
      responseType: 'blob',
    },
    { errorMessageMode: mode, isReturnNativeResponse: true },
  )
  // Extract blob from response
  return response instanceof Blob ? response : (response as any).data
}
