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
        <div class="slot-header" style="margin-bottom: 12px; font-weight: 600;">
          <a-checkbox
            v-model:checked="getContactBySlot(slot).is_enabled"
            :disabled="readonly"
            @change="handleContactChange(slot)"
          >
            {{ slot }} Enable
          </a-checkbox>
        </div>

        <a-row :gutter="24" v-if="getContactBySlot(slot).is_enabled">
          <!-- First Name, Last Name, Relationship -->
          <a-col :span="8">
            <a-form-item label="First Name：">
              <a-input
                v-model:value="getContactBySlot(slot).contact_first_name"
                :disabled="readonly"
                :maxlength="100"
                style="width: 100px"
                @blur="handleContactChange(slot)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Last Name">
              <a-input
                v-model:value="getContactBySlot(slot).contact_last_name"
                :disabled="readonly"
                :maxlength="100"
                style="width: 100px"
                @blur="handleContactChange(slot)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Relationship">
              <a-select
                v-model:value="getContactBySlot(slot).relationship"
                :disabled="readonly"
                style="width: 100%"
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
        <a-row :gutter="24" v-if="getContactBySlot(slot).is_enabled">
          <a-col :span="12">
            <a-form-item label="Email">
              <a-space>
                <a-input
                  v-model:value="getContactBySlot(slot).contact_email"
                  :disabled="readonly"
                  :maxlength="255"
                  style="width: 150px"
                  @blur="handleContactChange(slot)"
                />
                <a-checkbox
                  v-model:checked="getContactBySlot(slot).save_email"
                  :disabled="readonly"
                  @change="handleContactChange(slot)"
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
                >
                  Save
                </a-checkbox>
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Save hint -->
        <div v-if="getContactBySlot(slot).is_enabled" style="font-size: 12px; color: #999; margin-bottom: 8px;">
          Use to reset password. Don't save by default. If save, please check [Save].
        </div>

        <!-- Receive alarm checkboxes -->
        <a-row v-if="getContactBySlot(slot).is_enabled">
          <a-col :span="24">
            <a-form-item label="Receive Alarm">
              <a-space>
                <a-checkbox
                  v-model:checked="alertChannels[slot].SMS"
                  :disabled="readonly"
                  @change="handleAlertChannelChange(slot)"
                >
                  SMS
                </a-checkbox>
                <a-checkbox
                  v-model:checked="alertChannels[slot].Email"
                  :disabled="readonly"
                  @change="handleAlertChannelChange(slot)"
                >
                  Email
                </a-checkbox>
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>
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
        can_receive_alert: false,
        alert_channels: [],
      })
    }
  })
  
  return contactsMap
}

const contactsMap = ref<Map<string, ResidentContact>>(initializeContacts())

// Alert channels for each slot
const alertChannels = ref<Record<string, { SMS: boolean; Email: boolean }>>({
  A: { SMS: false, Email: false },
  B: { SMS: false, Email: false },
  C: { SMS: false, Email: false },
  D: { SMS: false, Email: false },
})

// Initialize alert channels from contacts
const initializeAlertChannels = () => {
  contactsMap.value.forEach((contact, slot) => {
    if (contact.alert_channels) {
      alertChannels.value[slot] = {
        SMS: contact.alert_channels.includes('SMS'),
        Email: contact.alert_channels.includes('Email'),
      }
    }
  })
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
      can_receive_alert: false,
      alert_channels: [],
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
  
  // Update alert channels
  const channels: string[] = []
  if (alertChannels.value[slot].SMS) channels.push('SMS')
  if (alertChannels.value[slot].Email) channels.push('Email')
  contactToSave.alert_channels = channels
  contactToSave.can_receive_alert = channels.length > 0
  
  // Emit update
  const allContacts = Array.from(contactsMap.value.values())
  emit('update:contacts', allContacts)
  
  // Save to backend if not in create mode
  if (props.mode !== 'create' && props.residentId && props.residentId !== 'new') {
    try {
      // 使用 slot 来更新联系人
      const params: UpdateResidentContactParams = {
        ...contactToSave,
        slot: slot,
      }
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

// Handle alert channel change
const handleAlertChannelChange = (slot: string) => {
  handleContactChange(slot)
}

// Watch props changes
watch(
  () => props.contacts,
  (newContacts) => {
    contactsMap.value = initializeContacts()
    initializeAlertChannels()
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

// Initialize on mount
initializeAlertChannels()
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
