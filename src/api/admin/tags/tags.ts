/**
 * Tags API 接口定义
 * 用于管理 tags_catalog 表中的 tags
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  TagCatalogItem,
  GetTagsParams,
  GetTagsResult,
  CreateTagParams,
  CreateTagResult,
  UpdateTagParams,
  DeleteTagParams,
  RemoveTagObjectsParams,
  DeleteTagTypeParams,
  GetTagsForObjectParams,
  TagForObject,
} from './model/tagsModel'

// 定义 API 路径枚举
export enum Api {
  GetList = '/admin/api/v1/tags',
  Create = '/admin/api/v1/tags',
  Update = '/admin/api/v1/tags/:id',
  Delete = '/admin/api/v1/tags',
  RemoveObjects = '/admin/api/v1/tags/:id/objects',
  DeleteTagType = '/admin/api/v1/tags/types',
  GetTagsForObject = '/admin/api/v1/tags/for-object',
}

// Mock mode: In development, use mock data instead of real API calls
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

// Display mock status in console
if (useMock) {
  console.log('%c[Mock] Tags API Mock enabled - Using test data', 'color: #52c41a; font-weight: bold')
}

/**
 * @description: 获取 Tags 列表
 * @param params - 查询参数
 * @param mode - 错误消息模式
 */
export function getTagsApi(params?: GetTagsParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ tags }) => {
      console.log('%c[Mock] Get Tags API Request', 'color: #1890ff; font-weight: bold', { params })
      return tags.mock.mockGetTags(params).then((result) => {
        console.log('%c[Mock] Get Tags API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Get Tags API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  return defHttp.get<GetTagsResult>(
    {
      url: Api.GetList,
      params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: 创建 Tag
 * @param params - 创建 Tag 参数
 * @param mode - 错误消息模式
 */
export function createTagApi(params: CreateTagParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ tags }) => {
      console.log('%c[Mock] Create Tag API Request', 'color: #1890ff; font-weight: bold', { params })
      return tags.mock.mockCreateTag(params).then((result) => {
        console.log('%c[Mock] Create Tag API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Create Tag API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  return defHttp.post<CreateTagResult>(
    {
      url: Api.Create,
      data: params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: 更新 Tag
 * @param tagId - Tag ID
 * @param params - 更新 Tag 参数
 * @param mode - 错误消息模式
 */
export function updateTagApi(tagId: string, params: UpdateTagParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ tags }) => {
      console.log('%c[Mock] Update Tag API Request', 'color: #1890ff; font-weight: bold', { tagId, params })
      return tags.mock.mockUpdateTag(tagId, params).then((result) => {
        console.log('%c[Mock] Update Tag API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Update Tag API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  return defHttp.put<{ success: boolean }>(
    {
      url: Api.Update.replace(':id', tagId),
      data: params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: 删除 Tag
 * @param params - 删除 Tag 参数（需要 tenant_id 和 tag_name）
 * @param mode - 错误消息模式
 */
export function deleteTagApi(params: DeleteTagParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ tags }) => {
      console.log('%c[Mock] Delete Tag API Request', 'color: #1890ff; font-weight: bold', { params })
      return tags.mock.mockDeleteTag(params).then((result) => {
        console.log('%c[Mock] Delete Tag API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Delete Tag API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  // 注意：tag_name 全局唯一，不需要 tag_type
  return defHttp.delete<{ success: boolean }>(
    {
      url: Api.Delete,
      params: {
        tenant_id: params.tenant_id,
        tag_name: params.tag_name,
      },
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: 删除 Tag 中的对象
 * @param params - 删除对象参数
 * @param mode - 错误消息模式
 */
export function removeTagObjectsApi(params: RemoveTagObjectsParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ tags }) => {
      console.log('%c[Mock] Remove Tag Objects API Request', 'color: #1890ff; font-weight: bold', { params })
      return tags.mock.mockRemoveTagObjects(params).then((result) => {
        console.log('%c[Mock] Remove Tag Objects API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Remove Tag Objects API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  return defHttp.delete<{ success: boolean }>(
    {
      url: Api.RemoveObjects.replace(':id', params.tag_id),
      data: {
        object_type: params.object_type,
        object_ids: params.object_ids,
      },
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: 删除 Tag Type
 * @param params - 删除 Tag Type 参数
 * @param mode - 错误消息模式
 */
export function deleteTagTypeApi(params: DeleteTagTypeParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ tags }) => {
      console.log('%c[Mock] Delete Tag Type API Request', 'color: #1890ff; font-weight: bold', { params })
      return tags.mock.mockDeleteTagType(params).then((result) => {
        console.log('%c[Mock] Delete Tag Type API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Delete Tag Type API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  return defHttp.delete<{ success: boolean }>(
    {
      url: Api.DeleteTagType,
      params,
    },
    { errorMessageMode: mode },
  )
}

/**
 * @description: 查询对象在哪些 tag 中被使用
 * @param params - 查询参数
 * @param mode - 错误消息模式
 */
export function getTagsForObjectApi(params: GetTagsForObjectParams, mode: ErrorMessageMode = 'modal') {
  // In development with mock enabled, return mock data directly
  if (useMock) {
    return import('@test/index').then(({ tags }) => {
      console.log('%c[Mock] Get Tags For Object API Request', 'color: #1890ff; font-weight: bold', { params })
      return tags.mock.mockGetTagsForObject(params).then((result) => {
        console.log('%c[Mock] Get Tags For Object API - Success', 'color: #52c41a; font-weight: bold', { result })
        return result
      }).catch((error: any) => {
        console.log('%c[Mock] Get Tags For Object API - Failed', 'color: #ff4d4f; font-weight: bold', { error: error.message })
        throw error
      })
    })
  }

  // Production: Call real backend API
  return defHttp.get<TagForObject[]>(
    {
      url: Api.GetTagsForObject,
      params,
    },
    { errorMessageMode: mode },
  )
}

