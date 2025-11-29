<template>
  <a-menu
    v-model:selectedKeys="selectedKeys"
    mode="inline"
    theme="dark"
    @click="handleMenuClick"
  >
    <template v-for="element in menuElements" :key="element.key">
      <a-menu-divider v-if="element.type === 'divider'" class="custom-menu-divider" />
      <a-menu-item v-else :key="element.item.key" :disabled="!hasPermission(element.item)">
        <template #icon>
          <component v-if="getIcon(element.item.icon)" :is="getIcon(element.item.icon)" />
        </template>
        {{ element.item.label }}
      </a-menu-item>
    </template>
  </a-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { menuItems, type MenuItem } from '@/types/menu'
import * as Icons from '@ant-design/icons-vue'

defineProps<{
  collapsed: boolean
}>()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const selectedKeys = ref<string[]>([])

// Filter menu items by permission
const filteredMenuItems = computed(() => {
  const userRole = userStore.getUserInfo?.role || ''
  return filterMenuByPermission(menuItems, userRole)
})

// Convert menu items to flat array with dividers
const menuElements = computed(() => {
  const elements: Array<{ type: 'divider' | 'item'; key: string; item?: MenuItem }> = []
  filteredMenuItems.value.forEach((item, index) => {
    if (item.divider) {
      elements.push({ type: 'divider', key: `divider-${index}` })
    }
    elements.push({ type: 'item', key: item.key, item })
  })
  return elements
})

// Filter menu items by permission (flat structure, no recursion needed)
const filterMenuByPermission = (items: MenuItem[], userRole: string): MenuItem[] => {
  return items.filter((item) => {
    // Check permission
    if (item.permission && !item.permission.includes(userRole)) {
      return false
    }
    return true
  })
}

// Check if user has permission for menu item
const hasPermission = (item: MenuItem): boolean => {
  if (!item.permission) return true
  const userRole = userStore.getUserInfo?.role || ''
  return item.permission.includes(userRole)
}

// Get icon component by name
const getIcon = (iconName?: string) => {
  if (!iconName) return null
  const IconComponent = Icons[iconName as keyof typeof Icons]
  return IconComponent || null
}

// Handle menu item click
const handleMenuClick = ({ key }: { key: string }) => {
  const menuItem = findMenuItemByKey(menuItems, key)
  if (menuItem?.path) {
    router.push(menuItem.path)
  }
}

// Find menu item by key (flat structure, no recursion needed)
const findMenuItemByKey = (items: MenuItem[], key: string): MenuItem | null => {
  return items.find((item) => item.key === key) || null
}

// Update selected menu item based on current route
const updateSelectedKeys = () => {
  const path = route.path
  const menuItem = findMenuItemByPath(menuItems, path)
  if (menuItem) {
    selectedKeys.value = [menuItem.key]
  }
}

// Find menu item by path (flat structure, no recursion needed)
const findMenuItemByPath = (items: MenuItem[], path: string): MenuItem | null => {
  return items.find((item) => item.path === path) || null
}

// Watch route changes
watch(
  () => route.path,
  () => {
    updateSelectedKeys()
  },
  { immediate: true }
)

onMounted(() => {
  updateSelectedKeys()
})
</script>

<style scoped>
/* Override all menu background colors to match sidebar */
/* Ant Design Vue dark theme default: background: #001529 */
:deep(.ant-menu),
:deep(.ant-menu-dark),
:deep(.ant-menu-dark.ant-menu),
:deep(.ant-menu.ant-menu-dark) {
  background-color: #70c5e7 !important;
  background: #70c5e7 !important;
}

:deep(.ant-menu-item) {
  background-color: #70c5e7 !important;
}

:deep(.ant-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Selected menu item - darker background (only for actually selected item) */
:deep(.ant-menu-item-selected) {
  background-color: #5aa8c4 !important;
}

/* Remove borders between menu items */
:deep(.ant-menu-item) {
  border-bottom: none !important;
  margin: 0 !important;
}

/* Menu divider style - dividers inherit transparent background from global override */
:deep(.ant-menu-item-divider) {
  background: transparent !important;
  background-color: transparent !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-bottom: none !important;
  border-left: none !important;
  border-right: none !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  margin: 8px 16px !important;
  height: 1px !important;
}

/* Menu item text size - match v1.0 */
:deep(.ant-menu-item) {
  font-size: 14px;
  line-height: 40px;
  height: 40px;
}

/* Menu icon size - match v1.0 */
:deep(.ant-menu-item-icon),
:deep(.ant-menu-item .anticon) {
  font-size: 14px;
  width: 14px;
  height: 14px;
}
</style>


