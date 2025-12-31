import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Device, AlarmEvent } from '@/types/device'
import { fetchDevices, fetchAlarms } from '@/api/device'

export const useDeviceStore = defineStore('device', () => {
  // 状态
  const devices = ref<Device[]>([])
  const alarms = ref<AlarmEvent[]>([])
  const loading = ref(false)
  const selectedDeviceId = ref<string | null>(null)

  // 计算属性
  const onlineDevices = computed(() => 
    devices.value.filter(d => d.status === 'online')
  )

  const offlineDevices = computed(() => 
    devices.value.filter(d => d.status === 'offline')
  )

  const alarmDevices = computed(() => 
    devices.value.filter(d => d.status === 'alarm')
  )

  const unresolvedAlarms = computed(() => 
    alarms.value.filter(a => !a.resolved)
  )

  const selectedDevice = computed(() => 
    devices.value.find(d => d.id === selectedDeviceId.value)
  )

  // 操作
  async function loadDevices() {
    loading.value = true
    try {
      devices.value = await fetchDevices()
    } finally {
      loading.value = false
    }
  }

  async function loadAlarms() {
    try {
      alarms.value = await fetchAlarms()
    } catch (error) {
      console.error('加载报警失败:', error)
    }
  }

  function selectDevice(deviceId: string | null) {
    selectedDeviceId.value = deviceId
  }

  return {
    // 状态
    devices,
    alarms,
    loading,
    selectedDeviceId,
    // 计算属性
    onlineDevices,
    offlineDevices,
    alarmDevices,
    unresolvedAlarms,
    selectedDevice,
    // 操作
    loadDevices,
    loadAlarms,
    selectDevice
  }
})
