# 住户管理功能设计文档

## 功能概述

住户管理功能用于管理系统中的住户信息，包括住户基本信息、健康信息（PHI）、紧急联系人等。支持不同角色的权限控制，确保数据安全和合规性。

## 最终建议结构

```
# 核心操作区
/monitoring
  /overview          # 总览（当前 wellness-monitor）
  /alarm-history     # 监控视角的警报历史（可选，或合并到 /alarm/history）

/alarm
  /history           # 警报历史（统一入口）
  /settings          # 警报设置

# 数据管理区
/residents           # 住户列表页面（主要入口）
  - 表格显示所有住户
  - 搜索、筛选、分页
  - 点击行或"查看详情"按钮 → /resident/:id

/resident/:id        # 住户详情页面（使用 Tab 标签页）
  - Profile（档案，默认 Tab）
  - PHI（健康信息，Tab）
  - Contacts（联系人，Tab）

/care-coordination
  /assignments       # 照护分配
  /resident-dashboard # 汇总表（分配关系总览）

# 系统设置区
/devices             # 设备管理
/units               # 单元管理
/admin
  /users             # 用户管理
  /roles             # 角色管理
  /role-permissions  # 角色权限
  /tags              # 标签管理
```

## 路由结构

### 路由配置

```typescript
{
  path: '/residents',
  name: 'ResidentList',
  component: () => import('@/views/residents/ResidentList.vue'),
  meta: {
    title: '住户管理',
    requiresAuth: true,
  },
},
{
  path: '/resident/:id',
  name: 'ResidentProfile',
  component: () => import('@/views/residents/ResidentProfile.vue'),
  meta: {
    title: '住户详情',
    requiresAuth: true,
  },
  // 使用嵌套路由支持 Tab 切换（可选，也可以使用组件内 Tab）
  children: [
    {
      path: '',
      name: 'ResidentProfileDefault',
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
  path: '/care-coordination/assignments',
  name: 'CareAssignments',
  component: () => import('@/views/care-coordination/Assignments.vue'),
  meta: {
    title: '照护分配',
    requiresAuth: true,
  },
},
{
  path: '/care-coordination/resident-dashboard',
  name: 'ResidentDashboard',
  component: () => import('@/views/care-coordination/ResidentDashboard.vue'),
  meta: {
    title: '分配关系总览',
    requiresAuth: true,
  },
},
```



┌─────────────────────────────────────────┐
│  Residents Management                   │
├─────────────────────────────────────────┤
│  [搜索框] [筛选] [创建住户]              │
├─────────────────────────────────────────┤
│  昵称    | 房间  | 状态  | 操作          │
│  John    | E203 | Active| [查看详情]     │
│  Mary    | E204 | Active| [查看详情]     │
│  ...                                    │
└─────────────────────────────────────────┘

## 页面设计

### 1. 住户列表页面 (`/residents`)

#### 功能描述
- 显示所有住户的基本信息
- 支持搜索、筛选、分页
- 点击行或"查看详情"按钮跳转到详情页
- 支持创建、编辑、删除住户（根据权限）

#### 页面布局

```
┌─────────────────────────────────────────┐
│  Residents Management                   │
├─────────────────────────────────────────┤
│  [搜索框] [筛选] [创建住户]              │
├─────────────────────────────────────────┤
│  昵称    | 房间  | 状态  | 操作          │
│  John    | E203 | Active| [查看详情]     │
│  Mary    | E204 | Active| [查看详情]     │
│  ...                                    │
└─────────────────────────────────────────┘
```

#### 表格列设计

| 列名 | 字段 | 说明 |
|------|------|------|
| **昵称** | `nickname` | 住户昵称（不包含真实姓名） |
| **房间** | `unit_name` | 单元名称（如 "E203"） |
| **位置** | `location_tag` + `unit_name` | 位置标签 + 单元名称（如 "A 院区主楼 - E203"） |
| **状态** | `status` | Active / Discharged / Transferred |
| **护理级别** | `service_level` | 护理级别标识 |
| **入住日期** | `admission_date` | 入住日期 |
| **操作** | - | 查看详情、编辑、删除 |

#### 搜索和筛选
- **搜索框**：支持按昵称、房间号搜索
- **状态筛选**：Active / Discharged / Transferred
- **护理级别筛选**：按护理级别筛选
- **分页**：支持分页显示

#### 交互流程
```
1. Manager 进入 /residents
   ↓
2. 看到住户列表（表格）
   ↓
3. 可以搜索、筛选
   ↓
4. 点击某一行或"查看详情"按钮
   ↓
5. 跳转到 /resident/:id（默认显示 Profile Tab）
```

### 2. 住户详情页面 (`/resident/:id`) - Tab 标签页方式

#### 功能描述
- 显示单个住户的完整信息
- 使用 Tab 标签页切换：Profile（档案）、PHI（健康信息）、Contacts（联系人）
- Profile 作为默认 Tab
- 支持编辑（根据权限）

#### 页面布局

```
┌─────────────────────────────────────────────────────────┐
│  ← Back  Resident Detail - John Doe                     │
├─────────────────────────────────────────────────────────┤
│  [档案] [健康信息] [联系人]  ← Tab 标签栏                │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Profile Tab Content (当前显示)                  │   │
│  │  - 基本信息                                       │   │
│  │  - 入住日期                                       │   │
│  │  - 护理级别                                       │   │
│  │  - 状态                                           │   │
│  │  - 备注                                           │   │
│  │  ...                                             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Tab 标签页说明

**1. Profile（档案）Tab - 默认显示**

**显示字段**：
- 昵称（`nickname`）
- 入住日期（`admission_date`）
- 护理级别（`service_level`）
- 状态（`status`）
- 备注（`note`）
- 其他基本信息

**操作**：
- 编辑（根据权限）
- 保存

**2. PHI（健康信息）Tab**

**显示字段**：
- 健康信息相关字段（从 `resident_phi` 表获取）
- 注意：包含 PHI 数据，需要权限控制

**权限**：
- Manager/Admin：可以查看和编辑
- Nurse/Caregiver：只能查看分配的住户（只读）
- Resident/Family：不能访问（Tab 不显示）

**3. Contacts（联系人）Tab**

**显示字段**：
- 紧急联系人列表（从 `resident_contacts` 表获取）
- 联系人姓名、关系、电话、邮箱等

**权限**：
- Manager/Admin：可以查看和编辑
- Nurse/Caregiver：可以查看和更新分配的住户（`update` 权限）
- Resident：只能查看自己的
- Family：只能查看关联住户的

#### 实现方式

```vue
<!-- ResidentProfile.vue -->
<template>
  <div class="resident-profile-page">
    <div class="page-header">
      <a-button @click="goBack">← Back</a-button>
      <h1>Resident Detail - {{ residentData.nickname }}</h1>
    </div>

    <!-- Tab 标签页 -->
    <a-tabs 
      v-model:activeKey="activeTab" 
      @change="handleTabChange"
      class="resident-tabs"
    >
      <!-- Profile Tab -->
      <a-tab-pane key="profile" tab="档案">
        <ResidentProfileContent 
          :resident-id="residentId" 
          :readonly="!canEditProfile"
        />
      </a-tab-pane>

      <!-- PHI Tab（根据权限显示） -->
      <a-tab-pane 
        v-if="canViewPHI" 
        key="phi" 
        tab="健康信息"
      >
        <ResidentPHIContent 
          :resident-id="residentId" 
          :readonly="!canEditPHI"
        />
      </a-tab-pane>

      <!-- Contacts Tab -->
      <a-tab-pane key="contacts" tab="联系人">
        <ResidentContactsContent 
          :resident-id="residentId" 
          :readonly="!canEditContacts"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const residentId = route.params.id as string
const activeTab = ref<string>(route.params.tab as string || 'profile')
const residentData = ref<any>({})

const userInfo = computed(() => userStore.getUserInfo)

// 权限判断
const canViewPHI = computed(() => {
  // Manager/Admin/Nurse/Caregiver 可以查看
  // Resident/Family 不能查看
  return userInfo.value?.userType === 'staff'
})

const canEditPHI = computed(() => {
  // 只有 Manager/Admin 可以编辑
  return userInfo.value?.role === 'Manager' || userInfo.value?.role === 'Admin'
})

const canEditProfile = computed(() => {
  // Manager/Admin 可以编辑
  return userInfo.value?.role === 'Manager' || userInfo.value?.role === 'Admin'
})

const canEditContacts = computed(() => {
  // Manager/Admin/Nurse 可以编辑
  return ['Manager', 'Admin', 'Nurse'].includes(userInfo.value?.role || '')
})

const handleTabChange = (key: string) => {
  // 更新 URL（可选，用于支持直接访问特定 Tab）
  router.replace({
    name: 'ResidentProfileTab',
    params: { id: residentId, tab: key },
  })
}

const goBack = () => {
  router.push('/residents')
}

onMounted(async () => {
  await loadResidentData()
  // 如果 URL 中有 tab 参数，设置 activeTab
  if (route.params.tab) {
    activeTab.value = route.params.tab as string
  }
})
</script>
```

### 3. 汇总表页面 (`/care-coordination/resident-dashboard`)

#### 功能描述
- 显示所有住户的分配关系总览
- 表格形式：位置、住户、护工、设备状态
- 主要用于 Manager 查看整体分配情况
- 点击住户可以跳转到详情页

#### 表格列设计

| 列名 | 数据来源 | 显示方式 |
|------|---------|---------|
| **Location** | `location_tag` + `unit_name` | "A 院区主楼 - E203" |
| **Resident** | `residents.nickname` + `status` | 住户昵称 + 状态图标 |
| **Caregiver** | `resident_caregivers` | 护工列表（最多5个） |
| **Device Status** | `beds.bound_device_count` + `devices.monitoring_enabled` | 设备数量 + 状态图标 |
| **Actions** | - | 操作按钮组（查看详情、编辑分配等） |

#### 字段优化说明

**原字段** → **优化后**：
- `location_tag` + `location_Name` → **Location**（合并显示）
- `residents` → **Resident**（显示昵称 + 状态图标）
- `cargivers` → **Caregiver**（修正拼写为 `caregivers`）
- `devices` + `public` → **Device Status**（用状态图标/标签显示）
- `select` → **Actions**（操作按钮组）

## 权限控制

### 权限矩阵

| 角色 | 列表页 | Profile Tab | PHI Tab | Contacts Tab |
|------|--------|-------------|---------|--------------|
| **Manager** | ✅ 全部 | ✅ 全部（可编辑） | ✅ 全部（可编辑） | ✅ 全部（可编辑） |
| **Admin** | ✅ 全部 | ✅ 全部（可编辑） | ✅ 全部（可编辑） | ✅ 全部（可编辑） |
| **Nurse** | ✅ 分配的 | ✅ 分配的（只读） | ✅ 分配的（只读） | ✅ 分配的（可更新） |
| **Caregiver** | ✅ 分配的 | ✅ 分配的（只读） | ✅ 分配的（只读） | ✅ 分配的（只读） |
| **Resident** | ❌ 无 | ❌ 无 | ❌ 无 | ✅ 仅自己（只读） |
| **Family** | ❌ 无 | ❌ 无 | ❌ 无 | ✅ 仅关联住户（只读） |

### 权限实现

#### 1. 路由守卫

```typescript
// router/index.ts
router.beforeEach((to, from, next) => {
  // ... 其他权限检查 ...
  
  // 检查是否是 /resident/:id 路径
  if (to.path.match(/^\/resident\/[^/]+/)) {
    const userStore = useUserStoreWithOut()
    const userInfo = userStore.getUserInfo
    const residentId = to.params.id as string
    const tab = to.params.tab as string || 'profile'
    
    // Resident 和 Family 只能访问 Contacts Tab
    if (userInfo?.userType === 'resident' || userInfo?.role === 'Family') {
      if (tab !== 'contacts') {
        // 重定向到 Contacts Tab
        next({
          name: 'ResidentProfileTab',
          params: { id: residentId, tab: 'contacts' },
        })
        return
      }
    }
    
    // Nurse/Caregiver 只能访问分配的住户
    if (userInfo?.role === 'Nurse' || userInfo?.role === 'Caregiver') {
      // TODO: 检查是否分配到该住户
      // if (!isAssignedResident(residentId)) {
      //   next({ path: userStore.getUserHomePath })
      //   return
      // }
    }
  }
  
  // 检查是否是 /residents 列表页
  if (to.path === '/residents') {
    const userStore = useUserStoreWithOut()
    const userInfo = userStore.getUserInfo
    
    // Resident 和 Family 不能访问列表页
    if (userInfo?.userType === 'resident' || userInfo?.role === 'Family') {
      next({ path: userStore.getUserHomePath })
      return
    }
  }
  
  next()
})
```

#### 2. 列表页权限过滤

```typescript
// ResidentList.vue
const filteredResidents = computed(() => {
  const userInfo = userStore.getUserInfo
  
  // Manager/Admin：显示所有住户
  if (userInfo?.role === 'Manager' || userInfo?.role === 'Admin') {
    return allResidents.value
  }
  
  // Nurse/Caregiver：只显示分配的住户
  if (userInfo?.role === 'Nurse' || userInfo?.role === 'Caregiver') {
    return allResidents.value.filter(resident => 
      isAssignedResident(resident.resident_id)
    )
  }
  
  return []
})
```

#### 3. 详情页权限控制（Tab 显示/隐藏）

```vue
<!-- ResidentProfile.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.getUserInfo)

// 权限判断
const canViewPHI = computed(() => {
  // Manager/Admin/Nurse/Caregiver 可以查看
  // Resident/Family 不能查看
  return userInfo.value?.userType === 'staff'
})

const canEditPHI = computed(() => {
  // 只有 Manager/Admin 可以编辑
  return userInfo.value?.role === 'Manager' || userInfo.value?.role === 'Admin'
})

const canEditProfile = computed(() => {
  // Manager/Admin 可以编辑
  return userInfo.value?.role === 'Manager' || userInfo.value?.role === 'Admin'
})

const canEditContacts = computed(() => {
  // Manager/Admin/Nurse 可以编辑
  return ['Manager', 'Admin', 'Nurse'].includes(userInfo.value?.role || '')
})
</script>

<template>
  <!-- PHI Tab：根据权限显示/隐藏 -->
  <a-tab-pane 
    v-if="canViewPHI" 
    key="phi" 
    tab="健康信息"
  >
    <ResidentPHIContent 
      :resident-id="residentId" 
      :readonly="!canEditPHI"
    />
  </a-tab-pane>
</template>
```

## 数据库字段映射

### Location 显示格式

根据数据库结构：
- `location_tag`：位置标签（如 "A 院区主楼"）
- `unit_name`：单元名称（如 "E203"）

**显示格式**：`location_tag + unit_name` → "A 院区主楼 - E203"

### 数据表关系

```
units (单元)
  ├── location_tag (位置标签)
  ├── unit_name (单元名称)
  └── primary_resident_id (主要住户)

beds (床位)
  ├── room_id → rooms.room_id
  ├── resident_id → residents.resident_id
  └── bound_device_count (设备数量)

residents (住户)
  ├── resident_id
  ├── nickname (昵称)
  ├── status (状态)
  └── service_level (护理级别)

resident_caregivers (住户-护工关联)
  ├── resident_id
  ├── caregiver_id1 ~ caregiver_id5 (最多5个护工)
  └── caregivers_tags (护工标签)

resident_phi (健康信息)
  └── resident_id

resident_contacts (紧急联系人)
  └── resident_id
```

## 使用场景

### Manager 工作流程

1. **查看所有住户**
   ```
   /residents（列表）
   → 搜索、筛选
   → 点击某个住户
   → /resident/:id（默认显示 Profile Tab）
   → 切换到 PHI Tab 查看健康信息
   → 切换到 Contacts Tab 查看联系人
   ```

2. **查看分配关系**
   ```
   /care-coordination/resident-dashboard（汇总表）
   → 查看位置、住户、护工、设备关系
   → 点击某个住户
   → /resident/:id（详情页）
   ```

3. **编辑分配关系**
   ```
   /care-coordination/assignments
   → 选择住户
   → 编辑护工分配
   ```

### Nurse/Caregiver 工作流程

1. **查看分配的住户**
   ```
   /residents（列表，只显示分配的）
   → 点击某个住户
   → /resident/:id（详情页，只读）
   → 可以切换 Tab 查看 Profile、PHI、Contacts
   ```

2. **更新紧急联系人**
   ```
   /resident/:id
   → 切换到 Contacts Tab
   → 编辑联系人信息（Nurse 可以编辑）
   ```

### Resident/Family 工作流程

1. **查看联系人**
   ```
   直接访问 /resident/:id/contacts
   → 只能看到 Contacts Tab
   → 只读模式
   ```

## 技术实现要点

### 1. Tab 标签页实现

使用 Ant Design Vue 的 `a-tabs` 组件：
- 默认显示 Profile Tab（`activeTab = 'profile'`）
- 支持通过 URL 参数直接访问特定 Tab（`/resident/:id/:tab`）
- 根据权限动态显示/隐藏 Tab（如 PHI Tab 对 Resident/Family 隐藏）

### 2. 权限检查

- **路由守卫**：防止直接访问无权限的 Tab
- **列表过滤**：根据权限过滤显示的住户
- **组件级权限**：在组件中根据权限显示/隐藏 Tab

### 3. 数据加载

- **列表页**：分页加载，支持搜索和筛选
- **详情页**：按需加载 Tab 内容（切换 Tab 时加载）

### 4. 编辑权限

- **Profile Tab**：Manager/Admin 可以编辑
- **PHI Tab**：Manager/Admin 可以编辑
- **Contacts Tab**：Manager/Admin/Nurse 可以编辑

## Tab vs 折叠面板对比

### Tab 方式的优势
- ✅ 更清晰的视觉层次，每个 Tab 内容独立
- ✅ 支持通过 URL 直接访问特定 Tab（如 `/resident/:id/phi`）
- ✅ 更好的移动端体验（Tab 切换更直观）
- ✅ 符合现代 Web 应用的用户习惯

### 折叠面板方式的优势
- ✅ 可以在同一页面同时查看多个部分（展开多个面板）
- ✅ 适合内容较少的情况

**最终选择：Tab 方式**，因为：
1. 住户信息内容较多，Tab 方式更清晰
2. 需要支持直接访问特定 Tab（如 Resident 只能访问 Contacts）
3. 更好的用户体验和导航

## 注意事项

1. **PHI 数据安全**：
   - PHI 数据包含敏感信息，需要严格的权限控制
   - 只有有权限的用户才能看到 PHI Tab
   - 只有有权限的用户才能编辑

2. **分配关系**：
   - Nurse/Caregiver 只能查看分配的住户
   - 需要检查 `resident_caregivers` 表中的分配关系

3. **数据一致性**：
   - 确保 `location_tag` + `unit_name` 的唯一性
   - 确保住户、床位、设备的关联关系正确

4. **性能优化**：
   - 列表页使用分页，避免一次性加载所有数据
   - 详情页的 Tab 内容按需加载（切换 Tab 时加载）

5. **URL 路由**：
   - 支持 `/resident/:id`（默认 Profile Tab）
   - 支持 `/resident/:id/profile`、`/resident/:id/phi`、`/resident/:id/contacts`
   - 路由守卫确保权限控制

## 相关文档

- 数据库设计：`owlRD/db/08_residents.sql`
- 健康信息：`owlRD/db/09_resident_phi.sql`
- 紧急联系人：`owlRD/db/10_resident_contacts.sql`
- 护工分配：`owlRD/db/11_resident_caregivers.sql`
- 权限控制：`owlRD/db/03_role_permissions.sql`│

