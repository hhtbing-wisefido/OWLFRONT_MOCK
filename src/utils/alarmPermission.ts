/**
 * Alarm Permission Utilities
 * Utility functions for checking alarm handling permissions
 * 
 * Permission Rules:
 * - Facility cards (unit_type = 'Facility'): Only Nurse or Caregiver can handle
 * - Home cards (unit_type = 'Home'): All roles can handle
 */

import { useUserStore } from '@/store/modules/user'
import { useCardStore } from '@/store/modules/card'
import type { AlarmEvent } from '@/api/alarm/model/alarmModel'

/**
 * Check if user can handle alarm based on unit_type and role
 * 
 * @param alarmEvent - Alarm event (must have device_id)
 * @param cardStore - Card store instance (optional, will use store if not provided)
 * @param userStore - User store instance (optional, will use store if not provided)
 * @returns true if user can handle, false otherwise
 */
export function canHandleAlarm(
  alarmEvent: AlarmEvent,
  cardStore?: ReturnType<typeof useCardStore>,
  userStore?: ReturnType<typeof useUserStore>,
): boolean {
  const cardStoreInstance = cardStore || useCardStore()
  const userStoreInstance = userStore || useUserStore()
  
  const userRole = userStoreInstance.getUserInfo?.role
  
  // If no device_id, allow handle (fallback)
  if (!alarmEvent.device_id) {
    return true
  }

  // Get card by device_id (a device can only belong to one card)
  const card = cardStoreInstance.getCardByDeviceId(alarmEvent.device_id)
  
  if (!card) {
    // If card not found in cache, allow handle (fallback)
    // In production, you might want to load card detail first
    return true
  }

  // Check unit_type
  if (card.unit_type === 'Facility') {
    // Facility: Only Nurse or Caregiver can handle
    return userRole === 'Nurse' || userRole === 'Caregiver'
  } else if (card.unit_type === 'Home') {
    // Home: All roles can handle
    return true
  }

  // Default: allow handle
  return true
}

/**
 * Get permission denied reason for tooltip
 * 
 * @param alarmEvent - Alarm event
 * @param cardStore - Card store instance (optional)
 * @param userStore - User store instance (optional)
 * @returns Reason string or empty string if allowed
 */
export function getPermissionDeniedReason(
  alarmEvent: AlarmEvent,
  cardStore?: ReturnType<typeof useCardStore>,
  userStore?: ReturnType<typeof useUserStore>,
): string {
  const cardStoreInstance = cardStore || useCardStore()
  const userStoreInstance = userStore || useUserStore()
  
  const userRole = userStoreInstance.getUserInfo?.role
  
  if (!alarmEvent.device_id) {
    return ''
  }

  const card = cardStoreInstance.getCardByDeviceId(alarmEvent.device_id)
  
  if (card && card.unit_type === 'Facility') {
    if (userRole !== 'Nurse' && userRole !== 'Caregiver') {
      return 'Only Nurse or Caregiver can handle alarms for Facility cards'
    }
  }

  return ''
}

