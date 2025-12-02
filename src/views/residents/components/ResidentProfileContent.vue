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
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { usePermission } from '@/hooks/usePermission'
import { getServiceLevelsApi } from '@/api/service-level/serviceLevel'
import type { ServiceLevel } from '@/api/service-level/model/serviceLevelModel'
import type { Resident, ResidentPHI } from '@/api/resident/model/residentModel'

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
const isCaregiver = computed(() => hasRole(['Caregiver']))
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

// Watch for changes and emit updates
watch(
  () => localResidentData.value,
  (newData) => {
    emit('update:resident-data', newData)
  },
  { deep: true }
)

// Watch props changes
watch(
  () => props.residentData,
  (newData) => {
    localResidentData.value = { ...newData }
    localPHIData.value = { ...(newData.phi || {}) }
    // 初始化 is_access_enabled 为 false（默认 disable）
    if (localResidentData.value.is_access_enabled === undefined) {
      localResidentData.value.is_access_enabled = false
    }
  },
  { deep: true }
)

onMounted(() => {
  fetchServiceLevels()
  // 初始化 is_access_enabled 为 false（默认 disable）
  if (localResidentData.value.is_access_enabled === undefined) {
    localResidentData.value.is_access_enabled = false
  }
})
</script>

<style scoped>
.profile-content {
  padding: 16px 0;
}

:deep(.ant-divider) {
  margin: 10px 0 8px 0;
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
</style>
