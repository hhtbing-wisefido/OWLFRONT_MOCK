import { ref, nextTick, type Ref } from 'vue'
import { message } from 'ant-design-vue'
import type { RoomWithBeds, Bed, Unit } from '@/api/units/model/unitModel'
import { createBedApi, updateBedApi, deleteBedApi } from '@/api/units/unit'

export function useBed() {
  // State
  const editingBedId = ref<string | null>(null)
  const editingBedName = ref('')
  const bedInputRef = ref<any>()

  // Get available bed letters (A-Z)
  const getAvailableBedLetters = (room: RoomWithBeds): string[] => {
    const allLetters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)) // A-Z
    const usedLetters = room.beds
      ?.map((bed) => {
        const match = bed.bed_name.match(/Bed\s*([A-Z])/i) || bed.bed_name.match(/^([A-Z])$/i)
        return match && match[1] ? match[1].toUpperCase() : null
      })
      .filter((letter): letter is string => letter !== null) || []
    
    return allLetters.filter((letter) => !usedLetters.includes(letter))
  }

  // Validate and format bed name (BedA-BedZ)
  const validateAndFormatBedName = (bedName: string): string | null => {
    if (!bedName || !bedName.trim()) {
      return null
    }
    
    const trimmed = bedName.trim()
    const match = trimmed.match(/^Bed\s*([A-Z])$/i) || trimmed.match(/^([A-Z])$/i)
    
    if (match && match[1]) {
      const letter = match[1].toUpperCase()
      return `Bed${letter}`
    }
    
    return null
  }

  // Create bed for room
  const createBedForRoom = async (
    room: RoomWithBeds,
    unitId: string,
    expandedRooms: Ref<Set<string>>,
    fetchRoomsWithBeds: (unitId: string) => Promise<void>,
    warningMessage?: string
  ): Promise<boolean> => {
    try {
      const availableLetters = getAvailableBedLetters(room)
      
      if (availableLetters.length === 0) {
        message.warning(warningMessage || 'All beds (A-Z) have been added')
        return false
      }

      const bedLetter = availableLetters[0]
      const bedName = `Bed${bedLetter}`

      await createBedApi({
        room_id: room.room_id,
        bed_name: bedName,
      })

      expandedRooms.value.add(room.room_id)
      await fetchRoomsWithBeds(unitId)
      message.success(`Bed ${bedLetter} added successfully`)
      return true
    } catch (error: any) {
      message.error('Failed to add bed: ' + (error.message || 'Unknown error'))
      return false
    }
  }

  // Add bed directly
  const handleAddBedDirectly = async (
    room: RoomWithBeds,
    editingUnit: Unit | null,
    expandedRooms: Ref<Set<string>>,
    fetchRoomsWithBeds: (unitId: string) => Promise<void>
  ) => {
    if (!editingUnit) {
      message.error('No unit selected')
      return
    }
    
    await createBedForRoom(room, editingUnit.unit_id, expandedRooms, fetchRoomsWithBeds)
  }

  // Add bed to first room
  const handleAddBedToFirstRoom = async (
    editingUnit: Unit | null,
    ensureUnitRoom: (unit: Unit) => Promise<RoomWithBeds | null>,
    expandedRooms: Ref<Set<string>>,
    fetchRoomsWithBeds: (unitId: string) => Promise<void>
  ) => {
    try {
      if (!editingUnit) {
        message.error('No unit selected')
        return
      }
      const room = await ensureUnitRoom(editingUnit)
      if (!room) {
        message.error('No room available')
        return
      }
      expandedRooms.value.add(room.room_id)
      await createBedForRoom(room, editingUnit.unit_id, expandedRooms, fetchRoomsWithBeds, 'All beds (A-Z) have been added for this room')
    } catch (error: any) {
      message.error('Failed to add bed: ' + (error.message || 'Unknown error'))
    }
  }

  // Toggle add bed
  const handleToggleAddBed = async (
    editingUnit: Unit | null,
    ensureUnitRoom: (unit: Unit) => Promise<RoomWithBeds | null>,
    roomsWithBeds: RoomWithBeds[],
    expandedRooms: Ref<Set<string>>,
    activeHeaderButton: Ref<'room' | 'bed' | 'device' | null>,
    showAddRoomForm: Ref<boolean>,
    isDeviceMode: Ref<boolean>,
    devContainerTarget: Ref<{ type: 'unit' | 'room' | 'bed'; id: string } | null>
  ) => {
    if (activeHeaderButton.value === 'bed') {
      // If already active, collapse all rooms and deactivate
      activeHeaderButton.value = null
      expandedRooms.value.clear()
    } else {
      // Close other modes first
      if (activeHeaderButton.value === 'room') {
        showAddRoomForm.value = false
      }
      if (activeHeaderButton.value === 'device') {
        isDeviceMode.value = false
        devContainerTarget.value = null
      }
      // Activate bed mode
      activeHeaderButton.value = 'bed'
      
      if (!editingUnit) {
        message.error('No unit selected')
        return
      }
      const room = await ensureUnitRoom(editingUnit)
      if (!room) {
        message.error('Failed to create unit_room for unit')
        return
      }
      // Expand all rooms
      roomsWithBeds.forEach((r) => {
        if (r.room_id) {
          expandedRooms.value.add(r.room_id)
        }
      })
    }
  }

  // Edit bed
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

  // Save bed name
  const handleSaveBedName = async (
    bedId: string,
    editingUnit: { unit_id: string } | null,
    fetchRoomsWithBeds: (unitId: string) => Promise<void>
  ) => {
    try {
      const formattedName = validateAndFormatBedName(editingBedName.value)
      
      if (!formattedName) {
        message.warning('Bed name must be in format BedA-BedZ (e.g., BedA, bedB, BedZ)')
        if (editingUnit) {
          await fetchRoomsWithBeds(editingUnit.unit_id)
        }
        editingBedId.value = null
        return
      }

      await updateBedApi(bedId, { bed_name: formattedName })

      if (editingUnit) {
        await fetchRoomsWithBeds(editingUnit.unit_id)
      }

      message.success('Bed name updated successfully')
      editingBedId.value = null
    } catch (error: any) {
      message.error('Failed to update bed name: ' + (error.message || 'Unknown error'))
      if (editingUnit) {
        await fetchRoomsWithBeds(editingUnit.unit_id)
      }
      editingBedId.value = null
    }
  }

  // Delete bed
  const handleDeleteBed = async (
    bedId: string,
    editingUnit: { unit_id: string } | null,
    fetchRoomsWithBeds: (unitId: string) => Promise<void>
  ) => {
    try {
      await deleteBedApi(bedId)
      if (editingUnit) {
        await fetchRoomsWithBeds(editingUnit.unit_id)
      }
      message.success('Bed deleted successfully')
    } catch (error: any) {
      message.error('Failed to delete bed: ' + (error.message || 'Unknown error'))
    }
  }

  return {
    // State
    editingBedId,
    editingBedName,
    bedInputRef,
    // Methods
    getAvailableBedLetters,
    validateAndFormatBedName,
    createBedForRoom,
    handleAddBedDirectly,
    handleAddBedToFirstRoom,
    handleToggleAddBed,
    handleEditBed,
    handleSaveBedName,
    handleDeleteBed,
  }
}

