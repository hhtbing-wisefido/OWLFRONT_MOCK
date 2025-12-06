<template>
  <div style="padding: 15px">
    <div class="form-container">
      <div class="form-left">
        <a-form layout="inline" class="flex-form">
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
          <!-- Search Input -->
          <a-form-item>
            <a-input
              v-model:value="searchText"
              placeholder="Search by nickname or unit name"
              style="width: 400px"
              :allowClear="true"
              @pressEnter="onSearch"
            />
          </a-form-item>

          <!-- Search Button -->
          <a-form-item>
            <a-button type="primary" @click="onSearch">Search</a-button>
          </a-form-item>

          <!-- Create Resident Button -->
          <a-form-item>
            <a-button 
              type="primary" 
              @click="createResident"
              :disabled="!canCreateResident"
            >
              Create Resident
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>

    <a-table
      :dataSource="filteredDataSource"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      :scroll="{ x: 'max-content' }"
      class="resident-table"
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
                      :checked="statusFilter.includes(statusOption.value as 'active' | 'discharged' | 'transferred')"
                      @change="handleStatusFilterChange(statusOption.value as 'active' | 'discharged' | 'transferred', $event)"
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
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'nickname'">
          <span @dblclick="handleRowDoubleClick(record)" style="cursor: pointer; color: #1890ff;">
            {{ record.nickname || '-' }}
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'building'">
          <span>{{ record.building && record.building !== '-' ? record.building : '-' }}</span>
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <span :class="getStatusClass(record.status)">
            {{ getStatusText(record.status) }}
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'is_access_enabled'">
          <a-switch
            :checked="record.is_access_enabled"
            :disabled="!hasManagePermission || saving"
            @change="(checked: boolean) => handleToggleAccess(record, checked)"
          />
        </template>
        <template v-else-if="column.key === 'operation'">
          <a-button size="small" @click="viewResident(record)">
            Details
          </a-button>
        </template>
      </template>
    </a-table>


  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FilterOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import {
  getResidentsApi,
  updateResidentApi,
} from '@/api/resident/resident'
import type {
  Resident,
  GetResidentsParams,
  UpdateResidentParams,
} from '@/api/resident/model/residentModel'
import { useEntitiesStore } from '@/store/modules/entities'
import { usePermission } from '@/hooks/usePermission'

const router = useRouter()
const entitiesStore = useEntitiesStore()
const { hasManagePermission, hasRole } = usePermission()

// Navigate to home page
// Go back
const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/monitoring/overview')
}

// 权限控制：只有 Manager/Admin 可以创建住户
const canCreateResident = computed(() => {
  return hasManagePermission.value || hasRole(['Manager'])
})

const searchText = ref('')
// Status filter: default show active and transferred, hide discharged
const statusFilterOpen = ref(false)
const statusFilter = ref<('active' | 'discharged' | 'transferred')[]>(['active', 'transferred'])
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'discharged', label: 'Discharged' },
  { value: 'transferred', label: 'Transferred' },
]
const loading = ref(false)
const dataSource = ref<Resident[]>([])
const filteredDataSource = ref<Resident[]>([])
const saving = ref(false)

// Pagination
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `Total ${total} residents`,
})


// Multi-column sorter with priority: location_tag > building > area_tag > unit_name
const locationSorter = (a: Resident, b: Resident) => {
  // Priority 1: location_tag
  const aLocationTag = a.location_tag || ''
  const bLocationTag = b.location_tag || ''
  const locationTagCompare = aLocationTag.localeCompare(bLocationTag)
  if (locationTagCompare !== 0) return locationTagCompare

  // Priority 2: building
  const aBuilding = a.building || ''
  const bBuilding = b.building || ''
  const buildingCompare = aBuilding.localeCompare(bBuilding)
  if (buildingCompare !== 0) return buildingCompare

  // Priority 3: area_tag
  const aAreaTag = a.area_tag || ''
  const bAreaTag = b.area_tag || ''
  const areaTagCompare = aAreaTag.localeCompare(bAreaTag)
  if (areaTagCompare !== 0) return areaTagCompare

  // Priority 4: unit_name
  const aUnitName = a.unit_name || ''
  const bUnitName = b.unit_name || ''
  return aUnitName.localeCompare(bUnitName)
}

const columns = [
  {
    title: 'Nickname',
    dataIndex: 'nickname',
    key: 'nickname',
    ellipsis: true,
    align: 'left',
    width: 150,
  },
  {
    title: 'location_tag',
    dataIndex: 'location_tag',
    key: 'location_tag',
    ellipsis: true,
    align: 'left',
    width: 150,
    sorter: locationSorter,
  },
  {
    title: 'Building',
    dataIndex: 'building',
    key: 'building',
    ellipsis: true,
    align: 'left',
    width: 100,
    sorter: locationSorter,
  },
  {
    title: 'area_tag',
    dataIndex: 'area_tag',
    key: 'area_tag',
    ellipsis: true,
    align: 'left',
    width: 120,
    sorter: locationSorter,
  },
  {
    title: 'unit_name',
    dataIndex: 'unit_name',
    key: 'unit_name',
    ellipsis: true,
    align: 'left',
    width: 120,
    sorter: locationSorter,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'left',
  },
  {
    title: 'Service Level',
    dataIndex: 'service_level',
    key: 'service_level',
    ellipsis: true,
    align: 'left',
    width: 120,
  },
  {
    title: 'Admission Date',
    dataIndex: 'admission_date',
    key: 'admission_date',
    ellipsis: true,
    align: 'left',
    width: 120,
  },
  {
    title: 'account',
    dataIndex: 'resident_account',
    key: 'resident_account',
    ellipsis: true,
    align: 'left',
    width: 100,
  },
  {
    title: 'Family_tag',
    dataIndex: 'family_tag',
    key: 'family_tag',
    ellipsis: true,
    align: 'left',
    width: 100,
  },
  {
    title: 'Allow Access',
    dataIndex: 'is_access_enabled',
    key: 'is_access_enabled',
    align: 'center',
    width: 100,
  },
  {
    title: 'Operation',
    key: 'operation',
    fixed: 'right',
    width: 200,
    align: 'left',
  },
]



// Get status class
const getStatusClass = (status?: string) => {
  const statusMap: Record<string, string> = {
    active: 'status-active',
    discharged: 'status-discharged',
    transferred: 'status-transferred',
  }
  return statusMap[status || ''] || ''
}

// Get status text
const getStatusText = (status?: string) => {
  const statusMap: Record<string, string> = {
    active: 'Active',
    discharged: 'Discharged',
    transferred: 'Transferred',
  }
  return statusMap[status || ''] || status || '-'
}

// Handle row double click
const handleRowDoubleClick = (record: Resident) => {
  viewResident(record)
}

// View resident details
const viewResident = (record: Resident) => {
  router.push(`/resident/${record.resident_id}`)
}

// Create resident
const createResident = () => {
  router.push('/residents/create')
}



// Toggle resident and family access
const handleToggleAccess = async (record: Resident, checked: boolean) => {
  if (!hasManagePermission.value) {
    message.warning('Only administrators can change access permissions')
    return
  }

  saving.value = true
  try {
    const params: UpdateResidentParams = {
      is_access_enabled: checked,
    }
    await updateResidentApi(record.resident_id, params)
    entitiesStore.updateResident(record.resident_id, params)
    // Update the local record to reflect the change immediately
    record.is_access_enabled = checked
    message.success(`Access ${checked ? 'enabled' : 'disabled'} successfully`)
  } catch (error: any) {
    console.error('Failed to update access permission:', error)
    message.error(error?.message || 'Failed to update access permission')
    // Revert the switch state on error
    record.is_access_enabled = !checked
  } finally {
    saving.value = false
  }
}


// Handle Status filter changes
const handleStatusFilterChange = (value: 'active' | 'discharged' | 'transferred', event: any) => {
  if (event.target.checked) {
    if (!statusFilter.value.includes(value)) {
      statusFilter.value.push(value)
    }
  } else {
    statusFilter.value = statusFilter.value.filter((v) => v !== value)
  }
  // Re-fetch data
  pagination.value.current = 1
  fetchResidents()
}

// Search
const onSearch = () => {
  pagination.value.current = 1
  fetchResidents()
}

// Handle table change (pagination, sorting, etc.)
const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  fetchResidents()
}

// Fetch residents
const fetchResidents = async () => {
  loading.value = true
  try {
    // Fetch all residents (no status filter in API call, filter on frontend)
    const params: GetResidentsParams = {
      search: searchText.value || undefined,
      // Don't pass status to API, filter on frontend
    }
    
    // Always fetch from API when there are search params
    // Store cache is useful for initial load without filters
    const hasSearch = searchText.value
    if (!hasSearch && !entitiesStore.shouldRefreshResidents && entitiesStore.residents.length > 0) {
      // Use store cache if no search and cache is valid
      dataSource.value = entitiesStore.residents
    } else {
      // Fetch from API
      const result = await getResidentsApi(params)
      // Update store with fetched data
      if (!hasSearch) {
        entitiesStore.setResidents(result.items)
      }
      dataSource.value = result.items
    }
    
    // Filter by status on frontend
    filteredDataSource.value = dataSource.value.filter((resident) => 
      statusFilter.value.includes(resident.status)
    )
    pagination.value.total = filteredDataSource.value.length
  } catch (error: any) {
    console.error('Failed to fetch residents:', error)
    message.error(error?.message || 'Failed to fetch residents')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchResidents()
})
</script>

<style scoped>
.form-container {
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 4px;
}

.flex-form {
  display: flex;
  align-items: center;
  gap: 16px;
}

.flex-grow {
  flex: 1;
}

.resident-table {
  background: white;
  padding: 16px;
  border-radius: 4px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
}

.status-active {
  color: #52c41a;
  font-weight: 500;
}

.status-discharged {
  color: #8c8c8c;
  font-weight: 500;
}

.status-transferred {
  color: #1890ff;
  font-weight: 500;
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
</style>

