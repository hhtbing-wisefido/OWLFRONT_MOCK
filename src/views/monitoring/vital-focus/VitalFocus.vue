<template>
  <div style="padding: 15px; background-color: #f4f7f9; min-height: 100vh;">
    <div v-show="isDev">
      <a-button v-if="isTimerRunning" type="primary" @click="stopTimer">Pause Timer</a-button>
      <a-button v-else type="primary" @click="startTimer">Resume Timer</a-button>
    </div>
    
    <!-- Filter Buttons Row (过滤按钮行) -->
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 15px; padding: 10px; background-color: #fff; border-radius: 4px;">
      <!-- unhand: 显示有未处理0-1级警报的数量（红色 Badge） -->
      <a-button
        :type="activeFilter === 'unhand' ? 'primary' : 'default'"
        @click="toggleFilter('unhand')"
      >
        unhand
        <a-badge
          v-if="!activeFilter || activeFilter === 'unhand'"
          :count="unhandCount"
          :number-style="{ backgroundColor: '#d32f2f' }"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- OutofRoom: 显示离房的数量 -->
      <a-button
        :type="activeFilter === 'outofroom' ? 'primary' : 'default'"
        @click="toggleFilter('outofroom')"
      >
        OutofRoom
        <a-badge
          v-if="!activeFilter || activeFilter === 'outofroom'"
          :count="outofRoomCount"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- LeftBed: 显示离床的数量 -->
      <a-button
        :type="activeFilter === 'leftbed' ? 'primary' : 'default'"
        @click="toggleFilter('leftbed')"
      >
        LeftBed
        <a-badge
          v-if="!activeFilter || activeFilter === 'leftbed'"
          :count="leftBedCount"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- Visitor: 显示有访客的数量 -->
      <a-button
        :type="activeFilter === 'visitor' ? 'primary' : 'default'"
        @click="toggleFilter('visitor')"
      >
        Visitor
        <a-badge
          v-if="!activeFilter || activeFilter === 'visitor'"
          :count="visitorCount"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- Awake: 显示床上未睡的数量 -->
      <a-button
        :type="activeFilter === 'awake' ? 'primary' : 'default'"
        @click="toggleFilter('awake')"
      >
        Awake
        <a-badge
          v-if="!activeFilter || activeFilter === 'awake'"
          :count="awakeCount"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- Sleep: 显示入睡的数量 -->
      <a-button
        :type="activeFilter === 'sleep' ? 'primary' : 'default'"
        @click="toggleFilter('sleep')"
      >
        Sleep
        <a-badge
          v-if="!activeFilter || activeFilter === 'sleep'"
          :count="sleepCount"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- SelectCard: 选择监控卡片 -->
      <a-button
        type="default"
        @click="showSelectCardModal = true"
      >
        SelectCard
      </a-button>
    </div>
    
    <!-- SelectCard Modal -->
    <a-modal
      v-model:visible="showSelectCardModal"
      title="Select Card"
      :width="600"
      :footer="null"
    >
      <div style="max-height: 400px; overflow-y: auto;">
        <div
          v-for="card in allCards"
          :key="card.card_id"
          style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #f0f0f0; cursor: pointer;"
          @click="goToAllVitalFocus(card)"
        >
          <div>
            <div style="font-weight: 500;">{{ card.card_name }}</div>
            <div style="font-size: 12px; color: #999;">{{ card.card_address }}</div>
          </div>
          <a-checkbox :checked="false" @click.stop />
        </div>
      </div>
    </a-modal>
    
    <div style="display: flex; flex-wrap: wrap; justify-content: flex-start; align-items: center">
      <div class="itemFrom" @click="goDetail(item)" v-for="item in filteredCards" :key="item.card_id">
        <!-- Section 1: Head - Name, Address, Alarm Status -->
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(203, 203, 225, 0.5);
            padding-bottom: 5px;
          "
        >
          <div style="width: 90%">
            <!-- Name with Service Level Color Point (v1.5: use card_name instead of residents.map(name)) -->
            <div style="font-size: 16px; color: #000; display: flex; align-items: center; gap: 8px">
              {{ item.card_name }}
              <span
                v-if="hasResidentWithServiceLevel(item)"
                class="color-point"
                :style="getColorPointStyle(item)"
                :title="getServiceLevelTooltip(item)"
              ></span>
            </div>
            <!-- Address (v1.5: use card_address instead of addressName) -->
            <a-tooltip :title="item.card_address" placement="topLeft">
              <div
                style="
                  font-size: 14px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: block;
                  text-align: left;
                "
              >
                {{ item.card_address }}
              </div>
            </a-tooltip>
          </div>
          <div style="display: flex; flex-direction: row; align-items: center;">
            <!-- Device Offline Indicators -->
            <div v-if="item.devices.length === 2 && item.s_connection === 1 && item.r_connection === 0">
              <img
                src="@/assets/images/radar-offline.png"
                style="margin-right: 10px; width: 20px; height: 20px; border: solid 1px red; border-radius: 50%;"
              />
            </div>
            <div v-else-if="item.devices.length === 2 && item.s_connection === 0 && item.r_connection === 1">
              <img
                src="@/assets/images/sleepace-offline.png"
                style="margin-right: 10px; width: 20px; height: 20px; border: solid 1px red; border-radius: 50%;"
              />
            </div>
            <!-- Alarm Status Icon (右上角图标) -->
            <div :style="{ fontSize: '20px', color: getIconAlarmColor(item) }">
              <AlertFilled />
            </div>
          </div>
        </div>

        <!-- Section 2: Real-time Data -->
        <!-- Device Offline States -->
        <div v-if="item.devices.length === 1 && item.devices[0]?.device_type === 1 && item.s_connection === 0">
          <div class="status-icon-text">
            <div class="status-img">
              <img src="@/assets/images/sleepace-offline.png" style="margin-right: 10px; width: 60px; height: 60px" />
            </div>
            <div style="font-size: 18px">Device Offline</div>
          </div>
        </div>
        <div v-else-if="item.devices.length === 1 && item.devices[0]?.device_type === 2 && item.r_connection === 0">
          <div class="status-icon-text">
            <div class="status-img">
              <img src="@/assets/images/radar-offline.png" style="margin-right: 10px; width: 60px; height: 60px" />
            </div>
            <div style="font-size: 18px">Device Offline</div>
          </div>
        </div>
        <div v-else-if="item.devices.length === 2 && item.s_connection === 0 && item.r_connection === 0">
          <div class="status-icon-text">
            <div style="display: flex; flex-direction: column; gap: 5px">
              <div class="status-img">
                <img src="@/assets/images/sleepace-offline.png" style="margin-right: 10px; width: 60px; height: 60px" />
              </div>
              <div class="status-img">
                <img src="@/assets/images/radar-offline.png" style="margin-right: 10px; width: 60px; height: 60px" />
              </div>
            </div>
            <div style="font-size: 18px">Device Offline</div>
          </div>
        </div>
        <!-- ActiveBed Cards: Real-time Data Display -->
        <div
          v-else-if="item.card_type === 'ActiveBed'"
          style="display: flex; flex-direction: column; justify-content: space-between; height: 80%"
        >
          <div style="height: 100%; align-content: center">
            <div
              style="
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
              "
            >
              <div>
                <!-- Not in Bed -->
                <div v-if="item.bed_status === 1" class="status-icon-text">
                  <div class="status-img">
                    <img src="@/assets/images/Outofbed.png" style="margin-right: 10px" />
                  </div>
                  <div style="font-size: 18px">Not in Bed</div>
                </div>
                <!-- In Bed: Sleep Status and Vital Signs -->
                <div v-else style="font-size: 18px">
                  <div
                    style="
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: center;
                      flex-wrap: wrap;
                    "
                  >
                    <!-- Sleep Stage (simplified - using bed_status for now) -->
                    <div>
                      <div v-if="item.bed_status === 0" style="font-size: 30px">
                        <img src="@/assets/images/awake.gif" style="margin-right: 10px" />
                      </div>
                      <div v-else style="font-size: 30px">
                        <img
                          src="@/assets/images/Analysing_sleep_state.png"
                          style="margin-right: 10px; width: 72px; height: 72px;"
                        />
                      </div>
                    </div>
                    <!-- HR and RR (simplified - show if available) -->
                    <div v-if="needShowDetailNumbers(item.card_id)" style="font-size: 18px; display: flex; flex-direction: column" title="Click to hide details" @click.stop="hideDetailNumbersTemporarily(item.card_id)">
                      <div class="status-item" style="margin-bottom: -24px">
                        <img :src="getHeartImgUrl(item?.heart || 0)" style="margin-right: 10px; width: 20px; height: 20px;" />
                        <div class="number-container">
                          <span class="status-number">{{
                            item?.heart && item.heart > 0 && item.heart < 255 ? item.heart : '--'
                          }}</span>
                        </div>
                        <span> bpm</span>
                      </div>
                      <div class="status-item">
                        <img :src="getBreathImgUrl(item?.breath || 0)" style="margin-right: 10px; width: 20px; height: 20px;" />
                        <div class="number-container">
                          <span class="status-number">{{
                            item?.breath && item.breath > 0 && item.breath < 255 ? item.breath : '--'
                          }}</span>
                        </div>
                        <span> rpm</span>
                      </div>
                      <div v-show="usingTemporarySettings(item.card_id)" class="apply-button-bar">
                        <button class="apply-button" @click.stop="applyTemporarySettings(item.card_id)" title="Always show details">Save change</button>
                      </div>
                    </div>
                    <div v-else style="font-size: 18px; display: flex; flex-direction: row; align-items: center;" title="Click to show details" @click.stop="showDetailNumbersTemporarily(item.card_id)">
                      <div class="status-item">
                        <img :src="getHeartImgUrl(item?.heart || 0)" style="margin-right: 10px; width: 50px; height: 50px;" />
                      </div>
                      <div class="status-item">
                        <img :src="getBreathImgUrl(item?.breath || 0)" style="margin-right: 10px; width: 50px; height: 50px;" />
                      </div>
                      <div v-show="usingTemporarySettings(item.card_id)" class="apply-button-bar">
                        <button class="apply-button" @click.stop="applyTemporarySettings(item.card_id)" title="Always hide details">Save change</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Section 3: Event & Alert - Time Information -->
          <div>
            <div class="status-time" style="border-bottom: 1px solid rgba(203, 203, 225, 0.5)">
              <div>
                <div v-if="item.bed_status === 1">Left bed time</div>
                <div v-else>Went to Bed</div>
              </div>
              <div>{{ formatTimestampToTime(item.timestamp || Date.now()) }}</div>
            </div>
            <div class="status-time">
              <div>
                <div v-if="item.bed_status === 1">Out of bed</div>
                <div v-else-if="item.bed_status === 0">Awake</div>
                <div v-else>Analysing</div>
              </div>
              <div>{{ formatDurationToTime((dataSource?.timestamp || Date.now()) - (item.timestamp || Date.now())) }}</div>
            </div>
          </div>
        </div>
        <!-- Location Cards: Person Count and Postures (simplified) -->
        <div v-else style="display: flex; flex-direction: column; align-items: center">
          <div style="font-size: 18px">{{ item.resident_count || 0 }} Person{{ (item.resident_count || 0) > 1 ? 's' : '' }}</div>
        </div>

        <!-- Section 3: Event & Alert - Alarm Bar (下端弹出项) -->
        <div v-if="getLatestPopAlarm(item)">
          <div
            v-if="getLatestPopAlarmLevel(item) <= 1"
            class="red-floating-bar"
          >
            <span>{{ getLatestPopAlarmTypeName(item) }} Handle</span>
            <button class="red-handle-button" @click.stop="handleAlarm(item, getLatestPopAlarm(item))">Handle</button>
          </div>
          <div
            v-else-if="getLatestPopAlarmLevel(item) >= 2 && getLatestPopAlarmLevel(item) <= 4"
            class="yellow-floating-bar"
          >
            <span>{{ getLatestPopAlarmTypeName(item) }} Handle</span>
            <button class="yellow-handle-button" @click.stop="handleAlarm(item, getLatestPopAlarm(item))">Handle</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AlertFilled } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { GetVitalFocusCardsModel, VitalFocusCard } from '@/api/monitor/model/monitorModel'
import { getVitalFocusCardsApi } from '@/api/monitor/monitor'
import {
  parseAlarmLevel,
  getAlarmColor,
  getHighestAlarmLevel,
  formatAlarmTypeToString,
} from '@/utils/alarm'

// Import heart and breath images
import heartRed from '@/assets/images/heartrate-red.png'
import heartYellow from '@/assets/images/heartrate-yellow.png'
import heartGreen from '@/assets/images/heartrate-green.png'
import heartGray from '@/assets/images/heartrate-gray.png'
import breathRed from '@/assets/images/breathe-red.png'
import breathYellow from '@/assets/images/breathe-yellow.png'
import breathGreen from '@/assets/images/breathe-green.png'
import breathGray from '@/assets/images/breathe-gray.png'

const isDev = import.meta.env.DEV
const router = useRouter()
const dataSource = ref<GetVitalFocusCardsModel>()
const intervalTime = 3 * 1000 // 3 seconds
let timer: ReturnType<typeof setInterval> | null = null
const isTimerRunning = ref(false)

// Filter state
const activeFilter = ref<string | null>(null) // 'unhand' | 'outofroom' | 'leftbed' | 'visitor' | 'awake' | 'sleep' | null
const showSelectCardModal = ref(false)

// Card settings (for showing/hiding detail numbers)
const cardSettings = ref<Record<string, number>>({})
interface CardSetting {
  value: number
  timestamp: number
}
const tempCardSettings = ref<Record<string, CardSetting>>({})

// Heart and breath level thresholds
const heartLevels = [106, 96, 60, 45]
const breathLevels = [27, 21, 12, 8]

/**
 * Get heart rate image URL based on value
 */
const getHeartImgUrl = (heart: number) => {
  if (heart < 255 && heart >= (heartLevels[0] || 0)) {
    return heartRed
  } else if (heart >= (heartLevels[1] || 0)) {
    return heartYellow
  } else if (heart >= (heartLevels[2] || 0)) {
    return heartGreen
  } else if (heart >= (heartLevels[3] || 0)) {
    return heartYellow
  } else if (heart > 0) {
    return heartRed
  } else {
    return heartGray
  }
}

/**
 * Get breath rate image URL based on value
 */
const getBreathImgUrl = (breath: number) => {
  if (breath < 255 && breath >= (breathLevels[0] || 0)) {
    return breathRed
  } else if (breath >= (breathLevels[1] || 0)) {
    return breathYellow
  } else if (breath >= (breathLevels[2] || 0)) {
    return breathGreen
  } else if (breath >= (breathLevels[3] || 0)) {
    return breathYellow
  } else if (breath > 0) {
    return breathRed
  } else {
    return breathGray
  }
}

/**
 * Check if card has any resident with service_level
 */
const hasResidentWithServiceLevel = (card: VitalFocusCard): boolean => {
  return card.residents.some((resident) => resident.service_level && resident.service_level_info)
}

/**
 * Get color point style for service level
 */
const getColorPointStyle = (card: VitalFocusCard): { backgroundColor: string } => {
  const residentWithServiceLevel = card.residents.find(
    (resident) => resident.service_level && resident.service_level_info,
  )
  
  if (residentWithServiceLevel?.service_level_info?.color_hex) {
    return {
      backgroundColor: residentWithServiceLevel.service_level_info.color_hex,
    }
  }
  
  return {
    backgroundColor: '#a9a9a9',
  }
}

/**
 * Get service level tooltip text
 */
const getServiceLevelTooltip = (card: VitalFocusCard): string => {
  const residentWithServiceLevel = card.residents.find(
    (resident) => resident.service_level && resident.service_level_info,
  )
  
  if (residentWithServiceLevel?.service_level_info) {
    const info = residentWithServiceLevel.service_level_info
    return `${info.display_name}${info.display_name_cn ? ` (${info.display_name_cn})` : ''}`
  }
  
  return ''
}

/**
 * Format timestamp to time string
 */
const formatTimestampToTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Format duration to time string
 */
const formatDurationToTime = (duration: number): string => {
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m`
  } else {
    return `${seconds}s`
  }
}

/**
 * Check if should show detail numbers
 */
const needShowDetailNumbers = (cardId: string): boolean => {
  if (cardId in tempCardSettings.value && tempCardSettings.value[cardId]) {
    return tempCardSettings.value[cardId].value === 1
  } else if (cardId in cardSettings.value) {
    return (cardSettings.value[cardId] || 0) === 1
  }
  return false
}

/**
 * Show detail numbers temporarily
 */
const showDetailNumbersTemporarily = (cardId: string) => {
  if (cardId in cardSettings.value && cardSettings.value[cardId] === 1) {
    delete tempCardSettings.value[cardId]
  } else {
    tempCardSettings.value[cardId] = { value: 1, timestamp: Date.now() }
  }
}

/**
 * Hide detail numbers temporarily
 */
const hideDetailNumbersTemporarily = (cardId: string) => {
  if (!(cardId in cardSettings.value) || cardSettings.value[cardId] === 0) {
    delete tempCardSettings.value[cardId]
  } else {
    tempCardSettings.value[cardId] = { value: 0, timestamp: Date.now() }
  }
}

/**
 * Check if using temporary settings
 */
const usingTemporarySettings = (cardId: string): boolean => {
  return cardId in tempCardSettings.value
}

/**
 * Apply temporary settings (应用临时设置)
 * 
 * @param {string} cardId - 卡片ID
 * 
 * @description
 * 需要实现逻辑：
 * 1. 调用后端API保存卡片设置（cardSettings）
 * 2. 将临时设置（tempCardSettings）同步到持久化设置（cardSettings）
 * 3. 清除临时设置
 * 4. 处理API调用成功/失败的情况
 * 
 * @example
 * // 可能的实现方式：
 * const applyTemporarySettings = async (cardId: string) => {
 *   if (!(cardId in tempCardSettings.value)) {
 *     return
 *   }
 *   
 *   try {
 *     const setting = tempCardSettings.value[cardId]
 *     await saveCardSettingsApi(cardId, { showDetailNumbers: setting.value })
 *     cardSettings.value[cardId] = setting.value
 *     delete tempCardSettings.value[cardId]
 *     message.success('Settings saved successfully')
 *   } catch (error) {
 *     message.error('Failed to save settings')
 *   }
 * }
 * 
 * @todo
 * - 创建保存卡片设置的API函数（saveCardSettingsApi）
 * - 实现API调用逻辑
 * - 添加成功/失败提示
 * - 添加错误处理
 * - 确认API接口定义（请求参数、响应格式）
 */
const applyTemporarySettings = (cardId: string) => {
  // TODO: Implement API call to save settings
  if (cardId in tempCardSettings.value && tempCardSettings.value[cardId]) {
    // 占位符实现：仅同步到本地设置，不调用API
    cardSettings.value[cardId] = tempCardSettings.value[cardId].value
    delete tempCardSettings.value[cardId]
    
    // 示例实现（需要根据实际API调整）：
    // try {
    //   await saveCardSettingsApi(cardId, {
    //     showDetailNumbers: tempCardSettings.value[cardId].value
    //   })
    //   message.success('Settings saved')
    // } catch (error) {
    //   message.error('Failed to save settings')
    // }
  }
}

/**
 * Get icon alarm color (右上角图标颜色)
 * 根据最高级别的未处理报警显示颜色（考虑 icon_alarm_level 阈值）
 */
const getIconAlarmColor = (card: VitalFocusCard): string => {
  const threshold = card.icon_alarm_level ?? 3 // 默认 3 (ERR)
  const unhandledAlarms = {
    0: card.unhandled_alarm_0 ?? 0,
    1: card.unhandled_alarm_1 ?? 0,
    2: card.unhandled_alarm_2 ?? 0,
    3: card.unhandled_alarm_3 ?? 0,
    4: card.unhandled_alarm_4 ?? 0,
  }
  
  const highestLevel = getHighestAlarmLevel(unhandledAlarms, threshold)
  return getAlarmColor(highestLevel)
}

/**
 * Get latest pop alarm (获取最新的弹出报警)
 * 根据 pop_alarm_emerge 阈值过滤，返回最新的一个报警
 */
const getLatestPopAlarm = (card: VitalFocusCard) => {
  const threshold = card.pop_alarm_emerge ?? 0 // 默认 0 (EMERG)
  
  if (!card.alarms || card.alarms.length === 0) {
    return null
  }
  
  // 过滤：只保留 active 状态且级别 <= threshold 的报警
  const filteredAlarms = card.alarms
    .filter((alarm) => alarm.alarm_status === 'active')
    .filter((alarm) => {
      const level = parseAlarmLevel(alarm.alarm_level)
      return level <= threshold && level >= 0 && level <= 4
    })
    .sort((a, b) => b.triggered_at - a.triggered_at) // 按时间降序
  
  return filteredAlarms.length > 0 ? filteredAlarms[0] : null
}

/**
 * Get latest pop alarm level (获取最新弹出报警的级别)
 */
const getLatestPopAlarmLevel = (card: VitalFocusCard): number => {
  const alarm = getLatestPopAlarm(card)
  if (!alarm) {
    return -1
  }
  return parseAlarmLevel(alarm.alarm_level)
}

/**
 * Get latest pop alarm type name (获取最新弹出报警的类型名称)
 */
const getLatestPopAlarmTypeName = (card: VitalFocusCard): string => {
  const alarm = getLatestPopAlarm(card)
  if (!alarm) {
    return ''
  }
  return formatAlarmTypeToString(alarm.event_type)
}

/**
 * Handle alarm (处理报警)
 * 
 * @param {VitalFocusCard} item - 卡片对象
 * @param {any} [alarm] - 可选的报警对象，如果不提供则使用最新的弹出报警
 * 
 * @description
 * 需要实现逻辑：
 * 1. 打开报警处理弹窗（Modal）
 * 2. 显示报警详情（event_type, alarm_level, triggered_at 等）
 * 3. 提供处理操作按钮（如：确认、忽略、转派等）
 * 4. 调用后端API更新报警状态（alarm_status: 'active' -> 'acknowledged'）
 * 5. 处理成功后刷新卡片数据
 * 
 * @example
 * // 可能的实现方式：
 * const showAlarmModal = ref(false)
 * const currentAlarm = ref(null)
 * 
 * const handleAlarm = (item, alarm) => {
 *   currentAlarm.value = alarm || getLatestPopAlarm(item)
 *   showAlarmModal.value = true
 * }
 * 
 * // 在Modal中调用API：
 * const acknowledgeAlarm = async (eventId) => {
 *   await acknowledgeAlarmApi(eventId)
 *   await refreshData()
 * }
 * 
 * @todo
 * - 创建报警处理Modal组件
 * - 实现报警详情展示
 * - 实现报警处理API调用（acknowledgeAlarmApi）
 * - 实现处理后的数据刷新
 * - 添加错误处理
 */
const handleAlarm = (item: VitalFocusCard, alarm?: any) => {
  // TODO: Implement alarm handling modal
  const targetAlarm = alarm || getLatestPopAlarm(item)
  console.log('Handle alarm for card:', item.card_id, 'alarm:', targetAlarm)
  
  // 占位符实现
  message.info('Alarm handling feature will be implemented soon')
  
  // 示例实现（需要根据实际需求调整）：
  // if (!targetAlarm) {
  //   message.warning('No alarm to handle')
  //   return
  // }
  // 
  // // 打开报警处理Modal
  // currentAlarm.value = targetAlarm
  // showAlarmModal.value = true
}

/**
 * Refresh data from API
 */
const refreshData = async () => {
  try {
    const data = await getVitalFocusCardsApi('none')
    dataSource.value = data
  } catch (error: any) {
    console.error('Failed to fetch vital focus cards:', error)
    message.error('Failed to load cards. Please try again.')
  }
}

/**
 * Refresh temporary card settings
 */
const refreshTempCardSettings = () => {
  const intervalTime = 5 * 60 * 1000
  const now = Date.now()
  for (const key in tempCardSettings.value) {
    const setting = tempCardSettings.value[key]
    if (setting && now - setting.timestamp >= intervalTime) {
      delete tempCardSettings.value[key]
    }
  }
}

/**
 * Start auto-refresh timer
 */
const startTimer = () => {
  if (!timer) {
    timer = setInterval(() => {
      refreshTempCardSettings()
      refreshData()
    }, intervalTime)
    isTimerRunning.value = true
  }
}

/**
 * Stop auto-refresh timer
 */
const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
    isTimerRunning.value = false
  }
}

/**
 * Navigate to card detail page (跳转到卡片详情页)
 * 
 * @param {VitalFocusCard} card - 卡片对象
 * 
 * @description
 * 需要实现逻辑：
 * 1. 跳转到 VitalFocusDetail 页面
 * 2. 传递卡片ID作为路由参数
 * 3. 可能需要传递其他信息（如 tenant_id）
 * 
 * @example
 * // 当前实现（需要确认路由配置）：
 * router.push({
 *   name: 'VitalFocusDetail',
 *   params: { cardId: card.card_id }
 * })
 * 
 * // 如果需要传递更多参数：
 * router.push({
 *   name: 'VitalFocusDetail',
 *   params: {
 *     cardId: card.card_id,
 *     tenantId: card.tenant_id
 *   }
 * })
 * 
 * @todo
 * - 确认 VitalFocusDetail 页面的路由配置（名称和路径）
 * - 创建 VitalFocusDetail 页面组件
 * - 确认参数传递方式（params vs query）
 * - 测试跳转功能
 */
const goDetail = (card: VitalFocusCard) => {
  // 当前实现（占位符，需要确认路由是否存在）
  router.push({
    name: 'VitalFocusDetail',
    params: {
      cardId: card.card_id,
    },
  }).catch((err) => {
    // 如果路由不存在，显示提示
    console.error('Route not found:', err)
    message.warning('Detail page will be implemented soon')
  })
}

/**
 * Get all cards (for SelectCard modal)
 */
const allCards = computed(() => {
  return dataSource.value?.items || []
})

/**
 * Toggle filter (切换过滤器)
 * 仅1个可选中，点击已选中的则取消选中
 */
const toggleFilter = (filterType: string) => {
  if (activeFilter.value === filterType) {
    activeFilter.value = null // 取消选中
  } else {
    activeFilter.value = filterType // 选中
  }
}

/**
 * Get filtered cards (根据当前过滤器过滤卡片)
 */
const filteredCards = computed(() => {
  const cards = dataSource.value?.items || []
  
  if (!activeFilter.value) {
    return cards // 无过滤器，显示所有卡片
  }
  
  switch (activeFilter.value) {
    case 'unhand':
      // 显示有未处理0-1级警报的卡片（icon_alarm是红/橙色的）
      return cards.filter((card) => {
        const threshold = card.icon_alarm_level ?? 3
        const unhandledAlarms = {
          0: card.unhandled_alarm_0 ?? 0,
          1: card.unhandled_alarm_1 ?? 0,
          2: card.unhandled_alarm_2 ?? 0,
          3: card.unhandled_alarm_3 ?? 0,
          4: card.unhandled_alarm_4 ?? 0,
        }
        const highestLevel = getHighestAlarmLevel(unhandledAlarms, threshold)
        return highestLevel >= 0 && highestLevel <= 1 // 0=EMERG, 1=ALERT (红色)
      })
    
    case 'outofroom':
      // 显示离房的卡片（Location卡片且person_count=0）
      return cards.filter((card) => {
        return card.card_type === 'Location' && (card.person_count ?? 0) === 0
      })
    
    case 'leftbed':
      // 显示离床的卡片（bed_status=1）
      return cards.filter((card) => {
        return card.bed_status === 1
      })
    
    case 'visitor':
      // 显示有访客的卡片
      // TODO: 实现访客过滤逻辑（与 visitorCount 使用相同的判断条件）
      // 示例实现（需要根据实际数据结构调整）：
      // return cards.filter((card) => {
      //   return (card.visitor_count ?? 0) > 0
      //   // 或者: return card.visitors?.length > 0
      //   // 或者: return card.residents?.some(r => r.is_visitor === true)
      // })
      return cards.filter((_card) => {
        return false // 占位符，待实现
      })
    
    case 'awake':
      // 显示床上未睡的卡片（bed_status=0且sleep_stage=1）
      return cards.filter((card) => {
        return card.bed_status === 0 && card.sleep_stage === 1
      })
    
    case 'sleep':
      // 显示入睡的卡片（bed_status=0且sleep_stage=2或4）
      return cards.filter((card) => {
        return card.bed_status === 0 && (card.sleep_stage === 2 || card.sleep_stage === 4)
      })
    
    default:
      return cards
  }
})

/**
 * Count statistics (统计数量)
 */
const unhandCount = computed(() => {
  const cards = dataSource.value?.items || []
  return cards.filter((card) => {
    const threshold = card.icon_alarm_level ?? 3
    const unhandledAlarms = {
      0: card.unhandled_alarm_0 ?? 0,
      1: card.unhandled_alarm_1 ?? 0,
      2: card.unhandled_alarm_2 ?? 0,
      3: card.unhandled_alarm_3 ?? 0,
      4: card.unhandled_alarm_4 ?? 0,
    }
    const highestLevel = getHighestAlarmLevel(unhandledAlarms, threshold)
    return highestLevel >= 0 && highestLevel <= 1 // 0=EMERG, 1=ALERT (红色)
  }).length
})

const outofRoomCount = computed(() => {
  const cards = dataSource.value?.items || []
  return cards.filter((card) => {
    return card.card_type === 'Location' && (card.person_count ?? 0) === 0
  }).length
})

const leftBedCount = computed(() => {
  const cards = dataSource.value?.items || []
  return cards.filter((card) => {
    return card.bed_status === 1
  }).length
})

/**
 * Count cards with visitors (统计有访客的卡片数量)
 * 
 * @description
 * 需要实现逻辑：
 * 1. 检查卡片是否有访客数据（需要确认数据结构）
 * 2. 可能的实现方式：
 *    - 如果 VitalFocusCard 中有 visitor_count 字段，则 card.visitor_count > 0
 *    - 如果 VitalFocusCard 中有 visitors 数组，则 card.visitors?.length > 0
 *    - 如果需要在 residents 中区分访客，则 card.residents?.some(r => r.is_visitor === true)
 * 
 * @returns {number} 有访客的卡片数量
 * 
 * @todo
 * - 确认访客数据的存储结构（数据库字段或API返回字段）
 * - 实现访客判断逻辑
 * - 更新 VitalFocusCard 接口定义（如果需要）
 */
const visitorCount = computed(() => {
  const cards = dataSource.value?.items || []
  // TODO: 实现访客统计逻辑
  // 示例实现（需要根据实际数据结构调整）：
  // return cards.filter((card) => {
  //   return (card.visitor_count ?? 0) > 0
  //   // 或者: return card.visitors?.length > 0
  //   // 或者: return card.residents?.some(r => r.is_visitor === true)
  // }).length
  
  // 占位符实现：返回0（待实现）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void cards // 避免未使用变量警告
  return 0
})

const awakeCount = computed(() => {
  const cards = dataSource.value?.items || []
  return cards.filter((card) => {
    return card.bed_status === 0 && card.sleep_stage === 1
  }).length
})

const sleepCount = computed(() => {
  const cards = dataSource.value?.items || []
  return cards.filter((card) => {
    return card.bed_status === 0 && (card.sleep_stage === 2 || card.sleep_stage === 4)
  }).length
})

/**
 * Navigate to AllVitalFocus page (跳转到AllVitalFocus页面)
 * 
 * @param {VitalFocusCard} card - 选中的卡片对象
 * 
 * @description
 * 需要实现逻辑：
 * 1. 跳转到 AllVitalFocus 页面（需要确认路由名称和路径）
 * 2. 传递卡片ID作为参数（可能需要通过 query 或 params）
 * 3. 关闭 SelectCard Modal
 * 
 * @example
 * // 可能的实现方式：
 * router.push({
 *   name: 'AllVitalFocus', // 或 'all-vital-focus'
 *   query: { cardId: card.card_id }
 * })
 * // 或者：
 * router.push({
 *   path: '/monitoring/all-vital-focus',
 *   params: { cardId: card.card_id }
 * })
 * 
 * @todo
 * - 确认 AllVitalFocus 页面的路由配置（名称和路径）
 * - 确认参数传递方式（query vs params）
 * - 实现路由跳转逻辑
 * - 测试跳转功能
 */
const goToAllVitalFocus = (card: VitalFocusCard) => {
  // TODO: 实现跳转到AllVitalFocus页面
  console.log('Navigate to AllVitalFocus for card:', card.card_id, card.card_name)
  
  // 占位符实现
  message.info('AllVitalFocus page will be implemented soon')
  showSelectCardModal.value = false
  
  // 示例实现（需要根据实际路由配置调整）：
  // router.push({
  //   name: 'AllVitalFocus',
  //   query: { cardId: card.card_id }
  // })
  // showSelectCardModal.value = false
}

onMounted(async () => {
  await refreshData()
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.itemFrom {
  padding: 15px;
  background-color: #fff;
  width: 270px;
  height: 240px;
  color: #909399;
  cursor: pointer;
  border-radius: 5px;
  margin: 15px;
  transition: transform 0.1s, box-shadow 0.2s;
  position: relative;
}

.itemFrom:hover {
  transform: scale(1.01) perspective(0px);
  box-shadow: 0 0 6px 3px #999;
}

.color-point {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.status-img {
  border-radius: 50%;
  background-color: #88c7d2;
  color: #116876;
  font-size: 18px;
  margin-right: 10px;
  width: 60px;
  height: 60px;
  text-align: center;
}

.status-item {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.status-number {
  margin-right: 8px;
  font-weight: bold;
  font-size: 36px;
  color: #313330;
}

.number-container {
  position: relative;
}

.status-icon-text {
  font-size: 18px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 15px;
}

.status-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 5px;
  padding-bottom: 5px;
}

.red-floating-bar {
  background-color: #ffcccca0;
  color: #d32f2f;
  border-radius: 10px;
  padding: 5px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  z-index: 999;
}

.red-floating-bar span {
  font-size: 12px;
}

.red-handle-button {
  background-color: #ffffff;
  border: 1px solid #d32f2f;
  border-radius: 5px;
  color: #d32f2f;
  padding: 0px 10px;
  cursor: pointer;
  font-size: 12px;
}

.red-handle-button:hover {
  background-color: #d32f2f;
  color: #ffffff;
}

.yellow-floating-bar {
  background-color: #f1c591c9;
  color: #f3783f;
  border-radius: 10px;
  padding: 5px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  z-index: 999;
}

.yellow-floating-bar span {
  font-size: 12px;
}

.yellow-handle-button {
  background-color: #ffffff;
  border: 1px solid #f3783f;
  border-radius: 5px;
  color: #f3783f;
  padding: 0px 10px;
  cursor: pointer;
  font-size: 12px;
}

.yellow-handle-button:hover {
  background-color: #f3783f;
  color: #ffffff;
}

.apply-button-bar {
  position: absolute;
  bottom: 60px;
  display: flex;
  justify-content: center;
}

.apply-button-bar button {
  background-color: #ffffff00;
  border: 1px solid #5cd7fe;
  border-radius: 5px;
  color: #5cd7fe;
  cursor: pointer;
  font-size: 12px;
  padding: 0px 10px;
}
</style>
