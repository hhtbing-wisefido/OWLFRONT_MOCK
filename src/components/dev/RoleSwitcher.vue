<template>
  <div v-if="isDev" class="role-switcher">
    <a-select
      v-model:value="selectedRole"
      placeholder="Test Role"
      style="width: 150px;"
      size="small"
      @change="handleRoleChange"
    >
      <a-select-option v-for="option in roleOptions" :key="option.value || 'reset'" :value="option.value">
        {{ option.label }}
      </a-select-option>
    </a-select>
    <span class="role-label">Role: {{ currentRole || 'None' }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Select } from 'ant-design-vue'
import { useUserStore } from '@/store/modules/user'

const ASelect = Select
const ASelectOption = Select.Option

const isDev = import.meta.env.DEV

const userStore = useUserStore()

// Testable role list (using new role system)
const roleOptions = [
  { label: 'SystemAdmin', value: 'SystemAdmin' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Manager', value: 'Manager' },
  { label: 'IT', value: 'IT' },
  { label: 'Nurse', value: 'Nurse' },
  { label: 'Caregiver', value: 'Caregiver' },
  { label: 'Resident', value: 'Resident' },
  { label: 'Family', value: 'Family' },
  { label: 'Reset (Original)', value: null },
]

const selectedRole = ref<string | null>(null)
const testRoleKey = 'dev_test_role' // localStorage key

// Current role (test role or original role)
const currentRole = computed(() => {
  const testRole = localStorage.getItem(testRoleKey)
  if (testRole) {
    return testRole
  }
  const userInfo = userStore.getUserInfo
  return userInfo?.role || 'None'
})

// Restore previous selection from localStorage
onMounted(() => {
  const savedRole = localStorage.getItem(testRoleKey)
  if (savedRole) {
    selectedRole.value = savedRole
  }
})

// Switch role
const handleRoleChange = (role: string | null) => {
  if (role) {
    localStorage.setItem(testRoleKey, role)
  } else {
    // Reset to original role
    localStorage.removeItem(testRoleKey)
  }
  
  // Refresh page to apply new permissions
  window.location.reload()
}
</script>

<style scoped>
.role-switcher {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 12px;
}

.role-label {
  color: #666;
  font-weight: 500;
}

.role-switcher :deep(.ant-select) {
  font-size: 12px;
}
</style>

