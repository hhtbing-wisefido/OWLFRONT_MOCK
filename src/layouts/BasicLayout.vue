<template>
  <a-layout class="basic-layout">
    <!-- Sidebar -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :width="230"
      :collapsed-width="50"
      class="layout-sider"
      :trigger="null"
      collapsible
      theme="dark"
    >
      <Sidebar :collapsed="collapsed" @toggle="collapsed = !collapsed" />
    </a-layout-sider>

    <!-- Main content area -->
    <a-layout>
      <!-- Content area -->
      <a-layout-content class="layout-content" :class="{ 'content-collapsed': collapsed }">
        <RouterView />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'

const collapsed = ref(false)
</script>

<style scoped>
.basic-layout {
  min-height: 100vh;
}

.layout-sider {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow: auto;
  height: 100vh;
  z-index: 100;
}

.layout-content {
  margin: 10px;
  margin-left: 230px;
  background: #f0f2f5;
  min-height: 100vh;
  transition: margin-left 0.2s;
}

.layout-content.content-collapsed {
  margin-left: 50px;
}

.basic-layout :deep(.ant-layout-sider-collapsed) ~ .ant-layout .layout-content {
  margin-left: 50px;
}

/* Override Ant Design Vue dark theme background color */
.basic-layout :deep(.ant-layout-sider-dark) {
  background-color: #70c5e7 !important;
}
</style>

