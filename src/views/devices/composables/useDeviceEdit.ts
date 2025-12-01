/**
 * Shared composable for device name editing
 * Used by both DeviceList.vue and UnitList.vue
 */

import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { updateDeviceApi } from '@/api/devices/device'
import type { Device } from '@/api/devices/model/deviceModel'

export function useDeviceEdit(refreshCallback: () => Promise<void>) {
  // Edit state
  const editingDeviceId = ref<string | null>(null)
  const editingField = ref<string | null>(null)
  const editingValue = ref<string>('')

  // Start editing
  const handleStartEdit = (record: Device, field: string, value: string) => {
    editingDeviceId.value = record.device_id
    editingField.value = field
    editingValue.value = value
  }

  // Save edit
  const handleSaveEdit = async (record: Device) => {
    if (!editingDeviceId.value || !editingField.value) return

    const newValue = editingValue.value.trim()
    if (newValue === record.device_name) {
      // Value hasn't changed, cancel edit
      handleCancelEdit()
      return
    }

    try {
      await updateDeviceApi(record.device_id, {
        device_name: newValue,
      })
      message.success('Device name updated successfully')
      await refreshCallback()
    } catch (error: any) {
      message.error(error?.message || 'Failed to update device name')
      // Restore original value by re-fetching
      await refreshCallback()
    } finally {
      handleCancelEdit()
    }
  }

  // Cancel edit
  const handleCancelEdit = () => {
    editingDeviceId.value = null
    editingField.value = null
    editingValue.value = ''
  }

  return {
    editingDeviceId,
    editingField,
    editingValue,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
  }
}

