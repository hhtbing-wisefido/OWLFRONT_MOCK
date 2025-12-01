import { ref, computed, type Ref } from 'vue'
import { message } from 'ant-design-vue'
import type { ColumnsType } from 'ant-design-vue/es/table'
import type { Device } from '@/api/devices/model/deviceModel'
import type { Unit, RoomWithBeds } from '@/api/units/model/unitModel'
import { getDevicesApi, updateDeviceApi } from '@/api/devices/device'
import { useUserStore } from '@/store/modules/user'
import { useDeviceEdit } from '@/views/devices/composables/useDeviceEdit'

export function useDevice() {
  const userStore = useUserStore()

  // State
  const isDeviceMode = ref(false)
  const availableDevices = ref<Device[]>([])
  const allDevices = ref<Device[]>([])
  const showDeviceSelectModal = ref(false)
  const selectedTarget = ref<{ type: 'unit' | 'room' | 'bed', id: string } | null>(null)
  const devicesForSelection = ref<Device[]>([])
  const devContainerTarget = ref<{ type: 'unit' | 'room' | 'bed', id: string } | null>(null)
  const expandedDevices = ref<Set<string>>(new Set())
  // Store original device bindings when opening selection modal (for cancel functionality)
  const originalDeviceBindings = ref<Map<string, { bound_room_id: string | null, bound_bed_id: string | null, unit_id: string | null }>>(new Map())
  const draggedDeviceId = ref<string | null>(null)
  const dragOverTarget = ref<{ type: 'unit' | 'room' | 'bed'; id: string } | null>(null)

  // Device columns
  const deviceColumns: ColumnsType<Device> = [
    {
      title: '',
      key: 'checkbox',
      width: 50,
      align: 'center',
      fixed: 'left',
    },
    {
      title: 'Device_Name',
      dataIndex: 'device_name',
      key: 'device_name',
      width: 150,
      sorter: (a, b) => (a.device_name || '').localeCompare(b.device_name || ''),
    },
    {
      title: 'Device_type',
      dataIndex: 'device_type',
      key: 'device_type',
      width: 100,
      sorter: (a, b) => (a.device_type || '').localeCompare(b.device_type || ''),
    },
    {
      title: 'Device_mode',
      dataIndex: 'device_model',
      key: 'device_model',
      width: 100,
      sorter: (a, b) => (a.device_model || '').localeCompare(b.device_model || ''),
    },
    {
      title: 'Device_code',
      dataIndex: 'device_code',
      key: 'device_code',
      width: 140,
      sorter: (a, b) => (a.device_code || '').localeCompare(b.device_code || ''),
      ellipsis: true,
    },
    {
      title: 'status',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
    },
    {
      title: 'Monitor',
      dataIndex: 'monitoring_enabled',
      key: 'monitoring_enabled',
      width: 70,
      align: 'center',
      sorter: (a, b) => {
        const aVal = a.monitoring_enabled ? 1 : 0
        const bVal = b.monitoring_enabled ? 1 : 0
        return aVal - bVal
      },
    },
  ]

  // Device selection modal columns
  const deviceSelectColumns: ColumnsType<Device> = [
    {
      title: '',
      key: 'checkbox',
      width: 50,
      align: 'center',
      fixed: 'left',
    },
    {
      title: 'Device_Name',
      dataIndex: 'device_name',
      key: 'device_name',
      width: 150,
      sorter: (a, b) => (a.device_name || '').localeCompare(b.device_name || ''),
    },
    {
      title: 'Device_type',
      dataIndex: 'device_type',
      key: 'device_type',
      width: 100,
      sorter: (a, b) => (a.device_type || '').localeCompare(b.device_type || ''),
    },
    {
      title: 'Device_mode',
      dataIndex: 'device_model',
      key: 'device_model',
      width: 100,
      sorter: (a, b) => (a.device_model || '').localeCompare(b.device_model || ''),
    },
    {
      title: 'Device_code',
      dataIndex: 'device_code',
      key: 'device_code',
      width: 140,
      sorter: (a, b) => (a.device_code || '').localeCompare(b.device_code || ''),
      ellipsis: true,
    },
    {
      title: 'status',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
    },
    {
      title: 'Monitor',
      dataIndex: 'monitoring_enabled',
      key: 'monitoring_enabled',
      width: 70,
      align: 'center',
      sorter: (a, b) => {
        const aVal = a.monitoring_enabled ? 1 : 0
        const bVal = b.monitoring_enabled ? 1 : 0
        return aVal - bVal
      },
    },
  ]

  // Fetch all devices
  const fetchAllDevices = async () => {
    try {
      const userInfo = userStore.getUserInfo
      const tenantId = userInfo?.tenant_id

      if (!tenantId) {
        message.error('No tenant ID available')
        return
      }

      const result = await getDevicesApi({
        tenant_id: tenantId,
        business_access: 'approved',
        include_bound: true,
      } as any)

      allDevices.value = result.items
      availableDevices.value = result.items.filter((device: any) => {
        return !device.bound_room_id && !device.bound_bed_id
      })
    } catch (error: any) {
      message.error('Failed to fetch devices: ' + (error.message || 'Unknown error'))
      allDevices.value = []
      availableDevices.value = []
    }
  }

  // Use shared device edit composable (after fetchAllDevices is defined)
  const {
    editingDeviceId,
    editingField,
    editingValue,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
  } = useDeviceEdit(fetchAllDevices)

  // Unbind device
  const unbindDevice = async (deviceId: string) => {
    await updateDeviceApi(deviceId, {
      bound_room_id: null,
      bound_bed_id: null,
      unit_id: null,
    })
  }

  // Check if device is bound
  const isDeviceBound = (device: Device): boolean => {
    const deviceAny = device as any
    return !!(deviceAny.bound_room_id || deviceAny.bound_bed_id)
  }

  // Get room devices
  const getRoomDevices = (roomId: string): Device[] => {
    return allDevices.value.filter((device: any) => device.bound_room_id === roomId)
  }

  // Get bed devices
  const getBedDevices = (bedId: string): Device[] => {
    return allDevices.value.filter((device: any) => device.bound_bed_id === bedId)
  }

  // Get unit devices
  const getUnitDevices = (unitId: string, roomsWithBeds: RoomWithBeds[]): Device[] => {
    const unitRooms = roomsWithBeds.filter((r) => r.unit_id === unitId)
    const roomIds = unitRooms.map((r) => r.room_id).filter((id): id is string => !!id)
    return allDevices.value.filter((device: any) => roomIds.includes(device.bound_room_id))
  }

  // Device container devices (computed)
  // When type is 'unit', show all available (unbound) devices for selection
  // When type is 'room', show bound devices + all available (unbound) devices
  // When type is 'bed', show bound devices + all available (unbound) devices
  const devContainerDevices = computed(() => {
    // When isDeviceMode is true but no devContainerTarget is set (e.g., clicking header 'Add Device'),
    // show all available devices without highlighting any container
    if (!devContainerTarget.value) {
      if (isDeviceMode.value) {
        return availableDevices.value
      }
      return []
    }
    
    if (devContainerTarget.value.type === 'unit') {
      // Show all available (unbound) devices for unit selection
      return availableDevices.value
    } else if (devContainerTarget.value.type === 'room') {
      // Show bound devices + all available (unbound) devices for room selection
      const boundDevices = getRoomDevices(devContainerTarget.value.id)
      // Combine bound devices and available devices, avoiding duplicates
      const boundDeviceIds = new Set(boundDevices.map(d => d.device_id))
      const unboundDevices = availableDevices.value.filter(d => !boundDeviceIds.has(d.device_id))
      return [...boundDevices, ...unboundDevices]
    } else {
      // Show bound devices + all available (unbound) devices for bed selection
      const boundDevices = getBedDevices(devContainerTarget.value.id)
      // Combine bound devices and available devices, avoiding duplicates
      const boundDeviceIds = new Set(boundDevices.map(d => d.device_id))
      const unboundDevices = availableDevices.value.filter(d => !boundDeviceIds.has(d.device_id))
      return [...boundDevices, ...unboundDevices]
    }
  })

  // Toggle devices expand
  const toggleDevicesExpand = (id: string) => {
    if (expandedDevices.value.has(id)) {
      expandedDevices.value.delete(id)
    } else {
      expandedDevices.value.add(id)
    }
  }

  // Open device selection
  const openDeviceSelection = async (
    type: 'unit' | 'room' | 'bed',
    id: string,
    roomsWithBeds: RoomWithBeds[],
    allUnits: Unit[],
    ensureUnitRoom: (unit: Unit) => Promise<RoomWithBeds | null>
  ) => {
    selectedTarget.value = { type, id }
    await fetchAllDevices()
    
    // Save original device bindings before any changes
    originalDeviceBindings.value.clear()
    allDevices.value.forEach((device) => {
      const deviceAny = device as any
      originalDeviceBindings.value.set(device.device_id, {
        bound_room_id: deviceAny.bound_room_id || null,
        bound_bed_id: deviceAny.bound_bed_id || null,
        unit_id: deviceAny.unit_id || null,
      })
    })
    
    const allDevicesList = [...allDevices.value]
    
    if (type === 'unit') {
      // Find unit in allUnits, or use the editingUnit if available
      let unit = allUnits.find((u) => u.unit_id === id)
      if (!unit) {
        // If not found in allUnits, try to get it from the editingUnit parameter
        // This can happen if the unit was just created and not yet in allUnits
        message.warning('Unit not found in list, attempting to ensure unit_room...')
      }
      // Ensure unit_room exists (create if needed) and get it
      // We need to pass the unit object, so if we don't have it, we'll need to construct a minimal one
      if (!unit) {
        // Try to find unit in roomsWithBeds to get unit info
        const roomWithUnit = roomsWithBeds.find((r) => r.unit_id === id)
        if (roomWithUnit) {
          // Construct a minimal unit object from room info
          unit = {
            unit_id: id,
            unit_name: roomWithUnit.room_name || '',
            tenant_id: roomWithUnit.tenant_id || '',
          } as Unit
        } else {
          message.error('Unit not found. Please refresh and try again.')
          return
        }
      }
      const unitRoom = await ensureUnitRoom(unit)
      if (!unitRoom) {
        message.error('Failed to create unit_room for unit')
        return
      }
      devicesForSelection.value = allDevicesList
      // Set devContainerTarget to unit_room, so only the room is highlighted, not the entire unit edit area
      if (unitRoom.room_id) {
        devContainerTarget.value = { type: 'room', id: unitRoom.room_id }
      }
    } else if (type === 'room') {
      devicesForSelection.value = allDevicesList
      devContainerTarget.value = { type: 'room', id }
    } else {
      devicesForSelection.value = allDevicesList
      devContainerTarget.value = { type: 'bed', id }
    }
    
    showDeviceSelectModal.value = true
  }

  // Toggle add device
  const handleToggleAddDevice = async (
    editingUnit: Unit | null,
    ensureUnitRoom: (unit: Unit) => Promise<RoomWithBeds | null>,
    roomsWithBeds: RoomWithBeds[],
    expandedRooms: Ref<Set<string>>,
    activeHeaderButton: Ref<'room' | 'bed' | 'device' | null>,
    showAddRoomForm: Ref<boolean>
  ) => {
    if (activeHeaderButton.value === 'device') {
      // If already active, close it
      activeHeaderButton.value = null
      isDeviceMode.value = false
      expandedRooms.value.clear()
      devContainerTarget.value = null
    } else {
      // Close other modes first
      if (activeHeaderButton.value === 'room') {
        showAddRoomForm.value = false
      }
      if (activeHeaderButton.value === 'bed') {
        expandedRooms.value.clear()
      }
      // Activate device mode
      activeHeaderButton.value = 'device'
      
      if (!editingUnit) {
        message.error('No unit selected')
        return
      }
      // Don't create unit_room automatically, just expand existing rooms
      // Don't set devContainerTarget, so no container is highlighted
      roomsWithBeds.forEach((r) => {
        if (r.room_id) {
          expandedRooms.value.add(r.room_id)
        }
      })
      isDeviceMode.value = true
      await fetchAllDevices()
      // Don't set devContainerTarget - we don't want to highlight any container
      devContainerTarget.value = null
    }
  }

  // Add device to room
  const handleAddDeviceToRoom = async (
    roomId: string,
    roomsWithBeds: RoomWithBeds[],
    allUnits: Unit[],
    ensureUnitRoom: (unit: Unit) => Promise<RoomWithBeds | null>,
    expandedRooms: Ref<Set<string>>
  ) => {
    // Expand the room if not already expanded
    expandedRooms.value.add(roomId)
    // Set devContainerTarget to this room (not unit, so unit won't be highlighted)
    devContainerTarget.value = { type: 'room', id: roomId }
    // Fetch devices first
    await fetchAllDevices()
    // Open selection modal
    await openDeviceSelection('room', roomId, roomsWithBeds, allUnits, ensureUnitRoom)
  }

  // Add device to bed
  const handleAddDeviceToBed = async (
    bedId: string,
    roomsWithBeds: RoomWithBeds[],
    allUnits: Unit[],
    ensureUnitRoom: (unit: Unit) => Promise<RoomWithBeds | null>,
    expandedRooms: Ref<Set<string>>
  ) => {
    // Find the room containing this bed and expand it
    const roomWithBed = roomsWithBeds.find((r) => r.beds?.some((b) => b.bed_id === bedId))
    if (roomWithBed?.room_id) {
      expandedRooms.value.add(roomWithBed.room_id)
    }
    // Set devContainerTarget to this bed (not unit, so unit won't be highlighted)
    devContainerTarget.value = { type: 'bed', id: bedId }
    // Fetch devices first
    await fetchAllDevices()
    // Open selection modal
    await openDeviceSelection('bed', bedId, roomsWithBeds, allUnits, ensureUnitRoom)
  }

  // Device edit functions are now provided by useDeviceEdit composable

  // Device checkbox change
  const handleDeviceCheckboxChange = async (
    event: any,
    device: Device,
    devContainerTarget: Ref<{ type: 'unit' | 'room' | 'bed', id: string } | null>,
    roomsWithBeds: RoomWithBeds[],
    allUnits: Unit[],
    ensureUnitRoom: (unit: Unit) => Promise<RoomWithBeds | null>
  ) => {
    const checked = event.target.checked
    
    try {
      if (!device.device_id) {
        message.error('Device ID is required for binding')
        return
      }
      
      if (!devContainerTarget.value) {
        message.error('Please select a target (unit/room/bed) first')
        return
      }
      
      if (checked) {
        // Check SleepPad restriction
        if (device.device_type === 'SleepPad' || device.device_type === 'Sleepad') {
          if (devContainerTarget.value.type !== 'bed') {
            message.error('SleepPad can only be bound to a Bed, not to Room or Unit')
            return
          }
        }
        
        let boundRoomId: string | null = null
        let boundBedId: string | null = null
        let unitId: string | null = null
        
        if (devContainerTarget.value.type === 'unit') {
          const unit = allUnits.find((u) => u.unit_id === devContainerTarget.value!.id)
          if (!unit) {
            message.error('Unit not found')
            return
          }
          const unitRoom = await ensureUnitRoom(unit)
          if (!unitRoom) {
            message.error('Failed to create unit_room for unit')
            return
          }
          boundRoomId = unitRoom.room_id
          unitId = devContainerTarget.value.id
        } else if (devContainerTarget.value.type === 'room') {
          boundRoomId = devContainerTarget.value.id
          const room = roomsWithBeds.find((r) => r.room_id === devContainerTarget.value!.id)
          if (room) {
            unitId = room.unit_id
          }
        } else {
          // bed
          boundBedId = devContainerTarget.value.id
          const roomWithBeds = roomsWithBeds.find((r) => r.beds?.some((b) => b.bed_id === devContainerTarget.value!.id))
          if (roomWithBeds) {
            unitId = roomWithBeds.unit_id
          }
        }
        
        await updateDeviceApi(device.device_id, {
          bound_room_id: boundRoomId,
          bound_bed_id: boundBedId,
          unit_id: unitId,
        })
        
        const targetName = devContainerTarget.value.type === 'unit' ? 'unit' : 
                          devContainerTarget.value.type === 'room' ? 'room' : 'bed'
        message.success(`Device "${device.device_name}" bound to ${targetName} successfully`)
        expandedDevices.value.add(`device-${device.device_id}`)
      } else {
        await unbindDevice(device.device_id)
        message.success(`Device "${device.device_name}" unbound successfully`)
      }
      
      await fetchAllDevices()
    } catch (error: any) {
      message.error((checked ? 'Failed to bind device: ' : 'Failed to unbind device: ') + (error.message || 'Unknown error'))
      event.target.checked = !checked
    }
  }

  // Delete device (unbind)
  const handleDeleteDevice = async (device: Device) => {
    try {
      if (!device.device_id) {
        message.error('Device ID is required for unbinding')
        return
      }
      await unbindDevice(device.device_id)
      message.success(`Device "${device.device_name}" unbound successfully`)
      await fetchAllDevices()
    } catch (error: any) {
      message.error('Failed to unbind device: ' + (error.message || 'Unknown error'))
    }
  }

  // Device drag start
  const handleDeviceDragStart = (event: DragEvent, device: Device) => {
    if (!event.dataTransfer) return
    
    draggedDeviceId.value = device.device_id
    
    const dragImage = document.createElement('div')
    dragImage.textContent = device.device_name
    dragImage.style.cssText = 'position: absolute; top: -1000px; padding: 8px 12px; background: #1890ff; color: white; border-radius: 4px; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);'
    document.body.appendChild(dragImage)
    event.dataTransfer.setDragImage(dragImage, 0, 0)
    
    event.dataTransfer.setData('application/json', JSON.stringify({
      device_id: device.device_id,
      device_name: device.device_name,
    }))
    
    event.dataTransfer.effectAllowed = 'move'
    
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage)
      }
    }, 0)
  }

  // Drag over
  const handleDragOver = (event: DragEvent, type: 'unit' | 'room' | 'bed', id: string) => {
    event.preventDefault()
    event.dataTransfer!.dropEffect = 'move'
    dragOverTarget.value = { type, id }
  }

  // Drag leave
  const handleDragLeave = () => {
    dragOverTarget.value = null
  }

  // Device drop
  const handleDeviceDrop = async (
    event: DragEvent,
    type: 'unit' | 'room' | 'bed',
    id: string,
    allDevicesList: Device[],
    roomsWithBeds: RoomWithBeds[],
    allUnits: Unit[],
    ensureUnitRoom: (unit: Unit) => Promise<RoomWithBeds | null>
  ) => {
    event.preventDefault()
    dragOverTarget.value = null
    
    if (!event.dataTransfer) return
    
    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'))
      const deviceId = data.device_id
      const deviceType = data.device_type || data.deviceType
      
      if (!deviceId) {
        message.error('Device ID is required for binding')
        return
      }
      
      if (deviceType === 'SleepPad' || deviceType === 'Sleepad') {
        if (type !== 'bed') {
          message.error('SleepPad can only be bound to a Bed')
          return
        }
      }
      
      const device = allDevicesList.find((d) => d.device_id === deviceId)
      if (!device) {
        message.error('Device not found')
        return
      }
      
      let boundRoomId: string | null = null
      let boundBedId: string | null = null
      let unitId: string | null = null
      
      if (type === 'unit') {
        const unit = allUnits.find((u) => u.unit_id === id)
        if (!unit) {
          message.error('Unit not found')
          return
        }
        const unitRoom = await ensureUnitRoom(unit)
        if (!unitRoom) {
          message.error('Failed to create unit_room for unit')
          return
        }
        boundRoomId = unitRoom.room_id
        unitId = id
      } else if (type === 'room') {
        boundRoomId = id
        const room = roomsWithBeds.find((r) => r.room_id === id)
        if (room) {
          unitId = room.unit_id
        }
      } else {
        boundBedId = id
        const roomWithBeds = roomsWithBeds.find((r) => r.beds?.some((b) => b.bed_id === id))
        if (roomWithBeds) {
          unitId = roomWithBeds.unit_id
        }
      }
      
      await updateDeviceApi(deviceId, {
        bound_room_id: boundRoomId,
        bound_bed_id: boundBedId,
        unit_id: unitId,
      })
      
      expandedDevices.value.add(`device-${deviceId}`)
      await fetchAllDevices()
      message.success(`Device "${device.device_name}" bound successfully`)
    } catch (error: any) {
      message.error('Failed to bind device: ' + (error.message || 'Unknown error'))
    }
  }

  // Is device bound to target
  const isDeviceBoundToTarget = (
    device: Device,
    selectedTarget: { type: 'unit' | 'room' | 'bed', id: string } | null,
    allUnits: Unit[],
    roomsWithBeds: RoomWithBeds[]
  ): boolean => {
    if (!selectedTarget) return false
    const deviceAny = device as any
    
    if (selectedTarget.type === 'unit') {
      const unit = allUnits.find((u) => u.unit_id === selectedTarget.id)
      if (!unit) return false
      const unitRooms = roomsWithBeds.filter((r) => r.unit_id === unit.unit_id)
      const unitRoom = unitRooms.find((r) => r.room_name === unit.unit_name)
      if (!unitRoom) return false
      return deviceAny.bound_room_id === unitRoom.room_id
    } else if (selectedTarget.type === 'room') {
      return deviceAny.bound_room_id === selectedTarget.id
    } else {
      return deviceAny.bound_bed_id === selectedTarget.id
    }
  }

  // Device select change
  const handleDeviceSelectChange = async (
    event: any,
    device: Device,
    selectedTarget: { type: 'unit' | 'room' | 'bed', id: string } | null,
    roomsWithBeds: RoomWithBeds[],
    allUnits: Unit[],
    ensureUnitRoom: (unit: Unit) => Promise<RoomWithBeds | null>
  ) => {
    const checked = event.target.checked
    if (!selectedTarget || !device.device_id) return
    
    try {
      if (checked) {
        if (device.device_type === 'SleepPad' || device.device_type === 'Sleepad') {
          if (selectedTarget.type !== 'bed') {
            message.error('SleepPad can only be bound to a Bed, not to Room or Unit')
            return
          }
        }
        
        let boundRoomId: string | null = null
        let boundBedId: string | null = null
        let unitId: string | null = null
        
        if (selectedTarget.type === 'unit') {
          const unit = allUnits.find((u) => u.unit_id === selectedTarget.id)
          if (!unit) {
            message.error('Unit not found')
            return
          }
          const unitRoom = await ensureUnitRoom(unit)
          if (!unitRoom) {
            message.error('Failed to create unit_room for unit')
            return
          }
          boundRoomId = unitRoom.room_id
          unitId = selectedTarget.id
        } else if (selectedTarget.type === 'room') {
          boundRoomId = selectedTarget.id
          const room = roomsWithBeds.find((r) => r.room_id === selectedTarget.id)
          if (room) {
            unitId = room.unit_id
          }
        } else {
          boundBedId = selectedTarget.id
          const roomWithBeds = roomsWithBeds.find((r) => r.beds?.some((b) => b.bed_id === selectedTarget.id))
          if (roomWithBeds) {
            unitId = roomWithBeds.unit_id
          }
        }
        
        await updateDeviceApi(device.device_id, {
          bound_room_id: boundRoomId,
          bound_bed_id: boundBedId,
          unit_id: unitId,
        })
        expandedDevices.value.add(`device-${device.device_id}`)
      } else {
        await updateDeviceApi(device.device_id, {
          bound_room_id: null,
          bound_bed_id: null,
          unit_id: null,
        })
      }
      await fetchAllDevices()
      
      const allDevicesList = [...allDevices.value]
      
      if (selectedTarget.type === 'unit') {
        devicesForSelection.value = allDevicesList
        devContainerTarget.value = { type: 'unit', id: selectedTarget.id }
      } else if (selectedTarget.type === 'room') {
        devicesForSelection.value = allDevicesList
        devContainerTarget.value = { type: 'room', id: selectedTarget.id }
      } else {
        devicesForSelection.value = allDevicesList
        devContainerTarget.value = { type: 'bed', id: selectedTarget.id }
      }
    } catch (error: any) {
      message.error('Failed to update device binding')
      event.target.checked = !checked
    }
  }

  // Confirm device selection
  const handleConfirmDeviceSelection = (
    editingUnit: { unit_id: string } | null,
    fetchRoomsWithBeds: (unitId: string) => Promise<void>
  ) => {
    showDeviceSelectModal.value = false
    selectedTarget.value = null
    if (editingUnit) {
      fetchRoomsWithBeds(editingUnit.unit_id)
    }
  }

  // Cancel device selection - restore original bindings
  const handleCancelDeviceSelection = async () => {
    // Restore all devices to their original bindings
    const restorePromises: Promise<any>[] = []
    originalDeviceBindings.value.forEach((originalBinding, deviceId) => {
      restorePromises.push(
        updateDeviceApi(deviceId, {
          bound_room_id: originalBinding.bound_room_id,
          bound_bed_id: originalBinding.bound_bed_id,
          unit_id: originalBinding.unit_id,
        })
      )
    })
    
    try {
      await Promise.all(restorePromises)
      await fetchAllDevices()
      message.info('Device bindings restored to original state')
    } catch (error: any) {
      console.error('Failed to restore device bindings:', error)
      message.error('Failed to restore some device bindings')
    }
    
    showDeviceSelectModal.value = false
    selectedTarget.value = null
    originalDeviceBindings.value.clear()
  }

  return {
    // State
    isDeviceMode,
    availableDevices,
    allDevices,
    showDeviceSelectModal,
    selectedTarget,
    devicesForSelection,
    devContainerTarget,
    expandedDevices,
    draggedDeviceId,
    dragOverTarget,
    editingDeviceId,
    editingField,
    editingValue,
    deviceColumns,
    deviceSelectColumns,
    devContainerDevices,
    // Methods
    fetchAllDevices,
    unbindDevice,
    isDeviceBound,
    getRoomDevices,
    getBedDevices,
    getUnitDevices,
    toggleDevicesExpand,
    openDeviceSelection,
    handleToggleAddDevice,
    handleAddDeviceToRoom,
    handleAddDeviceToBed,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDeviceCheckboxChange,
    handleDeleteDevice,
    handleDeviceDragStart,
    handleDragOver,
    handleDragLeave,
    handleDeviceDrop,
    isDeviceBoundToTarget,
    handleDeviceSelectChange,
    handleConfirmDeviceSelection,
    handleCancelDeviceSelection,
  }
}

