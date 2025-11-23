import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
    },
  },
  {
    path: '/test-data',
    name: 'TestDataViewer',
    component: () => import('@/views/test/TestDataViewer.vue'),
    meta: {
      title: '测试数据查看器',
      requiresAuth: false,
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/forgot-password/ForgotPassword.vue'),
    meta: {
      title: 'Forgot Password',
      requiresAuth: false,
    },
  },
  {
    path: '/admin/roles',
    name: 'RoleList',
    component: () => import('@/views/admin/roles/RoleList.vue'),
    meta: {
      title: '角色管理',
      requiresAuth: true,
    },
  },
  {
    path: '/admin/role-permissions',
    name: 'RolePermissionList',
    component: () => import('@/views/admin/permissions/RolePermissionList.vue'),
    meta: {
      title: '角色权限管理',
      requiresAuth: true,
    },
  },
  {
    path: '/monitoring/vital-focus',
    name: 'VitalFocus',
    component: () => import('@/views/monitoring/vital-focus/VitalFocus.vue'),
    meta: {
      title: '生命体征监控',
      requiresAuth: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

