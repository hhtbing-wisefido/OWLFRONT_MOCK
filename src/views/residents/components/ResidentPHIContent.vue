<template>
  <div class="phi-content">
    <a-form layout="horizontal" :model="localPHIData" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <!-- Gender -->
      <a-form-item label="Gender">
        <a-radio-group
          v-model:value="localPHIData.gender"
          :disabled="readonly"
        >
          <a-radio value="Male">Male</a-radio>
          <a-radio value="Female">Female</a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- Email and Phone with Save checkboxes -->
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="Email">
            <a-space>
              <a-input
                v-model:value="localPHIData.resident_email"
                :disabled="readonly"
                :maxlength="255"
                style="width: 150px"
              />
              <a-checkbox
                v-model:checked="saveEmail"
                :disabled="readonly"
              >
                Save
              </a-checkbox>
            </a-space>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Phone">
            <a-space>
              <a-input
                v-model:value="localPHIData.resident_phone"
                :disabled="readonly"
                :maxlength="25"
                style="width: 150px"
              />
              <a-checkbox
                v-model:checked="savePhone"
                :disabled="readonly"
              >
                Save
              </a-checkbox>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Save hint -->
      <a-form-item>
        <div style="font-size: 12px; color: #999;">
          Use to reset password. Don't save by default. If save, please check [Save].
        </div>
      </a-form-item>

      <!-- Chronic Conditions - 2 rows, 3 per row -->
      <a-form-item label="Chronic Conditions">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-checkbox
              v-model:checked="localPHIData.has_hypertension"
              :disabled="readonly"
            >
              Hypertension
            </a-checkbox>
          </a-col>
          <a-col :span="8">
            <a-checkbox
              v-model:checked="localPHIData.has_hyperlipaemia"
              :disabled="readonly"
            >
              Hyperlipaemia
            </a-checkbox>
          </a-col>
          <a-col :span="8">
            <a-checkbox
              v-model:checked="localPHIData.has_hyperglycaemia"
              :disabled="readonly"
            >
              Hyperglycaemia
            </a-checkbox>
          </a-col>
        </a-row>
        <a-row :gutter="16" style="margin-top: 8px">
          <a-col :span="8">
            <a-checkbox
              v-model:checked="localPHIData.has_stroke_history"
              :disabled="readonly"
            >
              Stroke History
            </a-checkbox>
          </a-col>
          <a-col :span="8">
            <a-checkbox
              v-model:checked="localPHIData.has_paralysis"
              :disabled="readonly"
            >
              Paralysis
            </a-checkbox>
          </a-col>
          <a-col :span="8">
            <a-checkbox
              v-model:checked="localPHIData.has_alzheimer"
              :disabled="readonly"
            >
              Alzheimer's Disease
            </a-checkbox>
          </a-col>
        </a-row>
      </a-form-item>

      <!-- Medical History -->
      <a-form-item label="Medical History">
        <a-textarea
          v-model:value="localPHIData.medical_history"
          :disabled="readonly"
          :rows="4"
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
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

:deep(.ant-form-item) {
  margin-bottom: 16px;
}
</style>
