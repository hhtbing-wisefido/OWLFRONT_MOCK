import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStoreWithOut } from '@/store/modules/user'

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
    path: '/admin/users',
    name: 'UserList',
    component: () => import('@/views/admin/users/UserList.vue'),
    meta: {
      title: '用户管理',
      requiresAuth: true,
    },
  },
  {
    path: '/admin/users/:id',
    name: 'UserDetail',
    component: () => import('@/views/admin/users/UserDetail.vue'),
    meta: {
      title: '用户详情',
      requiresAuth: true,
    },
  },
  {
    path: '/admin/tags',
    name: 'TagList',
    component: () => import('@/views/admin/tags/TagList.vue'),
    meta: {
      title: '标签管理',
      requiresAuth: true,
    },
  },
  {
    path: '/devices',
    name: 'DeviceList',
    component: () => import('@/views/devices/DeviceList.vue'),
    meta: {
      title: '设备管理',
      requiresAuth: true,
    },
  },
  {
    path: '/units',
    name: 'UnitList',
    component: () => import('@/views/units/UnitList.vue'),
    meta: {
      title: '单元管理',
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

// 路由守卫：检查页面访问权限
router.beforeEach((to, from, next) => {
  const userStore = useUserStoreWithOut()
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 检查是否已登录
    if (!userStore.getToken) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }
    
    // 检查页面访问权限
    // 确保 to.path 是字符串类型
    const routePath = to.path || ''
    if (!userStore.hasPagePermission(routePath)) {
      // 无权限访问，重定向到用户首页（homePath）或默认首页
      const homePath = userStore.getUserHomePath()
      next({
        path: homePath,
      })
      return
    }
  }
  
  next()
})

export default router

