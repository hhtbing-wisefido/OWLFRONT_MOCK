import { ref, nextTick } from 'vue'
import { message, Modal } from 'ant-design-vue'
import type { Unit, RoomWithBeds, CreateUnitParams, UpdateUnitParams } from '@/api/units/model/unitModel'
import {
  createUnitApi,
  getUnitsApi,
  updateUnitApi,
  deleteUnitApi,
  getRoomsApi,
} from '@/api/units/unit'
import { useUserStore } from '@/store/modules/user'
import { useTagsStore } from '@/store/modules/tags'

export function useUnit() {
  const userStore = useUserStore()
  const tagsStore = useTagsStore()

  // State
  const units = ref<Unit[]>([])
  const allUnits = ref<Unit[]>([])
  const showCreateUnitModal = ref(false)
  const showEditUnitModal = ref(false)
  const editingUnit = ref<Unit | null>(null)
  const roomsWithBeds = ref<RoomWithBeds[]>([])
  
  // Forms
  const createUnitForm = ref({
    unit_number: '',
    unit_name: '',
    unit_type: 'Facility' as 'Facility' | 'Home',
    branch_tag: undefined as string | undefined,
    area_tag: undefined as string | undefined,
    building: '',
    floor: undefined as string | undefined, // Can be undefined to allow selection from dropdown
    is_multi_person_room: true,
    is_public_space: false,
    timezone: 'America/Denver' as string | undefined, // Default to Mountain Time
  })

  const editUnitForm = ref({
    unit_number: '',
    unit_name: '',
    unit_type: 'Facility' as 'Facility' | 'Home',
    area_tag: undefined as string | undefined,
    is_multi_person_room: true,
    is_public_space: false,
    timezone: 'America/Denver' as string | undefined, // Default to Mountain Time
  })

  // Fetch all units
  const fetchAllUnits = async () => {
    try {
      const userInfo = userStore.getUserInfo
      const tenantId = userInfo?.tenant_id

      if (!tenantId) {
        return
      }

      const result = await getUnitsApi({
        tenant_id: tenantId,
      })

      allUnits.value = result.items
    } catch (error: any) {
      console.error('Failed to fetch all units:', error)
      allUnits.value = []
    }
  }

  // Fetch rooms with beds
  const fetchRoomsWithBeds = async (unitId: string) => {
    try {
      const result = await getRoomsApi({ unit_id: unitId })
      roomsWithBeds.value = result
    } catch (error: any) {
      message.error('Failed to fetch rooms and beds: ' + (error.message || 'Unknown error'))
      roomsWithBeds.value = []
    }
  }

  // Ensure unit_room exists (room_name === unit_name)
  // When bed/dev binds to unit, create unit_room if it doesn't exist
  // unit_room should always be created if it doesn't exist, regardless of other rooms
  const ensureUnitRoom = async (unit: Unit): Promise<RoomWithBeds | null> => {
    let unitRoom = roomsWithBeds.value.find((r) => r.room_name === unit.unit_name)
    if (!unitRoom) {
      // Always create unit_room if it doesn't exist, even if there are other rooms
      const { createRoomApi } = await import('@/api/units/unit')
      await createRoomApi({ unit_id: unit.unit_id, room_name: unit.unit_name })
      await fetchRoomsWithBeds(unit.unit_id)
      // Sort rooms to ensure unit_room appears first
      roomsWithBeds.value.sort((a, b) => {
        const aIsUnitRoom = a.room_name === unit.unit_name
        const bIsUnitRoom = b.room_name === unit.unit_name
        if (aIsUnitRoom && !bIsUnitRoom) return -1
        if (!aIsUnitRoom && bIsUnitRoom) return 1
        return 0
      })
      unitRoom = roomsWithBeds.value.find((r) => r.room_name === unit.unit_name)
    }
    return unitRoom || null
  }

  // Fetch location tags
  const fetchBranchTags = async () => {
    await tagsStore.fetchAllTags()
  }

  // Fetch area tags
  const fetchAreaTags = async () => {
    await tagsStore.fetchAllTags()
  }

  // Cell click handler
  const handleCellClick = async (unit: Unit | null, _index: number, fetchRoomsWithBedsFn: (id: string) => Promise<void>) => {
    try {
      await fetchAreaTags()
      await fetchBranchTags()

      if (unit) {
        editingUnit.value = unit
        editUnitForm.value = {
          area_tag: unit.area_tag,
          unit_name: unit.unit_name,
          unit_number: unit.unit_number,
          unit_type: (unit as any).unit_type || 'Facility',
          is_multi_person_room: unit.is_multi_person_room ?? true,
          is_public_space: unit.is_public_space ?? false,
          timezone: unit.timezone || 'America/Denver', // Default to Mountain Time if not set
        }
        await fetchRoomsWithBedsFn(unit.unit_id)
        showEditUnitModal.value = true
        await nextTick()
      } else {
        editingUnit.value = null
        roomsWithBeds.value = []
        editUnitForm.value = {
          area_tag: undefined,
          unit_name: '',
          unit_number: '',
          unit_type: 'Facility',
          is_public_space: false,
          is_multi_person_room: false,
          timezone: undefined,
        }
        showEditUnitModal.value = true
        await nextTick()
      }
    } catch (error: any) {
      message.error('Failed to handle cell click: ' + (error.message || 'Unknown error'))
    }
  }

  // Create unit
  const handleCreateUnit = async (
    selectedBuilding: { building_name?: string; branch_tag?: string; floors?: number } | null,
    selectedFloor: string
  ) => {
    try {
      if (!createUnitForm.value.unit_number || !createUnitForm.value.unit_name) {
        message.error('Please fill in all required fields')
        return
      }

      const userInfo = userStore.getUserInfo
      const tenantId = userInfo?.tenant_id

      if (!tenantId) {
        message.error('Unable to get tenant ID')
        return
      }

      // 自动使用 selectedBuilding 和 selectedFloor（不再从表单获取）
      if (!selectedBuilding || !selectedFloor) {
        message.error('Please select a building and floor first')
        return
      }
      
      // 验证 building 的 floors：如果为空或为 0，设置为 1
      const buildingFloors = selectedBuilding.floors || 0
      if (buildingFloors <= 0) {
        // 如果 floors 为空或为 0，设置为 1
        if (selectedBuilding && 'floors' in selectedBuilding) {
          (selectedBuilding as any).floors = 1
        }
      }
      
      // 直接从 selectedBuilding 和 selectedFloor 获取值
      const buildingValue: string = selectedBuilding.building_name || '-'
      const floorValue: string = selectedFloor
      const branchTagValue = selectedBuilding.branch_tag || '-'
      // area_tag from form
      const areaTagValue = createUnitForm.value.area_tag || undefined
      
      const createParams: CreateUnitParams = {
        unit_number: createUnitForm.value.unit_number,
        unit_name: createUnitForm.value.unit_name,
        unit_type: createUnitForm.value.unit_type,
        building: buildingValue,
        floor: floorValue,
        branch_tag: branchTagValue,
        area_tag: areaTagValue,
        is_public_space: createUnitForm.value.is_public_space,
        is_multi_person_room: createUnitForm.value.is_multi_person_room,
        timezone: createUnitForm.value.timezone || 'America/Denver', // Default to Mountain Time if not set
        // Optional fields (not in form, can be added later if needed):
        // layout_config: undefined,
        // primary_resident_id: undefined,
        // alarm_user_ids: undefined,
        // alarm_tags: undefined,
      }
      
      console.log('[Create Unit API] Creating with params:', createParams)
      console.log('[Create Unit API] Source values:', {
        form_building: createUnitForm.value.building,
        form_floor: createUnitForm.value.floor,
        form_branch_tag: createUnitForm.value.branch_tag,
        form_area_tag: createUnitForm.value.area_tag,
        selectedBuilding_name: selectedBuilding?.building_name,
        selectedBuilding_branch_tag: selectedBuilding?.branch_tag,
        selectedFloor: selectedFloor,
        final_building: buildingValue,
        final_floor: floorValue,
        final_branch_tag: branchTagValue,
        final_area_tag: areaTagValue,
      })
      
      const result = await createUnitApi(createParams)
      
      console.log('[Create Unit API] Created unit result:', {
        unit_id: result?.unit_id,
        unit_number: result?.unit_number,
        unit_name: result?.unit_name,
        building: result?.building,
        floor: result?.floor,
        branch_tag: result?.branch_tag,
        area_tag: result?.area_tag,
      })

      if (!result) {
        message.error('Failed to create unit: No result returned')
        return
      }

      message.success('Unit created successfully')
      showCreateUnitModal.value = false
      resetCreateUnitForm()
      return result
    } catch (error: any) {
      console.error('Create unit error:', error)
      message.error('Failed to create unit: ' + (error.message || error?.response?.data?.message || 'Unknown error'))
      throw error
    }
  }

  // Reset create unit form
  const resetCreateUnitForm = () => {
    createUnitForm.value = {
      unit_number: '',
      unit_name: '',
      unit_type: 'Facility',
      branch_tag: undefined,
      area_tag: undefined,
      building: '',
      floor: undefined, // Reset to undefined so it can be selected from dropdown
      is_public_space: false,
      is_multi_person_room: true,
      timezone: 'America/Denver', // Default to Mountain Time
    }
  }

  // Reset edit unit form
  const resetEditUnitForm = () => {
    editingUnit.value = null
    roomsWithBeds.value = []
    editUnitForm.value = {
      unit_number: '',
      unit_name: '',
      unit_type: 'Facility',
      area_tag: undefined,
      is_public_space: false,
      is_multi_person_room: true,
      timezone: 'America/Denver', // Default to Mountain Time
    }
    showEditUnitModal.value = false
  }

  // Save unit
  const handleSaveUnit = async (
    currentBuildingForGrid: { branch_tag?: string } | null,
    selectedBranchTag: string
  ) => {
    try {
      if (!editUnitForm.value.unit_name || !editUnitForm.value.unit_number) {
        message.error('Unit name and Unit number are required')
        return
      }

      // branch_tag defaults to '-' when empty
      const branchTagValue = currentBuildingForGrid?.branch_tag || selectedBranchTag || '-'

      if (!editingUnit.value) {
        // Create new unit
        const buildingValue: string = '-'
        const floorValue: string = '1F'

        const newUnit = await createUnitApi({
          unit_number: editUnitForm.value.unit_number,
          unit_name: editUnitForm.value.unit_name,
          unit_type: editUnitForm.value.unit_type || 'Facility',
          building: buildingValue,
          floor: floorValue,
          branch_tag: branchTagValue,
          area_tag: editUnitForm.value.area_tag,
          is_public_space: editUnitForm.value.is_public_space,
          is_multi_person_room: editUnitForm.value.is_multi_person_room,
          timezone: editUnitForm.value.timezone || 'America/Denver', // Default to Mountain Time if not set
        })

        message.success('Unit created successfully')
        resetEditUnitForm()
        return newUnit
      } else {
        // Update existing unit
        // Note: building, floor, branch_tag, unit_number, unit_type are typically not changed after creation
        // But we include them in case they need to be updated
        const updateParams: UpdateUnitParams = {
          unit_name: editUnitForm.value.unit_name,
          unit_number: editUnitForm.value.unit_number,
          // unit_type is not in UpdateUnitParams, so we don't include it
          area_tag: editUnitForm.value.area_tag,
          is_public_space: editUnitForm.value.is_public_space,
          is_multi_person_room: editUnitForm.value.is_multi_person_room,
          timezone: editUnitForm.value.timezone || 'America/Denver', // Default to Mountain Time if not set
          // Preserve existing values for fields not in edit form
          // building, floor, branch_tag should remain unchanged unless explicitly needed
          // Optional fields (not in form, can be added later if needed):
          // layout_config: editingUnit.value.layout_config,
          // primary_resident_id: editingUnit.value.primary_resident_id,
          // alarm_user_ids: editingUnit.value.alarm_user_ids,
          // alarm_tags: editingUnit.value.alarm_tags,
        }
        
        await updateUnitApi(editingUnit.value.unit_id, updateParams)

        message.success('Unit updated successfully')
        resetEditUnitForm()
      }
    } catch (error: any) {
      message.error('Failed to save unit: ' + (error.message || 'Unknown error'))
    }
  }

  // Delete unit
  const handleDeleteUnit = async () => {
    if (!editingUnit.value?.unit_id) {
      message.error('No unit selected')
      return
    }

    try {
      await new Promise<void>((resolve, reject) => {
        Modal.confirm({
          title: 'Confirm Delete',
          content: `Are you sure you want to delete unit "${editingUnit.value?.unit_name}"?`,
          onOk: async () => {
            try {
              await deleteUnitApi(editingUnit.value!.unit_id)
              message.success('Unit deleted successfully')
              resetEditUnitForm()
              resolve()
            } catch (error: any) {
              console.error('Delete unit error:', error)
              if (error.message !== 'User cancelled') {
                message.error('Failed to delete unit: ' + (error.message || error?.response?.data?.message || 'Unknown error'))
              }
              reject(error)
            }
          },
          onCancel: () => {
            reject(new Error('User cancelled'))
          },
        })
      })
    } catch (error: any) {
      if (error.message !== 'User cancelled') {
        throw error
      }
    }
  }

  return {
    // State
    units,
    allUnits,
    showCreateUnitModal,
    showEditUnitModal,
    editingUnit,
    roomsWithBeds,
    createUnitForm,
    editUnitForm,
    // Methods
    fetchAllUnits,
    fetchRoomsWithBeds,
    ensureUnitRoom,
    fetchBranchTags,
    fetchAreaTags,
    handleCellClick,
    handleCreateUnit,
    resetCreateUnitForm,
    resetEditUnitForm,
    handleSaveUnit,
    handleDeleteUnit,
  }
}

