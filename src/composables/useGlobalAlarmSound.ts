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

// 全局状态
const isMonitoring = ref(false)
const unhandledAlarms = ref<Set<string>>(new Set())
let pollingTimer: NodeJS.Timeout | null = null

/**
 * 检查卡片是否有报警
 */
function hasAlarm(card: VitalFocusCard): boolean {
  return card.alarmStatus !== null && card.alarmStatus !== undefined && card.alarmStatus >= 0
}

/**
 * 获取报警ID
 */
function getAlarmId(card: VitalFocusCard): string {
  return `alarm_${card.type}_${card.id.split('_')[1]}`
}

/**
 * 按报警级别排序（0=L1最高，1=L2，2=L3，3=L4）
 */
function sortCardsByAlarmLevel(cards: VitalFocusCard[]): VitalFocusCard[] {
  return cards.slice().sort((a, b) => {
    const aLevel = a.alarmStatus ?? 999
    const bLevel = b.alarmStatus ?? 999
    
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
      if (card.alarmStatus! < highestLevel) {
        highestLevel = card.alarmStatus!
      }
      
      // 检查是否是新报警
      if (!unhandledAlarms.value.has(alarmId)) {
        hasNewAlarm = true
        console.log('[GlobalAlarmSound] New alarm detected:', alarmId, 'level:', card.alarmStatus)
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
