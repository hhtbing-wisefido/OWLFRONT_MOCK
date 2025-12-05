<template>
  <div style="padding: 15px">
    <div class="form-container">
      <div class="form-left">
        <a-form layout="inline" class="flex-form">
          <!-- Home Icon -->
          <a-form-item>
            <a-button type="text" @click="goHome" style="padding: 0; border: none; box-shadow: none;">
              <template #icon>
                <HomeOutlined />
              </template>
            </a-button>
          </a-form-item>
          <!-- Search Input -->
          <a-form-item>
            <a-input
              v-model:value="searchText"
              placeholder="Search by card name or address"
              style="width: 400px"
              :allowClear="true"
              @pressEnter="onSearch"
            />
          </a-form-item>

          <!-- Search Button -->
          <a-form-item>
            <a-button type="primary" @click="onSearch">Search</a-button>
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
      class="card-overview-table"
      @change="handleTableChange"
    >
      <template #headerCell="{ column }">
        <!-- Shared/Private: 换行显示 -->
        <template v-if="column.key === 'shared_private'">
          <div class="header-two-lines">
            <div>Shared</div>
            <div>/Private</div>
          </div>
        </template>
        <!-- Family View: 换行显示 -->
        <template v-else-if="column.key === 'family_view'">
          <div class="header-two-lines">
            <div>Family</div>
            <div>View</div>
          </div>
        </template>
        <!-- Other columns: normal display -->
        <template v-else>
          {{ column.title }}
        </template>
      </template>
      <template #bodyCell="{ column, record }">
        <!-- Card Name -->
        <template v-if="column.key === 'card_name'">
          <span style="font-weight: 500;">{{ record.card_name || '-' }}</span>
        </template>

        <!-- Address -->
        <template v-else-if="column.key === 'card_address'">
          <a-tooltip :title="record.card_address">
            <span>{{ record.card_address || '-' }}</span>
          </a-tooltip>
        </template>

        <!-- Unit Type -->
        <template v-else-if="column.key === 'unit_type'">
          <a-tag :color="record.unit_type === 'Facility' ? 'blue' : 'purple'">
            {{ record.unit_type }}
          </a-tag>
        </template>

        <!-- Shared/Private -->
        <template v-else-if="column.key === 'shared_private'">
          <a-tag :color="record.is_multi_person_room ? 'orange' : 'default'">
            {{ record.is_multi_person_room ? 'Shared' : 'Private' }}
          </a-tag>
        </template>

        <!-- Public -->
        <template v-else-if="column.key === 'public'">
          <a-tag v-if="record.is_public_space" color="green">Public</a-tag>
          <span v-else style="color: #999;">-</span>
        </template>

        <!-- Family View -->
        <template v-else-if="column.key === 'family_view'">
          <GlobalOutlined v-if="record.family_view" style="color: #52c41a; font-size: 16px;" />
          <span v-else style="color: #999;">-</span>
        </template>

        <!-- Devices -->
        <template v-else-if="column.key === 'devices'">
          <a-space v-if="record.devices && record.devices.length > 0" wrap>
            <a-tag v-for="(device, index) in record.devices.slice(0, 3)" :key="index">
              {{ device.device_name }}
            </a-tag>
            <a-tag v-if="record.devices.length > 3" color="default">
              +{{ record.devices.length - 3 }} more
            </a-tag>
          </a-space>
          <span v-else style="color: #999;">-</span>
        </template>

        <!-- Residents -->
        <template v-else-if="column.key === 'residents'">
          <a-space v-if="record.residents && record.residents.length > 0" wrap>
            <a-tag v-for="(resident, index) in record.residents.slice(0, 3)" :key="index">
              {{ resident.last_name || resident.nickname || '-' }}
            </a-tag>
            <a-tag v-if="record.residents.length > 3" color="default">
              +{{ record.residents.length - 3 }} more
            </a-tag>
          </a-space>
          <span v-else style="color: #999;">-</span>
        </template>

        <!-- Caregiver Groups -->
        <template v-else-if="column.key === 'caregiver_groups'">
          <a-space v-if="record.caregiver_groups && record.caregiver_groups.length > 0" wrap>
            <a-tag v-for="(group, index) in record.caregiver_groups.slice(0, 3)" :key="index">
              {{ group.group_name }}
            </a-tag>
            <a-tag v-if="record.caregiver_groups.length > 3" color="default">
              +{{ record.caregiver_groups.length - 3 }} more
            </a-tag>
          </a-space>
          <span v-else style="color: #999;">-</span>
        </template>

        <!-- Caregivers -->
        <template v-else-if="column.key === 'caregivers'">
          <a-space v-if="record.caregivers && record.caregivers.length > 0" wrap>
            <a-tag v-for="(caregiver, index) in record.caregivers.slice(0, 3)" :key="index">
              {{ caregiver.caregiver_name }}
            </a-tag>
            <a-tag v-if="record.caregivers.length > 3" color="default">
              +{{ record.caregivers.length - 3 }} more
            </a-tag>
          </a-space>
          <span v-else style="color: #999;">-</span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { GlobalOutlined, HomeOutlined } from '@ant-design/icons-vue'
import { getCardOverviewApi } from '@/api/card-overview/cardOverview'
import type {
  CardOverviewItem,
  GetCardOverviewParams,
} from '@/api/card-overview/model/cardOverviewModel'

const router = useRouter()

// Navigate to home page
const goHome = () => {
  router.push('/monitoring/overview')
}

const searchText = ref('')
const loading = ref(false)
const dataSource = ref<CardOverviewItem[]>([])

// Filtered data source based on search
const filteredDataSource = computed(() => {
  if (!searchText.value.trim()) {
    return dataSource.value
  }
  const searchLower = searchText.value.toLowerCase()
  return dataSource.value.filter(
    (item) =>
      item.card_name?.toLowerCase().includes(searchLower) ||
      item.card_address?.toLowerCase().includes(searchLower),
  )
})

// Pagination
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `Total ${total} cards`,
})

// Table columns
const columns = [
  {
    title: 'Card Name',
    key: 'card_name',
    dataIndex: 'card_name',
    width: 120,
    ellipsis: true,
  },
  {
    title: 'Address',
    key: 'card_address',
    dataIndex: 'card_address',
    width: 200,
    ellipsis: true,
  },
  {
    title: 'Unit Type',
    key: 'unit_type',
    dataIndex: 'unit_type',
    width: 100,
  },
  {
    title: 'Shared/Private',
    key: 'shared_private',
    dataIndex: 'is_multi_person_room',
    width: 90,
  },
  {
    title: 'Public',
    key: 'public',
    dataIndex: 'is_public_space',
    width: 100,
  },
  {
    title: 'Family View',
    key: 'family_view',
    dataIndex: 'family_view',
    width: 80,
  },
  {
    title: 'Devices',
    key: 'devices',
    dataIndex: 'devices',
    width: 200,
  },
  {
    title: 'Residents',
    key: 'residents',
    dataIndex: 'residents',
    width: 200,
  },
  {
    title: 'Caregiver Groups',
    key: 'caregiver_groups',
    dataIndex: 'caregiver_groups',
    width: 150,
  },
  {
    title: 'Caregivers',
    key: 'caregivers',
    dataIndex: 'caregivers',
    width: 150,
  },
]

// Load data
const loadData = async () => {
  try {
    loading.value = true
    const params: GetCardOverviewParams = {
      page: pagination.value.current,
      size: pagination.value.pageSize,
    }
    const result = await getCardOverviewApi(params)
    if (result) {
      dataSource.value = result.items || []
      pagination.value.total = result.pagination?.total || result.items?.length || 0
    }
  } catch (error) {
    console.error('Failed to load card overview:', error)
  } finally {
    loading.value = false
  }
}

// Search
const onSearch = () => {
  // Search is handled by computed filteredDataSource
  // Reset pagination when searching
  pagination.value.current = 1
}

// Handle table change (pagination, sorting)
const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

// Initialize
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.form-container {
  margin-bottom: 16px;
}

.flex-form {
  display: flex;
  align-items: center;
}

.card-overview-table {
  background: white;
}

/* Two-line header style */
.header-two-lines {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.2;
  min-height: 48px; /* 2行高度 */
}

.header-two-lines div {
  white-space: nowrap;
}
</style>

