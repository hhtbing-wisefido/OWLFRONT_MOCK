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
              <a-button 
                type="text" 
                @click="handleRefresh" 
                :title="'Refresh'"
                :loading="loading"
              >
                <template #icon>
                  <ReloadOutlined />
                </template>
              </a-button>
            </a-space>
          </a-form-item>
          <!-- Search Input -->
          <a-form-item>
            <a-input
              v-model:value="searchText"
              placeholder="Search by nickname or unit name"
              style="width: 400px"
              :allowClear="true"
              @pressEnter="onSearch"
            />
          </a-form-item>

          <!-- Search Button -->
          <a-form-item>
            <a-button type="primary" @click="onSearch">Search</a-button>
          </a-form-item>

          <!-- Create Resident Button -->
          <a-form-item>
            <a-button 
              type="primary" 
              @click="createResident"
              :disabled="!canCreateResident"
            >
              Create Resident
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>

    <a-table
      :dataSource="filteredDataSource"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      :scroll="{ x: 'max-content' }"
      class="resident-table"
      @change="handleTableChange"
    >
      <template #headerCell="{ column }">
        <!-- Status column: with filter -->
        <template v-if="column.dataIndex === 'status'">
          <div class="status-header-cell">
            <span>{{ column.title }}</span>
            <a-dropdown :trigger="['click']" v-model:open="statusFilterOpen">
              <template #overlay>
                <a-menu class="status-filter-menu">
                  <a-menu-item v-for="statusOption in statusOptions" :key="statusOption.value">
                    <a-checkbox
                      :checked="statusFilter.includes(statusOption.value as 'active' | 'discharged' | 'transferred')"
                      @change="handleStatusFilterChange(statusOption.value as 'active' | 'discharged' | 'transferred', $event)"
                    >
                      {{ statusOption.label }}
                    </a-checkbox>
                  </a-menu-item>
                </a-menu>
              </template>
              <FilterOutlined class="filter-icon" />
            </a-dropdown>
          </div>
        </template>
        <!-- Other columns: display title -->
        <template v-else>
          {{ column.title }}
        </template>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'nickname'">
          <!-- IT 角色禁用双击查看详情 -->
          <span 
            @dblclick="!hasRole('IT') && handleRowDoubleClick(record)" 
            :style="hasRole('IT') ? 'color: #000;' : 'cursor: pointer; color: #1890ff;'"
          >
            {{ record.nickname || '-' }}
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'building'">
          <span>{{ record.building && record.building !== '-' ? record.building : '-' }}</span>
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <span :class="getStatusClass(record.status)">
            {{ getStatusText(record.status) }}
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'is_access_enabled'">
          <a-switch
            :checked="record.is_access_enabled"
            :disabled="!hasManagePermission || saving"
            @change="(checked: boolean) => handleToggleAccess(record, checked)"
          />
        </template>
        <template v-else-if="column.key === 'operation'">
          <a-space>
            <!-- IT 角色隐藏 Details 按钮 -->
            <a-button 
              v-if="!hasRole('IT')" 
              size="small" 
              @click="viewResident(record)"
            >
              Details
            </a-button>
            <a-button size="small" @click="handleResetPassword(record)">
              Passwd
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- Reset Password Modal -->
    <a-modal
      v-model:visible="isResetPasswordModalVisible"
      title="Reset Password"
      width="500px"
      @ok="handleResetPasswordConfirm"
      @cancel="handleCancelResetPassword"
    >
      <template #footer>
        <div style="padding: 10px 16px">
          <a-button key="back" @click="handleCancelResetPassword" style="margin-right: 30px">Cancel</a-button>
          <a-button key="submit" type="primary" @click="handleResetPasswordConfirm" style="margin-right: 20px">
            Confirm
          </a-button>
        </div>
      </template>
      <a-form
        layout="horizontal"
        :model="resetPasswordData"
        ref="resetPasswordFormRef"
        :rules="resetPasswordRules"
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
            v-model:value="resetPasswordData.new_password"
            @input="handleResetPasswordInput"
            @blur="handleResetPasswordBlur"
            :status="resetPasswordErrorMessage ? 'error' : ''"
          />
        </a-form-item>
        <a-form-item label="Confirm Password" name="confirm_password">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <a-input-password 
              placeholder="Please confirm new password" 
              v-model:value="resetPasswordData.confirm_password"
              @input="handleResetPasswordConfirmInput"
              @blur="handleResetPasswordConfirmBlur"
              :status="resetPasswordErrorMessage ? 'error' : ''"
            />
            <a-button type="primary" @click="generateResetPassword" style="align-self: flex-start;">
              Generate PW
            </a-button>
            <span v-if="resetPasswordErrorMessage" style="color: #ff4d4f; font-size: 12px;">
              {{ resetPasswordErrorMessage }}
            </span>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { FilterOutlined, HomeOutlined, ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import {
  getResidentsApi,
  updateResidentApi,
  resetResidentPasswordApi,
} from '@/api/resident/resident'
import type {
  Resident,
  GetResidentsParams,
  UpdateResidentParams,
} from '@/api/resident/model/residentModel'
import { useEntitiesStore } from '@/store/modules/entities'
import { usePermission } from '@/hooks/usePermission'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const entitiesStore = useEntitiesStore()
const userStore = useUserStore()
const { hasManagePermission, hasRole } = usePermission()

// Navigate to home page
// Go back
const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  // 使用用户的homePath而不是硬编码
  const homePath = userStore.getUserHomePath || '/monitoring/overview'
  router.push(homePath)
}

// Handle refresh - force refresh from DB
const handleRefresh = async () => {
  // Force refresh by clearing cache and fetching from DB
  await fetchResidents(true)
  message.success('Data refreshed from database')
}

// 权限控制：只有 Manager/Admin 可以创建住户（IT 不能创建）
const canCreateResident = computed(() => {
  // IT 角色不能创建住户
  if (hasRole('IT')) {
    return false
  }
  return hasManagePermission.value || hasRole(['Manager'])
})

const searchText = ref('')
// Status filter: default show active and transferred, hide discharged
const statusFilterOpen = ref(false)
const statusFilter = ref<('active' | 'discharged' | 'transferred')[]>(['active', 'transferred'])
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'discharged', label: 'Discharged' },
  { value: 'transferred', label: 'Transferred' },
]
const loading = ref(false)
const dataSource = ref<Resident[]>([])
const filteredDataSource = ref<Resident[]>([])
const saving = ref(false)

// Reset Password Modal state
const isResetPasswordModalVisible = ref(false)
const resetPasswordFormRef = ref()
const resetPasswordResidentId = ref('')
const resetPasswordErrorMessage = ref('')
const resetPasswordData = ref({
  new_password: '',
  confirm_password: '',
})

// Password validation constants
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_SPECIAL_CHARS = '!@#$%^&*(),.?":{}|<>'

// Pagination
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `Total ${total} residents`,
})


// Multi-column sorter with priority: branch_tag > building > area_tag > unit_name
const locationSorter = (a: Resident, b: Resident) => {
  // Priority 1: branch_tag
  const aBranchTag = a.branch_tag || ''
  const bBranchTag = b.branch_tag || ''
  const branchTagCompare = aBranchTag.localeCompare(bBranchTag)
  if (branchTagCompare !== 0) return branchTagCompare

  // Priority 2: building
  const aBuilding = a.building || ''
  const bBuilding = b.building || ''
  const buildingCompare = aBuilding.localeCompare(bBuilding)
  if (buildingCompare !== 0) return buildingCompare

  // Priority 3: area_tag
  const aAreaTag = a.area_tag || ''
  const bAreaTag = b.area_tag || ''
  const areaTagCompare = aAreaTag.localeCompare(bAreaTag)
  if (areaTagCompare !== 0) return areaTagCompare

  // Priority 4: unit_name
  const aUnitName = a.unit_name || ''
  const bUnitName = b.unit_name || ''
  return aUnitName.localeCompare(bUnitName)
}

// Multi-column sorter for account: resident_account > family_tag
const accountSorter = (a: Resident, b: Resident) => {
  // Priority 1: resident_account
  const aAccount = a.resident_account || ''
  const bAccount = b.resident_account || ''
  const accountCompare = aAccount.localeCompare(bAccount)
  if (accountCompare !== 0) return accountCompare

  // Priority 2: family_tag
  const aFamilyTag = a.family_tag || ''
  const bFamilyTag = b.family_tag || ''
  return aFamilyTag.localeCompare(bFamilyTag)
}

const columns = [
  {
    title: 'Nickname',
    dataIndex: 'nickname',
    key: 'nickname',
    ellipsis: true,
    align: 'left',
    width: 150,
  },
  {
    title: 'Branch',
    dataIndex: 'branch_tag',
    key: 'branch_tag',
    ellipsis: true,
    align: 'left',
    width: 150,
    sorter: locationSorter,
  },
  {
    title: 'Building',
    dataIndex: 'building',
    key: 'building',
    ellipsis: true,
    align: 'left',
    width: 100,
    sorter: locationSorter,
  },
  {
    title: 'area_tag',
    dataIndex: 'area_tag',
    key: 'area_tag',
    ellipsis: true,
    align: 'left',
    width: 120,
    sorter: locationSorter,
  },
  {
    title: 'unit_name',
    dataIndex: 'unit_name',
    key: 'unit_name',
    ellipsis: true,
    align: 'left',
    width: 120,
    sorter: locationSorter,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'left',
  },
  {
    title: 'Service Level',
    dataIndex: 'service_level',
    key: 'service_level',
    ellipsis: true,
    align: 'left',
    width: 120,
  },
  {
    title: 'Admission Date',
    dataIndex: 'admission_date',
    key: 'admission_date',
    ellipsis: true,
    align: 'left',
    width: 120,
  },
  {
    title: 'account',
    dataIndex: 'resident_account',
    key: 'resident_account',
    ellipsis: true,
    align: 'left',
    width: 100,
    sorter: accountSorter,
  },
  {
    title: 'Family_tag',
    dataIndex: 'family_tag',
    key: 'family_tag',
    ellipsis: true,
    align: 'left',
    width: 100,
  },
  {
    title: 'Allow Access',
    dataIndex: 'is_access_enabled',
    key: 'is_access_enabled',
    align: 'center',
    width: 100,
  },
  {
    title: 'Operation',
    key: 'operation',
    fixed: 'right',
    width: 200,
    align: 'left',
  },
]



// Get status class
const getStatusClass = (status?: string) => {
  const statusMap: Record<string, string> = {
    active: 'status-active',
    discharged: 'status-discharged',
    transferred: 'status-transferred',
  }
  return statusMap[status || ''] || ''
}

// Get status text
const getStatusText = (status?: string) => {
  const statusMap: Record<string, string> = {
    active: 'Active',
    discharged: 'Discharged',
    transferred: 'Transferred',
  }
  return statusMap[status || ''] || status || '-'
}

// Handle row double click
const handleRowDoubleClick = (record: Resident) => {
  viewResident(record)
}

// View resident details
const viewResident = (record: Resident) => {
  router.push(`/resident/${record.resident_id}`)
}

// Create resident
const createResident = () => {
  router.push('/residents/create')
}



// Toggle resident and family access
const handleToggleAccess = async (record: Resident, checked: boolean) => {
  if (!hasManagePermission.value) {
    message.warning('Only administrators can change access permissions')
    return
  }

  saving.value = true
  try {
    const params: UpdateResidentParams = {
      is_access_enabled: checked,
    }
    await updateResidentApi(record.resident_id, params)
    entitiesStore.updateResident(record.resident_id, params)
    // Update the local record to reflect the change immediately
    record.is_access_enabled = checked
    message.success(`Access ${checked ? 'enabled' : 'disabled'} successfully`)
  } catch (error: any) {
    console.error('Failed to update access permission:', error)
    message.error(error?.message || 'Failed to update access permission')
    // Revert the switch state on error
    record.is_access_enabled = !checked
  } finally {
    saving.value = false
  }
}

// Validate reset password strength
const validateResetPasswordStrength = (password: string): { isValid: boolean; errorMessage: string } => {
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

// Validate reset password confirmation
const validateResetPasswordConfirm = (): boolean => {
  if (!resetPasswordData.value.new_password || !resetPasswordData.value.confirm_password) {
    if (!resetPasswordData.value.confirm_password) {
      if (resetPasswordData.value.new_password) {
        resetPasswordErrorMessage.value = 'Please confirm your password'
      } else {
        resetPasswordErrorMessage.value = ''
      }
    }
    return false
  }

  if (resetPasswordData.value.new_password !== resetPasswordData.value.confirm_password) {
    resetPasswordErrorMessage.value = 'Passwords do not match'
    return false
  }

  const strengthResult = validateResetPasswordStrength(resetPasswordData.value.new_password)
  resetPasswordErrorMessage.value = strengthResult.errorMessage
  return strengthResult.isValid
}

// Handle reset password input
const handleResetPasswordInput = () => {
  if (!resetPasswordData.value.new_password) {
    resetPasswordErrorMessage.value = ''
    return
  }
  if (!resetPasswordErrorMessage.value.includes('match')) {
    const result = validateResetPasswordStrength(resetPasswordData.value.new_password)
    resetPasswordErrorMessage.value = result.errorMessage
  } else {
    validateResetPasswordConfirm()
  }
}

// Handle reset password blur
const handleResetPasswordBlur = () => {
  if (resetPasswordData.value.new_password) {
    const result = validateResetPasswordStrength(resetPasswordData.value.new_password)
    resetPasswordErrorMessage.value = result.errorMessage

    // If password is valid, also check confirmation if it exists
    if (result.isValid && resetPasswordData.value.confirm_password) {
      validateResetPasswordConfirm()
    }
  }
}

// Handle reset password confirm input
const handleResetPasswordConfirmInput = () => {
  if (!resetPasswordData.value.confirm_password) {
    if (!resetPasswordData.value.new_password) {
      resetPasswordErrorMessage.value = ''
    }
    return
  }
  validateResetPasswordConfirm()
}

// Handle reset password confirm blur
const handleResetPasswordConfirmBlur = () => {
  if (resetPasswordData.value.confirm_password) {
    validateResetPasswordConfirm()
  }
}

// Check if reset password is valid
const isResetPasswordValid = computed(() => {
  if (!resetPasswordData.value.new_password || !resetPasswordData.value.confirm_password) {
    return false
  }
  const strengthResult = validateResetPasswordStrength(resetPasswordData.value.new_password)
  const confirmResult = resetPasswordData.value.new_password === resetPasswordData.value.confirm_password
  return strengthResult.isValid && confirmResult
})

// Generate random password for reset
const generateResetPassword = () => {
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
  
  resetPasswordData.value.new_password = randomPassword
  resetPasswordData.value.confirm_password = randomPassword
  resetPasswordErrorMessage.value = ''
}

// Reset password form validation rules
const resetPasswordRules: Record<string, Rule[]> = {
  new_password: [
    { required: true, message: 'Please enter new password', trigger: 'blur' },
    { min: 8, message: 'Password must be at least 8 characters', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => {
        if (!value) return Promise.resolve()
        const result = validateResetPasswordStrength(value)
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
        if (value !== resetPasswordData.value.new_password) {
          return Promise.reject('Passwords do not match')
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
}

// Handle reset password - open modal
const handleResetPassword = (record: Resident) => {
  resetPasswordResidentId.value = record.resident_id
  resetPasswordData.value = {
    new_password: '',
    confirm_password: '',
  }
  resetPasswordErrorMessage.value = ''
  isResetPasswordModalVisible.value = true
}

// Handle reset password confirm
const handleResetPasswordConfirm = async () => {
  // Validate password strength first
  if (!isResetPasswordValid.value) {
    message.error(resetPasswordErrorMessage.value || 'Please check password requirements')
    return
  }

  resetPasswordFormRef.value
    .validate()
    .then(async () => {
      try {
        // Hash password before sending (consistent with login flow)
        const { hashPassword } = await import('@/utils/crypto')
        const passwordHash = await hashPassword(resetPasswordData.value.new_password)
        await resetResidentPasswordApi(resetPasswordResidentId.value, passwordHash)
        message.success('Password reset successfully')
        handleCancelResetPassword()
      } catch (error: any) {
        console.error('Failed to reset password:', error)
        message.error(error?.message || 'Failed to reset password')
      }
    })
    .catch((error: any) => {
      console.error('Validation failed:', error)
    })
}

// Handle cancel reset password
const handleCancelResetPassword = () => {
  isResetPasswordModalVisible.value = false
  resetPasswordResidentId.value = ''
  resetPasswordFormRef.value?.resetFields()
  // Clear password fields and error message
  resetPasswordData.value = {
    new_password: '',
    confirm_password: '',
  }
  resetPasswordErrorMessage.value = ''
}


// Handle Status filter changes
const handleStatusFilterChange = (value: 'active' | 'discharged' | 'transferred', event: any) => {
  if (event.target.checked) {
    if (!statusFilter.value.includes(value)) {
      statusFilter.value.push(value)
    }
  } else {
    statusFilter.value = statusFilter.value.filter((v) => v !== value)
  }
  // Re-fetch data
  pagination.value.current = 1
  fetchResidents()
}

// Search
const onSearch = () => {
  pagination.value.current = 1
  fetchResidents()
}

// Handle table change (pagination, sorting, etc.)
const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  fetchResidents()
}

// Fetch residents
const fetchResidents = async (forceRefresh?: boolean) => {
  loading.value = true
  try {
    // Fetch all residents (no status filter in API call, filter on frontend)
    const params: GetResidentsParams = {
      search: searchText.value || undefined,
      // Don't pass status to API, filter on frontend
    }
    
    // Always fetch from API to ensure data matches current user's permissions
    // Cache is not used here because different users (even with same role) may see different data
    // based on assigned_only and branch_only permissions
    const result = await getResidentsApi(params)
    dataSource.value = result.items
    
    // Filter by status on frontend
    filteredDataSource.value = dataSource.value.filter((resident) => 
      statusFilter.value.includes(resident.status)
    )
    pagination.value.total = filteredDataSource.value.length
  } catch (error: any) {
    console.error('Failed to fetch residents:', error)
    message.error(error?.message || 'Failed to fetch residents')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchResidents()
})
</script>

<style scoped>
.form-container {
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 4px;
}

.flex-form {
  display: flex;
  align-items: center;
  gap: 16px;
}

.flex-grow {
  flex: 1;
}

.resident-table {
  background: white;
  padding: 16px;
  border-radius: 4px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
}

.status-active {
  color: #52c41a;
  font-weight: 500;
}

.status-discharged {
  color: #8c8c8c;
  font-weight: 500;
}

.status-transferred {
  color: #1890ff;
  font-weight: 500;
}

.status-header-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-icon {
  cursor: pointer;
  color: #1890ff;
  font-size: 14px;
}

.filter-icon:hover {
  color: #40a9ff;
}

.status-filter-menu {
  min-width: 150px;
}
</style>

