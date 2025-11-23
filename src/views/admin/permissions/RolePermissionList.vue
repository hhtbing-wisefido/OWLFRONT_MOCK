<template>
  <div class="role-permission-list">
    <div class="page-header">
      <h1>Role Permissions</h1>
      <p class="page-description">C (Create) | E (Edit) | D (Delete) | R (Read). NS and CG can only modify assigned residents. Admin cannot be modified.</p>
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
import { getRolePermissionsApi } from '@/api/admin/role-permission/rolePermission'
import type { RolePermission } from '@/api/admin/role-permission/model/rolePermissionModel'
import { ROLES } from '@test/admin/role-permissions/data'
import RoleCard from './components/RoleCard.vue'

// 所有角色
const roles = ROLES

// 展开的角色
const expandedRole = ref<string | null>(null)

// 所有权限数据
const allPermissions = ref<RolePermission[]>([])

// 按角色分组的权限
const rolePermissions = computed(() => {
  const result: Record<string, RolePermission[]> = {}
  
  roles.forEach((role) => {
    result[role.code] = []
  })

  allPermissions.value.forEach((perm) => {
    if (result[perm.role_code]) {
      result[perm.role_code].push(perm)
    }
  })

  return result
})

// 展开详情
const handleExpand = (roleCode: string) => {
  expandedRole.value = roleCode
}

// 收起详情
const handleCollapse = (roleCode: string) => {
  if (expandedRole.value === roleCode) {
    expandedRole.value = null
  }
}

// 保存权限
const handleSave = async (roleCode: string, permissions: RolePermission[]) => {
  try {
    // TODO: 实现保存逻辑
    console.log('Save permissions for role:', roleCode, permissions)
    message.success('Permissions saved successfully')
    // 刷新数据
    await fetchPermissions()
  } catch (error: any) {
    console.error('Failed to save permissions:', error)
    message.error(error?.message || 'Failed to save permissions')
  }
}

// 获取权限数据
const fetchPermissions = async () => {
  try {
    const result = await getRolePermissionsApi()
    allPermissions.value = result.items
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
