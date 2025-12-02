<template>
  <div class="contacts-content">
    <a-form layout="horizontal" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <!-- Header: Family account explanation -->
      <div style="margin-bottom: 16px; font-size: 12px; color: #666;">
        <div>Family account = resident'account + A/B/C/D or family'account + A/B/C/D</div>
        <div style="margin-top: 4px;">
          For example: resident'account='R001', login_account='R001A'; family'account='F001', login_account='F001A'
        </div>
      </div>

      <!-- Contact Slots A, B, C, D -->
      <div v-for="slot in ['A', 'B', 'C', 'D']" :key="slot" class="contact-slot" style="margin-bottom: 24px; padding: 16px; border: 1px solid #e8e8e8; border-radius: 4px;">
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

        <!-- Email and Phone with Save checkboxes -->
        <a-row :gutter="24">
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
                Receive Email
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
                Receive SMS
              </a-checkbox>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Save hint -->
        <div style="font-size: 12px; color: #999; margin-bottom: 8px;">
          Use to reset password. Don't save by default. If save, please check [Save].
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

// Initialize contacts for slots A, B, C, D
const initializeContacts = () => {
  const slots = ['A', 'B', 'C', 'D']
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
const expandedSlots = ref<Record<string, boolean>>({
  A: true,
  B: false,
  C: false,
  D: false,
})

// Toggle slot expand/collapse
const toggleSlot = (slot: string) => {
  expandedSlots.value[slot] = !expandedSlots.value[slot]
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
  
  // 如果 save_phone 或 save_email 为 false，不发送 phone/email 到后端
  const contactToSave: Partial<ResidentContact> = {
    slot: contact.slot,
    is_enabled: contact.is_enabled,
    contact_first_name: contact.contact_first_name,
    contact_last_name: contact.contact_last_name,
    relationship: contact.relationship,
  }
  
  // 只有勾选了 save 才保存 phone/email
  if (contact.save_phone && contact.contact_phone) {
    contactToSave.contact_phone = contact.contact_phone
  }
  if (contact.save_email && contact.contact_email) {
    contactToSave.contact_email = contact.contact_email
  }
  
  // 保存接收告警设置
  contactToSave.receive_sms = contact.receive_sms || false
  contactToSave.receive_email = contact.receive_email || false
  
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
  padding: 16px 0;
}

.contact-slot {
  background: #fafafa;
}

:deep(.ant-form-item) {
  margin-bottom: 12px;
}
</style>
