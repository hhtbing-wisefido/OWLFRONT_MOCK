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
            Reset PW
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
                <a-checkbox value="APP">APP</a-checkbox>
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
                <a-radio value="LOCATION-TAG">LOCATION-TAG</a-radio>
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
} from '@/api/admin/user/user'
import { getTagsApi } from '@/api/admin/tags/tags'
import type {
  User,
  UpdateUserParams,
} from '@/api/admin/user/model/userModel'
import { getRolesApi } from '@/api/admin/role/role'
import type { Role } from '@/api/admin/role/model/roleModel'
import { useUserStore } from '@/store/modules/user'
import { usePermission } from '@/hooks/usePermission'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userId = computed(() => route.params.id as string)

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
const resetPasswordFormRef = ref()
const saving = ref(false)
const isResetPasswordModalVisible = ref(false)
const availableRoles = ref<Role[]>([])
const allTagsList = ref<string[]>([]) // All available tags list


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

const resetPasswordData = ref({
  new_password: '',
  confirm_password: '',
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

const fetchRoles = async () => {
  try {
    const data = await getRolesApi()
    availableRoles.value = data.items.filter((role) => role.is_active)
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
    }
    // Initialize all tags list (from tags_catalog API)
    await initializeTagsList()
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
    
    // Get tags from API (only get enabled tags)
    const result = await getTagsApi({
      tenant_id: tenantId,
      is_active: true,
      include_system_tags: true,
    })
    
    // Extract tag_name list
    allTagsList.value = result.items.map(tag => tag.tag_name).sort()
  } catch (error: any) {
    console.error('Failed to fetch tags:', error)
    // If API call fails, use empty list (avoid showing error)
    allTagsList.value = []
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
  isResetPasswordModalVisible.value = true
}

const handleResetPasswordConfirm = async () => {
  resetPasswordFormRef.value
    .validate()
    .then(async () => {
      try {
        await resetPasswordApi(userId.value, {
          new_password: resetPasswordData.value.new_password,
        })
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

