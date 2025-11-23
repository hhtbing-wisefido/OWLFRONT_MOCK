<template>
  <div class="permission-matrix">
    <div class="matrix-table-wrapper">
      <table class="matrix-table">
        <thead>
          <tr>
            <th class="resource-column">Resource Type</th>
            <th class="permission-column">Permission</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resource in resourceTypes" :key="resource">
            <td class="resource-cell">{{ resource }}</td>
            <td class="permission-cell">
              <div class="permission-checkboxes">
                <a-checkbox
                  :checked="getPermissionChecked(resource, 'create')"
                  @change="handlePermissionChange(resource, 'create', $event)"
                >
                  C
                </a-checkbox>
                <a-checkbox
                  :checked="getPermissionChecked(resource, 'update')"
                  @change="handlePermissionChange(resource, 'update', $event)"
                >
                  E
                </a-checkbox>
                <a-checkbox
                  :checked="getPermissionChecked(resource, 'delete')"
                  @change="handlePermissionChange(resource, 'delete', $event)"
                >
                  D
                </a-checkbox>
                <a-checkbox
                  :checked="getPermissionChecked(resource, 'read')"
                  @change="handlePermissionChange(resource, 'read', $event)"
                >
                  R
                </a-checkbox>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import type { RolePermission, PermissionType, PermissionScope } from '@/api/admin/role-permission/model/rolePermissionModel'
import { RESOURCE_TYPES } from '@/api/admin/role-permission/model/rolePermissionModel'

interface Props {
  role: {
    code: string
    name: string
    description: string
    mainFunction: string
  }
  permissions: RolePermission[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [permissions: RolePermission[]]
}>()

// 资源类型列表（只显示表格中列出的资源）
const resourceTypes = [
  'vital_monitor', // Vital-Monitor: 是否允许查看 vitalFocus 卡片
  'roles',
  'users',
  'residents',
  'resident_phi',
  'resident_contacts',
  'resident_caregivers',
  'cloud_alarm_policies',
  'iot_monitor_alarms',
  'service_levels',
  'alarm_events',
  'rounds',
  'locations',
  'rooms',
  'beds',
  'devices',
] as const

// 当前权限数据（可编辑）
const currentPermissions = ref<RolePermission[]>(JSON.parse(JSON.stringify(props.permissions)))

// 监听 props.permissions 变化，更新 currentPermissions
watch(
  () => props.permissions,
  (newPermissions) => {
    currentPermissions.value = JSON.parse(JSON.stringify(newPermissions))
  },
  { deep: true },
)

// 获取权限是否选中
const getPermissionChecked = (resource: string, type: PermissionType): boolean => {
  // 如果该资源有 manage 权限，且类型是 R/C/E/D 之一，则显示为选中
  const hasManage = currentPermissions.value.some(
    (p) =>
      p.resource_type === resource &&
      p.role_code === props.role.code &&
      p.permission_type === 'manage' &&
      p.is_active,
  )
  
  if (hasManage && (type === 'read' || type === 'create' || type === 'update' || type === 'delete')) {
    return true
  }
  
  return currentPermissions.value.some(
    (p) =>
      p.resource_type === resource &&
      p.role_code === props.role.code &&
      p.permission_type === type &&
      p.is_active,
  )
}

// 处理权限变化
const handlePermissionChange = (resource: string, type: PermissionType, event: any) => {
  const checked = event.target.checked

  // 先获取当前该资源的所有权限类型（在修改前）
  const existingPermissions = currentPermissions.value.filter(
    (p) => p.resource_type === resource && p.role_code === props.role.code && p.is_active,
  )
  const existingTypes = existingPermissions.map((p) => p.permission_type)
  const hasManage = existingTypes.includes('manage')
  // 获取现有权限的范围（如果有），否则根据角色决定：NS 和 CG 使用 assigned_only，其他使用 all
  const currentScope = existingPermissions[0]?.scope || 
    (props.role.code === 'Nurse' || props.role.code === 'Caregiver' ? 'assigned_only' : 'all')

  // 先删除该资源的所有现有权限（设置为不活跃）
  currentPermissions.value.forEach((p) => {
    if (p.resource_type === resource && p.role_code === props.role.code) {
      p.is_active = false
    }
  })

  // 计算新的权限类型列表
  let newTypes: PermissionType[] = []
  
  if (hasManage) {
    // 如果原来有 Manage，拆分为 R+C+E+D
    if (checked) {
      // 如果选中，保持所有类型
      newTypes = ['read', 'create', 'update', 'delete']
    } else {
      // 如果取消选中，移除该类型
      newTypes = ['read', 'create', 'update', 'delete'].filter((t) => t !== type)
    }
  } else {
    // 如果原来没有 Manage，基于现有类型计算
    if (checked) {
      // 如果选中，添加新类型
      newTypes = existingTypes.filter((t) => t !== type)
      newTypes.push(type)
    } else {
      // 如果取消选中，移除该类型
      newTypes = existingTypes.filter((t) => t !== type)
    }
  }

  // 检查是否选择了 R+C+E+D，如果是则转换为 Manage
  const hasAllBasic =
    newTypes.includes('read') &&
    newTypes.includes('create') &&
    newTypes.includes('update') &&
    newTypes.includes('delete')

  if (hasAllBasic) {
    // 如果选择了 R+C+E+D，创建 Manage 权限
    const newPermission: RolePermission = {
      permission_id: `temp-${Date.now()}-${Math.random()}`,
      role_code: props.role.code,
      resource_type: resource,
      permission_type: 'manage',
      scope: currentScope,
      is_active: true,
    }
    currentPermissions.value.push(newPermission)
  } else if (newTypes.length > 0) {
    // 否则，为每个选中的类型创建单独的权限
    newTypes.forEach((t) => {
      const newPermission: RolePermission = {
        permission_id: `temp-${Date.now()}-${Math.random()}-${t}`,
        role_code: props.role.code,
        resource_type: resource,
        permission_type: t,
        scope: currentScope,
        is_active: true,
      }
      currentPermissions.value.push(newPermission)
    })
  }

  emit('update', currentPermissions.value)
}

</script>

<style scoped>
.permission-matrix {
  width: 100%;
}

.matrix-table-wrapper {
  overflow-x: auto;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.matrix-table th,
.matrix-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.matrix-table th {
  background: #fafafa;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.resource-column {
  min-width: 100px;
  max-width: 150px;
  position: sticky;
  left: 0;
  background: #fafafa;
  z-index: 2;
}

.resource-cell {
  position: sticky;
  left: 0;
  background: white;
  z-index: 1;
  font-weight: 500;
  white-space: normal;
  word-break: break-word;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.permission-column {
  width: 200px;
  min-width: 200px;
}

.permission-cell {
  padding: 8px 12px;
}

.permission-checkboxes {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
}
</style>
