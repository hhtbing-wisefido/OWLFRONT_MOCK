# Address Management 需求分析

## 模块说明

**Address Management（地址管理）**统一管理：
- Location（门牌号，最小单位）
- Room（房间细分）
- Bed（床位）

**注意：** 没有单独的 Room 或 Bed 页面，所有管理功能统一在 Address Management 模块中。

## 一、核心概念

### 1.1 Location = 门牌号（最小单位）

**Location 是地址的最小单位**，对应数据库 `locations` 表：

- **`door_number`**：门牌号/房间号（数字化、准确），如 "201"、"E203"
  - 必填字段
  - 用于系统识别和排序
  
- **`location_name`**：位置名称（口语化、易记），如 "E203"、"201"、"Home-001"
  - 必填字段
  - 用于卡片显示和日常记录
  - 可能已经编码了 `building + floor + door_number` 的信息（如 "E203" = E栋 + 2楼 + 03号）

### 1.2 标签系统（用于灵活分类和组织）

**标签字段（机构场景，Institutional）：**
- **`building`**：楼栋（如 "Building A"、"主楼"）
- **`floor`**：楼层（如 "1F"、"2F"）
- **`area_tag`**：区域标签（如 "Area A"、"Memory Care Unit"），使用 `tags_catalog` 表管理（`tag_type = 'area_tag'`）
- **`location_tag`**：位置标签（灵活使用）
  - 可以是园区级别：如 "A 院区主楼"（整个园区）
  - 可以是功能级别：如 "VIP"（几个房间）
  - 用于分组、路由等

**标签特点：**
- 所有标签都是可选的
- 标签之间是组合关系，不是层级关系
- 可以通过不同标签组合实现不同的分类需求
- 示例：一个 Location 可以有 `building: "Building A"`, `floor: "1F"`, `location_tag: "VIP"`, `area_tag: "东区"`

### 1.3 Room 和 Bed 的关系

**Room（房间细分）：**
- 每个 Location 创建时，应用层自动生成一个 `is_default = TRUE` 的 Room
- RoomName 默认等于 Location.location_name
- Bed 和 Device 总是绑定到 Room（绑定路径：Location → Room → Bed/Device）

**Bed（床位）：**
- Bed 必须绑定到 Room
- 绑定路径：Location → Room → Bed

**注意：** 
- Location、Room、Bed 统一在 Address Management 模块管理
- 没有单独的 Room 或 Bed 页面
- 本次实现只管理 Location，Room 和 Bed 暂不实现

### 1.4 唯一性约束（双重验证）

**数据库层面有两个唯一性约束：**

1. **`location_tag + location_name` 唯一**（用户友好）
   - 如果 `location_tag` 不为 NULL：`(tenant_id, location_tag, location_name)` 唯一
   - 如果 `location_tag` 为 NULL：`(tenant_id, location_name)` 唯一
   - 保证用户易记名称的唯一性

2. **`location_tag + building + floor + door_number` 唯一**（底层逻辑）
   - 保证物理位置的唯一性
   - 即使 `location_name` 相同，只要 `building + floor + door_number` 不同，也可以创建
   - 这是数据完整性的基础约束

**设计理念：**
- `location_name` 是用户友好的标识（口语化、易记）
- `door_number` 是准确的数字化标识
- `building + floor + door_number` 组合决定物理位置的唯一性
- `location_name` 可能已经编码了 `building + floor + door_number` 的信息（如 "E203" = E栋 + 2楼 + 03号）
- 两个约束互相补充，既保证数据准确性，又保证用户友好性

---

## 二、分层设计架构

### 2.1 三层设计

**第一层：建立房间（Location）**
- 创建和管理 Location（门牌号）
- 本次实现范围

**第二层：房间内建立 bedroom...各 room 及 bed**
- 在 Location 下创建 Room（房间细分）
- 在 Room 下创建 Bed（床位）
- 后续实现

**第三层：在各层绑定设备**
- Location → Room → Bed 的设备绑定
- 后续实现

### 2.2 本次实现：第一层 - 建立房间

**第一步：Create Location（创建门牌号）**
- 在 Building 卡片上点击楼层（1F、2F 等）
- 展开楼层后，显示平铺的长方格网格
- 用户直接在方格上输入创建 Location

**第二步：展示 Location**
- 后续实现

---

## 三、功能需求（Location 管理 - 第一阶段）

### 3.1 核心功能

**本次实现范围：**
- ✅ Location（门牌号）的创建（第一步）
- ✅ 按 Building 和 Floor 分组展示
- ✅ 在楼层网格中直接创建 Location
- ❌ 暂不实现：Location 列表展示和搜索（第二步）
- ❌ 暂不实现：Location 编辑和删除（后续）
- ❌ 暂不实现：Room（房间细分）管理（第二层）
- ❌ 暂不实现：Bed（床位）管理（第二层）
- ❌ 暂不实现：设备绑定（第三层）
- ❌ 暂不实现：Caregiver/Resident 关联（后续）

### 3.2 Location 创建功能（第一步）

#### 3.2.1 创建流程

**UI 交互流程：**
1. 用户看到 Building 卡片（如 "Building A"）
2. Building 卡片上显示楼层按钮（1F、2F、3F 等）
3. 用户点击某个楼层按钮（如 "1F"）
4. 展开该楼层的平铺网格（长方形方格）
5. 用户点击空白方格或已有 Location 方格
6. 在方格内直接输入创建信息

#### 3.2.2 创建表单字段（在方格内输入）

**直接在方格上输入：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| **DoorNumber** | 文本输入 | ✅ | 门牌号（数字化、准确，如 "101", "E203"） |
| **location_name** | 文本输入 | ✅ | 位置名称（口语化、易记，如 "203房间"） |
| **location_tag** | 下拉选择 | ❌ | Location Tag（从已有 tag 中选择或新建，灵活使用） |
| **area_tag** | 下拉选择 | ❌ | 区域 Tag（从 tags_catalog 选择，tag_type = 'area_tag'） |

**注意：**
- `building` 和 `floor` 由当前选中的 Building 和 Floor 自动填充，不需要用户输入
- 用户只需输入 `door_number`、`location_name`、`location_tag`、`area_tag`

#### 3.2.3 业务规则（双重唯一性验证）

1. **`location_tag + location_name` 组合唯一**
   - 如果 `location_tag` 不为 NULL：`(tenant_id, location_tag, location_name)` 唯一
   - 如果 `location_tag` 为 NULL：`(tenant_id, location_name)` 唯一
2. **`location_tag + building + floor + door_number` 组合唯一**
   - 保证物理位置的唯一性
   - 即使 `location_name` 相同，只要 `building + floor + door_number` 不同，也可以创建
3. **验证逻辑**：
   - 如果任一约束冲突，创建失败并提示具体冲突信息
   - 验证逻辑由后端 server 执行

#### 3.2.4 后续功能（暂不实现）

- Location 列表展示和搜索（第二步）
- Location 编辑
- Location 删除

---

## 四、UI 设计（第一步：Create Location）

### 4.1 设计理念

针对 Elder Care 场景的特点：
- 大部分机构为 1 层建筑
- 少数机构有 3-4 层
- 需要直观的楼层平面图式布局
- 在楼层网格中直接创建 Location
- 使用 Tag 进行分类和筛选

### 4.2 Address Management 主页面（AddressManagement.vue）

#### 4.2.1 页面布局（第一步：Create Location）

**用户提出的新设计：**

```
┌─────────────────────────────────────────────────────────────┐
│  Address Management                                         │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ [Create  │                                                  │
│ Building]│                                                  │
│          │                                                  │
│ ┌────────┐                                                  │
│ │Building│                                                  │
│ │   A    │                                                  │
│ │ [1F]   │                                                  │
│ │ [2F]   │                                                  │
│ │ [3F]   │                                                  │
│ └────────┘                                                  │
│          │                                                  │
│ ┌────────┐                                                  │
│ │Building│                                                  │
│ │   B    │                                                  │
│ │ [1F]   │                                                  │
│ └────────┘                                                  │
│          │                                                  │
│ ┌────────┐                                                  │
│ │Building│                                                  │
│ │   C    │                                                  │
│ │ [1F]   │                                                  │
│ │ [2F]   │                                                  │
│ │ [3F]   │                                                  │
│ │ [4F]   │                                                  │
│ └────────┘                                                  │
│          │                                                  │
│ (左侧列)  │  (右侧主区域)                                      │
│          │                                                  │
│          │  双击 floor 后，在此区域显示：                      │
│          │  ┌──────────────────────────────────────────┐  │
│          │  │  Building A - 1F                         │  │
│          │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │  │
│          │  │  │101 │ │102 │ │103 │ │104 │           │  │
│          │  │  └────┘ └────┘ └────┘ └────┘           │  │
│          │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │  │
│          │  │  │105 │ │106 │ │107 │ │108 │           │  │
│          │  │  └────┘ └────┘ └────┘ └────┘           │  │
│          │  └──────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────┘
```

**设计说明：**
- **左侧列**：Building 卡片列表，1列单放，多个 Building 纵向排列
- **Create Building 按钮**：在左侧列顶部，点击后弹出表单（buildingName + floors number）
- **Building 卡片**：显示 Building 名称和楼层按钮（1F, 2F, 3F...）
- **双击 floor**：在右侧主区域显示该楼层的 Location 网格（方块图）

#### 4.2.2 Building 卡片设计

**Building 卡片结构：**
- 卡片标题：Building 名称（如 "Building A"）
- 楼层按钮：1F, 2F, 3F, 4F（根据创建时输入的 floors number 自动生成）
- **双击楼层按钮**：在右侧主区域显示该楼层的 Location 网格

**Building 卡片布局：**
- 位置：页面左侧，1列单放
- 多个 Building：纵向排列（一个 Building 一行，如果有多个，放到下一行）
- 宽度：固定宽度（如 200px），保持左侧列整齐

**Create Building 流程：**
1. 用户点击左侧列顶部的 "Create Building" 按钮
2. 弹出表单：
   - Building Name（输入框，必填）
   - Floors Number（数字输入，必填，如 3 表示 1F, 2F, 3F）
3. 提交后，在左侧列创建新的 Building 卡片
4. Building 卡片自动显示对应数量的楼层按钮（1F, 2F, 3F...）

#### 4.2.3 Location 网格布局（楼层展开后）

**网格特点：**
- 平铺的长方格布局（类似平面图）
- 每个方格代表一个 Location（或空白位置）
- 方格是长方形（横向较长）

**Location 方格状态：**

1. **已建 Location**：
   - 显示 `location_name`（位置名称，口语化、易记）
   - 点击可编辑（后续实现）

2. **未建（空白）**：
   - 显示空白或 "+" 图标
   - 点击后弹出创建表单容器（Modal 或 Drawer）

#### 4.2.4 创建表单设计（弹出容器）

**点击空白方格后弹出表单，包含以下字段：**

| 字段顺序 | 字段名 | 类型 | 必填 | 说明 |
|---------|--------|------|------|------|
| 1 | **DoorNumber** | 文本输入 | ✅ | 门牌号（数字化、准确，如 "101", "E203"） |
| 2 | **location_name** | 文本输入 | ✅ | 位置名称（口语化、易记，如 "203房间"） |
| 3 | **location_tag** | 下拉选择 | ❌ | Location Tag（从已有 tag 中选择或新建，灵活使用） |
| 4 | **area_tag** | 下拉选择 | ❌ | 区域 Tag（从 tags_catalog 选择，tag_type = 'area_tag'） |
| 5 | **Building** | 文本输入 | ❌ | 建筑标签（由上下文自动填充，可修改） |
| 6 | **Floor** | 文本输入 | ❌ | 楼层标签（由上下文自动填充，可修改） |

**设计说明：**
- **字段顺序优化**：先输入基础信息（DoorNumber、location_name），再输入标签信息（location_tag、area_tag），最后显示上下文信息（Building、Floor）
- **Building 和 Floor**：由当前选中的 Building 和 Floor 自动填充，但用户可以修改（可编辑输入框，默认值来自上下文）
- **弹出容器**：使用 Modal（模态框）或 Drawer（侧边抽屉），字段较多时比内联编辑更清晰

#### 4.2.5 设计分析与优化建议

**用户提出的设计：**
- 已建：显示 `location_name`
- 未建（空白）：点击后弹出容器，包含：
  1. location_tag 下拉框（可选）
  2. location_name 输入框（必填）
  3. Building 可选
  4. Floor 可选
  5. area_tag 下拉框（可选）
  6. DoorNumber 输入框（必填）

**设计分析：**

✅ **优点：**
1. **弹出容器设计合理**：字段较多（6个）时，弹出容器比内联编辑更清晰，用户体验更好
2. **已建显示 location_name**：符合用户习惯，显示口语化、易记的名称
3. **字段完整性**：包含了所有必要的字段

⚠️ **需要优化的地方：**

1. **字段顺序问题**：
   - 用户建议：location_tag → location_name → Building → Floor → area_tag → DoorNumber
   - **建议优化**：DoorNumber → location_name → location_tag → area_tag → Building → Floor
   - **理由**：先输入基础信息（门牌号、名称），再输入标签信息，最后显示上下文信息（Building、Floor 由上下文自动填充）

2. **Building 和 Floor 的处理**：
   - 用户说"可选"，但实际上用户是在点击某个 Building 的某个 Floor 后才展开网格的
   - **建议**：Building 和 Floor 应该由上下文自动填充，显示为**只读**或**可编辑但默认填充**
   - **理由**：避免用户重复输入，减少错误，保持数据一致性

3. **字段必填性**：
   - DoorNumber 和 location_name 是必填的，符合业务逻辑 ✅
   - 其他字段为可选，提供灵活性 ✅

**优化后的设计建议：**

| 字段顺序 | 字段名 | 类型 | 必填 | 说明 |
|---------|--------|------|------|------|
| 1 | **DoorNumber** | 文本输入 | ✅ | 门牌号（数字化、准确） |
| 2 | **location_name** | 文本输入 | ✅ | 位置名称（口语化、易记） |
| 3 | **location_tag** | 下拉选择 | ❌ | Location Tag（可选） |
| 4 | **area_tag** | 下拉选择 | ❌ | 区域 Tag（可选） |
| 5 | **Building** | 文本输入 | ❌ | 由上下文自动填充（Building A），可修改 |
| 6 | **Floor** | 文本输入 | ❌ | 由上下文自动填充（1F），可修改 |

**推荐方案：**
- ✅ 使用 **Modal（模态框）** 作为弹出容器
- ✅ 字段顺序：DoorNumber → location_name → location_tag → area_tag → Building → Floor
- ✅ Building 和 Floor 显示为**可编辑输入框**，默认值由上下文自动填充（当前选中的 Building 和 Floor），用户可以修改
- ✅ 表单布局清晰，字段分组：基础信息 → 标签信息 → 上下文信息

### 3.3 创建/编辑 Location 表单

#### 3.3.1 创建模式（点击空白方格或"创建 Location"按钮）

**表单字段：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| **door_number** | 文本输入 | ✅ | 门牌号（数字化、准确，如 "101", "E203"） |
| **location_name** | 文本输入 | ✅ | 位置名称（口语化、易记，如 "203房间", "E203"） |
| **building** | 文本输入 | ❌ | 建筑标签（如 "Building A"） |
| **floor** | 文本输入 | ❌ | 楼层标签（如 "1F", "2F"） |
| **location_tag** | 下拉选择 | ❌ | Location Tag（从已有 tag 中选择或新建，灵活使用） |
| **area_tag** | 下拉选择 | ❌ | 区域 Tag（从 tags_catalog 选择，tag_type = 'area_tag'） |

**表单位置：**
- 模态框（Modal）或
- 侧边抽屉（Drawer）或
- 内联编辑（Inline Edit，直接在方格中编辑）

#### 3.3.2 编辑模式（点击已有 Location 方格）

**可编辑字段：**
- location_name（位置名称）
- building（建筑标签）
- floor（楼层标签）
- location_tag（Location Tag）
- area_tag（区域 Tag）

**不可编辑字段：**
- door_number（门牌号，一旦创建不可修改）

**注意：** 编辑时仍需验证两个唯一性约束

#### 3.3.3 批量创建模式（可选）

- 支持批量选择多个方格
- 批量设置相同的 building、floor、location_tag 和 area_tag
- 逐个输入 door_number 和 location_name

### 4.4 响应式设计

**桌面端：**
- Building 卡片横向排列
- Location 网格：每行显示 4-6 个方格（长方形）
- 方格内输入框垂直排列

**移动端：**
- Building 卡片纵向排列
- Location 网格：每行显示 2-3 个方格
- 方格内输入框可能需要折叠或简化显示

### 4.5 实现细节

#### 4.5.1 Building 与 Location 的关系

**Building 概念：**
- Building 是 UI 层面的展示概念，用于组织 Location
- Building 名称存储在 `locations.building` 字段
- 楼层信息存储在 `locations.floor` 字段

**数据组织：**
- 前端按 `building` 分组展示 Location
- 每个 Building 卡片显示该建筑的所有楼层
- 点击楼层后，筛选显示该 Building + Floor 的所有 Location（或空白网格）

#### 4.5.2 Location 网格布局

**网格生成逻辑：**
1. 用户点击 Building + Floor 后
2. 获取当前 Building + Floor 的所有 Location（如果有）
3. 渲染 Location 网格：
   - 已有 Location：显示已创建的信息
   - 空白方格：显示输入框，供用户创建新 Location
4. 网格大小：根据屏幕宽度动态调整，每行显示 4-6 个方格

**网格交互：**
- 点击空白方格：激活输入模式，用户直接在方格内输入
- 输入完成后点击"保存"或按 Enter：提交创建请求
- 创建成功后：方格显示已创建的 Location 信息

#### 4.5.3 输入字段说明

**DoorNumber（门牌号）：**
- 类型：文本输入框
- 必填：是
- 格式：数字化、准确，如 "101", "E203"
- 验证：后端验证 `location_tag + building + floor + door_number` 唯一

**location_name（位置名称）：**
- 类型：文本输入框
- 必填：是
- 格式：口语化、易记，如 "203房间", "E203"
- 验证：后端验证 `location_tag + location_name` 唯一

**location_tag（位置标签）：**
- 类型：下拉选择框
- 必填：否
- 选项：从已有 tag 中选择或新建
- 用途：灵活使用，可以是园区级别、功能级别等

**area_tag（区域标签）：**
- 类型：下拉选择框
- 必填：否
- 选项：从 `tags_catalog` 表选择（`tag_type = 'area_tag'`）
- 用途：区域分类

---

## 五、API 设计（第一步：Create Location）

### 5.1 创建 Location（第一步实现）

**端点**：`POST /admin/api/v1/locations`

**参数**：
```typescript
{
  door_number: string      // 必填，门牌号（数字化、准确）
  location_name: string    // 必填，位置名称（口语化、易记）
  building?: string        // 可选，建筑标签
  floor?: string           // 可选，楼层标签
  location_tag?: string    // 可选，位置标签
  area_tag?: string        // 可选，区域标签
  location_type: string   // 必填，位置类型（'home' | 'institution'）
}
```

**业务规则（双重唯一性验证）：**
1. 验证 `location_tag + location_name` 唯一
2. 验证 `location_tag + building + floor + door_number` 唯一
3. 如果任一约束冲突，返回 400 错误，提示具体冲突信息

### 5.2 后续 API（暂不实现）

- 获取 Location 列表
- 获取 Location 详情
- 更新 Location
- 删除 Location

---

## 六、数据模型

### 5.1 Location 接口

```typescript
export interface Location {
  location_id: string
  tenant_id: string
  door_number: string           // 门牌号（数字化、准确）
  location_name: string         // 位置名称（口语化、易记）
  building?: string             // 建筑标签（可选）
  floor?: string                // 楼层标签（可选）
  location_tag?: string         // 位置标签（可选，灵活使用）
  area_tag?: string             // 区域标签（可选）
  location_type: 'home' | 'institution'  // 位置类型
  is_active: boolean            // 状态（active/disabled）
  created_at?: string
  updated_at?: string
}
```

### 5.2 Building 数据结构

```typescript
export interface Building {
  building: string              // 建筑名称
  floors: string[]              // 楼层列表，如 ["1F", "2F", "3F"]
  locations: Location[]         // 该建筑的所有 Location
}
```

### 5.3 Tag 数据结构

```typescript
export interface LocationTag {
  tag_name: string              // Tag 名称
  tag_type: 'location_tag' | 'area_tag'  // Tag 类型
  location_count: number        // 该 Tag 下的 Location 数量
}
```

---

## 七、实现优先级

### Phase 1：第一层 - 建立房间（本次实现）

**第一步：Create Location**
1. ✅ Building 卡片展示（显示楼层按钮）
2. ✅ 点击楼层展开 Location 网格（平铺的长方格）
3. ✅ 在方格内直接输入创建 Location：
   - DoorNumber（必填）
   - location_name（必填）
   - location_tag（可选，下拉选择）
   - area_tag（可选，下拉选择）
4. ✅ 双重唯一性验证（后端）
5. ✅ 创建成功后显示已创建的 Location

**第二步：展示 Location（后续实现）**
- Location 列表展示和搜索
- Location 编辑
- Location 删除

**注意：** 所有功能在 Address Management 页面中实现，没有单独的 Room 或 Bed 页面。

### Phase 2：第二层 - 房间内建立 bedroom...各 room 及 bed（后续实现）

在 Address Management 中实现：
1. Room 列表展示（每个 Location 自动生成 Default Room，在 Location 详情中展示）
2. Bed 列表展示（在 Room 详情中展示）
3. Bed 创建/编辑/删除（在 Address Management 页面中操作）
4. Location → Room → Bed 的关联展示

### Phase 3：第三层 - 在各层绑定设备（后续实现）

在 Address Management 中实现：
1. 设备绑定（Location → Room → Bed）
2. Resident 分配（Location/Bed）
3. Caregiver 分配（Location/Bed）

---

## 七、注意事项

1. **租户隔离**：所有操作必须在租户范围内
2. **双重唯一性约束**：
   - `location_tag + location_name` 唯一（用户友好）
   - `location_tag + building + floor + door_number` 唯一（底层逻辑）
3. **删除限制**：删除前必须检查关联关系（Bed、设备、Resident）
4. **状态管理**：使用软删除（`is_active = FALSE`），保留历史记录
5. **数据完整性**：Location 是地址的最小单位，Room 和 Bed 都依赖 Location

