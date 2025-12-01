import { ref, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import type { RoomWithBeds } from '@/api/units/model/unitModel'
import { createRoomApi, updateRoomApi, deleteRoomApi } from '@/api/units/unit'

export function useRoom() {
  // State
  const showAddRoomForm = ref(false)
  const newRoomName = ref('')
  const expandedRooms = ref<Set<string>>(new Set())
  const editingRoomId = ref<string | null>(null)
  const editingRoomName = ref('')
  const roomNameInputRef = ref<any>()
  const roomInputRef = ref<any>()

  // Toggle room expansion
  const toggleRoom = (roomId: string) => {
    if (expandedRooms.value.has(roomId)) {
      expandedRooms.value.delete(roomId)
    } else {
      expandedRooms.value.add(roomId)
    }
  }

  // Toggle add room form
  const handleToggleAddRoom = (
    activeHeaderButton: { value: 'room' | 'bed' | 'device' | null },
    isDeviceMode: Ref<boolean>,
    devContainerTarget: Ref<{ type: 'unit' | 'room' | 'bed'; id: string } | null>,
    expandedRooms: Ref<Set<string>>
  ) => {
    if (activeHeaderButton.value === 'room') {
      // If already active, close it
      activeHeaderButton.value = null
      showAddRoomForm.value = false
    } else {
      // Close other modes first
      if (activeHeaderButton.value === 'bed' || activeHeaderButton.value === 'device') {
        expandedRooms.value.clear()
      }
      if (activeHeaderButton.value === 'device') {
        isDeviceMode.value = false
        devContainerTarget.value = null
      }
      // Activate room mode
      activeHeaderButton.value = 'room'
      showAddRoomForm.value = true
      newRoomName.value = ''
      nextTick(() => {
        if (roomNameInputRef.value && roomNameInputRef.value.$el) {
          roomNameInputRef.value.$el.querySelector('input')?.focus()
        } else if (roomNameInputRef.value && roomNameInputRef.value.focus) {
          roomNameInputRef.value.focus()
        }
      })
    }
  }

  // Cancel add room
  const handleCancelAddRoom = (activeHeaderButton: { value: 'room' | 'bed' | 'device' | null }) => {
    showAddRoomForm.value = false
    newRoomName.value = ''
    activeHeaderButton.value = null
  }

  // Add room
  const handleAddRoom = async (
    editingUnit: { unit_id: string } | null,
    fetchRoomsWithBeds: (unitId: string) => Promise<void>,
    activeHeaderButton: { value: 'room' | 'bed' | 'device' | null }
  ) => {
    try {
      if (!editingUnit) {
        message.error('No unit selected')
        return
      }

      if (!newRoomName.value.trim()) {
        message.error('Please input room name')
        return
      }

      await createRoomApi({
        unit_id: editingUnit.unit_id,
        room_name: newRoomName.value.trim(),
      })

      await fetchRoomsWithBeds(editingUnit.unit_id)
      message.success('Room added successfully')
      showAddRoomForm.value = false
      newRoomName.value = ''
      activeHeaderButton.value = null
    } catch (error: any) {
      message.error('Failed to add room: ' + (error.message || 'Unknown error'))
    }
  }

  // Edit room
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

  // Save room name
  const handleSaveRoomName = async (
    roomId: string,
    editingUnit: { unit_id: string } | null,
    fetchRoomsWithBeds: (unitId: string) => Promise<void>
  ) => {
    try {
      if (!editingRoomName.value.trim()) {
        message.warning('Room name cannot be empty')
        if (editingUnit) {
          await fetchRoomsWithBeds(editingUnit.unit_id)
        }
        editingRoomId.value = null
        return
      }

      await updateRoomApi(roomId, { room_name: editingRoomName.value.trim() })

      if (editingUnit) {
        await fetchRoomsWithBeds(editingUnit.unit_id)
      }

      message.success('Room name updated successfully')
      editingRoomId.value = null
    } catch (error: any) {
      message.error('Failed to update room name: ' + (error.message || 'Unknown error'))
      if (editingUnit) {
        await fetchRoomsWithBeds(editingUnit.unit_id)
      }
      editingRoomId.value = null
    }
  }

  // Delete room
  const handleDeleteRoom = async (
    roomId: string,
    editingUnit: { unit_id: string } | null,
    fetchRoomsWithBeds: (unitId: string) => Promise<void>
  ) => {
    try {
      await deleteRoomApi(roomId)
      if (editingUnit) {
        await fetchRoomsWithBeds(editingUnit.unit_id)
      }
      message.success('Room deleted successfully')
    } catch (error: any) {
      message.error('Failed to delete room: ' + (error.message || 'Unknown error'))
    }
  }

  return {
    // State
    showAddRoomForm,
    newRoomName,
    expandedRooms,
    editingRoomId,
    editingRoomName,
    roomNameInputRef,
    roomInputRef,
    // Methods
    toggleRoom,
    handleToggleAddRoom,
    handleCancelAddRoom,
    handleAddRoom,
    handleEditRoom,
    handleSaveRoomName,
    handleDeleteRoom,
  }
}

