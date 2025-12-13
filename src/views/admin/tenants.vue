<template>
  <TenantList :system-tenant-id="SYSTEM_TENANT_ID" />
</template>

<script setup lang="ts">
import TenantList from './tenants/TenantList.vue'

// IMPORTANT: do not use all-zero UUID; it's reserved as "unassigned" sentinel in DB design.
const SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000001'
</script>


