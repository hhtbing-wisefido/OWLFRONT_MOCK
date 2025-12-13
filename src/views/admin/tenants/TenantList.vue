<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <div class="text-lg font-semibold">Tenant Management</div>
      <a-space>
        <a-input
          v-model:value="createForm.tenant_name"
          style="width: 220px"
          placeholder="Tenant name"
        />
        <a-input
          v-model:value="createForm.domain"
          style="width: 220px"
          placeholder="Domain"
        />
        <a-input
          v-model:value="createForm.email"
          style="width: 220px"
          placeholder="Admin email (optional)"
        />
        <a-input
          v-model:value="createForm.phone"
          style="width: 180px"
          placeholder="Admin phone (optional)"
        />
        <a-select
          v-model:value="createForm.status"
          style="width: 160px"
          :options="statusOptionsNoAll"
          :disabled="isEditMode"
        />
        <a-button v-if="isEditMode" :disabled="createLoading" @click="cancelEdit">
          Cancel
        </a-button>
        <a-button type="primary" :loading="createLoading" @click="submitTopForm">
          {{ isEditMode ? 'Edit Tenant' : 'Create Tenant' }}
        </a-button>
      </a-space>
    </div>

    <a-table
      :columns="columns"
      :data-source="displayDataSource"
      :loading="loading"
      rowKey="tenant_id"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <a-space>
            <a-button size="small" @click="startEdit(record)">
              Edit
            </a-button>
            <a-popconfirm
              title="Reset ADMIN password for this tenant?"
              :disabled="isSystemTenant(record.tenant_id)"
              @confirm="resetBootstrapAccount(record.tenant_id)"
            >
              <a-button size="small" :disabled="isSystemTenant(record.tenant_id)">ResetPW Admin</a-button>
            </a-popconfirm>
            <a-button
              size="small"
              @click="setStatus(record.tenant_id, 'active')"
              :disabled="record.status === 'active'"
            >
              Enable
            </a-button>
            <a-button
              size="small"
              danger
              @click="setStatus(record.tenant_id, 'suspended')"
              :disabled="isSystemTenant(record.tenant_id) || record.status === 'suspended'"
            >
              Disable
            </a-button>
            <a-popconfirm
              title="Soft delete this tenant?"
              :disabled="isSystemTenant(record.tenant_id) || record.status === 'deleted'"
              @confirm="deleteTenant(record.tenant_id)"
            >
              <a-button size="small" danger :disabled="isSystemTenant(record.tenant_id) || record.status === 'deleted'">
                Delete
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'

import {
  createTenantApi,
  deleteTenantApi,
  getTenantsApi,
  resetTenantBootstrapAccountApi,
  updateTenantApi,
} from '@/api/admin/tenants/tenants'
import type { Tenant, TenantStatus } from '@/api/admin/tenants/model/tenantModel'

const props = defineProps<{
  systemTenantId?: string
}>()

const SYSTEM_TENANT_ID = props.systemTenantId || '00000000-0000-0000-0000-000000000001'

const loading = ref(false)
const dataSource = ref<Tenant[]>([])

const page = ref(1)
const size = ref(20)
const total = ref(0)

type SortField = 'tenant_name' | 'status' | null
type SortOrder = 'ascend' | 'descend' | null
const sortField = ref<SortField>(null)
const sortOrder = ref<SortOrder>(null)

const pagination = computed<TablePaginationConfig>(() => ({
  current: page.value,
  pageSize: size.value,
  total: total.value,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
}))

const statusOptions = [
  { label: 'active', value: 'active' },
  { label: 'suspended', value: 'suspended' },
  { label: 'deleted', value: 'deleted' },
]
const statusOptionsNoAll = statusOptions

function isSystemTenant(tenantID: string) {
  return tenantID === SYSTEM_TENANT_ID
}

const columns = computed(() => [
  { title: 'Tenant ID', dataIndex: 'tenant_id', key: 'tenant_id', width: 280 },
  {
    title: 'Tenant Name',
    dataIndex: 'tenant_name',
    key: 'tenant_name',
    width: 200,
    sorter: true,
    sortOrder: sortField.value === 'tenant_name' ? sortOrder.value || undefined : undefined,
  },
  { title: 'Domain', dataIndex: 'domain', key: 'domain', width: 200 },
  { title: 'Email', dataIndex: 'email', key: 'email', width: 220 },
  { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 160 },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 140,
    sorter: true,
    sortOrder: sortField.value === 'status' ? sortOrder.value || undefined : undefined,
  },
  { title: 'Actions', key: 'actions', width: 380 },
])

const displayDataSource = computed(() => {
  const items = [...(dataSource.value || [])]
  if (!sortField.value || !sortOrder.value) return items

  const dir = sortOrder.value === 'ascend' ? 1 : -1
  const field = sortField.value
  return items.sort((a: any, b: any) => {
    const av = (a?.[field] ?? '').toString()
    const bv = (b?.[field] ?? '').toString()
    return av.localeCompare(bv, undefined, { sensitivity: 'base' }) * dir
  })
})

async function fetchTenants() {
  loading.value = true
  try {
    const res = await getTenantsApi({
      page: page.value,
      size: size.value,
    })
    dataSource.value = res.items || []
    total.value = res.total || 0
  } catch (e: any) {
    message.error('Failed to fetch tenants: ' + (e.message || 'Unknown error'))
  } finally {
    loading.value = false
  }
}

function handleTableChange(p: TablePaginationConfig, _filters: any, sorter: any) {
  page.value = p.current || 1
  size.value = p.pageSize || 20
  const s = Array.isArray(sorter) ? sorter[0] : sorter
  const field = (s?.field || s?.columnKey) as SortField
  const order = (s?.order || null) as SortOrder
  if (field === 'tenant_name' || field === 'status') {
    sortField.value = order ? field : null
    sortOrder.value = order
  } else {
    sortField.value = null
    sortOrder.value = null
  }
  fetchTenants()
}

// create
const createLoading = ref(false)
const createForm = reactive<{ tenant_name: string; domain?: string; email?: string; phone?: string; status: TenantStatus }>({
  tenant_name: '',
  domain: '',
  email: '',
  phone: '',
  status: 'active',
})

const editingTenantId = ref<string | null>(null)
const isEditMode = computed(() => !!editingTenantId.value)

function resetTopForm() {
  createForm.tenant_name = ''
  createForm.domain = ''
  createForm.email = ''
  createForm.phone = ''
  createForm.status = 'active'
}

function startEdit(t: Tenant) {
  editingTenantId.value = t.tenant_id
  createForm.tenant_name = t.tenant_name || ''
  createForm.domain = t.domain || ''
  createForm.email = t.email || ''
  createForm.phone = t.phone || ''
  createForm.status = t.status || 'active'
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch {
    // ignore
  }
}

function cancelEdit() {
  editingTenantId.value = null
  resetTopForm()
}

async function submitTopForm() {
  if (!createForm.tenant_name?.trim()) {
    message.error('Tenant name is required')
    return
  }
  createLoading.value = true
  try {
    if (editingTenantId.value) {
      await updateTenantApi(editingTenantId.value, {
        tenant_name: createForm.tenant_name.trim(),
        domain: createForm.domain?.trim() || undefined,
        email: createForm.email?.trim() || undefined,
        phone: createForm.phone?.trim() || undefined,
      })
      message.success('Tenant updated')
      editingTenantId.value = null
      resetTopForm()
    } else {
      const created: any = await createTenantApi({
        tenant_name: createForm.tenant_name.trim(),
        domain: createForm.domain?.trim() || undefined,
        email: createForm.email?.trim() || undefined,
        phone: createForm.phone?.trim() || undefined,
        status: createForm.status,
      })
      message.success('Tenant created')
      // Show bootstrap accounts once (dev/stub mode returns bootstrap_accounts)
      if (created?.bootstrap_accounts?.length) {
        const lines = created.bootstrap_accounts
          .map((x: any) => `${x.user_account} (${x.role})  password: ${x.temp_password}`)
          .join('\n')
        Modal.info({
          title: 'Bootstrap accounts created',
          content: lines,
        })
      }
      resetTopForm()
    }
    await fetchTenants()
  } catch (e: any) {
    message.error('Failed: ' + (e.message || 'Unknown error'))
  } finally {
    createLoading.value = false
  }
}

async function setStatus(id: string, st: TenantStatus) {
  if (isSystemTenant(id) && (st === 'suspended' || st === 'deleted')) {
    message.warning('System tenant cannot be disabled or deleted')
    return
  }
  try {
    await updateTenantApi(id, { status: st })
    message.success('Updated status')
    await fetchTenants()
  } catch (e: any) {
    message.error('Failed to update status: ' + (e.message || 'Unknown error'))
  }
}

async function deleteTenant(id: string) {
  if (isSystemTenant(id)) {
    message.warning('System tenant cannot be deleted')
    return
  }
  Modal.confirm({
    title: 'Confirm',
    content: 'This will set status to deleted (soft delete). Continue?',
    async onOk() {
      try {
        await deleteTenantApi(id)
        message.success('Deleted')
        await fetchTenants()
      } catch (e: any) {
        message.error('Failed to delete: ' + (e.message || 'Unknown error'))
      }
    },
  })
}

async function resetBootstrapAccount(id: string) {
  if (isSystemTenant(id)) {
    message.warning('System tenant bootstrap accounts are not reset here')
    return
  }
  try {
    const res: any = await resetTenantBootstrapAccountApi(id, 'admin')
    const lines = (res?.bootstrap_accounts || []).map((x: any) => `${x.user_account} (${x.role})  password: ${x.temp_password}`).join('\n')
    Modal.info({
      title: 'Bootstrap accounts reset',
      content: lines || 'No bootstrap accounts returned',
    })
  } catch (e: any) {
    message.error('Failed to reset bootstrap accounts: ' + (e.message || 'Unknown error'))
  }
}

onMounted(() => {
  fetchTenants()
})
</script>

<style scoped>
.p-4 {
  padding: 16px;
}
.mb-4 {
  margin-bottom: 16px;
}
</style>


