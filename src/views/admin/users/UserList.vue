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
              placeholder="Search by account, nickname, email, phone, or branch"
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
            <a-button type="primary" @click="addUser" :disabled="!canCreateUser">Create User</a-button>
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
        <!-- Sortable columns: User Account, Nickname, Branch, Role -->
        <template v-else-if="column.dataIndex === 'user_account'">
          <div 
            style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;" 
            @click="toggleUserAccountSort"
            :style="{ color: userAccountSortOrder ? '#1890ff' : 'inherit' }"
          >
            <span>{{ column.title }}</span>
            <SortAscendingOutlined 
              v-if="userAccountSortOrder === 'asc'" 
              style="font-size: 14px; color: #1890ff;"
            />
            <SortDescendingOutlined 
              v-else-if="userAccountSortOrder === 'desc'" 
              style="font-size: 14px; color: #1890ff;"
            />
            <span v-else style="color: #d9d9d9; font-size: 12px;">⇅</span>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'nickname'">
          <div 
            style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;" 
            @click="toggleNicknameSort"
            :style="{ color: nicknameSortOrder ? '#1890ff' : 'inherit' }"
          >
            <span>{{ column.title }}</span>
            <SortAscendingOutlined 
              v-if="nicknameSortOrder === 'asc'" 
              style="font-size: 14px; color: #1890ff;"
            />
            <SortDescendingOutlined 
              v-else-if="nicknameSortOrder === 'desc'" 
              style="font-size: 14px; color: #1890ff;"
            />
            <span v-else style="color: #d9d9d9; font-size: 12px;">⇅</span>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'branch_tag'">
          <div 
            style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;" 
            @click="toggleBranchSort"
            :style="{ color: branchSortOrder ? '#1890ff' : 'inherit' }"
          >
            <span>{{ column.title }}</span>
            <SortAscendingOutlined 
              v-if="branchSortOrder === 'asc'" 
              style="font-size: 14px; color: #1890ff;"
            />
            <SortDescendingOutlined 
              v-else-if="branchSortOrder === 'desc'" 
              style="font-size: 14px; color: #1890ff;"
            />
            <span v-else style="color: #d9d9d9; font-size: 12px;">⇅</span>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'role'">
          <div 
            style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;" 
            @click="toggleRoleSort"
            :style="{ color: roleSortOrder ? '#1890ff' : 'inherit' }"
          >
            <span>{{ column.title }}</span>
            <SortAscendingOutlined 
              v-if="roleSortOrder === 'asc'" 
              style="font-size: 14px; color: #1890ff;"
            />
            <SortDescendingOutlined 
              v-else-if="roleSortOrder === 'desc'" 
              style="font-size: 14px; color: #1890ff;"
            />
            <span v-else style="color: #d9d9d9; font-size: 12px;">⇅</span>
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
        <template v-else-if="column.dataIndex === 'branch_tag'">
          <span>{{ record.branch_tag || '-' }}</span>
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
                Passwd
              </a-button>
              <a-button
                size="small"
                @click="resetPin(record)"
              >
                PIN
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
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Account" name="user_account">
              <a-input
                placeholder="Please enter user account"
                v-model:value="editData.user_account"
                :disabled="editModel"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Nickname" name="nickname">
              <a-input placeholder="Please enter nickname" v-model:value="editData.nickname" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Email" name="email">
              <a-input 
                placeholder="Please enter email" 
                v-model:value="editData.email"
                @blur="handleEmailBlur"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Phone" name="phone">
              <a-input 
                placeholder="(XXX) XXX-XXXX or XXX-XXX-XXXX" 
                v-model:value="editData.phone"
                :maxlength="20"
                @blur="handlePhoneBlur"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
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
          </a-col>
          <a-col :span="12">
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
          </a-col>
        </a-row>
        <a-form-item v-if="!editModel" label="Password">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; gap: 8px; align-items: flex-start;">
              <a-input-password 
                placeholder="Please enter password" 
                v-model:value="createPassword"
                @input="handleCreatePasswordInput"
                @blur="handleCreatePasswordBlur"
                autocomplete="new-password"
                :status="createPasswordErrorMessage ? 'error' : ''"
                style="flex: 1;"
              />
              <a-input-password 
                placeholder="Please confirm password" 
                v-model:value="createPasswordConfirm"
                @input="handleCreatePasswordConfirmInput"
                @blur="handleCreatePasswordConfirmBlur"
                autocomplete="new-password"
                :status="createPasswordErrorMessage ? 'error' : ''"
                style="flex: 1;"
              />
              <a-button type="default" @click="generateCreatePassword" style="flex-shrink: 0;">
                GeneratePW
              </a-button>
            </div>
            <span v-if="createPasswordErrorMessage" style="color: #ff4d4f; font-size: 12px;">
              {{ createPasswordErrorMessage }}
            </span>
          </div>
        </a-form-item>
        <a-form-item v-if="!editModel" label="PIN">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; gap: 8px; align-items: flex-start;">
              <a-input
                placeholder="Please enter 4-digit PIN"
                v-model:value="createPin"
                maxlength="4"
                :inputmode="'numeric'"
                :status="createPinErrorMessage ? 'error' : ''"
                @input="handleCreatePinInput"
                @blur="handleCreatePinBlur"
                style="flex: 1;"
              />
              <a-input
                placeholder="Please confirm 4-digit PIN"
                v-model:value="createPinConfirm"
                maxlength="4"
                :inputmode="'numeric'"
                :status="createPinErrorMessage ? 'error' : ''"
                @input="handleCreatePinConfirmInput"
                @blur="handleCreatePinConfirmBlur"
                style="flex: 1;"
              />
            </div>
            <span v-if="createPinErrorMessage" style="color: #ff4d4f; font-size: 12px;">
              {{ createPinErrorMessage }}
            </span>
          </div>
        </a-form-item>
        <a-form-item label="Alarm Levels" name="alarm_levels">
          <a-select
            v-model:value="editData.alarm_levels"
            mode="multiple"
            placeholder="Please select alarm levels"
            :disabled="!hasManagePermission"
          >
            <a-select-option value="0">0 (EMERG)</a-select-option>
            <!-- <a-select-option value="1">1 (ALERT)</a-select-option> -->
            <!-- <a-select-option value="2">2 (CRIT)</a-select-option> -->
            <!-- <a-select-option value="3">3 (ERR)</a-select-option> -->
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
            <a-select-option value="BRANCH">BRANCH</a-select-option>
            <a-select-option value="ASSIGNED_ONLY">ASSIGNED_ONLY</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Tags" name="tags">
          <a-select
            v-model:value="editData.tags"
            mode="tags"
            placeholder="Please enter tags and press Enter or select"
            :disabled="!hasManagePermission"
            allowClear
            :token-separators="[',']"
          >
            <a-select-option v-for="tag in allTagsList" :key="tag" :value="tag">
              {{ tag }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Branch" name="branch_tag">
          <a-select
            v-model:value="editData.branch_tag"
            placeholder="Please select branch"
            :disabled="!hasManagePermission"
            allowClear
          >
            <a-select-option v-for="branch in branchTagsList" :key="branch" :value="branch">
              {{ branch }}
            </a-select-option>
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
import { ExclamationCircleOutlined, FilterOutlined, ReloadOutlined, HomeOutlined, ArrowLeftOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons-vue'
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
import { getTagsApi } from '@/api/admin/tags/tags'
import { useUserStore } from '@/store/modules/user'
import { usePermission } from '@/hooks/usePermission'

const router = useRouter()
const userStore = useUserStore()
const { hasPermission } = usePermission()
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
// Sort order state
const userAccountSortOrder = ref<'asc' | 'desc' | null>(null)
const nicknameSortOrder = ref<'asc' | 'desc' | null>(null)
const branchSortOrder = ref<'asc' | 'desc' | null>(null)
const roleSortOrder = ref<'asc' | 'desc' | null>(null)
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
const allTagsList = ref<string[]>([]) // All available tags list
const branchTagsList = ref<string[]>([]) // All available branch tags list
const resetPasswordUserId = ref('')
const resetPinUserId = ref('')

// Password state for reset password form
const resetPasswordErrorMessage = ref('')

// Password state for create user form
const createPassword = ref('')
const createPasswordConfirm = ref('')
const createPasswordErrorMessage = ref('')

const createPin = ref('')
const createPinConfirm = ref('')
const createPinErrorMessage = ref('')

// Password validation constants
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_SPECIAL_CHARS = '!@#$%^&*(),.?":{}|<>'

// Validate password strength
const validateCreatePasswordStrength = (password: string): { isValid: boolean; errorMessage: string } => {
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

// Validate password confirmation
const validateCreatePasswordConfirm = (): boolean => {
  if (!createPasswordConfirm.value) {
    if (createPassword.value) {
      createPasswordErrorMessage.value = 'Please confirm your password'
    } else {
      createPasswordErrorMessage.value = ''
    }
    return false
  }

  if (createPassword.value !== createPasswordConfirm.value) {
    createPasswordErrorMessage.value = 'Passwords do not match'
    return false
  }

  // If passwords match, also validate the password strength
  const strengthResult = validateCreatePasswordStrength(createPassword.value)
  createPasswordErrorMessage.value = strengthResult.errorMessage
  return strengthResult.isValid
}

// Handle password input
const handleCreatePasswordInput = () => {
  if (!createPassword.value) {
    createPasswordErrorMessage.value = ''
    return
  }
  if (!createPasswordErrorMessage.value.includes('match')) {
    const result = validateCreatePasswordStrength(createPassword.value)
    createPasswordErrorMessage.value = result.errorMessage
  } else {
    validateCreatePasswordConfirm()
  }
}

// Handle password blur
const handleCreatePasswordBlur = () => {
  if (createPassword.value) {
    const result = validateCreatePasswordStrength(createPassword.value)
    createPasswordErrorMessage.value = result.errorMessage

    // If password is valid, also check confirmation if it exists
    if (result.isValid && createPasswordConfirm.value) {
      validateCreatePasswordConfirm()
    }
  }
}

// Handle password confirm input
const handleCreatePasswordConfirmInput = () => {
  if (!createPasswordConfirm.value) {
    if (!createPassword.value) {
      createPasswordErrorMessage.value = ''
    }
    return
  }
  validateCreatePasswordConfirm()
}

// Handle password confirm blur
const handleCreatePasswordConfirmBlur = () => {
  if (createPasswordConfirm.value) {
    validateCreatePasswordConfirm()
  }
}

// Generate random password
const generateCreatePassword = () => {
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
  
  createPassword.value = randomPassword
  createPasswordConfirm.value = randomPassword
  createPasswordErrorMessage.value = ''
}

// Check if password is valid
const isCreatePasswordValid = computed(() => {
  if (!createPassword.value || !createPasswordConfirm.value) {
    return false
  }
  const strengthResult = validateCreatePasswordStrength(createPassword.value)
  const confirmResult = createPassword.value === createPasswordConfirm.value
  return strengthResult.isValid && confirmResult
})

// Validate PIN
const validateCreatePin = (): boolean => {
  if (!createPinConfirm.value) {
    if (createPin.value) {
      createPinErrorMessage.value = 'Please confirm your PIN'
    } else {
      createPinErrorMessage.value = ''
    }
    return false
  }

  if (createPin.value !== createPinConfirm.value) {
    createPinErrorMessage.value = 'PINs do not match'
    return false
  }

  if (createPin.value.length !== 4 || !/^\d{4}$/.test(createPin.value)) {
    createPinErrorMessage.value = 'PIN must be exactly 4 digits'
    return false
  }

  createPinErrorMessage.value = ''
  return true
}

// Handle PIN input
const handleCreatePinInput = () => {
  if (!createPin.value) {
    createPinErrorMessage.value = ''
    return
  }
  if (!createPinErrorMessage.value.includes('match')) {
    if (createPin.value.length !== 4 || !/^\d{4}$/.test(createPin.value)) {
      createPinErrorMessage.value = 'PIN must be exactly 4 digits'
    } else {
      createPinErrorMessage.value = ''
    }
  } else {
    validateCreatePin()
  }
}

// Handle PIN blur
const handleCreatePinBlur = () => {
  if (createPin.value) {
    if (createPin.value.length !== 4 || !/^\d{4}$/.test(createPin.value)) {
      createPinErrorMessage.value = 'PIN must be exactly 4 digits'
    } else if (createPinConfirm.value) {
      validateCreatePin()
    } else {
      createPinErrorMessage.value = ''
    }
  }
}

// Handle PIN confirm input
const handleCreatePinConfirmInput = () => {
  if (!createPinConfirm.value) {
    if (!createPin.value) {
      createPinErrorMessage.value = ''
    }
    return
  }
  validateCreatePin()
}

// Handle PIN confirm blur
const handleCreatePinConfirmBlur = () => {
  if (createPinConfirm.value) {
    validateCreatePin()
  }
}

// Check if PIN is valid
const isCreatePinValid = computed(() => {
  if (!createPin.value || !createPinConfirm.value) {
    return false
  }
  return validateCreatePin()
})

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
  if (!resetPasswordData.value.confirm_password) {
    if (resetPasswordData.value.new_password) {
      resetPasswordErrorMessage.value = 'Please confirm your password'
    } else {
      resetPasswordErrorMessage.value = ''
    }
    return false
  }

  if (resetPasswordData.value.new_password !== resetPasswordData.value.confirm_password) {
    resetPasswordErrorMessage.value = 'Passwords do not match'
    return false
  }

  // If passwords match, also validate the password strength
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

// Check if reset password is valid
const isResetPasswordValid = computed(() => {
  if (!resetPasswordData.value.new_password || !resetPasswordData.value.confirm_password) {
    return false
  }
  const strengthResult = validateResetPasswordStrength(resetPasswordData.value.new_password)
  const confirmResult = resetPasswordData.value.new_password === resetPasswordData.value.confirm_password
  return strengthResult.isValid && confirmResult
})

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
  branch_tag: '',
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

// Check if user can create users
const canCreateUser = computed(() => {
  // SystemAdmin can always create users in System tenant
  if (isSystemAdmin.value && isSystemTenant.value) {
    return true
  }
  // For other tenants, check users.create permission
  return hasPermission('users.create')
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
    title: 'Branch',
    dataIndex: 'branch_tag',
    key: 'branch_tag',
    ellipsis: true,
    align: 'left',
    className: 'branch-column',
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

// Validate US phone number
// Format: 10 digits, area code (2-9)XX, exchange code (2-9)XX, subscriber number XXXX
// Supports formats: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXX.XXX.XXXX, XXXXXXXXXX
const validateUSPhoneNumber = (_rule: any, value: string): Promise<void> => {
  if (!value || value.trim() === '') {
    // Phone is optional, empty is valid
    return Promise.resolve()
  }
  
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '')
  
  // Check if it's exactly 10 digits
  if (digitsOnly.length !== 10) {
    return Promise.reject('Phone number must be 10 digits')
  }
  
  // Check area code: first digit must be 2-9
  const areaCode = digitsOnly.substring(0, 3)
  const areaCodeFirst = areaCode.charAt(0)
  if (areaCodeFirst && (areaCodeFirst < '2' || areaCodeFirst > '9')) {
    return Promise.reject('Area code must start with 2-9')
  }
  
  // Check exchange code (middle 3 digits): first digit must be 2-9
  const exchangeCode = digitsOnly.substring(3, 6)
  const exchangeCodeFirst = exchangeCode.charAt(0)
  if (exchangeCodeFirst && (exchangeCodeFirst < '2' || exchangeCodeFirst > '9')) {
    return Promise.reject('Exchange code must start with 2-9')
  }
  
  // Valid US phone number format
  return Promise.resolve()
}

// Validate email format
const validateEmail = (_rule: any, value: string): Promise<void> => {
  if (!value || value.trim() === '') {
    // Email is optional, empty is valid
    return Promise.resolve()
  }
  
  // Trim the value for validation
  const trimmedValue = value.trim()
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedValue)) {
    return Promise.reject('Please enter a valid email address')
  }
  
  return Promise.resolve()
}

// Handle email blur - auto trim
const handleEmailBlur = () => {
  if (editData.value.email) {
    editData.value.email = editData.value.email.trim()
  }
}

// Handle phone blur - auto trim
const handlePhoneBlur = () => {
  if (editData.value.phone) {
    editData.value.phone = editData.value.phone.trim()
  }
}

const rules: Record<string, Rule[]> = {
  user_account: [{ required: true, message: 'Please enter user account', trigger: 'blur' }],
  role: [{ required: true, message: 'Please select role', trigger: 'change' }],
  email: [
    { validator: validateEmail, trigger: 'blur' }
  ],
  phone: [
    { validator: validateUSPhoneNumber, trigger: 'blur' }
  ],
  // Password validation is handled by local password logic, not form rules
}

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
      (user.phone && user.phone.toLowerCase().includes(searchLower)) ||
      (user.branch_tag && user.branch_tag.toLowerCase().includes(searchLower))
    )
  })
  
  // Apply status filter
  if (statusFilter.value.length > 0) {
    filtered = filtered.filter((user) => statusFilter.value.includes(user.status))
  }
  
  // Apply sorting
  if (userAccountSortOrder.value) {
    filtered.sort((a, b) => {
      const aVal = (a.user_account || '').toLowerCase()
      const bVal = (b.user_account || '').toLowerCase()
      const comparison = aVal.localeCompare(bVal)
      return userAccountSortOrder.value === 'asc' ? comparison : -comparison
    })
  } else if (nicknameSortOrder.value) {
    filtered.sort((a, b) => {
      const aVal = (a.nickname || '').toLowerCase()
      const bVal = (b.nickname || '').toLowerCase()
      const comparison = aVal.localeCompare(bVal)
      return nicknameSortOrder.value === 'asc' ? comparison : -comparison
    })
  } else if (branchSortOrder.value) {
    filtered.sort((a, b) => {
      const aVal = (a.branch_tag || '').toLowerCase()
      const bVal = (b.branch_tag || '').toLowerCase()
      const comparison = aVal.localeCompare(bVal)
      return branchSortOrder.value === 'asc' ? comparison : -comparison
    })
  } else if (roleSortOrder.value) {
    filtered.sort((a, b) => {
      const aVal = (roleMap.value[a.role || ''] || a.role || '').toLowerCase()
      const bVal = (roleMap.value[b.role || ''] || b.role || '').toLowerCase()
      const comparison = aVal.localeCompare(bVal)
      return roleSortOrder.value === 'asc' ? comparison : -comparison
    })
  }
  
  filteredDataSource.value = filtered
}

const addUser = () => {
  editData.value = { ...emptyUser }
  isEditModalVisible.value = true
  editModel.value = false
}

// Watch role changes to set default alarm configuration (only when creating new user)
watch(
  () => editData.value.role,
  (newRole) => {
    // Only auto-set default when creating new user (not editing)
    if (!editModel.value && newRole) {
      const roleLower = newRole.toLowerCase()
      
      if (roleLower === 'admin') {
        // admin: Alarm Levels 空白，Alarm Channel 空白，Alarm Scope: All
        editData.value.alarm_levels = []
        editData.value.alarm_channels = []
        editData.value.alarm_scope = 'ALL'
      } else if (roleLower === 'manager') {
        // manager: Alarm Levels 0,4，Alarm Channel: email/sms，Alarm Scope: Branch
        editData.value.alarm_levels = ['0', '4']
        editData.value.alarm_channels = ['EMAIL', 'SMS']
        editData.value.alarm_scope = 'BRANCH'
      } else if (roleLower === 'caregiver' || roleLower === 'nurse') {
        // Nurse/caregiver: Alarm Levels 0,4，Alarm Channel: email/sms，Alarm Scope: Assigned_only
        editData.value.alarm_levels = ['0', '4']
        editData.value.alarm_channels = ['EMAIL', 'SMS']
        editData.value.alarm_scope = 'ASSIGNED_ONLY'
      } else if (roleLower === 'it') {
        // IT: Alarm Levels 0,4，Alarm Channel: email/sms，Alarm Scope: Branch
        editData.value.alarm_levels = ['0', '4']
        editData.value.alarm_channels = ['EMAIL', 'SMS']
        editData.value.alarm_scope = 'BRANCH'
      } else {
        // Other roles: keep current value or default to 'ALL'
        if (!editData.value.alarm_scope) {
          editData.value.alarm_scope = 'ALL'
        }
      }
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
  // Validate password for create user
  if (!editModel.value) {
    if (!isCreatePasswordValid.value) {
      message.error(createPasswordErrorMessage.value || 'Please enter a valid password')
      return
    }
  }
  
  formEditRef.value
    .validate()
    .then(async () => {
      try {
        if (!editModel.value) {
          // Create new user - get password from local state
          if (!isCreatePasswordValid.value) {
            message.error(createPasswordErrorMessage.value || 'Please enter a valid password')
            return
          }
          const password = createPassword.value
          if (!password) {
            message.error('Please enter a valid password')
            return
          }
          
          const params: CreateUserParams = {
            user_account: editData.value.user_account!,
            nickname: editData.value.nickname,
            email: editData.value.email ? editData.value.email.trim() : undefined,
            phone: editData.value.phone ? editData.value.phone.trim() : undefined,
            role: editData.value.role!,
            password: password,
            alarm_levels: editData.value.alarm_levels,
            alarm_channels: editData.value.alarm_channels,
            alarm_scope: editData.value.alarm_scope,
            tags: editData.value.tags,
            branch_tag: editData.value.branch_tag,
          }
          const result = await createUserApi(params)
          
          // Set PIN if provided and valid
          if (isCreatePinValid.value && createPin.value) {
            try {
              await resetPinApi(result.user_id, {
                new_pin: createPin.value,
              })
              message.success('User and PIN created successfully')
            } catch (error: any) {
              console.error('Failed to set PIN:', error)
              message.warning('User created successfully, but PIN setup failed. You can set it later.')
            }
          } else {
            message.success('User created successfully')
          }
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
  // Validate password strength first
  if (!isResetPasswordValid.value) {
    message.error(resetPasswordErrorMessage.value || 'Please check password requirements')
    return
  }

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
  // Clear password fields
  createPassword.value = ''
  createPasswordConfirm.value = ''
  createPasswordErrorMessage.value = ''
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
  // Clear password fields and error message
  resetPasswordData.value = {
    new_password: '',
    confirm_password: '',
  }
  resetPasswordErrorMessage.value = ''
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
    // Get current user's role
    const currentUserRole = userStore.getUserInfo?.role
    
    // Role dropdown is for creating/updating *users*:
    // - Always hide Resident/Family (they belong to residents flow, not staff users)
    // - Never allow assigning SystemAdmin here
    // - Only SystemAdmin within System tenant can assign SystemOperator
    // - Manager/IT cannot assign Admin role (security: prevent privilege escalation)
    availableRoles.value = data.items.filter(
      (role) =>
        role.is_active &&
        role.role_code !== 'Resident' &&
        role.role_code !== 'Family' &&
        role.role_code !== 'SystemAdmin' &&
        (role.role_code !== 'SystemOperator' || (isSystemTenant.value && isSystemAdmin.value)) &&
        // Manager/IT cannot assign Admin role
        !(role.role_code === 'Admin' && (currentUserRole === 'Manager' || currentUserRole === 'IT'))
    )
  } catch (error: any) {
    console.error('Failed to fetch roles:', error)
  }
}

// Initialize tags list (from tags_catalog API)
const initializeTagsList = async () => {
  try {
    // Get current user's tenant_id
    const userInfo = userStore.userInfo
    const tenantId = userInfo?.tenant_id
    
    if (!tenantId) {
      console.warn('[UserList] No tenant_id available, using empty tags list')
      allTagsList.value = []
      return
    }
    
    // Get tags from API (only get user_tag type tags)
    const result = await getTagsApi({
      tenant_id: tenantId,
      tag_type: 'user_tag',
      include_system_tag_types: true,
    })
    
    // Extract tag_name list
    allTagsList.value = result.items.map(tag => tag.tag_name).sort()
  } catch (error: any) {
    console.error('Failed to fetch tags:', error)
    // If API call fails, use empty list (avoid showing error)
    allTagsList.value = []
  }
}

// Initialize branch tags list (from tags_catalog API)
// For branch_tag, branch names are stored in tag_objects JSONB
const initializeBranchTagsList = async () => {
  try {
    // Get current user's tenant_id
    const userInfo = userStore.userInfo
    const tenantId = userInfo?.tenant_id
    
    if (!tenantId) {
      console.warn('[UserList] No tenant_id available, using empty branch tags list')
      branchTagsList.value = []
      return
    }
    
    // Get branch_tag from API
    const result = await getTagsApi({
      tenant_id: tenantId,
      tag_type: 'branch_tag',
      include_system_tag_types: true,
    })
    
    // Extract branch names from tag_objects
    // For branch_tag, tag_objects structure: { "branch": { "<uuid>": "<branch_name>", ... } }
    const branchNames: string[] = []
    result.items.forEach(tag => {
      if (tag.tag_objects && tag.tag_objects.branch) {
        // Extract all branch names from tag_objects.branch
        Object.values(tag.tag_objects.branch).forEach(branchName => {
          if (typeof branchName === 'string' && branchName && !branchNames.includes(branchName)) {
            branchNames.push(branchName)
          }
        })
      }
    })
    
    branchTagsList.value = branchNames.sort()
  } catch (error: any) {
    console.error('Failed to fetch branch tags:', error)
    // If API call fails, use empty list (avoid showing error)
    branchTagsList.value = []
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

// Toggle sort functions
const toggleUserAccountSort = () => {
  if (userAccountSortOrder.value === null) {
    userAccountSortOrder.value = 'asc'
  } else if (userAccountSortOrder.value === 'asc') {
    userAccountSortOrder.value = 'desc'
  } else {
    userAccountSortOrder.value = null
  }
  // Reset other sorts
  nicknameSortOrder.value = null
  branchSortOrder.value = null
  roleSortOrder.value = null
  applyFilters()
}

const toggleNicknameSort = () => {
  if (nicknameSortOrder.value === null) {
    nicknameSortOrder.value = 'asc'
  } else if (nicknameSortOrder.value === 'asc') {
    nicknameSortOrder.value = 'desc'
  } else {
    nicknameSortOrder.value = null
  }
  // Reset other sorts
  userAccountSortOrder.value = null
  branchSortOrder.value = null
  roleSortOrder.value = null
  applyFilters()
}

const toggleBranchSort = () => {
  if (branchSortOrder.value === null) {
    branchSortOrder.value = 'asc'
  } else if (branchSortOrder.value === 'asc') {
    branchSortOrder.value = 'desc'
  } else {
    branchSortOrder.value = null
  }
  // Reset other sorts
  userAccountSortOrder.value = null
  nicknameSortOrder.value = null
  roleSortOrder.value = null
  applyFilters()
}

const toggleRoleSort = () => {
  if (roleSortOrder.value === null) {
    roleSortOrder.value = 'asc'
  } else if (roleSortOrder.value === 'asc') {
    roleSortOrder.value = 'desc'
  } else {
    roleSortOrder.value = null
  }
  // Reset other sorts
  userAccountSortOrder.value = null
  nicknameSortOrder.value = null
  branchSortOrder.value = null
  applyFilters()
}

// Apply filters and sorting to dataSource
const applyFilters = () => {
  let filtered = [...dataSource.value]
  
  // Filter by status
  if (statusFilter.value.length > 0) {
    filtered = filtered.filter((user) => statusFilter.value.includes(user.status))
  }
  
  // Apply sorting
  if (userAccountSortOrder.value) {
    filtered.sort((a, b) => {
      const aVal = (a.user_account || '').toLowerCase()
      const bVal = (b.user_account || '').toLowerCase()
      const comparison = aVal.localeCompare(bVal)
      return userAccountSortOrder.value === 'asc' ? comparison : -comparison
    })
  } else if (nicknameSortOrder.value) {
    filtered.sort((a, b) => {
      const aVal = (a.nickname || '').toLowerCase()
      const bVal = (b.nickname || '').toLowerCase()
      const comparison = aVal.localeCompare(bVal)
      return nicknameSortOrder.value === 'asc' ? comparison : -comparison
    })
  } else if (branchSortOrder.value) {
    filtered.sort((a, b) => {
      const aVal = (a.branch_tag || '').toLowerCase()
      const bVal = (b.branch_tag || '').toLowerCase()
      const comparison = aVal.localeCompare(bVal)
      return branchSortOrder.value === 'asc' ? comparison : -comparison
    })
  } else if (roleSortOrder.value) {
    filtered.sort((a, b) => {
      const aVal = (roleMap.value[a.role || ''] || a.role || '').toLowerCase()
      const bVal = (roleMap.value[b.role || ''] || b.role || '').toLowerCase()
      const comparison = aVal.localeCompare(bVal)
      return roleSortOrder.value === 'asc' ? comparison : -comparison
    })
  }
  
  filteredDataSource.value = filtered
}

const refreshData = () => {
  fetchData()
}

onMounted(() => {
  fetchRoles()
  initializeTagsList()
  initializeBranchTagsList()
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

