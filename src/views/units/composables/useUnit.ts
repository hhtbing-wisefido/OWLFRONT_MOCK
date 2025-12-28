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
// Note: tags_catalog table has been removed

export function useUnit() {
  const userStore = useUserStore()
  // Note: tags_catalog table has been removed, tagsStore is no longer available

  // State
  const units = ref<Unit[]>([])
  const allUnits = ref<Unit[]>([])
  const showCreateUnitModal = ref(false)
  const showEditUnitModal = ref(false)
  const editingUnit = ref<Unit | null>(null)
  const roomsWithBeds = ref<RoomWithBeds[]>([])
  
  // Forms
  const createUnitForm = ref({
    unit_name: '',
    unit_type: 'Facility' as 'Facility' | 'Home',
    branch_name: undefined as string | undefined,
    building: undefined as string | undefined,  // 不再使用，实际创建时使用 selectedBuilding.building_name
    floor: undefined as string | undefined, // Can be undefined to allow selection from dropdown
    is_multi_person_room: true,
    is_public_space: false,
    timezone: 'America/Denver' as string | undefined, // Default to Mountain Time (with DST)
  })

  const editUnitForm = ref({
    unit_number: '',
    unit_name: '',
    unit_type: 'Facility' as 'Facility' | 'Home',
    floor: '1' as string, // Floor number as string, default '1'
    is_multi_person_room: true,
    is_public_space: false,
    timezone: 'America/Denver' as string | undefined, // Default to Mountain Time (with DST)
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
  // Note: tags_catalog table has been removed, branches should be fetched from branches API
  const fetchBranchTags = async () => {
    // TODO: Re-implement using branches API
  }


  // Cell click handler
  const handleCellClick = async (unit: Unit | null, _index: number, fetchRoomsWithBedsFn: (id: string) => Promise<void>) => {
    try {
      await fetchBranchTags()

      if (unit) {
        editingUnit.value = unit
        // Extract floor number from unit.floor (e.g., "1F" -> 1)
        let floorNum = 1
        if (unit.floor) {
          const floorMatch = unit.floor.match(/\d+/)
          if (floorMatch) {
            floorNum = parseInt(floorMatch[0]) || 1
          }
        }
        editUnitForm.value = {
          unit_name: unit.unit_name,
          unit_number: unit.unit_number,
          unit_type: (unit as any).unit_type || 'Facility',
          floor: floorNum,
          is_multi_person_room: unit.is_multi_person_room ?? true,
          is_public_space: unit.is_public_space ?? false,
          timezone: unit.timezone || 'America/Denver', // Default to Mountain Time (with DST) if not set
        }
        await fetchRoomsWithBedsFn(unit.unit_id)
        showEditUnitModal.value = true
        await nextTick()
      } else {
        editingUnit.value = null
        roomsWithBeds.value = []
        editUnitForm.value = {
          unit_name: '',
          unit_number: '',
          unit_type: 'Facility',
          floor: 1, // Default to 1
          is_public_space: false,
          is_multi_person_room: false,
          timezone: 'America/Denver', // Default to Mountain Time (with DST, UTC-7/-6)
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
    selectedBuilding: { building_name?: string; branch_name?: string; floors?: number } | null,
    selectedFloor: string
  ) => {
    try {
      if (!createUnitForm.value.unit_name) {
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
      
      // 直接传递用户输入，不做默认值处理和格式转换（后端统一处理）
      const createParams: CreateUnitParams = {
        unit_name: createUnitForm.value.unit_name,
        unit_type: createUnitForm.value.unit_type,  // 可能是 'Facility'（默认值），后端会处理
        building: selectedBuilding.building_name,  // 可能为 undefined，后端会处理
        floor: selectedFloor,  // 可能是 "1F" 或 number，后端会处理格式转换
        branch_name: selectedBuilding.branch_name,  // 可能为 undefined，后端会处理
        is_public_space: createUnitForm.value.is_public_space,
        is_multi_person_room: createUnitForm.value.is_multi_person_room,
        timezone: createUnitForm.value.timezone,  // 可能是 'America/Denver'（默认值），后端会处理
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
        form_branch_name: createUnitForm.value.branch_name,
        selectedBuilding_name: selectedBuilding?.building_name,
        selectedBuilding_branch_name: selectedBuilding?.branch_name,
        selectedFloor: selectedFloor,
      })
      
      const result = await createUnitApi(createParams)
      
      console.log('[Create Unit API] Created unit result:', {
        unit_id: result?.unit_id,
        unit_number: result?.unit_number,
        unit_name: result?.unit_name,
        building: result?.building,
        floor: result?.floor,
        branch_name: result?.branch_name,
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
      unit_name: '',
      unit_type: 'Facility',
      branch_name: undefined,
      building: undefined as string | undefined,  // 不再使用，实际创建时使用 selectedBuilding.building_name
      floor: undefined, // Reset to undefined so it can be selected from dropdown
      is_public_space: false,
      is_multi_person_room: true,
      timezone: 'America/Denver', // Default to Mountain Time (no DST)
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
      floor: 1, // Default to 1
      is_public_space: false,
      is_multi_person_room: true,
      timezone: 'America/Denver', // Default to Mountain Time (no DST)
    }
    showEditUnitModal.value = false
  }

  // Save unit
  const handleSaveUnit = async (
    selectedBuilding: { building_name?: string; branch_name?: string } | null,
    selectedFloor: string
  ) => {
    try {
      if (!editUnitForm.value.unit_name || !editUnitForm.value.unit_number) {
        message.error('Unit name and Unit number are required')
        return
      }

      if (!editingUnit.value) {
        // Create new unit - 直接传递用户输入，不做默认值处理和格式转换（后端统一处理）
        // 确保 building 或 branch_name 至少有一个不为空
        const buildingValue = selectedBuilding?.building_name
        const branchTagValue = selectedBuilding?.branch_name
        
        if (!buildingValue && !branchTagValue) {
          message.error('Building or Branch Tag must be provided')
          return
        }
        
        // 直接使用 editUnitForm.floor（Vue 已负责从 Div 填入 input，用户可能已修改）
        const floorValue = editUnitForm.value.floor 
          ? (typeof editUnitForm.value.floor === 'number' ? String(editUnitForm.value.floor) : editUnitForm.value.floor)
          : undefined
        
        const newUnit = await createUnitApi({
          unit_number: editUnitForm.value.unit_number,
          unit_name: editUnitForm.value.unit_name,
          unit_type: editUnitForm.value.unit_type,  // 可能是 'Facility'（默认值），后端会处理
          building: buildingValue,  // 可能为 undefined，后端会处理
          floor: floorValue,  // 直接使用表单中的 floor（Vue 已负责从 Div 填入 input）
          branch_name: branchTagValue,  // 可能为 undefined，后端会处理
          is_public_space: editUnitForm.value.is_public_space,
          is_multi_person_room: editUnitForm.value.is_multi_person_room,
          timezone: editUnitForm.value.timezone,  // 可能是 'America/Denver'（默认值），后端会处理
        })

        message.success('Unit created successfully')
        resetEditUnitForm()
        return newUnit
      } else {
        // Update existing unit - 直接传递用户输入，不做默认值处理和格式转换（后端统一处理）
        const updateParams: UpdateUnitParams = {
          unit_name: editUnitForm.value.unit_name,
          unit_number: editUnitForm.value.unit_number,
          // unit_type is not in UpdateUnitParams, so we don't include it
          // building 和 branch_name 不传递（保持原值）
          floor: editUnitForm.value.floor,  // 可能是 number 或 string，后端会处理格式转换
          is_public_space: editUnitForm.value.is_public_space,
          is_multi_person_room: editUnitForm.value.is_multi_person_room,
          timezone: editUnitForm.value.timezone,  // 可能是 'America/Denver'（默认值），后端会处理
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
    handleCellClick,
    handleCreateUnit,
    resetCreateUnitForm,
    resetEditUnitForm,
    handleSaveUnit,
    handleDeleteUnit,
  }
}

