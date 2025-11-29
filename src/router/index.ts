import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStoreWithOut } from '@/store/modules/user'
import BasicLayout from '@/layouts/BasicLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: {
      title: 'Login',
      requiresAuth: false,
      layout: false, // Do not use layout
    },
  },
  {
    path: '/test-data',
    name: 'TestDataViewer',
    component: () => import('@/views/test/TestDataViewer.vue'),
    meta: {
      title: 'Test Data Viewer',
      requiresAuth: false,
      layout: false, // Do not use layout
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/forgot-password/ForgotPassword.vue'),
    meta: {
      title: 'Forgot Password',
      requiresAuth: false,
      layout: false, // Do not use layout
    },
  },
  // Pages that require layout
  {
    path: '/',
    component: BasicLayout,
    redirect: () => {
      const userStore = useUserStoreWithOut()
      // If logged in, redirect to home page (monitoring overview)
      if (userStore.getToken) {
        return userStore.getUserHomePath
      }
      // If not logged in, redirect to login page
      return '/login'
    },
    children: [
      // Core operations area
      {
        path: '/monitoring/overview',
        name: 'MonitoringOverview',
        component: () => import('@/views/monitoring/overview/Overview.vue'),
        meta: {
          title: 'Monitoring Overview',
          requiresAuth: true,
        },
      },
      {
        path: '/monitoring/wellness-monitor',
        name: 'WellnessMonitor',
        component: () => import('@/views/monitoring/wellness-monitor/WellnessMonitor.vue'),
        meta: {
          title: 'Wellness Monitor',
          requiresAuth: true,
        },
      },
      // Data management area
      {
        path: '/devices',
        name: 'DeviceList',
        component: () => import('@/views/devices/DeviceList.vue'),
        meta: {
          title: 'Device Management',
          requiresAuth: true,
        },
      },
      {
        path: '/units',
        name: 'UnitList',
        component: () => import('@/views/units/UnitList.vue'),
        meta: {
          title: 'Unit Management',
          requiresAuth: true,
        },
      },
      {
        path: '/unitview',
        name: 'UnitView',
        component: () => import('@/views/units/UnitView.vue'),
        meta: {
          title: 'Unit View',
          requiresAuth: true,
        },
      },
      // System settings area
      {
        path: '/admin/users',
        name: 'UserList',
        component: () => import('@/views/admin/users/UserList.vue'),
        meta: {
          title: 'User Management',
          requiresAuth: true,
        },
      },
      {
        path: '/admin/users/:id',
        name: 'UserDetail',
        component: () => import('@/views/admin/users/UserDetail.vue'),
        meta: {
          title: 'User Details',
          requiresAuth: true,
        },
      },
      {
        path: '/admin/roles',
        name: 'RoleList',
        component: () => import('@/views/admin/roles/RoleList.vue'),
        meta: {
          title: 'Role Management',
          requiresAuth: true,
        },
      },
      {
        path: '/admin/permissions',
        name: 'RolePermissionList',
        component: () => import('@/views/admin/permissions/RolePermissionList.vue'),
        meta: {
          title: 'Permission Management',
          requiresAuth: true,
        },
      },
      // Compatibility with old routes
      {
        path: '/admin/role-permissions',
        redirect: '/admin/permissions',
      },
      {
        path: '/admin/tags',
        name: 'TagList',
        component: () => import('@/views/admin/tags/TagList.vue'),
        meta: {
          title: 'Tag Management',
          requiresAuth: true,
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Route guard: Check page access permissions
router.beforeEach((to, _from, next) => {
  const userStore = useUserStoreWithOut()
  
  // Check if authentication is required
  if (to.meta.requiresAuth) {
    // Check if user is logged in
    if (!userStore.getToken) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }
    
    // Check page access permissions
    // Ensure to.path is a string type
    const routePath = to.path || ''
    if (!userStore.hasPagePermission(routePath)) {
      // No permission to access, redirect to user home page (homePath) or default home page
      const userInfo = userStore.getUserInfo
      console.warn('[Router] Permission denied:', {
        path: routePath,
        userType: userInfo?.userType,
        role: userInfo?.role,
        pagePermissions: userStore.pagePermissions,
      })
      const homePath = userStore.getUserHomePath
      next({
        path: homePath,
      })
      return
    }
  }
  
  next()
})

export default router

