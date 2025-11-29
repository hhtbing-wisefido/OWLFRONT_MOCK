<template>
  <div class="sidebar">
    <!-- Logo area: logo_icon + OwlCare -->
    <div class="sidebar-logo" :class="{ collapsed: collapsed }">
      <img src="@/assets/images/logo-icon.png" alt="OwlCare" class="logo-icon" />
      <h2 v-if="!collapsed">OwlCare</h2>
    </div>
    
    <!-- User info area: Hi, user's NickName + collapse/expand icon (row 2) -->
    <div class="sidebar-user-info" :class="{ collapsed: collapsed }">
      <div class="user-name" v-if="!collapsed">
        Hi, {{ userInfo?.nickName || userInfo?.user_account || 'User' }}
      </div>
      <a-button
        type="text"
        @click="$emit('toggle')"
        class="trigger-button"
      >
        <template #icon>
          <MenuUnfoldOutlined v-if="collapsed" />
          <MenuFoldOutlined v-else />
        </template>
      </a-button>
    </div>
    
    <!-- Actions area: tenant_name (left) + key_icon + logout_icon (right) (row 3) -->
    <div class="sidebar-actions" :class="{ collapsed: collapsed }">
      <div class="tenant-name" v-if="!collapsed">
        {{ getFirstWord(userInfo?.tenant_name) || '' }}
      </div>
      <div class="action-buttons">
        <a-button v-if="!collapsed" type="text" class="action-btn" @click="handlePasswordChange" title="Change Password">
          <template #icon>
            <LockOutlined />
          </template>
        </a-button>
        <a-button type="text" class="action-btn" @click="handleLogout" title="Logout">
          <template #icon>
            <LogoutOutlined />
          </template>
        </a-button>
      </div>
    </div>
    
    <!-- Divider before menu -->
    <div class="sidebar-divider"></div>
    
    <Menu :collapsed="collapsed" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Menu from './Menu.vue'
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/store/modules/user'

defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  toggle: []
}>()

const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.getUserInfo)

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const handlePasswordChange = () => {
  router.push('/forgot-password')
}

// Get first word from tenant name
const getFirstWord = (text?: string): string => {
  if (!text) return ''
  return text.trim().split(/\s+/)[0] || ''
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  background: #70c5e7;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 0 10px 0 16px;
  background-color: #70c5e7;
  transition: all 0.2s;
}

.sidebar-logo.collapsed {
  justify-content: center;
  padding: 0;
}

.logo-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar-logo h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: normal;
  color: #fff;
}

/* User info area: John Doe + collapse/expand icon (row 2) */
.sidebar-user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 8px 16px;
  background-color: #70c5e7;
  transition: all 0.2s;
}

.sidebar-user-info.collapsed {
  justify-content: center;
  padding: 8px 8px;
}

.user-name {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  text-align: left;
}

.trigger-button {
  color: #fff !important;
  border: none !important;
  box-shadow: none !important;
  padding: 4px 8px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
  min-width: 32px;
  height: 32px;
}

.trigger-button:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

.trigger-button :deep(.anticon) {
  font-size: 16px;
  color: #fff;
}

/* Actions area: tenant_name (left) + key_icon + logout_icon (right) (row 3) */
.sidebar-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 8px 16px;
  background-color: #70c5e7;
  transition: all 0.2s;
}

.sidebar-actions.collapsed {
  justify-content: center;
  padding: 8px 8px;
  flex-direction: column;
  gap: 8px;
}

.tenant-name {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  text-align: left;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.sidebar-actions.collapsed .action-buttons {
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  color: #fff !important;
  border: none !important;
  box-shadow: none !important;
  padding: 4px 8px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  min-width: 32px;
  height: 32px;
}

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

.action-btn :deep(.anticon) {
  font-size: 16px;
  color: #fff;
}

/* Divider before menu */
.sidebar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0;
  border: none;
}
</style>

