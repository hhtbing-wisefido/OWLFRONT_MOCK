<template>
  <div style="padding: 15px">
    <!-- 搜索栏 -->
    <div class="search-container">
      <a-form layout="inline" class="search-form">
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

    <!-- 设备列表表格 -->
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
        <!-- Status 列：带筛选器 -->
        <template v-if="column.dataIndex === 'status'">
          <div class="status-header-cell">
            <span>{{ column.title }}</span>
            <a-dropdown :trigger="['click']" v-model:open="statusFilterOpen">
              <template #overlay>
                <a-menu class="status-filter-menu">
                  <a-menu-item v-for="statusOption in statusOptions" :key="statusOption.value">
                    <a-checkbox
                      :checked="statusFilter.includes(statusOption.value)"
                      @change="handleStatusFilterChange(statusOption.value, $event)"
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
        <!-- 其他列：显示标题 -->
        <template v-else>
          {{ column.title }}
        </template>
      </template>

      <template #bodyCell="{ column, record, text }">
        <!-- Device Name 列：单元格编辑 -->
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

        <!-- Business Access 列：下拉选择 -->
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

        <!-- Status 列：标签显示 -->
        <template v-else-if="column.dataIndex === 'status'">
          <a-tag :color="getStatusColor(text)">
            {{ text }}
          </a-tag>
        </template>

        <!-- Delete 列：删除按钮 -->
        <template v-else-if="column.dataIndex === 'delete'">
          <a-tooltip title="仅当设备未接入使用才能删除，否则，仅是禁用" :mouseEnterDelay="0.1">
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

        <!-- 其他列：直接显示 -->
        <template v-else>
          {{ text || '-' }}
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { FilterOutlined } from '@ant-design/icons-vue'
import { getDevicesApi, updateDeviceApi, deleteDeviceApi } from '@/api/device/device'
import type { Device, GetDevicesParams } from '@/api/device/model/deviceModel'
import { useUserStore } from '@/store/modules/user'
import type { TableProps } from 'ant-design-vue'

const userStore = useUserStore()

// 数据
const dataSource = ref<Device[]>([])
const loading = ref(false)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `Total ${total} devices`,
})

// 编辑状态
const editingDeviceId = ref<string | null>(null)
const editingField = ref<string | null>(null)
const editingValue = ref<string>('')

// 删除状态
const deletingDeviceId = ref<string | null>(null)

// 搜索状态
const searchType = ref<'device_name' | 'serial_number' | 'uid'>('device_name')
const searchKeyword = ref<string>('')

// 排序状态
const sortField = ref<string | undefined>(undefined)
const sortDirection = ref<'asc' | 'desc' | undefined>(undefined)

// Status 筛选器
const statusFilterOpen = ref(false)
const statusFilter = ref<('online' | 'offline' | 'error' | 'disabled')[]>(['online', 'offline', 'error'])
const statusOptions = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'error', label: 'Error' },
  { value: 'disabled', label: 'Disabled' },
]

// Business Access 选项
const businessAccessOptions = [
  { value: 'pending', label: 'Pending', color: '#faad14' },
  { value: 'approved', label: 'Approved', color: '#52c41a' },
  { value: 'rejected', label: 'Rejected', color: '#ff4d4f' },
]

// 表格列定义
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
    width: 150,
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
    width: 150,
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
    title: 'Business Access',
    dataIndex: 'business_access',
    key: 'business_access',
    width: 150,
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

// 获取设备列表
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

    // 添加搜索参数
    if (searchKeyword.value.trim()) {
      params.search_type = searchType.value
      params.search_keyword = searchKeyword.value.trim()
    }

    // 注意：排序由前端处理，不传递排序参数给 server
    const result = await getDevicesApi(params)
    dataSource.value = result.items
    pagination.value.total = result.total
    
    // 如果有排序条件，对数据进行排序
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

// 应用排序（前端排序）
const applySort = () => {
  if (!sortField.value || !sortDirection.value) return
  
  dataSource.value.sort((a, b) => {
    const aValue = (a as any)[sortField.value!]
    const bValue = (b as any)[sortField.value!]
    
    // 处理 null/undefined 值
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1
    
    // 字符串比较
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue)
      return sortDirection.value === 'asc' ? comparison : -comparison
    }
    
    // 数字比较
    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
}

// 处理表格变化（排序、分页等）
const handleTableChange: TableProps['onChange'] = (pag, filters, sorter) => {
  // 更新分页
  if (pag) {
    pagination.value.current = pag.current || 1
    pagination.value.pageSize = pag.pageSize || 10
    // 分页变化需要重新获取数据
    fetchDevices()
    return
  }

  // 处理排序（前端排序，不需要重新请求数据）
  if (sorter) {
    if (Array.isArray(sorter)) {
      // 多列排序（暂不支持，取第一个）
      if (sorter.length > 0) {
        const firstSorter = sorter[0]
        if (firstSorter.order) {
          sortField.value = firstSorter.field as string
          sortDirection.value = firstSorter.order === 'ascend' ? 'asc' : 'desc'
        } else {
          sortField.value = undefined
          sortDirection.value = undefined
        }
      }
    } else {
      // 单列排序
      if (sorter.order) {
        sortField.value = sorter.field as string
        sortDirection.value = sorter.order === 'ascend' ? 'asc' : 'desc'
      } else {
        // 取消排序
        sortField.value = undefined
        sortDirection.value = undefined
      }
    }
    
    // 前端排序：直接对当前数据进行排序
    if (sortField.value && sortDirection.value) {
      applySort()
    } else {
      // 取消排序，重新获取数据恢复原始顺序
      fetchDevices()
    }
  }
}

// 处理 Status 筛选器变化
const handleStatusFilterChange = (value: 'online' | 'offline' | 'error' | 'disabled', event: any) => {
  if (event.target.checked) {
    if (!statusFilter.value.includes(value)) {
      statusFilter.value.push(value)
    }
  } else {
    statusFilter.value = statusFilter.value.filter((v) => v !== value)
  }
  // 重新获取数据
  pagination.value.current = 1
  fetchDevices()
}

// 开始编辑
const handleStartEdit = (record: Device, field: string, value: string) => {
  editingDeviceId.value = record.device_id
  editingField.value = field
  editingValue.value = value
}

// 保存编辑
const handleSaveEdit = async (record: Device) => {
  if (!editingDeviceId.value || !editingField.value) return

  const newValue = editingValue.value.trim()
  if (newValue === record.device_name) {
    // 值没有变化，取消编辑
    handleCancelEdit()
    return
  }

  try {
    await updateDeviceApi(record.device_id, {
      device_name: newValue,
    })
    message.success('Device name updated successfully')
    await fetchDevices()
  } catch (error: any) {
    message.error(error?.message || 'Failed to update device name')
    // 恢复原值
    await fetchDevices()
  } finally {
    handleCancelEdit()
  }
}

// 取消编辑
const handleCancelEdit = () => {
  editingDeviceId.value = null
  editingField.value = null
  editingValue.value = ''
}

// 处理 Business Access 变化
const handleBusinessAccessChange = async (record: Device, value: 'pending' | 'approved' | 'rejected') => {
  try {
    // 如果值没有变化，不执行更新
    if (record.business_access === value) {
      return
    }

    await updateDeviceApi(record.device_id, {
      business_access: value,
    })
    message.success('Business access updated successfully')
    await fetchDevices()
  } catch (error: any) {
    // 恢复原值
    await fetchDevices()
    message.error(error?.message || 'Failed to update business access')
  }
}

// 处理删除
const handleDelete = async (record: Device) => {
  try {
    deletingDeviceId.value = record.device_id
    await deleteDeviceApi(record.device_id)
    message.success('Device deleted successfully')
    await fetchDevices()
  } catch (error: any) {
    message.error(error?.message || 'Failed to delete device')
  } finally {
    deletingDeviceId.value = null
  }
}

// 获取 Status 颜色
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

// 获取搜索框占位符
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

// 处理搜索
const handleSearch = () => {
  pagination.value.current = 1
  fetchDevices()
}

// 初始化
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

