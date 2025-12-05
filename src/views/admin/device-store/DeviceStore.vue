<template>
  <div class="page-container">
    <a-card>
      <template #title>
        <span>Device Store</span>
      </template>
      <template #extra>
        <a-button type="primary" @click="handleCreate">Create Device</a-button>
      </template>
      
      <div class="content-wrapper">
        <p>Device Store - Manage all devices (system-level)</p>
        <p style="color: #999; margin-top: 16px;">This page allows SystemAdmin to manage all devices in the system.</p>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'

const handleCreate = () => {
  message.info('Create device functionality will be implemented')
}
</script>

<style scoped>
.page-container {
  padding: 16px;
}

.content-wrapper {
  padding: 24px;
  text-align: center;
}
</style>

