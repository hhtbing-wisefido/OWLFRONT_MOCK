<script setup lang="ts">
import { RouterView } from 'vue-router'
import { defineAsyncComponent } from 'vue'

// Dev-only helper. Disable when running against real backend (non-mock),
// otherwise it will override real permissions and confuse testing.
const RoleSwitcher = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'
  ? defineAsyncComponent(() => import('@/components/dev/RoleSwitcher.vue'))
  : null
</script>

<template>
  <RouterView />
  <RoleSwitcher v-if="RoleSwitcher" />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Global style to ensure trigger button stays at left edge */
.layout-header-wrapper .header-left {
  padding: 0 !important;
  margin: 0 !important;
  margin-left: 0 !important;
}

.layout-header-wrapper .trigger {
  padding: 0 !important;
  margin: 0 !important;
  margin-left: 0 !important;
  width: 40px !important;
  min-width: 40px !important;
  max-width: 40px !important;
}

.layout-header-wrapper .trigger .ant-btn {
  padding: 0 10px 0 0 !important;
  margin: 0 !important;
  margin-left: 0 !important;
  justify-content: flex-start !important;
  border-left: none !important;
}

.layout-header-wrapper .trigger .anticon {
  margin: 0 !important;
  padding: 0 !important;
  margin-left: 0 !important;
}

/* Ensure no gap between sidebar and header */
.ant-layout-header {
  padding: 0 !important;
  margin: 0 !important;
}

.ant-layout {
  margin: 0 !important;
  padding: 0 !important;
}

/* Global style to override Ant Design Vue dark theme divider background */
/* Override all possible selectors including nested ones */
.ant-menu-item-divider,
.ant-menu-dark .ant-menu-item-divider,
.ant-menu-dark.ant-menu .ant-menu-item-divider,
.ant-menu-dark.ant-menu-inline .ant-menu-item-divider,
.ant-menu-dark.ant-menu-inline-collapsed .ant-menu-item-divider,
.ant-menu .ant-menu-item-divider,
.ant-menu-inline .ant-menu-item-divider,
.ant-layout-sider-dark .ant-menu-item-divider,
.ant-layout-sider-dark .ant-menu-dark .ant-menu-item-divider,
.ant-layout-sider-dark .ant-menu-dark.ant-menu .ant-menu-item-divider {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-bottom: none !important;
  border-left: none !important;
  border-right: none !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
