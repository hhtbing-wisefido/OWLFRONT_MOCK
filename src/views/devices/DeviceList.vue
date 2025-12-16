<template>
  <div style="padding: 15px">
    <!-- Search bar -->
    <div class="search-container">
      <a-form layout="inline" class="search-form">
        <!-- Back and Home Icons -->
        <a-form-item>
          <a-space>
            <a-button type="text" @click="goBack" :title="'Back'">
              <template #icon>
                <ArrowLeftOutlined />
              </template>
            </a-button>
            <a-button type="text" @click="goHome" :title="'Home'">
              <template #icon>
                <HomeOutlined />
              </template>
            </a-button>
          </a-space>
        </a-form-item>
        <a-form-item>
          <a-radio-group v-model:value="searchType" button-style="solid">
            <a-radio-button value="device_name">Name</a-radio-button>
            <a-radio-button value="serial_number">Serial</a-radio-button>
            <a-radio-button value="uid">UID</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item>
          <a-input
            v-model:value="searchKeyword"
            :placeholder="getSearchPlaceholder()"
            style="width: 300px"
            @pressEnter="handleSearch"
            allowClear
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">Search</a-button>
        </a-form-item>
      </a-form>
    </div>

    <!-- Device list table -->
    <a-table
      :dataSource="dataSource"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      :scroll="{ x: 'max-content' }"
      :bordered="true"
      class="device-table"
      @change="handleTableChange"
    >
      <template #headerCell="{ column }">
        <!-- Status column: with filter -->
        <template v-if="column.dataIndex === 'status'">
          <div class="status-header-cell">
            <span>{{ column.title }}</span>
            <a-dropdown :trigger="['click']" v-model:open="statusFilterOpen">
              <template #overlay>
                <a-menu class="status-filter-menu">
                  <a-menu-item v-for="statusOption in statusOptions" :key="statusOption.value">
                    <a-checkbox
                      :checked="statusFilter.includes(statusOption.value as 'online' | 'offline' | 'error' | 'disabled')"
                      @change="handleStatusFilterChange(statusOption.value as 'online' | 'offline' | 'error' | 'disabled', $event)"
                    >
                      {{ statusOption.label }}
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

      <template #bodyCell="{ column, record, text }">
        <!-- Device Name column: cell editing -->
        <template v-if="column.dataIndex === 'device_name'">
          <div class="device-name-cell">
            <a-input
              v-if="editingDeviceId === record.device_id && editingField === 'device_name'"
              v-model:value="editingValue"
              @blur="handleSaveEdit(record)"
              @pressEnter="handleSaveEdit(record)"
              @keydown.esc="handleCancelEdit"
              style="width: 100%"
              autofocus
            />
            <span
              v-else
              class="editable-cell"
              @dblclick="handleStartEdit(record, 'device_name', text)"
            >
              {{ text || '-' }}
            </span>
          </div>
        </template>

        <!-- Business Access column: dropdown selection -->
        <template v-else-if="column.dataIndex === 'business_access'">
          <a-select
            v-model:value="record.business_access"
            @change="handleBusinessAccessChange(record, $event)"
            style="width: 120px"
          >
            <a-select-option
              v-for="option in businessAccessOptions"
              :key="option.value"
              :value="option.value"
            >
              <span :style="{ color: option.color }">{{ option.label }}</span>
            </a-select-option>
          </a-select>
        </template>

        <!-- Status column: tag display -->
        <template v-else-if="column.dataIndex === 'status'">
          <a-tag :color="getStatusColor(text)">
            {{ text }}
          </a-tag>
        </template>

        <!-- Monitor column: switch -->
        <template v-else-if="column.dataIndex === 'monitoring_enabled'">
          <a-switch
            v-model:checked="record.monitoring_enabled"
            @change="handleMonitoringChange(record, $event)"
          />
        </template>

        <!-- Delete column: delete button -->
        <template v-else-if="column.dataIndex === 'delete'">
          <a-tooltip title="Device can only be deleted when not in use, otherwise it will be disabled" :mouseEnterDelay="0.1">
            <a-button
              type="primary"
              @click="handleDelete(record)"
              :loading="deletingDeviceId === record.device_id"
              size="small"
            >
              DEL
            </a-button>
          </a-tooltip>
        </template>

        <!-- Other columns: direct display -->
        <template v-else>
          {{ text || '-' }}
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { FilterOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'
import { getDevicesApi, deleteDeviceApi, updateDeviceApi } from '@/api/devices/device'
import type { Device, GetDevicesParams } from '@/api/devices/model/deviceModel'
import { useUserStore } from '@/store/modules/user'
import type { TableProps } from 'ant-design-vue'
import { useDeviceEdit } from './composables/useDeviceEdit'

const router = useRouter()
const userStore = useUserStore()

// Navigate to home page
// Go back
const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/monitoring/overview')
}

// Data
const dataSource = ref<Device[]>([])
const loading = ref(false)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `Total ${total} devices`,
})

// Delete state
const deletingDeviceId = ref<string | null>(null)

// Search state
const searchType = ref<'device_name' | 'serial_number' | 'uid'>('device_name')
const searchKeyword = ref<string>('')

// Sort state
const sortField = ref<string | undefined>(undefined)
const sortDirection = ref<'asc' | 'desc' | undefined>(undefined)

// Status filter
const statusFilterOpen = ref(false)
const statusFilter = ref<('online' | 'offline' | 'error' | 'disabled')[]>(['online', 'offline', 'error'])
const statusOptions = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'error', label: 'Error' },
  { value: 'disabled', label: 'Disabled' },
]

// Business Access options
const businessAccessOptions = [
  { value: 'pending', label: 'Pending', color: '#faad14' },
  { value: 'approved', label: 'Approved', color: '#52c41a' },
  { value: 'rejected', label: 'Rejected', color: '#ff4d4f' },
]

// Table column definitions
const columns = [
  {
    title: 'Device Name',
    dataIndex: 'device_name',
    key: 'device_name',
    width: 200,
    sorter: true,
  },
  {
    title: 'Device Type',
    dataIndex: 'device_type',
    key: 'device_type',
    width: 150,
    sorter: true,
  },
  {
    title: 'Device Model',
    dataIndex: 'device_model',
    key: 'device_model',
    width: 200,
    sorter: true,
  },
  {
    title: 'Serial Number',
    dataIndex: 'serial_number',
    key: 'serial_number',
    width: 150,
    sorter: true,
  },
  {
    title: 'UID',
    dataIndex: 'uid',
    key: 'uid',
    width: 150,
    sorter: true,
  },
  {
    title: 'IMEI',
    dataIndex: 'imei',
    key: 'imei',
    width: 120,
    sorter: true,
  },
  {
    title: 'Comm Mode',
    dataIndex: 'comm_mode',
    key: 'comm_mode',
    width: 120,
    sorter: true,
  },
  {
    title: 'Firmware Version',
    dataIndex: 'firmware_version',
    key: 'firmware_version',
    width: 120,
    sorter: true,
  },
  {
    title: 'MCU Model',
    dataIndex: 'mcu_model',
    key: 'mcu_model',
    width: 150,
    sorter: true,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    sorter: true,
  },
  {
    title: 'Monitor',
    dataIndex: 'monitoring_enabled',
    key: 'monitoring_enabled',
    width: 80,
    sorter: true,
  },
  {
    title: 'Business Access',
    dataIndex: 'business_access',
    key: 'business_access',
    width: 120,
    sorter: true,
  },
  {
    title: 'Action',
    dataIndex: 'delete',
    key: 'delete',
    width: 100,
    fixed: 'right',
  },
]

// Get device list
const fetchDevices = async () => {
  loading.value = true
  try {
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    const params: GetDevicesParams = {
      tenant_id: tenantId,
      status: statusFilter.value,
      page: pagination.value.current,
      size: pagination.value.pageSize,
    }

    // Add search parameters
    if (searchKeyword.value.trim()) {
      params.search_type = searchType.value
      params.search_keyword = searchKeyword.value.trim()
    }

    // Note: Sorting is handled on frontend, do not pass sort parameters to server
    const result = await getDevicesApi(params)
    dataSource.value = result.items
    pagination.value.total = result.total
    
    // If there are sort conditions, sort the data
    if (sortField.value && sortDirection.value) {
      applySort()
    }
  } catch (error: any) {
    console.error('Failed to fetch devices:', error)
    message.error(error?.message || 'Failed to fetch devices')
  } finally {
    loading.value = false
  }
}

// Apply sorting (frontend sorting)
const applySort = () => {
  if (!sortField.value || !sortDirection.value) return
  
  dataSource.value.sort((a, b) => {
    const aValue = (a as any)[sortField.value!]
    const bValue = (b as any)[sortField.value!]
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1
    
    // String comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue)
      return sortDirection.value === 'asc' ? comparison : -comparison
    }
    
    // Number comparison
    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
}

// Use shared device edit composable (after fetchDevices is defined)
const {
  editingDeviceId,
  editingField,
  editingValue,
  handleStartEdit,
  handleSaveEdit,
  handleCancelEdit,
} = useDeviceEdit(fetchDevices)

// Handle table changes (sorting, pagination, etc.)
const handleTableChange: TableProps['onChange'] = (pag, _filters, sorter) => {
  // Update pagination
  if (pag) {
    pagination.value.current = pag.current || 1
    pagination.value.pageSize = pag.pageSize || 10
    // Pagination change requires re-fetching data
    fetchDevices()
    return
  }

  // Handle sorting (frontend sorting, no need to re-request data)
  if (sorter) {
    if (Array.isArray(sorter)) {
      // Multi-column sorting (not supported yet, take the first one)
      if (sorter.length > 0) {
        const firstSorter = sorter[0]
        if (firstSorter && firstSorter.order) {
          sortField.value = firstSorter.field as string
          sortDirection.value = firstSorter.order === 'ascend' ? 'asc' : 'desc'
        } else {
          sortField.value = undefined
          sortDirection.value = undefined
        }
      }
    } else {
      // Single column sorting
      if (sorter.order) {
        sortField.value = sorter.field as string
        sortDirection.value = sorter.order === 'ascend' ? 'asc' : 'desc'
      } else {
        // Cancel sorting
        sortField.value = undefined
        sortDirection.value = undefined
      }
    }
    
    // Frontend sorting: directly sort current data
    if (sortField.value && sortDirection.value) {
      applySort()
    } else {
      // Cancel sorting, re-fetch data to restore original order
      fetchDevices()
    }
  }
}

// Handle Status filter changes
const handleStatusFilterChange = (value: 'online' | 'offline' | 'error' | 'disabled', event: any) => {
  if (event.target.checked) {
    if (!statusFilter.value.includes(value)) {
      statusFilter.value.push(value)
    }
  } else {
    statusFilter.value = statusFilter.value.filter((v) => v !== value)
  }
  // Re-fetch data
  pagination.value.current = 1
  fetchDevices()
}

// Device edit functions are now provided by useDeviceEdit composable

// Handle Business Access change
const handleBusinessAccessChange = async (record: Device, value: 'pending' | 'approved' | 'rejected') => {
  try {
    // If value hasn't changed, don't perform update
    if (record.business_access === value) {
      return
    }

    await updateDeviceApi(record.device_id, {
      business_access: value,
    })
    message.success('Business access updated successfully')
    await fetchDevices()
  } catch (error: any) {
    // Restore original value
    await fetchDevices()
    message.error(error?.message || 'Failed to update business access')
  }
}

// Handle delete (change status to disabled)
const handleDelete = async (record: Device) => {
  try {
    deletingDeviceId.value = record.device_id
    await updateDeviceApi(record.device_id, {
      status: 'disabled',
    })
    message.success('Device disabled successfully')
    await fetchDevices()
  } catch (error: any) {
    message.error(error?.message || 'Failed to disable device')
  } finally {
    deletingDeviceId.value = null
  }
}

// Handle monitoring change
const handleMonitoringChange = async (record: Device, checked: boolean) => {
  try {
    await updateDeviceApi(record.device_id, {
      monitoring_enabled: checked,
    })
    message.success('Monitoring status updated successfully')
    await fetchDevices()
  } catch (error: any) {
    // Restore original value
    await fetchDevices()
    message.error(error?.message || 'Failed to update monitoring status')
  }
}

// Get Status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'online':
      return 'green'
    case 'offline':
      return 'default'
    case 'error':
      return 'red'
    case 'disabled':
      return 'red'
    default:
      return 'default'
  }
}

// Get search box placeholder
const getSearchPlaceholder = (): string => {
  switch (searchType.value) {
    case 'device_name':
      return 'Enter device name'
    case 'serial_number':
      return 'Enter serial number'
    case 'uid':
      return 'Enter UID'
    default:
      return 'Enter search keyword'
  }
}

// Handle search
const handleSearch = () => {
  pagination.value.current = 1
  fetchDevices()
}

// Initialize
onMounted(() => {
  fetchDevices()
})
</script>

<style scoped>
.search-container {
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 4px;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 16px;
}

.device-table {
  background: white;
}

.status-header-cell {
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

.status-filter-menu {
  min-width: 150px;
}

.device-name-cell {
  position: relative;
}

.editable-cell {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  display: inline-block;
  background-color: #f0f0f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid #d9d9d9;
}

.editable-cell:hover {
  background-color: #e6f7ff;
  border-color: #40a9ff;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
}

.editable-cell:active {
  background-color: #bae7ff;
  border-color: #1890ff;
}
</style>

