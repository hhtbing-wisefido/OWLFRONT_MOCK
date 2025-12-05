<template>
  <div style="padding: 15px">
    <div class="form-container">
      <div class="form-left">
        <a-form layout="inline" class="flex-form">
          <!-- Back Icon -->
          <a-form-item>
            <a-button type="text" @click="goBack" style="padding: 0; border: none; box-shadow: none;">
              <template #icon>
                <ArrowLeftOutlined />
              </template>
            </a-button>
          </a-form-item>
          <!-- Home Icon -->
          <a-form-item>
            <a-button type="text" @click="goHome" style="padding: 0; border: none; box-shadow: none;">
              <template #icon>
                <HomeOutlined />
              </template>
            </a-button>
          </a-form-item>
          <!-- Search Input -->
          <a-form-item class="flex-grow">
            <a-input
              v-model:value="searchText"
              placeholder="Search by Serial Number, UID, or IMEI"
              style="width: 400px"
              :allowClear="true"
              @pressEnter="onSearch"
            />
          </a-form-item>

          <!-- Search Button -->
          <a-form-item>
            <a-button type="primary" @click="onSearch">Search</a-button>
          </a-form-item>

          <!-- Import Button -->
          <a-form-item>
            <a-button @click="handleImport">
              <template #icon>
                <UploadOutlined />
              </template>
              Import
            </a-button>
          </a-form-item>

          <!-- Export Button -->
          <a-form-item>
            <a-button @click="handleExport">
              <template #icon>
                <DownloadOutlined />
              </template>
              Export
            </a-button>
          </a-form-item>

          <!-- Save Button -->
          <a-form-item>
            <a-button type="primary" @click="handleSaveAll" :loading="saving" :disabled="!hasChanges">
              <template #icon>
                <SaveOutlined />
              </template>
              Save
            </a-button>
          </a-form-item>

          <!-- Refresh Button -->
          <a-form-item>
            <a-button @click="refreshData">
              <template #icon>
                <ReloadOutlined />
              </template>
              Refresh
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>

    <a-table
      :dataSource="filteredDataSource"
      :columns="columns"
      :loading="loading"
      :pagination="false"
      :scroll="{ x: 'max-content' }"
      class="device-store-table"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record, text }">
        <!-- Tenant: Dropdown (显示和选择 tenant_name，保存 tenant_id) -->
        <template v-if="column.dataIndex === 'tenant_name'">
          <a-select
            v-model:value="record.tenant_id"
            placeholder="Unallocated"
            style="width: 200px"
            allowClear
            @change="markAsChanged(record)"
            :show-search="true"
            :filter-option="filterTenantOption"
          >
            <a-select-option
              v-for="tenant in tenantList"
              :key="tenant.tenant_id"
              :value="tenant.tenant_id"
            >
              {{ tenant.tenant_name }}
            </a-select-option>
          </a-select>
        </template>

        <!-- OTA Target Version: Text Input -->
        <template v-else-if="column.dataIndex === 'ota_target_firmware_version'">
          <a-input
            v-model:value="record.ota_target_firmware_version"
            placeholder="Enter target version"
            style="width: 150px"
            @change="markAsChanged(record)"
          />
        </template>

        <!-- OTA Target MCU: Text Input -->
        <template v-else-if="column.dataIndex === 'ota_target_mcu_model'">
          <a-input
            v-model:value="record.ota_target_mcu_model"
            placeholder="Enter target MCU"
            style="width: 150px"
            @change="markAsChanged(record)"
          />
        </template>

        <!-- Allow Access: Switch -->
        <template v-else-if="column.dataIndex === 'allow_access'">
          <a-switch
            v-model:checked="record.allow_access"
            @change="markAsChanged(record)"
          />
        </template>

        <!-- Device Type: Tag -->
        <template v-else-if="column.dataIndex === 'device_type'">
          <a-tag :color="getDeviceTypeColor(text)">
            {{ text || '-' }}
          </a-tag>
        </template>

        <!-- Comm Mode: Tag -->
        <template v-else-if="column.dataIndex === 'comm_mode'">
          <a-tag>{{ text || '-' }}</a-tag>
        </template>

        <!-- Date fields: Format -->
        <template v-else-if="column.dataIndex === 'import_date' || column.dataIndex === 'allocate_time'">
          {{ formatDate(text) }}
        </template>

        <!-- Other fields: Direct display -->
        <template v-else>
          {{ text || '-' }}
        </template>
      </template>
    </a-table>

    <!-- Import Modal -->
    <a-modal
      v-model:visible="isImportModalVisible"
      title="Import Devices"
      width="600px"
      @ok="handleImportConfirm"
      @cancel="handleImportCancel"
    >
      <template #footer>
        <div style="padding: 10px 16px">
          <a-button key="back" @click="handleImportCancel" style="margin-right: 30px">Cancel</a-button>
          <a-button key="download" @click="downloadTemplate" style="margin-right: 20px">
            Download Template
          </a-button>
          <a-button key="submit" type="primary" @click="handleImportConfirm">
            Import
          </a-button>
        </div>
      </template>
      <a-upload
        v-model:file-list="fileList"
        :before-upload="beforeUpload"
        accept=".xlsx,.xls,.csv"
        :max-count="1"
      >
        <a-button>
          <template #icon>
            <UploadOutlined />
          </template>
          Select File
        </a-button>
      </a-upload>
      <div style="margin-top: 16px; color: #999; font-size: 12px">
        Supported formats: .xlsx, .xls, .csv
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  HomeOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  UploadOutlined,
  DownloadOutlined,
  SaveOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TableProps } from 'ant-design-vue'
import dayjs from 'dayjs'

// TODO: Import device store API when available
// import {
//   getDeviceStoresApi,
//   updateDeviceStoreApi,
//   importDeviceStoresApi,
//   exportDeviceStoresApi,
//   getImportTemplateApi,
// } from '@/api/admin/device-store/deviceStore'
// import type {
//   DeviceStore,
//   GetDeviceStoresParams,
//   UpdateDeviceStoreParams,
// } from '@/api/admin/device-store/model/deviceStoreModel'
// import { getTenantsApi } from '@/api/admin/tenant/tenant'

// Mock mode: In development, use mock data
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

const router = useRouter()

// Navigate back
const goBack = () => {
  router.go(-1)
}

// Navigate to home page
const goHome = () => {
  router.push('/monitoring/overview')
}

// Import types from mock data
import type { DeviceStore, Tenant } from '@test/admin/device-store/types'

const searchText = ref('')
const loading = ref(false)
const saving = ref(false)
const dataSource = ref<DeviceStore[]>([])
const filteredDataSource = ref<DeviceStore[]>([])
const tenantList = ref<Tenant[]>([])
const changedRecords = ref<Set<string>>(new Set()) // Track changed device_store_id
const isImportModalVisible = ref(false)
const fileList = ref<any[]>([])

// Sort state
const sortField = ref<string | undefined>(undefined)
const sortDirection = ref<'asc' | 'desc' | undefined>(undefined)

// Table columns
const columns = [
  {
    title: 'Device Type',
    dataIndex: 'device_type',
    key: 'device_type',
    sorter: true,
    width: 120,
  },
  {
    title: 'Device Model',
    dataIndex: 'device_model',
    key: 'device_model',
    sorter: true,
    width: 150,
  },
  {
    title: 'Serial Number',
    dataIndex: 'serial_number',
    key: 'serial_number',
    sorter: true,
    width: 150,
  },
  {
    title: 'UID',
    dataIndex: 'uid',
    key: 'uid',
    sorter: true,
    width: 150,
  },
  {
    title: 'IMEI',
    dataIndex: 'imei',
    key: 'imei',
    sorter: true,
    width: 120,
  },
  {
    title: 'Comm Mode',
    dataIndex: 'comm_mode',
    key: 'comm_mode',
    sorter: true,
    width: 120,
  },
  {
    title: 'MCU Model',
    dataIndex: 'mcu_model',
    key: 'mcu_model',
    sorter: true,
    width: 150,
  },
  {
    title: 'Firmware Version',
    dataIndex: 'firmware_version',
    key: 'firmware_version',
    sorter: true,
    width: 150,
  },
  {
    title: 'OTA Target Version',
    dataIndex: 'ota_target_firmware_version',
    key: 'ota_target_firmware_version',
    sorter: true,
    width: 180,
  },
  {
    title: 'OTA Target MCU',
    dataIndex: 'ota_target_mcu_model',
    key: 'ota_target_mcu_model',
    sorter: true,
    width: 150,
  },
  {
    title: 'Tenant',
    dataIndex: 'tenant_name', // 显示 tenant_name，但实际数据字段是 tenant_id
    key: 'tenant_id',
    sorter: true,
    width: 250,
  },
  {
    title: 'Allow Access',
    dataIndex: 'allow_access',
    key: 'allow_access',
    sorter: true,
    width: 120,
  },
  {
    title: 'Import Date',
    dataIndex: 'import_date',
    key: 'import_date',
    sorter: true,
    width: 180,
  },
  {
    title: 'Allocate Time',
    dataIndex: 'allocate_time',
    key: 'allocate_time',
    sorter: true,
    width: 180,
  },
]

// Check if there are changes
const hasChanges = computed(() => changedRecords.value.size > 0)

// Get device type color
const getDeviceTypeColor = (deviceType?: string): string => {
  const colorMap: Record<string, string> = {
    Radar: 'blue',
    SleepPad: 'green',
    VibrationSensor: 'orange',
    Gateway: 'purple',
    Other: 'default',
  }
  return colorMap[deviceType || ''] || 'default'
}

// Format date
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-'
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss')
}

// Mark record as changed
const markAsChanged = (record: DeviceStore) => {
  changedRecords.value.add(record.device_store_id)
}

// Filter tenant option for search
const filterTenantOption = (input: string, option: any) => {
  const tenant = tenantList.value.find((t) => t.tenant_id === option.value)
  if (!tenant) return false
  return tenant.tenant_name.toLowerCase().includes(input.toLowerCase())
}

// Search function
const onSearch = () => {
  if (!searchText.value || searchText.value.trim() === '') {
    applyFilters()
    return
  }
  const searchLower = searchText.value.toLowerCase().trim()
  filteredDataSource.value = dataSource.value.filter((device) => {
    return (
      (device.serial_number && device.serial_number.toLowerCase().includes(searchLower)) ||
      (device.uid && device.uid.toLowerCase().includes(searchLower)) ||
      (device.imei && device.imei.toLowerCase().includes(searchLower))
    )
  })
  applySort()
}

// Apply filters
const applyFilters = () => {
  filteredDataSource.value = [...dataSource.value]
  applySort()
}

// Apply sorting
const applySort = () => {
  if (!sortField.value || !sortDirection.value) return

  filteredDataSource.value.sort((a, b) => {
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

    // Boolean comparison
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortDirection.value === 'asc'
        ? (aValue === bValue ? 0 : aValue ? 1 : -1)
        : (aValue === bValue ? 0 : aValue ? -1 : 1)
    }

    // Number comparison
    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
}

// Handle table change (sorting)
const handleTableChange: TableProps['onChange'] = (_pag, _filters, sorter) => {
  if (sorter) {
    if (Array.isArray(sorter)) {
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
      if (sorter.order) {
        sortField.value = sorter.field as string
        sortDirection.value = sorter.order === 'ascend' ? 'asc' : 'desc'
      } else {
        sortField.value = undefined
        sortDirection.value = undefined
      }
    }
    applySort()
  }
}

// Save all changes
const handleSaveAll = async () => {
  if (changedRecords.value.size === 0) {
    message.info('No changes to save')
    return
  }

  saving.value = true
  try {
    const updates: Array<{ device_store_id: string; data: Partial<DeviceStore> }> = []

    // Collect all changed records
    changedRecords.value.forEach((deviceStoreId) => {
      const record = dataSource.value.find((d) => d.device_store_id === deviceStoreId)
      if (record) {
        updates.push({
          device_store_id: deviceStoreId,
          data: {
            tenant_id: record.tenant_id || null,
            ota_target_firmware_version: record.ota_target_firmware_version || null,
            ota_target_mcu_model: record.ota_target_mcu_model || null,
            allow_access: record.allow_access,
          },
        })
      }
    })

    if (useMock) {
      // Use mock API in development
      const { deviceStore } = await import('@test/index')
      await deviceStore.mock.mockBatchUpdateDeviceStores(updates)
      console.log('%c[Mock] Update Device Store API - Success', 'color: #52c41a; font-weight: bold', {
        updateCount: updates.length,
      })
    } else {
      // TODO: Implement API call when available
      // for (const update of updates) {
      //   await updateDeviceStoreApi(update.device_store_id, update.data)
      // }
    }

    message.success(`Successfully saved ${updates.length} device(s)`)
    changedRecords.value.clear()
    await fetchData()
  } catch (error: any) {
    console.error('Failed to save changes:', error)
    message.error(error?.message || 'Failed to save changes')
  } finally {
    saving.value = false
  }
}

// Import function
const handleImport = () => {
  isImportModalVisible.value = true
}

// Download template
const downloadTemplate = async () => {
  try {
    // TODO: Implement API call when available
    // const response = await getImportTemplateApi()
    // const blob = new Blob([response], {
    //   type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // })
    // const url = window.URL.createObjectURL(blob)
    // const link = document.createElement('a')
    // link.href = url
    // link.download = `device-store-import-template.xlsx`
    // link.click()
    // window.URL.revokeObjectURL(url)
    message.info('Download template API will be implemented')
  } catch (error: any) {
    message.error(error?.message || 'Failed to download template')
  }
}

// Before upload
const beforeUpload = (file: File) => {
  const isValidType = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'].includes(file.type) ||
    file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')
  if (!isValidType) {
    message.error('Please upload Excel or CSV file')
    return false
  }
  return false // Prevent auto upload
}

// Handle import confirm
const handleImportConfirm = async () => {
  if (fileList.value.length === 0) {
    message.warning('Please select a file')
    return
  }

  try {
    const file = fileList.value[0].originFileObj
    if (!file) {
      message.error('File not found')
      return
    }

    // TODO: Implement API call when available
    // const formData = new FormData()
    // formData.append('file', file)
    // const result = await importDeviceStoresApi(formData)
    // message.success(`Import completed: ${result.success_count} succeeded, ${result.failed_count} failed`)
    // if (result.errors && result.errors.length > 0) {
    //   console.error('Import errors:', result.errors)
    // }

    message.info('Import API will be implemented')
    handleImportCancel()
    await fetchData()
  } catch (error: any) {
    message.error(error?.message || 'Failed to import devices')
  }
}

// Handle import cancel
const handleImportCancel = () => {
  isImportModalVisible.value = false
  fileList.value = []
}

// Export function
const handleExport = async () => {
  try {
    // TODO: Implement API call when available
    // const response = await exportDeviceStoresApi({
    //   format: 'excel',
    //   search: searchText.value,
    // })
    // const blob = new Blob([response], {
    //   type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // })
    // const url = window.URL.createObjectURL(blob)
    // const link = document.createElement('a')
    // link.href = url
    // link.download = `device-store-export-${dayjs().format('YYYYMMDD-HHmmss')}.xlsx`
    // link.click()
    // window.URL.revokeObjectURL(url)
    message.info('Export API will be implemented')
  } catch (error: any) {
    message.error(error?.message || 'Failed to export devices')
  }
}

// Fetch data
const fetchData = async () => {
  loading.value = true
  try {
    if (useMock) {
      // Use mock data in development
      const { deviceStore } = await import('@test/index')
      const [deviceData, tenantData] = await Promise.all([
        deviceStore.mock.mockGetDeviceStores(),
        deviceStore.mock.mockGetTenants(),
      ])
      dataSource.value = deviceData.items
      tenantList.value = tenantData.items
      console.log('%c[Mock] Device Store API - Success', 'color: #52c41a; font-weight: bold', {
        deviceCount: deviceData.items.length,
        tenantCount: tenantData.items.length,
      })
    } else {
      // TODO: Implement API calls when available
      // const data = await getDeviceStoresApi()
      // dataSource.value = data.items
      // 注意：API 应该返回 tenant_name（通过 JOIN tenants 表）
      // const tenants = await getTenantsApi()
      // tenantList.value = tenants.items
      dataSource.value = []
      tenantList.value = []
    }
    applyFilters()
  } catch (error: any) {
    console.error('Failed to fetch device stores:', error)
    message.error(error?.message || 'Failed to fetch device stores')
  } finally {
    loading.value = false
  }
}

// Refresh data
const refreshData = () => {
  changedRecords.value.clear()
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 5px;
  margin-bottom: 20px;
}

.form-left {
  display: flex;
  gap: 8px;
  flex-grow: 1;
}

.flex-grow {
  flex-grow: 1;
}

.flex-grow .ant-input {
  width: 100%;
}

.device-store-table :deep(.ant-table table) {
  table-layout: auto !important;
  width: 100% !important;
}

.device-store-table :deep(.ant-table-container) {
  overflow-x: auto;
}
</style>
