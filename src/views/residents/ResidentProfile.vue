<template>
  <div style="padding: 15px">
    <div class="page-header">
      <div class="header-left">
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
          <a-button 
            v-if="canEdit" 
            type="default" 
            @click="handleCancel"
            :disabled="saving"
          >
            Cancel
          </a-button>
          <a-button 
            v-if="canEdit" 
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
        <!-- Profile Tab (only for Manager, Admin, Nurse, Caregiver, IT) -->
        <a-tab-pane v-if="canViewProfile" key="profile" tab="Profile">
          <ResidentProfileContent 
            ref="profileContentRef"
            :resident-data="residentData"
            :mode="mode"
            :readonly="!canEditProfile"
          />
        </a-tab-pane>

        <!-- PHI Tab（根据权限显示，Manager/Admin 在 Create 模式下也可以填写） -->
        <a-tab-pane 
          v-if="canViewPHI" 
          key="phi" 
          tab="PHI"
        >
          <ResidentPHIContent 
            ref="phiContentRef"
            :resident-id="residentId || 'new'"
            :phi-data="residentData.phi"
            :readonly="!canEditPHI"
            :mode="mode"
          />
        </a-tab-pane>

        <!-- Contacts Tab (only for Manager, Admin, Nurse, Caregiver, Resident) -->
        <a-tab-pane v-if="canViewContacts" key="contacts" tab="Contacts">
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
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons-vue'
import ResidentProfileContent from './components/ResidentProfileContent.vue'
import ResidentPHIContent from './components/ResidentPHIContent.vue'
import ResidentContactsContent from './components/ResidentContactsContent.vue'
import { getResidentApi, createResidentApi, updateResidentApi, updateResidentPHIApi, updateResidentContactApi } from '@/api/resident/resident'
import type { Resident, CreateResidentParams, UpdateResidentPHIParams, ResidentContact } from '@/api/resident/model/residentModel'
import { useUserStore } from '@/store/modules/user'
import { useEntitiesStore } from '@/store/modules/entities'
import { usePermission } from '@/hooks/usePermission'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const entitiesStore = useEntitiesStore()
const { hasManagePermission, hasRole } = usePermission()

// 判断模式：create / edit / view
// 注意：需要在 isManager 和 isNurse 定义之后才能使用
const mode = computed(() => {
  if (route.name === 'CreateResident') return 'create'
  if (route.query.mode === 'edit') return 'edit'
  // 如果有编辑权限且有 resident ID，默认视为 edit 模式
  if ((isManager.value || isNurse.value) && route.params.id) return 'edit'
  return 'view'
})

const residentId = computed(() => {
  if (mode.value === 'create') return ''
  return route.params.id as string
})

const residentData = ref<Resident>({} as Resident)
const saving = ref(false)
// Store original data for cancel functionality
const originalResidentData = ref<Resident>({} as Resident)

const userInfo = computed(() => userStore.getUserInfo)
const userRole = computed(() => userInfo.value?.role || '')
const userType = computed(() => userInfo.value?.userType || '')

// 角色判断
const isManager = computed(() => hasManagePermission.value || hasRole(['Manager']))
const isNurse = computed(() => hasRole(['Nurse']))
const isResident = computed(() => userType.value === 'resident' && userRole.value === 'Resident')
const isFamily = computed(() => userRole.value === 'Family')

// Initialize activeTab based on permissions
const initialTab = (route.params.tab as string) || (route.query.tab as string) || 'profile'
// Check user permissions to determine default tab
const userInfoForTab = userStore.getUserInfo
const canViewProfileForTab = hasManagePermission.value || hasRole(['Manager', 'Nurse', 'Caregiver', 'IT'])
const canViewContactsForTab = hasManagePermission.value || hasRole(['Manager', 'Nurse', 'Caregiver']) || (userInfoForTab?.userType === 'resident' && userInfoForTab?.role === 'Resident')
const canViewPHIForTab = hasManagePermission.value || hasRole(['Manager', 'Nurse', 'Caregiver'])

// Determine default tab based on permissions
let defaultTab = initialTab
if (initialTab === 'profile' && !canViewProfileForTab) {
  // If profile not allowed, use first available tab
  defaultTab = canViewContactsForTab ? 'contacts' : (canViewPHIForTab ? 'phi' : 'profile')
} else if (initialTab === 'contacts' && !canViewContactsForTab) {
  // If contacts not allowed, use first available tab
  defaultTab = canViewProfileForTab ? 'profile' : (canViewPHIForTab ? 'phi' : 'contacts')
}
const activeTab = ref<string>(defaultTab)

// 权限判断 - 明确允许的角色列表
const canViewProfile = computed(() => {
  // 明确允许的角色：Manager, Admin, Nurse, Caregiver, IT
  return isManager.value || isNurse.value || hasRole(['Caregiver', 'IT'])
})

const canViewPHI = computed(() => {
  // 明确允许的角色：Manager, Admin, Nurse, Caregiver
  return isManager.value || isNurse.value || hasRole(['Caregiver'])
})

const canEditPHI = computed(() => {
  // 明确允许的角色：只有 Manager/Admin 可以编辑
  return isManager.value
})

const canEditProfile = computed(() => {
  // 明确允许的角色：Manager/Admin 可以编辑所有字段，Nurse 可以编辑 note
  return isManager.value || isNurse.value
})

const canViewContacts = computed(() => {
  // 明确允许的角色：Manager, Admin, Nurse, Caregiver, Resident
  return isManager.value || isNurse.value || hasRole(['Caregiver']) || isResident.value
})

const canEditContacts = computed(() => {
  // 明确允许的角色：Manager, Admin, Nurse, Resident
  return isManager.value || isNurse.value || isResident.value
})

const canEdit = computed(() => {
  if (mode.value === 'create') {
    return isManager.value // 只有 Manager/Admin 可以创建
  }
  // Family 不能编辑任何内容
  if (isFamily.value) {
    return false
  }
  return canEditProfile.value || canEditNote.value || canEditContacts.value
})

const canEditNote = computed(() => {
  // Manager/Admin/Nurse 可以编辑 note
  return isManager.value || isNurse.value
})

// Handle tab change
const handleTabChange = (key: string) => {
  // Check permissions before allowing tab change
  if (key === 'profile' && !canViewProfile.value) {
    message.warning('You do not have permission to access Profile tab')
    // Redirect to first available tab
    if (canViewContacts.value) {
      activeTab.value = 'contacts'
      key = 'contacts'
    } else if (canViewPHI.value) {
      activeTab.value = 'phi'
      key = 'phi'
    } else {
      return // No tabs available
    }
  } else if (key === 'contacts' && !canViewContacts.value) {
    message.warning('You do not have permission to access Contacts tab')
    // Redirect to first available tab
    if (canViewProfile.value) {
      activeTab.value = 'profile'
      key = 'profile'
    } else if (canViewPHI.value) {
      activeTab.value = 'phi'
      key = 'phi'
    } else {
      return // No tabs available
    }
  } else {
    activeTab.value = key
  }
  
  // 更新 URL（可选，用于支持直接访问特定 Tab）
  if (mode.value === 'create') {
    // Create 模式下，使用 query 参数而不是 params
    router.replace({
      name: 'CreateResident',
      query: { tab: key },
    })
  } else {
    // Edit/View 模式下，使用 query 参数（路由定义不支持 tab params）
    router.replace({
      name: 'ResidentProfile',
      params: { id: residentId.value },
      query: { tab: key },
    })
  }
  
  // 按需加载 Tab 内容
  if (key === 'phi' && !residentData.value.phi) {
    fetchResident({ include_phi: true })
  } else if (key === 'contacts' && (!residentData.value.contacts || residentData.value.contacts.length === 0)) {
    fetchResident({ include_contacts: true })
  }
}

// Refs to child components (to read data on save)
const profileContentRef = ref<InstanceType<typeof ResidentProfileContent> | null>(null)
const phiContentRef = ref<InstanceType<typeof ResidentPHIContent> | null>(null)


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
      originalResidentData.value = { ...cached } // Store original for cancel
      // If we need PHI or contacts and they're not in cache, fetch them
      if ((params?.include_phi && !cached.phi) || (params?.include_contacts && !cached.contacts)) {
        const result = await getResidentApi(residentId.value, params)
        residentData.value = { ...residentData.value, ...result }
        originalResidentData.value = { ...residentData.value } // Store original for cancel
        entitiesStore.setResidentDetail(residentId.value, residentData.value)
      }
    } else {
      // Always fetch to get caregivers data (even if no specific params)
      const result = await getResidentApi(residentId.value, params)
      residentData.value = { ...result }
      originalResidentData.value = { ...result } // Store original for cancel
      entitiesStore.setResidentDetail(residentId.value, residentData.value)
    }
  } catch (error: any) {
    console.error('Failed to fetch resident:', error)
    message.error(error?.message || 'Failed to fetch resident')
    goBack()
  }
}

// Handle contacts update from ResidentContactsContent component
const handleContactsUpdate = (contacts: ResidentContact[]) => {
  residentData.value.contacts = contacts
}

// Handle cancel - abandon changes, don't save, don't create
const handleCancel = () => {
  if (mode.value === 'create') {
    // Create mode: go back to list (abandon creation)
    goBack()
  } else {
    // Edit mode: reset to original data (abandon changes)
    if (Object.keys(originalResidentData.value).length > 0) {
      residentData.value = { ...originalResidentData.value }
      message.info('Changes cancelled')
    } else {
      // If no original data, refresh from server
      fetchResident()
      message.info('Changes cancelled')
    }
  }
}

// Handle save - unified save for all tabs
const handleSave = async () => {
  saving.value = true
  try {
    // Read data directly from child components (only on save, not on every input)
    const profileData = profileContentRef.value?.getResidentData?.() || {}
    // getPHIData is async in ResidentPHIContent, so we need to await it
    const phiDataFromProfile = profileContentRef.value?.getPHIData?.() || {}
    const phiDataFromPHI = await phiContentRef.value?.getPHIData?.() || {}
    const phiData = { ...phiDataFromProfile, ...phiDataFromPHI }
    const password = profileContentRef.value?.getPassword?.()
    
    if (mode.value === 'create') {
      // Validate required fields
      if (!phiData.first_name || !phiData.first_name.trim()) {
        message.error('First name is required')
        saving.value = false
        // Switch to PHI tab to show the error
        activeTab.value = 'phi'
        return
      }
      
      // Create new resident - save all data from all tabs
      const createParams: CreateResidentParams = {
        first_name: phiData.first_name.trim(),
        last_name: phiData.last_name?.trim() || undefined,
        nickname: profileData.nickname,
        resident_account: profileData.resident_account,
        email: profileData.email,
        phone: profileData.phone,
        status: profileData.status || 'active',
        service_level: profileData.service_level || undefined,
        admission_date: profileData.admission_date,
        family_tag: profileData.family_tag,
        note: profileData.note,
      }
      const result = await createResidentApi(createParams)
      
      // Save PHI data if provided
      if (phiData && Object.keys(phiData).length > 0) {
        try {
          const phiParams: UpdateResidentPHIParams = { ...phiData }
          delete (phiParams as any).resident_id
          delete (phiParams as any).phi_id
          delete (phiParams as any).tenant_id
          
          const filteredPhiParams: UpdateResidentPHIParams = {}
          Object.keys(phiParams).forEach(key => {
            const value = (phiParams as any)[key]
            // Include null values (for deleting fields like resident_email/resident_phone when Save is unchecked)
            // Exclude undefined (field not modified) and empty strings (convert to null for consistency)
            if (value !== undefined) {
              // Convert empty string to null for consistency
              filteredPhiParams[key as keyof UpdateResidentPHIParams] = (value === '' ? null : value)
            }
          })
          
          if (Object.keys(filteredPhiParams).length > 0) {
            await updateResidentPHIApi(result.resident_id, filteredPhiParams)
          }
        } catch (error: any) {
          console.error('Failed to create PHI:', error)
          message.warning('Resident created successfully, but PHI data creation failed. You can add it later.')
        }
      }
      
      // Contacts are already included in createParams above (if provided)
      
      // Save caregivers if provided (after resident is created)
      const caregiversData = profileContentRef.value?.getCaregiversData?.()
      if (caregiversData && (caregiversData.userList?.length > 0 || caregiversData.groupList?.length > 0)) {
        try {
          await updateResidentApi(result.resident_id, {
            caregivers: caregiversData,
          })
        } catch (error: any) {
          console.error('Failed to save caregivers:', error)
          message.warning('Resident created successfully, but caregivers assignment failed. You can add it later.')
        }
      }
      
      message.success('Resident created successfully')
      
      // 跳转到详情页面，并自动转为 edit 模式
      router.push({
        path: `/resident/${result.resident_id}`,
        query: { mode: 'edit' }
      })
    } else {
      // Update existing resident - save all data from all tabs
      const updatePromises: Promise<any>[] = []
      
      // 1. Update Profile data
      if (isNurse.value && !isManager.value) {
        // Nurse 只能更新 note 字段
        updatePromises.push(
          updateResidentApi(residentId.value, {
            note: profileData.note,
          })
        )
      } else {
        // Manager/Admin 可以更新所有字段
        const updateParams: any = {
          nickname: profileData.nickname,
          resident_account: profileData.resident_account,
          email: profileData.email,
          phone: profileData.phone,
          status: profileData.status,
          service_level: profileData.service_level,
          admission_date: profileData.admission_date,
          discharge_date: profileData.discharge_date,
          family_tag: profileData.family_tag,
          note: profileData.note,
        }
        
        // Add caregivers data if available
        const caregiversData = profileContentRef.value?.getCaregiversData?.()
        if (caregiversData) {
          updateParams.caregivers = caregiversData
        }
        
        updatePromises.push(updateResidentApi(residentId.value, updateParams))
      }
      
      // 2. Update password if provided
      if (password) {
        try {
          const { resetResidentPasswordApi } = await import('@/api/resident/resident')
          await resetResidentPasswordApi(residentId.value, password)
        } catch (error: any) {
          console.error('Failed to reset password:', error)
          message.warning('Resident updated successfully, but password reset failed.')
        }
      }
      
      // 3. Update PHI data if exists (read from child component)
      if (phiData && Object.keys(phiData).length > 0) {
        const phiParams: UpdateResidentPHIParams = { ...phiData }
        delete (phiParams as any).resident_id
        delete (phiParams as any).phi_id
        delete (phiParams as any).tenant_id
        
        // Filter out undefined values, but keep null values (for deleting fields)
        // Convert empty strings to null for consistency
        const filteredPhiParams: UpdateResidentPHIParams = {}
        Object.keys(phiParams).forEach(key => {
          const value = (phiParams as any)[key]
          // Include null values (for deleting fields like resident_email/resident_phone when Save is unchecked)
          // Exclude undefined (field not modified) and empty strings (convert to null for consistency)
          if (value !== undefined) {
            // Convert empty string to null for consistency
            filteredPhiParams[key as keyof UpdateResidentPHIParams] = (value === '' ? null : value)
          }
        })
        
        if (Object.keys(filteredPhiParams).length > 0) {
          updatePromises.push(
            updateResidentPHIApi(residentId.value, filteredPhiParams)
          )
        }
      }
      
      // 4. Update Contacts if exists (save each contact individually)
      if (residentData.value.contacts && residentData.value.contacts.length > 0) {
        const { hashAccount } = await import('@/utils/crypto')
        const contactPromises = residentData.value.contacts
          .filter(contact => contact.is_enabled || contact.contact_first_name || contact.contact_last_name)
          .map(async (contact) => {
              const params: any = {
                slot: contact.slot,
                is_enabled: contact.is_enabled || false,
                contact_first_name: contact.contact_first_name,
                contact_last_name: contact.contact_last_name,
                relationship: contact.relationship,
                contact_family_tag: contact.contact_family_tag,
                receive_sms: contact.receive_sms || false,
                receive_email: contact.receive_email || false,
              }
              
              // Handle contact_phone: always calculate hash if has value (for login)
              // If save_phone is checked, send contact_phone; if not checked, send null to delete
              if (contact.contact_phone && contact.contact_phone.trim()) {
                params.phone_hash = await hashAccount(contact.contact_phone)
                // If save_phone is checked, send contact_phone; if not, send null to delete existing phone
                if (contact.save_phone) {
                  params.contact_phone = contact.contact_phone
                } else {
                  params.contact_phone = null // Explicitly delete phone when save is unchecked
                }
              } else {
                params.contact_phone = null
                params.phone_hash = null
              }
              
              // Handle contact_email: always calculate hash if has value (for login)
              // If save_email is checked, send contact_email; if not checked, send null to delete
              if (contact.contact_email && contact.contact_email.trim()) {
                params.email_hash = await hashAccount(contact.contact_email)
                // If save_email is checked, send contact_email; if not, send null to delete existing email
                if (contact.save_email) {
                  params.contact_email = contact.contact_email
                } else {
                  params.contact_email = null // Explicitly delete email when save is unchecked
                }
              } else {
                params.contact_email = null
                params.email_hash = null
              }
              
              if (contact.contact_id) {
                params.contact_id = contact.contact_id
              }
              return updateResidentContactApi(residentId.value, params)
            })
        updatePromises.push(...contactPromises)
      }
      
      // Execute all updates in parallel
      await Promise.all(updatePromises)
      
      // Clear cache and reload data from server to get latest saved values
      // This ensures the UI displays the actual saved data from database
      // Delete from cache to force refresh
      const cacheMap = entitiesStore.residentDetailsCache
      if (cacheMap.has(residentId.value)) {
        cacheMap.delete(residentId.value)
      }
      
      // Reload data from server with all tabs data to get latest saved values
      await fetchResident({ include_phi: true, include_contacts: true })
      
      // Update store with fresh data
      entitiesStore.updateResident(residentId.value, {
        nickname: residentData.value.nickname,
        status: residentData.value.status,
        service_level: residentData.value.service_level,
      })
      
      // Update original data after successful save
      originalResidentData.value = { ...residentData.value }
      
      message.success('All data saved successfully')
    }
  } catch (error: any) {
    console.error('Failed to save resident:', error)
    message.error(error?.message || 'Failed to save resident')
  } finally {
    saving.value = false
  }
}

// Go back - refresh residents list from DB
const goBack = () => {
  // Force refresh by adding timestamp query parameter
  router.push({
    path: '/residents',
    query: { _refresh: Date.now() }
  })
}

// Go home - refresh monitoring overview from DB
const goHome = () => {
  // Force refresh by adding timestamp query parameter
  router.push({
    name: 'MonitoringOverview',
    query: { _refresh: Date.now() }
  })
}

// Watch route params/query for tab changes
watch(() => route.params.tab || route.query.tab, (newTab) => {
  if (newTab && newTab !== activeTab.value) {
    // Check permissions before allowing tab change
    if (newTab === 'profile' && !canViewProfile.value) {
      // Redirect to first available tab
      if (canViewContacts.value) {
        router.replace({
          name: 'ResidentProfile',
          params: { id: residentId.value },
          query: { tab: 'contacts' },
        })
        activeTab.value = 'contacts'
      } else if (canViewPHI.value) {
        router.replace({
          name: 'ResidentProfile',
          params: { id: residentId.value },
          query: { tab: 'phi' },
        })
        activeTab.value = 'phi'
      }
    } else if (newTab === 'contacts' && !canViewContacts.value) {
      // Redirect to first available tab
      if (canViewProfile.value) {
        router.replace({
          name: 'ResidentProfile',
          params: { id: residentId.value },
          query: { tab: 'profile' },
        })
        activeTab.value = 'profile'
      } else if (canViewPHI.value) {
        router.replace({
          name: 'ResidentProfile',
          params: { id: residentId.value },
          query: { tab: 'phi' },
        })
        activeTab.value = 'phi'
      }
    } else {
      activeTab.value = newTab as string
    }
  }
})

// Watch residentId changes (when navigating between different residents)
watch(
  () => residentId.value,
  async (newId, oldId) => {
    // Only reload if residentId actually changed (not on initial mount)
    if (newId && newId !== oldId && mode.value !== 'create') {
      // Load initial data - Profile tab also needs PHI data for first_name/last_name display
      await fetchResident({ include_phi: true })
      
      // If URL has tab parameter, load corresponding data
      const tab = (route.params.tab || route.query.tab) as string
      if (tab === 'contacts') {
        await fetchResident({ include_contacts: true })
      }
    }
  }
)

onMounted(async () => {
  // Create 模式下初始化空数据
  if (mode.value === 'create') {
    await fetchResident()
    return
  }

  // Ensure activeTab is valid based on permissions
  if (activeTab.value === 'profile' && !canViewProfile.value) {
    // Redirect to first available tab
    if (canViewContacts.value) {
      activeTab.value = 'contacts'
      router.replace({
        name: 'ResidentProfile',
        params: { id: residentId.value },
        query: { tab: 'contacts' },
      })
    } else if (canViewPHI.value) {
      activeTab.value = 'phi'
      router.replace({
        name: 'ResidentProfile',
        params: { id: residentId.value },
        query: { tab: 'phi' },
      })
    }
  } else if (activeTab.value === 'contacts' && !canViewContacts.value) {
    // Redirect to first available tab
    if (canViewProfile.value) {
      activeTab.value = 'profile'
      router.replace({
        name: 'ResidentProfile',
        params: { id: residentId.value },
        query: { tab: 'profile' },
      })
    } else if (canViewPHI.value) {
      activeTab.value = 'phi'
      router.replace({
        name: 'ResidentProfile',
        params: { id: residentId.value },
        query: { tab: 'phi' },
      })
    }
  }

  // Load initial data - Profile tab also needs PHI data for first_name/last_name display
  // For resident users, only load contacts data
  if (isResident.value) {
    await fetchResident({ include_contacts: true })
  } else {
    await fetchResident({ include_phi: true })
    
    // If URL has tab parameter, load corresponding data
    const tab = (route.params.tab || route.query.tab) as string
    if (tab === 'contacts') {
      await fetchResident({ include_contacts: true })
    }
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

