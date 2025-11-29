# 菜单结构与文件组织调整方案

## 1. 侧边栏菜单设计

### 1.1 菜单结构（根据最终建议结构）

```
核心操作区
├── 监控总览 (/monitoring/overview)
├── 警报历史 (/alarm/history)
└── 警报设置 (/alarm/settings)

数据管理区
├── 住户管理 (/residents)
├── 照护分配 (/care-coordination/assignments)
└── 分配关系总览 (/care-coordination/resident-dashboard)

系统设置区
├── 设备管理 (/devices)
├── 单元管理 (/units)
└── 系统管理
    ├── 用户管理 (/admin/users)
    ├── 角色管理 (/admin/roles)
    ├── 权限管理 (/admin/permissions)
    └── 标签管理 (/admin/tags)
```

### 1.2 菜单组件设计

#### 文件结构
```
src/
├── layouts/
│   └── BasicLayout.vue          # 基础布局（包含侧边栏和内容区）
├── components/
│   └── layout/
│       ├── Sidebar.vue          # 侧边栏组件
│       ├── Menu.vue             # 菜单组件（可复用）
│       └── Header.vue           # 顶部导航栏（可选）
```

#### 菜单数据结构

```typescript
// src/types/menu.ts
export interface MenuItem {
  key: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
  permission?: string[] // 允许访问的角色列表
}

export const menuItems: MenuItem[] = [
  {
    key: 'monitoring',
    label: '核心操作区',
    icon: 'DashboardOutlined',
    children: [
      {
        key: 'monitoring-overview',
        label: '监控总览',
        icon: 'MonitorOutlined',
        path: '/monitoring/overview',
        permission: ['SystemAdmin', 'Admin', 'Manager', 'Nurse', 'Caregiver'],
      },
      {
        key: 'alarm-history',
        label: '警报历史',
        icon: 'AlertOutlined',
        path: '/alarm/history',
        permission: ['SystemAdmin', 'Admin', 'Manager', 'Nurse', 'Caregiver'],
      },
      {
        key: 'alarm-settings',
        label: '警报设置',
        icon: 'SettingOutlined',
        path: '/alarm/settings',
        permission: ['SystemAdmin', 'Admin', 'Manager'],
      },
    ],
  },
  {
    key: 'data-management',
    label: '数据管理区',
    icon: 'DatabaseOutlined',
    children: [
      {
        key: 'residents',
        label: '住户管理',
        icon: 'UserOutlined',
        path: '/residents',
        permission: ['SystemAdmin', 'Admin', 'Manager', 'Nurse', 'Caregiver'],
      },
      {
        key: 'care-assignments',
        label: '照护分配',
        icon: 'TeamOutlined',
        path: '/care-coordination/assignments',
        permission: ['SystemAdmin', 'Admin', 'Manager'],
      },
      {
        key: 'resident-dashboard',
        label: '分配关系总览',
        icon: 'TableOutlined',
        path: '/care-coordination/resident-dashboard',
        permission: ['SystemAdmin', 'Admin', 'Manager'],
      },
    ],
  },
  {
    key: 'system-settings',
    label: '系统设置区',
    icon: 'SettingOutlined',
    children: [
      {
        key: 'devices',
        label: '设备管理',
        icon: 'MobileOutlined',
        path: '/devices',
        permission: ['SystemAdmin', 'Admin', 'Manager', 'IT'],
      },
      {
        key: 'units',
        label: '单元管理',
        icon: 'HomeOutlined',
        path: '/units',
        permission: ['SystemAdmin', 'Admin', 'Manager', 'IT'],
      },
      {
        key: 'admin',
        label: '系统管理',
        icon: 'ControlOutlined',
        children: [
          {
            key: 'admin-users',
            label: '用户管理',
            icon: 'UserOutlined',
            path: '/admin/users',
            permission: ['SystemAdmin', 'Admin', 'IT'],
          },
          {
            key: 'admin-roles',
            label: '角色管理',
            icon: 'SafetyOutlined',
            path: '/admin/roles',
            permission: ['SystemAdmin', 'Admin', 'Manager', 'IT'],
          },
          {
            key: 'admin-permissions',
            label: '权限管理',
            icon: 'KeyOutlined',
            path: '/admin/permissions',
            permission: ['SystemAdmin', 'Admin', 'Manager', 'IT'],
          },
          {
            key: 'admin-tags',
            label: '标签管理',
            icon: 'TagOutlined',
            path: '/admin/tags',
            permission: ['SystemAdmin', 'Admin', 'IT'],
          },
        ],
      },
    ],
  },
]
```

### 1.3 侧边栏组件实现

#### BasicLayout.vue

```vue
<template>
  <a-layout class="basic-layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :width="240"
      class="layout-sider"
      :trigger="null"
      collapsible
    >
      <Sidebar :collapsed="collapsed" />
    </a-layout-sider>

    <!-- 主内容区 -->
    <a-layout>
      <!-- 顶部导航栏（可选） -->
      <a-layout-header class="layout-header">
        <Header :collapsed="collapsed" @toggle="collapsed = !collapsed" />
      </a-layout-header>

      <!-- 内容区 -->
      <a-layout-content class="layout-content">
        <RouterView />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

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
}

.layout-header {
  background: #fff;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.layout-content {
  margin-left: 240px; /* 与侧边栏宽度一致 */
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.basic-layout :deep(.ant-layout-sider-collapsed) + .ant-layout .layout-content {
  margin-left: 80px; /* 折叠后的侧边栏宽度 */
}
</style>
```

#### Sidebar.vue

```vue
<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <h2 v-if="!collapsed">OwlCare</h2>
      <h2 v-else>OC</h2>
    </div>
    <Menu :collapsed="collapsed" />
  </div>
</template>

<script setup lang="ts">
import Menu from './Menu.vue'

defineProps<{
  collapsed: boolean
}>()
</script>

<style scoped>
.sidebar {
  height: 100%;
  background: #001529;
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid #1f1f1f;
}
</style>
```

#### Menu.vue

```vue
<template>
  <a-menu
    v-model:selectedKeys="selectedKeys"
    v-model:openKeys="openKeys"
    mode="inline"
    theme="dark"
    :inline-collapsed="collapsed"
    @click="handleMenuClick"
  >
    <template v-for="item in filteredMenuItems" :key="item.key">
      <!-- 有子菜单 -->
      <a-sub-menu v-if="item.children" :key="item.key">
        <template #icon>
          <component :is="getIcon(item.icon)" />
        </template>
        <template #title>{{ item.label }}</template>
        <a-menu-item
          v-for="child in item.children"
          :key="child.key"
          :disabled="!hasPermission(child)"
        >
          <template #icon>
            <component :is="getIcon(child.icon)" />
          </template>
          {{ child.label }}
        </a-menu-item>
      </a-sub-menu>

      <!-- 无子菜单 -->
      <a-menu-item v-else :key="item.key" :disabled="!hasPermission(item)">
        <template #icon>
          <component :is="getIcon(item.icon)" />
        </template>
        {{ item.label }}
      </a-menu-item>
    </template>
  </a-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { menuItems, type MenuItem } from '@/types/menu'
import * as Icons from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const props = defineProps<{
  collapsed: boolean
}>()

const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

// 根据权限过滤菜单项
const filteredMenuItems = computed(() => {
  const userRole = userStore.getUserInfo?.role || ''
  return filterMenuByPermission(menuItems, userRole)
})

// 递归过滤菜单项
const filterMenuByPermission = (items: MenuItem[], userRole: string): MenuItem[] => {
  return items
    .map((item) => {
      // 如果有子菜单，递归过滤
      if (item.children) {
        const filteredChildren = filterMenuByPermission(item.children, userRole)
        // 如果子菜单都被过滤掉了，则隐藏父菜单
        if (filteredChildren.length === 0) {
          return null
        }
        return {
          ...item,
          children: filteredChildren,
        }
      }
      // 检查权限
      if (item.permission && !item.permission.includes(userRole)) {
        return null
      }
      return item
    })
    .filter((item): item is MenuItem => item !== null)
})

// 检查权限
const hasPermission = (item: MenuItem): boolean => {
  if (!item.permission) return true
  const userRole = userStore.getUserInfo?.role || ''
  return item.permission.includes(userRole)
}

// 获取图标组件
const getIcon = (iconName?: string) => {
  if (!iconName) return null
  const IconComponent = Icons[iconName as keyof typeof Icons]
  return IconComponent || null
}

// 菜单点击处理
const handleMenuClick = ({ key }: { key: string }) => {
  const menuItem = findMenuItemByKey(menuItems, key)
  if (menuItem?.path) {
    router.push(menuItem.path)
  }
}

// 根据 key 查找菜单项
const findMenuItemByKey = (items: MenuItem[], key: string): MenuItem | null => {
  for (const item of items) {
    if (item.key === key) {
      return item
    }
    if (item.children) {
      const found = findMenuItemByKey(item.children, key)
      if (found) return found
    }
  }
  return null
}

// 根据当前路由设置选中的菜单项
const updateSelectedKeys = () => {
  const path = route.path
  const menuItem = findMenuItemByPath(menuItems, path)
  if (menuItem) {
    selectedKeys.value = [menuItem.key]
    // 如果有父菜单，展开它
    const parent = findParentMenuItem(menuItems, menuItem.key)
    if (parent) {
      openKeys.value = [parent.key]
    }
  }
}

// 根据路径查找菜单项
const findMenuItemByPath = (items: MenuItem[], path: string): MenuItem | null => {
  for (const item of items) {
    if (item.path === path) {
      return item
    }
    if (item.children) {
      const found = findMenuItemByPath(item.children, path)
      if (found) return found
    }
  }
  return null
}

// 查找父菜单项
const findParentMenuItem = (items: MenuItem[], childKey: string): MenuItem | null => {
  for (const item of items) {
    if (item.children) {
      if (item.children.some((child) => child.key === childKey)) {
        return item
      }
      const found = findParentMenuItem(item.children, childKey)
      if (found) return found
    }
  }
  return null
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    updateSelectedKeys()
  },
  { immediate: true }
)

onMounted(() => {
  updateSelectedKeys()
})
</script>
```

## 2. 路由结构调整

### 2.1 添加布局路由

需要在路由配置中添加布局组件，将需要显示侧边栏的页面包裹在布局中。

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStoreWithOut } from '@/store/modules/user'
import BasicLayout from '@/layouts/BasicLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const userStore = useUserStoreWithOut()
      if (userStore.getToken) {
        return userStore.getUserHomePath
      }
      return '/login'
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      layout: false, // 不使用布局
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/forgot-password/ForgotPassword.vue'),
    meta: {
      title: 'Forgot Password',
      requiresAuth: false,
      layout: false, // 不使用布局
    },
  },
  // 需要布局的页面
  {
    path: '/',
    component: BasicLayout,
    children: [
      // 核心操作区
      {
        path: 'monitoring/overview',
        name: 'MonitoringOverview',
        component: () => import('@/views/monitoring/overview/Overview.vue'),
        meta: {
          title: '监控总览',
          requiresAuth: true,
        },
      },
      {
        path: 'alarm/history',
        name: 'AlarmHistory',
        component: () => import('@/views/alarm/history/AlarmHistory.vue'),
        meta: {
          title: '警报历史',
          requiresAuth: true,
        },
      },
      {
        path: 'alarm/settings',
        name: 'AlarmSettings',
        component: () => import('@/views/alarm/settings/AlarmSettings.vue'),
        meta: {
          title: '警报设置',
          requiresAuth: true,
        },
      },
      // 数据管理区
      {
        path: 'residents',
        name: 'ResidentList',
        component: () => import('@/views/residents/ResidentList.vue'),
        meta: {
          title: '住户管理',
          requiresAuth: true,
        },
      },
      {
        path: 'resident/:id',
        name: 'ResidentProfile',
        component: () => import('@/views/residents/ResidentProfile.vue'),
        meta: {
          title: '住户详情',
          requiresAuth: true,
        },
        children: [
          {
            path: '',
            redirect: { name: 'ResidentProfileTab', params: { tab: 'profile' } },
          },
          {
            path: ':tab',
            name: 'ResidentProfileTab',
            component: () => import('@/views/residents/ResidentProfile.vue'),
          },
        ],
      },
      {
        path: 'care-coordination/assignments',
        name: 'CareAssignments',
        component: () => import('@/views/care-coordination/Assignments.vue'),
        meta: {
          title: '照护分配',
          requiresAuth: true,
        },
      },
      {
        path: 'care-coordination/resident-dashboard',
        name: 'ResidentDashboard',
        component: () => import('@/views/care-coordination/ResidentDashboard.vue'),
        meta: {
          title: '分配关系总览',
          requiresAuth: true,
        },
      },
      // 系统设置区
      {
        path: 'devices',
        name: 'DeviceList',
        component: () => import('@/views/devices/DeviceList.vue'),
        meta: {
          title: '设备管理',
          requiresAuth: true,
        },
      },
      {
        path: 'units',
        name: 'UnitList',
        component: () => import('@/views/units/UnitList.vue'),
        meta: {
          title: '单元管理',
          requiresAuth: true,
        },
      },
      {
        path: 'admin/users',
        name: 'UserList',
        component: () => import('@/views/admin/users/UserList.vue'),
        meta: {
          title: '用户管理',
          requiresAuth: true,
        },
      },
      {
        path: 'admin/users/:id',
        name: 'UserDetail',
        component: () => import('@/views/admin/users/UserDetail.vue'),
        meta: {
          title: '用户详情',
          requiresAuth: true,
        },
      },
      {
        path: 'admin/roles',
        name: 'RoleList',
        component: () => import('@/views/admin/roles/RoleList.vue'),
        meta: {
          title: '角色管理',
          requiresAuth: true,
        },
      },
      {
        path: 'admin/permissions',
        name: 'RolePermissionList',
        component: () => import('@/views/admin/permissions/RolePermissionList.vue'),
        meta: {
          title: '权限管理',
          requiresAuth: true,
        },
      },
      {
        path: 'admin/tags',
        name: 'TagList',
        component: () => import('@/views/admin/tags/TagList.vue'),
        meta: {
          title: '标签管理',
          requiresAuth: true,
        },
      },
      // 兼容旧路由（重定向）
      {
        path: 'monitoring/wellness-monitor',
        redirect: '/monitoring/overview',
      },
      {
        path: 'admin/role-permissions',
        redirect: '/admin/permissions',
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStoreWithOut()
  
  if (to.meta.requiresAuth) {
    if (!userStore.getToken) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }
    
    const routePath = to.path || ''
    if (!userStore.hasPagePermission(routePath)) {
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
```

## 3. 文件命名与结构调整

### 3.1 当前文件结构分析

```
src/views/
├── admin/
│   ├── permissions/          ✅ 保持不变
│   ├── roles/                ✅ 保持不变
│   ├── tags/                 ✅ 保持不变
│   └── users/                ✅ 保持不变
├── devices/                  ✅ 保持不变
├── units/                    ✅ 保持不变
├── monitoring/
│   ├── vital-focus/          ❌ 已重命名为 wellness-monitor
│   └── wellness-monitor/     ✅ 需要重命名或调整
├── login/                    ✅ 保持不变
└── forgot-password/          ✅ 保持不变
```

### 3.2 需要调整的文件结构

#### 3.2.1 监控相关页面

**当前**：
```
monitoring/
├── vital-focus/              # 旧名称（已废弃）
└── wellness-monitor/          # 当前使用
```

**调整后**：
```
monitoring/
├── overview/                 # 监控总览（重命名 wellness-monitor）
│   └── Overview.vue
└── alarm-history/            # 警报历史（新建）
    └── AlarmHistory.vue
```

**操作**：
1. 将 `wellness-monitor/WellnessMonitor.vue` 重命名为 `overview/Overview.vue`
2. 更新路由配置（已在上面完成）
3. 删除 `vital-focus` 目录（如果已废弃）

#### 3.2.2 警报相关页面（新建）

```
alarm/
├── history/                  # 警报历史
│   └── AlarmHistory.vue
└── settings/                 # 警报设置
    └── AlarmSettings.vue
```

#### 3.2.3 住户相关页面（新建）

```
residents/
├── ResidentList.vue          # 住户列表
└── ResidentProfile.vue       # 住户详情（Tab 页面）
    ├── components/
    │   ├── ProfileTab.vue    # Profile Tab 内容
    │   ├── PHITab.vue         # PHI Tab 内容
    │   └── ContactsTab.vue    # Contacts Tab 内容
```

#### 3.2.4 照护协调相关页面（新建）

```
care-coordination/
├── Assignments.vue            # 照护分配
└── ResidentDashboard.vue     # 分配关系总览
```

#### 3.2.5 布局组件（新建）

```
layouts/
└── BasicLayout.vue            # 基础布局

components/
└── layout/
    ├── Sidebar.vue            # 侧边栏
    ├── Menu.vue               # 菜单组件
    └── Header.vue             # 顶部导航栏（可选）
```

#### 3.2.6 类型定义（新建）

```
types/
└── menu.ts                    # 菜单类型定义
```

### 3.3 文件重命名清单

| 原路径 | 新路径 | 说明 |
|--------|--------|------|
| `views/monitoring/wellness-monitor/WellnessMonitor.vue` | `views/monitoring/overview/Overview.vue` | 重命名监控总览 |
| `views/admin/permissions/RolePermissionList.vue` | 保持不变 | 路由改为 `/admin/permissions` |
| - | `views/alarm/history/AlarmHistory.vue` | 新建警报历史 |
| - | `views/alarm/settings/AlarmSettings.vue` | 新建警报设置 |
| - | `views/residents/ResidentList.vue` | 新建住户列表 |
| - | `views/residents/ResidentProfile.vue` | 新建住户详情 |
| - | `views/care-coordination/Assignments.vue` | 新建照护分配 |
| - | `views/care-coordination/ResidentDashboard.vue` | 新建分配关系总览 |
| - | `layouts/BasicLayout.vue` | 新建基础布局 |
| - | `components/layout/Sidebar.vue` | 新建侧边栏 |
| - | `components/layout/Menu.vue` | 新建菜单组件 |
| - | `types/menu.ts` | 新建菜单类型 |

### 3.4 路由重定向（兼容旧路由）

在路由配置中添加重定向，确保旧路由仍然可用：

```typescript
// 兼容旧路由
{
  path: 'monitoring/wellness-monitor',
  redirect: '/monitoring/overview',
},
{
  path: 'admin/role-permissions',
  redirect: '/admin/permissions',
},
```

## 4. 实施步骤

### 步骤 1：创建布局组件
1. 创建 `layouts/BasicLayout.vue`
2. 创建 `components/layout/Sidebar.vue`
3. 创建 `components/layout/Menu.vue`
4. 创建 `types/menu.ts`

### 步骤 2：调整路由结构
1. 更新 `router/index.ts`，添加布局路由
2. 添加新的路由配置
3. 添加路由重定向（兼容旧路由）

### 步骤 3：文件重命名和新建
1. 重命名 `wellness-monitor` → `overview`
2. 创建新的页面组件（alarm、residents、care-coordination）
3. 更新所有导入路径

### 步骤 4：更新权限配置
1. 更新 `store/modules/user.ts` 中的页面权限配置
2. 确保菜单权限与路由权限一致

### 步骤 5：测试
1. 测试侧边栏菜单显示
2. 测试菜单权限过滤
3. 测试路由跳转
4. 测试旧路由重定向

## 5. 注意事项

1. **权限一致性**：确保菜单权限配置与路由权限配置一致
2. **路由兼容性**：保留旧路由的重定向，避免影响现有链接
3. **组件复用**：Menu 组件应该可复用，支持不同的菜单结构
4. **响应式设计**：侧边栏应该支持折叠，适配不同屏幕尺寸
5. **图标使用**：使用 Ant Design Vue 的图标库，确保图标正确显示

