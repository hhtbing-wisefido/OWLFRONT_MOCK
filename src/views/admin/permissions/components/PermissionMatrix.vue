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

// Resource type list (only show resources listed in table)
const resourceTypes = [
  'vital_monitor', // Vital-Monitor: whether to allow viewing wellnessMonitor cards
  'roles',
  'role_permissions',
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

// Current permission data (editable)
const currentPermissions = ref<RolePermission[]>(JSON.parse(JSON.stringify(props.permissions)))

// Watch props.permissions changes, update currentPermissions
watch(
  () => props.permissions,
  (newPermissions) => {
    currentPermissions.value = JSON.parse(JSON.stringify(newPermissions))
  },
  { deep: true },
)

// Get whether permission is checked
const getPermissionChecked = (resource: string, type: PermissionType): boolean => {
  // If the resource has manage permission, and type is one of R/C/E/D, show as checked
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

// Handle permission changes
const handlePermissionChange = (resource: string, type: PermissionType, event: any) => {
  const checked = event.target.checked

  // First get all permission types for this resource (before modification)
  const existingPermissions = currentPermissions.value.filter(
    (p) => p.resource_type === resource && p.role_code === props.role.code && p.is_active,
  )
  const existingTypes = existingPermissions.map((p) => p.permission_type)
  const hasManage = existingTypes.includes('manage')
  // Get existing permission scope (if any), otherwise decide based on role: NS and CG use assigned_only, others use all
  const currentScope = existingPermissions[0]?.scope || 
    (props.role.code === 'Nurse' || props.role.code === 'Caregiver' ? 'assigned_only' : 'all')

  // First delete all existing permissions for this resource (set as inactive)
  currentPermissions.value.forEach((p) => {
    if (p.resource_type === resource && p.role_code === props.role.code) {
      p.is_active = false
    }
  })

  // Calculate new permission type list
  let newTypes: PermissionType[] = []
  
  if (hasManage) {
    // If originally had Manage, split into R+C+E+D
    if (checked) {
      // If checked, keep all types
      newTypes = ['read', 'create', 'update', 'delete']
    } else {
      // If unchecked, remove this type
      newTypes = ['read', 'create', 'update', 'delete'].filter((t) => t !== type)
    }
  } else {
    // If originally didn't have Manage, calculate based on existing types
    if (checked) {
      // If checked, add new type
      newTypes = existingTypes.filter((t) => t !== type)
      newTypes.push(type)
    } else {
      // If unchecked, remove this type
      newTypes = existingTypes.filter((t) => t !== type)
    }
  }

  // Check if R+C+E+D are all selected, if so convert to Manage
  const hasAllBasic =
    newTypes.includes('read') &&
    newTypes.includes('create') &&
    newTypes.includes('update') &&
    newTypes.includes('delete')

  if (hasAllBasic) {
    // If R+C+E+D are all selected, create Manage permission
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
    // Otherwise, create separate permission for each selected type
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
