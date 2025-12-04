<template>
  <div style="padding: 15px">
    <div class="page-header">
      <div class="header-left">
        <a-space>
          <a-button @click="goBack">← Back</a-button>
          <a-button 
            v-if="canEdit && (mode === 'create' || mode === 'edit')" 
            type="primary" 
            @click="handleSave" 
            :loading="saving"
          >
            Save
          </a-button>
        </a-space>
        <h1>
          {{ mode === 'create' ? 'Create Resident' : `Resident Detail - ${residentData.nickname || residentId || 'Loading...'}` }}
        </h1>
      </div>
    </div>

    <div class="form-container">
      <!-- Tab 标签页 -->
      <a-tabs 
        v-model:activeKey="activeTab" 
        @change="handleTabChange"
        class="resident-tabs"
      >
        <!-- Profile Tab -->
        <a-tab-pane key="profile" tab="Profile">
          <ResidentProfileContent 
            :resident-data="residentData"
            :mode="mode"
            :readonly="!canEditProfile"
            @update:resident-data="handleResidentDataUpdate"
            @update:phi-data="handlePHIDataUpdate"
          />
        </a-tab-pane>

        <!-- PHI Tab（根据权限显示，Manager/Admin 在 Create 模式下也可以填写） -->
        <a-tab-pane 
          v-if="canViewPHI" 
          key="phi" 
          tab="PHI"
        >
          <ResidentPHIContent 
            :resident-id="residentId || 'new'"
            :phi-data="residentData.phi"
            :readonly="!canEditPHI"
            :mode="mode"
            @update:phi-data="handlePHIDataUpdate"
          />
        </a-tab-pane>

        <!-- Contacts Tab -->
        <a-tab-pane key="contacts" tab="Contacts">
          <ResidentContactsContent 
            :resident-id="residentId || 'new'"
            :contacts="residentData.contacts || []"
            :readonly="!canEditContacts"
            :mode="mode"
            @update:contacts="handleContactsUpdate"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import ResidentProfileContent from './components/ResidentProfileContent.vue'
import ResidentPHIContent from './components/ResidentPHIContent.vue'
import ResidentContactsContent from './components/ResidentContactsContent.vue'
import { getResidentApi, createResidentApi, updateResidentApi, updateResidentPHIApi } from '@/api/resident/resident'
import type { Resident, CreateResidentParams, UpdateResidentPHIParams } from '@/api/resident/model/residentModel'
import { useUserStore } from '@/store/modules/user'
import { useEntitiesStore } from '@/store/modules/entities'
import { usePermission } from '@/hooks/usePermission'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const entitiesStore = useEntitiesStore()
const { hasManagePermission, hasRole } = usePermission()

// 判断模式：create / edit / view
const mode = computed(() => {
  if (route.name === 'CreateResident') return 'create'
  if (route.query.mode === 'edit') return 'edit'
  return 'view'
})

const residentId = computed(() => {
  if (mode.value === 'create') return ''
  return route.params.id as string
})

const activeTab = ref<string>((route.params.tab as string) || (route.query.tab as string) || 'profile')
const residentData = ref<Resident>({} as Resident)
const saving = ref(false)

const userInfo = computed(() => userStore.getUserInfo)
const userRole = computed(() => userInfo.value?.role || '')
const userType = computed(() => userInfo.value?.userType || '')

// 角色判断
const isManager = computed(() => hasManagePermission.value || hasRole(['Manager']))
const isNurse = computed(() => hasRole(['Nurse']))
const isCaregiver = computed(() => hasRole(['Caregiver']))
const isResident = computed(() => userType.value === 'resident' && userRole.value === 'Resident')
const isFamily = computed(() => userRole.value === 'Family')

// 权限判断
const canViewPHI = computed(() => {
  // Manager/Admin/Nurse/Caregiver 可以查看
  // Resident/Family 不能查看
  return userType.value === 'staff'
})

const canEditPHI = computed(() => {
  // 只有 Manager/Admin 可以编辑
  return isManager.value
})

const canEditProfile = computed(() => {
  // Manager/Admin 可以编辑所有字段
  // Nurse 可以编辑 note
  return isManager.value || isNurse.value
})

const canEditContacts = computed(() => {
  // Manager/Admin/Nurse 可以编辑
  // Resident 可以编辑自己的 contacts
  // Family 可以编辑关联住户的 contacts
  return isManager.value || isNurse.value || isResident.value || isFamily.value
})

const canEdit = computed(() => {
  if (mode.value === 'create') {
    return isManager.value // 只有 Manager/Admin 可以创建
  }
  return canEditProfile.value || canEditNote.value || canEditContacts.value
})

const canEditNote = computed(() => {
  // Manager/Admin/Nurse 可以编辑 note
  return isManager.value || isNurse.value
})

// Handle tab change
const handleTabChange = (key: string) => {
  activeTab.value = key
  // 更新 URL（可选，用于支持直接访问特定 Tab）
  if (mode.value === 'create') {
    // Create 模式下，使用 query 参数而不是 params
    router.replace({
      name: 'CreateResident',
      query: { tab: key },
    })
  } else {
    // Edit/View 模式下，使用 params
  router.replace({
    name: 'ResidentProfile',
    params: { id: residentId.value, tab: key },
  })
  }
  
  // 按需加载 Tab 内容
  if (key === 'phi' && !residentData.value.phi) {
    fetchResident({ include_phi: true })
  } else if (key === 'contacts' && (!residentData.value.contacts || residentData.value.contacts.length === 0)) {
    fetchResident({ include_contacts: true })
  }
}

// Handle resident data update
const handleResidentDataUpdate = (data: Partial<Resident>) => {
  residentData.value = { ...residentData.value, ...data }
}

// Handle PHI data update
const handlePHIDataUpdate = (data: any) => {
  residentData.value.phi = { ...residentData.value.phi, ...data }
}

// Handle contacts update
const handleContactsUpdate = (contacts: any[]) => {
  residentData.value.contacts = contacts
}


// Fetch resident data
const fetchResident = async (params?: { include_phi?: boolean; include_contacts?: boolean }) => {
  // Create 模式下不需要获取数据
  if (mode.value === 'create') {
    // 初始化空数据
    residentData.value = {
      nickname: '',
      resident_account: '',
      email: '',
      phone: '',
      status: 'active',
      service_level: undefined,
      admission_date: undefined,
      family_tag: undefined,
      note: '',
    } as Resident
    return
  }

  try {
    // Check store cache first
    const cached = entitiesStore.getResidentDetail(residentId.value)
    if (cached && !entitiesStore.shouldRefreshResidentDetail(residentId.value)) {
      residentData.value = { ...cached }
      // If we need PHI or contacts and they're not in cache, fetch them
      if ((params?.include_phi && !cached.phi) || (params?.include_contacts && !cached.contacts)) {
        const result = await getResidentApi(residentId.value, params)
        residentData.value = { ...residentData.value, ...result }
        entitiesStore.setResidentDetail(residentId.value, residentData.value)
      }
    } else {
      const result = await getResidentApi(residentId.value, params)
      residentData.value = { ...result }
      entitiesStore.setResidentDetail(residentId.value, residentData.value)
    }
  } catch (error: any) {
    console.error('Failed to fetch resident:', error)
    message.error(error?.message || 'Failed to fetch resident')
    goBack()
  }
}

// Handle save
const handleSave = async () => {
  saving.value = true
  try {
    if (mode.value === 'create') {
      // Create new resident
      // 无论当前在哪个 Tab，都保存所有数据
      const createParams: CreateResidentParams = {
        first_name: residentData.value.phi?.first_name,
        last_name: residentData.value.phi?.last_name,
        nickname: residentData.value.nickname,
        resident_account: residentData.value.resident_account,
        email: residentData.value.email,
        phone: residentData.value.phone,
        status: residentData.value.status || 'active',
        service_level: residentData.value.service_level || undefined,
        admission_date: residentData.value.admission_date,
        family_tag: residentData.value.family_tag,
        note: residentData.value.note,
      }
      const result = await createResidentApi(createParams)
      
      // 如果填写了 PHI 信息，创建 PHI 记录
      if (residentData.value.phi && Object.keys(residentData.value.phi).length > 0) {
        try {
          // 移除 resident_id, phi_id, tenant_id，因为 API 会从路径参数获取或自动生成
          const phiParams: UpdateResidentPHIParams = { ...residentData.value.phi }
          delete (phiParams as any).resident_id
          delete (phiParams as any).phi_id
          delete (phiParams as any).tenant_id
          
          // 过滤掉空值
          const filteredPhiParams: UpdateResidentPHIParams = {}
          Object.keys(phiParams).forEach(key => {
            const value = (phiParams as any)[key]
            if (value !== undefined && value !== null && value !== '') {
              filteredPhiParams[key as keyof UpdateResidentPHIParams] = value
            }
          })
          
          if (Object.keys(filteredPhiParams).length > 0) {
            await updateResidentPHIApi(result.resident_id, filteredPhiParams)
            message.success('Resident and PHI data created successfully')
          } else {
            message.success('Resident created successfully')
          }
        } catch (error: any) {
          console.error('Failed to create PHI:', error)
          // PHI 创建失败不影响主流程，只显示警告
          message.warning('Resident created successfully, but PHI data creation failed. You can add it later.')
        }
      } else {
        message.success('Resident created successfully')
      }
      
      // 跳转到详情页面，并自动转为 edit 模式
      router.push({
        path: `/resident/${result.resident_id}`,
        query: { mode: 'edit' }
      })
    } else {
      // Update existing resident
      if (activeTab.value === 'profile') {
        // 权限检查：Nurse 只能更新 note 字段
        if (isNurse.value && !isManager.value) {
          const updateParams = {
            note: residentData.value.note,
          }
          await updateResidentApi(residentId.value, updateParams)
          entitiesStore.updateResident(residentId.value, updateParams)
          entitiesStore.setResidentDetail(residentId.value, { ...residentData.value, ...updateParams })
          message.success('Note updated successfully')
        } else {
          // Manager/Admin 可以更新所有字段
          const updateParams = {
            nickname: residentData.value.nickname,
            resident_account: residentData.value.resident_account,
            email: residentData.value.email,
            phone: residentData.value.phone,
            status: residentData.value.status,
            service_level: residentData.value.service_level,
            admission_date: residentData.value.admission_date,
            discharge_date: residentData.value.discharge_date,
            family_tag: residentData.value.family_tag,
            note: residentData.value.note,
          }
          await updateResidentApi(residentId.value, updateParams)
          entitiesStore.updateResident(residentId.value, updateParams)
          entitiesStore.setResidentDetail(residentId.value, { ...residentData.value, ...updateParams })
          message.success('Resident updated successfully')
        }
      } else if (activeTab.value === 'phi' && residentData.value.phi) {
        // Save PHI data
        await updateResidentPHIApi(residentId.value, residentData.value.phi)
        entitiesStore.setResidentDetail(residentId.value, residentData.value)
        message.success('PHI data updated successfully')
      }
      // Contacts are saved separately in ResidentContactsContent component
    }
  } catch (error: any) {
    console.error('Failed to save resident:', error)
    message.error(error?.message || 'Failed to save resident')
  } finally {
    saving.value = false
  }
}

// Go back
const goBack = () => {
  router.push('/residents')
}

// Watch route params/query for tab changes
watch(() => route.params.tab || route.query.tab, (newTab) => {
  if (newTab && newTab !== activeTab.value) {
    activeTab.value = newTab as string
  }
})

onMounted(async () => {
  // Create 模式下初始化空数据
  if (mode.value === 'create') {
    await fetchResident()
    return
  }

  // Load initial data
  await fetchResident()
  
  // If URL has tab parameter, load corresponding data
  const tab = (route.params.tab || route.query.tab) as string
  if (tab === 'phi') {
    await fetchResident({ include_phi: true })
  } else if (tab === 'contacts') {
    await fetchResident({ include_contacts: true })
  }
})
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #262626;
}

.form-container {
  max-width: 920px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.resident-tabs {
  margin-top: 0;
}

:deep(.ant-tabs-content-holder) {
  padding-top: 10px;
}
</style>

