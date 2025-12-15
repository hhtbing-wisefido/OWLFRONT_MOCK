<template>
  <div style="padding: 15px">
    <div class="form-container">
      <div class="form-left">
        <a-form layout="inline" class="flex-form">
          <!-- Back and Home Icons -->
          <a-form-item>
            <a-space>
              <a-button type="text" @click="goBack" :title="'Back'">
                <template #icon>
                  <ArrowLeftOutlined />
                </template>
              </a-button>
              <a-button type="text" @click="goHome" :title="'Home'">
                <template #icon>
                  <HomeOutlined />
                </template>
              </a-button>
            </a-space>
          </a-form-item>
          <!-- Search Input -->
          <a-form-item class="flex-grow">
            <a-input
              v-model:value="searchText"
              placeholder="Enter something for searching"
              style="width: 400px"
              :allowClear="true"
              @pressEnter="onSearch"
            />
          </a-form-item>

          <!-- Search Button -->
          <a-form-item>
            <a-button type="primary" @click="onSearch">Search</a-button>
          </a-form-item>

          <!-- Create Role Button -->
          <a-form-item>
            <a-button type="primary" @click="addRole">Create Role</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>

    <a-table
      :dataSource="filteredDataSource"
      :columns="columns"
      :loading="loading"
      :pagination="false"
      :scroll="{ x: 'max-content' }"
      class="role-table"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'description'">
          <div class="description-content" v-html="formatDescription(record.description)"></div>
        </template>
        <template v-else-if="column.dataIndex === 'is_active'">
          <span :class="record.is_active ? 'status-active' : 'status-inactive'">
            {{ record.is_active ? 'Active' : 'Inactive' }}
          </span>
        </template>
        <template v-else-if="column.key === 'operation'">
          <div class="operation-buttons">
            <!-- Disable button: Critical system roles (SystemAdmin, SystemOperator, Admin, Manager, Caregiver, Resident, Family) cannot be disabled -->
            <a-button
              v-if="record.is_active"
              size="small"
              @click="disableRole(record)"
              :disabled="!canDisableRole(record)"
            >
              Disable
            </a-button>
            <!-- Edit button: Only SystemAdmin can edit roles (including system roles) -->
            <a-button 
              v-if="isSystemAdmin"
              size="small" 
              @click="editRole(record)"
            >
              Edit
            </a-button>
            <!-- Delete button: Only custom roles are shown -->
            <a-button
              v-if="!record.is_system"
              size="small"
              danger
              @click="deleteRole(record)"
            >
              Delete
            </a-button>
          </div>
        </template>
      </template>
    </a-table>

    <!-- Edit/Create Modal -->
    <a-modal
      v-model:visible="isEditModalVisible"
      :title="editModel ? 'Edit Role' : 'Create Role'"
      width="600px"
      @ok="handleSave"
      @cancel="handleCancel"
    >
      <template #footer>
        <div style="padding: 10px 16px">
          <a-button key="back" @click="handleCancel" style="margin-right: 30px">Cancel</a-button>
          <a-button key="submit" type="primary" @click="handleSave" style="margin-right: 20px">
            Confirm
          </a-button>
        </div>
      </template>
      <a-form
        layout="horizontal"
        :model="editData"
        ref="formEditRef"
        :rules="rules"
        :labelCol="{ span: 6 }"
        :wrapperCol="{ span: 18 }"
        style="padding: 20px"
      >
        <a-form-item label="Role Code" name="role_code">
          <a-input
            placeholder="Please enter role code (e.g., Admin, Director)"
            v-model:value="editData.role_code"
            :disabled="editModel || editData.is_system"
          />
        </a-form-item>
        <a-form-item label="Display Name" name="display_name">
          <a-input 
            placeholder="Please enter display name" 
            v-model:value="editData.display_name"
            :disabled="editData.is_system && !isSystemAdmin"
          />
        </a-form-item>
        <a-form-item label="Description" name="description">
          <a-textarea
            v-model:value="editData.description"
            :auto-size="{ minRows: 3, maxRows: 5 }"
            show-count
            :maxlength="500"
            :disabled="editData.is_system && !isSystemAdmin"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Confirm Modal -->
    <a-modal
      v-model:visible="isConfirmModalVisible"
      :title="confirmTitle"
      width="420px"
      @ok="handleConfirm"
      @cancel="handleCancelConfirm"
    >
      <template #footer>
        <div
          style="
            padding: 10px 16px;
            display: flex;
            flex-direction: row;
            justify-content: space-evenly;
            align-items: center;
          "
        >
          <a-button key="back" @click="handleCancelConfirm">Cancel</a-button>
          <a-button key="submit" type="primary" @click="handleConfirm">Confirm</a-button>
        </div>
      </template>
      <div style="text-align: center; margin: 16px">
        <ExclamationCircleOutlined style="font-size: 24px; width: 24px; color: #faad14" />
      </div>
      <div style="align-items: center; margin: 0 20px">
        <p style="text-align: left; margin-bottom: 24px">{{ confirmMessage }}</p>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ExclamationCircleOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/lib/form'
import { useUserStore } from '@/store/modules/user'

import {
  getRolesApi,
  createRoleApi,
  updateRoleApi,
} from '@/api/admin/role/role'
import type {
  GetRolesParams,
  CreateRoleParams,
  UpdateRoleParams,
} from '@/api/admin/role/model/roleModel'

const router = useRouter()
const userStore = useUserStore()
const currentUserRole = computed(() => userStore.getUserInfo?.role || '')
const isSystemAdmin = computed(() => currentUserRole.value === 'SystemAdmin')

// Navigate to home page
// Go back
const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/monitoring/overview')
}

// Format description to convert \n to <br> for proper line breaks
const formatDescription = (description: string | undefined): string => {
  if (!description) return ''
  // Convert \n to <br> and escape HTML to prevent XSS
  return description
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}

interface Role {
  role_id: string
  tenant_id?: string | null
  role_code: string
  display_name: string
  description?: string
  is_system: boolean
  is_active: boolean
}

const searchText = ref('')
const loading = ref(false)
const dataSource = ref<Role[]>([])
const filteredDataSource = ref<Role[]>([])
const isEditModalVisible = ref(false)
const isConfirmModalVisible = ref(false)
const editModel = ref(false)
const formEditRef = ref()
const action = ref('')
const affectedRoleId = ref('')
const confirmTitle = ref('')
const confirmMessage = ref('')

const emptyRole: Role = {
  role_id: '',
  tenant_id: null,
  role_code: '',
  display_name: '',
  description: '',
  is_system: false,
  is_active: true,
}

const editData = ref<Role>({ ...emptyRole })

const columns = [
  {
    title: 'Role Code',
    dataIndex: 'role_code',
    key: 'role_code',
    ellipsis: true,
    align: 'left',
    className: 'role-code-column',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    ellipsis: false,
    align: 'left',
    className: 'description-column',
  },
  {
    title: 'Status',
    dataIndex: 'is_active',
    key: 'is_active',
    width: 80,
    align: 'left',
  },
  {
    title: 'Operation',
    key: 'operation',
    fixed: 'right',
    width: 280,
    align: 'left',
  },
]

const rules: Record<string, Rule[]> = {
  role_code: [{ required: true, message: 'Please enter role code', trigger: 'blur' }],
  display_name: [{ required: true, message: 'Please enter display name', trigger: 'blur' }],
}

const onSearch = () => {
  let filtered = dataSource.value
  
  // System roles (SystemAdmin/SystemOperator) are platform-only.
  // Hide them from non-SystemAdmin users (ordinary tenants should not see/modify them).
  if (!isSystemAdmin.value) {
    filtered = dataSource.value.filter(
      (role) => role.role_code !== 'SystemAdmin' && role.role_code !== 'SystemOperator',
    )
  }
  
  if (!searchText.value || searchText.value.trim() === '') {
    filteredDataSource.value = filtered
    return
  }
  const searchLower = searchText.value.toLowerCase().trim()
  filteredDataSource.value = filtered.filter((role) => {
    return (
      role.role_code.toLowerCase().includes(searchLower) ||
      role.display_name.toLowerCase().includes(searchLower) ||
      (role.description && role.description.toLowerCase().includes(searchLower))
    )
  })
}

const addRole = () => {
  editData.value = { ...emptyRole }
  isEditModalVisible.value = true
  editModel.value = false
}

const editRole = (record: Role) => {
  // SystemAdmin can edit all roles (including system roles)
  editData.value = { ...record }
  isEditModalVisible.value = true
  editModel.value = true
}

const deleteRole = (record: Role) => {
  if (record.is_system) {
    message.warning('System roles cannot be deleted')
    return
  }
  action.value = 'delete'
  affectedRoleId.value = record.role_id
  confirmTitle.value = 'Delete Role'
  confirmMessage.value = `Are you sure you want to delete role "${record.display_name}" (${record.role_code})? This action cannot be undone.`
  isConfirmModalVisible.value = true
}

// Check if a role can be disabled
const canDisableRole = (record: Role): boolean => {
  // Critical system roles that cannot be disabled: SystemAdmin, SystemOperator, Admin, Manager, Caregiver, Resident, Family
  const protectedRoles = ['SystemAdmin', 'SystemOperator', 'Admin', 'Manager', 'Caregiver', 'Resident', 'Family']
  if (protectedRoles.includes(record.role_code)) {
    return false
  }
  // SystemAdmin can disable other system roles
  if (isSystemAdmin.value) {
    return true
  }
  // Non-SystemAdmin cannot disable system roles
  return !record.is_system
}

const disableRole = (record: Role) => {
  // Critical system roles that cannot be disabled: SystemAdmin, SystemOperator, Admin, Manager, Caregiver, Resident, Family
  const protectedRoles = ['SystemAdmin', 'SystemOperator', 'Admin', 'Manager', 'Caregiver', 'Resident', 'Family']
  if (protectedRoles.includes(record.role_code)) {
    message.warning(`${record.display_name} (${record.role_code}) is a critical system role and cannot be disabled. Disabling it would break business functionality.`)
    return
  }
  
  // SystemAdmin can disable other system roles
  if (isSystemAdmin.value) {
    action.value = 'disable'
    affectedRoleId.value = record.role_id
    confirmTitle.value = 'Disable Role'
    confirmMessage.value = `Are you sure you want to disable role "${record.display_name}" (${record.role_code})?`
    isConfirmModalVisible.value = true
    return
  }
  
  // Other system roles can only be disabled by SystemAdmin
  if (record.is_system) {
    message.warning('System roles can only be disabled by SystemAdmin')
    return
  }
  
  // Non-system roles can be disabled by Admin/Manager
  action.value = 'disable'
  affectedRoleId.value = record.role_id
  confirmTitle.value = 'Disable Role'
  confirmMessage.value = `Are you sure you want to disable role "${record.display_name}" (${record.role_code})?`
  isConfirmModalVisible.value = true
}

const handleSave = async () => {
  formEditRef.value
    .validate()
    .then(async () => {
      try {
        if (!editModel.value) {
          // Create new role (tenant custom role)
          const params: CreateRoleParams = {
            role_code: editData.value.role_code,
            display_name: editData.value.display_name,
            description: editData.value.description,
          }
          await createRoleApi(params)
          message.success('Role created successfully')
        } else {
          // Update role
          // System roles can only be modified by SystemAdmin (display_name and description only)
          if (editData.value.is_system && !isSystemAdmin.value) {
            message.error('System roles can only be modified by SystemAdmin')
            return
          }
          const params: UpdateRoleParams = {
            display_name: editData.value.display_name,
            description: editData.value.description,
          }
          await updateRoleApi(editData.value.role_id, params)
          message.success('Role updated successfully')
        }
        handleCancel()
        refreshData()
      } catch (error: any) {
        console.error('Failed to save role:', error)
        message.error(error?.message || 'Failed to save role')
      }
    })
    .catch((error: any) => {
      console.error('Validation failed:', error)
    })
}

const handleConfirm = async () => {
  try {
    if (action.value === 'delete') {
      const params: UpdateRoleParams = {
        _delete: true,
      }
      await updateRoleApi(affectedRoleId.value, params)
      message.success('Role deleted successfully')
    } else if (action.value === 'disable') {
      const params: UpdateRoleParams = {
        is_active: false,
      }
      await updateRoleApi(affectedRoleId.value, params)
      message.success('Role disabled successfully')
    }
    handleCancelConfirm()
    refreshData()
  } catch (error: any) {
    console.error('Failed to confirm action:', error)
    message.error(error?.message || 'Failed to perform action')
  }
}

const handleCancel = () => {
  isEditModalVisible.value = false
  formEditRef.value?.resetFields()
}

const handleCancelConfirm = () => {
  isConfirmModalVisible.value = false
  action.value = ''
  affectedRoleId.value = ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: GetRolesParams | undefined = searchText.value
      ? { search: searchText.value }
      : undefined
    const data = await getRolesApi(params)
    dataSource.value = data.items
    
    // System roles are not visible to tenants (only SystemAdmin users can see them)
    let filtered = data.items
    if (!isSystemAdmin.value) {
      filtered = data.items.filter(
        (role) => role.role_code !== 'SystemAdmin' && role.role_code !== 'SystemOperator',
      )
    }
    filteredDataSource.value = filtered
  } catch (error: any) {
    console.error('Failed to fetch roles:', error)
    message.error(error?.message || 'Failed to fetch roles')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchData()
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 5px;
  margin-bottom: 20px;
}

.form-left {
  display: flex;
  gap: 8px;
  flex-grow: 1;
}

.flex-grow {
  flex-grow: 1;
}

.flex-grow .ant-input {
  width: 100%;
}

.form-right {
  display: flex;
  gap: 8px;
}

.operation-buttons {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
}

.status-active {
  color: #52c41a;
}

.status-inactive {
  color: #ff4d4f;
}

/* Force table to use auto layout, allow columns to adjust automatically based on content */
.role-table :deep(.ant-table table) {
  table-layout: auto !important;
  width: 100% !important;
}

/* Ensure table container allows wrapping */
.role-table :deep(.ant-table-container) {
  overflow-x: auto;
}

/* Role Code column: Flexible width with min-width to fit "Role Code" text */
:deep(.ant-table-thead > tr > th.role-code-column),
:deep(.ant-table-tbody > tr > td.role-code-column) {
  min-width: 120px !important;
  width: auto !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Description column: Flexible width with min-width 200px */
:deep(.ant-table-thead > tr > th.description-column),
:deep(.ant-table-tbody > tr > td.description-column) {
  min-width: 200px !important;
  width: auto !important;
  white-space: normal !important;
  word-break: break-word !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

/* Ensure Description column content container can also wrap */
:deep(.ant-table-tbody > tr > td.description-column > *),
:deep(.ant-table-thead > tr > th.description-column > *) {
  white-space: normal !important;
  word-break: break-word !important;
}

/* Description content: Preserve line breaks */
.description-content {
  word-break: break-word;
  line-height: 1.6;
  display: block;
}
</style>

