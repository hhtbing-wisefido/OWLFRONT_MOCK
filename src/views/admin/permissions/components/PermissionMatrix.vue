<template>
  <div class="permission-matrix">
    <div v-if="loadingResourceTypes" class="loading-wrapper">
      <a-spin size="large" tip="Loading resource types..." />
    </div>
    <div v-else class="matrix-table-wrapper">
      <table class="matrix-table">
        <thead>
          <tr>
            <th class="resource-column">Resource Type</th>
            <th class="permission-column">
              <div class="permission-header">
                <span>C</span>
                <span class="assigned-label">A</span>
              </div>
            </th>
            <th class="permission-column">
              <div class="permission-header">
                <span>E</span>
                <span class="assigned-label">A</span>
              </div>
            </th>
            <th class="permission-column">
              <div class="permission-header">
                <span>D</span>
                <span class="assigned-label">A</span>
              </div>
            </th>
            <th class="permission-column">
              <div class="permission-header">
                <span>R</span>
                <span class="assigned-label">A</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resource in resourceTypes" :key="resource">
            <td class="resource-cell">{{ resource }}</td>
            <td class="permission-cell">
              <div class="permission-checkbox-wrapper">
                <div class="checkbox-with-label">
                  <a-checkbox
                    :checked="getPermissionChecked(resource, 'create')"
                    @change="handlePermissionChange(resource, 'create', $event)"
                  />
                  <span class="checkbox-label">C</span>
                </div>
                <div class="checkbox-with-label">
                  <a-checkbox
                    :checked="getAssignedOnlyChecked(resource, 'create')"
                    :disabled="!getPermissionChecked(resource, 'create')"
                    @change="handleAssignedOnlyChange(resource, 'create', $event)"
                    class="assigned-checkbox"
                  />
                  <span class="checkbox-label">A</span>
                </div>
              </div>
            </td>
            <td class="permission-cell">
              <div class="permission-checkbox-wrapper">
                <div class="checkbox-with-label">
                  <a-checkbox
                    :checked="getPermissionChecked(resource, 'update')"
                    @change="handlePermissionChange(resource, 'update', $event)"
                  />
                  <span class="checkbox-label">E</span>
                </div>
                <div class="checkbox-with-label">
                  <a-checkbox
                    :checked="getAssignedOnlyChecked(resource, 'update')"
                    :disabled="!getPermissionChecked(resource, 'update')"
                    @change="handleAssignedOnlyChange(resource, 'update', $event)"
                    class="assigned-checkbox"
                  />
                  <span class="checkbox-label">A</span>
                </div>
              </div>
            </td>
            <td class="permission-cell">
              <div class="permission-checkbox-wrapper">
                <div class="checkbox-with-label">
                  <a-checkbox
                    :checked="getPermissionChecked(resource, 'delete')"
                    @change="handlePermissionChange(resource, 'delete', $event)"
                  />
                  <span class="checkbox-label">D</span>
                </div>
                <div class="checkbox-with-label">
                  <a-checkbox
                    :checked="getAssignedOnlyChecked(resource, 'delete')"
                    :disabled="!getPermissionChecked(resource, 'delete')"
                    @change="handleAssignedOnlyChange(resource, 'delete', $event)"
                    class="assigned-checkbox"
                  />
                  <span class="checkbox-label">A</span>
                </div>
              </div>
            </td>
            <td class="permission-cell">
              <div class="permission-checkbox-wrapper">
                <div class="checkbox-with-label">
                  <a-checkbox
                    :checked="getPermissionChecked(resource, 'read')"
                    @change="handlePermissionChange(resource, 'read', $event)"
                  />
                  <span class="checkbox-label">R</span>
                </div>
                <div class="checkbox-with-label">
                  <a-checkbox
                    :checked="getAssignedOnlyChecked(resource, 'read')"
                    :disabled="!getPermissionChecked(resource, 'read')"
                    @change="handleAssignedOnlyChange(resource, 'read', $event)"
                    class="assigned-checkbox"
                  />
                  <span class="checkbox-label">A</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { RolePermission, PermissionType, PermissionScope } from '@/api/admin/role-permission/model/rolePermissionModel'
import { getResourceTypesApi } from '@/api/admin/role-permission/rolePermission'

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

// Resource type list - fetched from API (no hardcoding)
const resourceTypes = ref<string[]>([])
const loadingResourceTypes = ref(false)

// Fetch resource types from API
const fetchResourceTypes = async () => {
  try {
    loadingResourceTypes.value = true
    const result = await getResourceTypesApi()
    resourceTypes.value = result.resource_types || []
    console.log('[PermissionMatrix] Fetched resource types:', resourceTypes.value)
  } catch (error: any) {
    console.error('[PermissionMatrix] Failed to fetch resource types:', error)
    message.error(error?.message || 'Failed to fetch resource types')
    // Fallback to empty array if API fails
    resourceTypes.value = []
  } finally {
    loadingResourceTypes.value = false
  }
}

// Fetch resource types when component is mounted
onMounted(() => {
  fetchResourceTypes()
})

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

// Get whether assigned_only is checked for a specific permission
const getAssignedOnlyChecked = (resource: string, type: PermissionType): boolean => {
  // If permission is not checked, assigned_only checkbox should be disabled (not checked)
  if (!getPermissionChecked(resource, type)) {
    return false
  }

  // Check if this specific permission has assigned_only scope
  const permission = currentPermissions.value.find(
    (p) =>
      p.resource_type === resource &&
      p.role_code === props.role.code &&
      p.permission_type === type &&
      p.is_active,
  )

  // If has manage permission, check all individual permissions
  const hasManage = currentPermissions.value.some(
    (p) =>
      p.resource_type === resource &&
      p.role_code === props.role.code &&
      p.permission_type === 'manage' &&
      p.is_active,
  )

  if (hasManage) {
    // For manage permission, check if any individual permission has assigned_only
    const managePermission = currentPermissions.value.find(
      (p) =>
        p.resource_type === resource &&
        p.role_code === props.role.code &&
        p.permission_type === 'manage' &&
        p.is_active,
    )
    return managePermission?.scope === 'assigned_only'
  }

  return permission?.scope === 'assigned_only'
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
  // Get existing permission scope (if any), preserve the current scope
  // If no existing permission, default to 'all' (assigned_only will be set via A checkbox)
  const currentScope = existingPermissions[0]?.scope || 'all'

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

// Handle assigned_only change
const handleAssignedOnlyChange = (resource: string, type: PermissionType, event: any) => {
  const checked = event.target.checked
  const newScope: PermissionScope = checked ? 'assigned_only' : 'all'

  // Find all permissions for this resource and type
  const permissions = currentPermissions.value.filter(
    (p) =>
      p.resource_type === resource &&
      p.role_code === props.role.code &&
      p.permission_type === type &&
      p.is_active,
  )

  // Update scope for all matching permissions
  permissions.forEach((p) => {
    p.scope = newScope
  })

  // If has manage permission, update scope for all individual permissions
  const managePermission = currentPermissions.value.find(
    (p) =>
      p.resource_type === resource &&
      p.role_code === props.role.code &&
      p.permission_type === 'manage' &&
      p.is_active,
  )

  if (managePermission) {
    // Update manage permission scope
    managePermission.scope = newScope
    // Also update all individual permissions that might be created from manage
    currentPermissions.value.forEach((p) => {
      if (
        p.resource_type === resource &&
        p.role_code === props.role.code &&
        p.is_active &&
        (p.permission_type === 'read' || p.permission_type === 'create' || p.permission_type === 'update' || p.permission_type === 'delete')
      ) {
        p.scope = newScope
      }
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
  width: 60px;
  min-width: 60px;
  text-align: center;
  padding: 8px 4px;
}

.permission-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.permission-header span {
  font-weight: 600;
}

.assigned-label {
  font-size: 11px;
  color: #666;
  font-weight: normal;
}

.permission-cell {
  padding: 8px 2px;
  text-align: center;
}

.permission-checkbox-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.checkbox-with-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.checkbox-label {
  font-size: 14px;
  font-weight: 500;
  user-select: none;
}

.assigned-checkbox {
  font-size: 11px;
}

.assigned-checkbox + .checkbox-label {
  font-size: 11px;
  color: #666;
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 40px;
}
</style>
