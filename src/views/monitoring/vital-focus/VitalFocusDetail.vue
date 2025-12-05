<template>
  <div class="page-container">
    <a-spin :spinning="loading">
      <div v-if="card" class="detail-content">
        <!-- First Card: Resident, Address, Caregiver -->
        <a-card class="custom-card" size="small">
          <!-- Resident Information - 3 rows layout -->
          <div
            class="resident-container"
            v-for="resident in card.residents"
            :key="resident.resident_id"
          >
            <!-- Row 1: card_name | resident' sex/old | card_address -->
            <div class="info-row row-1">
              <span class="card-name">{{ card.card_name }}</span>
              <span class="separator">|</span>
              <span class="resident-info">
                <span v-if="resident.phi?.gender">{{ resident.phi.gender }}</span>
                <span v-if="resident.phi?.date_of_birth">
                  {{ calculateAge(resident.phi.date_of_birth) }} years old
                </span>
              </span>
              <span class="separator">|</span>
              <span class="card-address">{{ card.card_address }}</span>
            </div>
            
            <!-- Row 2: Care Team: Group-A   Special Caregivers: xxx -->
            <div class="info-row row-2">
              <!-- Care Team (Caregiver Groups) -->
              <span v-if="card.caregiver_groups && card.caregiver_groups.length > 0">
                <span class="label">Care Team:</span>
                <span
                  v-for="(group, index) in card.caregiver_groups"
                  :key="group.group_id"
                  class="caregiver-group-item"
                >
                  <span v-if="index > 0" class="separator">,</span>
                  <span
                    v-if="canAccessTagManagement"
                    class="group-name-link"
                    @click="goToTagManagement"
                  >
                    {{ group.group_name }}
                  </span>
                  <span v-else class="group-name">{{ group.group_name }}</span>
                </span>
                <span v-if="card.caregivers && card.caregivers.length > 0" class="separator">  </span>
              </span>
              
              <!-- Special Caregivers -->
              <span v-if="card.caregivers && card.caregivers.length > 0">
                <span class="label">Special Caregivers:</span>
                <span
                  v-for="(caregiver, index) in card.caregivers"
                  :key="caregiver.caregiver_id"
                  class="caregiver-item"
                >
                  <span v-if="index > 0" class="separator">,</span>
                  <span class="caregiver-name">{{ caregiver.caregiver_name }}</span>
                  <span v-if="caregiver.phone || caregiver.email" class="caregiver-contact">
                    ({{ caregiver.phone || caregiver.email }})
                  </span>
                </span>
              </span>
            </div>
            
            <!-- Row 3: Emergency'nickname/Relationship/mobile -->
            <div class="info-row row-3" v-if="hasEmergencyContacts(resident)">
              <span class="label">Emergency:</span>
              <span
                v-for="(contact, index) in getEmergencyContacts(resident)"
                :key="getContactKey(contact)"
                class="contact-item"
              >
                <span v-if="index > 0" class="separator">|</span>
                <span class="contact-nickname">{{ formatContactName(contact) }}</span>
                <span class="separator">/</span>
                <span class="contact-relationship">{{ contact.relationship || '-' }}</span>
                <span class="separator">/</span>
                <span class="contact-mobile">{{ contact.contact_phone || '-' }}</span>
              </span>
            </div>
          </div>
        </a-card>

        <!-- Second Card: Device List -->
        <a-card class="custom-card" size="small">
          <div
            style="
              display: flex;
              justify-content: space-between;
              flex-direction: column;
              flex-wrap: wrap;
              gap: 12px;
            "
          >
            <div
              v-for="device in card.devices"
              :key="device.device_id"
              style="display: flex; flex-direction: row; align-items: center"
            >
              <!-- Device Icon -->
              <div>
                <img
                  v-if="device.device_type === 1 && device.status === 'online'"
                  src="@/assets/images/sleepad.png"
                  style="margin-right: 10px; height: 50px; width: 50px"
                />
                <img
                  v-else-if="device.device_type === 1 && device.status !== 'online'"
                  src="@/assets/images/sleepace-offline.png"
                  style="margin-right: 10px; height: 50px; width: 50px"
                />
                <img
                  v-else-if="device.device_type === 2 && device.status === 'online'"
                  src="@/assets/images/radar.png"
                  style="margin-right: 10px; height: 50px; width: 50px"
                />
                <img
                  v-else
                  src="@/assets/images/radar-offline.png"
                  style="margin-right: 10px; height: 50px; width: 50px"
                />
              </div>
              
              <!-- Device Name and Code -->
              <div style="display: flex; flex-direction: column">
                <span style="font-size: 16px">{{ device.device_name }}</span>
                <span style="font-size: 14px; padding-right: 8px">
                  {{ device.serial_number || device.uid || '-' }}
                </span>
              </div>
              
              <!-- Online Status -->
              <div style="padding-left: 8px">
                <span v-if="device.status === 'online'" style="font-size: 14px; color: #21c376">
                  Online
                </span>
                <span v-else style="font-size: 14px; color: #f56c6c">Offline</span>
              </div>
              
              <!-- Device Actions -->
              <div style="display: flex; flex-direction: row; padding: 0 12px 0 12px; gap: 16px">
                <!-- Sleepace: Sleep Report -->
                <div v-if="device.device_type === 1" class="settings" @click="goSleepReport(device)">
                  <span style="font-size: 14px; color: #21c376; cursor: pointer">
                    Sleep Report >
                  </span>
                </div>
                
                <!-- Monitor Settings -->
                <div class="settings" @click="goMonitorSetting(device)">
                  <span style="font-size: 14px; color: #f56c6c; cursor: pointer">
                    Monitor Settings >
                  </span>
                </div>
                
                <!-- Radar: Real-time Trajectory -->
                <div v-if="device.device_type === 2" class="settings" @click="goRadarTrajectory(device)">
                  <span style="font-size: 14px; color: #409eff; cursor: pointer">
                    Real-time Trajectory >
                  </span>
                </div>
              </div>
            </div>
          </div>
        </a-card>

        <!-- Third Card: Alarm Events -->
        <a-card class="custom-card" size="small">
          <a-tabs v-model:activeKey="activeKey" @change="tabChange">
            <a-tab-pane key="pending" tab="Pending Alarm Records">
              <div style="margin-bottom: 16px">
                <a-range-picker v-model:value="pendingDateRange" :ranges="ranges" />
                <a-button type="primary" @click="pendingSearch" style="margin-left: 8px">
                  Search
                </a-button>
              </div>
              <AlarmRecordList 
                :status="'active'"
                :columns="pendingColumns"
                :filters="filters"
                :cardId="cardId"
              />
            </a-tab-pane>
            <a-tab-pane key="resolved" tab="Resolved Alarm Records">
              <div style="margin-bottom: 16px">
                <a-range-picker v-model:value="resolvedDateRange" :ranges="ranges" />
                <a-button type="primary" @click="resolvedSearch" style="margin-left: 8px">
                  Search
                </a-button>
              </div>
              <AlarmRecordList 
                :status="'resolved'"
                :columns="resolvedColumns"
                :filters="filters"
                :cardId="cardId"
              />
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </div>
      <div v-else-if="!loading" style="text-align: center; padding: 40px">
        <a-empty description="Card not found" />
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import type { CardOverviewItem, CardOverviewDevice } from '@/api/card-overview/model/cardOverviewModel'
import { useCardStore } from '@/store/modules/card'
import { useUserStore } from '@/store/modules/user'
import AlarmRecordList from '@/views/alarm/components/AlarmRecordList.vue'

const route = useRoute()
const router = useRouter()
const cardStore = useCardStore()
const userStore = useUserStore()

const cardId = computed(() => route.params.cardId as string)
const loading = ref(false)
const card = ref<CardOverviewItem | null>(null)

// Check if user can access tag management (resident/family cannot)
const canAccessTagManagement = computed(() => {
  return userStore.hasPagePermission('/admin/tags')
})

// Alarm tabs
const activeKey = ref('pending')
const pendingDateRange = ref<[Dayjs, Dayjs] | null>(null)
const resolvedDateRange = ref<[Dayjs, Dayjs] | null>(null)
const ranges = {
  Today: [dayjs(), dayjs()] as [Dayjs, Dayjs],
  'This Month': [dayjs().startOf('month'), dayjs().endOf('month')] as [Dayjs, Dayjs],
}

// Alarm columns (same as AlarmRecord.vue)
const baseColumns = [
  {
    title: 'Time',
    dataIndex: 'triggered_at',
    key: 'triggered_at',
    width: 180,
    sorter: true,
  },
  {
    title: 'Resident',
    dataIndex: 'resident_name',
    key: 'resident_name',
    width: 150,
  },
  {
    title: 'Address',
    dataIndex: 'address_display',
    key: 'address_display',
    width: 200,
  },
  {
    title: 'DeviceName',
    dataIndex: 'device_name',
    key: 'device_name',
    width: 150,
  },
  {
    title: 'Alarm_Event',
    dataIndex: 'event_type',
    key: 'event_type',
    width: 200,
  },
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    width: 120,
  },
  {
    title: 'Severity',
    dataIndex: 'alarm_level',
    key: 'alarm_level',
    width: 120,
  },
]

const pendingColumns = [
  ...baseColumns,
  {
    title: 'Operation',
    key: 'operation',
    width: 120,
    fixed: 'right' as const,
  },
]

const resolvedColumns = [
  ...baseColumns,
  {
    title: 'Handling State',
    dataIndex: 'handling_state',
    key: 'handling_state',
    width: 150,
  },
  {
    title: 'Handling Details',
    dataIndex: 'handling_details',
    key: 'handling_details',
    width: 200,
  },
  {
    title: 'Remarks',
    dataIndex: 'handling_details',
    key: 'remarks',
    width: 200,
  },
  {
    title: 'Handler',
    dataIndex: 'handler_name',
    key: 'handler_name',
    width: 150,
  },
  {
    title: 'Handling Time',
    dataIndex: 'handled_at',
    key: 'handled_at',
    width: 180,
    sorter: true,
  },
]

const filters = {
  eventTypes: [
    { value: 'Fall', label: 'Fall' },
    { value: 'Radar_AbnormalHeartRate', label: 'Radar Abnormal Heart Rate' },
    { value: 'Radar_AbnormalRespiratoryRate', label: 'Radar Abnormal Respiratory Rate' },
    { value: 'Radar_ApneaHypopnea', label: 'Radar Apnea/Hypopnea' },
    { value: 'Radar_LeftBed', label: 'Radar Left Bed' },
    { value: 'SleepPad_LeftBed', label: 'SleepPad Left Bed' },
    { value: 'SleepPad_ApneaHypopnea', label: 'SleepPad Apnea/Hypopnea' },
    { value: 'SleepPad_AbnormalHeartRate', label: 'SleepPad Abnormal Heart Rate' },
    { value: 'SleepPad_AbnormalRespiratoryRate', label: 'SleepPad Abnormal Respiratory Rate' },
    { value: 'OfflineAlarm', label: 'Offline Alarm' },
    { value: 'LowBattery', label: 'Low Battery' },
    { value: 'DeviceFailure', label: 'Device Failure' },
    { value: 'Other', label: 'Other' },
  ],
  categories: [
    { value: 'safety', label: 'Safety' },
    { value: 'clinical', label: 'Clinical' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'device', label: 'Device' },
  ],
  alarmLevels: [
    { value: '0', label: 'EMERG' },
    { value: '1', label: 'ALERT' },
    { value: '2', label: 'CRIT' },
    { value: '3', label: 'ERR' },
    { value: '4', label: 'WARNING' },
  ],
}

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0
  const birthDate = dayjs(dateOfBirth)
  const today = dayjs()
  return today.diff(birthDate, 'year')
}

/**
 * Check if resident has emergency contacts
 */
const hasEmergencyContacts = (resident: CardOverviewItem['residents'][0]): boolean => {
  return !!(resident.contacts && resident.contacts.filter(c => c.relationship !== 'Caregiver').length > 0)
}

/**
 * Get emergency contacts (excluding Caregiver relationship)
 */
const getEmergencyContacts = (resident: CardOverviewItem['residents'][0]) => {
  if (!resident.contacts) return []
  return resident.contacts.filter(c => c.relationship !== 'Caregiver')
}

/**
 * Format contact name
 */
const formatContactName = (contact: NonNullable<CardOverviewItem['residents'][0]['contacts']>[0]): string => {
  if (contact.contact_first_name && contact.contact_last_name) {
    return `${contact.contact_first_name} ${contact.contact_last_name}`
  }
  return contact.contact_first_name || contact.contact_last_name || '-'
}

/**
 * Get unique key for contact
 */
const getContactKey = (contact: NonNullable<CardOverviewItem['residents'][0]['contacts']>[0]): string => {
  return contact.contact_id || `${contact.contact_first_name}_${contact.contact_last_name}_${contact.contact_phone}` || 'unknown'
}

/**
 * Load card detail
 */
const loadCardDetail = async () => {
  loading.value = true
  try {
    // Try to get from cache first
    let cardData = cardStore.getCard(cardId.value)
    
    // If not in cache, load from API
    if (!cardData) {
      cardData = await cardStore.loadCardDetail(cardId.value) || null
    }
    
    if (cardData) {
      card.value = cardData
    } else {
      card.value = null
      message.error('Card not found')
    }
  } catch (error: any) {
    console.error('Failed to load card detail:', error)
    message.error(error?.message || 'Failed to load card detail')
  } finally {
    loading.value = false
  }
}

/**
 * Navigate to sleep report
 */
const goSleepReport = (device: CardOverviewDevice) => {
  const url = device.device_type === 1
    ? `/reports/daily-report-sleepace/${device.device_id}`
    : `/reports/daily-report-radar/${device.device_id}`
  router.push(url)
}

/**
 * Navigate to monitor settings
 */
const goMonitorSetting = (device: CardOverviewDevice) => {
  const url = device.device_type === 1
    ? `/settings/monitor/sleepace/${device.device_id}`
    : `/settings/monitor/radar/${device.device_id}`
  router.push(url)
}

/**
 * Navigate to radar trajectory
 */
const goRadarTrajectory = (device: CardOverviewDevice) => {
  if (!card.value) return
  
  // Store card data for trajectory page
  // Note: You may need to create a trajectory store or pass data via route state
  router.push({
    name: 'RadarTrajectory',
    params: {
      cardId: cardId.value,
      deviceId: device.device_id,
    },
  })
}

/**
 * Navigate to tag management
 */
const goToTagManagement = () => {
  router.push({
    name: 'TagList',
  })
}

/**
 * Tab change handler
 */
const tabChange = (key: string) => {
  activeKey.value = key
}

/**
 * Search handlers
 */
const pendingSearch = () => {
  // AlarmRecordList component will handle the search
}

const resolvedSearch = () => {
  // AlarmRecordList component will handle the search
}

// Initialize
onMounted(() => {
  loadCardDetail()
})
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.custom-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  padding: 16px;
}

/* Resident Container */
.resident-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
}

.resident-container:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
  padding-bottom: 16px;
}

/* Info Row - 3 rows layout */
.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  font-size: 14px;
  line-height: 1.6;
}

.info-row .separator {
  margin: 0 8px;
  color: #d9d9d9;
}

/* Row 1: card_name | resident' sex/old | card_address */
.row-1 {
  font-size: 16px;
  font-weight: 500;
}

.row-1 .card-name {
  color: #333;
  font-weight: 600;
}

.row-1 .resident-info {
  color: #666;
}

.row-1 .card-address {
  color: #333;
}

/* Row 2: caregivers_tags:member   caregivers: */
.row-2 {
  color: #333;
}

.row-2 .label {
  color: #666;
  font-weight: 500;
  margin-right: 4px;
}

.row-2 .caregiver-group-item,
.row-2 .caregiver-item {
  display: inline-flex;
  align-items: center;
}

.row-2 .group-name,
.row-2 .caregiver-name {
  color: #333;
}

.row-2 .group-name-link {
  color: #1890ff;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}

.row-2 .group-name-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.row-2 .caregiver-contact {
  color: #999;
  font-size: 12px;
  margin-left: 4px;
}

.row-2 .separator {
  margin: 0 4px;
}

/* Row 3: Emergency'nickname/Relationship/mobile */
.row-3 {
  color: #333;
}

.row-3 .label {
  color: #666;
  font-weight: 500;
  margin-right: 4px;
}

.row-3 .contact-item {
  display: inline-flex;
  align-items: center;
}

.row-3 .contact-nickname,
.row-3 .contact-relationship,
.row-3 .contact-mobile {
  color: #333;
}

.row-3 .separator {
  margin: 0 4px;
}

/* Device Settings */
.settings {
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.settings:hover {
  background-color: #f5f5f5;
}
</style>

