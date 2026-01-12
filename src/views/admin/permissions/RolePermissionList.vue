<template>
  <div class="role-permission-list">
    <div class="page-header">
      <h1>Role Permissions</h1>
      <p class="page-description">
        C (Create) | E (Edit) | D (Delete) | R (Read). 
        A: assigned_only. 
        NS and CG can only modify assigned residents. 
        Admin cannot be modified.
      </p>
    </div>

    <div class="role-cards">
      <RoleCard
        v-for="role in roles"
        :key="role.code"
        :role="role"
        :permissions="rolePermissions[role.code] || []"
        :expanded="expandedRole === role.code"
        @expand="handleExpand"
        @collapse="handleCollapse"
        @save="handleSave"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { batchCreateRolePermissionsApi, getRolePermissionsApi } from '@/api/admin/role-permission/rolePermission'
import type { RolePermission } from '@/api/admin/role-permission/model/rolePermissionModel'
// ROLES now defined in mock system, will be returned from API
import RoleCard from '@/views/admin/permissions/components/RoleCard.vue'
import { useUserStore } from '@/store/modules/user'

const SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000001'
const userStore = useUserStore()

// All roles (hide system roles on non-System tenant)
const roles = computed(() => {
  const tenantId = userStore.getUserInfo?.tenant_id
  const isSystemTenant = tenantId === SYSTEM_TENANT_ID
  if (isSystemTenant) return ROLES
  return ROLES.filter((r) => r.code !== 'SystemAdmin' && r.code !== 'SystemOperator')
})

// Expanded role
const expandedRole = ref<string | null>(null)

// All permission data
const allPermissions = ref<RolePermission[]>([])

// Permissions grouped by role
const rolePermissions = computed(() => {
  const result: Record<string, RolePermission[]> = {}
  
  roles.value.forEach((role) => {
    result[role.code] = []
  })

  allPermissions.value.forEach((perm) => {
    const roleCode = perm.role_code
    if (roleCode && result[roleCode]) {
      result[roleCode].push(perm)
    }
  })

  return result
})

// Expand details
const handleExpand = (roleCode: string) => {
  expandedRole.value = roleCode
}

// Collapse details
const handleCollapse = (roleCode: string) => {
  if (expandedRole.value === roleCode) {
    expandedRole.value = null
  }
}

// Save permissions
const handleSave = async (roleCode: string, permissions: RolePermission[]) => {
  try {
    const active = permissions.filter((p) => p.is_active)
    // Save as a batch replace (global defaults in DB: tenant_id = SystemTenantID).
    await batchCreateRolePermissionsApi({
      role_code: roleCode,
      permissions: active.map((p) => ({
        resource_type: p.resource_type,
        permission_type: p.permission_type,
        scope: p.scope,
        is_active: true,
      })),
    })
    message.success('Permissions saved successfully')
    // Refresh data
    await fetchPermissions()
  } catch (error: any) {
    console.error('Failed to save permissions:', error)
    message.error(error?.message || 'Failed to save permissions')
  }
}

// Get permission data
const fetchPermissions = async () => {
  try {
    const result = await getRolePermissionsApi()
    console.log('[RolePermissionList] Fetched permissions:', result)
    console.log('[RolePermissionList] Permissions count:', result.items.length)
    allPermissions.value = result.items
    console.log('[RolePermissionList] allPermissions.value length:', allPermissions.value.length)
  } catch (error: any) {
    console.error('Failed to fetch permissions:', error)
    message.error(error?.message || 'Failed to fetch permissions')
  }
}

onMounted(() => {
  fetchPermissions()
})
</script>

<style scoped>
.role-permission-list {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #262626;
}

.page-description {
  color: #8c8c8c;
  font-size: 14px;
  margin: 0;
}

.role-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

@media (min-width: 1200px) {
  .role-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1600px) {
  .role-cards {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
