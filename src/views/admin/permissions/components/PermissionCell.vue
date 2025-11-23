<template>
  <div class="permission-cell-content">
    <div v-if="permissions.length > 0" class="permission-badges">
      <span
        v-for="(perm, index) in permissions"
        :key="index"
        class="permission-badge"
        :class="getPermissionClass(perm.permission_type)"
      >
        {{ getPermissionLabel(perm.permission_type) }}
      </span>
      <span
        v-if="permissions[0] && permissions[0].scope !== 'all'"
        class="permission-scope"
      >
        ({{ getScopeLabel(permissions[0].scope) }})
      </span>
    </div>
    <span v-else class="permission-type no-permission">-</span>
  </div>
</template>

<script lang="ts" setup>
import type { RolePermission, PermissionType, PermissionScope } from '@/api/admin/role-permission/model/rolePermissionModel'

interface Props {
  permissions: RolePermission[]
  resource: string
  role: string
}

defineProps<Props>()

const getPermissionLabel = (type: PermissionType): string => {
  const labels: Record<PermissionType, string> = {
    manage: 'M',
    read: 'R',
    create: 'C',
    update: 'E',
    delete: 'D',
  }
  return labels[type] || '-'
}

const getPermissionClass = (type: PermissionType): string => {
  const classes: Record<PermissionType, string> = {
    manage: 'permission-manage',
    read: 'permission-read',
    create: 'permission-create',
    update: 'permission-update',
    delete: 'permission-delete',
  }
  return classes[type] || ''
}

const getScopeLabel = (scope: PermissionScope): string => {
  const labels: Record<PermissionScope, string> = {
    all: '',
    assigned_only: 'A',
    location_tag: 'L',
  }
  return labels[scope] || ''
}
</script>

<style scoped>
.permission-cell-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.permission-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  align-items: center;
}

.permission-badge {
  font-weight: 600;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  min-width: 24px;
  text-align: center;
}

.permission-manage {
  background: #1890ff;
  color: white;
}

.permission-read {
  background: #52c41a;
  color: white;
}

.permission-create {
  background: #faad14;
  color: white;
}

.permission-update {
  background: #722ed1;
  color: white;
}

.permission-delete {
  background: #ff4d4f;
  color: white;
}

.permission-type {
  font-weight: 600;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  min-width: 32px;
  text-align: center;
}

.no-permission {
  background: #f0f0f0;
  color: #8c8c8c;
}

.permission-scope {
  font-size: 11px;
  color: #8c8c8c;
  margin-left: 4px;
}
</style>
