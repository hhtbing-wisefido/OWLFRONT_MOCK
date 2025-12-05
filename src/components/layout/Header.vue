<template>
  <div class="layout-header-wrapper">
    <div class="header-left">
      <!-- Sidebar toggle button -->
      <a-button
        type="text"
        @click="$emit('toggle')"
        class="trigger"
      >
        <template #icon>
          <MenuUnfoldOutlined v-if="collapsed" />
          <MenuFoldOutlined v-else />
        </template>
      </a-button>
      <!-- Back button -->
      <a-button
        type="text"
        @click="goBack"
        class="nav-button"
        title="Go Back"
      >
        <template #icon>
          <LeftOutlined />
        </template>
      </a-button>
      <!-- Home button -->
      <a-button
        type="text"
        @click="goHome"
        class="nav-button"
        title="Go Home"
      >
        <template #icon>
          <HomeOutlined />
        </template>
      </a-button>
      <!-- Breadcrumb navigation -->
      <a-breadcrumb class="breadcrumb" separator=">">
        <a-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index">
          <span v-if="index === breadcrumbItems.length - 1">{{ item.title }}</span>
          <a v-else @click="navigateTo(item.path)">{{ item.title }}</a>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>
    <div class="header-right">
      <span class="user-info">{{ userInfo?.name || 'User' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MenuFoldOutlined, MenuUnfoldOutlined, LeftOutlined, HomeOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { menuItems, type MenuItem } from '@/types/menu'
import { ref } from 'vue'

defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  toggle: []
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const userInfo = computed(() => userStore.getUserInfo)

const breadcrumbItems = ref<Array<{ title: string; path: string }>>([])

// Find menu item by path recursively
const findMenuItemByPath = (items: MenuItem[], targetPath: string, parents: MenuItem[] = []): MenuItem[] | null => {
  for (const item of items) {
    if (item.path === targetPath) {
      return [...parents, item]
    }
    if (item.children) {
      const found = findMenuItemByPath(item.children, targetPath, [...parents, item])
      if (found) {
        return found
      }
    }
  }
  return null
}

// Generate breadcrumb from current route
const generateBreadcrumb = () => {
  const path = route.path
  
  // Skip breadcrumb for login and other non-layout pages
  if (route.meta?.layout === false || path === '/login' || path === '/forgot-password' || path === '/test-data') {
    breadcrumbItems.value = []
    return
  }
  
  // Try to find menu items matching the current path
  const matchedMenuItems = findMenuItemByPath(menuItems, path)
  
  if (matchedMenuItems && matchedMenuItems.length > 0) {
    // Filter out items without path (parent categories)
    const itemsWithPath = matchedMenuItems.filter(item => item.path)
    breadcrumbItems.value = itemsWithPath.map(item => ({
      title: item.label,
      path: item.path!
    }))
  } else {
    // Fallback: use route matched records
    const matched = route.matched.filter(record => record.meta?.title && record.path !== '/')
    if (matched.length > 0) {
      breadcrumbItems.value = matched.map(record => ({
        title: (record.meta?.title as string) || record.name?.toString() || '',
        path: record.path
      }))
    } else {
      // Last resort: use route meta title or path
      const title = (route.meta?.title as string) || route.name?.toString() || path.split('/').pop() || 'Home'
      breadcrumbItems.value = [{ title, path }]
    }
  }
}

// Watch route changes
watch(() => route.path, () => {
  generateBreadcrumb()
}, { immediate: true })

// Navigate to breadcrumb path
const navigateTo = (path: string) => {
  if (path) {
    router.push(path)
  }
}

// Go back to previous page
const goBack = () => {
  window.history.go(-1)
}

// Go to home page
const goHome = () => {
  const homePath = userInfo.value?.homePath || '/monitoring/overview'
  router.push(homePath)
}
</script>

<style scoped>
.layout-header-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 !important;
  margin: 0 !important;
  height: 48px;
  width: 100%;
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 !important;
  margin: 0 !important;
  margin-left: 0 !important;
  flex-shrink: 0;
}

.trigger {
  display: flex !important;
  height: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  cursor: pointer;
  align-items: center !important;
  justify-content: flex-start !important;
  transition: color 0.3s;
  flex-shrink: 0;
  width: 40px !important;
  min-width: 40px !important;
  max-width: 40px !important;
}

.trigger :deep(.ant-btn) {
  padding: 0 10px 0 0 !important;
  margin: 0 !important;
  margin-left: 0 !important;
  padding-left: 0 !important;
  border: none !important;
  border-left: none !important;
  box-shadow: none !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  min-width: auto !important;
}

.trigger :deep(.anticon) {
  font-size: 16px !important;
  margin: 0 !important;
  padding: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.trigger:hover {
  color: #1890ff;
  background-color: #f6f6f6;
}

.nav-button {
  display: flex;
  height: 100%;
  padding: 0 10px;
  cursor: pointer;
  align-items: center;
  transition: color 0.3s;
  color: rgba(0, 0, 0, 0.85);
  flex-shrink: 0;
}

.nav-button :deep(.anticon) {
  font-size: 18px;
}

.nav-button:hover {
  color: #1890ff;
  background-color: #f6f6f6;
}

.breadcrumb {
  margin-left: 8px;
}

.breadcrumb :deep(.ant-breadcrumb-link) {
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
}

.breadcrumb :deep(.ant-breadcrumb-link a) {
  color: rgba(0, 0, 0, 0.65);
}

.breadcrumb :deep(.ant-breadcrumb-link a:hover) {
  color: #1890ff;
}

.breadcrumb :deep(.ant-breadcrumb-separator) {
  color: rgba(0, 0, 0, 0.45);
  margin: 0 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-right: 16px;
  flex-shrink: 0;
}

.user-info {
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
}
</style>

