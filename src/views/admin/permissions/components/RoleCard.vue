<template>
  <div class="role-card" :class="{ expanded: expanded }">
    <!-- 卡片头部 -->
    <div class="card-header" @click="toggleExpand">
      <div class="card-title">
        <h3>{{ role.name }}</h3>
        <span class="card-subtitle">{{ role.description }}</span>
      </div>
            <div class="card-actions">
              <div class="action-buttons">
                <a-button type="link" size="small" @click.stop="toggleExpand">
                  {{ expanded ? 'Collapse' : 'View Details' }}
                </a-button>
                <a-button v-if="expanded" type="primary" size="small" @click.stop="handleSave" class="save-button">
                  Save
                </a-button>
              </div>
            </div>
    </div>

    <!-- 主要功能描述 -->
    <div class="main-function">
      <div class="function-item">
        <span class="function-icon">•</span>
        <span>{{ role.mainFunction }}</span>
      </div>
    </div>

    <!-- 主要权限列表 -->
    <div class="main-permissions">
      <div v-for="(permission, index) in mainPermissions" :key="index" class="permission-item">
        <span class="permission-icon">•</span>
        <span>{{ permission }}</span>
      </div>
    </div>

    <!-- 展开的详情区域 -->
    <div v-if="expanded" class="card-details">
      <!-- 权限矩阵表格 -->
      <PermissionMatrix
        :role="role"
        :permissions="permissions"
        @update="handlePermissionUpdate"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { RolePermission } from '@/api/admin/role-permission/model/rolePermissionModel'
import PermissionMatrix from './PermissionMatrix.vue'

interface Props {
  role: {
    code: string
    name: string
    description: string
    mainFunction: string
  }
  permissions: RolePermission[]
  expanded: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  expand: [roleCode: string]
  collapse: [roleCode: string]
  save: [roleCode: string, permissions: RolePermission[]]
}>()

// 主要权限描述
const mainPermissions = computed(() => {
  const perms = props.permissions.filter((p) => p.is_active)
  const descriptions: string[] = []

  // 根据权限矩阵生成主要权限描述
  if (props.role.code === 'Director' || props.role.code === 'DON') {
    if (perms.some((p) => p.resource_type === 'users' && p.permission_type === 'manage')) {
      descriptions.push('User Management')
    }
    if (perms.some((p) => p.resource_type === 'residents' && p.permission_type === 'manage')) {
      descriptions.push('Resident Management')
    }
    if (perms.some((p) => p.resource_type === 'devices' && (p.permission_type === 'manage' || p.permission_type === 'read'))) {
      descriptions.push('Device Management')
    }
    if (perms.some((p) => p.resource_type === 'alarm_events' && (p.permission_type === 'manage' || p.permission_type === 'read'))) {
      descriptions.push('Alarm Management')
    }
    if (perms.some((p) => p.resource_type === 'rounds' && (p.permission_type === 'manage' || p.permission_type === 'read'))) {
      descriptions.push('Rounds Management')
    }
    if (perms.some((p) => p.resource_type === 'locations' && (p.permission_type === 'manage' || p.permission_type === 'read'))) {
      descriptions.push('Location Management')
    }
  } else if (props.role.code === 'CM') {
    if (perms.some((p) => p.resource_type === 'users' && p.permission_type === 'manage')) {
      descriptions.push('User Management')
    }
    if (perms.some((p) => p.resource_type === 'residents' && p.permission_type === 'manage')) {
      descriptions.push('Resident Management')
    }
    if (perms.some((p) => p.resource_type === 'alarm_events' && p.permission_type === 'manage')) {
      descriptions.push('Alarm Management')
    }
    if (perms.some((p) => p.resource_type === 'rounds' && p.permission_type === 'manage')) {
      descriptions.push('Rounds Management')
    }
  } else if (props.role.code === 'CS') {
    if (perms.some((p) => p.resource_type === 'residents' && p.permission_type === 'manage')) {
      descriptions.push('Resident Management')
    }
    if (perms.some((p) => p.resource_type === 'alarm_events' && p.permission_type === 'manage')) {
      descriptions.push('Alarm Management')
    }
    if (perms.some((p) => p.resource_type === 'rounds' && p.permission_type === 'manage')) {
      descriptions.push('Rounds Management')
    }
  } else if (props.role.code === 'CO') {
    if (perms.some((p) => p.resource_type === 'roles' && p.permission_type === 'manage')) {
      descriptions.push('Role Permission Management')
    }
    if (perms.some((p) => p.resource_type === 'users' && p.permission_type === 'read')) {
      descriptions.push('User View')
    }
    if (perms.some((p) => p.resource_type === 'residents' && p.permission_type === 'read')) {
      descriptions.push('Resident View')
    }
    if (perms.some((p) => p.resource_type === 'alarm_events' && p.permission_type === 'read')) {
      descriptions.push('Alarm View')
    }
    if (perms.some((p) => p.resource_type === 'service_levels' && p.permission_type === 'read')) {
      descriptions.push('Service Level View')
    }
  } else if (props.role.code === 'Nurse') {
    if (perms.some((p) => p.resource_type === 'residents' && p.permission_type === 'manage' && p.scope === 'assigned_only')) {
      descriptions.push('Resident Management (Assigned)')
    }
    if (perms.some((p) => p.resource_type === 'alarm_events' && p.permission_type === 'read' && p.scope === 'assigned_only')) {
      descriptions.push('Alarm Handling (Assigned)')
    }
    if (perms.some((p) => p.resource_type === 'rounds' && p.permission_type === 'create' && p.scope === 'assigned_only')) {
      descriptions.push('Rounds (Assigned)')
    }
    if (perms.some((p) => p.resource_type === 'locations' && p.permission_type === 'read')) {
      descriptions.push('Location View')
    }
  } else if (props.role.code === 'Caregiver') {
    if (perms.some((p) => p.resource_type === 'residents' && p.permission_type === 'read' && p.scope === 'assigned_only')) {
      descriptions.push('Resident View (Assigned)')
    }
    if (perms.some((p) => p.resource_type === 'alarm_events' && p.permission_type === 'read' && p.scope === 'assigned_only')) {
      descriptions.push('Alarm View (Assigned)')
    }
    if (perms.some((p) => p.resource_type === 'rounds' && p.permission_type === 'create' && p.scope === 'assigned_only')) {
      descriptions.push('Rounds (Assigned)')
    }
    if (perms.some((p) => p.resource_type === 'locations' && p.permission_type === 'read' && p.scope === 'assigned_only')) {
      descriptions.push('Location View (Assigned)')
    }
  } else if (props.role.code === 'IT') {
    if (perms.some((p) => p.resource_type === 'users' && p.permission_type === 'manage')) {
      descriptions.push('User Management')
    }
    if (perms.some((p) => p.resource_type === 'devices' && p.permission_type === 'manage')) {
      descriptions.push('Device Management')
    }
    if (perms.some((p) => p.resource_type === 'locations' && p.permission_type === 'manage')) {
      descriptions.push('Location Management')
    }
    if (perms.some((p) => p.resource_type === 'residents' && p.permission_type === 'read')) {
      descriptions.push('Resident View')
    }
    if (perms.some((p) => p.resource_type === 'iot_monitor_alarms' && p.permission_type === 'manage')) {
      descriptions.push('Device Configuration')
    }
  }

  return descriptions
})

// 当前编辑的权限（用于保存）
const editedPermissions = ref<RolePermission[]>([])

// 初始化编辑权限数据
watch(
  () => props.expanded,
  (newVal) => {
    if (newVal) {
      editedPermissions.value = JSON.parse(JSON.stringify(props.permissions))
    }
  },
  { immediate: true },
)

// 切换展开/收起
const toggleExpand = () => {
  if (props.expanded) {
    emit('collapse', props.role.code)
  } else {
    emit('expand', props.role.code)
  }
}

// 权限更新
const handlePermissionUpdate = (updatedPermissions: RolePermission[]) => {
  editedPermissions.value = updatedPermissions
}

// 保存权限
const handleSave = () => {
  emit('save', props.role.code, editedPermissions.value)
}
</script>

<style scoped>
.role-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  overflow: hidden;
}

.role-card.expanded {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #262626;
}

.card-subtitle {
  font-size: 14px;
  color: #8c8c8c;
}

.card-actions {
  display: flex;
  align-items: flex-start;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.save-button {
  margin-top: 0;
}

.main-function {
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.function-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #595959;
  font-weight: 500;
}

.function-icon {
  color: #1890ff;
  margin-right: 8px;
  font-weight: bold;
}

.main-permissions {
  padding: 20px;
}

.permission-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #595959;
}

.permission-item:last-child {
  margin-bottom: 0;
}

.permission-icon {
  color: #1890ff;
  margin-right: 8px;
  font-weight: bold;
}

.card-details {
  border-top: 1px solid #f0f0f0;
  padding: 20px;
  background: #fafafa;
}

.details-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
}

.details-actions {
  display: flex;
  gap: 8px;
}
</style>

