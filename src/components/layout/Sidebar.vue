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
        <a-button v-if="!collapsed" type="text" class="action-btn" @click="handlePasswordChange" title="Account Setting">
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

    <!-- Account Settings Modal (in-app, authenticated) -->
    <a-modal
      v-model:visible="passwordModalVisible"
      title="Account Settings"
      width="550px"
      @ok="submitAccountSettings"
      @cancel="closePasswordModal"
    >
      <template #footer>
        <div style="padding: 10px 16px">
          <a-button key="back" @click="closePasswordModal" style="margin-right: 30px">Cancel</a-button>
          <a-button key="submit" type="primary" @click="submitAccountSettings" :loading="changingPassword" style="margin-right: 20px">
            Update
          </a-button>
        </div>
      </template>
      <a-form
        layout="horizontal"
        :model="accountSettingsData"
        ref="sidebarPasswordFormRef"
        :labelCol="{ span: 6 }"
        :wrapperCol="{ span: 18 }"
        style="padding: 20px"
      >
        <!-- Basic Information Display -->
        <div style="margin-bottom: 16px;">
          <div style="margin-bottom: 8px;">
            <span style="margin-right: 16px;"><strong>NickName:</strong> {{ accountInfo.nickname || '-' }}</span>
            <span><strong>Account:</strong> {{ accountInfo.account || '-' }}</span>
          </div>
          <div style="margin-bottom: 8px;">
            <span v-if="accountInfo.branch" style="margin-right: 16px;"><strong>Branch:</strong> {{ accountInfo.branch }}</span>
            <span v-if="accountInfo.floor" style="margin-right: 16px;"><strong>Floor:</strong> {{ accountInfo.floor }}</span>
            <span v-if="accountInfo.unit && accountInfo.unit !== '-'" style="margin-right: 16px;"><strong>Unit:</strong> {{ accountInfo.unit }}</span>
            <span v-if="accountInfo.room && accountInfo.room !== '-'"><strong>Room:</strong> {{ accountInfo.room }}</span>
          </div>
        </div>

        <!-- Password Section -->
        <div style="margin-bottom: 16px;">
          <div style="margin-bottom: 8px;">
            <a-space align="center">
              <strong>Passwd:</strong>
              <a-input-password 
                placeholder="Please enter new password" 
                v-model:value="sidebarPassword"
                @input="handleSidebarPasswordInput"
                @blur="handleSidebarPasswordBlur"
                :status="sidebarPasswordErrorMessage ? 'error' : ''"
                style="width: 200px"
              />
              <a-input-password 
                placeholder="Please confirm new password" 
                v-model:value="sidebarPasswordConfirm"
                @input="handleSidebarPasswordConfirmInput"
                @blur="handleSidebarPasswordConfirmBlur"
                :status="sidebarPasswordErrorMessage ? 'error' : ''"
                style="width: 200px"
              />
            </a-space>
          </div>
          <div style="margin-bottom: 8px; text-align: right;">
            <a-button type="primary" @click="generateSidebarPassword" size="small">
              Generate PW
            </a-button>
          </div>
          <span v-if="sidebarPasswordErrorMessage" style="color: #ff4d4f; font-size: 12px; display: block; margin-top: 4px;">
            {{ sidebarPasswordErrorMessage }}
          </span>
        </div>

        <!-- Email Section -->
        <div style="margin-bottom: 16px;">
          <a-space>
            <strong>Email:</strong>
            <a-input
              v-model:value="sidebarEmail"
              placeholder="Enter email"
              @blur="handleEmailBlur"
              style="width: 200px"
            />
            <a-checkbox
              v-model:checked="saveEmail"
              :disabled="isStaffUser || !isValidEmailFormat(sidebarEmail)"
            >
              Save
            </a-checkbox>
          </a-space>
        </div>

        <!-- Phone Section -->
        <div style="margin-bottom: 16px;">
          <a-space>
            <strong>Phone:</strong>
            <a-input
              v-model:value="sidebarPhone"
              placeholder="Enter phone"
              @blur="handlePhoneBlur"
              style="width: 200px"
            />
            <a-checkbox
              v-model:checked="savePhone"
              :disabled="isStaffUser || !isValidPhoneFormat(sidebarPhone)"
            >
              Save
            </a-checkbox>
          </a-space>
        </div>

        <!-- HIPAA Hint for Resident/Contact -->
        <div v-if="!isStaffUser" style="font-size: 12px; color: #999; margin-top: 8px; margin-bottom: 8px;">
          Email/Phone is used to reset password. Don't save by default. If save, please check [Save].
        </div>
      </a-form>
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
import { resetPasswordApi, getUserApi, updateUserApi } from '@/api/admin/user/user'
import { resetResidentPasswordApi, resetContactPasswordApi, getResidentApi, updateResidentPHIApi, updateResidentContactApi } from '@/api/resident/resident'
import { getAccountSettingsApi, updateAccountSettingsApi } from '@/api/account/accountSettings'
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

const handlePasswordChange = async () => {
  // In-app change password (for logged-in user)
  passwordModalVisible.value = true
  // Load account info when modal opens
  await loadAccountInfo()
}

const passwordModalVisible = ref(false)
const changingPassword = ref(false)

// Account info state
const accountInfo = ref<{
  nickname: string
  account: string
  branch: string
  floor: string
  unit: string
  room: string
}>({
  nickname: '',
  account: '',
  branch: '',
  floor: '',
  unit: '',
  room: '',
})

// Email/Phone state
const sidebarEmail = ref('')
const sidebarPhone = ref('')
const saveEmail = ref(true)
const savePhone = ref(true)

// Original values (loaded from API) - used to detect changes
const originalEmail = ref('')
const originalPhone = ref('')
const originalSaveEmail = ref(true)
const originalSavePhone = ref(true)

// Check if current user is staff
const isStaffUser = computed(() => userInfo.value?.userType === 'staff')

// Password state for sidebar password change (independent implementation)
const sidebarPassword = ref('')
const sidebarPasswordConfirm = ref('')
const sidebarPasswordErrorMessage = ref('')
const sidebarPasswordFormRef = ref()

// Form data for account settings
const accountSettingsData = computed(() => ({
  new_password: sidebarPassword.value,
  confirm_password: sidebarPasswordConfirm.value,
  email: sidebarEmail.value,
  phone: sidebarPhone.value,
  save_email: saveEmail.value,
  save_phone: savePhone.value,
}))

// Load account information
const loadAccountInfo = async () => {
  const uid = userInfo.value?.userId
  if (!uid) return

  try {
    // Use unified GetAccountSettings API (automatically routes based on role)
    const accountSettings = await getAccountSettingsApi(uid)
    accountInfo.value = {
      nickname: accountSettings.nickname || '-',
      account: accountSettings.account || '-',
      branch: '', // Branch info not in account settings, would need separate query
      floor: '',
      unit: '-',
      room: '-',
    }
    // Email/Phone 显示逻辑：Contact 和 Resident 一样（处理占位符）
    // 如果后端返回 email/phone 为空，说明是占位符（hash 存在但未保存）
    sidebarEmail.value = accountSettings.email || ''
    sidebarPhone.value = accountSettings.phone || ''
    
    // Save original values for change detection
    originalEmail.value = accountSettings.email || ''
    originalPhone.value = accountSettings.phone || ''
    
    // Initialize save flags based on role
    const staffRoles = ['Admin', 'Nurse', 'Caregiver', 'IT', 'Manager']
    const isStaff = accountSettings.role && staffRoles.includes(accountSettings.role)
    if (isStaff) {
      // Staff: always save (不可改)
      saveEmail.value = true
      savePhone.value = true
      originalSaveEmail.value = true
      originalSavePhone.value = true
    } else {
      // Resident 和 Contact: 使用 API 返回的 save 标志（处理占位符）
      saveEmail.value = accountSettings.save_email ?? false
      savePhone.value = accountSettings.save_phone ?? false
      originalSaveEmail.value = accountSettings.save_email ?? false
      originalSavePhone.value = accountSettings.save_phone ?? false
    }
  } catch (error: any) {
    console.error('Failed to load account info:', error)
    message.error('Failed to load account information')
    // If error, show basic info from userInfo
    accountInfo.value = {
      nickname: userInfo.value?.nickName || '-',
      account: userInfo.value?.user_account || '-',
      branch: '',
      floor: '',
      unit: '-',
      room: '-',
    }
    // No data: initialize to empty and don't save
    sidebarEmail.value = ''
    sidebarPhone.value = ''
    saveEmail.value = false
    savePhone.value = false
    // Set original values to empty as well (so no changes detected)
    originalEmail.value = ''
    originalPhone.value = ''
    originalSaveEmail.value = false
    originalSavePhone.value = false
  }
}

// Email/Phone validation and trim
const validateEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return true // Empty is valid
  // Skip validation for placeholder
  if (email === '***@***') return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

const validateUSPhoneNumber = (phone: string): boolean => {
  if (!phone || phone.trim() === '') return true // Empty is valid
  // Skip validation for placeholder
  if (phone === 'xxx-xxx-xxxx') return true
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')
  // Check if it's 10 digits
  if (digitsOnly.length !== 10) return false
  // Check area code and exchange code (first and fourth digits should be 2-9)
  const areaCode = parseInt(digitsOnly[0] || '0')
  const exchangeCode = parseInt(digitsOnly[3] || '0')
  return areaCode >= 2 && areaCode <= 9 && exchangeCode >= 2 && exchangeCode <= 9
}

// Synchronous email format validation (for disabled condition)
const isValidEmailFormat = (value: string | undefined): boolean => {
  if (!value || value.trim() === '') {
    return false // Empty is not valid for save checkbox
  }
  // Skip validation for placeholder
  if (value === '***@***') {
    return false // Placeholder is not valid for save checkbox
  }
  const trimmedValue = value.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(trimmedValue)
}

// Synchronous phone format validation (for disabled condition)
const isValidPhoneFormat = (value: string | undefined): boolean => {
  if (!value || value.trim() === '') {
    return false // Empty is not valid for save checkbox
  }
  // Skip validation for placeholder
  if (value === 'xxx-xxx-xxxx') {
    return false // Placeholder is not valid for save checkbox
  }
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '')
  // Check if it's exactly 10 digits
  if (digitsOnly.length !== 10) {
    return false
  }
  // Check area code: first digit must be 2-9
  const areaCode = parseInt(digitsOnly[0] || '0')
  // Check exchange code (fourth digit): must be 2-9
  const exchangeCode = parseInt(digitsOnly[3] || '0')
  return areaCode >= 2 && areaCode <= 9 && exchangeCode >= 2 && exchangeCode <= 9
}

const handleEmailBlur = () => {
  sidebarEmail.value = sidebarEmail.value.trim()
  if (sidebarEmail.value && !validateEmail(sidebarEmail.value)) {
    message.error('Invalid email format')
  }
  // Update save checkbox state
  if (!sidebarEmail.value || sidebarEmail.value === '') {
    saveEmail.value = false
  }
}

const handlePhoneBlur = () => {
  sidebarPhone.value = sidebarPhone.value.trim()
  if (sidebarPhone.value && !validateUSPhoneNumber(sidebarPhone.value)) {
    message.error('Invalid phone number format (US format required)')
  }
  // Update save checkbox state
  if (!sidebarPhone.value || sidebarPhone.value === '') {
    savePhone.value = false
  }
}

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
  // Clear all fields
  sidebarPassword.value = ''
  sidebarPasswordConfirm.value = ''
  sidebarPasswordErrorMessage.value = ''
  sidebarEmail.value = ''
  sidebarPhone.value = ''
  saveEmail.value = true
  savePhone.value = true
  sidebarPasswordFormRef.value?.resetFields()
}

const submitAccountSettings = async () => {
  const uid = userInfo.value?.userId
  if (!uid) {
    message.error('User is not loaded')
    return
  }

  const userRole = userInfo.value?.role

  // Validate password if provided
  if (sidebarPassword.value && sidebarPasswordConfirm.value) {
    if (!isSidebarPasswordValid.value) {
      message.error(sidebarPasswordErrorMessage.value || 'Please check password requirements')
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
  }
  
  const { hashAccount, hashPassword } = await import('@/utils/crypto')
  const updateParams: any = {}
  
  // Password: only add password_hash if user entered a new password
  // Password field is always empty in UI (for security), so if user enters something, it's a new password
  if (sidebarPassword.value && sidebarPasswordConfirm.value) {
    const passwordHash = await hashPassword(sidebarPassword.value)
    updateParams.password_hash = passwordHash
  }
  
  // Email/Phone 提交逻辑：Contact 和 Resident 一样
  const isStaff = userRole && ['Admin', 'Nurse', 'Caregiver', 'IT', 'Manager'].includes(userRole)
  const isContact = userRole === 'Family'
  
  // Email 处理
  const currentEmail = sidebarEmail.value.trim()
  const currentEmailNormalized = currentEmail.toLowerCase()
  const originalEmailNormalized = (originalEmail.value || '').toLowerCase()
  const emailChanged = currentEmailNormalized !== originalEmailNormalized
  
  // 检查 email 是否合规（占位符和空值都是不合规的）
  const isEmailValid = isValidEmailFormat(sidebarEmail.value)
  const isOriginalEmailValid = originalEmail.value && originalEmail.value !== '***@***' && isValidEmailFormat(originalEmail.value)
  
  if (emailChanged) {
    // Email 改变了
    if (isEmailValid) {
      // 输入有效：发送 hash
      updateParams.email_hash = hashAccount(currentEmailNormalized)
      
      // 再进一步判断 save 标志
      if (isStaff) {
        // Staff: 总是保存（后端自动处理）
        updateParams.email = currentEmail
      } else {
        // Resident/Contact: 根据 save 标志决定（save 复选框只有在输入合规时才可选）
        if (saveEmail.value) {
          // Save=true: 同步发送 save=true 的 email，并发送标志位
          updateParams.email = currentEmail
          updateParams.save_email = true
        } else {
          // Save=false: 发送空字符串表示删除, save=false
          updateParams.email = ''
          updateParams.save_email = false
        }
      }
    } else {
      // 输入不合规（包括占位符、空值、格式错误）：不发送任何更新
      // 如果原始值是占位符（空值），且用户没有输入有效值，不应该发送任何更新
      // 只有在原始值有效，用户清空或输入不合规时，才发送 nil 来删除
      if (isOriginalEmailValid) {
        // 原始值有效，用户清空或输入不合规：发送空字符串来删除
        updateParams.email = ''
        updateParams.email_hash = ''
        if (!isStaff) {
          updateParams.save_email = false
        }
      }
      // 如果原始值就是占位符（空值），且用户没有输入有效值，不发送任何更新（不处理）
    }
  } else {
    // Email 未改变，但 save 标志可能改变了（仅 Resident/Contact，且当前值必须合规）
    if (!isStaff && isEmailValid && saveEmail.value !== originalSaveEmail.value) {
      // Save 标志改变了，且当前值合规，需要更新
      if (saveEmail.value) {
        // 如果 save 从 false 改为 true：发送 email 和 hash（保存明文）
        updateParams.email = currentEmail
        updateParams.email_hash = hashAccount(currentEmailNormalized)
        updateParams.save_email = true
      } else {
        // 如果 save 从 true 改为 false：删除明文，但保留 hash（hash 用于登录，不应该删除）
        // 不发送 email_hash，保留现有的 hash
        updateParams.email = ''
        updateParams.save_email = false
      }
    }
  }
  
  // Phone 处理（逻辑与 Email 相同）
  const currentPhone = sidebarPhone.value.trim().replace(/\D/g, '')
  const originalPhoneNormalized = (originalPhone.value || '').replace(/\D/g, '')
  const phoneChanged = currentPhone !== originalPhoneNormalized
  
  // 检查 phone 是否合规（占位符和空值都是不合规的）
  const isPhoneValid = isValidPhoneFormat(sidebarPhone.value)
  const isOriginalPhoneValid = originalPhone.value && originalPhone.value !== 'xxx-xxx-xxxx' && isValidPhoneFormat(originalPhone.value)
  
  if (phoneChanged) {
    // Phone 改变了
    if (isPhoneValid) {
      // 输入有效：发送 hash
      updateParams.phone_hash = hashAccount(currentPhone)
      
      // 再进一步判断 save 标志
      if (isStaff) {
        // Staff: 总是保存（后端自动处理）
        updateParams.phone = sidebarPhone.value.trim()
      } else {
        // Resident/Contact: 根据 save 标志决定（save 复选框只有在输入合规时才可选）
        if (savePhone.value) {
          // Save=true: 同步发送 save=true 的 phone，并发送标志位
          updateParams.phone = sidebarPhone.value.trim()
          updateParams.save_phone = true
        } else {
          // Save=false: 发送空字符串表示删除, save=false
          updateParams.phone = ''
          updateParams.save_phone = false
        }
      }
    } else {
      // 输入不合规（包括占位符、空值、格式错误）：不发送任何更新
      // 如果原始值是占位符（空值），且用户没有输入有效值，不应该发送任何更新
      // 只有在原始值有效，用户清空或输入不合规时，才发送 nil 来删除
      if (isOriginalPhoneValid) {
        // 原始值有效，用户清空或输入不合规：发送空字符串来删除
        updateParams.phone = ''
        updateParams.phone_hash = ''
        if (!isStaff) {
          updateParams.save_phone = false
        }
      }
      // 如果原始值就是占位符（空值），且用户没有输入有效值，不发送任何更新（不处理）
    }
  } else {
    // Phone 未改变，但 save 标志可能改变了（仅 Resident/Contact，且当前值必须合规）
    if (!isStaff && isPhoneValid && savePhone.value !== originalSavePhone.value) {
      // Save 标志改变了，且当前值合规，需要更新
      if (savePhone.value) {
        // 如果 save 从 false 改为 true：发送 phone 和 hash（保存明文）
        updateParams.phone = sidebarPhone.value.trim()
        updateParams.phone_hash = hashAccount(currentPhone)
        updateParams.save_phone = true
      } else {
        // 如果 save 从 true 改为 false：删除明文，但保留 hash（hash 用于登录，不应该删除）
        // 不发送 phone_hash，保留现有的 hash
        updateParams.phone = ''
        updateParams.save_phone = false
      }
    }
  }
  
  // Use unified API (handles password, email, phone in one transaction, automatically routes based on role)
  if (Object.keys(updateParams).length === 0) {
    message.warning('No changes to save')
    return
  }

  changingPassword.value = true
  try {
    const result = await updateAccountSettingsApi(uid, updateParams)
    
    // Verify that the operation actually succeeded
    if (result && result.success === true) {
      message.success('Account settings updated')
      // Reload account info to show updated values immediately
      await loadAccountInfo()
      closePasswordModal()
    } else {
      message.error(result?.message || 'Failed to update account settings')
    }
  } catch (e: any) {
    // Extract error message from response if available
    const errorMsg = e?.response?.data?.message || e?.message || 'Failed to update account settings'
    message.error(errorMsg)
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

