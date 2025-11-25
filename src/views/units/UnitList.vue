<template>
  <div class="unit-list">
    <!-- 页首：创建表单 -->
    <div class="page-header">
      <div class="create-building-form">
        <span class="create-label">tag:</span>
        <a-input
          id="create-building-tag-name"
          name="create-building-tag-name"
          v-model:value="createBuildingForm.tag_name"
          placeholder="tag_name"
          style="width: 120px"
          @pressEnter="handleCreateBuilding"
        />
        <span class="separator">:</span>
        <span class="create-label">Building:</span>
        <a-input
          id="create-building-name"
          name="create-building-name"
          v-model:value="createBuildingForm.building_name"
          placeholder="Build name"
          style="width: 100px"
          @pressEnter="handleCreateBuilding"
        />
        <span class="separator">:</span>
        <span class="create-label">Floors:</span>
        <a-input-number
          id="create-building-floors"
          name="create-building-floors"
          v-model:value="createBuildingForm.floors"
          :min="1"
          :max="99"
          placeholder="number"
          style="width: 80px"
          @pressEnter="handleCreateBuilding"
        />
        <a-button type="primary" @click="handleCreateBuilding">Create</a-button>
        <div class="building-tags">
          <div
            v-for="building in buildingsWithDisplayName"
            :key="building.building_id"
            class="building-tag-card"
            :class="{
              active: selectedBuilding?.building_id === building.building_id,
              expanded: expandedBuildings.has(building.building_id || ''),
            }"
          >
            <div class="building-tag-header" @click="handleToggleBuildingTag(building)">
              <EditOutlined
                v-if="editingBuildingId !== building.building_id"
                class="building-tag-edit-icon"
                @click.stop="handleEditBuilding(building)"
              />
              <span
                v-if="editingBuildingId !== building.building_id"
                class="building-tag-name"
              >
                {{ building.displayName }}
              </span>
              <div
                v-else
                class="building-tag-edit"
                @click.stop
              >
                <a-input
                  :id="`edit-building-tag-${building.building_id}`"
                  :name="`edit-building-tag-${building.building_id}`"
                  v-model:value="editingBuildingForm.tag_name"
                  placeholder="TAG"
                  size="small"
                  style="width: 60px"
                  @pressEnter="handleSaveBuilding(building)"
                  @blur="handleSaveBuilding(building)"
                />
                <span class="separator">:</span>
                <a-input
                  :id="`edit-building-name-tag-${building.building_id}`"
                  :name="`edit-building-name-tag-${building.building_id}`"
                  v-model:value="editingBuildingForm.building_name"
                  placeholder="Build"
                  size="small"
                  style="width: 55px"
                  @pressEnter="handleSaveBuilding(building)"
                  @blur="handleSaveBuilding(building)"
                />
              </div>
              <DeleteOutlined
                v-if="editingBuildingId !== building.building_id"
                class="building-tag-delete-icon"
                @click.stop="handleDeleteBuilding(building)"
              />
            </div>
            <div class="building-tag-floors" v-if="expandedBuildings.has(building.building_id || '')" @click.stop>
              <div
                v-for="floorNum in building.floors"
                :key="floorNum"
                class="floor-item-small"
              >
                <a-button
                  :type="selectedFloor === `${floorNum}F` ? 'primary' : 'default'"
                  class="floor-button-small"
                  @click.stop="handleSelectFloor(building, `${floorNum}F`)"
                >
                  floor{{ floorNum }}
                </a-button>
                <DeleteOutlined
                  class="floor-delete-icon"
                  @click.stop="handleDeleteFloor(building, floorNum)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="main-container">
      <!-- 左侧：Building 列表（完整的 Building 卡片和楼层按钮） -->
      <div class="building-list">
        <div class="buildings">
          <div
            v-for="building in buildingsWithDisplayName"
            :key="building.building_id"
            class="building-card"
            :class="{
              active: selectedBuilding?.building_id === building.building_id,
            }"
          >
            <div class="building-header" @click="handleToggleBuildingCard(building)">
              <EditOutlined
                v-if="editingBuildingId !== building.building_id"
                class="building-edit-icon"
                @click.stop="handleEditBuilding(building)"
              />
              <span
                v-if="editingBuildingId !== building.building_id"
                class="building-name"
              >
                {{ building.displayName }}
              </span>
              <div
                v-else
                class="building-edit"
                @click.stop
              >
                <a-input
                  :id="`edit-building-tag-card-${building.building_id}`"
                  :name="`edit-building-tag-card-${building.building_id}`"
                  v-model:value="editingBuildingForm.tag_name"
                  placeholder="TAG"
                  size="small"
                  style="width: 60px"
                  @pressEnter="handleSaveBuilding(building)"
                  @blur="handleSaveBuilding(building)"
                />
                <span class="separator">:</span>
                <a-input
                  :id="`edit-building-name-card-${building.building_id}`"
                  :name="`edit-building-name-card-${building.building_id}`"
                  v-model:value="editingBuildingForm.building_name"
                  placeholder="Build"
                  size="small"
                  style="width: 55px"
                  @pressEnter="handleSaveBuilding(building)"
                  @blur="handleSaveBuilding(building)"
                />
              </div>
              <DeleteOutlined
                v-if="editingBuildingId !== building.building_id"
                class="building-delete-icon"
                @click.stop="handleDeleteBuilding(building)"
              />
            </div>
            <div class="floors" v-if="selectedBuilding?.building_id === building.building_id" @click.stop>
              <div
                v-for="floorNum in building.floors"
                :key="floorNum"
                class="floor-item"
              >
                <a-button
                  :type="selectedFloor === `${floorNum}F` ? 'primary' : 'default'"
                  class="floor-button"
                  @click.stop="handleSelectFloor(building, `${floorNum}F`)"
                >
                  floor{{ floorNum }}
                </a-button>
                <DeleteOutlined
                  class="floor-delete-icon"
                  @click.stop="handleDeleteFloor(building, floorNum)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：Unit 网格 -->
      <div class="unit-grid-container">
        <div v-if="!selectedBuilding || !selectedFloor" class="empty-state">
          <p>Please select a floor</p>
        </div>
        <div v-else class="unit-grid-wrapper">
          <div class="unit-grid">
            <div
              v-for="(unit, index) in unitGrid"
              :key="unit?.unit_id || `empty-${index}`"
              class="unit-cell"
              :class="{ 'has-unit': unit }"
              @click="handleCellClick(unit, index)"
            >
              <div v-if="unit" class="unit-content">
                {{ unit.unit_number }} Unit
              </div>
              <div v-else class="empty-cell">
                <PlusOutlined />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Create Unit Modal -->
    <a-modal
      v-model:open="showCreateUnitModal"
      title="Create Unit"
      @ok="handleCreateUnit"
      @cancel="resetCreateUnitForm"
      :width="600"
    >
      <a-form :model="createUnitForm" layout="vertical">
        <a-form-item
          label="Unit Number"
          :rules="[{ required: true, message: 'Please input unit number' }]"
        >
          <a-input
            id="create-location-unit-number"
            name="create-location-unit-number"
            v-model:value="createUnitForm.unit_number"
          />
        </a-form-item>
        <a-form-item
          label="Unit Name"
          :rules="[{ required: true, message: 'Please input unit name' }]"
        >
          <a-input
            id="create-location-unit-name"
            name="create-location-unit-name"
            v-model:value="createUnitForm.unit_name"
          />
        </a-form-item>
        <a-form-item label="Location Tag">
          <a-select
            id="create-location-location-tag"
            name="create-location-location-tag"
            v-model:value="createUnitForm.location_tag"
            placeholder="Select location tag"
            allow-clear
          >
            <a-select-option value="VIP">VIP</a-select-option>
            <a-select-option value="Standard">Standard</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Area Tag">
          <a-select
            id="create-location-area-tag"
            name="create-location-area-tag"
            v-model:value="createUnitForm.area_tag"
            placeholder="Select area tag"
            allow-clear
          >
            <a-select-option value="East">East</a-select-option>
            <a-select-option value="West">West</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Building">
          <a-input
            id="create-location-building"
            name="create-location-building"
            v-model:value="createUnitForm.building"
          />
        </a-form-item>
        <a-form-item label="Floor">
          <a-input
            id="create-location-floor"
            name="create-location-floor"
            v-model:value="createUnitForm.floor"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Edit Unit Modal (Room-Bed Management) -->
    <a-modal
      v-model:visible="showEditUnitModal"
      :title="getEditUnitTitle()"
      @cancel="resetEditUnitForm"
      :width="420"
      :footer="null"
    >
      <div class="unit-edit-container">
        <!-- Unit 基本信息 -->
        <div class="unit-fields">
          <div class="unit-field full-row">
            <label>UnitName<span class="required-star">*</span>:</label>
            <a-input
              v-model:value="editUnitForm.unit_name"
              placeholder="Unit name"
            />
          </div>
          <div class="unit-field inline-row">
            <div class="inline-field">
              <label>area_tag:</label>
              <a-select
                v-model:value="editUnitForm.area_tag"
                placeholder="Input or select"
                allow-clear
                show-search
                :filter-option="false"
                @search="handleAreaTagSearch"
                @blur="handleAreaTagBlur"
                style="width: 120px"
              >
                <a-select-option
                  v-for="tag in areaTagOptions"
                  :key="tag.tag_name"
                  :value="tag.tag_name"
                >
                  {{ tag.tag_name }}
                </a-select-option>
              </a-select>
            </div>
            <div class="inline-field unitnumber-field">
              <label>UnitNumber<span class="required-star">*</span>:</label>
              <a-input
                v-model:value="editUnitForm.unit_number"
                placeholder="Unit number"
                style="width: 80px"
                :disabled="!!editingUnit"
              />
            </div>
          </div>
        </div>

        <!-- Room-Bed Tree Structure -->
        <div class="room-bed-section">
          <div class="tree-header">
            <span class="tree-title">Rooms & Beds</span>
            <div class="tree-header-actions">
              <a-button
                type="primary"
                size="small"
                @click="handleShowAddRoomForm"
                :disabled="!editingUnit"
              >
                Add Room
              </a-button>
              <a-button
                type="default"
                size="small"
                @click="handleAddBedWithUnitName"
                :disabled="!editingUnit"
              >
                Add Bed
              </a-button>
            </div>
          </div>
          <div class="tree-container">
            <div v-if="!editingUnit" class="tree-empty">
              <p>Please create or select a unit first</p>
            </div>
            <div v-else-if="roomsWithBeds.length === 0 && !showAddRoomForm" class="tree-empty">
              <p>No rooms yet. Click "Add Room" to create one.</p>
            </div>
            <div v-else class="tree-list">
              <!-- Add Room Form -->
              <div v-if="showAddRoomForm" class="tree-node add-form">
                <div class="node-content">
                  <a-input
                    v-model:value="newRoomName"
                    placeholder="Room name"
                    size="small"
                    style="width: 150px"
                    @pressEnter="handleAddRoom"
                    ref="roomNameInputRef"
                  />
                  <div class="node-actions">
                    <a-button type="primary" size="small" @click="handleAddRoom">OK</a-button>
                    <a-button size="small" @click="handleCancelAddRoom">Cancel</a-button>
                  </div>
                </div>
              </div>

              <!-- Room Nodes -->
              <div
                v-for="room in roomsWithBeds"
                :key="room.room_id"
                class="tree-node room-node"
              >
                <div class="node-content">
                  <span
                    class="expand-icon"
                    @click="toggleRoom(room.room_id)"
                    v-if="room.beds && room.beds.length > 0"
                  >
                    {{ expandedRooms.has(room.room_id) ? '−' : '+' }}
                  </span>
                  <span class="expand-placeholder" v-else></span>
                  <a-input
                    v-if="editingRoomId === room.room_id"
                    v-model:value="editingRoomName"
                    size="small"
                    style="width: 150px"
                    @pressEnter="handleSaveRoomName(room.room_id)"
                    @blur="handleSaveRoomName(room.room_id)"
                    ref="roomInputRef"
                  />
                  <span v-else class="node-label" @dblclick="handleEditRoom(room)">
                    {{ room.room_name }}
                  </span>
                  <EditOutlined
                    v-if="editingRoomId !== room.room_id"
                    class="action-icon inline-action"
                    @click="handleEditRoom(room)"
                  />
                  <DeleteOutlined
                    v-if="editingRoomId !== room.room_id"
                    class="action-icon delete-icon inline-action"
                    @click="handleDeleteRoom(room.room_id)"
                  />
                  <div class="node-actions">
                    <a-button
                      type="primary"
                      size="small"
                      @click="handleAddBedDirectly(room)"
                      :disabled="getAvailableBedLetters(room).length === 0"
                    >
                      <PlusOutlined />
                      Bed
                    </a-button>
                  </div>
                </div>

                <!-- Bed Nodes (children of Room) -->
                <div
                  v-if="expandedRooms.has(room.room_id) && room.beds && room.beds.length > 0"
                  class="tree-children"
                >
                  <!-- Bed Nodes -->
                  <div
                    v-for="bed in room.beds"
                    :key="bed.bed_id"
                    class="tree-node bed-node"
                  >
                    <div class="node-content">
                      <span class="expand-placeholder"></span>
                      <a-input
                        v-if="editingBedId === bed.bed_id"
                        v-model:value="editingBedName"
                        size="small"
                        style="width: 150px"
                        @pressEnter="handleSaveBedName(bed.bed_id)"
                        @blur="handleSaveBedName(bed.bed_id)"
                        ref="bedInputRef"
                        placeholder="BedA-BedZ"
                      />
                      <span v-else class="node-label" @dblclick="handleEditBed(bed)">
                        {{ bed.bed_name }}
                      </span>
                      <EditOutlined
                        v-if="editingBedId !== bed.bed_id"
                        class="action-icon inline-action"
                        @click="handleEditBed(bed)"
                      />
                      <DeleteOutlined
                        v-if="editingBedId !== bed.bed_id"
                        class="action-icon delete-icon inline-action"
                        @click="handleDeleteBed(bed.bed_id)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <div class="modal-actions-right">
            <a-button @click="resetEditUnitForm">Cancel</a-button>
            <a-button type="primary" @click="handleSaveUnit">OK</a-button>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import type { Building, Unit, RoomWithBeds, Bed } from '@/api/units/model/unitModel'
import {
  createBuildingApi,
  getBuildingsApi,
  updateBuildingApi,
  deleteBuildingApi,
  createUnitApi,
  getUnitsApi,
  updateUnitApi,
  getRoomsApi,
  createRoomApi,
  updateRoomApi,
  deleteRoomApi,
  createBedApi,
  updateBedApi,
  deleteBedApi,
} from '@/api/units/unit'
import { getTagsApi, createTagApi } from '@/api/admin/tags/tags'
import type { TagCatalogItem } from '@/api/admin/tags/model/tagsModel'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

// Building 列表
const buildings = ref<Building[]>([])
const selectedFloor = ref<string>('')

// Headline 行：独立管理自己的展开状态（独立的组件实例）
const expandedBuildings = ref<Set<string>>(new Set())

// 左侧列：独立管理自己的展开状态（独立的组件实例）
const selectedBuilding = ref<Building | null>(null)

// 当前用于 unitGrid 的 building（可能是从 headline 或左侧列选择的）
const currentBuildingForGrid = ref<Building | null>(null)

// Create Building Form (在页首)
const createBuildingForm = ref({
  tag_name: '',
  building_name: '',
  floors: 1,
})

// Edit Building Form (内联编辑)
const editingBuildingId = ref<string | null>(null)
const editingBuildingForm = ref({
  tag_name: '',
  building_name: '',
})

// Unit 网格
const units = ref<Unit[]>([])
const gridSize = ref(20) // 默认网格大小

// Create Unit Modal
const showCreateUnitModal = ref(false)
const createUnitForm = ref({
  unit_number: '',
  unit_name: '',
  location_tag: undefined as string | undefined,
  area_tag: undefined as string | undefined,
  building: '',
  floor: '',
})
// selectedCellIndex 暂时未使用，保留用于后续功能
// const selectedCellIndex = ref<number | null>(null)

// Edit Unit Modal (Room-Bed Management)
const showEditUnitModal = ref(false)
const editingUnit = ref<Unit | null>(null)
const roomsWithBeds = ref<RoomWithBeds[]>([])
const showAddRoomForm = ref(false)
const newRoomName = ref('')
const expandedRooms = ref<Set<string>>(new Set())
const editingRoomId = ref<string | null>(null)
const editingRoomName = ref('')
const editingBedId = ref<string | null>(null)
const editingBedName = ref('')
const roomNameInputRef = ref<any>()
const roomInputRef = ref<any>()
const bedInputRef = ref<any>()

// Edit Unit Form
const editUnitForm = ref({
  area_tag: undefined as string | undefined,
  unit_name: '',
  unit_number: '',
})

// Area Tag Options
const areaTagOptions = ref<TagCatalogItem[]>([])
const areaTagSearchValue = ref('')

// Unit 网格计算
const unitGrid = computed(() => {
  const grid: (Unit | null)[] = new Array(gridSize.value).fill(null)

  // 使用 currentBuildingForGrid 而不是 selectedBuilding
  const building = currentBuildingForGrid.value

  // 填充已有 Unit（只显示当前选中的 building 和 floor 的 units）
  units.value.forEach((unit) => {
    // 检查 unit 是否匹配当前选中的 building 和 floor
    if (
      building &&
      unit.building === building.building_name &&
      unit.floor === selectedFloor.value
    ) {
      // 根据 unit_number 排序并填充到网格
      // 简单映射：使用 unit_number 的后两位数字来决定位置
      if (unit.unit_number) {
        const unitNum = parseInt(unit.unit_number)
        if (!isNaN(unitNum)) {
          // 使用 unit_number 的后两位数字作为索引（例如：101 -> 1, 201 -> 1）
          const index = (unitNum % 100) % gridSize.value
          grid[index] = unit
        }
      }
    }
  })

  return grid
})

// 获取 Building 列表
const fetchBuildings = async () => {
  try {
    buildings.value = await getBuildingsApi()
  } catch (error: any) {
    message.error('Failed to fetch buildings: ' + (error.message || 'Unknown error'))
  }
}

// 获取 Unit 列表
const fetchUnits = async () => {
  const building = currentBuildingForGrid.value
  if (!building || !selectedFloor.value) {
    units.value = []
    return
  }

  try {
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    const result = await getUnitsApi({
      tenant_id: tenantId,
      building: building.building_name,
      floor: selectedFloor.value,
      is_active: true,
    })

    units.value = result.items
  } catch (error: any) {
    message.error('Failed to fetch units: ' + (error.message || 'Unknown error'))
  }
}

// 点击 headline 行的 Building 标签（独立的组件实例，但会同步关闭另一处）
const handleToggleBuildingTag = (building: Building) => {
  const buildingId = building.building_id || ''

  // headline 行：如果点击的是已展开的 Building，收起它
  if (expandedBuildings.value.has(buildingId)) {
    expandedBuildings.value = new Set()
    selectedFloor.value = ''
    units.value = []
    currentBuildingForGrid.value = null
  } else {
    // headline 行：只展开当前点击的 Building，立即关闭其他所有 Building
    expandedBuildings.value = new Set([buildingId])
    // 同步：关闭左侧列的相同 Building（如果之前是展开的）
    if (selectedBuilding.value?.building_id === buildingId) {
      selectedBuilding.value = null
    }
    selectedFloor.value = ''
    units.value = []
    currentBuildingForGrid.value = null
  }
}

// 点击左侧列的 Building 卡片（独立的组件实例，但会同步关闭另一处）
const handleToggleBuildingCard = (building: Building) => {
  const buildingId = building.building_id || ''

  // 左侧列：如果点击的是已选中的 Building，取消选中（收起楼层列表）
  if (selectedBuilding.value?.building_id === buildingId) {
    selectedBuilding.value = null
    selectedFloor.value = ''
    units.value = []
    currentBuildingForGrid.value = null
  } else {
    // 左侧列：只展开当前点击的 Building，立即关闭其他所有 Building
    selectedBuilding.value = building
    // 同步：关闭 headline 行的相同 Building（如果之前是展开的）
    if (expandedBuildings.value.has(buildingId)) {
      expandedBuildings.value = new Set()
    }
    selectedFloor.value = ''
    units.value = []
    currentBuildingForGrid.value = null
  }
}


// 选择楼层
const handleSelectFloor = async (building: Building, floor: string) => {
  const buildingId = building.building_id || ''

  // 设置用于 unitGrid 的 building
  currentBuildingForGrid.value = building

  // 如果是从 headline 行调用的（expandedBuildings 中有这个 building），不设置 selectedBuilding
  // 如果是从左侧列调用的，设置 selectedBuilding
  if (!expandedBuildings.value.has(buildingId)) {
    // 从左侧列调用：设置 selectedBuilding
    selectedBuilding.value = building
    // 同步：关闭 headline 行的相同 Building（如果之前是展开的）
    if (expandedBuildings.value.has(buildingId)) {
      expandedBuildings.value = new Set()
    }
  } else {
    // 从 headline 行调用：不设置 selectedBuilding，避免左侧列展开
    // 但需要关闭左侧列（如果之前是展开的）
    if (selectedBuilding.value?.building_id === buildingId) {
      selectedBuilding.value = null
    }
  }

  selectedFloor.value = floor

  // 等待 Vue 响应式更新
  await nextTick()

  // 获取 units
  await fetchUnits()
}

// 获取 Building 显示名称（tag_name-Building_name）- 使用 computed 缓存
// UI层将 location_tag 映射为 tag_name 用于显示
const buildingsWithDisplayName = computed(() => {
  return buildings.value.map((building) => {
    const tagName = building.location_tag || '' // API返回的是 location_tag
    return {
      ...building,
      tag_name: tagName, // UI显示用的 tag_name
      displayName: tagName
        ? `${tagName}-${building.building_name}`
        : building.building_name,
    }
  })
})

// 创建 Building
const handleCreateBuilding = async () => {
  try {
    if (!createBuildingForm.value.building_name || !createBuildingForm.value.floors) {
      message.error('Please fill in all required fields')
      return
    }

    await createBuildingApi({
      building_name: createBuildingForm.value.building_name,
      floors: createBuildingForm.value.floors,
      tag_name: createBuildingForm.value.tag_name || undefined,
    } as any)

    message.success('Building created successfully')
    resetCreateBuildingForm()
    fetchBuildings()
  } catch (error: any) {
    message.error('Failed to create building: ' + (error.message || 'Unknown error'))
  }
}

// 重置 Create Building 表单
const resetCreateBuildingForm = () => {
  createBuildingForm.value = {
    tag_name: '',
    building_name: '',
    floors: 1,
  }
}

// 编辑 Building（进入编辑模式）
// UI层将 location_tag 映射为 tag_name 用于编辑
const handleEditBuilding = (building: Building) => {
  editingBuildingId.value = building.building_id || null
  editingBuildingForm.value = {
    tag_name: building.location_tag || '', // API返回的是 location_tag，映射为 tag_name 用于UI
    building_name: building.building_name || '',
  }
}

// 保存 Building（退出编辑模式并提交）
const handleSaveBuilding = async (building: Building) => {
  try {
    if (!building.building_id) {
      message.error('Building ID is missing')
      editingBuildingId.value = null
      return
    }

    // 验证必填字段
    if (!editingBuildingForm.value.building_name) {
      message.error('Building name is required')
      return
    }

    // 提交更新
    // UI层的 tag_name 映射为 API 的 location_tag
    await updateBuildingApi(building.building_id, {
      building_name: editingBuildingForm.value.building_name,
      tag_name: editingBuildingForm.value.tag_name || undefined, // API层会转换为 location_tag
    } as any)

    message.success('Building updated successfully')

    // 退出编辑模式
    editingBuildingId.value = null

    // 刷新 Building 列表
    await fetchBuildings()

    // 如果修改的是当前选中的 Building，保持选中状态（selectedBuilding 不变）
    // selectedBuilding 是 computed，会自动更新
  } catch (error: any) {
    message.error('Failed to update building: ' + (error.message || 'Unknown error'))
  }
}

// 删除楼层
const handleDeleteFloor = async (building: Building, floorNum: number) => {
  try {
    // 检查该楼层是否有 Location
    const floorStr = `${floorNum}F`
    const unitParams = {
      building: building.building_name,
      floor: floorStr,
      is_active: true,
    }
    const unitResult = await getUnitsApi(unitParams)

    if (unitResult.items && unitResult.items.length > 0) {
      message.error('Still include Unit')
      return
    }

    // 确认删除楼层
    if (!building.building_id) {
      message.error('Building ID is missing')
      return
    }

    // 如果删除的楼层是当前选中的楼层，清空选择
    if (selectedBuilding.value?.building_id === building.building_id && selectedFloor.value === floorStr) {
      selectedFloor.value = ''
      units.value = []
    }

    // 更新 Building 的 floors 数量
    const newFloors = building.floors - 1
    if (newFloors < 1) {
      message.error('Building must have at least one floor')
      return
    }

    await updateBuildingApi(building.building_id, { floors: newFloors })
    message.success('Floor deleted successfully')

    // 刷新 Building 列表
    await fetchBuildings()
  } catch (error: any) {
    message.error('Failed to delete floor: ' + (error.message || 'Unknown error'))
  }
}

// 删除 Building
const handleDeleteBuilding = async (building: Building) => {
  try {
    // 检查是否有 Location
    const locationParams = {
      building: building.building_name,
      is_active: true,
    }
    const unitResult = await getUnitsApi(unitParams)

    if (locationResult.items && locationResult.items.length > 0) {
      message.error('Still include Unit')
      return
    }

    // 确认删除
    if (!building.building_id) {
      message.error('Building ID is missing')
      return
    }

    await deleteBuildingApi(building.building_id)
    message.success('Building deleted successfully')

    // 刷新 Building 列表
    await fetchBuildings()

    // 如果删除的是左侧列选中的 Building，清空选择
    if (selectedBuilding.value?.building_id === building.building_id) {
      selectedBuilding.value = null
      selectedFloor.value = ''
      units.value = []
    }
    // 如果删除的是 headline 行展开的 Building，清空展开状态
    if (expandedBuildings.value.has(building.building_id || '')) {
      expandedBuildings.value = new Set()
    }
  } catch (error: any) {
    message.error('Failed to delete building: ' + (error.message || 'Unknown error'))
  }
}

// 点击网格单元格
const handleCellClick = async (unit: Unit | null, _index: number) => {
  try {
    // 加载 area tag 选项
    await fetchAreaTags()

    if (unit) {
      // Existing Unit: 打开编辑 Unit 界面
      editingUnit.value = unit
      // 初始化表单数据
      editUnitForm.value = {
        area_tag: unit.area_tag,
        unit_name: unit.unit_name,
        unit_number: unit.unit_number,
      }
      await fetchRoomsWithBeds(unit.unit_id)
      showEditUnitModal.value = true
      await nextTick()
    } else {
      // 空白单元格：也打开编辑 Unit 界面，但 editingUnit 为 null
      editingUnit.value = null
      roomsWithBeds.value = []
      // 初始化空表单
      editUnitForm.value = {
        area_tag: undefined,
        unit_name: '',
        unit_number: '',
      }
      showEditUnitModal.value = true
      await nextTick()
    }
  } catch (error: any) {
    message.error('Failed to handle cell click: ' + (error.message || 'Unknown error'))
  }
}

// 创建 Unit
const handleCreateUnit = async () => {
  try {
    if (!createUnitForm.value.unit_number || !createUnitForm.value.unit_name) {
      message.error('Please fill in all required fields')
      return
    }

    if (!selectedBuilding.value || !selectedFloor.value) {
      message.error('Please select a building and floor')
      return
    }

    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    await createUnitApi({
      unit_number: createUnitForm.value.unit_number,
      unit_name: createUnitForm.value.unit_name,
      building: createUnitForm.value.building || selectedBuilding.value.building_name,
      floor: createUnitForm.value.floor || selectedFloor.value,
      location_tag: createUnitForm.value.location_tag,
      area_tag: createUnitForm.value.area_tag,
      location_type: 'institution',
    })

    message.success('Unit created successfully')
    showCreateUnitModal.value = false
    resetCreateUnitForm()
    fetchUnits()
  } catch (error: any) {
    message.error('Failed to create unit: ' + (error.message || 'Unknown error'))
  }
}

// 重置 Create Unit 表单
const resetCreateUnitForm = () => {
  createUnitForm.value = {
    unit_number: '',
    unit_name: '',
    location_tag: undefined,
    area_tag: undefined,
    building: '',
    floor: '',
  }
  // selectedCellIndex.value = null
}

// 获取 Room 和 Bed 列表
const fetchRoomsWithBeds = async (unitId: string) => {
  try {
    const result = await getRoomsApi({ unit_id: unitId })
    roomsWithBeds.value = result
  } catch (error: any) {
    message.error('Failed to fetch rooms and beds: ' + (error.message || 'Unknown error'))
    // 即使出错也显示空列表，让用户可以添加
    roomsWithBeds.value = []
  }
}

// 获取 Area Tag 选项
const fetchAreaTags = async () => {
  try {
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      return
    }

    // 获取所有 tags，然后过滤出可能的 area_tag
    // 根据实际业务，area_tag 可能是 tag_name（如 'East', 'West'）
    // 或者有特定的 tag_type
    const result = await getTagsApi({
      tenant_id: tenantId,
    })

    // 过滤出可能的 area_tag
    // 这里先获取所有 tags，用户可以选择或输入新的
    // 如果业务中有特定的 tag_type 用于 area_tag，可以在这里过滤
    areaTagOptions.value = result.items
  } catch (error: any) {
    console.error('Failed to fetch area tags:', error)
    areaTagOptions.value = []
  }
}

// 处理 Area Tag 搜索
const handleAreaTagSearch = (value: string) => {
  areaTagSearchValue.value = value
}

// 处理 Area Tag 失焦（当用户输入新值并离开输入框时）
const handleAreaTagBlur = async () => {
  const value = areaTagSearchValue.value.trim()
  if (value && value !== editUnitForm.value.area_tag) {
    // 检查是否是新建的 tag（不在选项中）
    const exists = areaTagOptions.value.some((tag) => tag.tag_name === value)
    if (!exists) {
      // 创建新的 area_tag
      try {
        const userInfo = userStore.getUserInfo
        const tenantId = userInfo?.tenant_id

        if (!tenantId) {
          message.error('No tenant ID available')
          return
        }

        await createTagApi({
          tenant_id: tenantId,
          tag_type: null, // area_tag 可能不是 tag_type，而是 tag_name
          tag_name: value,
        })

        message.success('Area tag created successfully')
        // 刷新 area tag 选项
        await fetchAreaTags()
        // 设置新创建的 tag 为选中值
        editUnitForm.value.area_tag = value
      } catch (error: any) {
        message.error('Failed to create area tag: ' + (error.message || 'Unknown error'))
      }
    }
  }
}

// 获取 Edit Unit 标题
const getEditUnitTitle = () => {
  if (editingUnit.value) {
    const areaTag = editUnitForm.value.area_tag || editingUnit.value.area_tag || ''
    const unitName = editUnitForm.value.unit_name || editingUnit.value.unit_name || ''
    if (areaTag && unitName) {
      return `Edit Unit:  ${areaTag} - ${unitName}`
    } else if (unitName) {
      return `Edit Unit:  ${unitName}`
    }
  }
  return 'Edit Unit'
}

// 重置编辑 Unit 表单
const resetEditUnitForm = () => {
  editingUnit.value = null
  roomsWithBeds.value = []
  showAddRoomForm.value = false
  newRoomName.value = ''
  expandedRooms.value = new Set()
  editingRoomId.value = null
  editingRoomName.value = ''
  editUnitForm.value = {
    area_tag: undefined,
    unit_name: '',
    unit_number: '',
  }
  areaTagSearchValue.value = ''
}

// 保存 Unit 信息
const handleSaveUnit = async () => {
  try {
    if (!editUnitForm.value.unit_name || !editUnitForm.value.unit_number) {
      message.error('Unit name and Unit number are required')
      return
    }

    if (!editingUnit.value) {
      // 创建新的 Unit
      const userInfo = userStore.getUserInfo
      const tenantId = userInfo?.tenant_id

      if (!tenantId) {
        message.error('No tenant ID available')
        return
      }

      if (!currentBuildingForGrid.value || !selectedFloor.value) {
        message.error('Please select a building and floor')
        return
      }

      await createUnitApi({
        unit_number: editUnitForm.value.unit_number,
        unit_name: editUnitForm.value.unit_name,
        building: currentBuildingForGrid.value.building_name,
        floor: selectedFloor.value,
        area_tag: editUnitForm.value.area_tag,
        location_type: 'institution',
      })

      message.success('Unit created successfully')
      resetEditUnitForm()
      showEditUnitModal.value = false
      await fetchUnits()
    } else {
      // 更新现有 Unit（unit_number 不能更新）
      await updateUnitApi(editingUnit.value.unit_id, {
        unit_name: editUnitForm.value.unit_name,
        area_tag: editUnitForm.value.area_tag,
      })

      message.success('Unit updated successfully')
      resetEditUnitForm()
      showEditUnitModal.value = false
      await fetchUnits()
    }
  } catch (error: any) {
    message.error('Failed to save unit: ' + (error.message || 'Unknown error'))
  }
}

// 展开/收起 Room
const toggleRoom = (roomId: string) => {
  if (expandedRooms.value.has(roomId)) {
    expandedRooms.value.delete(roomId)
  } else {
    expandedRooms.value.add(roomId)
  }
}

// 显示添加 Room 表单
const handleShowAddRoomForm = () => {
  showAddRoomForm.value = true
  showAddBedFormForRoom.value = null
  newRoomName.value = ''
  nextTick(() => {
    if (roomNameInputRef.value && roomNameInputRef.value.$el) {
      roomNameInputRef.value.$el.querySelector('input')?.focus()
    } else if (roomNameInputRef.value && roomNameInputRef.value.focus) {
      roomNameInputRef.value.focus()
    }
  })
}

// 取消添加 Room
const handleCancelAddRoom = () => {
  showAddRoomForm.value = false
  newRoomName.value = ''
}

// 添加 Room
const handleAddRoom = async () => {
  try {
    if (!editingUnit.value) {
      message.error('No unit selected')
      return
    }

    if (!newRoomName.value.trim()) {
      message.error('Please input room name')
      return
    }

    await createRoomApi({
      unit_id: editingUnit.value.unit_id,
      room_name: newRoomName.value.trim(),
      is_default: false,
    })

    // 刷新列表
    await fetchRoomsWithBeds(editingUnit.value.unit_id)

    message.success('Room added successfully')
    showAddRoomForm.value = false
    newRoomName.value = ''
  } catch (error: any) {
    message.error('Failed to add room: ' + (error.message || 'Unknown error'))
  }
}

// 获取可用的床字母（A-Z）
const getAvailableBedLetters = (room: RoomWithBeds): string[] => {
  const allLetters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)) // A-Z
  const usedLetters = room.beds
    ?.map((bed) => {
      // 提取床名中的字母，支持 "BedA", "Bed A", "A" 等格式
      const match = bed.bed_name.match(/Bed\s*([A-Z])/i) || bed.bed_name.match(/^([A-Z])$/i)
      return match ? match[1].toUpperCase() : null
    })
    .filter((letter): letter is string => letter !== null) || []
  
  return allLetters.filter((letter) => !usedLetters.includes(letter))
}

// 验证并格式化 Bed 名称（BedA-BedZ，不区分大小写，自动转换为 Bed[A-Z]）
const validateAndFormatBedName = (bedName: string): string | null => {
  if (!bedName || !bedName.trim()) {
    return null
  }
  
  const trimmed = bedName.trim()
  // 匹配 BedA-BedZ 格式（不区分大小写），支持 "BedA", "bedA", "BEDA", "Bed A", "A", "bed a" 等
  const match = trimmed.match(/^Bed\s*([A-Z])$/i) || trimmed.match(/^([A-Z])$/i)
  
  if (match) {
    const letter = match[1].toUpperCase()
    return `Bed${letter}`
  }
  
  return null
}

// 直接添加 Bed（自动选择下一个可用字母）
const handleAddBedDirectly = async (room: RoomWithBeds) => {
  try {
    const availableLetters = getAvailableBedLetters(room)
    
    if (availableLetters.length === 0) {
      message.warning('All beds (A-Z) have been added')
      return
    }

    // 使用第一个可用的字母
    const bedLetter = availableLetters[0]
    const bedName = `Bed${bedLetter}`

    await createBedApi({
      room_id: room.room_id,
      bed_name: bedName,
    })

    // 确保 Room 已展开以显示新添加的床
    expandedRooms.value.add(room.room_id)

    // 刷新列表
    if (editingUnit.value) {
      await fetchRoomsWithBeds(editingUnit.value.unit_id)
    }

    message.success(`Bed ${bedLetter} added successfully`)
  } catch (error: any) {
    message.error('Failed to add bed: ' + (error.message || 'Unknown error'))
  }
}

// 使用 UnitName 作为 Room_name 直接添加 Bed
const handleAddBedWithUnitName = async () => {
  try {
    if (!editingUnit.value) {
      message.error('No unit selected')
      return
    }

    const unitName = editingUnit.value.unit_name

    // 检查是否已存在以 UnitName 命名的 Room
    let room = roomsWithBeds.value.find((r) => r.room_name === unitName)

    if (!room) {
      // 创建新 Room，使用 UnitName 作为 room_name
      const newRoom = await createRoomApi({
        unit_id: editingUnit.value.unit_id,
        room_name: unitName,
        is_default: false,
      })
      // 将新 Room 添加到列表
      const newRoomWithBeds: RoomWithBeds = {
        ...newRoom,
        beds: [],
      }
      roomsWithBeds.value.push(newRoomWithBeds)
      room = newRoomWithBeds
    }

    // 获取可用的床字母
    const availableLetters = getAvailableBedLetters(room)
    
    if (availableLetters.length === 0) {
      message.warning('All beds (A-Z) have been added for this room')
      return
    }

    // 使用第一个可用的字母
    const bedLetter = availableLetters[0]
    const bedName = `Bed${bedLetter}`

    // 创建 Bed
    await createBedApi({
      room_id: room.room_id,
      bed_name: bedName,
    })

    // 确保 Room 已展开以显示新添加的床
    expandedRooms.value.add(room.room_id)

    // 刷新列表
    await fetchRoomsWithBeds(editingUnit.value.unit_id)

    message.success(`Bed ${bedLetter} added successfully`)
  } catch (error: any) {
    message.error('Failed to add bed: ' + (error.message || 'Unknown error'))
  }
}

// 编辑 Room
const handleEditRoom = (room: RoomWithBeds) => {
  editingRoomId.value = room.room_id
  editingRoomName.value = room.room_name
  nextTick(() => {
    if (roomInputRef.value && roomInputRef.value.$el) {
      roomInputRef.value.$el.querySelector('input')?.focus()
    } else if (roomInputRef.value && roomInputRef.value.focus) {
      roomInputRef.value.focus()
    }
  })
}

// 保存 Room 名称
const handleSaveRoomName = async (roomId: string) => {
  try {
    if (!editingRoomName.value.trim()) {
      message.warning('Room name cannot be empty')
      if (editingUnit.value) {
        await fetchRoomsWithBeds(editingUnit.value.unit_id)
      }
      editingRoomId.value = null
      return
    }

    await updateRoomApi(roomId, { room_name: editingRoomName.value.trim() })

    if (editingUnit.value) {
      await fetchRoomsWithBeds(editingUnit.value.unit_id)
    }

    message.success('Room name updated successfully')
    editingRoomId.value = null
  } catch (error: any) {
    message.error('Failed to update room name: ' + (error.message || 'Unknown error'))
    if (editingUnit.value) {
      await fetchRoomsWithBeds(editingUnit.value.unit_id)
    }
    editingRoomId.value = null
  }
}


// 删除 Room
const handleDeleteRoom = async (roomId: string) => {
  try {
    await deleteRoomApi(roomId)
    if (editingUnit.value) {
      await fetchRoomsWithBeds(editingUnit.value.unit_id)
    }
    message.success('Room deleted successfully')
  } catch (error: any) {
    message.error('Failed to delete room: ' + (error.message || 'Unknown error'))
  }
}

// 编辑 Bed
const handleEditBed = (bed: Bed) => {
  editingBedId.value = bed.bed_id
  editingBedName.value = bed.bed_name
  nextTick(() => {
    if (bedInputRef.value && bedInputRef.value.$el) {
      bedInputRef.value.$el.querySelector('input')?.focus()
    } else if (bedInputRef.value && bedInputRef.value.focus) {
      bedInputRef.value.focus()
    }
  })
}

// 保存 Bed 名称（验证格式：BedA-BedZ）
const handleSaveBedName = async (bedId: string) => {
  try {
    const formattedName = validateAndFormatBedName(editingBedName.value)
    
    if (!formattedName) {
      message.warning('Bed name must be in format BedA-BedZ (e.g., BedA, bedB, BedZ)')
      if (editingUnit.value) {
        await fetchRoomsWithBeds(editingUnit.value.unit_id)
      }
      editingBedId.value = null
      return
    }

    await updateBedApi(bedId, { bed_name: formattedName })

    if (editingUnit.value) {
      await fetchRoomsWithBeds(editingUnit.value.unit_id)
    }

    message.success('Bed name updated successfully')
    editingBedId.value = null
  } catch (error: any) {
    message.error('Failed to update bed name: ' + (error.message || 'Unknown error'))
    if (editingUnit.value) {
      await fetchRoomsWithBeds(editingUnit.value.unit_id)
    }
    editingBedId.value = null
  }
}

// 删除 Bed
const handleDeleteBed = async (bedId: string) => {
  try {
    await deleteBedApi(bedId)
    if (editingUnit.value) {
      await fetchRoomsWithBeds(editingUnit.value.unit_id)
    }
    message.success('Bed deleted successfully')
  } catch (error: any) {
    message.error('Failed to delete bed: ' + (error.message || 'Unknown error'))
  }
}

// 初始化
onMounted(() => {
  fetchBuildings()
})
</script>

<style scoped>
.unit-list {
  padding: 24px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 16px;
}

.create-building-form {
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-label {
  font-weight: 500;
}

.separator {
  margin: 0 4px;
}

.divider {
  height: 1px;
  background: #e8e8e8;
  margin-bottom: 24px;
}

.main-container {
  display: flex;
  flex: 1;
  gap: 24px;
  overflow: hidden;
}

/* 左侧：Building 列表（完整的 Building 卡片和楼层按钮） */
.building-list {
  width: 150px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-right: 1px solid #e8e8e8;
  padding-right: 16px;
}

.buildings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.building-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
}

.building-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.building-card.active {
  border-color: #1890ff;
  background: #f0f9ff;
}

.building-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.building-name {
  font-weight: 600;
  font-size: 16px;
}

.building-edit-icon {
  color: #1890ff;
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
}

.building-edit-icon:hover {
  color: #40a9ff;
}

.building-delete-icon {
  color: #1890ff;
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
  margin-left: auto;
}

.building-delete-icon:hover {
  color: #40a9ff;
}

.building-edit {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.building-edit .separator {
  color: #999;
  font-size: 11px;
  margin: 0 2px;
}

.building-actions {
  display: flex;
  gap: 8px;
  color: #1890ff;
  cursor: pointer;
  flex-shrink: 0;
}

.building-actions :hover {
  color: #40a9ff;
}

.building-tags {
  display: flex;
  gap: 8px;
  margin-left: 16px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.building-tag-card {
  position: relative;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 8px 12px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
  min-width: 120px;
}

.building-tag-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.building-tag-card.active {
  border-color: #1890ff;
  background: #f0f9ff;
}

.building-tag-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.building-tag-name {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.building-tag-edit-icon {
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
}

.building-tag-edit-icon:hover {
  color: #40a9ff;
}

.building-tag-delete-icon {
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
  margin-left: auto;
}

.building-tag-delete-icon:hover {
  color: #40a9ff;
}

.building-tag-edit {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.building-tag-edit .separator {
  color: #999;
  font-size: 11px;
  margin: 0 2px;
}

.building-tag-actions {
  display: flex;
  gap: 6px;
  color: #1890ff;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 14px;
  opacity: 1;
  visibility: visible;
}

.building-tag-actions :hover {
  color: #40a9ff;
}

.building-tag-actions .anticon {
  font-size: 14px;
  display: inline-block;
}

.building-tag-floors {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  padding: 8px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.floor-item-small {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.floor-button-small {
  flex: 1;
  text-align: left;
  font-size: 12px;
  padding: 2px 8px;
  height: auto;
}

.floor-delete-icon {
  color: #ff4d4f;
  cursor: pointer;
  font-size: 12px;
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.floor-delete-icon:hover {
  opacity: 1;
}

.floors {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.floor-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.floor-button {
  flex: 1;
  text-align: left;
}

/* 右侧：Unit 网格 */
.unit-grid-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 16px;
}

.unit-grid-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.grid-header {
  margin-bottom: 16px;
}

.grid-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.unit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  overflow-y: auto;
  padding: 8px;
}

.location-cell {
  aspect-ratio: 1.5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.location-cell:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.unit-cell.has-unit {
  background: #f0f9ff;
}

.unit-content {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  padding: 8px;
}

.empty-cell {
  color: #999;
  font-size: 24px;
}

.empty-cell:hover {
  color: #1890ff;
}

/* Edit Unit Modal Styles */
:deep(.ant-modal-body) {
  padding-top: 12px;
  padding-bottom: 16px;
}

.unit-edit-container {
  padding: 0;
}

.unit-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 0;
  margin-bottom: 8px;
}

.unit-field {
  display: flex;
  align-items: center;
  gap: 4px;
}

.unit-field.full-row label {
  width: 90px;
}

.unit-field.full-row label {
  font-size: 13px;
  color: #555;
}

.unit-field.full-row :deep(.ant-input) {
  width: 150px;
}

.unit-field.inline-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.inline-field {
  display: flex;
  align-items: center;
  gap: 4px;
}

.inline-field label {
  font-size: 13px;
  color: #555;
}

.required-star {
  color: #ff4d4f;
  margin-left: 2px;
}

/* Room-Bed Tree Structure Styles */
.room-bed-section {
  margin-top: 16px;
  border-top: 1px solid #e8e8e8;
  padding-top: 16px;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tree-header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tree-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.tree-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 8px;
  background: #fafafa;
}

.tree-empty {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 13px;
}

.tree-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tree-node {
  display: flex;
  flex-direction: column;
  margin-bottom: 4px;
}

.tree-node.room-node {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 4px 8px;
}

.tree-node.bed-node {
  background: #f9f9f9;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 4px 8px;
  margin-left: 24px;
  margin-top: 4px;
}

.tree-node.add-form {
  background: #f0f9ff;
  border: 1px dashed #1890ff;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
}

.expand-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  background: #fff;
  font-size: 14px;
  font-weight: bold;
  color: #666;
  user-select: none;
  flex-shrink: 0;
}

.expand-icon:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.expand-placeholder {
  width: 20px;
  flex-shrink: 0;
}

.node-label {
  font-size: 13px;
  color: #333;
  cursor: default;
  padding: 2px 4px;
  border-radius: 2px;
  flex-shrink: 0;
}

.node-label:hover {
  background: #f5f5f5;
}

.node-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.action-icon {
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  border-radius: 2px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.action-icon:hover {
  background: #e6f7ff;
  color: #40a9ff;
}

.action-icon.delete-icon {
  color: #ff4d4f;
}

.action-icon.delete-icon:hover {
  background: #fff1f0;
  color: #ff7875;
}

.action-icon.inline-action {
  margin-left: 2px;
}

.tree-children {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}

.modal-actions-right {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.unitnumber-field {
  margin-left: auto;
}

.unit-cell {
  cursor: pointer;
  user-select: none;
}

.unit-cell:hover {
  background-color: #f5f5f5;
}
</style>




