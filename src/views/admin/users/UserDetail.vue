<template>
  <div style="padding: 15px">
    <div class="page-header">
      <div class="header-left">
        <a-space>
          <a-button @click="goBack">← Back</a-button>
          <a-button type="primary" @click="handleSave" :loading="saving">
            Save
          </a-button>
          <a-button @click="goBack">Cancel</a-button>
          <a-button @click="handleResetPassword" v-if="canResetPassword">
            Passwd
          </a-button>
          <a-button @click="handleResetPin" v-if="canResetPassword">
            PIN
          </a-button>
        </a-space>
        <h1>{{ editModel ? 'Edit User' : 'User Detail' }}</h1>
      </div>
    </div>

    <div class="form-container">
      <a-row :gutter="24">
        <!-- Left column -->
        <a-col :span="10">
          <a-form
            layout="vertical"
            :model="userData"
            ref="formRef"
            :rules="rules"
          >
            <!-- Basic information area -->
            <a-divider orientation="left">Basic Information</a-divider>
            
            <a-form-item label="User Account" name="user_account">
              <a-input
                v-model:value="userData.user_account"
                :disabled="true"
                placeholder="User account (read-only)"
              />
            </a-form-item>

            <a-form-item label="Nickname" name="nickname">
              <a-input
                v-model:value="userData.nickname"
                :disabled="!canEditNickname"
                placeholder="Please enter nickname"
              />
              <span v-if="!canEditNickname && isCurrentUser" class="field-hint">
                You can edit your own nickname
              </span>
            </a-form-item>

            <a-form-item label="Email" name="email">
              <a-input
                v-model:value="userData.email"
                :disabled="!canEditEmail"
                placeholder="Please enter email"
              />
              <span v-if="!canEditEmail && isCurrentUser" class="field-hint">
                You can edit your own email
              </span>
            </a-form-item>

            <a-form-item label="Phone" name="phone">
              <a-input
                v-model:value="userData.phone"
                :disabled="!canEditPhone"
                placeholder="Please enter phone"
              />
              <span v-if="!canEditPhone && isCurrentUser" class="field-hint">
                You can edit your own phone
              </span>
            </a-form-item>

            <a-form-item label="Role" name="role">
              <a-select
                v-model:value="userData.role"
                placeholder="Please select role"
                :disabled="!hasManagePermission"
              >
                <a-select-option v-for="role in availableRoles" :key="role.role_code" :value="role.role_code">
                  {{ role.display_name || role.role_code }}
                </a-select-option>
              </a-select>
              <span v-if="!hasManagePermission" class="field-hint">
                This field can only be modified by administrators
              </span>
            </a-form-item>

            <a-form-item label="Status" name="status">
              <a-select
                v-model:value="userData.status"
                placeholder="Please select status"
                :disabled="!hasManagePermission"
              >
                <a-select-option value="active">Active</a-select-option>
                <a-select-option value="disabled">Disabled</a-select-option>
                <a-select-option value="left">Left</a-select-option>
              </a-select>
              <span v-if="!hasManagePermission" class="field-hint">
                This field can only be modified by administrators
              </span>
            </a-form-item>

            <a-form-item>
              <span class="last-login-label">Last Login:</span>
              <span style="margin-left: 8px;">{{ userData.last_login_at || '-' }}</span>
            </a-form-item>
          </a-form>
        </a-col>

        <!-- Right column -->
        <a-col :span="14">
          <a-form
            layout="vertical"
            :model="userData"
            ref="formRefRight"
          >
            <!-- Alarm configuration area -->
            <a-divider orientation="left">Alarm Configuration</a-divider>

            <a-form-item label="Receive Alarm Levels" name="alarm_levels">
              <a-checkbox-group
                v-model:value="userData.alarm_levels"
                :disabled="!hasManagePermission"
              >
                <a-checkbox value="0" class="alarm-level-emerg">0 (<span class="alarm-text-emerg">EMERG</span>)</a-checkbox>
                <a-checkbox value="1" class="alarm-level-alert">1 (<span class="alarm-text-alert">ALERT</span>)</a-checkbox>
                <a-checkbox value="2" class="alarm-level-crit">2 (<span class="alarm-text-crit">CRIT</span>)</a-checkbox>
                <a-checkbox value="3" class="alarm-level-err">3 (<span class="alarm-text-err">ERR</span>)</a-checkbox>
                <a-checkbox value="4" class="alarm-level-warning">4 (<span class="alarm-text-warning">WARNING</span>)</a-checkbox>
              </a-checkbox-group>
              <span v-if="!hasManagePermission" class="field-hint">
                This field can only be modified by administrators
              </span>
            </a-form-item>

            <a-form-item label="Alarm Channels" name="alarm_channels">
              <a-checkbox-group
                v-model:value="userData.alarm_channels"
                :disabled="!hasManagePermission"
              >
                <a-checkbox value="EMAIL">EMAIL</a-checkbox>
                <a-checkbox value="SMS">SMS</a-checkbox>
              </a-checkbox-group>
              <span v-if="!hasManagePermission" class="field-hint">
                This field can only be modified by administrators
              </span>
            </a-form-item>

            <a-form-item label="Alarm Scope" name="alarm_scope">
              <a-radio-group
                v-model:value="userData.alarm_scope"
                :disabled="!hasManagePermission"
              >
                <a-radio value="ALL">ALL</a-radio>
                <a-radio value="BRANCH">BRANCH</a-radio>
                <a-radio value="ASSIGNED_ONLY">ASSIGNED_ONLY</a-radio>
              </a-radio-group>
              <span v-if="!hasManagePermission" class="field-hint">
                This field can only be modified by administrators
              </span>
            </a-form-item>

            <!-- Other information area -->
            <a-divider orientation="left">Other Information</a-divider>

            <a-form-item label="Tags" name="tags">
              <div class="tags-checkbox-container">
                <a-checkbox-group
                  v-model:value="userData.tags"
                  :disabled="!hasManagePermission"
                >
                  <a-row :gutter="[16, 8]">
                    <a-col :span="6" v-for="tag in allTagsList" :key="tag">
                      <a-checkbox :value="tag">{{ tag }}</a-checkbox>
                    </a-col>
                  </a-row>
                </a-checkbox-group>
              </div>
              <span v-if="!hasManagePermission" class="field-hint">
                This field can only be modified by administrators
              </span>
            </a-form-item>

            <a-form-item label="Branch" name="branch_tag">
              <a-select
                v-model:value="userData.branch_tag"
                placeholder="Please select branch"
                :disabled="!hasManagePermission"
                allow-clear
              >
                <a-select-option v-for="branch in branchTagsList" :key="branch" :value="branch">
                  {{ branch }}
                </a-select-option>
              </a-select>
              <span v-if="!hasManagePermission" class="field-hint">
                This field can only be modified by administrators
              </span>
            </a-form-item>

          </a-form>
        </a-col>
      </a-row>
    </div>

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

    <!-- Reset PIN Modal -->
    <a-modal
      v-model:visible="isResetPinModalVisible"
      title="Reset PIN"
      width="500px"
      @ok="handleResetPinConfirm"
      @cancel="handleCancelResetPin"
    >
      <template #footer>
        <div style="padding: 10px 16px">
          <a-button key="back" @click="handleCancelResetPin" style="margin-right: 30px">Cancel</a-button>
          <a-button key="submit" type="primary" @click="handleResetPinConfirm" style="margin-right: 20px">
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
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/lib/form'

import {
  getUserApi,
  updateUserApi,
  resetPasswordApi,
  resetPinApi,
} from '@/api/admin/user/user'
import { getTagsApi } from '@/api/admin/tags/tags'
import type {
  User,
  UpdateUserParams,
  ResetPasswordParams,
  ResetPinParams,
} from '@/api/admin/user/model/userModel'
import { getRolesApi } from '@/api/admin/role/role'
import type { Role } from '@/api/admin/role/model/roleModel'
import { useUserStore } from '@/store/modules/user'
import { usePermission } from '@/hooks/usePermission'
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userId = computed(() => route.params.id as string)

const SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000001'
const isSystemTenant = computed(() => userStore.userInfo?.tenant_id === SYSTEM_TENANT_ID)
const isSystemAdmin = computed(() => userStore.userInfo?.role === 'SystemAdmin')

// Use permission check Composable
const { hasManagePermission, isCurrentUser: checkIsCurrentUser } = usePermission()

// Check if it's the current user
const isCurrentUser = computed(() => {
  return checkIsCurrentUser(userId.value)
})

// Debug: print permission info (development environment)
if (import.meta.env.DEV) {
  watchEffect(() => {
    const userInfo = userStore.getUserInfo
    console.log('[UserDetail] Permission Debug:', {
      userInfo: userInfo ? { userId: userInfo.userId, role: userInfo.role, userType: userInfo.userType } : null,
      hasManagePermission: hasManagePermission.value,
      currentUserId: userId.value,
      isCurrentUser: isCurrentUser.value,
    })
  })
}

const editModel = ref(true) // Detail page is editable by default
const formRef = ref()
const formRefRight = ref()
const saving = ref(false)
const isResetPasswordModalVisible = ref(false)
const isResetPinModalVisible = ref(false)
const availableRoles = ref<Role[]>([])
const allTagsList = ref<string[]>([]) // All available tags list
const branchTagsList = ref<string[]>([]) // All available branch tags list
const resetPasswordFormRef = ref()
const resetPinFormRef = ref()

const userData = ref<Partial<User>>({
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
  last_login_at: '',
})

// Password reset state (reuse UserList.vue logic)
const resetPasswordData = ref({
  new_password: '',
  confirm_password: '',
})
const resetPasswordErrorMessage = ref('')

// PIN reset state (reuse UserList.vue logic)
const resetPinData = ref({
  new_pin: '',
  confirm_pin: '',
})

// Password validation constants
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_SPECIAL_CHARS = '!@#$%^&*(),.?":{}|<>'

// Validate reset password strength (reuse UserList.vue logic)
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

// Validate reset password confirmation (reuse UserList.vue logic)
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

// Handle reset password input (reuse UserList.vue logic)
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

// Handle reset password blur (reuse UserList.vue logic)
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

// Handle reset password confirm input (reuse UserList.vue logic)
const handleResetPasswordConfirmInput = () => {
  if (!resetPasswordData.value.confirm_password) {
    if (!resetPasswordData.value.new_password) {
      resetPasswordErrorMessage.value = ''
    }
    return
  }
  validateResetPasswordConfirm()
}

// Handle reset password confirm blur (reuse UserList.vue logic)
const handleResetPasswordConfirmBlur = () => {
  if (resetPasswordData.value.confirm_password) {
    validateResetPasswordConfirm()
  }
}

// Generate random password for reset (reuse UserList.vue logic)
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

// Check if reset password is valid (reuse UserList.vue logic)
const isResetPasswordValid = computed(() => {
  if (!resetPasswordData.value.new_password || !resetPasswordData.value.confirm_password) {
    return false
  }
  const strengthResult = validateResetPasswordStrength(resetPasswordData.value.new_password)
  const confirmResult = resetPasswordData.value.new_password === resetPasswordData.value.confirm_password
  return strengthResult.isValid && confirmResult
})

// Check if field can be edited
const canEditNickname = computed(() => {
  return isCurrentUser.value || hasManagePermission.value
})

const canEditEmail = computed(() => {
  return isCurrentUser.value || hasManagePermission.value
})

const canEditPhone = computed(() => {
  return isCurrentUser.value || hasManagePermission.value
})

const canResetPassword = computed(() => {
  return isCurrentUser.value || hasManagePermission.value
})

const rules: Record<string, Rule[]> = {
  role: [{ required: true, message: 'Please select role', trigger: 'change' }],
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

const fetchRoles = async () => {
  try {
    const data = await getRolesApi()
    // Role dropdown is for editing *users*:
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

// Convert old alarm_levels format to new numeric format
const normalizeAlarmLevels = (levels: string[] | undefined): string[] => {
  if (!levels || levels.length === 0) return []
  
  // Old format to new format mapping
  const oldToNewMap: Record<string, string> = {
    'EMERGENCY': '0',
    'WARNING': '4',
    'ERROR': '3',
  }
  
  // If already in numeric format, return directly
  // If in old format, convert to new format
  return levels.map(level => {
    // If already a numeric string (0-7), return directly
    if (/^[0-7]$/.test(level)) {
      return level
    }
    // If in old format, convert to new format
    return oldToNewMap[level] || level
  }).filter(Boolean) // Filter out unmapped values
}

const fetchUser = async () => {
  try {
    const user = await getUserApi(userId.value)
    userData.value = {
      ...user,
      alarm_levels: normalizeAlarmLevels(user.alarm_levels),
      alarm_channels: user.alarm_channels || [],
      alarm_scope: user.alarm_scope || 'ALL',
      tags: user.tags || [],
      branch_tag: user.branch_tag || '',
    }
    // Initialize all tags list (from tags_catalog API)
    await initializeTagsList()
    // Initialize branch tags list
    await initializeBranchTagsList()
  } catch (error: any) {
    console.error('Failed to fetch user:', error)
    message.error(error?.message || 'Failed to fetch user')
    goBack()
  }
}

// Initialize tags list (from tags_catalog API)
const initializeTagsList = async () => {
  try {
    // Get current user's tenant_id
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id || userData.value.tenant_id
    
    if (!tenantId) {
      console.warn('[UserDetail] No tenant_id available, using empty tags list')
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
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id || userData.value.tenant_id
    
    if (!tenantId) {
      console.warn('[UserDetail] No tenant_id available, using empty branch tags list')
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

// Handle tag checkbox uncheck
const handleTagUncheck = (tag: string, checked: boolean) => {
  if (!hasManagePermission.value) {
    message.warning('Only administrators can edit tags')
    return
  }
  
  if (!checked) {
    // Uncheck: remove from tags list
    if (userData.value.tags) {
      const index = userData.value.tags.indexOf(tag)
      if (index > -1) {
        userData.value.tags.splice(index, 1)
        message.success(`Tag "${tag}" removed`)
      }
    }
  } else {
    // Re-check: add to tags list
    if (!userData.value.tags) {
      userData.value.tags = []
    }
    if (!userData.value.tags.includes(tag)) {
      userData.value.tags.push(tag)
      message.success(`Tag "${tag}" added`)
    }
  }
}


const handleSave = async () => {
  // Validate both forms
  Promise.all([
    formRef.value?.validate(),
    formRefRight.value?.validate(),
  ])
    .then(async () => {
      saving.value = true
      try {
        const params: UpdateUserParams = {
          nickname: userData.value.nickname,
          email: userData.value.email,
          phone: userData.value.phone,
          role: hasManagePermission.value ? userData.value.role : undefined,
          status: hasManagePermission.value ? userData.value.status : undefined,
          alarm_levels: hasManagePermission.value ? userData.value.alarm_levels : undefined,
          alarm_channels: hasManagePermission.value ? userData.value.alarm_channels : undefined,
          alarm_scope: hasManagePermission.value ? userData.value.alarm_scope : undefined,
          tags: hasManagePermission.value ? userData.value.tags : undefined,
          branch_tag: hasManagePermission.value ? userData.value.branch_tag : undefined,
        }
        await updateUserApi(userId.value, params)
        message.success('User updated successfully')
        fetchUser() // Refresh data
      } catch (error: any) {
        console.error('Failed to update user:', error)
        message.error(error?.message || 'Failed to update user')
      } finally {
        saving.value = false
      }
    })
    .catch((error: any) => {
      console.error('Validation failed:', error)
    })
}

const handleResetPassword = () => {
  resetPasswordData.value = {
    new_password: '',
    confirm_password: '',
  }
  resetPasswordErrorMessage.value = ''
  isResetPasswordModalVisible.value = true
}

const handleResetPasswordConfirm = async () => {
  // Validate password strength first (reuse UserList.vue logic)
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
        await resetPasswordApi(userId.value, params)
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

const handleCancelResetPassword = () => {
  isResetPasswordModalVisible.value = false
  resetPasswordFormRef.value?.resetFields()
  // Clear password fields and error message
  resetPasswordData.value = {
    new_password: '',
    confirm_password: '',
  }
  resetPasswordErrorMessage.value = ''
}

const handleResetPin = () => {
  resetPinData.value = {
    new_pin: '',
    confirm_pin: '',
  }
  isResetPinModalVisible.value = true
}

const handleResetPinConfirm = async () => {
  resetPinFormRef.value
    .validate()
    .then(async () => {
      try {
        const params: Omit<ResetPinParams, 'user_id'> = {
          new_pin: resetPinData.value.new_pin,
        }
        await resetPinApi(userId.value, params)
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
  resetPinFormRef.value?.resetFields()
  resetPinData.value = {
    new_pin: '',
    confirm_pin: '',
  }
}

const goBack = () => {
  router.push('/admin/users')
}

onMounted(() => {
  fetchRoles()
  fetchUser()
})
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #262626;
}

.form-container {
  max-width: 1200px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}

.field-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

:deep(.ant-divider) {
  margin: 24px 0 16px 0;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

.tags-checkbox-container {
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
}

.tags-checkbox-container :deep(.ant-checkbox-group) {
  width: 100%;
}

.tags-checkbox-container :deep(.ant-row) {
  margin-left: -8px !important;
  margin-right: -8px !important;
}

.tags-checkbox-container :deep(.ant-col) {
  padding-left: 8px !important;
  padding-right: 8px !important;
  margin-bottom: 4px;
}

.tag-checkbox {
  width: 100%;
  display: flex;
  align-items: flex-start;
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
  margin: 0;
  padding: 0;
}

.tag-checkbox :deep(.ant-checkbox) {
  margin-right: 8px;
  margin-top: 2px;
  flex-shrink: 0;
}

.tag-checkbox :deep(.ant-checkbox + span) {
  flex: 1;
  display: inline-block;
  word-break: break-word;
  white-space: normal;
  line-height: 1.5;
  padding-right: 8px;
  min-width: 0;
}

.last-login-label {
  font-weight: 500;
  color: #262626;
}


/* Alarm level colors - consistent with wellnessMonitor, only change text color */
:deep(.alarm-text-emerg) {
  color: #d32f2f !important;
  font-weight: 500;
}

:deep(.alarm-text-alert) {
  color: #d32f2f !important;
  font-weight: 500;
}

:deep(.alarm-text-crit) {
  color: #f3783f !important;
  font-weight: 500;
}

:deep(.alarm-text-err) {
  color: #f3783f !important;
  font-weight: 500;
}

:deep(.alarm-text-warning) {
  color: #f3783f !important;
  font-weight: 500;
}
</style>

