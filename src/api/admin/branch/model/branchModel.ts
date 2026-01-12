/**
 * Branch (分支机构) 相关类型定义
 * 对应数据库 branches 表
 */

/**
 * Branch 基础信息
 */
export interface Branch {
  branch_id: string
  branch_name: string
  tenant_id: string
  description?: string
  created_at?: string
  updated_at?: string
}

/**
 * 获取 Branches 列表的响应
 */
export interface GetBranchesResult {
  items: Branch[]
  total: number
}

/**
 * 创建 Branch 的参数
 */
export interface CreateBranchParams {
  branch_name: string
  description?: string
}

/**
 * 更新 Branch 的参数
 */
export interface UpdateBranchParams {
  branch_id: string
  branch_name?: string
  description?: string
}
