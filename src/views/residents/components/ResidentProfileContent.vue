<template>
  <div class="profile-content">
    <a-form layout="horizontal" :model="localResidentData" :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
      <!-- Basic Information -->
      <a-divider orientation="left">Basic Information</a-divider>
      
      <!-- Row 1: Nickname, First Name with =Nickname checkbox, Last Name, Account -->
      <a-row :gutter="12" style="margin-bottom: 16px;" v-if="canViewField('nickname') || canViewField('first_name') || canViewField('last_name') || canViewField('resident_account')">
        <a-col v-if="canViewField('nickname')">
          <a-form-item label="Nickname" style="margin-bottom: 0;">
            <a-input
              v-model:value="localResidentData.nickname"
              :disabled="!canEditField('nickname')"
              :maxlength="100"
              style="width: 180px"
              @input="handleNicknameChange"
            />
          </a-form-item>
        </a-col>
        <a-col v-if="canViewField('first_name')">
          <a-form-item 
            :required="mode === 'create'"
            :rules="mode === 'create' ? [{ required: true, message: 'first name', trigger: 'blur' }] : []"
            style="margin-bottom: 0;"
          >
            <template #label>
              <a-space>
                <span>First Name：</span>
                <a-checkbox 
                  v-if="canViewField('nickname') && mode === 'create'"
                  v-model:checked="autoFillNickname"
                  @change="handleAutoFillNicknameChange"
                >
                  =Nickname
                </a-checkbox>
              </a-space>
            </template>
            <a-input
              v-model:value="localPHIData.first_name"
              :disabled="!canEditField('first_name') || (autoFillNickname && mode === 'create')"
              :maxlength="100"
              :style="{ width: '180px', color: autoFillNickname && mode === 'create' ? '#999' : undefined }"
              @input="handleFirstNameChange"
            />
          </a-form-item>
        </a-col>
        <a-col v-if="canViewField('last_name')">
          <a-form-item label="Last Name" style="margin-bottom: 0; margin-right: 36px;">
            <a-input
              v-model:value="localPHIData.last_name"
              :disabled="!canEditField('last_name')"
              :maxlength="100"
              style="width: 180px"
              @input="handleLastNameChange"
            />
          </a-form-item>
        </a-col>
        <a-col v-if="canViewField('resident_account')">
          <a-form-item label="Account" style="margin-bottom: 0;">
            <a-input
              v-model:value="localResidentData.resident_account"
              :disabled="!canEditField('resident_account')"
              :maxlength="100"
              style="width: 180px"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Row 2: Service Level, Family Tag, Access, Status, Admission Date, Discharge Date -->
      <a-row :gutter="12" style="margin-bottom: 16px;" v-if="canViewField('status') || canViewField('service_level') || canViewField('family_tag') || canViewField('is_access_enabled') || canViewField('admission_date') || canViewField('discharge_date')">
        <a-col v-if="canViewField('service_level')">
          <a-form-item label="Service Level" style="margin-bottom: 0;">
            <a-select
              v-model:value="localResidentData.service_level"
              :disabled="!canEditField('service_level')"
              :allowClear="true"
              style="width: 170px"
            >
              <a-select-option
                v-for="level in availableServiceLevels"
                :key="level.level_code"
                :value="level.level_code"
              >
                <span :style="{ color: getServiceLevelColor(level) }">
                  {{ level.level_code || 'Unknown' }}
                </span>
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col v-if="canViewField('family_tag')">
          <a-form-item label="Family Tag" style="margin-bottom: 0;">
            <a-input
              v-model:value="localResidentData.family_tag"
              :disabled="!canEditField('family_tag')"
              :maxlength="100"
              style="width: 100px"
              placeholder="e.g., F0001"
            />
          </a-form-item>
        </a-col>
        <a-col v-if="canViewField('is_access_enabled')">
          <a-form-item label="Access" style="margin-bottom: 0;">
            <a-switch
              v-model:checked="localResidentData.is_access_enabled"
              :disabled="!canEditField('is_access_enabled')"
              :checked-children="'Enable'"
              :un-checked-children="'Disable'"
            />
          </a-form-item>
        </a-col>
        <a-col v-if="canViewField('status')">
          <a-form-item label="Status" style="margin-bottom: 0;">
            <a-select
              v-model:value="localResidentData.status"
              :disabled="!canEditField('status')"
              style="width: 110px"
            >
              <a-select-option value="active">Active</a-select-option>
              <a-select-option value="discharged">Discharged</a-select-option>
              <a-select-option value="transferred">Transferred</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col v-if="canViewField('admission_date')">
          <a-form-item label="Admission Date" style="margin-bottom: 0;">
            <a-date-picker
              v-model:value="localResidentData.admission_date"
              :disabled="!canEditField('admission_date')"
              style="width: 140px"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
        </a-col>
        <a-col v-if="canViewField('discharge_date')">
          <a-form-item label="Discharge Date" style="margin-bottom: 0;">
            <a-date-picker
              v-model:value="localResidentData.discharge_date"
              :disabled="!canEditField('discharge_date')"
              style="width: 140px"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Row 3: Note -->
      <a-row v-if="canViewField('note')">
        <a-col :span="24">
          <a-form-item label="Note" style="margin-bottom: 0;">
            <div style="display: flex; justify-content: flex-end;">
              <a-textarea
                v-model:value="localResidentData.note"
                :disabled="!canEditField('note')"
                :rows="4"
                style="width: 850px"
              />
            </div>
            <div v-if="isNurse" style="font-size: 12px; color: #999; margin-top: 4px;">
              Nurses can update notes for shift handover.
            </div>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Bind Unit -->
      <a-divider orientation="left" class="bind-unit-divider">Bind Unit</a-divider>
      <a-row v-if="canViewField('unit_id')">
        <a-col :span="24">
          <a-form-item style="margin-bottom: 0;">
            <div style="display: flex; align-items: center; gap: 8px; margin-left: 0px;">
              <a-button
                type="primary"
                size="small"
                :disabled="!canEditField('unit_id')"
                @click="handleUnitSelect"
              >
                Select Unit
              </a-button>
              <a-input
                v-model:value="selectedUnitDisplay"
                :disabled="true"
                style="width: 300px"
                placeholder="Select Unit"
              />
              <a-select
                v-model:value="localResidentData.room_id"
                :disabled="!canEditField('unit_id') || !localResidentData.unit_id"
                :allowClear="true"
                style="width: 150px"
                placeholder="Room"
                @change="handleRoomChange"
              >
                <a-select-option
                  v-for="room in availableRooms"
                  :key="room.room_id"
                  :value="room.room_id"
                >
                  {{ room.room_name }}
                </a-select-option>
              </a-select>
              <a-select
                v-model:value="localResidentData.bed_id"
                :disabled="!canEditField('unit_id') || !localResidentData.room_id"
                :allowClear="true"
                style="width: 100px"
                placeholder="Bed"
              >
                <a-select-option
                  v-for="bed in availableBeds"
                  :key="bed.bed_id"
                  :value="bed.bed_id"
                >
                  {{ bed.bed_name }}
                </a-select-option>
              </a-select>
              <span v-if="selectedUnit" style="color: #1890ff; font-weight: 500; margin-left: 6px;">
                {{ selectedUnit.is_multi_person_room ? 'Share' : 'Private' }}
              </span>
              <span v-if="selectedUnit" style="color: #1890ff; font-weight: 500;">
                &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
              </span>
              <span v-if="selectedUnit" style="color: #1890ff; font-weight: 500;">
                {{ selectedUnit.unit_type === 'Home' ? 'HomeCare' : (selectedUnit.unit_type === 'Facility' ? 'Facility' : '-') }}
              </span>
            </div>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <!-- Unit Select Modal -->
    <a-modal
      v-model:visible="showUnitSelectModal"
      title="Select Unit"
      :footer="null"
      width="900px"
      @ok="handleUnitSelectConfirm"
      @cancel="handleUnitSelectCancel"
    >
      <a-table
        :columns="unitTableColumns"
        :data-source="sortedAndFilteredUnits"
        :pagination="{ pageSize: 10 }"
        :scroll="{ y: 400 }"
        size="small"
        :row-selection="{
          type: 'radio',
          selectedRowKeys: tempSelectedUnitId ? [tempSelectedUnitId] : [],
          onSelect: handleUnitRowSelect,
        }"
        :row-key="(record: Unit) => record.unit_id"
      >
        <template #headerCell="{ column }">
          <!-- Shared Room column: with filter -->
          <template v-if="column.key === 'is_multi_person_room'">
            <div class="shared-room-header-cell">
              <span>{{ column.title }}</span>
              <a-dropdown :trigger="['click']" v-model:open="sharedRoomFilterOpen">
                <template #overlay>
                  <a-menu class="shared-room-filter-menu">
                    <a-menu-item v-for="option in sharedRoomOptions" :key="option.value">
                      <a-checkbox
                        :checked="sharedRoomFilter.includes(option.value as 'private'   |   'shared')"
                        @change="handleSharedRoomFilterChange(option.value as 'private'   |   'shared', $event)"
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
          <!-- Sortable columns -->
          <template v-else-if="column.key === 'location_tag'">
            <div 
              style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;" 
              @click="toggleSort('location_tag')"
              :style="{ color: sortConfig.key === 'location_tag' && sortConfig.order ? '#1890ff' : 'inherit' }"
            >
              <span>Unit_tag</span>
              <SortAscendingOutlined 
                v-if="sortConfig.key === 'location_tag' && sortConfig.order === 'asc'" 
                style="font-size: 14px; color: #1890ff;"
              />
              <SortDescendingOutlined 
                v-else-if="sortConfig.key === 'location_tag' && sortConfig.order === 'desc'" 
                style="font-size: 14px; color: #1890ff;"
              />
              <span v-else style="color: #d9d9d9; font-size: 12px;">⇅</span>
            </div>
          </template>
          <template v-else-if="column.key === 'building'">
            <div 
              style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;" 
              @click="toggleSort('building')"
              :style="{ color: sortConfig.key === 'building' && sortConfig.order ? '#1890ff' : 'inherit' }"
            >
              <span>Building</span>
              <SortAscendingOutlined 
                v-if="sortConfig.key === 'building' && sortConfig.order === 'asc'" 
                style="font-size: 14px; color: #1890ff;"
              />
              <SortDescendingOutlined 
                v-else-if="sortConfig.key === 'building' && sortConfig.order === 'desc'" 
                style="font-size: 14px; color: #1890ff;"
              />
              <span v-else style="color: #d9d9d9; font-size: 12px;">⇅</span>
            </div>
          </template>
          <template v-else-if="column.key === 'floor'">
            <div 
              style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;" 
              @click="toggleSort('floor')"
              :style="{ color: sortConfig.key === 'floor' && sortConfig.order ? '#1890ff' : 'inherit' }"
            >
              <span>Floor</span>
              <SortAscendingOutlined 
                v-if="sortConfig.key === 'floor' && sortConfig.order === 'asc'" 
                style="font-size: 14px; color: #1890ff;"
              />
              <SortDescendingOutlined 
                v-else-if="sortConfig.key === 'floor' && sortConfig.order === 'desc'" 
                style="font-size: 14px; color: #1890ff;"
              />
              <span v-else style="color: #d9d9d9; font-size: 12px;">⇅</span>
            </div>
          </template>
          <template v-else-if="column.key === 'area_tag'">
            <div 
              style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;" 
              @click="toggleSort('area_tag')"
              :style="{ color: sortConfig.key === 'area_tag' && sortConfig.order ? '#1890ff' : 'inherit' }"
            >
              <span>Area_tag</span>
              <SortAscendingOutlined 
                v-if="sortConfig.key === 'area_tag' && sortConfig.order === 'asc'" 
                style="font-size: 14px; color: #1890ff;"
              />
              <SortDescendingOutlined 
                v-else-if="sortConfig.key === 'area_tag' && sortConfig.order === 'desc'" 
                style="font-size: 14px; color: #1890ff;"
              />
              <span v-else style="color: #d9d9d9; font-size: 12px;">⇅</span>
            </div>
          </template>
          <template v-else-if="column.key === 'unit_name'">
            <div 
              style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;" 
              @click="toggleSort('unit_name')"
              :style="{ color: sortConfig.key === 'unit_name' && sortConfig.order ? '#1890ff' : 'inherit' }"
            >
              <span>UnitName</span>
              <SortAscendingOutlined 
                v-if="sortConfig.key === 'unit_name' && sortConfig.order === 'asc'" 
                style="font-size: 14px; color: #1890ff;"
              />
              <SortDescendingOutlined 
                v-else-if="sortConfig.key === 'unit_name' && sortConfig.order === 'desc'" 
                style="font-size: 14px; color: #1890ff;"
              />
              <span v-else style="color: #d9d9d9; font-size: 12px;">⇅</span>
            </div>
          </template>
          <!-- Other columns: display title -->
          <template v-else>
            {{ column.title }}
          </template>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'location_tag'">
            {{ record.location_tag || '-' }}
          </template>
          <template v-else-if="column.key === 'building'">
            {{ record.building || '-' }}
          </template>
          <template v-else-if="column.key === 'floor'">
            {{ record.floor || '-' }}
          </template>
          <template v-else-if="column.key === 'area_tag'">
            {{ record.area_tag || '-' }}
          </template>
          <template v-else-if="column.key === 'unit_name'">
            {{ record.unit_name || '-' }}
          </template>
          <template v-else-if="column.key === 'unit_type'">
            {{ record.unit_type || '-' }}
          </template>
          <template v-else-if="column.key === 'is_multi_person_room'">
            {{ record.is_multi_person_room ? 'Shared' : 'Private' }}
          </template>
        </template>
      </a-table>
      <div style="margin-top: 16px; text-align: right;">
        <a-button @click="handleUnitSelectCancel" style="margin-right: 8px;">Cancel</a-button>
        <a-button type="primary" @click="handleUnitSelectConfirm">OK</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { SortAscendingOutlined, SortDescendingOutlined, FilterOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { usePermission } from '@/hooks/usePermission'
import { getServiceLevelsApi } from '@/api/service-level/serviceLevel'
import type { ServiceLevel } from '@/api/service-level/model/serviceLevelModel'
import type { Resident, ResidentPHI } from '@/api/resident/model/residentModel'
import { getUnitsApi, getRoomsApi } from '@/api/units/unit'
import type { Unit, RoomWithBeds } from '@/api/units/model/unitModel'

interface Props {
  residentData: Resident
  readonly?: boolean
  mode?: 'create' | 'edit' | 'view'
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  mode: 'view',
})

const emit = defineEmits<{
  'update:resident-data': [data: Partial<Resident>]
  'update:phi-data': [data: Partial<ResidentPHI>]
}>()

const userStore = useUserStore()
const { hasManagePermission, hasRole } = usePermission()

// 获取当前用户信息
const userInfo = computed(() => userStore.getUserInfo)
const userRole = computed(() => userInfo.value?.role || '')
const userType = computed(() => userInfo.value?.userType || '')
const currentUserId = computed(() => userInfo.value?.userId || '')

// 角色判断
const isManager = computed(() => hasManagePermission.value || hasRole(['Manager']))
const isNurse = computed(() => hasRole(['Nurse']))
const isResident = computed(() => userType.value === 'resident' && userRole.value === 'Resident')
const isFamily = computed(() => userRole.value === 'Family')

// 判断是否是查看自己的信息（Resident 角色）
const isViewingSelf = computed(() => {
  if (!isResident.value) return false
  return currentUserId.value === props.residentData?.resident_id
})

// 判断是否是查看关联住户的信息（Family 角色）
// 注意：后端已过滤，如果能看到数据说明有权限
const isViewingLinkedResident = computed(() => {
  if (!isFamily.value) return false
  return !!props.residentData?.resident_id
})

// Service Level 相关
const availableServiceLevels = ref<ServiceLevel[]>([])

// Get service level color (from color_hex if available, otherwise from color name)
const getServiceLevelColor = (level: ServiceLevel): string => {
  // Use color_hex if available (from database)
  if (level.color_hex) {
    return level.color_hex
  }
  // Fallback to color name mapping
  const colorMap: Record<string, string> = {
    green: '#52c41a',
    blue: '#1890ff',
    yellow: '#faad14',
    orange: '#fa8c16',
    red: '#ff4d4f',
    purple: '#722ed1',
    gray: '#8c8c8c',
  }
  return colorMap[level.color] || '#8c8c8c'
}

// Fetch service levels
const fetchServiceLevels = async () => {
  try {
    const result = await getServiceLevelsApi()
    availableServiceLevels.value = result.items || []
    console.log('Service levels loaded:', availableServiceLevels.value)
  } catch (error: any) {
    console.error('Failed to fetch service levels:', error)
    availableServiceLevels.value = []
  }
}

// Unit Select Modal
const showUnitSelectModal = ref(false)
const tempSelectedUnitId = ref<string | undefined>(undefined)
const sharedRoomFilterOpen = ref(false)
const sharedRoomFilter = ref<('private' | 'shared')[]>(['private', 'shared']) // Default: all selected
const sharedRoomOptions = [
  { value: 'private', label: 'Private' },
  { value: 'shared', label: 'Shared' },
]

// Sort configuration
const sortConfig = ref<{ key: string | null; order: 'asc' | 'desc' | null }>({
  key: null,
  order: null,
})

// Unit table columns
const unitTableColumns = [
  { title: 'Unit_tag', key: 'location_tag', dataIndex: 'location_tag', width: 120 },
  { title: 'Building', key: 'building', dataIndex: 'building', width: 100 },
  { title: 'Floor', key: 'floor', dataIndex: 'floor', width: 80 },
  { title: 'Area_tag', key: 'area_tag', dataIndex: 'area_tag', width: 100 },
  { title: 'UnitName', key: 'unit_name', dataIndex: 'unit_name', width: 120 },
  { title: 'unit_type', key: 'unit_type', dataIndex: 'unit_type', width: 100 },
  { title: 'Shared Room', key: 'is_multi_person_room', dataIndex: 'is_multi_person_room', width: 120 },
]

// Unit/Room/Bed 相关
const availableUnits = ref<Unit[]>([])
const availableRooms = ref<RoomWithBeds[]>([])
const availableBeds = ref<any[]>([])
const selectedUnit = ref<Unit | null>(null)

// 排序和过滤后的 units
const sortedAndFilteredUnits = computed(() => {
  let units = [...availableUnits.value]
  
  // 过滤 is_public_space（已经在 fetchUnits 中处理）
  // 过滤 shared room（根据 sharedRoomFilter 数组）
  if (sharedRoomFilter.value.length === 0) {
    // 如果没有任何选中，返回空数组
    units = []
  } else if (sharedRoomFilter.value.length === 1) {
    // 如果只选中一个，进行过滤
    if (sharedRoomFilter.value.includes('private')) {
      units = units.filter(unit => !unit.is_multi_person_room)
    } else if (sharedRoomFilter.value.includes('shared')) {
      units = units.filter(unit => unit.is_multi_person_room === true)
    }
  }
  // 如果两个都选中（默认情况），不进行过滤
  
  // 排序：根据 sortConfig 或默认排序
  if (sortConfig.value.key && sortConfig.value.order) {
    units.sort((a, b) => {
      const key = sortConfig.value.key!
      const order = sortConfig.value.order!
      
      let valueA: any = ''
      let valueB: any = ''
      
      switch (key) {
        case 'location_tag':
          valueA = (a.location_tag || '').toLowerCase()
          valueB = (b.location_tag || '').toLowerCase()
          break
        case 'building':
          valueA = (a.building || '').toLowerCase()
          valueB = (b.building || '').toLowerCase()
          break
        case 'floor':
          valueA = (a.floor || '').toLowerCase()
          valueB = (b.floor || '').toLowerCase()
          break
        case 'area_tag':
          valueA = (a.area_tag || '').toLowerCase()
          valueB = (b.area_tag || '').toLowerCase()
          break
        case 'unit_name':
          valueA = (a.unit_name || '').toLowerCase()
          valueB = (b.unit_name || '').toLowerCase()
          break
        default:
          return 0
      }
      
      const comparison = valueA.localeCompare(valueB)
      return order === 'asc' ? comparison : -comparison
    })
  } else {
    // 默认排序：Unit_tag > building > floor > Area_tag > unitName
    units.sort((a, b) => {
      // 1. Unit_tag (location_tag)
      const tagA = (a.location_tag || '').toLowerCase()
      const tagB = (b.location_tag || '').toLowerCase()
      if (tagA !== tagB) {
        return tagA.localeCompare(tagB)
      }
      
      // 2. building
      const buildingA = (a.building || '').toLowerCase()
      const buildingB = (b.building || '').toLowerCase()
      if (buildingA !== buildingB) {
        return buildingA.localeCompare(buildingB)
      }
      
      // 3. floor
      const floorA = (a.floor || '').toLowerCase()
      const floorB = (b.floor || '').toLowerCase()
      if (floorA !== floorB) {
        return floorA.localeCompare(floorB)
      }
      
      // 4. Area_tag
      const areaTagA = (a.area_tag || '').toLowerCase()
      const areaTagB = (b.area_tag || '').toLowerCase()
      if (areaTagA !== areaTagB) {
        return areaTagA.localeCompare(areaTagB)
      }
      
      // 5. unitName
      const nameA = (a.unit_name || '').toLowerCase()
      const nameB = (b.unit_name || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }
  
  return units
})

// 获取选中的 unit 显示文本：unit_tag-building-unit_name
const selectedUnitDisplay = computed(() => {
  if (!selectedUnit.value) return ''
  const parts = []
  if (selectedUnit.value.location_tag) {
    parts.push(selectedUnit.value.location_tag)
  }
  if (selectedUnit.value.building) {
    parts.push(selectedUnit.value.building)
  }
  if (selectedUnit.value.unit_name) {
    parts.push(selectedUnit.value.unit_name)
  }
  return parts.join('-')
})

// Handle unit select button click
const handleUnitSelect = () => {
  tempSelectedUnitId.value = localResidentData.value.unit_id
  showUnitSelectModal.value = true
}

// Handle shared room filter change
const handleSharedRoomFilterChange = (value: 'private' | 'shared', event: any) => {
  if (event.target.checked) {
    if (!sharedRoomFilter.value.includes(value)) {
      sharedRoomFilter.value.push(value)
    }
  } else {
    sharedRoomFilter.value = sharedRoomFilter.value.filter((v) => v !== value)
  }
  // Filter change will trigger computed property update
}

// Toggle sort for a column
const toggleSort = (key: string) => {
  if (sortConfig.value.key === key) {
    // Same column: toggle order
    if (sortConfig.value.order === 'asc') {
      sortConfig.value.order = 'desc'
    } else if (sortConfig.value.order === 'desc') {
      sortConfig.value.key = null
      sortConfig.value.order = null
    }
  } else {
    // Different column: set new sort
    sortConfig.value.key = key
    sortConfig.value.order = 'asc'
  }
}

// Handle unit row select
const handleUnitRowSelect = (record: Unit, _selected: boolean) => {
  tempSelectedUnitId.value = record.unit_id
}

// Handle unit select confirm
const handleUnitSelectConfirm = () => {
  if (tempSelectedUnitId.value) {
    const unit = availableUnits.value.find(u => u.unit_id === tempSelectedUnitId.value)
    if (unit) {
      selectedUnit.value = unit
      localResidentData.value.unit_id = unit.unit_id
      // Clear room and bed when unit changes
      localResidentData.value.room_id = undefined
      localResidentData.value.bed_id = undefined
      availableRooms.value = []
      availableBeds.value = []
      // Fetch rooms for the selected unit
      fetchRooms(unit.unit_id)
      emit('update:resident-data', {
        ...localResidentData.value,
        unit_id: unit.unit_id,
        room_id: undefined,
        bed_id: undefined,
      })
    }
  }
  showUnitSelectModal.value = false
}

// Handle unit select cancel
const handleUnitSelectCancel = () => {
  tempSelectedUnitId.value = localResidentData.value.unit_id
  showUnitSelectModal.value = false
}

// Fetch units (filter out is_public_space)
const fetchUnits = async () => {
  try {
    const tenantId = userStore.getUserInfo?.tenant_id
    if (!tenantId) return
    
    const result = await getUnitsApi({
      tenant_id: tenantId,
      is_public_space: false, // Filter out public spaces
    })
    availableUnits.value = result.items || []
    console.log('Units loaded:', availableUnits.value)
    
    // 如果已有 unit_id，设置选中的 unit
    if (localResidentData.value.unit_id) {
      const unit = availableUnits.value.find(u => u.unit_id === localResidentData.value.unit_id)
      if (unit) {
        selectedUnit.value = unit
        fetchRooms(unit.unit_id)
      }
    }
  } catch (error: any) {
    console.error('Failed to fetch units:', error)
    availableUnits.value = []
  }
}

// Fetch rooms for selected unit
const fetchRooms = async (unitId: string) => {
  try {
    const rooms = await getRoomsApi({ unit_id: unitId })
    availableRooms.value = rooms || []
    console.log('Rooms loaded:', availableRooms.value)
    
    // If room is selected, fetch beds
    if (localResidentData.value.room_id) {
      const room = availableRooms.value.find(r => r.room_id === localResidentData.value.room_id)
      if (room) {
        availableBeds.value = room.beds || []
      }
    }
  } catch (error: any) {
    console.error('Failed to fetch rooms:', error)
    availableRooms.value = []
  }
}

// Handle room change
const handleRoomChange = (roomId: string | undefined) => {
  if (!roomId) {
    localResidentData.value.bed_id = undefined
    availableBeds.value = []
    emit('update:resident-data', {
      ...localResidentData.value,
      room_id: undefined,
      bed_id: undefined,
    })
    return
  }
  
  const room = availableRooms.value.find(r => r.room_id === roomId)
  if (room) {
    availableBeds.value = room.beds || []
  }
  
  emit('update:resident-data', {
    ...localResidentData.value,
    room_id: roomId,
  })
}


// 字段权限配置
const fieldPermissions = {
  nickname: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver', 'Resident', 'Family'], edit: ['Manager', 'Admin'] },
  resident_account: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver', 'Resident', 'Family'], edit: ['Manager', 'Admin'] },
  first_name: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver'], edit: ['Manager', 'Admin'] },
  last_name: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver'], edit: ['Manager', 'Admin'] },
  status: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver', 'Resident', 'Family'], edit: ['Manager', 'Admin'] },
  service_level: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver', 'Resident', 'Family'], edit: ['Manager', 'Admin'] },
  admission_date: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver', 'Resident', 'Family'], edit: ['Manager', 'Admin'] },
  discharge_date: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver', 'Resident', 'Family'], edit: ['Manager', 'Admin'] },
  family_tag: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver', 'Resident', 'Family'], edit: ['Manager', 'Admin'] },
  note: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver', 'Resident', 'Family'], edit: ['Manager', 'Admin', 'Nurse'] },
  is_access_enabled: { view: ['Manager', 'Admin'], edit: ['Manager', 'Admin'] },
}

// 检查字段是否可见
const canViewField = (fieldName: string) => {
  // Create 模式：只有 Manager/Admin 可以创建
  if (props.mode === 'create') {
    return isManager.value
  }
  
  // Resident 只能查看自己的信息
  if (isResident.value && !isViewingSelf.value) {
    return false
  }
  
  // Family 只能查看关联住户的信息（后端已过滤，这里只做前端显示控制）
  if (isFamily.value && !isViewingLinkedResident.value) {
    return false
  }
  
  const permission = fieldPermissions[fieldName as keyof typeof fieldPermissions]
  if (!permission) return true // 默认可见
  
  return permission.view.some(role => 
    role.toLowerCase() === userRole.value?.toLowerCase() ||
    (role === 'Resident' && isResident.value) ||
    (role === 'Family' && isFamily.value)
  )
}

// 检查字段是否可编辑
const canEditField = (fieldName: string) => {
  // Create 模式：只有 Manager/Admin 可以创建
  if (props.mode === 'create') {
    return isManager.value
  }
  
  if (props.readonly) return false
  
  // Resident 和 Family 不能编辑基本信息，只能编辑 contacts（在 Contacts Tab 中）
  if ((isResident.value || isFamily.value) && fieldName !== 'note') {
    return false
  }
  
  const permission = fieldPermissions[fieldName as keyof typeof fieldPermissions]
  if (!permission) return false
  
  return permission.edit.some(role => 
    role.toLowerCase() === userRole.value?.toLowerCase() ||
    (role === 'Nurse' && isNurse.value)
  )
}

const localResidentData = ref<Partial<Resident>>({ ...props.residentData })
const localPHIData = ref<Partial<ResidentPHI>>({ ...(props.residentData.phi || {}) })
const autoFillNickname = ref(false)
const mode = computed(() => props.mode)

// Flag to prevent circular updates when props change
const isUpdatingFromProps = ref(false)

// Handle nickname change
const handleNicknameChange = () => {
  if (autoFillNickname.value && mode.value === 'create') {
    // When =Nickname is checked, update first_name from nickname
    const nickname = localResidentData.value.nickname || ''
    localPHIData.value.first_name = nickname
    emit('update:phi-data', localPHIData.value)
  }
}

// Handle first name change
const handleFirstNameChange = () => {
  if (autoFillNickname.value && mode.value === 'create') {
    // When =Nickname is checked, update nickname from first_name
    const firstName = localPHIData.value.first_name || ''
    localResidentData.value.nickname = firstName
  }
  emit('update:phi-data', localPHIData.value)
}

// Handle last name change
const handleLastNameChange = () => {
  emit('update:phi-data', localPHIData.value)
}

// Handle auto-fill nickname checkbox change
const handleAutoFillNicknameChange = () => {
  if (autoFillNickname.value && mode.value === 'create') {
    // When checked, copy nickname to first_name
    const nickname = localResidentData.value.nickname || ''
    localPHIData.value.first_name = nickname
    emit('update:phi-data', localPHIData.value)
  } else {
    // When unchecked, clear first_name if it was auto-filled
    if (localPHIData.value.first_name === localResidentData.value.nickname) {
      localPHIData.value.first_name = ''
      emit('update:phi-data', localPHIData.value)
    }
  }
}

// Watch for changes and emit updates (only when not updating from props)
watch(
  () => localResidentData.value,
  (newData) => {
    if (!isUpdatingFromProps.value) {
      emit('update:resident-data', newData)
    }
  },
  { deep: true }
)

// Watch props changes
watch(
  () => props.residentData,
  (newData) => {
    isUpdatingFromProps.value = true
    localResidentData.value = { ...newData }
    localPHIData.value = { ...(newData.phi || {}) }
    // 初始化 is_access_enabled 为 false（默认 disable）
    if (localResidentData.value.is_access_enabled === undefined) {
      localResidentData.value.is_access_enabled = false
    }
    // 如果已有 unit_id，设置选中的 unit 并加载 rooms
    if (localResidentData.value.unit_id) {
      const unit = availableUnits.value.find(u => u.unit_id === localResidentData.value.unit_id)
      if (unit) {
        selectedUnit.value = unit
        fetchRooms(unit.unit_id)
      }
    } else {
      selectedUnit.value = null
      availableRooms.value = []
      availableBeds.value = []
    }
    // Reset flag after a microtask to allow the watch to complete
    Promise.resolve().then(() => {
      isUpdatingFromProps.value = false
    })
  },
  { deep: true }
)


onMounted(() => {
  fetchServiceLevels()
  fetchUnits()
  
  // 初始化 is_access_enabled 为 false（默认 disable）
  if (localResidentData.value.is_access_enabled === undefined) {
    localResidentData.value.is_access_enabled = false
  }
  
  // 如果已有 unit_id，设置选中的 unit 并加载 rooms
  if (localResidentData.value.unit_id && availableUnits.value.length > 0) {
    const unit = availableUnits.value.find(u => u.unit_id === localResidentData.value.unit_id)
    if (unit) {
      selectedUnit.value = unit
      fetchRooms(unit.unit_id)
      if (localResidentData.value.room_id) {
        const room = availableRooms.value.find(r => r.room_id === localResidentData.value.room_id)
        if (room) {
          availableBeds.value = room.beds || []
        }
      }
    }
  }
})
</script>

<style scoped>
.profile-content {
  padding: 0px 0 6px 0;
}

:deep(.ant-divider) {
  margin: 8px 0 8px 0;
}

:deep(.bind-unit-divider) {
  margin: 12px 0 12px 0;
}

:deep(.ant-form-item) {
  margin-bottom: 0;
  display: inline-block;
  margin-right: 12px;
}

:deep(.ant-form-item-label) {
  padding-bottom: 4px;
  text-align: left;
}

:deep(.ant-form-item-label > label) {
  white-space: nowrap;
}

/* Shared Room filter styles */
.shared-room-header-cell {
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

.shared-room-filter-menu {
  min-width: 150px;
}
</style>
