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
  const selectedBranchTag = ref<string>('')
  const expandedBuildings = ref<Set<string>>(new Set())
  const selectedBuilding = ref<Building | null>(null)
  const currentBuildingForGrid = ref<Building | null>(null)
  
  // Forms
  const createBuildingForm = ref({
    branch_name: undefined as string | undefined,
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
      selectedBranchTag.value = ''
    } else {
      currentBuildingForGrid.value = building
      selectedBranchTag.value = building.branch_name || '-'
    }
  }

  // Toggle building card
  const handleToggleBuildingCard = (building: Building) => {
    if (selectedBuilding.value?.building_id === building.building_id) {
      selectedBuilding.value = null
      selectedFloor.value = ''
      currentBuildingForGrid.value = null
    } else {
      selectedBuilding.value = building
      selectedFloor.value = ''
      currentBuildingForGrid.value = building // Set currentBuildingForGrid for fetchUnits
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
      if (!createBuildingForm.value.branch_name && !createBuildingForm.value.building_name) {
        message.error('Please provide either branch_name or Building name')
        return
      }

      // Both branch_name and building_name default to '-' when empty
      const buildingName = createBuildingForm.value.building_name?.trim() || '-'
      const branchTag = createBuildingForm.value.branch_name?.trim() || '-'

      await createBuildingApi({
        building_name: buildingName,
        branch_name: branchTag,
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
      branch_name: undefined,
      building_name: '',
    }
  }


  // Delete floor
  // Note: Since floors field is removed from buildings table, 
  // deleting a floor means checking if there are units on that floor
  // If no units exist, the floor is effectively "deleted" (no action needed)
  const handleDeleteFloor = async (building: Building, floorNum: number) => {
    try {
      const floorStr = `${floorNum}F`
      const userInfo = userStore.getUserInfo
      const tenantId = userInfo?.tenant_id

      if (!tenantId) {
        message.error('Unable to get tenant ID')
        return
      }

      const unitParams = {
        tenant_id: tenantId,
        building: building.building_name,
        floor: floorStr,
        branch_name: building.branch_name ?? '',
      }
      const unitResult = await getUnitsApi(unitParams)

      if (unitResult.items && unitResult.items.length > 0) {
        message.error('Still include Unit')
        return
      }

      if (selectedBuilding.value?.building_id === building.building_id && selectedFloor.value === floorStr) {
        selectedFloor.value = ''
      }

      // Since floors is no longer stored in buildings table,
      // we just need to refresh the building list to reflect the change
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
        selectedBranchTag.value = ''
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
    selectedBranchTag,
    expandedBuildings,
    selectedBuilding,
    currentBuildingForGrid,
    createBuildingForm,
    // Methods
    fetchBuildings,
    handleToggleBuildingCard,
    handleSelectFloor,
    handleCreateBuilding,
    resetCreateBuildingForm,
    handleDeleteFloor,
    handleDeleteBuilding,
  }
}

