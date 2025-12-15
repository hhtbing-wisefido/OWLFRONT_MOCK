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
                  @blur="handleContactChange(slot)"
                />
                <a-checkbox
                  v-model:checked="getContactBySlot(slot).save_email"
                  :disabled="readonly"
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
                  @blur="handleContactChange(slot)"
                />
                <a-checkbox
                  v-model:checked="getContactBySlot(slot).save_phone"
                  :disabled="readonly"
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
      contactsMap.set(contact.slot, { ...contact })
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

// Handle contact change
const handleContactChange = async (slot: string) => {
  const contact = getContactBySlot(slot)
  
  const contactToSave: any = {
    slot: contact.slot,
    is_enabled: contact.is_enabled,
    contact_first_name: contact.contact_first_name,
    contact_last_name: contact.contact_last_name,
    relationship: contact.relationship,
  }
  
  // Handle phone: calculate hash and set phone field based on save_phone flag
  if (contact.contact_phone && contact.contact_phone.trim() !== '') {
    // Calculate hash for login
    const phoneHash = await hashAccount(contact.contact_phone)
    contactToSave.phone_hash = phoneHash
    // Only send plaintext if save_phone is true
    if (contact.save_phone) {
      contactToSave.contact_phone = contact.contact_phone
    } else {
      contactToSave.contact_phone = null
    }
  } else {
    // If phone is empty, send null for both hash and phone
    contactToSave.phone_hash = null
    contactToSave.contact_phone = null
  }
  
  // Handle email: calculate hash and set email field based on save_email flag
  if (contact.contact_email && contact.contact_email.trim() !== '') {
    // Calculate hash for login
    const emailHash = await hashAccount(contact.contact_email)
    contactToSave.email_hash = emailHash
    // Only send plaintext if save_email is true
    if (contact.save_email) {
      contactToSave.contact_email = contact.contact_email
    } else {
      contactToSave.contact_email = null
    }
  } else {
    // If email is empty, send null for both hash and email
    contactToSave.email_hash = null
    contactToSave.contact_email = null
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
