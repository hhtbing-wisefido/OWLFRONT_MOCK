<template>
  <div class="address-management">
    <!-- 页首：创建表单 -->
    <div class="page-header">
      <div class="create-building-form">
        <span class="create-label">tag:</span>
        <a-input
          v-model:value="createBuildingForm.tag_name"
          placeholder="tag_name"
          style="width: 120px"
          @pressEnter="handleCreateBuilding"
        />
        <span class="separator">:</span>
        <span class="create-label">Building:</span>
        <a-input
          v-model:value="createBuildingForm.building_name"
          placeholder="Build name"
          style="width: 100px"
          @pressEnter="handleCreateBuilding"
        />
        <span class="separator">:</span>
        <span class="create-label">Floors:</span>
        <a-input-number
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
                  v-model:value="editingBuildingForm.tag_name"
                  placeholder="TAG"
                  size="small"
                  style="width: 60px"
                  @pressEnter="handleSaveBuilding(building)"
                  @blur="handleSaveBuilding(building)"
                />
                <span class="separator">:</span>
                <a-input
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
                  v-model:value="editingBuildingForm.tag_name"
                  placeholder="TAG"
                  size="small"
                  style="width: 60px"
                  @pressEnter="handleSaveBuilding(building)"
                  @blur="handleSaveBuilding(building)"
                />
                <span class="separator">:</span>
                <a-input
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

      <!-- 右侧：Location 网格 -->
      <div class="location-grid-container">
        <div v-if="!selectedBuilding || !selectedFloor" class="empty-state">
          <p>Please select a floor</p>
        </div>
        <div v-else class="location-grid-wrapper">
          <div class="location-grid">
            <div
              v-for="(location, index) in locationGrid"
              :key="location?.location_id || `empty-${index}`"
              class="location-cell"
              :class="{ 'has-location': location }"
              @click="handleCellClick(location, index)"
            >
              <div v-if="location" class="location-content">
                {{ location.door_number }} Unit
              </div>
              <div v-else class="empty-cell">
                <PlusOutlined />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Create Location Modal -->
    <a-modal
      v-model:open="showCreateLocationModal"
      title="Create Location"
      @ok="handleCreateLocation"
      @cancel="resetCreateLocationForm"
      :width="600"
    >
      <a-form :model="createLocationForm" layout="vertical">
        <a-form-item
          label="DoorNumber"
          :rules="[{ required: true, message: 'Please input door number' }]"
        >
          <a-input v-model:value="createLocationForm.door_number" />
        </a-form-item>
        <a-form-item
          label="Location Name"
          :rules="[{ required: true, message: 'Please input location name' }]"
        >
          <a-input v-model:value="createLocationForm.location_name" />
        </a-form-item>
        <a-form-item label="Location Tag">
          <a-select
            v-model:value="createLocationForm.location_tag"
            placeholder="Select location tag"
            allow-clear
          >
            <a-select-option value="VIP">VIP</a-select-option>
            <a-select-option value="Standard">Standard</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Area Tag">
          <a-select
            v-model:value="createLocationForm.area_tag"
            placeholder="Select area tag"
            allow-clear
          >
            <a-select-option value="East">East</a-select-option>
            <a-select-option value="West">West</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Building">
          <a-input v-model:value="createLocationForm.building" />
        </a-form-item>
        <a-form-item label="Floor">
          <a-input v-model:value="createLocationForm.floor" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import type { Building, Location } from '@/api/location/model/locationModel'
import {
  createBuildingApi,
  getBuildingsApi,
  updateBuildingApi,
  deleteBuildingApi,
  createLocationApi,
  getLocationsApi,
} from '@/api/location/location'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

// Building 列表
const buildings = ref<Building[]>([])
const selectedFloor = ref<string>('')

// Headline 行：独立管理自己的展开状态（独立的组件实例）
const expandedBuildings = ref<Set<string>>(new Set())

// 左侧列：独立管理自己的展开状态（独立的组件实例）
const selectedBuilding = ref<Building | null>(null)

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

// Location 网格
const locations = ref<Location[]>([])
const gridSize = ref(20) // 默认网格大小

// Create Location Modal
const showCreateLocationModal = ref(false)
const createLocationForm = ref({
  door_number: '',
  location_name: '',
  location_tag: undefined as string | undefined,
  area_tag: undefined as string | undefined,
  building: '',
  floor: '',
})
// selectedCellIndex 暂时未使用，保留用于后续功能
// const selectedCellIndex = ref<number | null>(null)

// Location 网格计算
const locationGrid = computed(() => {
  const grid: (Location | null)[] = new Array(gridSize.value).fill(null)

  // 填充已有 Location
  locations.value.forEach((location) => {
    // 简单映射：根据 location_id 的哈希值决定位置
    // 实际应该根据 door_number 排序
    if (location.location_id) {
      const idPart = location.location_id.split('-')[1]
      if (idPart) {
        const index = parseInt(idPart) % gridSize.value
        if (!isNaN(index)) {
          grid[index] = location
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

// 获取 Location 列表
const fetchLocations = async () => {
  if (!selectedBuilding.value || !selectedFloor.value) {
    locations.value = []
    return
  }

  try {
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    const result = await getLocationsApi({
      tenant_id: tenantId,
      building: selectedBuilding.value.building_name,
      floor: selectedFloor.value,
      is_active: true,
    })

    locations.value = result.items
  } catch (error: any) {
    message.error('Failed to fetch locations: ' + (error.message || 'Unknown error'))
  }
}

// 点击 headline 行的 Building 标签（独立的组件实例，但会同步关闭另一处）
const handleToggleBuildingTag = (building: Building) => {
  const buildingId = building.building_id || ''
  
  // headline 行：如果点击的是已展开的 Building，收起它
  if (expandedBuildings.value.has(buildingId)) {
    expandedBuildings.value = new Set()
    selectedFloor.value = ''
    locations.value = []
  } else {
    // headline 行：只展开当前点击的 Building，立即关闭其他所有 Building
    expandedBuildings.value = new Set([buildingId])
    // 同步：关闭左侧列的相同 Building（如果之前是展开的）
    if (selectedBuilding.value?.building_id === buildingId) {
      selectedBuilding.value = null
    }
    selectedFloor.value = ''
    locations.value = []
  }
}

// 点击左侧列的 Building 卡片（独立的组件实例，但会同步关闭另一处）
const handleToggleBuildingCard = (building: Building) => {
  const buildingId = building.building_id || ''
  
  // 左侧列：如果点击的是已选中的 Building，取消选中（收起楼层列表）
  if (selectedBuilding.value?.building_id === buildingId) {
    selectedBuilding.value = null
    selectedFloor.value = ''
    locations.value = []
  } else {
    // 左侧列：只展开当前点击的 Building，立即关闭其他所有 Building
    selectedBuilding.value = building
    // 同步：关闭 headline 行的相同 Building（如果之前是展开的）
    if (expandedBuildings.value.has(buildingId)) {
      expandedBuildings.value = new Set()
    }
    selectedFloor.value = ''
    locations.value = []
  }
}


// 选择楼层（只从左侧列选择楼层才会生效，headline 行的楼层按钮仅用于展开/收起）
const handleSelectFloor = (building: Building, floor: string) => {
  const buildingId = building.building_id || ''
  
  // 只有左侧列选中的 Building 才能选择楼层
  if (selectedBuilding.value?.building_id === buildingId) {
    selectedFloor.value = floor
    fetchLocations()
  }
}

// 获取 Building 显示名称（tag_name-Building_name）- 使用 computed 缓存
const buildingsWithDisplayName = computed(() => {
  return buildings.value.map((building) => ({
    ...building,
    displayName: (building as any).tag_name
      ? `${(building as any).tag_name}-${building.building_name}`
      : building.building_name,
  }))
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
const handleEditBuilding = (building: Building) => {
  editingBuildingId.value = building.building_id || null
  editingBuildingForm.value = {
    tag_name: (building as any).tag_name || '',
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
    await updateBuildingApi(building.building_id, {
      building_name: editingBuildingForm.value.building_name,
      tag_name: editingBuildingForm.value.tag_name || undefined,
    })

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
    const locationParams = {
      building: building.building_name,
      floor: floorStr,
      is_active: true,
    }
    const locationResult = await getLocationsApi(locationParams)
    
    if (locationResult.items && locationResult.items.length > 0) {
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
      locations.value = []
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
    const locationResult = await getLocationsApi(locationParams)
    
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
      locations.value = []
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
const handleCellClick = (location: Location | null, _index: number) => {
  if (location) {
    // Existing Location: Edit functionality to be implemented
    message.info('Edit location feature coming soon')
  } else {
    // 空白单元格：创建 Location
    // selectedCellIndex.value = index
    // 自动填充 Building 和 Floor，但用户可以修改
    createLocationForm.value = {
      door_number: '',
      location_name: '',
      location_tag: undefined,
      area_tag: undefined,
      building: selectedBuilding.value?.building_name || '',
      floor: selectedFloor.value || '',
    }
    showCreateLocationModal.value = true
  }
}

// 创建 Location
const handleCreateLocation = async () => {
  try {
    if (!createLocationForm.value.door_number || !createLocationForm.value.location_name) {
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

    await createLocationApi({
      door_number: createLocationForm.value.door_number,
      location_name: createLocationForm.value.location_name,
      building: createLocationForm.value.building || selectedBuilding.value.building_name,
      floor: createLocationForm.value.floor || selectedFloor.value,
      location_tag: createLocationForm.value.location_tag,
      area_tag: createLocationForm.value.area_tag,
      location_type: 'institution',
    })

    message.success('Location created successfully')
    showCreateLocationModal.value = false
    resetCreateLocationForm()
    fetchLocations()
  } catch (error: any) {
    message.error('Failed to create location: ' + (error.message || 'Unknown error'))
  }
}

// 重置 Create Location 表单
const resetCreateLocationForm = () => {
  createLocationForm.value = {
    door_number: '',
    location_name: '',
    location_tag: undefined,
    area_tag: undefined,
    building: '',
    floor: '',
  }
  // selectedCellIndex.value = null
}

// 初始化
onMounted(() => {
  fetchBuildings()
})
</script>

<style scoped>
.address-management {
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

/* 右侧：Location 网格 */
.location-grid-container {
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

.location-grid-wrapper {
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

.location-grid {
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

.location-cell.has-location {
  background: #f0f9ff;
}

.location-content {
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
</style>

