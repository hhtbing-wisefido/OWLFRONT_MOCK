/**
 * 全局报警声音管理
 * 
 * 功能：
 * 1. 在用户登录后，持续监控报警状态
 * 2. 只要存在未处理的报警，就播放报警声音
 * 3. 按报警级别排序，优先处理高级别报警
 * 4. 所有报警处理完毕后停止声音
 */

import { ref, watch, onUnmounted } from 'vue'
import { alarmSound } from '@/utils/radar/alarmSound'
import { getVitalFocusCardsApi } from '@/api/monitors/monitor'
import type { VitalFocusCard } from '@/api/monitors/model/monitorModel'
import { useUserStore } from '@/store/modules/user'

/**
 * 不应该接收报警的角色列表
 * SystemOperator是平台运维角色，没有监控页面权限，不应该接收报警
 * SystemAdmin也是平台管理角色，主要管理权限配置，不直接参与监控
 */
const ALARM_EXCLUDED_ROLES = ['SystemOperator', 'SystemAdmin']

// 全局状态
const isMonitoring = ref(false)
const unhandledAlarms = ref<Set<string>>(new Set())
let pollingTimer: NodeJS.Timeout | null = null

/**
 * 检查卡片是否有报警
 */
function hasAlarm(card: VitalFocusCard): boolean {
  if (!card.alarms || card.alarms.length === 0) {
    return false
  }
  // 检查是否有active状态的报警
  return card.alarms.some(alarm => alarm.alarm_status === 'active')
}

/**
 * 获取报警ID - 使用 card_id 作为唯一标识
 */
function getAlarmId(card: VitalFocusCard): string {
  // VitalFocusCard 使用 card_id 和 card_type，不是 id 和 type
  return `alarm_${card.card_type}_${card.card_id}`
}

/**
 * 解析报警级别
 * @param alarmLevel - 可以是数字 (1, 2, 4) 或字符串 ('L1', 'L2', 'L4')
 * @returns 优先级数字 (越小优先级越高): 1→0 (最高), 2→1, 4→2
 */
function parseAlarmLevel(alarmLevel: string | number): number {
  // 如果是数字类型
  if (typeof alarmLevel === 'number') {
    // alarm_level: 1=ALERT(最高), 2=CRIT, 4=WARNING
    if (alarmLevel === 1) return 0 // ALERT - 最高优先级
    if (alarmLevel === 2) return 1 // CRIT
    if (alarmLevel === 4) return 2 // WARNING
    return 999
  }
  
  // 如果是字符串类型 'L1', 'L2', 'L4'
  const match = alarmLevel.match(/L(\d+)/)
  if (match) {
    const level = parseInt(match[1], 10)
    if (level === 1) return 0
    if (level === 2) return 1
    if (level === 4) return 2
  }
  return 999
}

/**
 * 获取卡片的最高报警级别
 */
function getHighestAlarmLevel(card: VitalFocusCard): number {
  if (!card.alarms || card.alarms.length === 0) {
    return 999
  }
  
  const activeAlarms = card.alarms.filter(alarm => alarm.alarm_status === 'active')
  if (activeAlarms.length === 0) {
    return 999
  }
  
  let highestLevel = 999
  activeAlarms.forEach(alarm => {
    const level = parseAlarmLevel(alarm.alarm_level)
    if (level < highestLevel) {
      highestLevel = level
    }
  })
  
  return highestLevel
}

/**
 * 按报警级别排序（0=L1最高，1=L2，2=L3，3=L4）
 */
function sortCardsByAlarmLevel(cards: VitalFocusCard[]): VitalFocusCard[] {
  return cards.slice().sort((a, b) => {
    const aLevel = getHighestAlarmLevel(a)
    const bLevel = getHighestAlarmLevel(b)
    
    // 级别数字越小，优先级越高
    if (aLevel !== bLevel) {
      return aLevel - bLevel
    }
    
    // 同级别按时间排序（如果有时间戳）
    return 0
  })
}

/**
 * 检查并播放报警声音
 */
async function checkAndPlayAlarmSound(cards: VitalFocusCard[]) {
  const currentAlarms = new Set<string>()
  let hasNewAlarm = false
  let highestLevel = 999
  
  // 提取所有当前报警
  cards.forEach(card => {
    if (hasAlarm(card)) {
      const alarmId = getAlarmId(card)
      currentAlarms.add(alarmId)
      
      // 记录最高报警级别
      const cardLevel = getHighestAlarmLevel(card)
      if (cardLevel < highestLevel) {
        highestLevel = cardLevel
      }
      
      // 检查是否是新报警
      if (!unhandledAlarms.value.has(alarmId)) {
        hasNewAlarm = true
        console.log('[GlobalAlarmSound] New alarm detected:', alarmId, 'level:', cardLevel)
      }
    }
  })
  
  // 更新未处理报警集合
  unhandledAlarms.value = currentAlarms
  
  console.log('[GlobalAlarmSound] Check result:', {
    totalAlarms: currentAlarms.size,
    hasNewAlarm,
    highestLevel,
    alarms: Array.from(currentAlarms)
  })
  
  // 如果没有报警，停止声音
  if (currentAlarms.size === 0) {
    console.log('[GlobalAlarmSound] ✅ No active alarms - stopping sound')
    alarmSound.stopAlarm()
    return
  }
  
  // 有报警，播放对应级别的声音
  try {
    if (highestLevel === 0) {
      // L1 报警（最高级别）
      await alarmSound.playL1()
    } else if (highestLevel === 1) {
      // L2 报警
      await alarmSound.playL2()
    }
    // L3/L4 不播放声音，但会显示在界面上
  } catch (error: any) {
    console.warn('[GlobalAlarmSound] Could not play alarm sound:', error.message)
  }
}

/**
 * 轮询检查报警状态
 */
async function pollAlarmStatus() {
  try {
    const response = await getVitalFocusCardsApi()
    if (response && response.items) {
      // 按报警级别排序
      const sortedCards = sortCardsByAlarmLevel(response.items)
      await checkAndPlayAlarmSound(sortedCards)
    }
  } catch (error) {
    console.error('[GlobalAlarmSound] Failed to fetch cards:', error)
  }
}

/**
 * 启动全局报警监控
 */
export function useGlobalAlarmSound() {
  const startMonitoring = () => {
    if (isMonitoring.value) {
      console.log('[GlobalAlarmSound] Already monitoring')
      return
    }
    
    // 检查用户角色 - SystemOperator/SystemAdmin等不应该接收报警
    const userStore = useUserStore()
    const userRole = userStore.getUserInfo?.role
    
    if (userRole && ALARM_EXCLUDED_ROLES.includes(userRole)) {
      console.log(`[GlobalAlarmSound] 🚫 Alarm monitoring disabled for role: ${userRole}`)
      console.log('[GlobalAlarmSound] This role does not have monitoring permissions')
      return
    }
    
    console.log('[GlobalAlarmSound] 🎵 Starting global alarm monitoring')
    isMonitoring.value = true
    
    // 立即检查一次
    pollAlarmStatus()
    
    // 每10秒检查一次（Mock模式下不需要太频繁）
    pollingTimer = setInterval(pollAlarmStatus, 10000)
  }
  
  const stopMonitoring = () => {
    if (!isMonitoring.value) {
      return
    }
    
    console.log('[GlobalAlarmSound] 🔇 Stopping global alarm monitoring')
    isMonitoring.value = false
    
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
    
    alarmSound.stopAlarm()
    unhandledAlarms.value.clear()
  }
  
  // 组件卸载时停止监控
  onUnmounted(() => {
    stopMonitoring()
  })
  
  return {
    isMonitoring,
    unhandledAlarms,
    startMonitoring,
    stopMonitoring
  }
}
