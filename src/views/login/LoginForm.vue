<template>
  <AForm
    :model="formData"
    :rules="formRules"
    ref="formRef"
    @finish="handleLogin"
    layout="vertical"
    class="login-form"
  >
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

/**
 * Detect account type: 'email' | 'phone' | 'userAccount'
 * - Email: contains '@'
 * - Phone: only digits (may contain spaces/dashes)
 * - UserAccount: everything else
 */
function detectAccountType(account: string): 'email' | 'phone' | 'userAccount' {
  const trimmed = account.trim()
  if (trimmed.includes('@')) {
    return 'email'
  }
  // Check if it's a phone number (only digits, spaces, dashes, parentheses, plus)
  const phonePattern = /^[\d\s\-\(\)\+]+$/
  if (phonePattern.test(trimmed) && trimmed.replace(/\D/g, '').length >= 7) {
    return 'phone'
  }
  return 'userAccount'
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
  const accountTrimmed = account.trim()
  const passwordTrimmed = password.trim()
  
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
  if (!passwordTrimmed || passwordTrimmed.length < 4) {
    console.log('%c[LoginForm] Password is empty or too short, skipping search', 'color: #ff4d4f; font-weight: bold', {
      passwordLength: passwordTrimmed.length,
      minimum: 4,
    })
    matchedInstitutions.value = []
    formData.tenant_id = undefined
    formData.tenant_name = undefined
    return
  }

  if (passwordTrimmed.length > 100) {
    console.log('%c[LoginForm] Password too long, skipping search', 'color: #ff4d4f; font-weight: bold', {
      passwordLength: passwordTrimmed.length,
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
    
    const institutions = await searchInstitutionsApi(accountTrimmed, passwordTrimmed, userType)
    
    console.log('%c[LoginForm] Organizes found', 'color: #52c41a; font-weight: bold', {
      count: institutions.length,
      institutions: institutions.map(i => i.name),
    })
    
    matchedInstitutions.value = institutions

    // Detect account type
    const accountType = detectAccountType(accountTrimmed)

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
        formData.tenant_name = institutions[0].name
      }
      accountError.value = ''
      requiresManualInstitutionInput.value = false
    } else {
      // Multiple institutions found - this is a successful search, clear any errors
      accountError.value = '' // Clear error message - multiple matches is normal
      
      if (accountType === 'userAccount') {
        // For UserAccount: require manual input, don't show list
        requiresManualInstitutionInput.value = true
        formData.tenant_id = undefined
        formData.tenant_name = undefined
        institutionInputError.value = 'Please enter the organize name'
      } else {
        // For Email/Phone: show list for selection (existing behavior)
        requiresManualInstitutionInput.value = false
        institutionOptions.value = institutions.map((inst) => ({
          label: inst.name,
          value: inst.id,
        }))
        formData.tenant_id = undefined // Clear selection, force user to choose
        formData.tenant_name = undefined
      }
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
  const password = formData.password?.trim()
  
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
  const password = formData.password?.trim()
  
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

// Handle account blur - trigger search if both account and password are entered
const handleAccountBlur = () => {
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

// Select institution from matched list
const selectInstitution = (institution: Institution) => {
  formData.tenant_id = institution.id // Store ID for API (e.g., "tenant-001")
  formData.tenant_name = institution.name // Store name for display (e.g., "Sunset")
}

/**
 * Match institutions by prefix (case-insensitive)
 * Returns array of matching institutions
 */
function matchInstitutionsByPrefix(input: string): Institution[] {
  if (!input || !input.trim()) {
    return []
  }
  const prefix = input.trim().toLowerCase()
  return matchedInstitutions.value.filter((inst) =>
    inst.name.toLowerCase().startsWith(prefix)
  )
}

/**
 * Handle institution input - real-time matching and auto-fill
 * When only 1 institution matches, auto-fill and select
 * When multiple match, wait for more input (no dropdown)
 */
const handleInstitutionInput = () => {
  institutionInputError.value = ''
  
  if (!requiresManualInstitutionInput.value) {
    return
  }
  
  const input = formData.tenant_name || ''
  const matches = matchInstitutionsByPrefix(input)
  
  if (matches.length === 0) {
    // No match - clear selection, wait for more input
    formData.tenant_id = undefined
  } else if (matches.length === 1) {
    // Single match - auto-fill full name and select
    const matched = matches[0]
    if (matched) {
      formData.tenant_name = matched.name
      formData.tenant_id = matched.id
      institutionInputError.value = ''
      console.log('%c[LoginForm] Auto-filled organize', 'color: #52c41a; font-weight: bold', {
        input,
        matched: matched.name,
      })
    }
  } else {
    // Multiple matches - clear selection, wait for more input to distinguish
    formData.tenant_id = undefined
    console.log('%c[LoginForm] Multiple organizes match', 'color: #fa8c16; font-weight: bold', {
      input,
      matches: matches.map(m => m.name),
      message: 'Continue typing to distinguish',
    })
  }
}

/**
 * Handle institution blur - validate input
 * If input doesn't match any institution or matches multiple, show error
 */
const handleInstitutionBlur = () => {
  if (!requiresManualInstitutionInput.value) {
    return
  }
  
  const input = formData.tenant_name || ''
  const matches = matchInstitutionsByPrefix(input)
  
  if (!input.trim()) {
    institutionInputError.value = 'Please enter organize name'
    formData.tenant_id = undefined
  } else if (matches.length === 0) {
    // No match - show error
    institutionInputError.value = 'Organize name not found'
    formData.tenant_id = undefined
  } else if (matches.length === 1) {
    // Single match - ensure it's selected
    const matched = matches[0]
    if (matched) {
      formData.tenant_name = matched.name
      formData.tenant_id = matched.id
      institutionInputError.value = ''
    }
  } else {
    // Multiple matches - need more input
    institutionInputError.value = 'Please enter more characters to distinguish the organize'
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
    // - Institution search uses trimmed account/password.
    // - If user copies password from a modal, it may include trailing spaces/newlines.
    //   That would make institution search succeed (trimmed), but login fail (untrimmed).
    const accountTrimmed = (formData.account || '').trim()
    const passwordTrimmed = (formData.password || '').trim()

    // Submit tenant_id (not name) to backend
    const result = await userStore.login({
      account: accountTrimmed,
      password: passwordTrimmed,
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


.forgot-password {
  float: right;
  padding: 0;
}

.login-button {
  margin-top: 8px;
}

</style>

