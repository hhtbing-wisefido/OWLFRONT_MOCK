/**
 * 示例 API 文件
 * 展示如何使用 defHttp 进行接口调用
 * 保持与原 wisefido-frontend 项目相同的接口模式
 */

import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type { BasicFetchResult } from '@/api/model/baseModel'

// 定义 API 路径枚举
export enum Api {
  GetList = '/api/v1/example/items',
  GetDetail = '/api/v1/example/:id',
  Create = '/api/v1/example/item',
  Update = '/api/v1/example/:id',
  Delete = '/api/v1/example/:id',
}

// 定义数据模型
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
 * @description: 获取列表
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
 * @description: 获取详情
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
 * @description: 创建
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
 * @description: 更新
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
 * @description: 删除
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

