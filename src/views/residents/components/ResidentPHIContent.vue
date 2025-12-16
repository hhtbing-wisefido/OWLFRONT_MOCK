<template>
  <div class="phi-content">
    <a-form layout="horizontal" :model="localPHIData" :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
      
      <!-- Row 1: Gender, Date of Birth, Weight, Height -->
      <a-row :gutter="50" style="margin-bottom: 16px;">
        <a-col>
          <a-form-item label="Gender" style="margin-bottom: 0;">
            <a-radio-group v-model:value="localPHIData.gender" :disabled="readonly">
              <a-radio value="Male">Male</a-radio>
              <a-radio value="Female">Female</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="Date of Birth" style="margin-bottom: 0;">
            <a-date-picker
              v-model:value="localPHIData.date_of_birth"
              :disabled="readonly"
              style="width: 150px"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :default-picker-value="dayjs('1945-01-01')"
            />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="Weight (lb)" style="margin-bottom: 0;">
            <a-input-number
              v-model:value="localPHIData.weight_lb"
              :disabled="readonly"
              :min="0"
              :max="999"
              :precision="2"
              style="width: 100px"
            />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="Height" style="margin-bottom: 0;">
            <a-space>
              <a-input-number
                v-model:value="localPHIData.height_ft"
                :disabled="readonly"
                :min="0"
                :max="9"
                :precision="0"
                style="width: 60px"
              />
              <span>ft</span>
              <a-input-number
                v-model:value="localPHIData.height_in"
                :disabled="readonly"
                :min="0"
                :max="11"
                :precision="0"
                style="width: 60px"
              />
              <span>in</span>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Row 2: Functional Health -->
      <a-row :gutter="40" style="margin-bottom: 16px;">
        <a-col>
          <a-form-item label="Mobility Level" style="margin-bottom: 0;">
            <a-select
              v-model:value="localPHIData.mobility_level"
              :disabled="readonly"
              style="width: 120px"
              :allowClear="true"
            >
              <a-select-option :value="0">0 - No mobility</a-select-option>
              <a-select-option :value="1">1 - Very limited</a-select-option>
              <a-select-option :value="2">2 - Limited</a-select-option>
              <a-select-option :value="3">3 - Moderate</a-select-option>
              <a-select-option :value="4">4 - Good</a-select-option>
              <a-select-option :value="5">5 - Independent</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="Tremor Status" style="margin-bottom: 0;">
            <a-select
              v-model:value="localPHIData.tremor_status"
              :disabled="readonly"
              style="width: 100px"
              :allowClear="true"
            >
              <a-select-option value="None">None</a-select-option>
              <a-select-option value="Mild">Mild</a-select-option>
              <a-select-option value="Severe">Severe</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="Mobility Aid" style="margin-bottom: 0;">
            <a-select
              v-model:value="localPHIData.mobility_aid"
              :disabled="readonly"
              style="width: 120px"
              :allowClear="true"
            >
              <a-select-option value="None">None</a-select-option>
              <a-select-option value="Cane">Cane</a-select-option>
              <a-select-option value="Walker">Walker</a-select-option>
              <a-select-option value="Wheelchair">Wheelchair</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="ADL Assistance" style="margin-bottom: 0;">
            <a-select
              v-model:value="localPHIData.adl_assistance"
              :disabled="readonly"
              style="width: 130px"
              :allowClear="true"
            >
              <a-select-option value="Independent">Independent</a-select-option>
              <a-select-option value="NeedsHelp">Needs Help</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="Communication" style="margin-bottom: 0;">
            <a-select
              v-model:value="localPHIData.comm_status"
              :disabled="readonly"
              style="width: 150px"
              :allowClear="true"
            >
              <a-select-option value="Normal">Normal</a-select-option>
              <a-select-option value="SpeechDifficulty">Speech Difficulty</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Row 5: Chronic Conditions - inline display -->
      <a-row :gutter="12" style="margin-bottom: 16px;">
        <a-col :span="24">
          <a-form-item label="Chronic Conditions" style="margin-bottom: 0;">
            <a-space wrap>
              <a-checkbox v-model:checked="localPHIData.has_hypertension" :disabled="readonly">
                Hypertension
              </a-checkbox>
              <a-checkbox v-model:checked="localPHIData.has_hyperlipaemia" :disabled="readonly">
                Hyperlipaemia
              </a-checkbox>
              <a-checkbox v-model:checked="localPHIData.has_hyperglycaemia" :disabled="readonly">
                Hyperglycaemia
              </a-checkbox>
              <a-checkbox v-model:checked="localPHIData.has_stroke_history" :disabled="readonly">
                Stroke History
              </a-checkbox>
              <a-checkbox v-model:checked="localPHIData.has_paralysis" :disabled="readonly">
                Paralysis
              </a-checkbox>
              <a-checkbox v-model:checked="localPHIData.has_alzheimer" :disabled="readonly">
                Alzheimer's Disease
              </a-checkbox>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Row 6: Medical History -->
      <a-row style="margin-bottom: 16px;">
        <a-col>
          <a-form-item label="Medical History" style="margin-bottom: 0;">
            <div style="display: flex; justify-content: flex-end;">
              <a-textarea
                v-model:value="localPHIData.medical_history"
                :disabled="readonly"
                :rows="4"
                style="width: 850px"
              />
            </div>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Row 5: Home Address (仅 Home 场景) -->
      <a-divider orientation="left">Home Address</a-divider>
      <div style="font-size: 14px; color: #999; margin-bottom: 12px;">
        Note: default Email/phone only use to find passwd, if need save, please check. Home address fields are only required for Home scenario (not for Facility).
      </div>
      
      <!-- Email with Save, Phone with Save -->
      <a-row :gutter="12" style="margin-bottom: 16px;">
        <a-col>
          <a-form-item label="Email" name="resident_email" :rules="emailRules" style="margin-bottom: 0;">
            <a-space>
              <a-input
                v-model:value="localPHIData.resident_email"
                :disabled="readonly"
                :maxlength="255"
                style="width: 150px"
                @blur="handleEmailBlur"
              />
              <a-checkbox v-model:checked="saveEmail" :disabled="readonly || !localPHIData.resident_email || localPHIData.resident_email.trim() === ''">Save</a-checkbox>
            </a-space>
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="Phone" name="resident_phone" :rules="phoneRules" style="margin-bottom: 0;">
            <a-space>
              <a-input
                v-model:value="localPHIData.resident_phone"
                :disabled="readonly"
                :maxlength="25"
                style="width: 150px"
              />
              <a-checkbox v-model:checked="savePhone" :disabled="readonly || !localPHIData.resident_phone || localPHIData.resident_phone.trim() === ''">Save</a-checkbox>
            </a-space>
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="Plus Code" style="margin-bottom: 0;">
            <a-input
              v-model:value="localPHIData.plus_code"
              :disabled="readonly"
              :maxlength="32"
              style="width: 140px"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Home Address Fields -->
      <a-row :gutter="12" style="margin-bottom: 16px;">
        <a-col>
          <a-form-item label="Street unit address" style="margin-bottom: 0;">
            <a-input
              v-model:value="localPHIData.home_address_street"
              :disabled="readonly"
              :maxlength="255"
              style="width: 300px"
            />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="City" style="margin-bottom: 0;">
            <a-input
              v-model:value="localPHIData.home_address_city"
              :disabled="readonly"
              :maxlength="100"
              style="width: 150px"
            />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="State" style="margin-bottom: 0;">
            <a-auto-complete
              v-model:value="localPHIData.home_address_state"
              :disabled="readonly"
              :options="usStateOptions"
              :filter-option="filterStateOption"
              style="width: 80px"
            />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="Postal Code" style="margin-bottom: 0;">
            <a-input
              v-model:value="localPHIData.home_address_postal_code"
              :disabled="readonly"
              :maxlength="20"
              style="width: 100px"
            />
          </a-form-item>
        </a-col>
      </a-row>
      
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import dayjs from 'dayjs'
import type { Rule } from 'ant-design-vue/es/form'
import type { ResidentPHI } from '@/api/resident/model/residentModel'
import { hashAccount } from '@/utils/crypto'

interface Props {
  residentId: string
  phiData?: ResidentPHI
  readonly?: boolean
  mode?: 'create' | 'edit' | 'view'
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  mode: 'view',
})

const emit = defineEmits<{
  'update:phi-data': [data: ResidentPHI]
}>()

const localPHIData = ref<ResidentPHI>({
  resident_id: props.residentId,
  ...props.phiData,
})

// Save checkboxes - 根据初始 phiData 设置
const saveEmail = ref(false)
const savePhone = ref(false)

// Initialize save flags based on initial phiData
const initializeSaveFlags = (phiData?: ResidentPHI) => {
  if (phiData) {
    const emailValue = phiData.resident_email && phiData.resident_email.trim()
    saveEmail.value = !!(emailValue && emailValue !== '***@***')
    
    const phoneValue = phiData.resident_phone && phiData.resident_phone.trim()
    savePhone.value = !!(phoneValue && phoneValue !== 'xxx-xxx-xxxx')
  } else {
    saveEmail.value = false
    savePhone.value = false
  }
}

// Initialize save flags on component mount
initializeSaveFlags(props.phiData)

// US State options (abbreviations)
const usStateOptions = [
  { value: 'AL' }, { value: 'AK' }, { value: 'AZ' }, { value: 'AR' }, { value: 'CA' },
  { value: 'CO' }, { value: 'CT' }, { value: 'DE' }, { value: 'FL' }, { value: 'GA' },
  { value: 'HI' }, { value: 'ID' }, { value: 'IL' }, { value: 'IN' }, { value: 'IA' },
  { value: 'KS' }, { value: 'KY' }, { value: 'LA' }, { value: 'ME' }, { value: 'MD' },
  { value: 'MA' }, { value: 'MI' }, { value: 'MN' }, { value: 'MS' }, { value: 'MO' },
  { value: 'MT' }, { value: 'NE' }, { value: 'NV' }, { value: 'NH' }, { value: 'NJ' },
  { value: 'NM' }, { value: 'NY' }, { value: 'NC' }, { value: 'ND' }, { value: 'OH' },
  { value: 'OK' }, { value: 'OR' }, { value: 'PA' }, { value: 'RI' }, { value: 'SC' },
  { value: 'SD' }, { value: 'TN' }, { value: 'TX' }, { value: 'UT' }, { value: 'VT' },
  { value: 'VA' }, { value: 'WA' }, { value: 'WV' }, { value: 'WI' }, { value: 'WY' },
]

// Filter state option
const filterStateOption = (input: string, option: any) => {
  return option.value.toLowerCase().includes(input.toLowerCase())
}

// Validate US phone number
// Format: 10 digits, area code (2-9)XX, exchange code (2-9)XX, subscriber number XXXX
// Supports formats: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXX.XXX.XXXX, XXXXXXXXXX
const validateUSPhoneNumber = (_rule: any, value: string): Promise<void> => {
  if (!value || value.trim() === '') {
    // Phone is optional, empty is valid
    return Promise.resolve()
  }
  
  // Skip validation for placeholder
  if (value === 'xxx-xxx-xxxx') {
    return Promise.resolve()
  }
  
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '')
  
  // Check if it's exactly 10 digits
  if (digitsOnly.length !== 10) {
    return Promise.reject('Phone number must be 10 digits')
  }
  
  // Check area code: first digit must be 2-9
  const areaCode = digitsOnly.substring(0, 3)
  const areaCodeFirst = areaCode.charAt(0)
  if (areaCodeFirst && (areaCodeFirst < '2' || areaCodeFirst > '9')) {
    return Promise.reject('Area code must start with 2-9')
  }
  
  // Check exchange code (middle 3 digits): first digit must be 2-9
  const exchangeCode = digitsOnly.substring(3, 6)
  const exchangeCodeFirst = exchangeCode.charAt(0)
  if (exchangeCodeFirst && (exchangeCodeFirst < '2' || exchangeCodeFirst > '9')) {
    return Promise.reject('Exchange code must start with 2-9')
  }
  
  // Valid US phone number format
  return Promise.resolve()
}

// Phone validation rules
const phoneRules: Rule[] = [
  { validator: validateUSPhoneNumber, trigger: 'blur' }
]

// Validate email format and trim
const validateEmail = (_rule: any, value: string): Promise<void> => {
  if (!value || value.trim() === '') {
    // Email is optional, empty is valid
    return Promise.resolve()
  }
  
  // Skip validation for placeholder
  if (value === '***@***') {
    return Promise.resolve()
  }
  
  // Trim the value for validation
  const trimmedValue = value.trim()
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedValue)) {
    return Promise.reject('Please enter a valid email address')
  }
  
  // Valid email format
  return Promise.resolve()
}

// Email validation rules
const emailRules: Rule[] = [
  { validator: validateEmail, trigger: 'blur' }
]

// Handle email blur - auto trim
const handleEmailBlur = () => {
  if (localPHIData.value.resident_email) {
    localPHIData.value.resident_email = localPHIData.value.resident_email.trim()
  }
}

// Expose method to get current PHI data (called by parent on save)
const getPHIData = async () => {
  const dataToEmit: any = { ...localPHIData.value }
  
  // Calculate and send email_hash and phone_hash (for login in residents table)
  // Always calculate hash if email/phone has value (for login)
  // If save flag is checked, send email/phone; if not checked, send null to delete
  // If placeholder "***@***", treat as empty (hash exists but email not saved)
  const emailValue = localPHIData.value.resident_email && localPHIData.value.resident_email.trim() && localPHIData.value.resident_email !== '***@***' 
    ? localPHIData.value.resident_email.trim() 
    : ''
  if (emailValue) {
    // Always calculate and send email_hash when email has value (for login)
    dataToEmit.email_hash = await hashAccount(emailValue)
    // If saveEmail is checked, send resident_email; if not, send null to delete existing email
    if (saveEmail.value) {
      dataToEmit.resident_email = emailValue
    } else {
      // Save unchecked: send null to delete email, but keep email_hash for login
      dataToEmit.resident_email = null
      // email_hash is already set above, so it will be sent to update residents table
    }
  } else {
    // Empty or placeholder: send null to delete/clear, but keep hash if it was placeholder (hash already exists in DB)
    if (localPHIData.value.resident_email === '***@***') {
      // Placeholder: hash exists in DB, don't send email_hash (backend will keep existing hash)
      dataToEmit.resident_email = null
      // Don't send email_hash - backend will keep existing hash
      // Explicitly delete email_hash from dataToEmit to ensure it's not sent
      delete dataToEmit.email_hash
    } else {
      // Empty: clear both email and hash
      dataToEmit.email_hash = null
      dataToEmit.resident_email = null
    }
  }
  
  // If placeholder "xxx-xxx-xxxx", treat as empty (hash exists but phone not saved)
  const phoneValue = localPHIData.value.resident_phone && localPHIData.value.resident_phone.trim() && localPHIData.value.resident_phone !== 'xxx-xxx-xxxx' 
    ? localPHIData.value.resident_phone.trim() 
    : ''
  if (phoneValue) {
    // Always calculate and send phone_hash when phone has value (for login)
    dataToEmit.phone_hash = await hashAccount(phoneValue)
    // If savePhone is checked, send resident_phone; if not, send null to delete existing phone
    if (savePhone.value) {
      dataToEmit.resident_phone = phoneValue
    } else {
      // Save unchecked: send null to delete phone, but keep phone_hash for login
      dataToEmit.resident_phone = null
      // phone_hash is already set above, so it will be sent to update residents table
    }
  } else {
    // Empty or placeholder: send null to delete/clear, but keep hash if it was placeholder (hash already exists in DB)
    if (localPHIData.value.resident_phone === 'xxx-xxx-xxxx') {
      // Placeholder: hash exists in DB, don't send phone_hash (backend will keep existing hash)
      dataToEmit.resident_phone = null
      // Don't send phone_hash - backend will keep existing hash
      // Explicitly delete phone_hash from dataToEmit to ensure it's not sent
      delete dataToEmit.phone_hash
    } else {
      // Empty: clear both phone and hash
      dataToEmit.phone_hash = null
      dataToEmit.resident_phone = null
    }
  }
  
  return dataToEmit
}

defineExpose({
  getPHIData
})

// Watch props changes
watch(
  () => props.phiData,
  (newData) => {
    if (newData) {
      localPHIData.value = {
        ...newData,
        resident_id: props.residentId, // Ensure resident_id is set from props
      }
      // Update save flags when props change
      initializeSaveFlags(newData)
    } else {
      // If phiData is cleared, reset save flags
      saveEmail.value = false
      savePhone.value = false
    }
  },
  { deep: true, immediate: true } // Immediate to handle initial data load
)

// Watch residentId changes
watch(
  () => props.residentId,
  (newId) => {
    localPHIData.value.resident_id = newId
  }
)
</script>

<style scoped>
.phi-content {
  padding: 16px 0 6px 0;
}

:deep(.ant-divider) {
  margin: 10px 0 8px 0;
}

:deep(.ant-form-item) {
  margin-bottom: 0;
  display: inline-block;
  margin-right: 12px;
}

:deep(.ant-form-item-label) {
  padding-bottom: 4px;
  text-align: left;
}

:deep(.ant-form-item-label > label) {
  white-space: nowrap;
}
</style>
