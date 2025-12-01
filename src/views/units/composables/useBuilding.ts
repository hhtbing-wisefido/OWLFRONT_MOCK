import { ref } from 'vue'
import { message } from 'ant-design-vue'
import type { Building } from '@/api/units/model/unitModel'
import {
  createBuildingApi,
  getBuildingsApi,
  updateBuildingApi,
  deleteBuildingApi,
  getUnitsApi,
} from '@/api/units/unit'
import { useUserStore } from '@/store/modules/user'

export function useBuilding() {
  const userStore = useUserStore()
  
  // State
  const buildings = ref<Building[]>([])
  const selectedFloor = ref<string>('')
  const selectedLocationTag = ref<string>('')
  const expandedBuildings = ref<Set<string>>(new Set())
  const selectedBuilding = ref<Building | null>(null)
  const currentBuildingForGrid = ref<Building | null>(null)
  
  // Forms
  const createBuildingForm = ref({
    location_tag: undefined as string | undefined,
    building_name: '',
    floors: 1,
  })
  
  const editingBuildingId = ref<string | null>(null)
  const editingBuildingForm = ref({
    location_tag: undefined as string | undefined,
    building_name: '',
  })

  // Fetch buildings
  const fetchBuildings = async () => {
    try {
      buildings.value = await getBuildingsApi()
    } catch (error: any) {
      message.error('Failed to fetch buildings: ' + (error.message || 'Unknown error'))
    }
  }

  // Toggle building tag
  const handleToggleBuildingTag = (building: Building) => {
    if (currentBuildingForGrid.value?.building_id === building.building_id) {
      currentBuildingForGrid.value = null
      selectedLocationTag.value = ''
    } else {
      currentBuildingForGrid.value = building
      selectedLocationTag.value = building.location_tag || '-'
    }
  }

  // Toggle building card
  const handleToggleBuildingCard = (building: Building) => {
    if (selectedBuilding.value?.building_id === building.building_id) {
      selectedBuilding.value = null
      selectedFloor.value = ''
    } else {
      selectedBuilding.value = building
      selectedFloor.value = ''
    }
  }

  // Select floor
  const handleSelectFloor = async (building: Building, floor: string) => {
    selectedBuilding.value = building
    selectedFloor.value = floor
    currentBuildingForGrid.value = building
  }

  // Create building
  const handleCreateBuilding = async () => {
    try {
      if (!createBuildingForm.value.location_tag && !createBuildingForm.value.building_name) {
        message.error('Please provide either location_tag or Building name')
        return
      }
      
      if (!createBuildingForm.value.floors) {
        message.error('Please fill in floors')
        return
      }

      // Both location_tag and building_name default to '-' when empty
      const buildingName = createBuildingForm.value.building_name?.trim() || '-'
      const locationTag = createBuildingForm.value.location_tag?.trim() || '-'

      await createBuildingApi({
        building_name: buildingName,
        floors: createBuildingForm.value.floors,
        location_tag: locationTag,
      } as any)

      message.success('Building created successfully')
      resetCreateBuildingForm()
      await fetchBuildings()
    } catch (error: any) {
      message.error('Failed to create building: ' + (error.message || 'Unknown error'))
    }
  }

  // Reset create building form
  const resetCreateBuildingForm = () => {
    createBuildingForm.value = {
      location_tag: undefined,
      building_name: '',
      floors: 1,
    }
  }

  // Edit building
  const handleEditBuilding = (building: Building) => {
    editingBuildingId.value = building.building_id || null
    editingBuildingForm.value = {
      location_tag: building.location_tag || undefined,
      building_name: building.building_name || '',
    }
  }

  // Save building
  const handleSaveBuilding = async (building: Building) => {
    try {
      if (!building.building_id) {
        message.error('Building ID is missing')
        editingBuildingId.value = null
        return
      }

      // Both location_tag and building_name default to '-' when empty
      const buildingName = editingBuildingForm.value.building_name?.trim() || '-'
      const locationTag = editingBuildingForm.value.location_tag?.trim() || '-'

      await updateBuildingApi(building.building_id, {
        building_name: buildingName,
        location_tag: locationTag,
      } as any)

      message.success('Building updated successfully')
      editingBuildingId.value = null
      await fetchBuildings()
    } catch (error: any) {
      message.error('Failed to update building: ' + (error.message || 'Unknown error'))
    }
  }

  // Delete floor
  const handleDeleteFloor = async (building: Building, floorNum: number) => {
    try {
      const floorStr = `${floorNum}F`
      const unitParams = {
        building: building.building_name,
        floor: floorStr,
      }
      const unitResult = await getUnitsApi(unitParams)

      if (unitResult.items && unitResult.items.length > 0) {
        message.error('Still include Unit')
        return
      }

      if (!building.building_id) {
        message.error('Building ID is missing')
        return
      }

      if (selectedBuilding.value?.building_id === building.building_id && selectedFloor.value === floorStr) {
        selectedFloor.value = ''
      }

      const newFloors = building.floors - 1
      if (newFloors < 1) {
        message.error('Building must have at least one floor')
        return
      }

      await updateBuildingApi(building.building_id, { floors: newFloors })
      message.success('Floor deleted successfully')
      await fetchBuildings()
    } catch (error: any) {
      message.error('Failed to delete floor: ' + (error.message || 'Unknown error'))
    }
  }

  // Delete building
  const handleDeleteBuilding = async (building: Building) => {
    try {
      const userInfo = userStore.getUserInfo
      const tenantId = userInfo?.tenant_id

      if (!tenantId) {
        message.error('Unable to get tenant ID')
        return
      }

      const unitParams = {
        tenant_id: tenantId,
        building: building.building_name,
      }
      const unitResult = await getUnitsApi(unitParams)

      if (unitResult.items && unitResult.items.length > 0) {
        message.error('Still include Unit')
        return
      }

      if (!building.building_id) {
        message.error('Building ID is missing')
        return
      }

      await deleteBuildingApi(building.building_id)
      message.success('Building deleted successfully')

      if (selectedBuilding.value?.building_id === building.building_id) {
        selectedBuilding.value = null
        selectedFloor.value = ''
      }

      if (currentBuildingForGrid.value?.building_id === building.building_id) {
        currentBuildingForGrid.value = null
        selectedLocationTag.value = ''
      }

      await fetchBuildings()
    } catch (error: any) {
      message.error('Failed to delete building: ' + (error.message || 'Unknown error'))
    }
  }

  return {
    // State
    buildings,
    selectedFloor,
    selectedLocationTag,
    expandedBuildings,
    selectedBuilding,
    currentBuildingForGrid,
    createBuildingForm,
    editingBuildingId,
    editingBuildingForm,
    // Methods
    fetchBuildings,
    handleToggleBuildingTag,
    handleToggleBuildingCard,
    handleSelectFloor,
    handleCreateBuilding,
    resetCreateBuildingForm,
    handleEditBuilding,
    handleSaveBuilding,
    handleDeleteFloor,
    handleDeleteBuilding,
  }
}

