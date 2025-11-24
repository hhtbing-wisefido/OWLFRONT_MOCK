<script setup lang="ts">
import { RouterView } from 'vue-router'
import { defineAsyncComponent } from 'vue'

// 仅在开发环境加载 RoleSwitcher 组件
const RoleSwitcher = import.meta.env.DEV
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
</style>
