<template>
  <div class="alarm-record-list">
    <!-- Search and Filter Section -->
    <div class="search-filter-section">
      <a-form layout="inline" class="search-form">
        <!-- Time Range -->
        <a-form-item label="Time">
          <a-range-picker
            v-model:value="dateRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 400px"
            @change="handleDateRangeChange"
          />
        </a-form-item>

        <!-- Resident Search -->
        <a-form-item label="Resident">
          <a-input
            v-model:value="searchParams.resident"
            placeholder="Search by resident name"
            style="width: 120px"
            allow-clear
            @pressEnter="handleSearch"
          />
        </a-form-item>

        <!-- location_tag Search -->
        <a-form-item label="location_tag">
          <a-input
            v-model:value="searchParams.location_tag"
            placeholder="Search by location tag"
            style="width: 120px"
            allow-clear
            @pressEnter="handleSearch"
          />
        </a-form-item>

        <!-- UnitName Search -->
        <a-form-item label="UnitName">
          <a-input
            v-model:value="searchParams.unit_name"
            placeholder="Search by unit name"
            style="width: 120px"
            allow-clear
            @pressEnter="handleSearch"
          />
        </a-form-item>

        <!-- DeviceName Search -->
        <a-form-item label="DeviceName">
          <a-input
            v-model:value="searchParams.device_name"
            placeholder="Search by device name"
            style="width: 120px"
            allow-clear
            @pressEnter="handleSearch"
          />
        </a-form-item>

        <!-- Search Button -->
        <a-form-item>
          <a-button type="primary" @click="handleSearch">Search</a-button>
        </a-form-item>

        <!-- Reset Button -->
        <a-form-item>
          <a-button @click="handleReset">Reset</a-button>
        </a-form-item>
      </a-form>

    </div>

    <!-- Table Section -->
    <a-table
      :dataSource="dataSource"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      :scroll="{ x: 'max-content' }"
      class="alarm-table"
      @change="handleTableChange"
    >
      <template #headerCell="{ column }">
        <!-- Alarm_Event column: with filter -->
        <template v-if="column.key === 'event_type'">
          <div class="filter-header-cell">
            <span>{{ column.title }}</span>
            <a-dropdown :trigger="['click']" v-model:open="eventTypeFilterOpen">
              <template #overlay>
                <a-menu class="filter-menu">
                  <a-menu-item v-for="option in eventTypeOptions" :key="option.value">
                    <a-checkbox
                      :checked="eventTypeFilter.includes(option.value)"
                      @change="handleEventTypeFilterChange(option.value, $event)"
                    >
                      {{ option.label }}
                    </a-checkbox>
                  </a-menu-item>
                </a-menu>
              </template>
              <FilterOutlined class="filter-icon" />
            </a-dropdown>
          </div>
        </template>
        <!-- Category column: with filter -->
        <template v-else-if="column.key === 'category'">
          <div class="filter-header-cell">
            <span>{{ column.title }}</span>
            <a-dropdown :trigger="['click']" v-model:open="categoryFilterOpen">
              <template #overlay>
                <a-menu class="filter-menu">
                  <a-menu-item v-for="option in categoryOptions" :key="option.value">
                    <a-checkbox
                      :checked="categoryFilter.includes(option.value)"
                      @change="handleCategoryFilterChange(option.value, $event)"
                    >
                      {{ option.label }}
                    </a-checkbox>
                  </a-menu-item>
                </a-menu>
              </template>
              <FilterOutlined class="filter-icon" />
            </a-dropdown>
          </div>
        </template>
        <!-- Severity column: with filter -->
        <template v-else-if="column.key === 'alarm_level'">
          <div class="filter-header-cell">
            <span>{{ column.title }}</span>
            <a-dropdown :trigger="['click']" v-model:open="severityFilterOpen">
              <template #overlay>
                <a-menu class="filter-menu">
                  <a-menu-item v-for="option in alarmLevelOptions" :key="option.value">
                    <a-checkbox
                      :checked="severityFilter.includes(option.value)"
                      @change="handleSeverityFilterChange(option.value, $event)"
                    >
                      {{ option.label }}
                    </a-checkbox>
                  </a-menu-item>
                </a-menu>
              </template>
              <FilterOutlined class="filter-icon" />
            </a-dropdown>
          </div>
        </template>
        <!-- Other columns: display title -->
        <template v-else>
          {{ column.title }}
        </template>
      </template>
      <template #bodyCell="{ column, record }">
        <!-- AlarmTime -->
        <template v-if="column.key === 'triggered_at'">
          {{ formatDateTime(record.triggered_at) }}
        </template>

        <!-- Resident -->
        <template v-else-if="column.key === 'resident_name'">
          {{ record.resident_name || '-' }}
        </template>

        <!-- UnitName (Address Display) -->
        <template v-else-if="column.key === 'address_display'">
          {{ formatAddress(record) }}
        </template>

        <!-- DeviceName -->
        <template v-else-if="column.key === 'device_name'">
          {{ record.device_name || '-' }}
        </template>

        <!-- Alarm_Event -->
        <template v-else-if="column.key === 'event_type'">
          {{ formatEventType(record.event_type) }}
        </template>

        <!-- Category -->
        <template v-else-if="column.key === 'category'">
          <span :style="{ color: getCategoryColor(record.category) }">
            {{ formatCategory(record.category) }}
          </span>
        </template>

        <!-- Severity -->
        <template v-else-if="column.key === 'alarm_level'">
          <span :style="{ color: getSeverityColor(record.alarm_level) }">
            {{ formatSeverity(record.alarm_level) }}
          </span>
        </template>

        <!-- Handling State (for resolved alarms) -->
        <template v-else-if="column.key === 'handling_state'">
          {{ formatHandlingState(record.handling_state) }}
        </template>

        <!-- Handling Details (for resolved alarms) -->
        <template v-else-if="column.key === 'handling_details'">
          {{ record.handling_details || '-' }}
        </template>

        <!-- Remarks (for resolved alarms) -->
        <template v-else-if="column.key === 'remarks'">
          {{ record.handling_details || '-' }}
        </template>

        <!-- Handler (for resolved alarms) -->
        <template v-else-if="column.key === 'handler_name'">
          {{ record.handler_name || '-' }}
        </template>

        <!-- Handling Time (for resolved alarms) -->
        <template v-else-if="column.key === 'handled_at'">
          {{ record.handled_at ? formatDateTime(record.handled_at) : '-' }}
        </template>

        <!-- Operation -->
        <template v-else-if="column.key === 'operation'">
          <a-button 
            v-if="status === 'active' && canHandleAlarm(record)"
            size="small" 
            type="primary"
            @click="openHandleModal(record)"
          >
            Handle
          </a-button>
          <span 
            v-else-if="status === 'active' && !canHandleAlarm(record)" 
            style="color: #999; font-size: 12px;"
            :title="getPermissionDeniedReason(record)"
          >
            No permission
          </span>
        </template>
      </template>
    </a-table>

    <!-- Handle Alarm Modal -->
    <a-modal
      v-model:visible="isHandleModalVisible"
      title="Handle Alarm"
      width="600px"
      @cancel="handleCancelHandle"
    >
      <template #footer>
        <div style="padding: 10px 16px; display: flex; justify-content: flex-end; gap: 12px">
          <a-button @click="handleCancelHandle">Cancel</a-button>
          <a-button type="primary" @click="handleConfirmHandle" :loading="handling">
            Confirm
          </a-button>
        </div>
      </template>

      <div v-if="selectedAlarm" class="modal-content-wrapper">
        <!-- Alarm Information Display -->
        <div class="alarm-info-section">
          <div class="info-item">
            <span class="info-label">Residents:</span>
            <span class="info-value">
              {{ formatResidentInfo(selectedAlarm) }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Address:</span>
            <span class="info-value">
              {{ formatAddressForModal(selectedAlarm) }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Device:</span>
            <span class="info-value">
              {{ formatDeviceInfo(selectedAlarm) }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Alarm Event:</span>
            <span class="info-value">
              {{ formatEventType(selectedAlarm.event_type) }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Alarm Time:</span>
            <span class="info-value">
              {{ formatDateTimeLocal(selectedAlarm.triggered_at) }}
            </span>
          </div>
        </div>

        <!-- Warning Message -->
        <div class="warning-message">
          <p style="margin: 0; color: #faad14">
            * Please check the actual situation of the resident before removing the alarm:
          </p>
        </div>

        <!-- Handle Type Buttons -->
        <div class="handle-type-section">
          <a-radio-group v-model:value="handleType" button-style="solid" class="handle-type-radio-group">
            <a-radio-button value="verified" class="handle-type-button">
              Verified and processed
            </a-radio-button>
            <a-radio-button value="false_alarm" class="handle-type-button">
              False Alarm
            </a-radio-button>
            <a-radio-button value="test" class="handle-type-button">
              Test
            </a-radio-button>
          </a-radio-group>
        </div>

        <!-- Remarks -->
        <div class="remarks-section">
          <a-form-item label="Remarks:" class="remarks-form-item">
            <a-textarea
              v-model:value="remarks"
              placeholder="Please enter remarks"
              :rows="7"
              :maxlength="600"
              show-count
            />
          </a-form-item>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { FilterOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { getAlarmEventsApi, handleAlarmEventApi } from '@/api/alarm/alarm'
import type { AlarmEvent, GetAlarmEventsParams } from '@/api/alarm/model/alarmModel'
import { useUserStore } from '@/store/modules/user'
import { useCardStore } from '@/store/modules/card'
import { canHandleAlarm as checkCanHandleAlarm, getPermissionDeniedReason as getDeniedReason } from '@/utils/alarmPermission'

interface Props {
  status: 'active' | 'resolved'
  columns: any[]
  filters: {
    eventTypes: Array<{ value: string; label: string }>
    categories: Array<{ value: string; label: string }>
    alarmLevels: Array<{ value: string; label: string }>
  }
  cardId?: string  // Optional: Filter alarms by card_id (via device_ids)
}

const props = defineProps<Props>()

// Stores
const userStore = useUserStore()
const cardStore = useCardStore()

// Data
const loading = ref(false)
const dataSource = ref<AlarmEvent[]>([])

// Handle Modal
const isHandleModalVisible = ref(false)
const selectedAlarm = ref<AlarmEvent | null>(null)
const handleType = ref<'verified' | 'false_alarm' | 'test'>('verified')
const remarks = ref('')
const handling = ref(false)

// Search parameters
const searchParams = ref({
  resident: '',
  location_tag: '',
  unit_name: '',
  device_name: '',
})

// Date range
const dateRange = ref<[Dayjs, Dayjs] | null>(null)

// Filter dropdown open states
const eventTypeFilterOpen = ref(false)
const categoryFilterOpen = ref(false)
const severityFilterOpen = ref(false)

// Filter options
const eventTypeOptions = computed(() => props.filters.eventTypes)
const categoryOptions = computed(() => props.filters.categories)
const alarmLevelOptions = computed(() => props.filters.alarmLevels)

// Filter arrays - initialize with all options selected by default
// Note: Severity filter excludes '5' (NOTICE), '6' (INFO), and '7' (DEBUG) by default
const eventTypeFilter = ref<string[]>(props.filters.eventTypes.map((option) => option.value))
const categoryFilter = ref<string[]>(props.filters.categories.map((option) => option.value))
const severityFilter = ref<string[]>(
  props.filters.alarmLevels
    .filter((option) => option.value !== '5' && option.value !== '6' && option.value !== '7')
    .map((option) => option.value)
)

// Pagination
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `Total ${total} items`,
})

// Format functions
const formatDateTime = (timestamp: number): string => {
  return dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
}

const formatAddress = (record: AlarmEvent): string => {
  const parts: string[] = []
  if (record.location_tag) {
    parts.push(record.location_tag)
  }
  if (record.building) {
    parts.push(record.building)
  }
  if (record.unit_name) {
    parts.push(record.unit_name)
  }
  return parts.length > 0 ? parts.join('-') : '-'
}

const formatEventType = (eventType: string): string => {
  // Convert event_type to readable format
  return eventType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const formatCategory = (category?: string): string => {
  if (!category) return '-'
  const map: Record<string, string> = {
    safety: 'Safety',
    clinical: 'Clinical',
    behavioral: 'Behavioral',
    device: 'Device',
  }
  return map[category] || category
}

const formatSeverity = (level: string | number): string => {
  const levelStr = String(level)
  const map: Record<string, string> = {
    '0': 'EMERG',
    '1': 'ALERT',
    '2': 'CRIT',
    '3': 'ERR',
    '4': 'WARNING',
    '5': 'NOTICE',
    '6': 'INFO',
    '7': 'DEBUG',
    EMERG: 'EMERG',
    ALERT: 'ALERT',
    CRIT: 'CRIT',
    ERR: 'ERR',
    WARNING: 'WARNING',
    NOTICE: 'NOTICE',
    INFO: 'INFO',
    INFORMATION: 'INFO', // Support legacy format
    DEBUG: 'DEBUG',
  }
  return map[levelStr] || levelStr
}

const formatHandlingState = (state?: string): string => {
  if (!state) return '-'
  const map: Record<string, string> = {
    verified: 'Verified and processed',
    false_alarm: 'False Alarm',
    test: 'Test',
  }
  return map[state] || state
}

// Format functions for Modal
const formatResidentInfo = (record: AlarmEvent): string => {
  const parts: string[] = []
  if (record.resident_network) {
    parts.push(record.resident_network)
  }
  if (record.resident_gender) {
    parts.push(record.resident_gender === 'M' || record.resident_gender === 'Male' ? 'Male' : 'Female')
  }
  if (record.resident_age !== undefined && record.resident_age !== null) {
    parts.push(`${record.resident_age} years old`)
  }
  return parts.length > 0 ? parts.join(' / ') : (record.resident_name || '-')
}

const formatAddressForModal = (record: AlarmEvent): string => {
  // Full address format for modal: location_tag-building-floor-area_tag-unit_name-room-bed
  // Device alarm should show complete device location information
  const parts: string[] = []
  
  if (record.location_tag) {
    parts.push(record.location_tag)
  }
  if (record.building) {
    parts.push(record.building)
  }
  if (record.floor) {
    parts.push(record.floor)
  }
  if (record.area_tag) {
    parts.push(record.area_tag)
  }
  if (record.unit_name) {
    parts.push(record.unit_name)
  }
  if (record.room_name) {
    parts.push(record.room_name)
  }
  if (record.bed_name) {
    parts.push(record.bed_name)
  }
  
  return parts.length > 0 ? parts.join('-') : '-'
}

const formatDeviceInfo = (record: AlarmEvent): string => {
  const parts: string[] = []
  if (record.device_name) {
    parts.push(record.device_name)
  }
  if (record.device_id) {
    // Show last 8 characters of device_id as serial number
    const serial = record.device_id.length > 8 
      ? record.device_id.slice(-8).toUpperCase()
      : record.device_id.toUpperCase()
    parts.push(`(${serial})`)
  }
  return parts.length > 0 ? parts.join(' ') : '-'
}

const formatDateTimeLocal = (timestamp: number): string => {
  // Format with local timezone
  return dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
}

const getCategoryColor = (category?: string): string => {
  if (!category) return '#000000'
  const map: Record<string, string> = {
    safety: '#ff4d4f', // red
    clinical: '#ff7875', // volcano/orange-red
    behavioral: '#ffa940', // orange
    device: '#1890ff', // blue
  }
  return map[category] || '#000000'
}

const getSeverityColor = (level: string | number): string => {
  if (level === undefined || level === null) return '#000000'
  const levelStr = String(level)
  const map: Record<string, string> = {
    '0': '#ff4d4f', // EMERG - red
    '1': '#ff4d4f', // ALERT - red
    '2': '#ff7875', // CRIT - volcano
    '3': '#ffa940', // ERR - orange
    '4': '#faad14', // WARNING - gold
    '5': '#52c41a', // NOTICE - green
    '6': '#1890ff', // INFO - blue
    '7': '#8c8c8c', // DEBUG - gray
    EMERG: '#ff4d4f',
    ALERT: '#ff4d4f',
    CRIT: '#ff7875',
    ERR: '#ffa940',
    WARNING: '#faad14',
    NOTICE: '#52c41a',
    INFO: '#1890ff',
    INFORMATION: '#1890ff', // Support legacy format
    DEBUG: '#8c8c8c',
  }
  return map[levelStr] || '#000000'
}

/**
 * Check if user can handle alarm (using utility function)
 */
const canHandleAlarm = (record: AlarmEvent): boolean => {
  return checkCanHandleAlarm(record, cardStore, userStore)
}

/**
 * Get permission denied reason (using utility function)
 */
const getPermissionDeniedReason = (record: AlarmEvent): string => {
  return getDeniedReason(record, cardStore, userStore)
}

// Handlers
const handleDateRangeChange = () => {
  handleSearch()
}

const handleSearch = () => {
  pagination.value.current = 1
  fetchData()
}

const handleReset = () => {
  searchParams.value = {
    resident: '',
    location_tag: '',
    unit_name: '',
    device_name: '',
  }
  dateRange.value = null
  // Reset to all options selected (except NOTICE, INFO, and DEBUG for severity)
  eventTypeFilter.value = props.filters.eventTypes.map((option) => option.value)
  categoryFilter.value = props.filters.categories.map((option) => option.value)
  severityFilter.value = props.filters.alarmLevels
    .filter((option) => option.value !== '5' && option.value !== '6' && option.value !== '7')
    .map((option) => option.value)
  pagination.value.current = 1
  fetchData()
}

// Handle filter changes
const handleEventTypeFilterChange = (value: string, event: any) => {
  if (event.target.checked) {
    if (!eventTypeFilter.value.includes(value)) {
      eventTypeFilter.value.push(value)
    }
  } else {
    eventTypeFilter.value = eventTypeFilter.value.filter((v) => v !== value)
  }
  pagination.value.current = 1
  fetchData()
}

const handleCategoryFilterChange = (value: string, event: any) => {
  if (event.target.checked) {
    if (!categoryFilter.value.includes(value)) {
      categoryFilter.value.push(value)
    }
  } else {
    categoryFilter.value = categoryFilter.value.filter((v) => v !== value)
  }
  pagination.value.current = 1
  fetchData()
}

const handleSeverityFilterChange = (value: string, event: any) => {
  if (event.target.checked) {
    if (!severityFilter.value.includes(value)) {
      severityFilter.value.push(value)
    }
  } else {
    severityFilter.value = severityFilter.value.filter((v) => v !== value)
  }
  pagination.value.current = 1
  fetchData()
}

const handleTableChange = (pag: any, _filters: any, sorter: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  fetchData()
}

const openHandleModal = (record: AlarmEvent) => {
  selectedAlarm.value = record
  handleType.value = 'verified'
  remarks.value = ''
  isHandleModalVisible.value = true
}

const handleCancelHandle = () => {
  isHandleModalVisible.value = false
  selectedAlarm.value = null
  handleType.value = 'verified'
  remarks.value = ''
}

const handleConfirmHandle = async () => {
  if (!selectedAlarm.value) return

  handling.value = true
  try {
    // Handle alarm: update status from 'active' to 'resolved'
    await handleAlarmEventApi(selectedAlarm.value.event_id, {
      alarm_status: 'resolved',
      handle_type: handleType.value,
      remarks: remarks.value || undefined,
    })
    message.success('Alarm handled successfully')
    handleCancelHandle()
    await fetchData()
  } catch (error: any) {
    console.error('Failed to handle alarm:', error)
    message.error(error?.message || 'Failed to handle alarm')
  } finally {
    handling.value = false
  }
}

// Fetch data
const fetchData = async () => {
  loading.value = true
  try {
    const params: GetAlarmEventsParams = {
      status: props.status,
      page: pagination.value.current,
      page_size: pagination.value.pageSize,
    }

    // If cardId is provided, filter by card_id (backend will filter by device_ids from the card)
    if (props.cardId) {
      params.card_id = props.cardId
    }

    // Add search parameters
    if (searchParams.value.resident) {
      params.resident = searchParams.value.resident
    }
    if (searchParams.value.location_tag) {
      params.location_tag = searchParams.value.location_tag
    }
    if (searchParams.value.unit_name) {
      params.unit_name = searchParams.value.unit_name
    }
    if (searchParams.value.device_name) {
      params.device_name = searchParams.value.device_name
    }

    // Add date range
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      params.alarm_time_start = dateRange.value[0].unix()
      params.alarm_time_end = dateRange.value[1].unix()
    }

    // Add filter parameters
    // Only send filter params if not all options are selected (to reduce API payload)
    const allEventTypesSelected = eventTypeFilter.value.length === eventTypeOptions.value.length
    const allCategoriesSelected = categoryFilter.value.length === categoryOptions.value.length
    const allSeveritySelected = severityFilter.value.length === alarmLevelOptions.value.length
    
    if (!allEventTypesSelected && eventTypeFilter.value.length > 0) {
      // Handle 'Other' filter: if 'Other' is selected, filter events that are not in known event types
      const hasOther = eventTypeFilter.value.includes('Other')
      const otherEventTypes = eventTypeFilter.value.filter((type) => type !== 'Other')
      
      if (hasOther && otherEventTypes.length > 0) {
        // Both 'Other' and specific types selected: combine results
        params.event_types = eventTypeFilter.value
      } else if (hasOther) {
        // Only 'Other' selected: filter for unknown event types
        params.event_types = ['Other'] // Special marker for backend
      } else {
        // Only specific types selected
        params.event_types = otherEventTypes
      }
    }
    if (!allCategoriesSelected && categoryFilter.value.length > 0) {
      params.categories = categoryFilter.value
    }
    if (!allSeveritySelected && severityFilter.value.length > 0) {
      params.alarm_levels = severityFilter.value
    }

    const result = await getAlarmEventsApi(params)
    dataSource.value = result.items || []
    pagination.value.total = result.pagination?.total || result.pagination?.count || 0

    // Preload card data for devices in alarm events (for permission checking)
    // Extract unique device_ids from alarm events
    const deviceIds = new Set<string>()
    result.items?.forEach(item => {
      if (item.device_id) {
        deviceIds.add(item.device_id)
      }
    })

    // Load cards for these devices (if not already in cache)
    // Note: This is a background operation, doesn't block UI
    if (deviceIds.size > 0) {
      // Get unique card_ids from devices (if cards are already in cache)
      const cardIdsToLoad = new Set<string>()
      deviceIds.forEach(deviceId => {
        const card = cardStore.getCardByDeviceId(deviceId)
        if (!card) {
          // Card not in cache, need to load
          // We'll load all cards list which will populate the cache
          // In a real scenario, you might want a batch API to load cards by device_ids
        }
      })

      // If many cards are missing, load cards list to populate cache
      // This is a best-effort optimization, permission check will still work with fallback
      if (cardIdsToLoad.size === 0 && cardStore.shouldRefreshList.value) {
        // Silently load cards list in background (don't await, don't show loading)
        cardStore.loadCardsList().catch(err => {
          console.warn('Failed to preload cards for permission check:', err)
        })
      }
    }
  } catch (error: any) {
    console.error('Failed to fetch alarm events:', error)
    message.error(error?.message || 'Failed to fetch alarm events')
    dataSource.value = []
  } finally {
    loading.value = false
  }
}

// Watch status change
watch(
  () => props.status,
  () => {
    pagination.value.current = 1
    fetchData()
  },
  { immediate: true }
)

// Initialize
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.alarm-record-list {
  padding: 20px 0;
}

.search-filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 4px;
}

.search-form {
  margin-bottom: 16px;
}

.alarm-table {
  background: white;
  border-radius: 4px;
}

.filter-header-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-icon {
  cursor: pointer;
  color: #1890ff;
  font-size: 14px;
}

.filter-icon:hover {
  color: #40a9ff;
}

.filter-menu {
  min-width: 200px;
}

/* Handle Modal Styles */
.alarm-info-section {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
  align-items: flex-start;
}

.info-label {
  min-width: 120px;
  font-weight: 500;
  color: #666;
}

.info-value {
  flex: 1;
  color: #000;
}

.warning-message {
  margin: 20px 0;
  padding: 12px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
}

.handle-type-section {
  margin: 20px 0;
}

.handle-type-radio-group {
  width: 100%;
  display: flex;
  gap: 10px;
}

.handle-type-radio-group :deep(.ant-radio-button-wrapper) {
  flex: 1;
  text-align: center;
  background-color: #f5f5f5;
}

.handle-type-radio-group :deep(.ant-radio-button-wrapper:hover) {
  background-color: #e6f7ff;
  border-color: #40a9ff;
}

.handle-type-radio-group :deep(.ant-radio-button-wrapper-checked) {
  background-color: #1890ff;
  border-color: #1890ff;
}

.handle-type-radio-group :deep(.ant-radio-button-wrapper-checked:hover) {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.modal-content-wrapper {
  padding: 20px 0 10px 0; /* 顶部 20px，底部 10px（从 20px 减小 10px） */
}

.remarks-section {
  margin-top: 20px;
  margin-bottom: 10px; /* 从 20px 改为 10px，减小 10px，总共减小 20px */
}

.remarks-form-item :deep(.ant-form-item-label) {
  display: block;
  margin-bottom: 8px;
}

.remarks-form-item :deep(.ant-form-item-control) {
  width: 100%;
}
</style>

