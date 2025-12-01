/**
 * Unified entity store for managing devices, units, users, residents, etc.
 * 
 * This store provides a centralized place to:
 * - Store entities fetched from server
 * - Update entities in one place
 * - Share entities across multiple components
 * - Avoid duplicate API calls
 * - Maintain data consistency
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Device } from '@/api/devices/model/deviceModel'
import type { Unit, RoomWithBeds } from '@/api/units/model/unitModel'
// TODO: Add other entity types as needed
// import type { User } from '@/api/users/model/userModel'
// import type { Resident } from '@/api/residents/model/residentModel'

export const useEntitiesStore = defineStore('entities', () => {
  // Devices
  const devices = ref<Device[]>([])
  const devicesLastFetched = ref<Date | null>(null)
  const devicesCacheTimeout = 5 * 60 * 1000 // 5 minutes

  // Units
  const units = ref<Unit[]>([])
  const unitsLastFetched = ref<Date | null>(null)
  const unitsCacheTimeout = 5 * 60 * 1000 // 5 minutes

  // Rooms with beds (cached per unit)
  const roomsWithBedsCache = ref<Map<string, { data: RoomWithBeds[], timestamp: Date }>>(new Map())
  const roomsCacheTimeout = 5 * 60 * 1000 // 5 minutes

  // Computed: Available devices (not bound)
  const availableDevices = computed(() => {
    return devices.value.filter((device) => {
      return !device.bound_room_id && !device.bound_bed_id
    })
  })

  // Computed: Devices by room
  const getDevicesByRoom = computed(() => {
    return (roomId: string) => {
      return devices.value.filter((device) => device.bound_room_id === roomId)
    }
  })

  // Computed: Devices by bed
  const getDevicesByBed = computed(() => {
    return (bedId: string) => {
      return devices.value.filter((device) => device.bound_bed_id === bedId)
    }
  })

  // Actions: Devices
  const setDevices = (newDevices: Device[]) => {
    devices.value = newDevices
    devicesLastFetched.value = new Date()
  }

  const updateDevice = (deviceId: string, updates: Partial<Device>) => {
    const index = devices.value.findIndex((d) => d.device_id === deviceId)
    if (index !== -1) {
      devices.value[index] = { ...devices.value[index], ...updates }
    }
  }

  const removeDevice = (deviceId: string) => {
    devices.value = devices.value.filter((d) => d.device_id !== deviceId)
  }

  const shouldRefreshDevices = computed(() => {
    if (!devicesLastFetched.value) return true
    const now = new Date()
    return now.getTime() - devicesLastFetched.value.getTime() > devicesCacheTimeout
  })

  // Actions: Units
  const setUnits = (newUnits: Unit[]) => {
    units.value = newUnits
    unitsLastFetched.value = new Date()
  }

  const updateUnit = (unitId: string, updates: Partial<Unit>) => {
    const index = units.value.findIndex((u) => u.unit_id === unitId)
    if (index !== -1) {
      units.value[index] = { ...units.value[index], ...updates }
    }
  }

  const removeUnit = (unitId: string) => {
    units.value = units.value.filter((u) => u.unit_id !== unitId)
  }

  const shouldRefreshUnits = computed(() => {
    if (!unitsLastFetched.value) return true
    const now = new Date()
    return now.getTime() - unitsLastFetched.value.getTime() > unitsCacheTimeout
  })

  // Actions: Rooms with beds cache
  const setRoomsWithBeds = (unitId: string, rooms: RoomWithBeds[]) => {
    roomsWithBedsCache.value.set(unitId, {
      data: rooms,
      timestamp: new Date(),
    })
  }

  const getRoomsWithBeds = (unitId: string): RoomWithBeds[] | null => {
    const cached = roomsWithBedsCache.value.get(unitId)
    if (!cached) return null
    
    const now = new Date()
    if (now.getTime() - cached.timestamp.getTime() > roomsCacheTimeout) {
      roomsWithBedsCache.value.delete(unitId)
      return null
    }
    
    return cached.data
  }

  const shouldRefreshRooms = (unitId: string): boolean => {
    const cached = roomsWithBedsCache.value.get(unitId)
    if (!cached) return true
    
    const now = new Date()
    return now.getTime() - cached.timestamp.getTime() > roomsCacheTimeout
  }

  // Clear all caches
  const clearCache = () => {
    devices.value = []
    devicesLastFetched.value = null
    units.value = []
    unitsLastFetched.value = null
    roomsWithBedsCache.value.clear()
  }

  return {
    // State
    devices,
    units,
    roomsWithBedsCache,
    
    // Computed
    availableDevices,
    getDevicesByRoom,
    getDevicesByBed,
    shouldRefreshDevices,
    shouldRefreshUnits,
    
    // Actions: Devices
    setDevices,
    updateDevice,
    removeDevice,
    
    // Actions: Units
    setUnits,
    updateUnit,
    removeUnit,
    
    // Actions: Rooms
    setRoomsWithBeds,
    getRoomsWithBeds,
    shouldRefreshRooms,
    
    // Utilities
    clearCache,
  }
})

