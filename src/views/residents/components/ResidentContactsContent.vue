<template>
  <div class="contacts-content">
    <a-form layout="horizontal" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <!-- Header: Family login explanation -->
      <div style="margin-bottom: 16px; font-size: 14px; color: #666;">
        <div>Family contacts login using their own phone number or email address</div>
        <div style="margin-top: 4px;">
          Phone/Email is used to reset password. Don't save by default. If save, please check [Save].
        </div>
      </div>

      <!-- Contact Slots A, B, C, D -->
      <div v-for="slot in SLOTS" :key="slot" class="contact-slot" style="margin-bottom: 24px; padding: 16px; border: 1px solid #e8e8e8; border-radius: 4px;">
        <div class="slot-header" style="margin-bottom: 12px; font-weight: 600; cursor: pointer;" @click="toggleSlot(slot)">
          <a-space>
            <span>{{ expandedSlots[slot] ? '▼' : '▶' }}</span>
            <a-checkbox
              v-model:checked="getContactBySlot(slot).is_enabled"
              :disabled="readonly"
              @click.stop
              @change="handleContactChange(slot)"
            >
              {{ slot }} Enable
            </a-checkbox>
          </a-space>
        </div>

        <div v-show="expandedSlots[slot]">
        <a-row :gutter="24">
          <!-- First Name, Last Name, Relationship -->
          <a-col :span="8">
            <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
              <span>First Name:  </span>
              <a-input
                v-model:value="getContactBySlot(slot).contact_first_name"
                :disabled="readonly"
                :maxlength="100"
                style="width: 150px"
                @blur="handleContactChange(slot)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
              <span>Last Name:  </span>
              <a-input
                v-model:value="getContactBySlot(slot).contact_last_name"
                :disabled="readonly"
                :maxlength="100"
                style="width: 150px"
                @blur="handleContactChange(slot)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
              <span>Relationship: </span>
              <a-select
                v-model:value="getContactBySlot(slot).relationship"
                :disabled="readonly"
                style="width: 150px"
                @change="handleContactChange(slot)"
              >
                <a-select-option value="Child">Child</a-select-option>
                <a-select-option value="Spouse">Spouse</a-select-option>
                <a-select-option value="Friend">Friend</a-select-option>
                <a-select-option value="Caregiver">Caregiver</a-select-option>
                <a-select-option value="Other">Other</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Password Reset -->
        <a-row :gutter="12" style="margin-top: 12px; margin-bottom: 16px;">
          <a-col :span="24">
            <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span>*Password:  </span>
                <a-input-password
                  v-model:value="contactPasswords[slot]"
                  :disabled="readonly"
                  placeholder="Enter new password"
                  style="width: 200px"
                  @input="handleContactPasswordInput(slot)"
                  @blur="handleContactPasswordBlur(slot)"
                />
                <a-input-password
                  v-model:value="contactPasswordConfirms[slot]"
                  :disabled="readonly"
                  placeholder="Confirm password"
                  style="width: 200px"
                  @input="handleContactPasswordConfirmInput(slot)"
                  @blur="handleContactPasswordConfirmBlur(slot)"
                />
                <a-button
                  type="default"
                  @click="generateContactPassword(slot)"
                  :disabled="readonly"
                  style="min-width: 100px"
                >
                  GeneratePW
                </a-button>
              </div>
              <div v-if="contactPasswordErrors[slot]" style="font-size: 12px; color: #ff4d4f; margin-top: 4px;">
                {{ contactPasswordErrors[slot] }}
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Email and Phone with Save checkboxes -->
        <a-row :gutter="10">
          <a-col :span="12">
            <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
              <span>Email:  </span>
                <a-input
                  v-model:value="getContactBySlot(slot).contact_email"
                  :disabled="readonly"
                  :maxlength="255"
                style="width: 180px"
                  @blur="handleContactEmailBlur(slot)"
                />
                <a-checkbox
                  v-model:checked="getContactBySlot(slot).save_email"
                  :disabled="readonly || !getContactBySlot(slot).contact_email || getContactBySlot(slot).contact_email.trim() === ''"
                  @change="handleContactChange(slot)"
                style="margin-left: 20px"
                >
                  Save
                </a-checkbox>
              <a-checkbox
                v-model:checked="getContactBySlot(slot).receive_email"
                :disabled="readonly"
                @change="handleContactChange(slot)"
              >
                RecAlarm
              </a-checkbox>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
              <span>Phone:  </span>
                <a-input
                  v-model:value="getContactBySlot(slot).contact_phone"
                  :disabled="readonly"
                  :maxlength="25"
                  style="width: 150px"
                  @blur="handleContactPhoneBlur(slot)"
                />
                <a-checkbox
                  v-model:checked="getContactBySlot(slot).save_phone"
                  :disabled="readonly || !getContactBySlot(slot).contact_phone || getContactBySlot(slot).contact_phone.trim() === ''"
                  @change="handleContactChange(slot)"
                style="margin-left: 20px"
                >
                  Save
                </a-checkbox>
              <a-checkbox
                v-model:checked="getContactBySlot(slot).receive_sms"
                :disabled="readonly"
                @change="handleContactChange(slot)"
              >
                RecAlarm
              </a-checkbox>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Save hint -->
        <div style="font-size: 14px; color: #999; margin-bottom: 8px;">
          Email/Phone is used to reset password. Don't save by default. If save, please check [Save].
        </div>
        </div>
      </div>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { ResidentContact, UpdateResidentContactParams } from '@/api/resident/model/residentModel'
import { updateResidentContactApi } from '@/api/resident/resident'
import { hashAccount } from '@/utils/crypto'

interface Props {
  residentId: string
  contacts: ResidentContact[]
  readonly?: boolean
  mode?: 'create' | 'edit' | 'view'
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  mode: 'view',
})

const emit = defineEmits<{
  'update:contacts': [contacts: ResidentContact[]]
}>()

// Define available slots - single source of truth
const SLOTS = ['A', 'B', 'C', 'D'] as const

// Initialize contacts for slots A, B, C, D
const initializeContacts = () => {
  const slots = [...SLOTS] as string[]
  const contactsMap = new Map<string, ResidentContact>()
  
  // Load existing contacts
  props.contacts.forEach(contact => {
    if (contact.slot && slots.includes(contact.slot)) {
      // Initialize save flags based on whether email/phone exists or is placeholder in backend response
      const contactWithSaveFlags = {
        ...contact,
        // If contact_email is placeholder "***@***", save_email should be true (hash exists but not saved)
        // If contact_email is real value, save_email should be true
        // If contact_email is empty/null, save_email should be false
        save_email: !!(contact.contact_email && contact.contact_email.trim()),
        // If contact_phone is placeholder "xxx-xxx-xxxx", save_phone should be true (hash exists but not saved)
        // If contact_phone is real value, save_phone should be true
        // If contact_phone is empty/null, save_phone should be false
        save_phone: !!(contact.contact_phone && contact.contact_phone.trim()),
      }
      // Keep placeholder for display (shows that hash exists but email/phone is not saved)
      // Placeholder will be displayed in input field, but when saving, if it's still placeholder, send null
      contactsMap.set(contact.slot, contactWithSaveFlags)
    }
  })
  
  // Initialize missing slots
  slots.forEach(slot => {
    if (!contactsMap.has(slot)) {
      contactsMap.set(slot, {
        resident_id: props.residentId,
        slot: slot,
        is_enabled: false,
        contact_first_name: '',
        contact_last_name: '',
        relationship: undefined,
        contact_phone: '',
        contact_email: '',
        save_phone: false,
        save_email: false,
        receive_sms: false,
        receive_email: false,
      })
    }
  })
  
  return contactsMap
}

const contactsMap = ref<Map<string, ResidentContact>>(initializeContacts())

// Expanded state for each slot - default A expanded, B/C/D collapsed
const expandedSlots = ref<Record<string, boolean>>(
  SLOTS.reduce((acc, slot, index) => {
    acc[slot] = index === 0 // First slot (A) expanded by default
    return acc
  }, {} as Record<string, boolean>)
)

// Toggle slot expand/collapse
const toggleSlot = (slot: string) => {
  expandedSlots.value[slot] = !expandedSlots.value[slot]
}

// Password state for each contact slot - dynamically initialized from SLOTS
const contactPasswords = ref<Record<string, string>>(
  SLOTS.reduce((acc, slot) => {
    acc[slot] = ''
    return acc
  }, {} as Record<string, string>)
)
const contactPasswordConfirms = ref<Record<string, string>>(
  SLOTS.reduce((acc, slot) => {
    acc[slot] = ''
    return acc
  }, {} as Record<string, string>)
)
const contactPasswordErrors = ref<Record<string, string>>(
  SLOTS.reduce((acc, slot) => {
    acc[slot] = ''
    return acc
  }, {} as Record<string, string>)
)

// Password validation constants
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_SPECIAL_CHARS = '!@#$%^&*(),.?":{}|<>'

// Validate password strength
const validatePasswordStrength = (password: string): { isValid: boolean; errorMessage: string } => {
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

// Validate password confirmation for a specific slot
const validatePasswordConfirm = (slot: string): boolean => {
  if (!contactPasswordConfirms.value[slot]) {
    if (contactPasswords.value[slot]) {
      contactPasswordErrors.value[slot] = 'Please confirm your password'
    } else {
      contactPasswordErrors.value[slot] = ''
    }
    return false
  }

  if (contactPasswords.value[slot] !== contactPasswordConfirms.value[slot]) {
    contactPasswordErrors.value[slot] = 'Passwords do not match'
    return false
  }

  // If passwords match, also validate the password strength
  const strengthResult = validatePasswordStrength(contactPasswords.value[slot])
  contactPasswordErrors.value[slot] = strengthResult.errorMessage
  return strengthResult.isValid
}

// Handle password input for a specific slot
const handleContactPasswordInput = (slot: string) => {
  if (!contactPasswords.value[slot]) {
    contactPasswordErrors.value[slot] = ''
    return
  }
  if (!contactPasswordErrors.value[slot]?.includes('match')) {
    const result = validatePasswordStrength(contactPasswords.value[slot])
    contactPasswordErrors.value[slot] = result.errorMessage
  } else {
    validatePasswordConfirm(slot)
  }
}

// Handle password blur for a specific slot
const handleContactPasswordBlur = (slot: string) => {
  if (contactPasswords.value[slot]) {
    const result = validatePasswordStrength(contactPasswords.value[slot])
    contactPasswordErrors.value[slot] = result.errorMessage

    // If password is valid, also check confirmation if it exists
    if (result.isValid && contactPasswordConfirms.value[slot]) {
      validatePasswordConfirm(slot)
    }
  }
}

// Handle password confirm input for a specific slot
const handleContactPasswordConfirmInput = (slot: string) => {
  if (!contactPasswordConfirms.value[slot]) {
    if (!contactPasswords.value[slot]) {
      contactPasswordErrors.value[slot] = ''
    }
    return
  }
  validatePasswordConfirm(slot)
}

// Handle password confirm blur for a specific slot
const handleContactPasswordConfirmBlur = (slot: string) => {
  if (contactPasswordConfirms.value[slot]) {
    validatePasswordConfirm(slot)
  }
}

// Generate random password for a specific slot
const generateContactPassword = (slot: string) => {
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
  
  contactPasswords.value[slot] = randomPassword
  contactPasswordConfirms.value[slot] = randomPassword
  contactPasswordErrors.value[slot] = ''
}

// Check if password is valid for a specific slot
const isContactPasswordValid = (slot: string): boolean => {
  if (!contactPasswords.value[slot] || !contactPasswordConfirms.value[slot]) {
    return false
  }
  const strengthResult = validatePasswordStrength(contactPasswords.value[slot])
  const confirmResult = contactPasswords.value[slot] === contactPasswordConfirms.value[slot]
  return strengthResult.isValid && confirmResult
}

// Get password for a specific slot (for saving)
const getContactPasswordValue = (slot: string): string | undefined => {
  if (!isContactPasswordValid(slot)) {
    return undefined
  }
  return contactPasswords.value[slot] || undefined
}

// Get contact by slot
const getContactBySlot = (slot: string): ResidentContact => {
  if (!contactsMap.value.has(slot)) {
    contactsMap.value.set(slot, {
      resident_id: props.residentId,
      slot: slot,
      is_enabled: false,
      contact_first_name: '',
      contact_last_name: '',
      relationship: undefined,
      contact_phone: '',
      contact_email: '',
      save_phone: false,
      save_email: false,
      receive_sms: false,
      receive_email: false,
    })
  }
  return contactsMap.value.get(slot)!
}

// Validate US phone number
const validateUSPhoneNumber = (value: string): { isValid: boolean; errorMessage: string } => {
  if (!value || value.trim() === '') {
    return { isValid: true, errorMessage: '' }
  }
  
  // Skip validation for placeholder
  if (value === 'xxx-xxx-xxxx') {
    return { isValid: true, errorMessage: '' }
  }
  
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '')
  
  // Check if it's exactly 10 digits
  if (digitsOnly.length !== 10) {
    return { isValid: false, errorMessage: 'Phone number must be 10 digits' }
  }
  
  // Check area code: first digit must be 2-9
  const areaCode = digitsOnly.substring(0, 3)
  const areaCodeFirst = areaCode.charAt(0)
  if (areaCodeFirst && (areaCodeFirst < '2' || areaCodeFirst > '9')) {
    return { isValid: false, errorMessage: 'Area code must start with 2-9' }
  }
  
  // Check exchange code (middle 3 digits): first digit must be 2-9
  const exchangeCode = digitsOnly.substring(3, 6)
  const exchangeCodeFirst = exchangeCode.charAt(0)
  if (exchangeCodeFirst && (exchangeCodeFirst < '2' || exchangeCodeFirst > '9')) {
    return { isValid: false, errorMessage: 'Exchange code must start with 2-9' }
  }
  
  return { isValid: true, errorMessage: '' }
}

// Validate email format
const validateEmail = (value: string): { isValid: boolean; errorMessage: string } => {
  if (!value || value.trim() === '') {
    return { isValid: true, errorMessage: '' }
  }
  
  // Skip validation for placeholder
  if (value === '***@***') {
    return { isValid: true, errorMessage: '' }
  }
  
  // Trim the value for validation
  const trimmedValue = value.trim()
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedValue)) {
    return { isValid: false, errorMessage: 'Please enter a valid email address' }
  }
  
  return { isValid: true, errorMessage: '' }
}

// Handle contact email blur - trim and validate
const handleContactEmailBlur = (slot: string) => {
  const contact = getContactBySlot(slot)
  if (contact.contact_email) {
    // Trim the email
    const trimmedEmail = contact.contact_email.trim()
    contact.contact_email = trimmedEmail
    
    // Validate email format
    const validation = validateEmail(trimmedEmail)
    if (!validation.isValid) {
      message.error(`Contact ${slot} Email: ${validation.errorMessage}`)
    }
  }
  // Trigger save
  handleContactChange(slot)
}

// Handle contact phone blur - trim and validate
const handleContactPhoneBlur = (slot: string) => {
  const contact = getContactBySlot(slot)
  if (contact.contact_phone) {
    // Trim the phone
    const trimmedPhone = contact.contact_phone.trim()
    contact.contact_phone = trimmedPhone
    
    // Validate phone format
    const validation = validateUSPhoneNumber(trimmedPhone)
    if (!validation.isValid) {
      message.error(`Contact ${slot} Phone: ${validation.errorMessage}`)
    }
  }
  // Trigger save
  handleContactChange(slot)
}

// Handle contact change
const handleContactChange = async (slot: string) => {
  const contact = getContactBySlot(slot)
  
  // Calculate and send email_hash and phone_hash (for login)
  // If email/phone has value, calculate hash; if empty/null, send null to delete
  const contactToSave: any = {
    slot: contact.slot,
    is_enabled: contact.is_enabled,
    contact_first_name: contact.contact_first_name,
    contact_last_name: contact.contact_last_name,
    relationship: contact.relationship,
  }
  
  // Handle contact_phone: always calculate hash if has value (for login)
  // If save_phone is checked, send contact_phone; if not checked, send null to delete
  // If placeholder "xxx-xxx-xxxx", treat as empty (hash exists but phone not saved)
  const phoneValue = contact.contact_phone && contact.contact_phone.trim() && contact.contact_phone !== 'xxx-xxx-xxxx' 
    ? contact.contact_phone.trim() 
    : ''
  if (phoneValue) {
    contactToSave.phone_hash = await hashAccount(phoneValue)
    // If save_phone is checked, send contact_phone; if not, send null to delete existing phone
    if (contact.save_phone) {
      contactToSave.contact_phone = phoneValue
    } else {
      contactToSave.contact_phone = null // Explicitly delete phone when save is unchecked
    }
  } else {
    // Empty or placeholder: send null to delete/clear, but keep hash if it was placeholder (hash already exists in DB)
    // If it was placeholder, we don't send phone_hash (let backend keep existing hash)
    // If it was empty, send null hash to clear
    if (contact.contact_phone === 'xxx-xxx-xxxx') {
      // Placeholder: hash exists in DB, don't send phone_hash (backend will keep existing hash)
      contactToSave.contact_phone = null
      // Don't send phone_hash - backend will keep existing hash
    } else {
      // Empty: clear both phone and hash
      contactToSave.contact_phone = null
      contactToSave.phone_hash = null
    }
  }
  
  // Handle contact_email: always calculate hash if has value (for login)
  // If save_email is checked, send contact_email; if not checked, send null to delete
  // If placeholder "***@***", treat as empty (hash exists but email not saved)
  const emailValue = contact.contact_email && contact.contact_email.trim() && contact.contact_email !== '***@***' 
    ? contact.contact_email.trim() 
    : ''
  if (emailValue) {
    contactToSave.email_hash = await hashAccount(emailValue)
    // If save_email is checked, send contact_email; if not, send null to delete existing email
    if (contact.save_email) {
      contactToSave.contact_email = emailValue
    } else {
      contactToSave.contact_email = null // Explicitly delete email when save is unchecked
    }
  } else {
    // Empty or placeholder: send null to delete/clear, but keep hash if it was placeholder (hash already exists in DB)
    // If it was placeholder, we don't send email_hash (let backend keep existing hash)
    // If it was empty, send null hash to clear
    if (contact.contact_email === '***@***') {
      // Placeholder: hash exists in DB, don't send email_hash (backend will keep existing hash)
      contactToSave.contact_email = null
      // Don't send email_hash - backend will keep existing hash
    } else {
      // Empty: clear both email and hash
      contactToSave.contact_email = null
      contactToSave.email_hash = null
    }
  }
  
  // 保存接收告警设置
  contactToSave.receive_sms = contact.receive_sms || false
  contactToSave.receive_email = contact.receive_email || false
  
  // 如果密码有效，包含密码
  const password = getContactPasswordValue(slot)
  if (password) {
    contactToSave.contact_password = password
  }
  
  // Emit update
  const allContacts = Array.from(contactsMap.value.values())
  emit('update:contacts', allContacts)
  
  // Save to backend if not in create mode
  if (props.mode !== 'create' && props.residentId && props.residentId !== 'new') {
    try {
      // 使用 slot 来更新联系人
      const params: UpdateResidentContactParams = {
        ...contactToSave,
      } as UpdateResidentContactParams
      if (contact.contact_id) {
        params.contact_id = contact.contact_id
      }
      await updateResidentContactApi(props.residentId, params)
    } catch (error: any) {
      console.error(`Failed to update contact ${slot}:`, error)
      message.error(`Failed to update contact ${slot}`)
    }
  }
}

// Watch props changes
watch(
  () => props.contacts,
  () => {
    contactsMap.value = initializeContacts()
  },
  { deep: true }
)

// Watch residentId changes
watch(
  () => props.residentId,
  (newId) => {
    contactsMap.value.forEach(contact => {
      contact.resident_id = newId
    })
  }
)
</script>

<style scoped>
.contacts-content {
  padding: 16px 0 6px 0;
}

.contact-slot {
  background: #fafafa;
}

:deep(.ant-form-item) {
  margin-bottom: 12px;
}
</style>
