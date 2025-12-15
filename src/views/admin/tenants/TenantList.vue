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
            <a-button
              size="small"
              :disabled="isSystemTenant(record.tenant_id)"
              @click="handleResetAdminPassword(record.tenant_id)"
            >
              adminPasswd
            </a-button>
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

    <!-- Reset Admin Password Modal -->
    <a-modal
      v-model:visible="isResetAdminPasswordModalVisible"
      title="Reset Admin Password"
      width="500px"
      @ok="handleResetAdminPasswordConfirm"
      @cancel="handleCancelResetAdminPassword"
    >
      <template #footer>
        <div style="padding: 10px 16px">
          <a-button key="back" @click="handleCancelResetAdminPassword" style="margin-right: 30px">Cancel</a-button>
          <a-button key="submit" type="primary" @click="handleResetAdminPasswordConfirm" style="margin-right: 20px">
            Confirm
          </a-button>
        </div>
      </template>
      <a-form
        layout="horizontal"
        :model="resetAdminPasswordData"
        ref="resetAdminPasswordFormRef"
        :rules="resetAdminPasswordRules"
        :labelCol="{ span: 8 }"
        :wrapperCol="{ span: 16 }"
        style="padding: 20px"
      >
        <div style="margin-bottom: 16px; word-wrap: break-word; white-space: normal;">
          Password: At least 8 characters, including uppercase, lowercase, number, and special character
        </div>
        <a-form-item label="New Password" name="new_password" style="margin-bottom: 12px;">
          <a-input-password 
            placeholder="Please enter new password" 
            v-model:value="resetAdminPasswordData.new_password"
            @input="handleResetAdminPasswordInput"
            @blur="handleResetAdminPasswordBlur"
            :status="resetAdminPasswordErrorMessage ? 'error' : ''"
          />
        </a-form-item>
        <a-form-item label="Confirm Password" name="confirm_password">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <a-input-password 
              placeholder="Please confirm new password" 
              v-model:value="resetAdminPasswordData.confirm_password"
              @input="handleResetAdminPasswordConfirmInput"
              @blur="handleResetAdminPasswordConfirmBlur"
              :status="resetAdminPasswordErrorMessage ? 'error' : ''"
            />
            <a-button type="primary" @click="generateResetAdminPassword" style="align-self: flex-start;">
              Generate PW
            </a-button>
            <span v-if="resetAdminPasswordErrorMessage" style="color: #ff4d4f; font-size: 12px;">
              {{ resetAdminPasswordErrorMessage }}
            </span>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/lib/form'

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

// Reset Admin Password state (reuse UserList.vue logic)
const isResetAdminPasswordModalVisible = ref(false)
const resetAdminPasswordTenantId = ref('')
const resetAdminPasswordFormRef = ref()
const resetAdminPasswordData = ref({
  new_password: '',
  confirm_password: '',
})
const resetAdminPasswordErrorMessage = ref('')

// Password validation constants
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_SPECIAL_CHARS = '!@#$%^&*(),.?":{}|<>'

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

// Validate reset admin password strength (reuse UserList.vue logic)
const validateResetAdminPasswordStrength = (password: string): { isValid: boolean; errorMessage: string } => {
  if (!password) {
    return { isValid: false, errorMessage: '' }
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      errorMessage: 'Password must be at least 8 characters',
    }
  }

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = new RegExp(`[${PASSWORD_SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return {
      isValid: false,
      errorMessage: 'Password must include uppercase, lowercase, number, and special character',
    }
  }

  return { isValid: true, errorMessage: '' }
}

// Validate reset admin password confirmation (reuse UserList.vue logic)
const validateResetAdminPasswordConfirm = (): boolean => {
  if (!resetAdminPasswordData.value.confirm_password) {
    if (resetAdminPasswordData.value.new_password) {
      resetAdminPasswordErrorMessage.value = 'Please confirm your password'
    } else {
      resetAdminPasswordErrorMessage.value = ''
    }
    return false
  }

  if (resetAdminPasswordData.value.new_password !== resetAdminPasswordData.value.confirm_password) {
    resetAdminPasswordErrorMessage.value = 'Passwords do not match'
    return false
  }

  // If passwords match, also validate the password strength
  const strengthResult = validateResetAdminPasswordStrength(resetAdminPasswordData.value.new_password)
  resetAdminPasswordErrorMessage.value = strengthResult.errorMessage
  return strengthResult.isValid
}

// Handle reset admin password input (reuse UserList.vue logic)
const handleResetAdminPasswordInput = () => {
  if (!resetAdminPasswordData.value.new_password) {
    resetAdminPasswordErrorMessage.value = ''
    return
  }
  if (!resetAdminPasswordErrorMessage.value.includes('match')) {
    const result = validateResetAdminPasswordStrength(resetAdminPasswordData.value.new_password)
    resetAdminPasswordErrorMessage.value = result.errorMessage
  } else {
    validateResetAdminPasswordConfirm()
  }
}

// Handle reset admin password blur (reuse UserList.vue logic)
const handleResetAdminPasswordBlur = () => {
  if (resetAdminPasswordData.value.new_password) {
    const result = validateResetAdminPasswordStrength(resetAdminPasswordData.value.new_password)
    resetAdminPasswordErrorMessage.value = result.errorMessage

    // If password is valid, also check confirmation if it exists
    if (result.isValid && resetAdminPasswordData.value.confirm_password) {
      validateResetAdminPasswordConfirm()
    }
  }
}

// Handle reset admin password confirm input (reuse UserList.vue logic)
const handleResetAdminPasswordConfirmInput = () => {
  if (!resetAdminPasswordData.value.confirm_password) {
    if (!resetAdminPasswordData.value.new_password) {
      resetAdminPasswordErrorMessage.value = ''
    }
    return
  }
  validateResetAdminPasswordConfirm()
}

// Handle reset admin password confirm blur (reuse UserList.vue logic)
const handleResetAdminPasswordConfirmBlur = () => {
  if (resetAdminPasswordData.value.confirm_password) {
    validateResetAdminPasswordConfirm()
  }
}

// Generate random password for reset (reuse UserList.vue logic)
const generateResetAdminPassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = PASSWORD_SPECIAL_CHARS
  const allChars = uppercase + lowercase + numbers + special

  // Ensure at least one of each required type
  let password = ''
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly (minimum 8 chars total)
  for (let i = password.length; i < PASSWORD_MIN_LENGTH; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  const randomPassword = password.split('').sort(() => Math.random() - 0.5).join('')
  
  resetAdminPasswordData.value.new_password = randomPassword
  resetAdminPasswordData.value.confirm_password = randomPassword
  resetAdminPasswordErrorMessage.value = ''
}

// Check if reset admin password is valid (reuse UserList.vue logic)
const isResetAdminPasswordValid = computed(() => {
  if (!resetAdminPasswordData.value.new_password || !resetAdminPasswordData.value.confirm_password) {
    return false
  }
  const strengthResult = validateResetAdminPasswordStrength(resetAdminPasswordData.value.new_password)
  const confirmResult = resetAdminPasswordData.value.new_password === resetAdminPasswordData.value.confirm_password
  return strengthResult.isValid && confirmResult
})

// Reset Admin Password rules (reuse UserList.vue logic)
const resetAdminPasswordRules: Record<string, Rule[]> = {
  new_password: [
    { required: true, message: 'Please enter new password', trigger: 'blur' },
    { min: 8, message: 'Password must be at least 8 characters', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => {
        if (!value) return Promise.resolve()
        const result = validateResetAdminPasswordStrength(value)
        if (!result.isValid) {
          return Promise.reject(result.errorMessage)
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
  confirm_password: [
    { required: true, message: 'Please confirm password', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => {
        if (!value) return Promise.resolve()
        if (value !== resetAdminPasswordData.value.new_password) {
          return Promise.reject('Passwords do not match')
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
}

const handleResetAdminPassword = (tenantId: string) => {
  if (isSystemTenant(tenantId)) {
    message.warning('System tenant bootstrap accounts are not reset here')
    return
  }
  resetAdminPasswordTenantId.value = tenantId
  resetAdminPasswordData.value = {
    new_password: '',
    confirm_password: '',
  }
  resetAdminPasswordErrorMessage.value = ''
  isResetAdminPasswordModalVisible.value = true
}

const handleResetAdminPasswordConfirm = async () => {
  // Validate password strength first (reuse UserList.vue logic)
  if (!isResetAdminPasswordValid.value) {
    message.error(resetAdminPasswordErrorMessage.value || 'Please check password requirements')
    return
  }

  resetAdminPasswordFormRef.value
    .validate()
    .then(async () => {
      try {
        await resetTenantBootstrapAccountApi(
          resetAdminPasswordTenantId.value,
          'admin',
          resetAdminPasswordData.value.new_password
        )
        message.success('Admin password reset successfully')
        handleCancelResetAdminPassword()
      } catch (error: any) {
        console.error('Failed to reset admin password:', error)
        message.error(error?.message || 'Failed to reset admin password')
      }
    })
    .catch((error: any) => {
      console.error('Validation failed:', error)
    })
}

const handleCancelResetAdminPassword = () => {
  isResetAdminPasswordModalVisible.value = false
  resetAdminPasswordFormRef.value?.resetFields()
  // Clear password fields and error message
  resetAdminPasswordData.value = {
    new_password: '',
    confirm_password: '',
  }
  resetAdminPasswordErrorMessage.value = ''
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


