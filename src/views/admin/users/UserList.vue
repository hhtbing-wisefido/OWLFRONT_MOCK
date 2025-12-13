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
              placeholder="Search by account, nickname, email, or phone"
              style="width: 400px"
              :allowClear="true"
              @pressEnter="onSearch"
            />
          </a-form-item>

          <!-- Search Button -->
          <a-form-item>
            <a-button type="primary" @click="onSearch">Search</a-button>
          </a-form-item>

          <!-- Create User Button -->
          <a-form-item>
            <a-button type="primary" @click="addUser">Create User</a-button>
          </a-form-item>

          <!-- Refresh Button -->
          <a-form-item>
            <a-button @click="refreshData">
              <template #icon>
                <ReloadOutlined />
              </template>
              Refresh
            </a-button>
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
      class="user-table"
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
                      :checked="statusFilter.includes(statusOption.value as 'active' | 'disabled' | 'left')"
                      @change="handleStatusFilterChange(statusOption.value as 'active' | 'disabled' | 'left', $event)"
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
        <template v-if="column.dataIndex === 'user_account'">
          <span @dblclick="handleRowDoubleClick(record)" style="cursor: pointer; color: #1890ff;">
            {{ record.user_account }}
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <span :class="getStatusClass(record.status)">
            {{ getStatusText(record.status) }}
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'alarm_levels'">
          <a-tag
            v-for="level in record.alarm_levels"
            :key="level"
            :color="getAlarmLevelColor(level)"
            style="margin: 2px"
          >
            {{ getAlarmLevelText(level) }}
          </a-tag>
          <span v-if="!record.alarm_levels || record.alarm_levels.length === 0">-</span>
        </template>
        <template v-else-if="column.dataIndex === 'alarm_channels'">
          <!-- Filter out APP and WEB (they are mandatory, not user-selectable) -->
          <a-tag 
            v-for="channel in Array.isArray(record.alarm_channels) ? record.alarm_channels.filter((c: string) => c !== 'APP' && c !== 'WEB') : []" 
            :key="channel" 
            class="alarm-channel-tag"
            style="margin: 2px"
          >
            {{ channel }}
          </a-tag>
          <span v-if="!record.alarm_channels || record.alarm_channels.filter((c: string) => c !== 'APP' && c !== 'WEB').length === 0">-</span>
        </template>
        <template v-else-if="column.dataIndex === 'alarm_scope'">
          <span>{{ record.alarm_scope || '-' }}</span>
        </template>
        <template v-else-if="column.dataIndex === 'role'">
          <span>{{ roleMap[record.role] || record.role || '-' }}</span>
        </template>
        <template v-else-if="column.dataIndex === 'tags'">
          <a-tag v-for="tag in record.tags" :key="tag" style="margin: 2px">
            {{ tag }}
          </a-tag>
          <span v-if="!record.tags || record.tags.length === 0">-</span>
        </template>
        <template v-else-if="column.key === 'operation'">
          <div class="operation-buttons">
            <div class="operation-row">
              <a-button size="small" @click="editUser(record)">
                Edit
              </a-button>
              <a-button
                size="small"
                @click="resetPassword(record)"
              >
                Reset PW
              </a-button>
            </div>
            <div class="operation-row">
              <a-button
                v-if="record.status === 'active'"
                size="small"
                @click="disableUser(record)"
              >
                Disable
              </a-button>
              <a-button
                v-if="record.status === 'disabled'"
                size="small"
                @click="enableUser(record)"
              >
                Enable
              </a-button>
              <a-button
                v-if="record.status === 'left'"
                size="small"
                :disabled="record.user_id === userStore.getUserInfo?.userId || record.user_account === 'sysadmin'"
                @click="restoreUser(record)"
              >
                Restore
              </a-button>
              <a-button
                size="small"
                @click="resetPin(record)"
              >
                Reset PIN
              </a-button>
              <a-button
                v-if="record.status !== 'left'"
                size="small"
                danger
                :disabled="record.user_id === userStore.getUserInfo?.userId || record.user_account === 'sysadmin'"
                @click="deleteUser(record)"
              >
                Delete
              </a-button>
            </div>
          </div>
        </template>
      </template>
    </a-table>

    <!-- Edit/Create Modal -->
    <a-modal
      v-model:visible="isEditModalVisible"
      :title="editModel ? 'Edit User' : 'Create User'"
      width="800px"
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
        <a-form-item label="User Account" name="user_account">
          <a-input
            placeholder="Please enter user account"
            v-model:value="editData.user_account"
            :disabled="editModel"
          />
        </a-form-item>
        <a-form-item label="Nickname" name="nickname">
          <a-input placeholder="Please enter nickname" v-model:value="editData.nickname" />
        </a-form-item>
        <a-form-item label="Email" name="email">
          <a-input placeholder="Please enter email" v-model:value="editData.email" />
        </a-form-item>
        <a-form-item label="Phone" name="phone">
          <a-input placeholder="Please enter phone" v-model:value="editData.phone" />
        </a-form-item>
        <a-form-item label="Role" name="role">
          <a-select
            v-model:value="editData.role"
            placeholder="Please select role"
            :disabled="!hasManagePermission"
          >
            <a-select-option v-for="role in availableRoles" :key="role.role_code" :value="role.role_code">
              {{ role.display_name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Status" name="status">
          <a-select
            v-model:value="editData.status"
            placeholder="Please select status"
            :disabled="!hasManagePermission"
          >
            <a-select-option value="active">Active</a-select-option>
            <a-select-option value="disabled">Disabled</a-select-option>
            <a-select-option value="left">Left</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="!editModel" label="Password" name="password">
          <a-input-password 
            placeholder="Please enter password" 
            v-model:value="editData.password"
            autocomplete="new-password"
          />
        </a-form-item>
        <a-form-item label="Alarm Levels" name="alarm_levels">
          <a-select
            v-model:value="editData.alarm_levels"
            mode="multiple"
            placeholder="Please select alarm levels"
            :disabled="!hasManagePermission"
          >
            <a-select-option value="0">0 (EMERG)</a-select-option>
            <a-select-option value="1">1 (ALERT)</a-select-option>
            <a-select-option value="2">2 (CRIT)</a-select-option>
            <a-select-option value="3">3 (ERR)</a-select-option>
            <a-select-option value="4">4 (WARNING)</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Alarm Channels" name="alarm_channels">
          <a-select
            v-model:value="editData.alarm_channels"
            mode="multiple"
            placeholder="Please select alarm channels"
            :disabled="!hasManagePermission"
          >
            <a-select-option value="EMAIL">EMAIL</a-select-option>
            <a-select-option value="SMS">SMS</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Alarm Scope" name="alarm_scope">
          <a-select
            v-model:value="editData.alarm_scope"
            placeholder="Please select alarm scope"
            :disabled="!hasManagePermission"
          >
            <a-select-option value="ALL">ALL</a-select-option>
            <a-select-option value="BRANCH-TAG">BRANCH-TAG</a-select-option>
            <a-select-option value="ASSIGNED_ONLY">ASSIGNED_ONLY</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Tags" name="tags">
          <a-select
            v-model:value="editData.tags"
            mode="tags"
            placeholder="Please enter tags and press Enter"
            :disabled="!hasManagePermission"
            allowClear
            :token-separators="[',']"
          >
          </a-select>
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

    <!-- Reset Password Modal -->
    <a-modal
      v-model:visible="isResetPasswordModalVisible"
      title="Reset Password"
      width="500px"
      @ok="handleResetPassword"
      @cancel="handleCancelResetPassword"
    >
      <template #footer>
        <div style="padding: 10px 16px">
          <a-button key="back" @click="handleCancelResetPassword" style="margin-right: 30px">Cancel</a-button>
          <a-button key="submit" type="primary" @click="handleResetPassword" style="margin-right: 20px">
            Confirm
          </a-button>
        </div>
      </template>
      <a-form
        layout="horizontal"
        :model="resetPasswordData"
        ref="resetPasswordFormRef"
        :rules="resetPasswordRules"
        :labelCol="{ span: 6 }"
        :wrapperCol="{ span: 18 }"
        style="padding: 20px"
      >
        <a-form-item label="New Password" name="new_password">
          <a-input-password placeholder="Please enter new password" v-model:value="resetPasswordData.new_password" />
        </a-form-item>
        <a-form-item label="Confirm Password" name="confirm_password">
          <a-input-password placeholder="Please confirm new password" v-model:value="resetPasswordData.confirm_password" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Reset PIN Modal -->
    <a-modal
      v-model:visible="isResetPinModalVisible"
      title="Reset PIN"
      width="500px"
      @ok="handleResetPin"
      @cancel="handleCancelResetPin"
    >
      <template #footer>
        <div style="padding: 10px 16px">
          <a-button key="back" @click="handleCancelResetPin" style="margin-right: 30px">Cancel</a-button>
          <a-button key="submit" type="primary" @click="handleResetPin" style="margin-right: 20px">
            Confirm
          </a-button>
        </div>
      </template>
      <a-form
        layout="horizontal"
        :model="resetPinData"
        ref="resetPinFormRef"
        :rules="resetPinRules"
        :labelCol="{ span: 6 }"
        :wrapperCol="{ span: 18 }"
        style="padding: 20px"
      >
        <a-form-item label="New PIN" name="new_pin">
          <a-input
            placeholder="Please enter 4-digit PIN"
            v-model:value="resetPinData.new_pin"
            maxlength="4"
            :inputmode="'numeric'"
          />
        </a-form-item>
        <a-form-item label="Confirm PIN" name="confirm_pin">
          <a-input
            placeholder="Please confirm 4-digit PIN"
            v-model:value="resetPinData.confirm_pin"
            maxlength="4"
            :inputmode="'numeric'"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ExclamationCircleOutlined, FilterOutlined, ReloadOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/lib/form'

import {
  getUsersApi,
  createUserApi,
  deleteUserApi,
  updateUserApi,
  resetPasswordApi,
  resetPinApi,
} from '@/api/admin/user/user'
import type {
  User,
  GetUsersParams,
  CreateUserParams,
  UpdateUserParams,
  ResetPasswordParams,
  ResetPinParams,
} from '@/api/admin/user/model/userModel'
import { getRolesApi } from '@/api/admin/role/role'
import type { Role } from '@/api/admin/role/model/roleModel'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()
const SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000001'

const isSystemTenant = computed(() => userStore.userInfo?.tenant_id === SYSTEM_TENANT_ID)
const isSystemAdmin = computed(() => userStore.userInfo?.role === 'SystemAdmin')

// Navigate to home page
// Go back
const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/monitoring/overview')
}

const searchText = ref('')
// Status filter: default show active and disabled, hide left
const statusFilterOpen = ref(false)
const statusFilter = ref<('active' | 'disabled' | 'left')[]>(['active', 'disabled'])
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'left', label: 'Left' },
]
const loading = ref(false)
const dataSource = ref<User[]>([])
const filteredDataSource = ref<User[]>([])
const isEditModalVisible = ref(false)
const isConfirmModalVisible = ref(false)
const isResetPasswordModalVisible = ref(false)
const isResetPinModalVisible = ref(false)
const editModel = ref(false)
const formEditRef = ref()
const resetPasswordFormRef = ref()
const resetPinFormRef = ref()
const action = ref('')
const affectedUserId = ref('')
const confirmTitle = ref('')
const confirmMessage = ref('')
const availableRoles = ref<Role[]>([])
const resetPasswordUserId = ref('')
const resetPinUserId = ref('')

// Role mapping (role_code -> display_name)
const roleMap = computed(() => {
  const map: Record<string, string> = {}
  availableRoles.value.forEach((role) => {
    map[role.role_code] = role.display_name || role.role_code
  })
  return map
})

const emptyUser: Partial<User & { password?: string }> = {
  user_account: '',
  nickname: '',
  email: '',
  phone: '',
  role: '',
  status: 'active',
  alarm_levels: [],
  alarm_channels: [],
  alarm_scope: 'ALL',
  tags: [],
  password: '',
}

const editData = ref<Partial<User & { password?: string }>>({ ...emptyUser })

const resetPasswordData = ref({
  new_password: '',
  confirm_password: '',
})

const resetPinData = ref({
  new_pin: '',
  confirm_pin: '',
})

// Check if user has management permission
const hasManagePermission = computed(() => {
  const userInfo = userStore.getUserInfo
  if (!userInfo) return false
  
  // Check if user has users.update permission (simplified here, should actually check from role-permissions)
  // TODO: Implement complete permission check logic
  // Allow SystemAdmin to manage users in System tenant; tenant-side user management is handled by Admin/Manager/IT.
  const allowedRoles = ['SystemAdmin', 'Admin', 'Manager', 'IT']
  return allowedRoles.includes(userInfo.role || '')
})

const columns = [
  {
    title: 'User Account',
    dataIndex: 'user_account',
    key: 'user_account',
    ellipsis: true,
    align: 'left',
    className: 'user-account-column',
  },
  {
    title: 'Nickname',
    dataIndex: 'nickname',
    key: 'nickname',
    ellipsis: true,
    align: 'left',
    className: 'nickname-column',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    ellipsis: true,
    align: 'left',
    className: 'email-column',
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
    ellipsis: true,
    align: 'left',
    className: 'phone-column',
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    ellipsis: true,
    align: 'left',
    className: 'role-column',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    align: 'left',
  },
  {
    title: 'Alarm Levels',
    dataIndex: 'alarm_levels',
    key: 'alarm_levels',
    ellipsis: false,
    align: 'left',
    className: 'alarm-levels-column',
  },
  {
    title: 'Alarm Channels',
    dataIndex: 'alarm_channels',
    key: 'alarm_channels',
    ellipsis: false,
    align: 'left',
    className: 'alarm-channels-column',
  },
  {
    title: 'Alarm Scope',
    dataIndex: 'alarm_scope',
    key: 'alarm_scope',
    ellipsis: true,
    align: 'left',
    className: 'alarm-scope-column',
  },
  {
    title: 'Tags',
    dataIndex: 'tags',
    key: 'tags',
    ellipsis: false,
    align: 'left',
    className: 'tags-column',
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
  user_account: [{ required: true, message: 'Please enter user account', trigger: 'blur' }],
  role: [{ required: true, message: 'Please select role', trigger: 'change' }],
  password: [{ required: true, message: 'Please enter password', trigger: 'blur' }],
}

const resetPasswordRules: Record<string, Rule[]> = {
  new_password: [
    { required: true, message: 'Please enter new password', trigger: 'blur' },
    { min: 4, message: 'Password must be at least 4 characters', trigger: 'blur' },
  ],
  confirm_password: [
    { required: true, message: 'Please confirm password', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => {
        if (value && value !== resetPasswordData.value.new_password) {
          return Promise.reject('Passwords do not match')
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
}

const resetPinRules: Record<string, Rule[]> = {
  new_pin: [
    { required: true, message: 'Please enter 4-digit PIN', trigger: 'blur' },
    { len: 4, message: 'PIN must be exactly 4 digits', trigger: 'blur' },
    {
      pattern: /^\d{4}$/,
      message: 'PIN must be 4 digits',
      trigger: 'blur',
    },
  ],
  confirm_pin: [
    { required: true, message: 'Please confirm PIN', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => {
        if (value && value !== resetPinData.value.new_pin) {
          return Promise.reject('PINs do not match')
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'status-active'
    case 'disabled':
      return 'status-disabled'
    case 'left':
      return 'status-left'
    default:
      return ''
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active'
    case 'disabled':
      return 'Disabled'
    case 'left':
      return 'Left'
    default:
      return status
  }
}

// Convert alarm level number to text display
const getAlarmLevelText = (level: string | number): string => {
  const levelStr = String(level)
  const levelMap: Record<string, string> = {
    '0': 'EMERG',
    '1': 'ALERT',
    '2': 'CRIT',
    '3': 'ERR',
    '4': 'WARNING',
  }
  return levelMap[levelStr] || levelStr
}

// Get color corresponding to alarm level
const getAlarmLevelColor = (level: string | number): string => {
  const levelStr = String(level)
  const colorMap: Record<string, string> = {
    '0': '#d32f2f', // EMERG - red
    '1': '#d32f2f', // ALERT - red
    '2': '#f3783f', // CRIT - orange
    '3': '#f3783f', // ERR - orange
    '4': '#f3783f', // WARNING - orange
  }
  return colorMap[levelStr] || '#999'
}

const onSearch = () => {
  if (!searchText.value || searchText.value.trim() === '') {
    applyFilters()
    return
  }
  const searchLower = searchText.value.toLowerCase().trim()
  let filtered = dataSource.value.filter((user) => {
    return (
      user.user_account.toLowerCase().includes(searchLower) ||
      (user.nickname && user.nickname.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.phone && user.phone.toLowerCase().includes(searchLower))
    )
  })
  
  // Apply status filter
  if (statusFilter.value.length > 0) {
    filtered = filtered.filter((user) => statusFilter.value.includes(user.status))
  }
  
  filteredDataSource.value = filtered
}

const addUser = () => {
  editData.value = { ...emptyUser }
  isEditModalVisible.value = true
  editModel.value = false
}

// Watch role changes to set default alarm_scope (only when creating new user)
watch(
  () => editData.value.role,
  (newRole) => {
    // Only auto-set default when creating new user (not editing)
    if (!editModel.value && newRole) {
      const roleLower = newRole.toLowerCase()
      if (roleLower === 'caregiver' || roleLower === 'nurse') {
        editData.value.alarm_scope = 'ASSIGNED_ONLY'
      } else if (roleLower === 'manager') {
        editData.value.alarm_scope = 'BRANCH-TAG'
      }
      // Other roles: keep current value or default to 'ALL'
    }
  }
)

const handleRowDoubleClick = (record: User) => {
  // Double-click row to enter detail page
  router.push(`/admin/users/${record.user_id}`)
}

const editUser = (record: User) => {
  // Click edit button to enter detail page
  router.push(`/admin/users/${record.user_id}`)
}

const disableUser = (record: User) => {
  action.value = 'disable'
  affectedUserId.value = record.user_id
  confirmTitle.value = 'Disable User'
  confirmMessage.value = `Are you sure you want to disable user "${record.nickname || record.user_account}"?`
  isConfirmModalVisible.value = true
}

const enableUser = (record: User) => {
  action.value = 'enable'
  affectedUserId.value = record.user_id
  confirmTitle.value = 'Enable User'
  confirmMessage.value = `Are you sure you want to enable user "${record.nickname || record.user_account}"?`
  isConfirmModalVisible.value = true
}

const restoreUser = (record: User) => {
  action.value = 'restore'
  affectedUserId.value = record.user_id
  confirmTitle.value = 'Restore User'
  confirmMessage.value = `Restore user "${record.nickname || record.user_account}"? This will change status from left to active.`
  isConfirmModalVisible.value = true
}

const deleteUser = (record: User) => {
  action.value = 'delete'
  affectedUserId.value = record.user_id
  confirmTitle.value = 'Delete User'
  // Soft delete (status=left) - keep audit history
  confirmMessage.value = `Are you sure you want to delete user "${record.nickname || record.user_account}"? This will mark the user as left (soft delete).`
  isConfirmModalVisible.value = true
}

// Handle Status filter changes
const handleStatusFilterChange = (value: 'active' | 'disabled' | 'left', event: any) => {
  if (event.target.checked) {
    if (!statusFilter.value.includes(value)) {
      statusFilter.value.push(value)
    }
  } else {
    statusFilter.value = statusFilter.value.filter((v) => v !== value)
  }
  // Apply filter
  applyFilters()
}

const resetPassword = (record: User) => {
  resetPasswordUserId.value = record.user_id
  resetPasswordData.value = {
    new_password: '',
    confirm_password: '',
  }
  isResetPasswordModalVisible.value = true
}

const resetPin = (record: User) => {
  resetPinUserId.value = record.user_id
  resetPinData.value = {
    new_pin: '',
    confirm_pin: '',
  }
  isResetPinModalVisible.value = true
}

const handleSave = async () => {
  formEditRef.value
    .validate()
    .then(async () => {
      try {
        if (!editModel.value) {
          // Create new user
          const params: CreateUserParams = {
            user_account: editData.value.user_account!,
            nickname: editData.value.nickname,
            email: editData.value.email,
            phone: editData.value.phone,
            role: editData.value.role!,
            password: editData.value.password!,
            alarm_levels: editData.value.alarm_levels,
            alarm_channels: editData.value.alarm_channels,
            alarm_scope: editData.value.alarm_scope,
            tags: editData.value.tags,
          }
          await createUserApi(params)
          message.success('User created successfully')
        } else {
          // Update user (should not edit in list page, should navigate to detail page)
          // Keep this logic just in case
        }
        handleCancel()
        refreshData()
      } catch (error: any) {
        console.error('Failed to save user:', error)
        message.error(error?.message || 'Failed to save user')
      }
    })
    .catch((error: any) => {
      console.error('Validation failed:', error)
    })
}

const handleConfirm = async () => {
  try {
    if (action.value === 'disable') {
      const params: UpdateUserParams = { status: 'disabled' }
      await updateUserApi(affectedUserId.value, params)
      message.success('User disabled successfully')
    } else if (action.value === 'enable') {
      const params: UpdateUserParams = { status: 'active' }
      await updateUserApi(affectedUserId.value, params)
      message.success('User enabled successfully')
    } else if (action.value === 'restore') {
      const params: UpdateUserParams = { status: 'active' }
      await updateUserApi(affectedUserId.value, params)
      message.success('User restored successfully')
    } else if (action.value === 'delete') {
      await deleteUserApi(affectedUserId.value)
      message.success('User deleted (marked as left) successfully')
    }
    handleCancelConfirm()
    refreshData()
  } catch (error: any) {
    console.error('Failed to confirm action:', error)
    message.error(error?.message || 'Failed to perform action')
  }
}

const handleResetPassword = async () => {
  resetPasswordFormRef.value
    .validate()
    .then(async () => {
      try {
        const params: Omit<ResetPasswordParams, 'user_id'> = {
          new_password: resetPasswordData.value.new_password,
        }
        await resetPasswordApi(resetPasswordUserId.value, params)
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

const handleCancel = () => {
  isEditModalVisible.value = false
  formEditRef.value?.resetFields()
  // Reset editData to empty to prevent stale values (especially from browser autocomplete)
  editData.value = { ...emptyUser }
}

const handleCancelConfirm = () => {
  isConfirmModalVisible.value = false
  action.value = ''
  affectedUserId.value = ''
}

const handleCancelResetPassword = () => {
  isResetPasswordModalVisible.value = false
  resetPasswordUserId.value = ''
  resetPasswordFormRef.value?.resetFields()
}

const handleResetPin = async () => {
  resetPinFormRef.value
    .validate()
    .then(async () => {
      try {
        const params: Omit<ResetPinParams, 'user_id'> = {
          new_pin: resetPinData.value.new_pin,
        }
        await resetPinApi(resetPinUserId.value, params)
        message.success('PIN reset successfully')
        handleCancelResetPin()
      } catch (error: any) {
        console.error('Failed to reset PIN:', error)
        message.error(error?.message || 'Failed to reset PIN')
      }
    })
    .catch((error: any) => {
      console.error('Validation failed:', error)
    })
}

const handleCancelResetPin = () => {
  isResetPinModalVisible.value = false
  resetPinUserId.value = ''
  resetPinFormRef.value?.resetFields()
}

const fetchRoles = async () => {
  try {
    const data = await getRolesApi()
    // Role dropdown is for creating/updating *users*:
    // - Always hide Resident/Family (they belong to residents flow, not staff users)
    // - Never allow assigning SystemAdmin here
    // - Only SystemAdmin within System tenant can assign SystemOperator
    availableRoles.value = data.items.filter(
      (role) =>
        role.is_active &&
        role.role_code !== 'Resident' &&
        role.role_code !== 'Family' &&
        role.role_code !== 'SystemAdmin' &&
        (role.role_code !== 'SystemOperator' || (isSystemTenant.value && isSystemAdmin.value))
    )
  } catch (error: any) {
    console.error('Failed to fetch roles:', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: GetUsersParams | undefined = searchText.value
      ? { search: searchText.value }
      : undefined
    const data = await getUsersApi(params)
    dataSource.value = data.items
    // Apply filters
    applyFilters()
  } catch (error: any) {
    console.error('Failed to fetch users:', error)
    message.error(error?.message || 'Failed to fetch users')
  } finally {
    loading.value = false
  }
}

// Apply filters to dataSource
const applyFilters = () => {
  let filtered = [...dataSource.value]
  
  // Filter by status
  if (statusFilter.value.length > 0) {
    filtered = filtered.filter((user) => statusFilter.value.includes(user.status))
  }
  
  filteredDataSource.value = filtered
}

const refreshData = () => {
  fetchData()
}

onMounted(() => {
  fetchRoles()
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
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.operation-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

.status-active {
  color: #52c41a;
}

.status-disabled {
  color: #ff4d4f;
}

.status-left {
  color: #8c8c8c;
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

/* Force table to use auto layout, allow columns to adjust automatically based on content */
.user-table :deep(.ant-table table) {
  table-layout: auto !important;
  width: 100% !important;
}

/* Ensure table container allows wrapping */
.user-table :deep(.ant-table-container) {
  overflow-x: auto;
}

/* User Account column: Flexible width configuration */
:deep(.ant-table-thead > tr > th.user-account-column),
:deep(.ant-table-tbody > tr > td.user-account-column) {
  min-width: 100px !important;
  max-width: 150px !important;
  width: auto !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

:deep(.ant-table-tbody > tr > td.user-account-column:hover) {
  color: #1890ff;
  text-decoration: underline;
}

/* Nickname column: Flexible width configuration */
:deep(.ant-table-thead > tr > th.nickname-column),
:deep(.ant-table-tbody > tr > td.nickname-column) {
  min-width: 100px !important;
  max-width: 150px !important;
  width: auto !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Email column: Flexible width configuration */
:deep(.ant-table-thead > tr > th.email-column),
:deep(.ant-table-tbody > tr > td.email-column) {
  min-width: 150px !important;
  max-width: 200px !important;
  width: auto !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Phone column: Flexible width configuration */
:deep(.ant-table-thead > tr > th.phone-column),
:deep(.ant-table-tbody > tr > td.phone-column) {
  min-width: 120px !important;
  max-width: 150px !important;
  width: auto !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Role column: Flexible width configuration */
:deep(.ant-table-thead > tr > th.role-column),
:deep(.ant-table-tbody > tr > td.role-column) {
  min-width: 100px !important;
  max-width: 150px !important;
  width: auto !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Alarm Levels column: Flexible width configuration, supports wrapping */
:deep(.ant-table-thead > tr > th.alarm-levels-column),
:deep(.ant-table-tbody > tr > td.alarm-levels-column) {
  min-width: 120px !important;
  max-width: 180px !important;
  width: auto !important;
  white-space: normal !important;
  word-break: break-word !important;
}

/* Alarm Channels column: Flexible width configuration, supports wrapping */
:deep(.ant-table-thead > tr > th.alarm-channels-column),
:deep(.ant-table-tbody > tr > td.alarm-channels-column) {
  min-width: 120px !important;
  max-width: 180px !important;
  width: auto !important;
  white-space: normal !important;
  word-break: break-word !important;
}

/* Alarm Scope column: Flexible width configuration */
:deep(.ant-table-thead > tr > th.alarm-scope-column),
:deep(.ant-table-tbody > tr > td.alarm-scope-column) {
  min-width: 120px !important;
  max-width: 150px !important;
  width: auto !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tags column: Flexible width, occupies remaining space, supports wrapping */
:deep(.ant-table-thead > tr > th.tags-column),
:deep(.ant-table-tbody > tr > td.tags-column) {
  white-space: normal !important;
  word-break: break-word !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  min-width: 150px;
  max-width: none !important;
}

/* Alarm Channel tags: no border */
.alarm-channel-tag {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
}
</style>

