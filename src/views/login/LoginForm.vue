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
        <img src="/logo-icon.png" alt="Wisefido OWL" class="logo-icon-inline" />
        <ARadioGroup v-model:value="formData.userType" button-style="solid" class="user-type-group">
          <ARadioButton value="staff">Staff</ARadioButton>
          <ARadioButton value="resident">Resident</ARadioButton>
        </ARadioGroup>
      </div>
    </AFormItem>

    <!-- Username, Email, or Phone -->
    <AFormItem
      label="Username, Email, or Phone"
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

    <!-- Institution -->
    <AFormItem
      label="Institution"
      name="institution"
    >
      <!-- Display institution name to user (not ID) -->
      <AInput
        v-model:value="formData.institutionName"
        placeholder="Leave empty for auto-detection"
        size="large"
        readonly
        :disabled="matchedInstitutions.length === 0"
      />
      <!-- Display matched institutions if multiple found -->
      <div v-if="matchedInstitutions.length > 1" class="matched-institutions">
        <div class="matched-title">Multiple institutions found. Please select one:</div>
        <div class="matched-list">
          <div
            v-for="inst in matchedInstitutions"
            :key="inst.id"
            @click="selectInstitution(inst)"
            class="institution-item"
            :class="{ 'selected': formData.institutionId === inst.id }"
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
import { loginApi, searchInstitutionsApi } from '@/api/auth/auth'
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

// Form data
const formData = reactive({
  userType: 'staff' as 'staff' | 'resident',
  account: '',
  password: '',
  // Institution: Store both ID (for API) and Name (for display)
  institutionId: undefined as string | undefined, // For API submission (e.g., "tenant-001")
  institutionName: undefined as string | undefined, // For user display (e.g., "Sunset")
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

// Form rules
// Note: Frontend only checks for non-empty and max length (based on DB constraints)
// Detailed security validation (password strength, etc.) is handled by backend/DB
// DB constraints: username VARCHAR(255), email VARCHAR(255), phone VARCHAR(50), password typically 8-128 chars
const formRules: Record<string, Rule[]> = {
  account: [
    { required: true, message: 'Please enter your username, email, or phone', trigger: 'blur' },
    { max: 255, message: 'Account must not exceed 255 characters', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' },
    { max: 128, message: 'Password must not exceed 128 characters', trigger: 'blur' },
  ],
  userType: [
    { required: true, message: 'Please select user type', trigger: 'change' },
  ],
  institution: [
    {
      validator: (_rule: any, _value: any) => {
        // Validate institutionId (not institutionName)
        if (matchedInstitutions.value.length > 1 && !formData.institutionId) {
          return Promise.reject('Please select an institution')
        }
        return Promise.resolve()
      },
      trigger: 'change',
    },
  ],
}

// Note: Rate limiting is handled by backend, not frontend
// Frontend only does basic input validation (account length >= 2, password length >= 4)

// Debounced search function (500ms delay)
// Note: Requires both account and password to distinguish accounts with same username
// Example: S2 and S3 both use username "S2" but different passwords (Ts123@123 vs Ts123@121)
const debouncedSearchInstitutions = debounce(async (account: string, password: string, userType: 'staff' | 'resident') => {
  console.log('%c[LoginForm] debouncedSearchInstitutions called', 'color: #fa8c16; font-weight: bold', {
    account,
    passwordLength: password.length,
    userType,
  })
  
  // Frontend basic validation: Check non-empty and max length (based on DB constraints)
  // DB constraints: username VARCHAR(255), email VARCHAR(255), phone VARCHAR(50)
  // Note: Detailed security validation is handled by backend/DB
  if (!account || !account.trim()) {
    console.log('%c[LoginForm] Account is empty, skipping search', 'color: #ff4d4f; font-weight: bold')
    matchedInstitutions.value = []
    formData.institutionId = undefined
    formData.institutionName = undefined
    return
  }

  if (account.trim().length > 255) {
    console.log('%c[LoginForm] Account too long, skipping search', 'color: #ff4d4f; font-weight: bold', {
      accountLength: account.trim().length,
      maximum: 255,
    })
    matchedInstitutions.value = []
    formData.institutionId = undefined
    formData.institutionName = undefined
    return
  }

  // Frontend basic validation: Check non-empty and max length
  // Note: Detailed password strength validation is handled by backend/DB
  if (!password || !password.trim()) {
    console.log('%c[LoginForm] Password is empty, skipping search', 'color: #ff4d4f; font-weight: bold')
    matchedInstitutions.value = []
    formData.institutionId = undefined
    formData.institutionName = undefined
    return
  }

  if (password.trim().length > 128) {
    console.log('%c[LoginForm] Password too long, skipping search', 'color: #ff4d4f; font-weight: bold', {
      passwordLength: password.trim().length,
      maximum: 128,
    })
    matchedInstitutions.value = []
    formData.institutionId = undefined
    formData.institutionName = undefined
    return
  }

  // Note: Rate limiting is handled by backend
  // Frontend only does basic input validation

  try {
    institutionLoading.value = true
    accountError.value = ''
    
    console.log('%c[LoginForm] Searching institutions', 'color: #1890ff; font-weight: bold', {
      account: account.trim(),
      password: '***',
      userType,
    })
    
    const institutions = await searchInstitutionsApi(account.trim(), password.trim(), userType)
    
    console.log('%c[LoginForm] Institutions found', 'color: #52c41a; font-weight: bold', {
      count: institutions.length,
      institutions: institutions.map(i => i.name),
    })
    
    matchedInstitutions.value = institutions

    if (institutions.length === 0) {
      // Security: Don't reveal if account exists or not
      // Just show a generic message
      accountError.value = ''
      formData.institutionId = undefined
      formData.institutionName = undefined
    } else if (institutions.length === 1 && institutions[0]) {
      // Auto-fill if only one institution found (user can still modify)
      if (!formData.institutionId) {
        // Only auto-fill if user hasn't manually entered a value
        formData.institutionId = institutions[0].id
        formData.institutionName = institutions[0].name
      }
      accountError.value = ''
    } else {
      // Multiple institutions found - user must select
      institutionOptions.value = institutions.map((inst) => ({
        label: inst.name,
        value: inst.id,
      }))
      formData.institutionId = undefined // Clear selection, force user to choose
      formData.institutionName = undefined
      accountError.value = ''
    }
  } catch (error: any) {
    console.error('Failed to search institutions:', error)
    
    // Handle rate limiting errors from backend (429 Too Many Requests)
    if (error?.response?.status === 429) {
      accountError.value = 'Too many requests. Please wait a moment and try again.'
    } else {
      // Security: Don't reveal specific error details
      accountError.value = 'Unable to search institutions. Please try again.'
    }
    
    matchedInstitutions.value = []
    formData.institutionId = undefined
    formData.institutionName = undefined
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
    formData.institutionId = undefined
    formData.institutionName = undefined
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
    formData.institutionId = undefined
    formData.institutionName = undefined
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
      formData.institutionId = undefined
      formData.institutionName = undefined
      debouncedSearchInstitutions(formData.account, formData.password, formData.userType)
    }
  },
)

// Select institution from matched list
const selectInstitution = (institution: Institution) => {
  formData.institutionId = institution.id // Store ID for API (e.g., "tenant-001")
  formData.institutionName = institution.name // Store name for display (e.g., "Sunset")
}

// Handle forgot password navigation
const handleForgotPassword = () => {
  router.push('/forgot-password')
}

// Handle login
const handleLogin = async () => {
  try {
    loading.value = true
    await formRef.value?.validate()

    // Submit institutionId (not name) to backend
    const result = await loginApi({
      account: formData.account,
      password: formData.password,
      userType: formData.userType,
      institutionId: formData.institutionId || undefined, // Send ID to backend (e.g., "tenant-001")
    })

    if (result) {
      message.success('Login successful!')
      
      // Save to cookie if "Remember me" is checked
      if (formData.rememberMe) {
        setCookie('rememberMe', 'true', 30)
        setCookie('savedAccount', formData.account, 30)
        setCookie('savedUserType', formData.userType, 30)
        if (formData.institutionId) {
          setCookie('savedInstitutionId', formData.institutionId, 30)
        }
        if (formData.institutionName) {
          setCookie('savedInstitutionName', formData.institutionName, 30)
        }
      } else {
        // Clear cookies if "Remember me" is unchecked
        deleteCookie('rememberMe')
        deleteCookie('savedAccount')
        deleteCookie('savedUserType')
        deleteCookie('savedInstitutionId')
        deleteCookie('savedInstitutionName')
      }
      
      // TODO: Navigate to dashboard
      // router.push('/dashboard')
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
    const savedInstitutionId = getCookie('savedInstitutionId')
    const savedInstitutionName = getCookie('savedInstitutionName')
    
    if (savedAccount) {
      formData.account = savedAccount
    }
    if (savedUserType === 'staff' || savedUserType === 'resident') {
      formData.userType = savedUserType
    }
    if (savedInstitutionId) {
      formData.institutionId = savedInstitutionId
    }
    if (savedInstitutionName) {
      formData.institutionName = savedInstitutionName
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

