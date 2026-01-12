/**
 * Branch (分支机构) API
 */

import { defHttp } from '@/utils/http/axios'
import type {
  Branch,
  GetBranchesResult,
  CreateBranchParams,
  UpdateBranchParams,
} from './model/branchModel'

enum Api {
  GetBranches = '/admin/api/v1/branches',
  CreateBranch = '/admin/api/v1/branches',
  UpdateBranch = '/admin/api/v1/branches',
  DeleteBranch = '/admin/api/v1/branches',
}

/**
 * 获取分支机构列表
 */
export async function getBranchesApi(): Promise<GetBranchesResult> {
  // 始终通过HTTP请求，让Mock拦截器处理
  return defHttp.get<GetBranchesResult>({
    url: Api.GetBranches,
  })
}

/**
 * 创建分支机构
 */
export async function createBranchApi(params: CreateBranchParams): Promise<Branch> {
  return defHttp.post<Branch>({
    url: Api.CreateBranch,
    params,
  })
}

/**
 * 更新分支机构
 */
export async function updateBranchApi(params: UpdateBranchParams): Promise<Branch> {
  const { branch_id, ...updateData } = params
  return defHttp.put<Branch>({
    url: `${Api.UpdateBranch}/${branch_id}`,
    params: updateData,
  })
}

/**
 * 删除分支机构
 */
export async function deleteBranchApi(branchId: string): Promise<void> {
  return defHttp.delete<void>({
    url: `${Api.DeleteBranch}/${branchId}`,
  })
}
