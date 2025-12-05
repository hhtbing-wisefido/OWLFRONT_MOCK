import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStoreWithOut } from '@/store/modules/user'
import BasicLayout from '@/layouts/BasicLayout.vue'

const routes: RouteRecordRaw[] = [
  // ==================== 基础路由（无需认证） ====================
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: {
      title: 'Login',
      requiresAuth: false,
      layout: false,
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/forgot-password/ForgotPassword.vue'),
    meta: {
      title: 'Forgot Password',
      requiresAuth: false,
      layout: false,
    },
  },
  {
    path: '/test-data',
    name: 'TestDataViewer',
    component: () => import('@/views/test/TestDataViewer.vue'),
    meta: {
      title: 'Test Data Viewer',
      requiresAuth: false,
      layout: false,
    },
  },
  
  // ==================== 需要布局和认证的路由 ====================
  {
    path: '/',
    component: BasicLayout,
    redirect: '/monitoring/overview',
    children: [
      // ==================== 【核心操作区域】 ====================
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
        path: '/alarm/records',
        name: 'AlarmRecords',
        component: () => import('@/views/alarm/AlarmRecord.vue'),
        meta: {
          title: 'Alarm Records',
          requiresAuth: true,
        },
      },
      {
        path: '/alarm/cloud',
        name: 'AlarmCloud',
        component: () => import('@/views/alarm/AlarmCloud.vue'),
        meta: {
          title: 'Alarm Cloud',
          requiresAuth: true,
        },
      },
      
      // ==================== 【数据管理区域】 ====================
      {
        path: '/residents',
        name: 'ResidentList',
        component: () => import('@/views/residents/ResidentList.vue'),
        meta: {
          title: 'Resident Management',
          requiresAuth: true,
        },
      },
      {
        path: '/residents/create',
        name: 'CreateResident',
        component: () => import('@/views/residents/ResidentProfile.vue'),
        meta: {
          title: 'Create Resident',
          requiresAuth: true,
        },
      },
      {
        path: '/resident/:id/profile',
        name: 'ResidentProfile',
        component: () => import('@/views/residents/ResidentProfile.vue'),
        meta: {
          title: 'Resident Profile',
          requiresAuth: true,
        },
      },
      {
        path: '/resident/:id/phi',
        name: 'ResidentPHI',
        component: () => import('@/views/residents/ResidentProfile.vue'),
        meta: {
          title: 'Resident PHI',
          requiresAuth: true,
        },
      },
      {
        path: '/resident/:id/contacts',
        name: 'ResidentContacts',
        component: () => import('@/views/residents/ResidentProfile.vue'),
        meta: {
          title: 'Resident Contacts',
          requiresAuth: true,
        },
      },
      {
        path: '/care-coordination/card-overview',
        name: 'CardOverview',
        component: () => import('@/views/care-coordination/card-overview/CardOverview.vue'),
        meta: {
          title: 'Card Overview',
          requiresAuth: true,
        },
      },
      
      // ==================== 【系统设置区域】 ====================
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
        path: '/admin/device-store',
        name: 'DeviceStore',
        component: () => import('@/views/admin/device-store/DeviceStore.vue'),
        meta: {
          title: 'Device Store',
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
      
      // ==================== 其他功能路由 ====================
      {
        path: '/monitoring/detail/:cardId',
        name: 'CardDetail',
        component: () => import('@/views/monitoring/detail/Detail.vue'),
        meta: {
          title: 'Card Detail',
          requiresAuth: true,
        },
      },
      // Legacy routes - redirect to new routes
      {
        path: '/monitoring/vital-focus/:cardId',
        name: 'VitalFocusDetailLegacy',
        redirect: (to) => {
          return `/monitoring/detail/${to.params.cardId}`
        },
      },
      {
        path: '/monitoring/wellness-monitor/:cardId',
        name: 'WellnessMonitorDetailLegacy',
        redirect: (to) => {
          return `/monitoring/detail/${to.params.cardId}`
        },
      },
      
      // ==================== 兼容旧路由 ====================
      {
        path: '/resident/:id/:tab?',
        name: 'ResidentProfileLegacy',
        redirect: (to) => {
          const tab = to.params.tab || 'profile'
          return `/resident/${to.params.id}/${tab}`
        },
      },
      
      // ==================== Device Monitor Settings ====================
      {
        path: '/settings/monitor/sleepace/:deviceId',
        name: 'SleepaceMonitorSettings',
        component: () => import('@/views/settings/sleepace-monitor-settings.vue'),
        meta: {
          title: 'Sleepace Monitor Settings',
          requiresAuth: true,
        },
      },
      {
        path: '/settings/monitor/radar/:deviceId',
        name: 'RadarMonitorSettings',
        component: () => import('@/views/settings/radar-monitor-settings.vue'),
        meta: {
          title: 'Radar Monitor Settings',
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

// Route guard: Check authentication and permissions
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
    
    // Initialize permissions if not already initialized
    if (Object.keys(userStore.pagePermissions).length === 0) {
      userStore.initPagePermissions()
    }
    
    // Check page access permissions for all routes that require auth
    const routePath = to.path || ''
    if (!userStore.hasPagePermission(routePath)) {
      // No permission to access, redirect to user home page
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


