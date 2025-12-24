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
                  :checked="autoFillNickname"
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
          <a-form-item 
            label="Account" 
            :required="mode === 'create'"
            :rules="mode === 'create' ? [{ required: true, message: 'Account is required (each institution has its own encoding pattern)', trigger: 'blur' }] : []"
            style="margin-bottom: 0;"
          >
            <a-input
              v-model:value="localResidentData.resident_account"
              :disabled="!canEditField('resident_account')"
              :maxlength="100"
              style="width: 180px"
              placeholder="Enter account (required)"
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

      <!-- Row 3: Password Reset -->
      <a-row v-if="canViewField('note')">
        <a-col :span="24">
          <a-form-item label="Password: At least 8 characters, including uppercase, lowercase, number, and special character" style="margin-bottom: 0;">
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <a-input-password
                v-model:value="residentPassword"
                :disabled="!canEditField('note')"
                placeholder="Enter new password"
                style="width: 200px"
                @input="handleResidentPasswordInput"
                @blur="handleResidentPasswordBlur"
              />
              <a-input-password
                v-model:value="residentPasswordConfirm"
                :disabled="!canEditField('note')"
                placeholder="Confirm password"
                style="width: 200px"
                @input="handleResidentPasswordConfirmInput"
                @blur="handleResidentPasswordConfirmBlur"
              />
              <a-button 
                type="default" 
                @click="generateResidentPassword"
                :disabled="!canEditField('note')"
              >
                GeneratePW
              </a-button>
            </div>
            <div v-if="residentPasswordErrorMessage" style="font-size: 12px; color: #ff4d4f; margin-top: 4px;">
              {{ residentPasswordErrorMessage }}
            </div>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Row 4: Note -->
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
      <a-divider orientation="left" class="bind-unit-divider">Allocation Unit</a-divider>
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
                placeholder="branch_name-Building-Floor-Unit_name"
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
            <div style="margin-top: 8px; color: #faad14; font-size: 14px;">
              Note: For shared rooms, the specific bed for each guest should be specified.
            </div>
          </a-form-item>
        </a-col>
      </a-row>
      <a-divider orientation="left" class="bind-unit-divider">Special designation Caregiver</a-divider>
      <a-row v-if="canViewField('unit_id')" style="margin-bottom: 16px;">
        <a-col :span="24">
          <a-form-item style="margin-bottom: 0;">
            <div style="display: flex; align-items: center; gap: 8px; margin-left: 0px;">
              <a-button
                type="primary"
                size="small"
                :disabled="!canEditField('unit_id')"
                @click="handleSelectCaregivers"
              >
                Select Caregivers
              </a-button>
              <a-input
                v-model:value="selectedCaregiversDisplay"
                :disabled="true"
                style="width: 600px"
                placeholder="Select up to 5 caregiver"
              />
            </div>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row v-if="canViewField('unit_id')">
        <a-col :span="24">
          <a-form-item style="margin-bottom: 0;">
            <div style="display: flex; align-items: center; gap: 8px; margin-left: 0px;">
              <a-button
                type="primary"
                size="small"
                :disabled="!canEditField('unit_id')"
                @click="handleSelectCaregiverGroup"
              >
                Select Caregiver_group
              </a-button>
              <a-input
                v-model:value="selectedCaregiverGroupDisplay"
                :disabled="true"
                style="width: 560px"
                placeholder="Select up to 3 Caregiver_group"
              />
            </div>
            <div style="margin-top: 8px; color: #faad14; font-size: 14px;">
              By default, no specification is required; the assigned caregiver for the unit will be responsible.
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
          <template v-else-if="column.key === 'branch_name'">
            <div 
              style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;" 
              @click="toggleSort('branch_name')"
              :style="{ color: sortConfig.key === 'branch_name' && sortConfig.order ? '#1890ff' : 'inherit' }"
            >
              <span>Unit_tag</span>
              <SortAscendingOutlined 
                v-if="sortConfig.key === 'branch_name' && sortConfig.order === 'asc'" 
                style="font-size: 14px; color: #1890ff;"
              />
              <SortDescendingOutlined 
                v-else-if="sortConfig.key === 'branch_name' && sortConfig.order === 'desc'" 
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
          <template v-else-if="column.key === 'area_name'">
            <div 
              style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;" 
              @click="toggleSort('area_name')"
              :style="{ color: sortConfig.key === 'area_name' && sortConfig.order ? '#1890ff' : 'inherit' }"
            >
              <span>Area_tag</span>
              <SortAscendingOutlined 
                v-if="sortConfig.key === 'area_name' && sortConfig.order === 'asc'" 
                style="font-size: 14px; color: #1890ff;"
              />
              <SortDescendingOutlined 
                v-else-if="sortConfig.key === 'area_name' && sortConfig.order === 'desc'" 
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
          <template v-if="column.key === 'branch_name'">
            {{ record.branch_name || '-' }}
          </template>
          <template v-else-if="column.key === 'building'">
            {{ record.building || '-' }}
          </template>
          <template v-else-if="column.key === 'floor'">
            {{ record.floor || '-' }}
          </template>
          <template v-else-if="column.key === 'area_name'">
            {{ record.area_name || '-' }}
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

    <!-- Caregivers Select Modal -->
    <a-modal
      v-model:visible="showCaregiversModal"
      title="Select Caregivers"
      :footer="null"
      width="800px"
      @cancel="handleCaregiversModalCancel"
    >
      <a-table
        :columns="caregiversTableColumns"
        :data-source="availableCaregivers"
        :pagination="{ pageSize: 10 }"
        :scroll="{ y: 400 }"
        size="small"
        :row-selection="{
          type: 'checkbox',
          selectedRowKeys: tempSelectedCaregiverIds,
          onSelect: handleCaregiverRowSelect,
          onSelectAll: handleCaregiverSelectAll,
        }"
        :row-key="(record: any) => record.user_id"
      >
      </a-table>
      <div style="margin-top: 16px; text-align: right;">
        <a-button @click="handleCaregiversModalCancel" style="margin-right: 8px;">Cancel</a-button>
        <a-button type="primary" @click="handleCaregiversModalConfirm">OK</a-button>
      </div>
    </a-modal>

    <!-- Caregiver Group Select Modal -->
    <a-modal
      v-model:visible="showCaregiverGroupModal"
      title="Select Caregiver Group"
      :footer="null"
      width="800px"
      @cancel="handleCaregiverGroupModalCancel"
    >
      <a-table
        :columns="caregiverGroupTableColumns"
        :data-source="availableCaregiverTags"
        :pagination="{ pageSize: 10 }"
        :scroll="{ y: 400 }"
        size="small"
        :row-selection="{
          type: 'checkbox',
          selectedRowKeys: tempSelectedCaregiverTagIds,
          onSelect: handleCaregiverTagRowSelect,
          onSelectAll: handleCaregiverTagSelectAll,
        }"
        :row-key="(record: any) => record.tag_id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'member'">
            {{ getTagMemberNicknames(record) }}
          </template>
        </template>
      </a-table>
      <div style="margin-top: 16px; text-align: right;">
        <a-button @click="handleCaregiverGroupModalCancel" style="margin-right: 8px;">Cancel</a-button>
        <a-button type="primary" @click="handleCaregiverGroupModalConfirm">OK</a-button>
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
import { getUsersApi } from '@/api/admin/user/user'
import type { User } from '@/api/admin/user/model/userModel'
import { getTagsApi } from '@/api/admin/tags/tags'
import type { TagCatalogItem } from '@/api/admin/tags/model/tagsModel'
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
  { title: 'Branch', key: 'branch_name', dataIndex: 'branch_name', width: 120 },
  { title: 'Building', key: 'building', dataIndex: 'building', width: 100 },
  { title: 'Floor', key: 'floor', dataIndex: 'floor', width: 80 },
  { title: 'Area_tag', key: 'area_name', dataIndex: 'area_name', width: 100 },
  { title: 'UnitName', key: 'unit_name', dataIndex: 'unit_name', width: 120 },
  { title: 'unit_type', key: 'unit_type', dataIndex: 'unit_type', width: 100 },
  { title: 'Shared Room', key: 'is_multi_person_room', dataIndex: 'is_multi_person_room', width: 120 },
]

// Unit/Room/Bed 相关
const availableUnits = ref<Unit[]>([])
const availableRooms = ref<RoomWithBeds[]>([])
const availableBeds = ref<any[]>([])
const selectedUnit = ref<Unit | null>(null)

// Caregivers 相关
const showCaregiversModal = ref(false)
const availableCaregivers = ref<User[]>([])
const selectedCaregiverIds = ref<string[]>([])
const tempSelectedCaregiverIds = ref<string[]>([])
const selectedCaregiversDisplay = ref('')

// Caregiver Group 相关
const showCaregiverGroupModal = ref(false)
const availableCaregiverTags = ref<TagCatalogItem[]>([])
const selectedCaregiverTagIds = ref<string[]>([])
const tempSelectedCaregiverTagIds = ref<string[]>([])
const selectedCaregiverGroupDisplay = ref('')

// Caregivers table columns
const caregiversTableColumns = [
  { title: 'NickName', key: 'nickname', dataIndex: 'nickname', width: 150 },
  { title: 'Email', key: 'email', dataIndex: 'email', width: 200 },
  { title: 'Phone', key: 'phone', dataIndex: 'phone', width: 150 },
  { title: 'Role', key: 'role', dataIndex: 'role', width: 100 },
]

// Caregiver Group table columns
const caregiverGroupTableColumns = [
  { title: 'Tag Name', key: 'tag_name', dataIndex: 'tag_name', width: 150 },
  { title: 'Member', key: 'member', dataIndex: 'member', width: 200 },
]

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
        case 'branch_name':
          valueA = (a.branch_name || '').toLowerCase()
          valueB = (b.branch_name || '').toLowerCase()
          break
        case 'building':
          valueA = (a.building || '').toLowerCase()
          valueB = (b.building || '').toLowerCase()
          break
        case 'floor':
          valueA = (a.floor || '').toLowerCase()
          valueB = (b.floor || '').toLowerCase()
          break
        case 'area_name':
          valueA = (a.area_name || '').toLowerCase()
          valueB = (b.area_name || '').toLowerCase()
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
      // 1. Unit_tag (branch_name)
      const tagA = (a.branch_name || '').toLowerCase()
      const tagB = (b.branch_name || '').toLowerCase()
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
      const areaTagA = (a.area_name || '').toLowerCase()
      const areaTagB = (b.area_name || '').toLowerCase()
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

// 获取选中的 unit 显示文本：branch_name-Building-Floor-Area_name-Unit_name
const selectedUnitDisplay = computed(() => {
  if (!selectedUnit.value) return ''
  const parts = []
  if (selectedUnit.value.branch_name) {
    parts.push(selectedUnit.value.branch_name)
  }
  if (selectedUnit.value.building) {
    parts.push(selectedUnit.value.building)
  }
  if (selectedUnit.value.floor) {
    parts.push(selectedUnit.value.floor)
  }
  if (selectedUnit.value.area_name) {
    parts.push(selectedUnit.value.area_name)
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
      // Watch will emit the update automatically
      // No need for explicit emit here to avoid loops
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
    
    // 如果已有 unit_id，设置选中的 unit（在 units 加载完成后）
    if (localResidentData.value.unit_id) {
      const unit = availableUnits.value.find(u => u.unit_id === localResidentData.value.unit_id)
      if (unit) {
        selectedUnit.value = unit
        fetchRooms(unit.unit_id)
      } else {
        // 如果找不到 unit，清空 selectedUnit
        selectedUnit.value = null
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
  // Watch will emit the update automatically
  // No need for explicit emit here to avoid loops
    return
  }
  
  const room = availableRooms.value.find(r => r.room_id === roomId)
  if (room) {
    availableBeds.value = room.beds || []
  }
  
  // Watch will emit the update automatically
  // No need for explicit emit here to avoid loops
}

// Fetch caregivers (Nurse or Caregiver role, active status)
const fetchCaregivers = async () => {
  try {
    const tenantId = userStore.getUserInfo?.tenant_id
    if (!tenantId) return
    
    const result = await getUsersApi()
    // Filter: role='Nurse' or 'Caregiver' and status='active'
    availableCaregivers.value = (result.items || []).filter(
      (user: User) => 
        (user.role === 'Nurse' || user.role === 'Caregiver') && 
        user.status === 'active'
    )
    console.log('Caregivers loaded:', availableCaregivers.value)
    // Update display after loading caregivers
    updateCaregiversDisplay()
  } catch (error: any) {
    console.error('Failed to fetch caregivers:', error)
    availableCaregivers.value = []
  }
}

// Update caregivers display text
const updateCaregiversDisplay = () => {
  if (selectedCaregiverIds.value.length === 0) {
    selectedCaregiversDisplay.value = ''
    return
  }
  const selectedCaregivers = availableCaregivers.value.filter(
    user => selectedCaregiverIds.value.includes(user.user_id)
  )
  selectedCaregiversDisplay.value = selectedCaregivers
    .map(user => user.nickname || user.user_account)
    .join(', ')
}

// Fetch caregiver tags (tag_type='user_tag')
const fetchCaregiverTags = async () => {
  try {
    const tenantId = userStore.getUserInfo?.tenant_id
    if (!tenantId) return
    
    const result = await getTagsApi({
      tenant_id: tenantId,
      tag_type: 'user_tag',
    })
    availableCaregiverTags.value = result.items || []
    console.log('Caregiver tags loaded:', availableCaregiverTags.value)
  } catch (error: any) {
    console.error('Failed to fetch caregiver tags:', error)
    availableCaregiverTags.value = []
  }
}

// Get tag member nicknames (for user_tag type)
const getTagMemberNicknames = (tag: TagCatalogItem): string => {
  if (!tag.tag_objects) return '-'
  // For user_tag, tag_objects should have "user" key with user_id -> nickname mapping
  const userObjects = tag.tag_objects['user']
  if (!userObjects) return '-'
  // Return comma-separated list of nicknames
  const nicknames = Object.values(userObjects)
  return nicknames.length > 0 ? nicknames.join(', ') : '-'
}

// Handle select caregivers button click
const handleSelectCaregivers = () => {
  tempSelectedCaregiverIds.value = [...selectedCaregiverIds.value]
  showCaregiversModal.value = true
}

// Handle caregiver row select
const handleCaregiverRowSelect = (record: User, selected: boolean) => {
  if (selected) {
    if (tempSelectedCaregiverIds.value.length < 5) {
      if (!tempSelectedCaregiverIds.value.includes(record.user_id)) {
        tempSelectedCaregiverIds.value.push(record.user_id)
      }
    }
  } else {
    tempSelectedCaregiverIds.value = tempSelectedCaregiverIds.value.filter(id => id !== record.user_id)
  }
}

// Handle caregiver select all
const handleCaregiverSelectAll = (selected: boolean, _selectedRows: User[], changeRows: User[]) => {
  if (selected) {
    // Add only if total doesn't exceed 5
    const newIds = changeRows
      .map(row => row.user_id)
      .filter(id => !tempSelectedCaregiverIds.value.includes(id))
    const remaining = 5 - tempSelectedCaregiverIds.value.length
    tempSelectedCaregiverIds.value = [
      ...tempSelectedCaregiverIds.value,
      ...newIds.slice(0, remaining)
    ]
  } else {
    // Remove all changeRows
    const changeIds = changeRows.map(row => row.user_id)
    tempSelectedCaregiverIds.value = tempSelectedCaregiverIds.value.filter(id => !changeIds.includes(id))
  }
}

// Handle caregivers modal confirm
const handleCaregiversModalConfirm = () => {
  selectedCaregiverIds.value = [...tempSelectedCaregiverIds.value]
  // Update display text
  updateCaregiversDisplay()
  showCaregiversModal.value = false
  // TODO: Emit update to parent or save to backend
}

// Handle caregivers modal cancel
const handleCaregiversModalCancel = () => {
  tempSelectedCaregiverIds.value = [...selectedCaregiverIds.value]
  showCaregiversModal.value = false
}

// Handle select caregiver group button click
const handleSelectCaregiverGroup = () => {
  tempSelectedCaregiverTagIds.value = [...selectedCaregiverTagIds.value]
  showCaregiverGroupModal.value = true
}

// Handle caregiver tag row select
const handleCaregiverTagRowSelect = (record: TagCatalogItem, selected: boolean) => {
  if (selected) {
    if (tempSelectedCaregiverTagIds.value.length < 3) {
      if (!tempSelectedCaregiverTagIds.value.includes(record.tag_id)) {
        tempSelectedCaregiverTagIds.value.push(record.tag_id)
      }
    }
  } else {
    tempSelectedCaregiverTagIds.value = tempSelectedCaregiverTagIds.value.filter(id => id !== record.tag_id)
  }
}

// Handle caregiver tag select all
const handleCaregiverTagSelectAll = (selected: boolean, _selectedRows: TagCatalogItem[], changeRows: TagCatalogItem[]) => {
  if (selected) {
    // Add only if total doesn't exceed 3
    const newIds = changeRows
      .map(row => row.tag_id)
      .filter(id => !tempSelectedCaregiverTagIds.value.includes(id))
    const remaining = 3 - tempSelectedCaregiverTagIds.value.length
    tempSelectedCaregiverTagIds.value = [
      ...tempSelectedCaregiverTagIds.value,
      ...newIds.slice(0, remaining)
    ]
  } else {
    // Remove all changeRows
    const changeIds = changeRows.map(row => row.tag_id)
    tempSelectedCaregiverTagIds.value = tempSelectedCaregiverTagIds.value.filter(id => !changeIds.includes(id))
  }
}

// Handle caregiver group modal confirm
const handleCaregiverGroupModalConfirm = () => {
  selectedCaregiverTagIds.value = [...tempSelectedCaregiverTagIds.value]
  // Update display text
  const selectedTags = availableCaregiverTags.value.filter(
    tag => selectedCaregiverTagIds.value.includes(tag.tag_id)
  )
  selectedCaregiverGroupDisplay.value = selectedTags
    .map(tag => tag.tag_name)
    .join(', ')
  showCaregiverGroupModal.value = false
  // TODO: Emit update to parent or save to backend
}

// Handle caregiver group modal cancel
const handleCaregiverGroupModalCancel = () => {
  tempSelectedCaregiverTagIds.value = [...selectedCaregiverTagIds.value]
  showCaregiverGroupModal.value = false
}

// 字段权限配置
const fieldPermissions = {
  nickname: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver'], edit: ['Manager', 'Admin'] },
  resident_account: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver'], edit: ['Manager', 'Admin'] },
  first_name: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver'], edit: ['Manager', 'Admin'] },
  last_name: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver'], edit: ['Manager', 'Admin'] },
  status: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver'], edit: ['Manager', 'Admin'] },
  service_level: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver'], edit: ['Manager', 'Admin'] },
  admission_date: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver'], edit: ['Manager', 'Admin'] },
  discharge_date: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver'], edit: ['Manager', 'Admin'] },
  family_tag: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver'], edit: ['Manager', 'Admin'] },
  note: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver'], edit: ['Manager', 'Admin', 'Nurse'] },
  is_access_enabled: { view: ['Manager', 'Admin'], edit: ['Manager', 'Admin'] },
  unit_id: { view: ['Manager', 'Admin', 'Nurse', 'Caregiver'], edit: ['Manager', 'Admin'] }, // Allocation Unit and Caregiver assignment
}

// 检查字段是否可见
const canViewField = (fieldName: string) => {
  // Create 模式：只有 Manager/Admin 可以创建
  if (props.mode === 'create') {
    return isManager.value
  }
  
  // Resident 和 Family 不能查看 Profile Tab
  if (isResident.value || isFamily.value) {
    return false
  }
  
  const permission = fieldPermissions[fieldName as keyof typeof fieldPermissions]
  if (!permission) return true // 默认可见（对于没有配置的字段，如 unit_id, room_id, bed_id 等）
  
  return permission.view.some(role => 
    role.toLowerCase() === userRole.value?.toLowerCase()
  )
}

// 检查字段是否可编辑
const canEditField = (fieldName: string) => {
  // Create 模式：只有 Manager/Admin 可以创建
  if (props.mode === 'create') {
    return isManager.value
  }
  
  if (props.readonly) return false
  
  // Resident 和 Family 不能编辑基本信息
  if (isResident.value || isFamily.value) {
    return false
  }
  
  const permission = fieldPermissions[fieldName as keyof typeof fieldPermissions]
  if (!permission) return false
  
  return permission.edit.some(role => 
    role.toLowerCase() === userRole.value?.toLowerCase() ||
    (role === 'Nurse' && isNurse.value)
  )
}

// Initialize local data from props (only once, no watch)
const localResidentData = ref<Partial<Resident>>({ ...props.residentData })
const localPHIData = ref<Partial<ResidentPHI>>({ ...(props.residentData.phi || {}) })
const autoFillNickname = ref(false)
const mode = computed(() => props.mode)

// Password reset for resident (independent implementation)
const residentPassword = ref('')
const residentPasswordConfirm = ref('')
const residentPasswordErrorMessage = ref('')

// Password validation constants
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_SPECIAL_CHARS = '!@#$%^&*(),.?":{}|<>'

// Validate password strength
const validateResidentPasswordStrength = (password: string): { isValid: boolean; errorMessage: string } => {
  if (!password) {
    return { isValid: false, errorMessage: '' }
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      errorMessage: 'Password must be at least 8 characters',
    }
  }

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = new RegExp(`[${PASSWORD_SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return {
      isValid: false,
      errorMessage: 'Password must include uppercase, lowercase, number, and special character',
    }
  }

  return { isValid: true, errorMessage: '' }
}

// Validate password confirmation
const validateResidentPasswordConfirm = (): boolean => {
  if (!residentPasswordConfirm.value) {
    if (residentPassword.value) {
      residentPasswordErrorMessage.value = 'Please confirm your password'
    } else {
      residentPasswordErrorMessage.value = ''
    }
    return false
  }

  if (residentPassword.value !== residentPasswordConfirm.value) {
    residentPasswordErrorMessage.value = 'Passwords do not match'
    return false
  }

  // If passwords match, also validate the password strength
  const strengthResult = validateResidentPasswordStrength(residentPassword.value)
  residentPasswordErrorMessage.value = strengthResult.errorMessage
  return strengthResult.isValid
}

// Handle password input
const handleResidentPasswordInput = () => {
  if (!residentPassword.value) {
    residentPasswordErrorMessage.value = ''
    return
  }
  if (!residentPasswordErrorMessage.value.includes('match')) {
    const result = validateResidentPasswordStrength(residentPassword.value)
    residentPasswordErrorMessage.value = result.errorMessage
  } else {
    validateResidentPasswordConfirm()
  }
}

// Handle password blur
const handleResidentPasswordBlur = () => {
  if (residentPassword.value) {
    const result = validateResidentPasswordStrength(residentPassword.value)
    residentPasswordErrorMessage.value = result.errorMessage

    // If password is valid, also check confirmation if it exists
    if (result.isValid && residentPasswordConfirm.value) {
      validateResidentPasswordConfirm()
    }
  }
}

// Handle password confirm input
const handleResidentPasswordConfirmInput = () => {
  if (!residentPasswordConfirm.value) {
    if (!residentPassword.value) {
      residentPasswordErrorMessage.value = ''
    }
    return
  }
  validateResidentPasswordConfirm()
}

// Handle password confirm blur
const handleResidentPasswordConfirmBlur = () => {
  if (residentPasswordConfirm.value) {
    validateResidentPasswordConfirm()
  }
}

// Generate random password
const generateResidentPassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = PASSWORD_SPECIAL_CHARS
  const allChars = uppercase + lowercase + numbers + special

  // Ensure at least one of each required type
  let password = ''
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly (minimum 8 chars total)
  for (let i = password.length; i < PASSWORD_MIN_LENGTH; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  const randomPassword = password.split('').sort(() => Math.random() - 0.5).join('')
  
  residentPassword.value = randomPassword
  residentPasswordConfirm.value = randomPassword
  residentPasswordErrorMessage.value = ''
}

// Check if password is valid
const isResidentPasswordValid = computed(() => {
  if (!residentPassword.value || !residentPasswordConfirm.value) {
    return false
  }
  const strengthResult = validateResidentPasswordStrength(residentPassword.value)
  const confirmResult = residentPassword.value === residentPasswordConfirm.value
  return strengthResult.isValid && confirmResult
})

// Expose method to get current data (called by parent on save)
const getResidentData = () => {
  return { ...localResidentData.value }
}

const getPHIData = () => {
  return { ...localPHIData.value }
}

const getPassword = async () => {
  // Get password hash if valid (consistent with login flow)
  // 规则：passwd 是不回显的，没有从密码改为无密码的状态转换，所以不能发送 ""
  // vue 要么发送有效 password 的 hash，要么不发送该字段（返回 undefined），表示 passwd 未修改
  if (isResidentPasswordValid.value && residentPassword.value) {
    const { hashPassword } = await import('@/utils/crypto')
    return await hashPassword(residentPassword.value)
  }
  return undefined  // 如果用户未输入密码，返回 undefined（不发送该字段）
}

const getCaregiversData = () => {
  return {
    userList: selectedCaregiverIds.value,
    groupList: selectedCaregiverTagIds.value,
  }
}

defineExpose({
  getResidentData,
  getPHIData,
  getPassword,
  getCaregiversData,
})

// Watch for residentData changes to initialize caregivers
watch(
  () => props.residentData,
  (newData) => {
    const residentDataWithCaregivers = newData as Resident & { caregivers?: { userList?: string[]; groupList?: string[] } }
    if (residentDataWithCaregivers?.caregivers) {
      const caregivers = residentDataWithCaregivers.caregivers
      if (caregivers.userList) {
        selectedCaregiverIds.value = [...caregivers.userList]
        updateCaregiversDisplay()
      }
      if (caregivers.groupList) {
        selectedCaregiverTagIds.value = [...caregivers.groupList]
        const selectedTags = availableCaregiverTags.value.filter(
          tag => selectedCaregiverTagIds.value.includes(tag.tag_id)
        )
        selectedCaregiverGroupDisplay.value = selectedTags
          .map(tag => tag.tag_name)
          .join(', ')
      }
    } else {
      // Reset if no caregivers data
      selectedCaregiverIds.value = []
      selectedCaregiverTagIds.value = []
      selectedCaregiversDisplay.value = ''
      selectedCaregiverGroupDisplay.value = ''
    }
  },
  { immediate: true, deep: true }
)

// Handle nickname change - sync to first_name if checkbox is checked
const handleNicknameChange = () => {
  if (autoFillNickname.value && mode.value === 'create') {
    // When =Nickname is checked, update first_name from nickname
    const nickname = localResidentData.value.nickname || ''
    localPHIData.value.first_name = nickname
  }
}

// Handle first name change - sync to nickname if checkbox is checked
const handleFirstNameChange = () => {
  if (autoFillNickname.value && mode.value === 'create') {
    // When =Nickname is checked, update nickname from first_name
    const firstName = localPHIData.value.first_name || ''
    localResidentData.value.nickname = firstName
  }
}

// Handle last name change
// Watch will emit the PHI update automatically
const handleLastNameChange = () => {
  // Watch will handle the emit
}

// Handle auto-fill nickname checkbox change
const handleAutoFillNicknameChange = (e: any) => {
  const checked = e.target.checked
  autoFillNickname.value = checked
  
  if (checked && mode.value === 'create') {
    // When checked, copy current nickname to first_name
    const nickname = localResidentData.value.nickname || ''
    if (nickname) {
      localPHIData.value.first_name = nickname
    }
  } else if (!checked && mode.value === 'create') {
    // When unchecked, clear first_name if it matches nickname
    if (localPHIData.value.first_name === localResidentData.value.nickname) {
      localPHIData.value.first_name = ''
    }
  }
}

// Data is read directly from child components on save (no watch needed)


// Initialize data from props when component is created or props change
// This is called once on mount and when props change (but no watch loop)
const initializeFromProps = () => {
  // Update local data from props (only if props actually changed)
  localResidentData.value = { ...props.residentData }
  localPHIData.value = { ...(props.residentData.phi || {}) }
  
  // 初始化 is_access_enabled 为 true（默认 enable）
  if (localResidentData.value.is_access_enabled === undefined) {
    localResidentData.value.is_access_enabled = true
  }
  
  // 如果已有 unit_id，设置选中的 unit 并加载 rooms
  if (localResidentData.value.unit_id && availableUnits.value.length > 0) {
    const unit = availableUnits.value.find(u => u.unit_id === localResidentData.value.unit_id)
    if (unit) {
      selectedUnit.value = unit
      fetchRooms(unit.unit_id).then(() => {
        if (localResidentData.value.room_id) {
          const room = availableRooms.value.find(r => r.room_id === localResidentData.value.room_id)
          if (room) {
            availableBeds.value = room.beds || []
          }
        }
      })
    } else {
      selectedUnit.value = null
    }
  } else {
    selectedUnit.value = null
    availableRooms.value = []
    availableBeds.value = []
  }
}

// Password will be saved when user clicks Save button in parent component
// No separate ResetPW button needed - password is part of the form

// Track if units are loaded
const unitsLoaded = ref(false)

onMounted(async () => {
  await Promise.all([
    fetchServiceLevels(),
    fetchUnits(),
    fetchCaregivers(),
    fetchCaregiverTags(),
  ])
  
  unitsLoaded.value = true
  
  // Initialize from props after units are loaded
  // Check if residentData is already available (from cache)
  if (props.residentData && Object.keys(props.residentData).length > 0) {
    initializeFromProps()
  }
})

// Watch props to re-initialize when parent updates data
// Use immediate: true to handle initial data load (when cache has data)
watch(
  () => props.residentData,
  (newData) => {
    // Only initialize if we have actual data (not empty object)
    if (newData && Object.keys(newData).length > 0) {
      // If units are loaded, initialize immediately
      // If units are not loaded yet, wait for them to load
      if (unitsLoaded.value) {
        initializeFromProps()
      }
    }
  },
  { deep: true, immediate: true } // Immediate to catch initial data from cache
)

// Also watch for when units are loaded, in case residentData was set before units were ready
watch(
  () => availableUnits.value.length,
  (newLength) => {
    // When units are loaded and we have residentData, re-initialize to set unit/room/bed
    if (newLength > 0 && props.residentData && Object.keys(props.residentData).length > 0) {
      initializeFromProps()
    }
  }
)
</script>

<style scoped>
.profile-content {
  padding: 0px 0 6px 0;
}

:deep(.ant-divider) {
  margin: 8px 0 8px 0;
}

:deep(.bind-unit-divider) {
  margin: 16px 0 16px 0;
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
