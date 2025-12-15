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

// DEV 默认走真实后端；只有显式设置 VITE_USE_MOCK='true' 才启用 mock
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

export async function getTenantsApi(
  params: GetTenantsParams,
  mode: ErrorMessageMode = 'none'
): Promise<GetTenantsResult> {
  if (useMock) {
    return { items: [], total: 0 }
  }
  return defHttp.get<GetTenantsResult>(
    {
      url: Api.Tenants,
      params,
    },
    { errorMessageMode: mode }
  )
}

export async function createTenantApi(
  data: CreateTenantParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Tenant> {
  if (useMock) {
    return {
      tenant_id: 'mock-tenant',
      tenant_name: data.tenant_name,
      domain: data.domain,
      email: data.email,
      phone: data.phone,
      status: data.status || 'active',
      metadata: data.metadata,
    }
  }
  return defHttp.post<Tenant>(
    {
      url: Api.Tenants,
      data,
    },
    { errorMessageMode: mode }
  )
}

export async function updateTenantApi(
  id: string,
  data: UpdateTenantParams,
  mode: ErrorMessageMode = 'modal'
): Promise<Tenant> {
  if (useMock) {
    return {
      tenant_id: id,
      tenant_name: data.tenant_name || 'mock',
      domain: data.domain,
      email: data.email,
      phone: data.phone,
      status: data.status || 'active',
      metadata: data.metadata,
    }
  }
  return defHttp.put<Tenant>(
    {
      url: Api.TenantByID.replace(':id', id),
      data,
    },
    { errorMessageMode: mode }
  )
}

export async function deleteTenantApi(
  id: string,
  mode: ErrorMessageMode = 'modal'
): Promise<void> {
  if (useMock) {
    return
  }
  return defHttp.delete<void>(
    {
      url: Api.TenantByID.replace(':id', id),
    },
    { errorMessageMode: mode }
  )
}

export async function resetTenantBootstrapAccountsApi(
  id: string,
  mode: ErrorMessageMode = 'modal'
): Promise<any> {
  if (useMock) {
    return {
      tenant_id: id,
      bootstrap_accounts: [
        { user_account: 'admin', role: 'Admin', temp_password: 'mock-admin-pass' },
      ],
    }
  }
  return defHttp.post<any>(
    {
      url: Api.TenantBootstrapReset.replace(':id', id),
    },
    { errorMessageMode: mode }
  )
}

export async function resetTenantBootstrapAccountApi(
  id: string,
  userAccount: 'admin',
  password?: string,
  mode: ErrorMessageMode = 'modal'
): Promise<any> {
  if (useMock) {
    return {
      tenant_id: id,
      bootstrap_accounts: [
        {
          user_account: userAccount,
          role: 'Admin',
          temp_password: password || 'mock-admin-pass',
        },
      ],
    }
  }
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


