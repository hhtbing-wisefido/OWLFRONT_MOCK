import { defHttp } from '@/utils/http/axios'
import type { ErrorMessageMode } from '/#/axios'
import type {
  CreateTenantParams,
  GetTenantsParams,
  GetTenantsResult,
  Tenant,
  UpdateTenantParams,
} from './model/tenantModel'

export enum Api {
  Tenants = '/admin/api/v1/tenants',
  TenantByID = '/admin/api/v1/tenants/:id',
  TenantBootstrapReset = '/admin/api/v1/tenants/:id/bootstrap-accounts/reset',
}

/**
 * 获取租户列表
 */
export async function getTenantsApi(
  params: GetTenantsParams,
  mode: ErrorMessageMode = 'none'
): Promise<GetTenantsResult> {
  return defHttp.get<GetTenantsResult>(
    {
      url: Api.Tenants,
      params,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 创建租户
 */
export async function createTenantApi(
  data: CreateTenantParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Tenant> {
  return defHttp.post<Tenant>(
    {
      url: Api.Tenants,
      data,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 更新租户
 */
export async function updateTenantApi(
  id: string,
  data: UpdateTenantParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Tenant> {
  return defHttp.put<Tenant>(
    {
      url: Api.TenantByID.replace(':id', id),
      data,
    },
    { errorMessageMode: mode }
  )
}

/**
 * 删除租户
 */
export async function deleteTenantApi(
  id: string,
  mode: ErrorMessageMode = 'modal'
): Promise<void> {
  return defHttp.delete<void>(
    {
      url: Api.TenantByID.replace(':id', id),
    },
    { errorMessageMode: mode }
  )
}

/**
 * 重置租户引导账户
 */
export async function resetTenantBootstrapAccountsApi(
  id: string,
  mode: ErrorMessageMode = 'modal'
): Promise<any> {
  return defHttp.post<any>(
    {
      url: Api.TenantBootstrapReset.replace(':id', id),
    },
    { errorMessageMode: mode }
  )
}

/**
 * 重置租户引导账户密码
 */
export async function resetTenantBootstrapAccountApi(
  id: string,
  userAccount: 'admin',
  password?: string,
  mode: ErrorMessageMode = 'modal'
): Promise<any> {
  const data: any = {}
  if (password) {
    data.new_password = password
  }
  return defHttp.post<any>(
    {
      // NOTE: some defHttp wrappers don't forward POST `params` to querystring.
      // Build the querystring explicitly to ensure backend receives user_account.
      url: `${Api.TenantBootstrapReset.replace(':id', id)}?user_account=${encodeURIComponent(userAccount)}`,
      data,
    },
    { errorMessageMode: mode }
  )
}


