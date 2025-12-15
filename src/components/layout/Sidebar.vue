<template>
  <div class="sidebar">
    <!-- Logo area: logo_icon + OwlCare -->
    <div class="sidebar-logo" :class="{ collapsed: collapsed }">
      <img src="@/assets/images/logo-icon.png" alt="OwlCare" class="logo-icon" />
      <h2 v-if="!collapsed">OwlCare</h2>
    </div>
    
    <!-- User info area: Hi, user's NickName + collapse/expand icon (row 2) -->
    <div class="sidebar-user-info" :class="{ collapsed: collapsed }">
      <div class="user-name" v-if="!collapsed">
        Hi, {{ userInfo?.nickName || userInfo?.user_account || 'User' }}
      </div>
      <a-button
        type="text"
        @click="$emit('toggle')"
        class="trigger-button"
      >
        <template #icon>
          <MenuUnfoldOutlined v-if="collapsed" />
          <MenuFoldOutlined v-else />
        </template>
      </a-button>
    </div>
    
    <!-- Actions area: tenant_name (left) + key_icon + logout_icon (right) (row 3) -->
    <div class="sidebar-actions" :class="{ collapsed: collapsed }">
      <div class="tenant-name" v-if="!collapsed">
        {{ getFirstWord(userInfo?.tenant_name) || '' }}
      </div>
      <div class="action-buttons">
        <a-button v-if="!collapsed" type="text" class="action-btn" @click="handlePasswordChange" title="Change Password">
          <template #icon>
            <LockOutlined />
          </template>
        </a-button>
        <a-button type="text" class="action-btn" @click="handleLogout" title="Logout">
          <template #icon>
            <LogoutOutlined />
          </template>
        </a-button>
      </div>
    </div>

    <!-- Change Password Modal (in-app, authenticated) -->
    <a-modal
      v-model:visible="passwordModalVisible"
      title="Change Password"
      :confirm-loading="changingPassword"
      @ok="submitPasswordChange"
      @cancel="closePasswordModal"
      ok-text="Update"
    >
      <div style="padding: 20px">
        <a-form-item label="Password: At least 8 characters, including uppercase, lowercase, number, and special character" style="margin-bottom: 16px;">
          <div style="display: flex; gap: 12px; align-items: flex-start; flex-direction: column;">
            <div style="display: flex; gap: 12px; width: 100%;">
              <a-input-password
                v-model:value="sidebarPassword"
                placeholder="Enter new password"
                style="width: 200px"
                @input="handleSidebarPasswordInput"
                @blur="handleSidebarPasswordBlur"
              />
              <a-input-password
                v-model:value="sidebarPasswordConfirm"
                placeholder="Confirm password"
                style="width: 200px"
                @input="handleSidebarPasswordConfirmInput"
                @blur="handleSidebarPasswordConfirmBlur"
              />
              <a-button
                type="default"
                @click="generateSidebarPassword"
                style="min-width: 100px"
              >
                GeneratePW
              </a-button>
            </div>
            <div v-if="sidebarPasswordErrorMessage" style="font-size: 12px; color: #ff4d4f; margin-top: 4px;">
              {{ sidebarPasswordErrorMessage }}
            </div>
          </div>
        </a-form-item>
      </div>
    </a-modal>
    
    <!-- Divider before menu -->
    <div class="sidebar-divider"></div>
    
    <Menu :collapsed="collapsed" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Menu from './Menu.vue'
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { message } from 'ant-design-vue'
import { resetPasswordApi } from '@/api/admin/user/user'
defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  toggle: []
}>()

const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.getUserInfo)

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const handlePasswordChange = () => {
  // In-app change password (for logged-in user)
  passwordModalVisible.value = true
}

const passwordModalVisible = ref(false)
const changingPassword = ref(false)

// Password state for sidebar password change (independent implementation)
const sidebarPassword = ref('')
const sidebarPasswordConfirm = ref('')
const sidebarPasswordErrorMessage = ref('')

// Password validation constants
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_SPECIAL_CHARS = '!@#$%^&*(),.?":{}|<>'

// Validate password strength
const validateSidebarPasswordStrength = (password: string): { isValid: boolean; errorMessage: string } => {
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
const validateSidebarPasswordConfirm = (): boolean => {
  if (!sidebarPasswordConfirm.value) {
    if (sidebarPassword.value) {
      sidebarPasswordErrorMessage.value = 'Please confirm your password'
    } else {
      sidebarPasswordErrorMessage.value = ''
    }
    return false
  }

  if (sidebarPassword.value !== sidebarPasswordConfirm.value) {
    sidebarPasswordErrorMessage.value = 'Passwords do not match'
    return false
  }

  // If passwords match, also validate the password strength
  const strengthResult = validateSidebarPasswordStrength(sidebarPassword.value)
  sidebarPasswordErrorMessage.value = strengthResult.errorMessage
  return strengthResult.isValid
}

// Handle password blur
const handleSidebarPasswordBlur = () => {
  if (sidebarPassword.value) {
    const result = validateSidebarPasswordStrength(sidebarPassword.value)
    sidebarPasswordErrorMessage.value = result.errorMessage

    // If password is valid, also check confirmation if it exists
    if (result.isValid && sidebarPasswordConfirm.value) {
      validateSidebarPasswordConfirm()
    }
  }
}

// Handle password confirm blur
const handleSidebarPasswordConfirmBlur = () => {
  if (sidebarPasswordConfirm.value) {
    validateSidebarPasswordConfirm()
  }
}

// Handle password input
const handleSidebarPasswordInput = () => {
  if (!sidebarPassword.value) {
    sidebarPasswordErrorMessage.value = ''
    return
  }
  if (!sidebarPasswordErrorMessage.value.includes('match')) {
    const result = validateSidebarPasswordStrength(sidebarPassword.value)
    sidebarPasswordErrorMessage.value = result.errorMessage
  } else {
    validateSidebarPasswordConfirm()
  }
}

// Handle password confirm input
const handleSidebarPasswordConfirmInput = () => {
  if (!sidebarPasswordConfirm.value) {
    if (!sidebarPassword.value) {
      sidebarPasswordErrorMessage.value = ''
    }
    return
  }
  validateSidebarPasswordConfirm()
}

// Generate random password
const generateSidebarPassword = () => {
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
  
  sidebarPassword.value = randomPassword
  sidebarPasswordConfirm.value = randomPassword
  sidebarPasswordErrorMessage.value = ''
}

// Check if password is valid
const isSidebarPasswordValid = computed(() => {
  if (!sidebarPassword.value || !sidebarPasswordConfirm.value) {
    return false
  }
  const strengthResult = validateSidebarPasswordStrength(sidebarPassword.value)
  const confirmResult = sidebarPassword.value === sidebarPasswordConfirm.value
  return strengthResult.isValid && confirmResult
})

const closePasswordModal = () => {
  passwordModalVisible.value = false
  changingPassword.value = false
  // Clear password fields
  sidebarPassword.value = ''
  sidebarPasswordConfirm.value = ''
  sidebarPasswordErrorMessage.value = ''
}

const submitPasswordChange = async () => {
  const uid = userInfo.value?.userId
  if (!uid) {
    message.error('User is not loaded')
    return
  }

  // Validate password
  if (!isSidebarPasswordValid.value) {
    message.error(sidebarPasswordErrorMessage.value || 'Please check password requirements')
    return
  }

  if (!sidebarPassword.value || !sidebarPasswordConfirm.value) {
    message.error('Please enter a valid password')
    return
  }
  if (sidebarPassword.value !== sidebarPasswordConfirm.value) {
    message.error('Passwords do not match')
    return
  }
  const strengthResult = validateSidebarPasswordStrength(sidebarPassword.value)
  if (!strengthResult.isValid) {
    message.error(strengthResult.errorMessage || 'Please enter a valid password')
    return
  }

  const password = sidebarPassword.value

  changingPassword.value = true
  try {
    await resetPasswordApi(uid, { new_password: password })
    message.success('Password updated')
    closePasswordModal()
  } catch (e: any) {
    message.error(e?.message || 'Failed to update password')
  } finally {
    changingPassword.value = false
  }
}

// Get first word from tenant name
const getFirstWord = (text?: string): string => {
  if (!text) return ''
  return text.trim().split(/\s+/)[0] || ''
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  background: #70c5e7;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 0 10px 0 16px;
  background-color: #70c5e7;
  transition: all 0.2s;
}

.sidebar-logo.collapsed {
  justify-content: center;
  padding: 0;
}

.logo-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar-logo h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: normal;
  color: #fff;
}

/* User info area: John Doe + collapse/expand icon (row 2) */
.sidebar-user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 8px 16px;
  background-color: #70c5e7;
  transition: all 0.2s;
}

.sidebar-user-info.collapsed {
  justify-content: center;
  padding: 8px 8px;
}

.user-name {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  text-align: left;
}

.trigger-button {
  color: #fff !important;
  border: none !important;
  box-shadow: none !important;
  padding: 4px 8px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
  min-width: 32px;
  height: 32px;
}

.trigger-button:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

.trigger-button :deep(.anticon) {
  font-size: 16px;
  color: #fff;
}

/* Actions area: tenant_name (left) + key_icon + logout_icon (right) (row 3) */
.sidebar-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 8px 16px;
  background-color: #70c5e7;
  transition: all 0.2s;
}

.sidebar-actions.collapsed {
  justify-content: center;
  padding: 8px 8px;
  flex-direction: column;
  gap: 8px;
}

.tenant-name {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  text-align: left;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.sidebar-actions.collapsed .action-buttons {
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  color: #fff !important;
  border: none !important;
  box-shadow: none !important;
  padding: 4px 8px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  min-width: 32px;
  height: 32px;
}

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

.action-btn :deep(.anticon) {
  font-size: 16px;
  color: #fff;
}

/* Divider before menu */
.sidebar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0;
  border: none;
}
</style>

