<template>
  <div class="forgot-password-container">
    <div class="forgot-password-wrapper">
      <!-- 左侧：输入区域 -->
      <div class="forgot-password-left">
        <div class="forgot-password-content">
          <div class="forgot-password-header">
            <h1 class="title">
              Reset Password
              <img src="/logo-icon.png" alt="Wisefido OWL" class="logo-icon" />
            </h1>
            <p class="subtitle">Enter your information to reset your password</p>
          </div>

          <!-- Step 1: Institution and Account -->
          <AForm
            v-if="currentStep === 1"
            :model="step1Form"
            :rules="step1Rules"
            ref="step1FormRef"
            layout="vertical"
            class="forgot-password-form"
          >
            <!-- User Type Selection -->
            <AFormItem label="User Type" name="userType" class="user-type-item">
              <ARadioGroup v-model:value="step1Form.userType" button-style="solid" class="user-type-group">
                <ARadioButton value="staff">Staff</ARadioButton>
                <ARadioButton value="resident">Resident</ARadioButton>
              </ARadioGroup>
            </AFormItem>

            <!-- Institution Name (REQUIRED) -->
            <AFormItem
              label="Institution Name"
              name="institutionName"
              :help="'Required to prevent duplicate accounts across institutions'"
            >
              <AInput
                v-model:value="step1Form.institutionName"
                placeholder="Enter your institution name (e.g., Sunset Care Center)"
                size="large"
                @blur="handleInstitutionBlur"
              />
            </AFormItem>

            <!-- Admin Email Display (if available) -->
            <div v-if="adminEmail" class="admin-email-display">
              <p class="admin-email-label">Administrator Email:</p>
              <p class="admin-email-value">{{ adminEmail }}</p>
            </div>

            <!-- Phone or Email -->
            <AFormItem
              label="Phone or Email"
              name="account"
              :validate-status="accountError ? 'error' : sendingCode ? 'validating' : ''"
              :help="accountError"
            >
              <AInput
                v-model:value="step1Form.account"
                placeholder="Enter your phone number or email"
                size="large"
                @blur="handleAccountBlur"
                :loading="sendingCode"
              />
            </AFormItem>

            <!-- Submit Button -->
            <AFormItem>
              <Button
                type="primary"
                size="large"
                block
                :loading="sendingCode"
                :disabled="!step1Form.institutionName || !step1Form.account"
                @click="handleSendCode"
                class="submit-button"
              >
                Send Verification Code
              </Button>
            </AFormItem>

            <!-- Back to Login -->
            <div class="back-to-login">
              <Button type="link" @click="router.push('/login')">Back to Login</Button>
            </div>
          </AForm>

          <!-- Step 2: Verification Code -->
          <AForm
            v-if="currentStep === 2"
            :model="step2Form"
            :rules="step2Rules"
            ref="step2FormRef"
            layout="vertical"
            class="forgot-password-form"
          >
            <div class="step-info">
              <p class="info-text">
                Verification code has been sent to <strong>{{ step1Form.account }}</strong>
              </p>
            </div>

            <!-- Verification Code -->
            <AFormItem
              label="Verification Code (6 digits)"
              name="code"
              :validate-status="codeError ? 'error' : verifyingCode ? 'validating' : ''"
              :help="codeError"
            >
              <AInput
                v-model:value="step2Form.code"
                placeholder="Enter 6-digit code"
                size="large"
                :maxlength="6"
                @input="handleCodeInput"
                :loading="verifyingCode"
              />
            </AFormItem>

            <!-- Submit Button -->
            <AFormItem>
              <Button
                type="primary"
                size="large"
                block
                :loading="verifyingCode"
                :disabled="step2Form.code.length !== 6"
                @click="handleVerifyCode"
                class="submit-button"
              >
                Verify Code
              </Button>
            </AFormItem>

            <!-- Resend Code -->
            <div class="resend-code">
              <Button type="link" @click="handleResendCode" :loading="sendingCode">
                Resend Code
              </Button>
            </div>

            <!-- Back -->
            <div class="back-to-login">
              <Button type="link" @click="currentStep = 1">Back</Button>
            </div>
          </AForm>

          <!-- Step 3: New Password -->
          <AForm
            v-if="currentStep === 3"
            :model="step3Form"
            :rules="step3Rules"
            ref="step3FormRef"
            layout="vertical"
            class="forgot-password-form"
          >
            <div class="step-info">
              <p class="info-text">Verification successful. Please enter your new password.</p>
            </div>

            <!-- New Password -->
            <AFormItem
              label="New Password"
              name="newPassword"
              :help="passwordHelp"
            >
              <AInputPassword
                v-model:value="step3Form.newPassword"
                placeholder="Enter new password"
                size="large"
                @input="handlePasswordInput"
              />
            </AFormItem>

            <!-- Confirm Password -->
            <AFormItem
              label="Confirm New Password"
              name="confirmPassword"
              :validate-status="passwordMatchError ? 'error' : ''"
              :help="passwordMatchError"
            >
              <AInputPassword
                v-model:value="step3Form.confirmPassword"
                placeholder="Confirm new password"
                size="large"
                @input="handleConfirmPasswordInput"
              />
            </AFormItem>

            <!-- Submit Button -->
            <AFormItem>
              <Button
                type="primary"
                size="large"
                block
                :loading="resettingPassword"
                :disabled="!isPasswordValid || !isPasswordMatch"
                @click="handleResetPassword"
                class="submit-button"
              >
                Reset Password
              </Button>
            </AFormItem>

            <!-- Back -->
            <div class="back-to-login">
              <Button type="link" @click="currentStep = 2">Back</Button>
            </div>
          </AForm>

          <!-- Success Message -->
          <div v-if="currentStep === 4" class="success-message">
            <div class="success-icon">✓</div>
            <h2>Password Reset Successful!</h2>
            <p>Your password has been reset. You can now log in with your new password.</p>
            <Button type="primary" size="large" @click="router.push('/login')" class="go-to-login-button">
              Go to Login
            </Button>
          </div>
        </div>
      </div>

      <!-- 右侧：展示区域 -->
      <div class="forgot-password-right">
        <div class="display-content">
          <div class="display-slogan">
            <h2 class="slogan-line1">Your Space. Simply Yours.</h2>
            <h2 class="slogan-line2">Seamlessly Safe.</h2>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Form, Input, Button, Radio, message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import {
  sendVerificationCodeApi,
  verifyCodeApi,
  resetPasswordApi,
} from '@/api/auth/auth'
import { debounce } from 'lodash-es'

const AForm = Form
const AFormItem = Form.Item
const AInput = Input
const AInputPassword = Input.Password
const ARadioGroup = Radio.Group
const ARadioButton = Radio.Button

const router = useRouter()

// Current step: 1 = Institution/Account, 2 = Verification Code, 3 = New Password, 4 = Success
const currentStep = ref(1)

// Step 1: Institution and Account
const step1Form = reactive({
  userType: 'staff' as 'staff' | 'resident',
  institutionName: '',
  account: '',
})

const step1FormRef = ref()
const sendingCode = ref(false)
const accountError = ref('')
const adminEmail = ref<string | undefined>()

// Step 2: Verification Code
const step2Form = reactive({
  code: '',
})

const step2FormRef = ref()
const verifyingCode = ref(false)
const codeError = ref('')

// Step 3: New Password
const step3Form = reactive({
  newPassword: '',
  confirmPassword: '',
})

const step3FormRef = ref()
const resettingPassword = ref(false)
const passwordMatchError = ref('')

// Form Rules
const step1Rules: Record<string, Rule[]> = {
  userType: [
    { required: true, message: 'Please select user type', trigger: 'change' },
  ],
  institutionName: [
    { required: true, message: 'Please enter institution name', trigger: 'blur' },
    { min: 2, message: 'Institution name must be at least 2 characters', trigger: 'blur' },
  ],
  account: [
    { required: true, message: 'Please enter your phone number or email', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => {
        if (!value) return Promise.resolve()
        // Basic validation: email or phone
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        const isPhone = /^[\d\s\-\(\)]+$/.test(value.replace(/\s/g, ''))
        if (!isEmail && !isPhone) {
          return Promise.reject('Please enter a valid email or phone number')
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
}

const step2Rules: Record<string, Rule[]> = {
  code: [
    { required: true, message: 'Please enter verification code', trigger: 'blur' },
    { len: 6, message: 'Verification code must be 6 digits', trigger: 'blur' },
    {
      pattern: /^\d+$/,
      message: 'Verification code must contain only numbers',
      trigger: 'blur',
    },
  ],
}

// Password validation rules (based on DB requirements)
// Note: Frontend does basic validation, backend will validate according to DB requirements
const step3Rules: Record<string, Rule[]> = {
  newPassword: [
    { required: true, message: 'Please enter new password', trigger: 'blur' },
    { min: 8, message: 'Password must be at least 8 characters', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => {
        if (!value) return Promise.resolve()
        // Basic password strength check (backend will do detailed validation)
        const hasUpperCase = /[A-Z]/.test(value)
        const hasLowerCase = /[a-z]/.test(value)
        const hasNumber = /\d/.test(value)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
          return Promise.reject(
            'Password must contain uppercase, lowercase, number, and special character',
          )
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => {
        if (!value) return Promise.resolve()
        if (value !== step3Form.newPassword) {
          return Promise.reject('Passwords do not match')
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
}

// Computed properties
const isPasswordValid = computed(() => {
  const pwd = step3Form.newPassword
  if (!pwd || pwd.length < 8) return false
  const hasUpperCase = /[A-Z]/.test(pwd)
  const hasLowerCase = /[a-z]/.test(pwd)
  const hasNumber = /\d/.test(pwd)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
})

const isPasswordMatch = computed(() => {
  return (
    step3Form.newPassword &&
    step3Form.confirmPassword &&
    step3Form.newPassword === step3Form.confirmPassword
  )
})

const passwordHelp = computed(() => {
  if (!step3Form.newPassword) {
    return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  }
  if (!isPasswordValid.value) {
    return 'Password must contain uppercase, lowercase, number, and special character'
  }
  return ''
})

// Handlers
const handleInstitutionBlur = () => {
  // When institution name is entered, fetch admin email (if available)
  if (step1Form.institutionName) {
    // This will be handled by backend when sending verification code
    // For now, we'll get it from the API response
  }
}

// Debounced send code function
const debouncedSendCode = debounce(async () => {
  if (!step1Form.institutionName || !step1Form.account) {
    return
  }

  try {
    sendingCode.value = true
    accountError.value = ''

    const result = await sendVerificationCodeApi({
      account: step1Form.account.trim(),
      userType: step1Form.userType,
      institutionName: step1Form.institutionName.trim(),
    })

    if (result.success) {
      // Display admin email if available
      if (result.adminEmail) {
        adminEmail.value = result.adminEmail
      }
      message.success('Verification code sent successfully!')
      currentStep.value = 2
    }
  } catch (error: any) {
    console.error('Failed to send verification code:', error)
    accountError.value = error?.message || 'Failed to send verification code. Please try again.'
  } finally {
    sendingCode.value = false
  }
}, 300)

const handleAccountBlur = () => {
  if (step1Form.institutionName && step1Form.account) {
    debouncedSendCode()
  }
}

const handleSendCode = async () => {
  try {
    await step1FormRef.value?.validate()
    await debouncedSendCode()
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

const handleCodeInput = () => {
  codeError.value = ''
  // Auto-verify when 6 digits are entered
  if (step2Form.code.length === 6) {
    handleVerifyCode()
  }
}

const handleVerifyCode = async () => {
  if (step2Form.code.length !== 6) {
    codeError.value = 'Verification code must be 6 digits'
    return
  }

  try {
    verifyingCode.value = true
    codeError.value = ''

    const result = await verifyCodeApi({
      account: step1Form.account.trim(),
      code: step2Form.code.trim(),
      userType: step1Form.userType,
      institutionName: step1Form.institutionName.trim(),
    })

    if (result.success) {
      message.success('Verification code verified!')
      currentStep.value = 3
    }
  } catch (error: any) {
    console.error('Failed to verify code:', error)
    codeError.value = error?.message || 'Invalid verification code. Please try again.'
  } finally {
    verifyingCode.value = false
  }
}

const handleResendCode = async () => {
  try {
    sendingCode.value = true
    accountError.value = ''

    const result = await sendVerificationCodeApi({
      account: step1Form.account.trim(),
      userType: step1Form.userType,
      institutionName: step1Form.institutionName.trim(),
    })

    if (result.success) {
      message.success('Verification code resent!')
    }
  } catch (error: any) {
    console.error('Failed to resend code:', error)
    accountError.value = error?.message || 'Failed to resend verification code. Please try again.'
  } finally {
    sendingCode.value = false
  }
}

const handlePasswordInput = () => {
  passwordMatchError.value = ''
}

const handleConfirmPasswordInput = () => {
  if (step3Form.confirmPassword && step3Form.confirmPassword !== step3Form.newPassword) {
    passwordMatchError.value = 'Passwords do not match'
  } else {
    passwordMatchError.value = ''
  }
}

const handleResetPassword = async () => {
  try {
    await step3FormRef.value?.validate()

    if (!isPasswordValid.value) {
      message.error('Password does not meet requirements')
      return
    }

    if (!isPasswordMatch.value) {
      passwordMatchError.value = 'Passwords do not match'
      return
    }

    resettingPassword.value = true

    const result = await resetPasswordApi({
      account: step1Form.account.trim(),
      code: step2Form.code.trim(),
      newPassword: step3Form.newPassword,
      userType: step1Form.userType,
      institutionName: step1Form.institutionName.trim(),
    })

    if (result.success) {
      message.success('Password reset successfully!')
      currentStep.value = 4
    }
  } catch (error: any) {
    console.error('Failed to reset password:', error)
    message.error(error?.message || 'Failed to reset password. Please try again.')
  } finally {
    resettingPassword.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Aptos+Display:wght@400;600;700&display=swap');

.forgot-password-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px; /* 20px * 0.75 = 15px */
}

.forgot-password-wrapper {
  width: 100%;
  max-width: 900px; /* 1200px * 0.75 = 900px */
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: white;
  border-radius: 9px; /* 12px * 0.75 = 9px */
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 左侧：输入区域 */
.forgot-password-left {
  padding: 36px 37.5px; /* 高度缩小到60%: 60px * 0.6 = 36px, 宽度缩小到75%: 50px * 0.75 = 37.5px */
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.forgot-password-content {
  width: 100%;
  max-width: 300px; /* 400px * 0.75 = 300px */
}

.forgot-password-header {
  text-align: left;
  margin-bottom: 24px; /* 40px * 0.6 = 24px (标题上下间距缩小到60%) */
}

.title {
  font-size: 24px; /* 32px * 0.75 = 24px */
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 7.2px 0; /* 12px * 0.6 = 7.2px (标题下方间距缩小到60%) */
  display: flex;
  align-items: center;
  gap: 9px; /* 12px * 0.75 = 9px */
}

.logo-icon {
  width: 60px; /* 80px * 0.75 = 60px */
  height: 60px; /* 80px * 0.75 = 60px */
  object-fit: contain;
}

.subtitle {
  font-size: 12px; /* 16px * 0.75 = 12px */
  color: #718096;
  margin: 0;
}

.forgot-password-form {
  width: 100%;
}

.user-type-item {
  margin-bottom: 14.4px; /* 24px * 0.6 = 14.4px */
}

.user-type-group {
  width: 100%;
}

.admin-email-display {
  margin-bottom: 9.6px; /* 16px * 0.6 = 9.6px */
  padding: 7.2px; /* 12px * 0.6 = 7.2px */
  background: #f0f9ff;
  border-radius: 3px; /* 4px * 0.75 = 3px */
  border: 1px solid #bae6fd;
}

.admin-email-label {
  font-size: 9px; /* 12px * 0.75 = 9px */
  color: #64748b;
  margin: 0 0 2.4px 0; /* 4px * 0.6 = 2.4px */
}

.admin-email-value {
  font-size: 10.5px; /* 14px * 0.75 = 10.5px */
  color: #1e40af;
  font-weight: 500;
  margin: 0;
}

.step-info {
  margin-bottom: 14.4px; /* 24px * 0.6 = 14.4px */
  padding: 7.2px; /* 12px * 0.6 = 7.2px */
  background: #f0f9ff;
  border-radius: 3px; /* 4px * 0.75 = 3px */
}

.info-text {
  font-size: 10.5px; /* 14px * 0.75 = 10.5px */
  color: #1e40af;
  margin: 0;
}

.submit-button {
  margin-top: 4.8px; /* 8px * 0.6 = 4.8px */
}

.back-to-login,
.resend-code {
  text-align: center;
  margin-top: 9.6px; /* 16px * 0.6 = 9.6px */
}

.success-message {
  text-align: center;
  padding: 24px 15px; /* 40px * 0.6 = 24px, 20px * 0.75 = 15px */
}

.success-icon {
  width: 60px; /* 80px * 0.75 = 60px */
  height: 60px; /* 80px * 0.75 = 60px */
  margin: 0 auto 14.4px; /* 24px * 0.6 = 14.4px */
  background: #52c41a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px; /* 48px * 0.75 = 36px */
  font-weight: bold;
}

.success-message h2 {
  font-size: 18px; /* 24px * 0.75 = 18px */
  color: #1a202c;
  margin: 0 0 7.2px 0; /* 12px * 0.6 = 7.2px */
}

.success-message p {
  font-size: 12px; /* 16px * 0.75 = 12px */
  color: #718096;
  margin: 0 0 19.2px 0; /* 32px * 0.6 = 19.2px */
}

.go-to-login-button {
  width: 100%;
  max-width: 225px; /* 300px * 0.75 = 225px */
}

/* 右侧：展示区域 */
.forgot-password-right {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36px 37.5px; /* 高度缩小到60%: 60px * 0.6 = 36px, 宽度缩小到75%: 50px * 0.75 = 37.5px */
  position: relative;
  background-image: url('/login-bg.png');
  background-size: cover;
  background-position: center;
}

.display-content {
  width: 100%;
  max-width: 300px; /* 400px * 0.75 = 300px */
  text-align: center;
}

.display-slogan {
  text-align: center;
  z-index: 1;
}

.slogan-line1,
.slogan-line2 {
  font-family: 'Aptos Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 45px; /* 60px * 0.75 = 45px */
  font-weight: 400;
  color: #1a202c;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -1px;
}

.slogan-line1 {
  margin-bottom: 9.6px; /* 16px * 0.6 = 9.6px */
}

.slogan-line2 {
  font-weight: 600;
}

@media (max-width: 768px) {
  .forgot-password-wrapper {
    grid-template-columns: 1fr;
  }

  .forgot-password-right {
    display: none;
  }
}
</style>

