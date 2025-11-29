/**
 * Example API file
 * Demonstrates how to use defHttp for API calls
 * Maintains the same interface pattern as the original wisefido-frontend project
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type { BasicFetchResult } from '@/api/model/baseModel'

// Define API path enum
export enum Api {
  GetList = '/api/v1/example/items',
  GetDetail = '/api/v1/example/:id',
  Create = '/api/v1/example/item',
  Update = '/api/v1/example/:id',
  Delete = '/api/v1/example/:id',
}

// Define data model
export interface ExampleItem {
  id: string
  name: string
  description: string
  createdAt: Date
}

export interface ExampleDetail extends ExampleItem {
  content: string
  updatedAt: Date
}

export interface CreateExampleParams {
  name: string
  description: string
  content: string
}

export interface CreateExampleResult {
  id: string
}

/**
 * @description: Get list
 */
export function getExampleListApi(params?: any, mode: ErrorMessageMode = 'modal') {
  return defHttp.get<BasicFetchResult<ExampleItem>>(
    {
      url: Api.GetList,
      params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: Get detail
 */
export function getExampleDetailApi(id: string, mode: ErrorMessageMode = 'modal') {
  return defHttp.get<ExampleDetail>(
    {
      url: Api.GetDetail.replace(':id', id),
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: Create
 */
export function createExampleApi(params: CreateExampleParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<CreateExampleResult>(
    {
      url: Api.Create,
      params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: Update
 */
export function updateExampleApi(id: string, params: Partial<CreateExampleParams>, mode: ErrorMessageMode = 'modal') {
  return defHttp.put(
    {
      url: Api.Update.replace(':id', id),
      params,
    },
    {
      errorMessageMode: mode,
    },
  )
}

/**
 * @description: Delete
 */
export function deleteExampleApi(id: string, mode: ErrorMessageMode = 'modal') {
  return defHttp.delete(
    {
      url: Api.Delete.replace(':id', id),
    },
    {
      errorMessageMode: mode,
    },
  )
}

