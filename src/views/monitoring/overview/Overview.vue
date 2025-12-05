<template>
  <div style="padding: 15px; background-color: #f4f7f9; min-height: 100vh;">
    <!-- Filter Buttons Row -->
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 15px; padding: 10px; background-color: #fff; border-radius: 4px;">
      <!-- unhandled: display count of unhandled level 0-1 alarms (orange Badge when > 0, gray when = 0) -->
      <a-button
        :type="activeFilter === 'unhandled' ? 'primary' : 'default'"
        @click="toggleFilter('unhandled')"
      >
        unhandled
        <a-badge
          v-if="!activeFilter || activeFilter === 'unhandled'"
          :count="unhandledCount"
          :show-zero="true"
          :number-style="{ backgroundColor: unhandledCount > 0 ? '#ff9800' : '#a9a9a9' }"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- OutofRoom: display count of out of room -->
      <a-button
        :type="activeFilter === 'outofroom' ? 'primary' : 'default'"
        @click="toggleFilter('outofroom')"
      >
        OutofRoom
        <a-badge
          v-if="!activeFilter || activeFilter === 'outofroom'"
          :count="outofRoomCount"
          :show-zero="true"
          :number-style="{ backgroundColor: '#a9a9a9' }"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- LeftBed: display count of left bed -->
      <a-button
        :type="activeFilter === 'leftbed' ? 'primary' : 'default'"
        @click="toggleFilter('leftbed')"
      >
        LeftBed
        <a-badge
          v-if="!activeFilter || activeFilter === 'leftbed'"
          :count="leftBedCount"
          :show-zero="true"
          :number-style="{ backgroundColor: '#a9a9a9' }"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- Visitor: display count of visitors -->
      <a-button
        :type="activeFilter === 'visitor' ? 'primary' : 'default'"
        @click="toggleFilter('visitor')"
      >
        Visitor
        <a-badge
          v-if="!activeFilter || activeFilter === 'visitor'"
          :count="visitorCount"
          :show-zero="true"
          :number-style="{ backgroundColor: '#a9a9a9' }"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- Awake: display count of awake in bed -->
      <a-button
        :type="activeFilter === 'awake' ? 'primary' : 'default'"
        @click="toggleFilter('awake')"
      >
        Awake
        <a-badge
          v-if="!activeFilter || activeFilter === 'awake'"
          :count="awakeCount"
          :show-zero="true"
          :number-style="{ backgroundColor: '#a9a9a9' }"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- Sleep: display count of sleeping -->
      <a-button
        :type="activeFilter === 'sleep' ? 'primary' : 'default'"
        @click="toggleFilter('sleep')"
      >
        Sleep
        <a-badge
          v-if="!activeFilter || activeFilter === 'sleep'"
          :count="sleepCount"
          :show-zero="true"
          :number-style="{ backgroundColor: '#a9a9a9' }"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- Focus: select monitoring cards -->
      <a-button
        type="default"
        @click="showSelectCardModal = true"
      >
        Focus
      </a-button>
      
      <!-- Ambient Rounds: ambient rounds -->
      <a-button
        type="default"
        @click="handleAmbientRounds"
      >
        Ambient Rounds
      </a-button>
    </div>
    
    <!-- Focus Modal -->
    <a-modal
      v-model:visible="showSelectCardModal"
      title="Focus"
      :width="600"
      :footer="null"
      @open="onFocusModalOpen"
      @cancel="onFocusModalCancel"
    >
      <!-- All/Invert/Save buttons -->
      <div style="margin-bottom: 12px; display: flex; gap: 8px;">
        <a-button size="small" @click="selectAllCards">all</a-button>
        <a-button size="small" @click="invertCardSelection">Invert</a-button>
        <a-button type="primary" size="small" @click="saveFocusSelection" :loading="savingFocus">
          Save
        </a-button>
      </div>
      
      <div style="max-height: 400px; overflow-y: auto;">
        <div
          v-for="card in allCards"
          :key="card.card_id"
          style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #f0f0f0; cursor: pointer;"
          @click="toggleCardSelection(card.card_id)"
        >
          <div>
            <div style="font-weight: 500;">{{ card.card_name }}</div>
            <div style="font-size: 12px; color: #999;">{{ card.card_address }}</div>
          </div>
          <a-checkbox :checked="tempSelectedCardIds.includes(card.card_id)" @click.stop="toggleCardSelection(card.card_id)" />
        </div>
      </div>
    </a-modal>
    
    <!-- Empty state for SystemAdmin (no card permissions) -->
    <div v-if="filteredCards.length === 0 && isSystemAdmin" style="padding: 40px; text-align: center; background-color: #fff; border-radius: 4px; margin: 15px;">
      <div style="font-size: 18px; color: #666; margin-bottom: 10px;">
        No cards available
      </div>
      <div style="font-size: 14px; color: #999;">
        SystemAdmin role does not have card permissions. Please contact your administrator if you need access to card data.
      </div>
    </div>
    
    <!-- Empty state for other roles (no cards found) -->
    <div v-else-if="filteredCards.length === 0" style="padding: 40px; text-align: center; background-color: #fff; border-radius: 4px; margin: 15px;">
      <div style="font-size: 18px; color: #666; margin-bottom: 10px;">
        No cards found
      </div>
      <div style="font-size: 14px; color: #999;">
        Try adjusting your filters or contact support if you believe this is an error.
      </div>
    </div>
    
    <div v-else style="display: flex; flex-wrap: wrap; justify-content: flex-start; align-items: center">
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
            <!-- Alarm Status Icon (top-right icon) - click to navigate to detail page -->
            <div 
              :style="{ fontSize: '20px', color: getIconAlarmColor(item), cursor: 'pointer' }"
              @click.stop="goDetail(item)"
              :title="'Click to view details'"
            >
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
                    <!-- Sleep Stage (display different states based on sleep_stage, consistent with v1.0) -->
                    <div>
                      <div v-if="item.sleep_stage === 1" style="font-size: 30px">
                        <img src="@/assets/images/awake.gif" style="margin-right: 10px" />
                      </div>
                      <div v-else-if="item.sleep_stage === 2" style="font-size: 30px">
                        <img
                          src="@/assets/images/light_sleep.gif"
                          style="margin-right: 10px"
                        />
                      </div>
                      <div v-else-if="item.sleep_stage === 4" style="font-size: 30px">
                        <img
                          src="@/assets/images/deep_sleep.gif"
                          style="margin-right: 10px"
                        />
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
                          <span v-if="item?.heart_source && item.heart_source !== '-'" class="number-badge">{{ item.heart_source }}</span>
                        </div>
                        <span> bpm</span>
                      </div>
                      <div class="status-item">
                        <img :src="getBreathImgUrl(item?.breath || 0)" style="margin-right: 10px; width: 20px; height: 20px;" />
                        <div class="number-container">
                          <span class="status-number">{{
                            item?.breath && item.breath > 0 && item.breath < 255 ? item.breath : '--'
                          }}</span>
                          <span v-if="item?.breath_source && item.breath_source !== '-'" class="number-badge">{{ item.breath_source }}</span>
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
              <!-- Postures (posture data) - displayed on right side (consistent with v1.0) -->
              <div
                v-if="(item.person_count ?? 0) > 0 && item.postures && item.postures.length > 0"
                style="display: flex; flex-direction: column; align-items: center"
              >
                <div v-for="posture in item.postures" :key="posture">
                  <img v-if="posture === 1" src="@/assets/images/walk.png" class="posture-img" />
                  <img
                    v-else-if="posture === 2"
                    src="@/assets/images/suspected-fall.png"
                    class="posture-img"
                  />
                  <img
                    v-else-if="posture === 3"
                    src="@/assets/images/sitting.svg"
                    class="posture-img"
                  />
                  <img
                    v-else-if="posture === 4"
                    src="@/assets/images/stand.png"
                    class="posture-img"
                  />
                  <img
                    v-else-if="posture === 5"
                    src="@/assets/images/fall.png"
                    class="posture-img"
                  />
                  <img
                    v-else-if="posture === 6"
                    src="@/assets/images/lying.svg"
                    class="posture-img"
                  />
                  <img v-else src="@/assets/images/unknown.png" class="posture-img" />
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
              <div>{{ item.bed_status_timestamp || '-' }}</div>
            </div>
            <div class="status-time">
              <div>
                <div v-if="item.bed_status === 1">Out of bed</div>
                <div v-else-if="item.bed_status === 0">Awake</div>
                <div v-else>Analysing</div>
              </div>
              <div>{{ item.status_duration || '-' }}</div>
            </div>
          </div>
        </div>
        <!-- Location Cards: Person Count and Postures (consistent with v1.0) -->
        <div v-else style="display: flex; flex-direction: column; align-items: center">
          <div style="font-size: 18px">{{ item.person_count ?? 0 }} Person</div>
          <div
            v-if="(item.person_count ?? 0) > 0 && item.postures && item.postures.length > 0"
            style="display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; max-width: 240px; max-height: 110px; overflow: hidden;"
          >
            <template v-for="(posture, index) in item.postures" :key="index">
              <img v-if="posture === 1" src="@/assets/images/walk.png" style="width: 50px; height: 50px;" />
              <img
                v-else-if="posture === 2"
                src="@/assets/images/suspected-fall.png"
                style="width: 50px; height: 50px;"
              />
              <img
                v-else-if="posture === 3"
                src="@/assets/images/sitting.png"
                style="width: 50px; height: 50px;"
              />
              <img v-else-if="posture === 4" src="@/assets/images/stand.png" style="width: 50px; height: 50px;" />
              <img v-else-if="posture === 5" src="@/assets/images/fall.png" style="width: 50px; height: 50px;" />
              <img v-else-if="posture === 6" src="@/assets/images/lying.png" style="width: 50px; height: 50px;" />
              <img v-else src="@/assets/images/unknown.png" style="width: 50px; height: 50px;" />
            </template>
          </div>
        </div>

        <!-- Section 3: Event & Alert - Alarm Bar (bottom popup item) -->
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
import { useUserStore } from '@/store/modules/user'
import type { GetVitalFocusCardsModel, VitalFocusCard } from '@/api/monitors/model/monitorModel'
import { getVitalFocusCardsApi, saveVitalFocusSelectionApi } from '@/api/monitors/monitor'
// Note: API functions still use 'vitalFocus' naming for backend compatibility
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

const router = useRouter()
const userStore = useUserStore()
const dataSource = ref<GetVitalFocusCardsModel>()
const intervalTime = 3 * 1000 // 3 seconds
let timer: ReturnType<typeof setInterval> | null = null
const isTimerRunning = ref(false)

// Check if current user is SystemAdmin
const isSystemAdmin = computed(() => {
  const userInfo = userStore.getUserInfo
  return userInfo?.role === 'SystemAdmin'
})

// Filter state
const activeFilter = ref<string | null>(null) // 'unhandled' | 'outofroom' | 'leftbed' | 'visitor' | 'awake' | 'sleep' | null
const showSelectCardModal = ref(false)

// Selected card IDs (all cards selected by default)
const selectedCardIds = ref<string[]>([]) // Saved selection (loaded from localStorage)
const tempSelectedCardIds = ref<string[]>([]) // Temporary selection (selection in Modal, not saved)
const savingFocus = ref(false) // Saving state

// localStorage key for Focus selection state
const FOCUS_SELECTED_CARDS_KEY = 'wellnessMonitor_selectedCardIds'

/**
 * Load selected card IDs from localStorage
 */
const loadSelectedCardIds = () => {
  try {
    const saved = localStorage.getItem(FOCUS_SELECTED_CARDS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        selectedCardIds.value = parsed
      }
    }
  } catch (error) {
    console.error('Failed to load selected card IDs from localStorage:', error)
  }
}

/**
 * Save selected card IDs to localStorage
 */
const saveSelectedCardIds = () => {
  try {
    localStorage.setItem(FOCUS_SELECTED_CARDS_KEY, JSON.stringify(selectedCardIds.value))
  } catch (error) {
    console.error('Failed to save selected card IDs to localStorage:', error)
  }
}

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
 * Apply temporary settings
 * 
 * @param {string} cardId - Card ID
 * 
 * @description
 * Logic to implement:
 * 1. Call backend API to save card settings (cardSettings)
 * 2. Sync temporary settings (tempCardSettings) to persistent settings (cardSettings)
 * 3. Clear temporary settings
 * 4. Handle API call success/failure cases
 * 
 * @example
 * // Possible implementation:
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
 * - Create API function to save card settings (saveCardSettingsApi)
 * - Implement API call logic
 * - Add success/failure prompts
 * - Add error handling
 * - Confirm API interface definition (request parameters, response format)
 */
const applyTemporarySettings = (cardId: string) => {
  // TODO: Implement API call to save settings
  if (cardId in tempCardSettings.value && tempCardSettings.value[cardId]) {
    // Placeholder implementation: only sync to local settings, don't call API
    cardSettings.value[cardId] = tempCardSettings.value[cardId].value
    delete tempCardSettings.value[cardId]
    
    // Example implementation (needs adjustment based on actual API):
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
 * Get icon alarm color (top-right icon color)
 * Display color based on highest level unhandled alarm (considering icon_alarm_level threshold)
 */
const getIconAlarmColor = (card: VitalFocusCard): string => {
  const threshold = card.icon_alarm_level ?? 3 // Default 3 (ERR)
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
 * Get latest pop alarm
 * Filter based on pop_alarm_emerge threshold, return the latest alarm
 */
const getLatestPopAlarm = (card: VitalFocusCard) => {
  const threshold = card.pop_alarm_emerge ?? 0 // Default 0 (EMERG)
  
  if (!card.alarms || card.alarms.length === 0) {
    return null
  }
  
  // Filter: only keep alarms with active status and level <= threshold
  const filteredAlarms = card.alarms
    .filter((alarm) => alarm.alarm_status === 'active')
    .filter((alarm) => {
      const level = parseAlarmLevel(alarm.alarm_level)
      return level <= threshold && level >= 0 && level <= 4
    })
    .sort((a, b) => b.triggered_at - a.triggered_at) // Sort by time descending
  
  return filteredAlarms.length > 0 ? filteredAlarms[0] : null
}

/**
 * Get latest pop alarm level
 */
const getLatestPopAlarmLevel = (card: VitalFocusCard): number => {
  const alarm = getLatestPopAlarm(card)
  if (!alarm) {
    return -1
  }
  return parseAlarmLevel(alarm.alarm_level)
}

/**
 * Get latest pop alarm type name
 */
const getLatestPopAlarmTypeName = (card: VitalFocusCard): string => {
  const alarm = getLatestPopAlarm(card)
  if (!alarm) {
    return ''
  }
  return formatAlarmTypeToString(alarm.event_type)
}

/**
 * Handle alarm
 * 
 * @param {VitalFocusCard} item - Card object
 * @param {any} [alarm] - Optional alarm object, if not provided use latest pop alarm
 * 
 * @description
 * Logic to implement:
 * 1. Open alarm handling modal
 * 2. Display alarm details (event_type, alarm_level, triggered_at, etc.)
 * 3. Provide handling action buttons (e.g., confirm, ignore, transfer, etc.)
 * 4. Call backend API to update alarm status (alarm_status: 'active' -> 'acknowledged')
 * 5. Refresh card data after successful handling
 * 
 * @example
 * // Possible implementation:
 * const showAlarmModal = ref(false)
 * const currentAlarm = ref(null)
 * 
 * const handleAlarm = (item, alarm) => {
 *   currentAlarm.value = alarm || getLatestPopAlarm(item)
 *   showAlarmModal.value = true
 * }
 * 
 * // Call API in Modal:
 * const acknowledgeAlarm = async (eventId) => {
 *   await acknowledgeAlarmApi(eventId)
 *   await refreshData()
 * }
 * 
 * @todo
 * - Create alarm handling Modal component
 * - Implement alarm details display
 * - Implement alarm handling API call (acknowledgeAlarmApi)
 * - Implement data refresh after handling
 * - Add error handling
 */
const handleAlarm = (item: VitalFocusCard, alarm?: any) => {
  // TODO: Implement alarm handling modal
  const targetAlarm = alarm || getLatestPopAlarm(item)
  console.log('Handle alarm for card:', item.card_id, 'alarm:', targetAlarm)
  
  // Placeholder implementation
  message.info('Alarm handling feature will be implemented soon')
  
  // Example implementation (needs adjustment based on actual requirements):
  // if (!targetAlarm) {
  //   message.warning('No alarm to handle')
  //   return
  // }
  // 
  // // Open alarm handling Modal
  // currentAlarm.value = targetAlarm
  // showAlarmModal.value = true
}

/**
 * Refresh data from API
 */
const refreshData = async () => {
  try {
    const data = await getVitalFocusCardsApi('none')
    
    // Process data similar to v1.0: extract fields from statuses object if needed
    // Note: If backend returns data directly (not in statuses), this processing may not be needed
    // But we ensure heart_source and breath_source are lowercase 's' or 'r' as in v1.0
    if (data?.items) {
      data.items.forEach((item: any) => {
        // If backend returns statuses object (like v1.0), extract from it
        // Otherwise, use direct fields (v1.5 structure)
        if (item.statuses && typeof item.statuses === 'object') {
          // Extract from statuses object (v1.0 style)
          item.heart = item.statuses.heart || item.heart || 0
          item.breath = item.statuses.breath || item.breath || 0
          item.heart_source = item.statuses.heartSource || item.statuses.heart_source || item.heart_source || '-'
          item.breath_source = item.statuses.breathSource || item.statuses.breath_source || item.breath_source || '-'
          item.bed_status = item.statuses.bedStatus || item.statuses.bed_status || item.bed_status
          item.sleep_stage = item.statuses.sleepStage || item.statuses.sleep_stage || item.sleep_stage
          item.timestamp = item.statuses.timestamp || item.timestamp
          item.person_count = item.statuses.personCount || item.statuses.person_count || item.person_count
          
          // Process postures (may come as comma-separated string)
          if (item.statuses.postures) {
            if (typeof item.statuses.postures === 'string') {
              item.postures = item.statuses.postures.split(',').map(Number)
            } else if (Array.isArray(item.statuses.postures)) {
              item.postures = item.statuses.postures
            }
          }
        }
        
        // Ensure heart_source and breath_source are lowercase 's' or 'r' (as in v1.0)
        // '-' means no data, keep it as is
        if (item.heart_source && item.heart_source !== '-') {
          item.heart_source = item.heart_source.toLowerCase().charAt(0) // 's' or 'r'
        }
        if (item.breath_source && item.breath_source !== '-') {
          item.breath_source = item.breath_source.toLowerCase().charAt(0) // 's' or 'r'
        }
      })
    }
    
    dataSource.value = data
    
    // Initialize selected state:
    // 1. First try to load from localStorage
    loadSelectedCardIds()
    
    // 2. If no saved selection and currently no cards selected, default to select all cards
    if (data?.items && selectedCardIds.value.length === 0) {
      selectedCardIds.value = data.items.map((item: VitalFocusCard) => item.card_id)
      saveSelectedCardIds() // Save default selection
    } else if (data?.items) {
      // If there's a saved selection but data updated (may have new cards), add new cards to selected list
      const currentCardIds = data.items.map((item: VitalFocusCard) => item.card_id)
      const newCardIds = currentCardIds.filter((id: string) => !selectedCardIds.value.includes(id))
      if (newCardIds.length > 0) {
        selectedCardIds.value = [...selectedCardIds.value, ...newCardIds]
        saveSelectedCardIds()
      }
    }
  } catch (error: any) {
    console.error('Failed to fetch wellness monitor cards:', error)
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
 * Handle Ambient Rounds button click
 * 
 * @todo Implement ambient rounds functionality
 */
const handleAmbientRounds = () => {
  // TODO: Implement ambient rounds functionality
  console.log('Ambient Rounds clicked')
}

/**
 * Navigate to card detail page
 * 
 * @param {VitalFocusCard} card - Card object
 * 
 * @description
 * Logic to implement:
 * 1. Navigate to WellnessMonitorDetail page
 * 2. Pass card ID as route parameter
 * 3. May need to pass other information (e.g., tenant_id)
 * 
 * @example
 * // Current implementation (need to confirm route configuration):
 * router.push({
 *   name: 'WellnessMonitorDetail',
 *   params: { cardId: card.card_id }
 * })
 * 
 * // If need to pass more parameters:
 * router.push({
 *   name: 'WellnessMonitorDetail',
 *   params: {
 *     cardId: card.card_id,
 *     tenantId: card.tenant_id
 *   }
 * })
 * 
 * @todo
 * - Confirm WellnessMonitorDetail page route configuration (name and path)
 * - Create WellnessMonitorDetail page component
 * - Confirm parameter passing method (params vs query)
 * - Test navigation functionality
 */
const goDetail = (card: VitalFocusCard) => {
  router.push({
    name: 'CardDetail',
    params: {
      cardId: card.card_id,
    },
  }).catch((err) => {
    console.error('Route not found:', err)
    message.warning('Detail page will be implemented soon')
  })
}

/**
 * Get all cards (for Focus modal)
 */
const allCards = computed(() => {
  return dataSource.value?.items || []
})

/**
 * Toggle card selection
 * Currently only updates temporary selection, doesn't save immediately
 */
const toggleCardSelection = (cardId: string) => {
  const index = tempSelectedCardIds.value.indexOf(cardId)
  if (index > -1) {
    tempSelectedCardIds.value.splice(index, 1)
  } else {
    tempSelectedCardIds.value.push(cardId)
  }
}

/**
 * Select all cards
 * Immediately save to localStorage and submit to server
 */
const selectAllCards = () => {
  tempSelectedCardIds.value = allCards.value.map(card => card.card_id)
  // Immediately save (local takes effect + submit to server)
  saveFocusSelectionImmediately()
}

/**
 * Invert card selection
 * Immediately save to localStorage and submit to server
 */
const invertCardSelection = () => {
  const allCardIds = allCards.value.map(card => card.card_id)
  tempSelectedCardIds.value = allCardIds.filter(id => !tempSelectedCardIds.value.includes(id))
  // Immediately save (local takes effect + submit to server)
  saveFocusSelectionImmediately()
}

/**
 * Immediately save Focus selection (no loading display, silent save)
 * Used for all and Invert operations
 */
const saveFocusSelectionImmediately = () => {
  // 1. Immediately save to localStorage and update selectedCardIds (local takes effect immediately)
  selectedCardIds.value = [...tempSelectedCardIds.value]
  saveSelectedCardIds()
  
  // 2. Asynchronously submit to server (doesn't block UI, no loading display)
  saveVitalFocusSelectionApi({
    selected_card_ids: tempSelectedCardIds.value,
  })
    .then(() => {
      // Silent success, don't show message (avoid too many messages during frequent operations)
      console.log('Focus selection saved to server')
    })
    .catch((error: any) => {
      console.error('Failed to save focus selection to server:', error)
      // Silent failure, don't show warning (avoid too many messages during frequent operations)
    })
}

/**
 * Focus Modal open handler
 * Copy saved selection to temporary selection
 * If no saved selection, default to select all cards
 */
const onFocusModalOpen = () => {
  // When opening Modal, copy saved selection to temporary selection
  if (selectedCardIds.value.length > 0) {
    tempSelectedCardIds.value = [...selectedCardIds.value]
  } else {
    // If no saved selection, default to select all cards
    tempSelectedCardIds.value = allCards.value.map(card => card.card_id)
  }
}

/**
 * Focus Modal cancel handler
 * Restore temporary selection (don't save)
 */
const onFocusModalCancel = () => {
  // When canceling, restore temporary selection to saved selection
  tempSelectedCardIds.value = [...selectedCardIds.value]
}

/**
 * Save focus selection
 * Save to localStorage and submit to server
 */
const saveFocusSelection = async () => {
  savingFocus.value = true
  try {
    // 1. Immediately save to localStorage and update selectedCardIds (local takes effect immediately)
    selectedCardIds.value = [...tempSelectedCardIds.value]
    saveSelectedCardIds()
    
    // Note: After selectedCardIds is updated, filteredCards will automatically update (because it's computed)
    // So the page will immediately display the updated card list
    
    // 2. Asynchronously submit to server (doesn't block UI)
    saveVitalFocusSelectionApi({
      selected_card_ids: tempSelectedCardIds.value,
    })
      .then(() => {
        message.success('Focus selection saved successfully')
      })
      .catch((error: any) => {
        console.error('Failed to save focus selection to server:', error)
        // Even if server save fails, local has already taken effect, only show warning
        message.warning('Saved locally, but failed to sync to server. Please try again later.')
      })
    
    // Note: Don't close Modal, user can continue operating
  } catch (error: any) {
    console.error('Failed to save focus selection:', error)
    message.error(error?.message || 'Failed to save focus selection')
  } finally {
    savingFocus.value = false
  }
}

/**
 * Toggle filter
 * Only one can be selected, clicking the selected one will deselect it
 */
const toggleFilter = (filterType: string) => {
  if (activeFilter.value === filterType) {
    activeFilter.value = null // Deselect
  } else {
    activeFilter.value = filterType // Select
  }
}

/**
 * Get filtered cards
 * Also apply Focus selection filter (only show selected cards)
 */
const filteredCards = computed(() => {
  let cards = dataSource.value?.items || []
  
  // First apply Focus selection filter: only show selected cards
  if (selectedCardIds.value.length > 0) {
    cards = cards.filter((card) => selectedCardIds.value.includes(card.card_id))
  }
  
  // Then apply other filters (unhandled, outofroom, leftbed, visitor, awake, sleep)
  if (!activeFilter.value) {
    return cards // No filter, show all selected cards
  }
  
  switch (activeFilter.value) {
    case 'unhandled':
      // Show cards with unhandled level 0-1 alarms (icon_alarm is red/orange)
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
        return highestLevel >= 0 && highestLevel <= 1 // 0=EMERG, 1=ALERT (red)
      })
    
    case 'outofroom':
      // Show out of room cards (Location cards with person_count=0)
      return cards.filter((card) => {
        return card.card_type === 'Location' && (card.person_count ?? 0) === 0
      })
    
    case 'leftbed':
      // Show left bed cards (bed_status=1)
      return cards.filter((card) => {
        return card.bed_status === 1
      })
    
    case 'visitor':
      // Show cards with visitors
      // TODO: Implement visitor filter logic (use same condition as visitorCount)
      // Example implementation (needs adjustment based on actual data structure):
      // return cards.filter((card) => {
      //   return (card.visitor_count ?? 0) > 0
      //   // Or: return card.visitors?.length > 0
      //   // Or: return card.residents?.some(r => r.is_visitor === true)
      // })
      return cards.filter((_card) => {
        return false // Placeholder, to be implemented
      })
    
    case 'awake':
      // Show awake in bed cards (bed_status=0 and sleep_stage=1)
      return cards.filter((card) => {
        return card.bed_status === 0 && card.sleep_stage === 1
      })
    
    case 'sleep':
      // Show sleeping cards (bed_status=0 and sleep_stage=2 or 4)
      return cards.filter((card) => {
        return card.bed_status === 0 && (card.sleep_stage === 2 || card.sleep_stage === 4)
      })
    
    default:
      return cards
  }
})

/**
 * Count statistics
 */
const unhandledCount = computed(() => {
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
    return highestLevel >= 0 && highestLevel <= 1 // 0=EMERG, 1=ALERT (red)
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
 * Count cards with visitors
 * 
 * @description
 * Logic to implement:
 * 1. Check if card has visitor data (need to confirm data structure)
 * 2. Possible implementation methods:
 *    - If VitalFocusCard has visitor_count field, then card.visitor_count > 0
 *    - If VitalFocusCard has visitors array, then card.visitors?.length > 0
 *    - If need to distinguish visitors in residents, then card.residents?.some(r => r.is_visitor === true)
 * 
 * @returns {number} Number of cards with visitors
 * 
 * @todo
 * - Confirm visitor data storage structure (database field or API return field)
 * - Implement visitor judgment logic
 * - Update VitalFocusCard interface definition (if needed)
 */
const visitorCount = computed(() => {
  const cards = dataSource.value?.items || []
  // TODO: Implement visitor statistics logic
  // Example implementation (needs adjustment based on actual data structure):
  // return cards.filter((card) => {
  //   return (card.visitor_count ?? 0) > 0
  //   // Or: return card.visitors?.length > 0
  //   // Or: return card.residents?.some(r => r.is_visitor === true)
  // }).length
  
  // Placeholder implementation: return 0 (to be implemented)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void cards // Avoid unused variable warning
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
 * Navigate to AllWellnessMonitor page
 * 
 * @param {VitalFocusCard} card - Selected card object
 * 
 * @description
 * Logic to implement:
 * 1. Navigate to AllWellnessMonitor page (need to confirm route name and path)
 * 2. Pass card ID as parameter (may need to use query or params)
 * 3. Close SelectCard Modal
 * 
 * @example
 * // Possible implementation:
 * router.push({
 *   name: 'AllWellnessMonitor', // or 'all-wellness-monitor'
 *   query: { cardId: card.card_id }
 * })
 * // Or:
 * router.push({
 *   path: '/monitoring/all-wellness-monitor',
 *   params: { cardId: card.card_id }
 * })
 * 
 * @todo
 * - Confirm AllWellnessMonitor page route configuration (name and path)
 * - Confirm parameter passing method (query vs params)
 * - Implement route navigation logic
 * - Test navigation functionality
 */
onMounted(async () => {
  // First load saved selection state
  loadSelectedCardIds()
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

.number-badge {
  font-size: 14px;
  color: #a2afb58a;
  position: absolute;
  right: 3px;
  bottom: 8px;
}

.posture-img {
  width: 30px;
  height: 30px;
  margin-right: 4px;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
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
