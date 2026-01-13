<template>
  <AForm
    :model="formData"
    :rules="formRules"
    ref="formRef"
    @finish="handleLogin"
    layout="vertical"
    class="login-form"
  >
    <!-- Mock Quick Login Buttons -->
    <div class="mock-quick-login" v-if="showMockButtons">
      <div class="mock-title">🎯 Quick Login (Mock Demo)</div>
      <div class="mock-subtitle">👇 Click to auto-fill credentials</div>
      <div class="mock-buttons" v-if="formData.userType === 'staff'">
        <div class="mock-group-title">🔴 System Level</div>
        <Button size="small" @click="fillMockAccount('sysadmin')">🔐 SysAdmin</Button>
        <Button size="small" @click="fillMockAccount('sysoperator')">⚙️ SysOperator</Button>
        
        <div class="mock-group-title">🟡 Management Level</div>
        <Button size="small" @click="fillMockAccount('admin')">👨‍💼 Admin</Button>
        <Button size="small" @click="fillMockAccount('doctor1')">👨‍⚕️ Manager</Button>
        
        <div class="mock-group-title">🟢 Support Level</div>
        <Button size="small" @click="fillMockAccount('it1')">💻 IT</Button>
        
        <div class="mock-group-title">🔵 Execution Level</div>
        <Button size="small" @click="fillMockAccount('nurse1')">👩‍⚕️ Nurse</Button>
        <Button size="small" @click="fillMockAccount('caregiver1')">🤝 Caregiver</Button>
      </div>
      <div class="mock-buttons" v-else>
        <Button size="small" @click="fillMockAccount('resident1')">👵 Resident</Button>
        <Button size="small" @click="fillMockAccount('family1')">👨‍👩‍👧 Family</Button>
      </div>
    </div>

    <!-- User Type Selection (without label, with logo icon) -->
    <AFormItem name="userType" class="user-type-item">
      <div class="user-type-with-logo">
        <img src="@/assets/images/logo-icon.png" alt="Wisefido OWL" class="logo-icon-inline" />
        <ARadioGroup v-model:value="formData.userType" button-style="solid" class="user-type-group">
          <ARadioButton value="staff">Staff</ARadioButton>
          <ARadioButton value="resident">Resident</ARadioButton>
        </ARadioGroup>
      </div>
    </AFormItem>

    <!-- UserAccount, Email, or Phone -->
    <AFormItem
      label="UserAccount, Email, or Phone"
      name="account"
      :validate-status="accountError ? 'error' : institutionLoading ? 'validating' : ''"
      :help="accountError"
    >
      <AInput
        v-model:value="formData.account"
        placeholder="Enter your credentials"
        size="large"
        @input="handleAccountInput"
        @blur="handleAccountBlur"
        :loading="institutionLoading"
      />
    </AFormItem>

    <!-- Password -->
    <AFormItem label="Password" name="password">
      <AInputPassword
        v-model:value="formData.password"
        placeholder="Enter your password"
        size="large"
        autocomplete="current-password"
        @input="handlePasswordInput"
        @blur="handlePasswordBlur"
      />
    </AFormItem>

    <!-- Organize -->
    <AFormItem
      label="Organize"
      name="institution"
      :validate-status="institutionInputError ? 'error' : ''"
      :help="institutionInputError"
    >
      <!-- For UserAccount with multiple institutions: editable input with auto-complete -->
      <!-- For Email/Phone with multiple institutions: show selection list -->
      <!-- For single institution: readonly auto-filled -->
      <AInput
        v-model:value="formData.tenant_name"
        :placeholder="requiresManualInstitutionInput ? 'Please input Organize name' : 'Leave empty for auto-detection'"
        size="large"
        :readonly="!requiresManualInstitutionInput"
        :disabled="matchedInstitutions.length === 0 && !requiresManualInstitutionInput"
        @input="handleInstitutionInput"
        @blur="handleInstitutionBlur"
      />
      <!-- Display matched institutions if multiple found (only for Email/Phone) -->
      <div v-if="matchedInstitutions.length > 1 && !requiresManualInstitutionInput" class="matched-institutions">
        <div class="matched-title">Multiple organizes found. Please select one:</div>
        <div class="matched-list">
          <div
            v-for="inst in matchedInstitutions"
            :key="inst.id"
            @click="selectInstitution(inst)"
            class="institution-item"
            :class="{ 'selected': formData.tenant_id === inst.id }"
          >
            {{ inst.name }}
          </div>
        </div>
      </div>
    </AFormItem>

    <!-- Remember me -->
    <AFormItem>
      <ACheckbox v-model:checked="formData.rememberMe">Remember me</ACheckbox>
      <Button type="link" class="forgot-password" @click="handleForgotPassword">Forgot password?</Button>
    </AFormItem>

    <!-- Submit Button -->
    <AFormItem>
      <Button
        type="primary"
        html-type="submit"
        size="large"
        block
        :loading="loading"
        class="login-button"
      >
        Sign In
      </Button>
    </AFormItem>

  </AForm>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Form, Input, Button, Radio, Checkbox, Select, message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { searchInstitutionsApi } from '@/api/auth/auth'
import { useUserStore } from '@/store/modules/user'
import type { Institution } from '@/api/auth/model/authModel'
import { debounce } from 'lodash-es'
import { setCookie, getCookie, deleteCookie } from '@/utils/cookie'
import { mockAccounts } from '@/mock/mockData'

const router = useRouter()

const AForm = Form
const AFormItem = Form.Item
const AInput = Input
const AInputPassword = Input.Password
const ARadioGroup = Radio.Group
const ARadioButton = Radio.Button
const ASelect = Select
const ASelectOption = Select.Option
const ACheckbox = Checkbox

// Show Mock Quick Login Buttons (Development Mode)
const showMockButtons = ref(true)

// Mock Account Auto-Fill Function
const fillMockAccount = (accountType: string) => {
  const account = mockAccounts.find(acc => acc.username === accountType)
  if (account) {
    formData.account = account.username
    formData.password = account.password
    formData.tenant_name = 'Mapleview Care Community'
    formData.tenant_id = 'mapleview-001'
    message.success(`Filled with ${account.fullName}'s login credentials`)
  }
}

// Form data
const formData = reactive({
  userType: 'staff' as 'staff' | 'resident',
  account: '',
  password: '',
  // Institution: Store both ID (for API) and Name (for display)
  tenant_id: undefined as string | undefined, // For API submission (e.g., "tenant-001")
  tenant_name: undefined as string | undefined, // For user display (e.g., "Sunset")
  rememberMe: false,
})

// Form ref
const formRef = ref()

// Loading state
const loading = ref(false)

// Institution options
const institutionOptions = ref<Array<{ label: string; value: string }>>([])
const institutionLoading = ref(false)
const matchedInstitutions = ref<Institution[]>([])
const accountError = ref('')

// Track if user needs to manually input institution name (for UserAccount with multiple institutions)
const requiresManualInstitutionInput = ref(false)
const institutionInputError = ref('')

// Form rules
// Note: Frontend only checks for length range (based on DB constraints)
// Detailed security validation (password strength, etc.) is handled by backend/DB
// DB constraints: user_account VARCHAR(100), resident_account VARCHAR(100), password_hash BYTEA
// Validation rules: 1 <= account length <= 100, 4 <= password length <= 100
const formRules: Record<string, Rule[]> = {
  account: [
    { required: true, message: 'Please enter your user account, email, or phone', trigger: 'blur' },
    { min: 1, message: 'Account must be at least 1 character', trigger: 'blur' },
    { max: 100, message: 'Account must not exceed 100 characters', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' },
    { min: 4, message: 'Password must be at least 4 characters', trigger: 'blur' },
    { max: 100, message: 'Password must not exceed 100 characters', trigger: 'blur' },
  ],
  userType: [
    { required: true, message: 'Please select user type', trigger: 'change' },
  ],
  institution: [
    {
      validator: (_rule: any, _value: any) => {
        // Validate tenant_id (not tenant_name)
        if (requiresManualInstitutionInput.value) {
          // For UserAccount with multiple institutions: must have valid institution
          if (!formData.tenant_id) {
            return Promise.reject('Please enter a valid organize name')
          }
        } else if (matchedInstitutions.value.length > 1 && !formData.tenant_id) {
          // For Email/Phone with multiple institutions: must select one
          return Promise.reject('Please select an organize')
        }
        return Promise.resolve()
      },
      trigger: 'change',
    },
  ],
}

// Note: Rate limiting is handled by backend, not frontend
// Frontend only does basic input validation (1 <= account length <= 100, 4 <= password length <= 100)

// Debounced search function (500ms delay)
// Note: Requires both account and password to distinguish accounts with same username
// Example: S2 and S3 both use username "S2" but different passwords (Ts123@123 vs Ts123@121)
const debouncedSearchInstitutions = debounce(async (account: string, password: string, userType: 'staff' | 'resident') => {
  console.log('%c[LoginForm] debouncedSearchInstitutions called', 'color: #fa8c16; font-weight: bold', {
    account,
    passwordLength: password.length,
    userType,
  })
  
  // Frontend basic validation: Check length range (based on DB constraints)
  // DB constraints: user_account VARCHAR(100), resident_account VARCHAR(100)
  // Validation rules: 1 <= account length <= 100, 4 <= password length <= 100
  // Note: Detailed security validation is handled by backend/DB
  // IMPORTANT: Account is trimmed for normalization, but password is NOT trimmed
  // Password hash should only depend on password itself (no trim, no modification)
  const accountTrimmed = account.trim()
  const passwordOriginal = password // Use original password (no trim)
  
  if (!accountTrimmed || accountTrimmed.length < 1) {
    console.log('%c[LoginForm] Account is empty or too short, skipping search', 'color: #ff4d4f; font-weight: bold', {
      accountLength: accountTrimmed.length,
      minimum: 1,
    })
    matchedInstitutions.value = []
    formData.tenant_id = undefined
    formData.tenant_name = undefined
    return
  }

  if (accountTrimmed.length > 100) {
    console.log('%c[LoginForm] Account too long, skipping search', 'color: #ff4d4f; font-weight: bold', {
      accountLength: accountTrimmed.length,
      maximum: 100,
    })
    matchedInstitutions.value = []
    formData.tenant_id = undefined
    formData.tenant_name = undefined
    return
  }

  // Frontend basic validation: Check length range
  // Note: Detailed password strength validation is handled by backend/DB
  // Password is NOT trimmed - use original password for validation
  if (!passwordOriginal || passwordOriginal.length < 4) {
    console.log('%c[LoginForm] Password is empty or too short, skipping search', 'color: #ff4d4f; font-weight: bold', {
      passwordLength: passwordOriginal.length,
      minimum: 4,
    })
    matchedInstitutions.value = []
    formData.tenant_id = undefined
    formData.tenant_name = undefined
    return
  }

  if (passwordOriginal.length > 100) {
    console.log('%c[LoginForm] Password too long, skipping search', 'color: #ff4d4f; font-weight: bold', {
      passwordLength: passwordOriginal.length,
      maximum: 100,
    })
    matchedInstitutions.value = []
    formData.tenant_id = undefined
    formData.tenant_name = undefined
    return
  }

  // Note: Rate limiting is handled by backend
  // Frontend only does basic input validation

  try {
    institutionLoading.value = true
    accountError.value = ''
    
    console.log('%c[LoginForm] Searching organizes', 'color: #1890ff; font-weight: bold', {
      account: account.trim(),
      password: '***',
      userType,
    })
    
    const institutions = await searchInstitutionsApi(accountTrimmed, passwordOriginal, userType)
    
    console.log('%c[LoginForm] Organizes found', 'color: #52c41a; font-weight: bold', {
      count: institutions.length,
      institutions: institutions.map(i => i.name),
    })
    
    matchedInstitutions.value = institutions

    if (institutions.length === 0) {
      // Security: Don't reveal if account exists or not
      // Just show a generic message
      accountError.value = ''
      formData.tenant_id = undefined
      formData.tenant_name = undefined
      requiresManualInstitutionInput.value = false
    } else if (institutions.length === 1 && institutions[0]) {
      // Auto-fill if only one institution found (user can still modify)
      if (!formData.tenant_id) {
        // Only auto-fill if user hasn't manually entered a value
        formData.tenant_id = institutions[0].id
        // Auto-fill tenant_name if available (backend returns name for matched institutions)
        formData.tenant_name = institutions[0].name || undefined
      }
      accountError.value = ''
      requiresManualInstitutionInput.value = false
    } else {
      // Multiple institutions found - show selection list (clickable divs)
      // Backend returns name for matched institutions (already verified by password)
      accountError.value = '' // Clear error message - multiple matches is normal
      requiresManualInstitutionInput.value = false
      formData.tenant_id = undefined
      formData.tenant_name = undefined
    }
  } catch (error: any) {
    console.error('Failed to search organizes:', error)
    
    // Handle rate limiting errors from backend (429 Too Many Requests)
    if (error?.response?.status === 429) {
      accountError.value = 'Too many requests. Please wait a moment and try again.'
    } else {
      // Security: Don't reveal specific error details
      accountError.value = 'Unable to search organizes. Please try again.'
    }
    
    matchedInstitutions.value = []
    formData.tenant_id = undefined
    formData.tenant_name = undefined
    requiresManualInstitutionInput.value = false
    institutionInputError.value = ''
  } finally {
    institutionLoading.value = false
  }
}, 500)

// Handle account or password input change - search for institutions
// Note: Both account and password are required to search institutions
const handleAccountInput = () => {
  accountError.value = ''
  const account = formData.account?.trim()
  const password = formData.password // Password is NOT trimmed
  
  console.log('%c[LoginForm] Account input triggered', 'color: #722ed1; font-weight: bold', {
    account,
    passwordLength: password?.length || 0,
    hasBoth: !!(account && password),
  })
  
  if (account && password) {
    console.log('%c[LoginForm] Calling debouncedSearchInstitutions', 'color: #1890ff; font-weight: bold')
    debouncedSearchInstitutions(account, password, formData.userType)
  } else {
    matchedInstitutions.value = []
    formData.tenant_id = undefined
    formData.tenant_name = undefined
    requiresManualInstitutionInput.value = false
    institutionInputError.value = ''
  }
}

// Handle password input change - search for institutions
const handlePasswordInput = () => {
  accountError.value = ''
  const account = formData.account?.trim()
  const password = formData.password // Password is NOT trimmed
  
  console.log('%c[LoginForm] Password input triggered', 'color: #722ed1; font-weight: bold', {
    account,
    passwordLength: password?.length || 0,
    hasBoth: !!(account && password),
  })
  
  if (account && password) {
    console.log('%c[LoginForm] Calling debouncedSearchInstitutions', 'color: #1890ff; font-weight: bold')
    debouncedSearchInstitutions(account, password, formData.userType)
  } else {
    matchedInstitutions.value = []
    formData.tenant_id = undefined
    formData.tenant_name = undefined
    requiresManualInstitutionInput.value = false
    institutionInputError.value = ''
  }
}

// Handle account blur - trim account and trigger search if both account and password are entered
const handleAccountBlur = () => {
  // Trim account to remove leading/trailing spaces and update display
  if (formData.account) {
    formData.account = formData.account.trim()
  }
  
  if (formData.account && formData.password && matchedInstitutions.value.length === 0) {
    debouncedSearchInstitutions(formData.account, formData.password, formData.userType)
  }
}

// Handle password blur - trigger search if both account and password are entered
const handlePasswordBlur = () => {
  if (formData.account && formData.password && matchedInstitutions.value.length === 0) {
    debouncedSearchInstitutions(formData.account, formData.password, formData.userType)
  }
}

// Watch userType change - re-search if both account and password are entered
watch(
  () => formData.userType,
  () => {
    if (formData.account && formData.password) {
      matchedInstitutions.value = []
      formData.tenant_id = undefined
      formData.tenant_name = undefined
      requiresManualInstitutionInput.value = false
      institutionInputError.value = ''
      debouncedSearchInstitutions(formData.account, formData.password, formData.userType)
    }
  },
)

// Select institution from matched list (for clickable divs)
const selectInstitution = (institution: Institution) => {
  formData.tenant_id = institution.id // Store ID for API (e.g., "tenant-001")
  formData.tenant_name = institution.name // Store name for display (e.g., "Sunset")
  institutionInputError.value = ''
}

/**
 * Match institutions by tenant_name or tenant_id
 * Backend returns name for matched institutions (already verified by password)
 */
function matchInstitutions(input: string): Institution[] {
  if (!input || !input.trim()) {
    return []
  }
  const trimmed = input.trim().toLowerCase()
  // Match by tenant_name (preferred, user-friendly) or tenant_id (UUID format)
  return matchedInstitutions.value.filter((inst) => {
    if (inst.name && inst.name.toLowerCase().includes(trimmed)) {
      return true
    }
    if (inst.id.toLowerCase() === trimmed) {
      return true
    }
    return false
  })
}

/**
 * Handle institution input - match by tenant_name or tenant_id (for UserAccount only)
 * Backend returns name for matched institutions (already verified by password)
 * This implements prefix matching for UserAccount security mechanism
 */
const handleInstitutionInput = () => {
  institutionInputError.value = ''
  
  // Only apply prefix matching for UserAccount with multiple institutions
  if (!requiresManualInstitutionInput.value) {
    return
  }
  
  // User can input tenant_name (for display) or tenant_id (UUID)
  const input = formData.tenant_name || ''
  const matches = matchInstitutions(input)
  
  if (matches.length === 0) {
    // No match - clear selection, wait for more input
    formData.tenant_id = undefined
  } else if (matches.length === 1) {
    // Single match - select this institution automatically
    const matched = matches[0]
    if (matched) {
      formData.tenant_id = matched.id
      formData.tenant_name = matched.name || undefined
      institutionInputError.value = ''
    }
  } else {
    // Multiple matches - wait for more specific input (don't show dropdown)
    formData.tenant_id = undefined
  }
}

/**
 * Handle institution blur - validate tenant_name or tenant_id (for UserAccount only)
 * Backend returns name for matched institutions (already verified by password)
 * This implements validation for UserAccount prefix matching
 */
const handleInstitutionBlur = () => {
  // Only validate for UserAccount with multiple institutions
  if (!requiresManualInstitutionInput.value) {
    return
  }
  
  // User can input tenant_name (for display) or tenant_id (UUID)
  const input = formData.tenant_name || ''
  const matches = matchInstitutions(input)
  
  if (!input.trim()) {
    institutionInputError.value = 'Please enter organize name or ID'
    formData.tenant_id = undefined
  } else if (matches.length === 0) {
    // No match - show error
    institutionInputError.value = 'Organize name or ID not found'
    formData.tenant_id = undefined
  } else if (matches.length === 1) {
    // Single match - ensure it's selected
    const matched = matches[0]
    if (matched) {
      formData.tenant_id = matched.id
      formData.tenant_name = matched.name || undefined
      institutionInputError.value = ''
    }
  } else {
    // Multiple matches - show error (user needs to be more specific)
    institutionInputError.value = 'Multiple matches found, please be more specific'
    formData.tenant_id = undefined
  }
}

// Handle forgot password navigation
const handleForgotPassword = () => {
  router.push('/forgot-password')
}

// Get user store
const userStore = useUserStore()

// Handle login
const handleLogin = async () => {
  try {
    loading.value = true
    await formRef.value?.validate()

    // IMPORTANT:
    // - Account is trimmed for normalization (account_hash = SHA256(lower(trim(account))))
    // - Password is NOT trimmed - password hash should only depend on password itself
    //   Backend: password_hash = SHA256(password) - no trim, no modification
    const accountTrimmed = (formData.account || '').trim()
    const password = formData.password || ''

    // Submit tenant_id (not name) to backend
    const result = await userStore.login({
      account: accountTrimmed,
      password: password, // Use original password (no trim)
      userType: formData.userType,
      tenant_id: formData.tenant_id || undefined, // Send ID to backend (e.g., "tenant-001")
    })

    if (result) {
      message.success('Login successful!')
      
      // Save to cookie if "Remember me" is checked
      if (formData.rememberMe) {
        setCookie('rememberMe', 'true', 30)
        setCookie('savedAccount', formData.account, 30)
        setCookie('savedUserType', formData.userType, 30)
        if (formData.tenant_id) {
          setCookie('savedTenantId', formData.tenant_id, 30)
        }
        if (formData.tenant_name) {
          setCookie('savedTenantName', formData.tenant_name, 30)
        }
      } else {
        // Clear cookies if "Remember me" is unchecked
        deleteCookie('rememberMe')
        deleteCookie('savedAccount')
        deleteCookie('savedUserType')
        deleteCookie('savedTenantId')
        deleteCookie('savedTenantName')
      }
      
      // Navigate to dashboard using store's afterLoginAction
      await userStore.afterLoginAction(true)
    }
  } catch (error: any) {
    if (error?.errorFields) {
      // Form validation error
      return
    }
    message.error(error?.message || 'Login failed. Please check your credentials.')
  } finally {
    loading.value = false
  }
}

// Load saved data from cookies on mount
onMounted(() => {
  const rememberMe = getCookie('rememberMe')
  if (rememberMe === 'true') {
    formData.rememberMe = true
    const savedAccount = getCookie('savedAccount')
    const savedUserType = getCookie('savedUserType')
    const savedTenantId = getCookie('savedTenantId')
    const savedTenantName = getCookie('savedTenantName')
    
    if (savedAccount) {
      formData.account = savedAccount
    }
    if (savedUserType === 'staff' || savedUserType === 'resident') {
      formData.userType = savedUserType
    }
    if (savedTenantId) {
      formData.tenant_id = savedTenantId
    }
    if (savedTenantName) {
      formData.tenant_name = savedTenantName
    }
    
          // Trigger institution search if both account and password are saved
          if (savedAccount && savedAccount.trim() && formData.password && formData.password.trim()) {
            debouncedSearchInstitutions(savedAccount, formData.password, formData.userType)
          }
  }
})
</script>

<style scoped>
.login-form {
  width: 100%;
}

.user-type-item {
  margin-bottom: 14.4px; /* 24px * 0.6 = 14.4px */
}

.user-type-with-logo {
  display: flex;
  align-items: center;
  gap: 9px; /* 12px * 0.75 = 9px */
}

.logo-icon-inline {
  width: 60px; /* 80px * 0.75 = 60px */
  height: 60px; /* 80px * 0.75 = 60px */
  object-fit: contain;
  flex-shrink: 0;
}

.user-type-group {
  width: 100%;
  display: flex;
}

.user-type-group :deep(.ant-radio-button-wrapper) {
  flex: 1;
  text-align: center;
}

.matched-institutions {
  margin-top: 12px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.matched-title {
  font-size: 12px;
  color: #718096;
  margin-bottom: 8px;
  font-weight: 500;
}

.matched-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.institution-item {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.institution-item:hover {
  border-color: #667eea;
  background: #f7fafc;
}

.institution-item:active {
  background: #edf2f7;
}

.institution-item.selected {
  border-color: #1890ff;
  background: #e6f7ff;
}

.institution-address {
  display: block;
  font-size: 12px;
  color: #718096;
  margin-top: 4px;
}

.mock-quick-login {
  margin-bottom: 20px;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.mock-title {
  color: white;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
  text-align: center;
}

.mock-subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
  font-weight: 400;
  margin-bottom: 10px;
  text-align: center;
  animation: subtitleBounce 1.5s ease-in-out infinite;
}

@keyframes subtitleBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.mock-buttons {
  display: flex;
  gap: 8px;
  justify-content: space-around;
  flex-wrap: wrap;
}

.mock-group-title {
  width: 100%;
  color: rgba(255, 255, 255, 0.9);
  font-size: 11px;
  font-weight: 600;
  margin-top: 8px;
  margin-bottom: 4px;
  padding-left: 4px;
  border-left: 3px solid rgba(255, 255, 255, 0.6);
}

.mock-group-title:first-child {
  margin-top: 0;
}

.mock-buttons button {
  flex: 0 1 auto;
  background: white;
  border: none;
  color: #667eea;
  font-weight: 600;
  transition: all 0.3s;
}

.mock-buttons button:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.forgot-password {
  float: right;
  padding: 0;
}

.login-button {
  margin-top: 8px;
}

</style>

