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

  const userType = userInfo.value?.userType
  const userRole = userInfo.value?.role

  try {
    if (userType === 'staff') {
      // For staff: get from users table
      const user = await getUserApi(uid)
      accountInfo.value = {
        nickname: user.nickname || '-',
        account: user.user_account || '-',
        branch: user.branch_tag || '',
        floor: '',
        unit: '-',
        room: '-',
      }
      sidebarEmail.value = user.email || ''
      sidebarPhone.value = user.phone || ''
      // For staff, save checkboxes are disabled and always true
      saveEmail.value = true
      savePhone.value = true
    } else {
      // For resident/contact: get from residents table
      // userId could be resident_id (for resident) or contact_id (for contact)
      // For Family users (contact), userId is contact_id
      // Backend GET /admin/api/v1/residents/:id now supports contact_id directly
      // It will automatically find the associated resident_id and return the resident details
      if (userType === 'resident' && userRole === 'Family') {
        // Family user: userId is contact_id, backend will handle the lookup
        try {
          // Backend now supports passing contact_id directly - it will find the associated resident_id
          const resident = await getResidentApi(uid, { include_phi: true, include_contacts: true })
          // Find the contact matching our contact_id
          const contact = resident.contacts?.find((c: any) => c.contact_id === uid)
          
          if (contact) {
            // This is a contact - show linked resident's info, but contact's email/phone
            accountInfo.value = {
              nickname: resident.nickname || '-',
              account: resident.resident_account || '-',
              branch: resident.branch_tag || '',
              floor: '', // Floor info not in resident data, would need to fetch from unit
              unit: resident.unit_name || '-',
              room: resident.room_name || '-',
            }
            // Get email/phone from contact
            sidebarEmail.value = contact.contact_email || ''
            sidebarPhone.value = contact.contact_phone || ''
            // Initialize save flags: if email/phone exists and is not placeholder, save flag is true
            // For HIPAA compliance: default to false (don't save) if email/phone is empty
            const emailValue = contact.contact_email && contact.contact_email.trim()
            saveEmail.value = !!(emailValue && emailValue !== '***@***' && emailValue !== '')
            const phoneValue = contact.contact_phone && contact.contact_phone.trim()
            savePhone.value = !!(phoneValue && phoneValue !== 'xxx-xxx-xxxx' && phoneValue !== '')
          } else {
            // Contact not found, show resident info only
            accountInfo.value = {
              nickname: resident.nickname || '-',
              account: resident.resident_account || '-',
              branch: resident.branch_tag || '',
              floor: '',
              unit: resident.unit_name || '-',
              room: resident.room_name || '-',
            }
            // No contact data: initialize to empty and don't save
            sidebarEmail.value = ''
            sidebarPhone.value = ''
            saveEmail.value = false
            savePhone.value = false
          }
        } catch (err: any) {
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
        }
      } else {
        // Resident user: userId is resident_id
        try {
          const resident = await getResidentApi(uid, { include_phi: true, include_contacts: true })
          // This is a resident - show resident's info and PHI email/phone
          accountInfo.value = {
            nickname: resident.nickname || '-',
            account: resident.resident_account || '-',
            branch: resident.branch_tag || '',
            floor: '', // Floor info not returned in resident API, would need separate query
            unit: resident.unit_name || '-',
            room: resident.room_name || '-',
          }
          // Get email/phone from PHI
          if (resident.phi) {
            // Keep placeholder if it exists (for display), otherwise use actual value or empty
            sidebarEmail.value = resident.phi.resident_email || ''
            sidebarPhone.value = resident.phi.resident_phone || ''
            // Initialize save flags: matches ResidentPHIContent.vue logic
            // If email/phone exists and is not placeholder, save flag is true
            // For HIPAA compliance: default to false (don't save) if email/phone is empty
            const emailValue = resident.phi.resident_email && resident.phi.resident_email.trim()
            saveEmail.value = !!(emailValue && emailValue !== '***@***' && emailValue !== '')
            const phoneValue = resident.phi.resident_phone && resident.phi.resident_phone.trim()
            savePhone.value = !!(phoneValue && phoneValue !== 'xxx-xxx-xxxx' && phoneValue !== '')
          } else {
            // No PHI data: initialize to empty and don't save
            sidebarEmail.value = ''
            sidebarPhone.value = ''
            saveEmail.value = false
            savePhone.value = false
          }
        } catch (err: any) {
          // If not found, show basic info from userInfo
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
        }
      }
    }
  } catch (error: any) {
    console.error('Failed to load account info:', error)
    message.error('Failed to load account information')
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

  const userType = userInfo.value?.userType
  const userRole = userInfo.value?.role
  const promises: Promise<any>[] = []

  // Update password if provided
  if (sidebarPassword.value && sidebarPasswordConfirm.value) {
    // Validate password
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

    // Use password as-is (no trim) - password hash should only depend on password itself
    const password = sidebarPassword.value
    // Check if this is a Family user (contact) - Family users have role === 'Family' and userType === 'resident'
    if (userType === 'resident' && userRole === 'Family') {
      // Family user: userId is contact_id, use contact password reset API
      promises.push(resetContactPasswordApi(uid, password))
    } else if (userType === 'resident') {
      // Resident user: userId could be either contact_id (for resident_contact) or resident_id (for resident)
      // Try contact first (most common case), then fall back to resident
      promises.push(
        resetContactPasswordApi(uid, password).catch((contactError: any) => {
          // If contact not found, try as resident_id
          if (contactError?.message?.includes('not found') || contactError?.message?.includes('contact') || contactError?.response?.status === 404) {
            return resetResidentPasswordApi(uid, password)
          }
          throw contactError
        })
      )
    } else {
      // This is a staff login - use user password reset API
      promises.push(resetPasswordApi(uid, { new_password: password }))
    }
  }

  // Update email/phone
  if (userType === 'staff') {
    // For staff: always save email/phone (no save checkbox, always true)
    const updateParams: any = {}
    if (sidebarEmail.value) {
      updateParams.email = sidebarEmail.value.trim()
    } else {
      updateParams.email = null
    }
    if (sidebarPhone.value) {
      updateParams.phone = sidebarPhone.value.trim()
    } else {
      updateParams.phone = null
    }
    if (Object.keys(updateParams).length > 0) {
      promises.push(updateUserApi(uid, updateParams))
    }
  } else {
    // For resident/contact: update PHI or contact based on save flags
    // Need to determine if this is a resident or contact
    try {
      // Try to get resident info to determine if userId is resident_id or contact_id
      const resident = await getResidentApi(uid, { include_phi: true, include_contacts: true })
      const residentId = resident.resident_id

      // Check if this is a contact by checking if userId matches any contact_id
      const contact = resident.contacts?.find(c => c.contact_id === uid)
      
      if (contact) {
        // This is a contact - update contact email/phone
        const { hashAccount } = await import('@/utils/crypto')
        const updateParams: any = {
          slot: contact.slot,
        }
        
        // Email handling
        if (sidebarEmail.value && sidebarEmail.value.trim()) {
          const emailHash = hashAccount(sidebarEmail.value.trim().toLowerCase())
          updateParams.email_hash = emailHash
          if (saveEmail.value) {
            updateParams.contact_email = sidebarEmail.value.trim()
          } else {
            updateParams.contact_email = null
          }
        } else {
          updateParams.contact_email = null
          // Don't update email_hash if email is cleared (keep existing hash)
        }

        // Phone handling
        if (sidebarPhone.value && sidebarPhone.value.trim()) {
          const phoneHash = hashAccount(sidebarPhone.value.trim().replace(/\D/g, ''))
          updateParams.phone_hash = phoneHash
          if (savePhone.value) {
            updateParams.contact_phone = sidebarPhone.value.trim()
          } else {
            updateParams.contact_phone = null
          }
        } else {
          updateParams.contact_phone = null
          // Don't update phone_hash if phone is cleared (keep existing hash)
        }

        promises.push(updateResidentContactApi(residentId, updateParams))
      } else {
        // This is a resident - update PHI email/phone
        const { hashAccount } = await import('@/utils/crypto')
        const updateParams: any = {}
        
        // Email handling
        if (sidebarEmail.value && sidebarEmail.value.trim()) {
          const emailHash = hashAccount(sidebarEmail.value.trim().toLowerCase())
          updateParams.email_hash = emailHash
          if (saveEmail.value) {
            updateParams.resident_email = sidebarEmail.value.trim()
          } else {
            updateParams.resident_email = null
          }
        } else {
          updateParams.resident_email = null
          // Don't update email_hash if email is cleared (keep existing hash)
        }

        // Phone handling
        if (sidebarPhone.value && sidebarPhone.value.trim()) {
          const phoneHash = hashAccount(sidebarPhone.value.trim().replace(/\D/g, ''))
          updateParams.phone_hash = phoneHash
          if (savePhone.value) {
            updateParams.resident_phone = sidebarPhone.value.trim()
          } else {
            updateParams.resident_phone = null
          }
        } else {
          updateParams.resident_phone = null
          // Don't update phone_hash if phone is cleared (keep existing hash)
        }

        if (Object.keys(updateParams).length > 0) {
          promises.push(updateResidentPHIApi(residentId, updateParams))
        }
      }
    } catch (err: any) {
      console.error('Failed to determine user type:', err)
      // If can't determine, skip email/phone update
    }
  }

  // Execute all updates
  if (promises.length > 0) {
    changingPassword.value = true
    try {
      await Promise.all(promises)
      message.success('Account settings updated')
      closePasswordModal()
    } catch (e: any) {
      message.error(e?.message || 'Failed to update account settings')
    } finally {
      changingPassword.value = false
    }
  } else {
    message.warning('No changes to save')
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

