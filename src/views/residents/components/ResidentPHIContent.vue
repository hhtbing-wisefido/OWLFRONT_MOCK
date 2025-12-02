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
      <div style="font-size: 12px; color: #999; margin-bottom: 12px;">
        Note: default Email/phone only use to find passwd, if need save, please check. Home address fields are only required for Home scenario (not for Facility).
      </div>
      
      <!-- Email with Save, Phone with Save -->
      <a-row :gutter="12" style="margin-bottom: 16px;">
        <a-col>
          <a-form-item label="Email" style="margin-bottom: 0;">
            <a-space>
              <a-input
                v-model:value="localPHIData.resident_email"
                :disabled="readonly"
                :maxlength="255"
                style="width: 150px"
              />
              <a-checkbox v-model:checked="saveEmail" :disabled="readonly">Save</a-checkbox>
            </a-space>
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="Phone" style="margin-bottom: 0;">
            <a-space>
              <a-input
                v-model:value="localPHIData.resident_phone"
                :disabled="readonly"
                :maxlength="25"
                style="width: 150px"
              />
              <a-checkbox v-model:checked="savePhone" :disabled="readonly">Save</a-checkbox>
            </a-space>
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="Google Plus Code" style="margin-bottom: 0;">
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
import dayjs, { type Dayjs } from 'dayjs'
import type { ResidentPHI } from '@/api/resident/model/residentModel'

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

// Save checkboxes - 默认不保存
const saveEmail = ref(false)
const savePhone = ref(false)

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

// Watch for changes and emit updates
watch(
  () => localPHIData.value,
  (newData) => {
    // 如果 saveEmail 或 savePhone 为 false，不发送 email/phone 到后端
    const dataToEmit = { ...newData }
    if (!saveEmail.value) {
      delete dataToEmit.resident_email
    }
    if (!savePhone.value) {
      delete dataToEmit.resident_phone
    }
    emit('update:phi-data', dataToEmit)
  },
  { deep: true }
)

// Watch props changes
watch(
  () => props.phiData,
  (newData) => {
    if (newData) {
      localPHIData.value = {
        resident_id: props.residentId,
        ...newData,
      }
      // 如果已有 email_hash 或 phone_hash，说明已保存，设置 save 为 true
      saveEmail.value = !!newData.email_hash
      savePhone.value = !!newData.phone_hash
    }
  },
  { deep: true }
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
  padding: 16px 0;
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
