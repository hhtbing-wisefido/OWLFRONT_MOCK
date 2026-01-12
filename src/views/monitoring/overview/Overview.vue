<template>
  <div class="overview-container">
    <!-- Draggable FDA & HIPAA Compliance Watermark for Marketing Materials -->
    <div 
      ref="watermarkRef"
      class="compliance-watermark"
      @mousedown="startDrag"
      @touchstart="startDrag"
      :style="{
        top: watermarkPosition.y + 'px',
        left: watermarkPosition.x + 'px',
        cursor: isDragging ? 'grabbing' : 'grab'
      }"
    >
      <div class="watermark-title">
        ✓ DEMO SYSTEM
      </div>
      <div class="watermark-text">
        Simulated data • NOT A MEDICAL DEVICE<br/>
        For general wellness purposes only
      </div>
    </div>
    
    <!-- Filter Buttons Row -->
    <div class="filter-buttons-row">
      <!-- Privacy-sensitive status filters: Only visible to staff login (not resident) -->
      <!-- unhandled: display count of unhandled level 0-1 alarms (orange Badge when > 0, gray when = 0) -->
      <a-button
        v-if="shouldShowStatusFilters"
        :type="activeFilter === 'unhandled' ? 'primary' : 'default'"
        @click="toggleFilter('unhandled')"
      >
        unhandled
        <a-badge
          :count="unhandledCount"
          :show-zero="true"
          :number-style="{ backgroundColor: unhandledCount > 0 ? '#ff9800' : '#a9a9a9' }"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- OutofRoom: display count of out of room (lazy calculation, gray when not calculated) -->
      <a-button
        v-if="shouldShowStatusFilters"
        :type="activeFilter === 'outofroom' ? 'primary' : 'default'"
        :style="{ backgroundColor: outofRoomCount === null ? '#f5f5f5' : undefined, color: outofRoomCount === null ? '#999' : undefined }"
        @click="toggleFilter('outofroom')"
      >
        OutofRoom
        <a-badge
          :count="outofRoomCount ?? 0"
          :show-zero="true"
          :number-style="{ backgroundColor: '#a9a9a9' }"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- LeftBed: display count of left bed (lazy calculation, gray when not calculated) -->
      <a-button
        v-if="shouldShowStatusFilters"
        :type="activeFilter === 'leftbed' ? 'primary' : 'default'"
        :style="{ backgroundColor: leftBedCount === null ? '#f5f5f5' : undefined, color: leftBedCount === null ? '#999' : undefined }"
        @click="toggleFilter('leftbed')"
      >
        LeftBed
        <a-badge
          :count="leftBedCount ?? 0"
          :show-zero="true"
          :number-style="{ backgroundColor: '#a9a9a9' }"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- Visitor: display count of visitors (lazy calculation, gray when not calculated) -->
      <a-button
        v-if="shouldShowStatusFilters"
        :type="activeFilter === 'visitor' ? 'primary' : 'default'"
        :style="{ backgroundColor: visitorCount === null ? '#f5f5f5' : undefined, color: visitorCount === null ? '#999' : undefined }"
        @click="toggleFilter('visitor')"
      >
        Visitor
        <a-badge
          :count="visitorCount ?? 0"
          :show-zero="true"
          :number-style="{ backgroundColor: '#a9a9a9' }"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- Awake: display count of awake in bed (lazy calculation, gray when not calculated) -->
      <a-button
        v-if="shouldShowStatusFilters"
        :type="activeFilter === 'awake' ? 'primary' : 'default'"
        :style="{ backgroundColor: awakeCount === null ? '#f5f5f5' : undefined, color: awakeCount === null ? '#999' : undefined }"
        @click="toggleFilter('awake')"
      >
        Awake
        <a-badge
          :count="awakeCount ?? 0"
          :show-zero="true"
          :number-style="{ backgroundColor: '#a9a9a9' }"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- Sleep: display count of sleeping (lazy calculation, gray when not calculated) -->
      <a-button
        v-if="shouldShowStatusFilters"
        :type="activeFilter === 'sleep' ? 'primary' : 'default'"
        :style="{ backgroundColor: sleepCount === null ? '#f5f5f5' : undefined, color: sleepCount === null ? '#999' : undefined }"
        @click="toggleFilter('sleep')"
      >
        Sleep
        <a-badge
          :count="sleepCount ?? 0"
          :show-zero="true"
          :number-style="{ backgroundColor: '#a9a9a9' }"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- Focus: select monitoring cards (only for staff) -->
      <a-button
        v-if="shouldShowStatusFilters"
        type="default"
        @click="showSelectCardModal = true"
      >
        Focus
        <a-badge
          :count="focusCount"
          :show-zero="true"
          :number-style="{ backgroundColor: '#1890ff' }"
          style="margin-left: 8px"
        />
      </a-button>
      
      <!-- Ambient Rounds: ambient rounds (only for staff) -->
      <a-button
        v-if="shouldShowStatusFilters"
        type="default"
        @click="handleAmbientRounds"
      >
        Ambient Rounds
      </a-button>
      
      <!-- Sound Toggle: enable/disable alarm sound (right-click to test) -->
      <a-button
        v-if="shouldShowStatusFilters"
        :type="isSoundEnabled ? 'primary' : 'default'"
        @click="toggleSound"
        @contextmenu.prevent="testAlarmSound"
        :style="{ 
          backgroundColor: isSoundEnabled ? '#52c41a' : undefined,
          borderColor: isSoundEnabled ? '#52c41a' : undefined
        }"
        title="Left-click: toggle sound | Right-click: test sound"
      >
        {{ isSoundEnabled ? '🔊 Sound On' : '🔇 Sound Off' }}
      </a-button>
    </div>
    
    <!-- Focus Modal -->
    <a-modal
      v-model:visible="showSelectCardModal"
      title="Focus"
      :width="600"
      :footer="null"
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
    
    <div v-else class="cards-container" @dragover.prevent @drop="handleDrop">
      <div 
        class="itemFrom" 
        :class="{ 
          'dragging': draggedCardId === item.card_id,
          'drop-target': dropTargetIndex === index && draggedCardId !== item.card_id,
          'has-alarm-bar': getLatestPopAlarm(item)
        }"
        @click="goDetail(item)" 
        v-for="(item, index) in orderedCards" 
        :key="item.card_id"
        draggable="true"
        @dragstart="handleDragStart($event, item, index)"
        @dragend="handleDragEnd"
        @dragover.prevent
        @dragenter.prevent="handleDragEnter($event, index)"
      >
        <!-- Section 1: Head - Name, Address, Alert Status -->
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
            <!-- Alert Status Icon (top-right icon) - click to navigate to detail page -->
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
                <div v-if="item.bed_status === 1" style="display: flex; align-items: center;">
                  <img src="@/assets/images/Outofbed.png" class="status-img" />
                  <span style="font-size: 18px;">Not in Bed</span>
                </div>
                <!-- In Bed: Sleep Status and Vital Signs -->
                <div v-else class="inbed-vitals-row">
                  <!-- 左边：睡眠状态图标 -->
                  <div class="sleep-icon-container">
                    <img v-if="item.sleep_stage === 1" src="@/assets/images/awake.gif" class="status-img" />
                    <img v-else-if="item.sleep_stage === 2" src="@/assets/images/light_sleep.gif" class="status-img" />
                    <img v-else-if="item.sleep_stage === 4" src="@/assets/images/deep_sleep.gif" class="status-img" />
                    <img v-else src="@/assets/images/Analysing_sleep_state.png" class="status-img" />
                  </div>
                  <!-- 中间：心率呼吸数值 -->
                  <div v-if="needShowDetailNumbers(item.card_id)" class="vitals-detail-container" title="Click to hide details" @click.stop="hideDetailNumbersTemporarily(item.card_id)">
                    <div class="status-item vitals-row-heart">
                      <img :src="getHeartImgUrl(item?.heart || 0)" class="vitals-icon-small" />
                      <div class="number-container">
                        <span class="status-number">{{
                          item?.heart && item.heart > 0 && item.heart < 255 ? item.heart : '--'
                        }}</span>
                        <span v-if="item?.heart_source && item.heart_source !== '-'" class="number-badge">{{ item.heart_source }}</span>
                      </div>
                      <span class="vitals-unit">bpm</span>
                    </div>
                    <div class="status-item">
                      <img :src="getBreathImgUrl(item?.breath || 0)" class="vitals-icon-small" />
                      <div class="number-container">
                        <span class="status-number">{{
                          item?.breath && item.breath > 0 && item.breath < 255 ? item.breath : '--'
                        }}</span>
                        <span v-if="item?.breath_source && item.breath_source !== '-'" class="number-badge">{{ item.breath_source }}</span>
                      </div>
                      <span class="vitals-unit">rpm</span>
                    </div>
                  </div>
                  <div v-else class="vitals-icons-only" title="Click to show details" @click.stop="showDetailNumbersTemporarily(item.card_id)">
                    <div class="status-item">
                      <img :src="getHeartImgUrl(item?.heart || 0)" class="vitals-icon-large" />
                    </div>
                    <div class="status-item">
                      <img :src="getBreathImgUrl(item?.breath || 0)" class="vitals-icon-large" />
                    </div>
                  </div>
                </div>
                <!-- Save change 按钮独立行 -->
                <div v-if="item.bed_status !== 1 && usingTemporarySettings(item.card_id)" class="apply-button-bar">
                  <button class="apply-button" @click.stop="applyTemporarySettings(item.card_id)" :title="needShowDetailNumbers(item.card_id) ? 'Always show details' : 'Always hide details'">Save change</button>
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
                <div v-else-if="item.bed_status === 0 && item.sleep_stage === 1">Awake</div>
                <div v-else-if="item.bed_status === 0 && item.sleep_stage === 2">Light Sleep</div>
                <div v-else-if="item.bed_status === 0 && item.sleep_stage === 4">Deep Sleep</div>
                <div v-else>Analysing</div>
              </div>
              <div>{{ item.status_duration || '-' }}</div>
            </div>
          </div>
        </div>
        <!-- Location Cards: Person Count and Postures (consistent with v1.0) -->
        <div v-else style="display: flex; flex-direction: column; align-items: center;">
          <div style="font-size: 18px">{{ item.person_count ?? 0 }} Person</div>
          <div
            v-if="(item.person_count ?? 0) > 0 && item.postures && item.postures.length > 0"
            style="display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; max-width: 240px; max-height: 110px; overflow: hidden; margin-top: 20px;"
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

        <!-- Section 3: Event & Notification - Notification Bar (bottom popup item) -->
        <!-- UL 2560 Compliant: Level 0-1 (Urgent-Red), Level 2-4 (Notice-Yellow/Orange) -->
        <div v-if="getLatestPopAlarm(item)">
          <div
            v-if="getLatestPopAlarmLevel(item) <= 1"
            class="red-floating-bar"
          >
            <span class="alarm-text">🔔 {{ getLatestPopAlarmTypeName(item) }} - Urgent</span>
            <button class="red-handle-button" @click.stop="handleAlarm(item, getLatestPopAlarm(item))">Respond</button>
          </div>
          <div
            v-else-if="getLatestPopAlarmLevel(item) >= 2 && getLatestPopAlarmLevel(item) <= 4"
            class="yellow-floating-bar"
          >
            <span class="alarm-text">📝 {{ getLatestPopAlarmTypeName(item) }} Notice</span>
            <button class="yellow-handle-button" @click.stop="handleAlarm(item, getLatestPopAlarm(item))">View</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Alarm Handle Modal -->
    <AlarmHandleModal
      :visible="showAlarmModal"
      :alarm="currentAlarm"
      :card="currentCard"
      :refresh-timestamp="alarmRefreshTimestamp"
      @update:visible="showAlarmModal = $event"
      @acknowledge="handleAlarmAcknowledge"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { AlertFilled, ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/store/modules/user'
import type { GetVitalFocusCardsModel, VitalFocusCard } from '@/api/monitors/model/monitorModel'
import { getVitalFocusCardsApi, saveVitalFocusSelectionApi } from '@/api/monitors/monitor'
import AlarmHandleModal from '@/components/AlarmHandleModal.vue'
// Note: API functions still use 'vitalFocus' naming for backend compatibility
import {
  parseAlarmLevel,
  getAlarmColor,
  getHighestAlarmLevel,
  formatAlarmTypeToString,
} from '@/utils/alarm'
import { alarmSound } from '@/utils/radar/alarmSound'

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
// Mock模式：禁用自动刷新，只支持手动刷新页面
const intervalTime = 0 // 禁用自动刷新
let timer: ReturnType<typeof setInterval> | null = null
const isTimerRunning = ref(false)

// 报警声音开关（默认开启）
const isSoundEnabled = ref(true)
// 已知的报警ID集合（用于检测新报警）
const knownAlarmIds = ref<Set<string>>(new Set())
// 首次加载标志（用于显示用户提示）
const isFirstLoad = ref(true)
// 是否需要用户点击才能播放声音（浏览器自动播放限制）
const needUserInteraction = ref(false)

// Check if current user is SystemAdmin
const isSystemAdmin = computed(() => {
  const userInfo = userStore.getUserInfo
  return userInfo?.role === 'SystemAdmin'
})

// Check if should show status filter buttons (only for staff roles, not Resident/Family)
// Privacy-sensitive status filters should only be visible to facility staff
const shouldShowStatusFilters = computed(() => {
  const userInfo = userStore.getUserInfo
  if (!userInfo || !userInfo.role) return false
  // Hide for Resident and Family roles (privacy protection)
  return userInfo.role !== 'Resident' && userInfo.role !== 'Family'
})

// Filter state
const activeFilter = ref<string | null>(null) // 'unhandled' | 'outofroom' | 'leftbed' | 'visitor' | 'awake' | 'sleep' | null
const showSelectCardModal = ref(false)

// Watch for Focus Modal open
watch(showSelectCardModal, (newVal) => {
  if (newVal) {
    onFocusModalOpen()
  }
})

// Drag and drop state for card reordering
const draggedCardId = ref<string | null>(null)
const draggedFromIndex = ref<number>(-1)
const dropTargetIndex = ref<number>(-1)  // 拖放目标位置
const cardOrder = ref<string[]>([])  // 存储卡片顺序的数组

// Lazy calculation state for status counts (null means not calculated yet)
const outofRoomCount = ref<number | null>(null)
const leftBedCount = ref<number | null>(null)
const visitorCount = ref<number | null>(null)
const awakeCount = ref<number | null>(null)
const sleepCount = ref<number | null>(null)

// Selected card IDs (all cards selected by default)
const selectedCardIds = ref<string[]>([]) // Saved selection (loaded from localStorage)
const tempSelectedCardIds = ref<string[]>([]) // Temporary selection (selection in Modal, not saved)
const savingFocus = ref(false) // Saving state

// Alarm Modal state
const showAlarmModal = ref(false)
const currentAlarm = ref<any>(null)
const currentCard = ref<VitalFocusCard | null>(null)
const alarmRefreshTimestamp = ref<number>(Date.now()) // 用于触发计时器重置

// Draggable watermark state
const watermarkRef = ref<HTMLElement | null>(null)
const watermarkPosition = ref({ x: window.innerWidth - 350, y: 10 }) // Initial position (top-right)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

/**
 * Start dragging watermark (支持鼠标和触摸)
 */
const startDrag = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true
  const rect = watermarkRef.value?.getBoundingClientRect()
  if (rect) {
    let clientX: number, clientY: number
    if ('touches' in e && e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as MouseEvent).clientX
      clientY = (e as MouseEvent).clientY
    }
    dragOffset.value = {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
}

/**
 * Handle dragging (支持鼠标和触摸)
 */
const onDrag = (e: MouseEvent | TouchEvent) => {
  if (isDragging.value) {
    let clientX: number, clientY: number
    if ('touches' in e && e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as MouseEvent).clientX
      clientY = (e as MouseEvent).clientY
    }
    watermarkPosition.value = {
      x: clientX - dragOffset.value.x,
      y: clientY - dragOffset.value.y
    }
  }
}

/**
 * Stop dragging
 */
const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

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
 * 检测新报警并播放声音
 * @param cards - 所有卡片数据
 */
const checkAndPlayAlarmSound = async (cards: VitalFocusCard[]) => {
  let highestNewAlarmLevel = 999 // 最高（最紧急）报警级别（数字越小越紧急）
  let highestCurrentAlarmLevel = 999 // 当前所有active报警中的最高级别
  let newAlarmCount = 0
  let totalActiveAlarms = 0
  
  cards.forEach(card => {
    if (!card.alarms || card.alarms.length === 0) return
    
    card.alarms.forEach(alarm => {
      // 只检查active状态的报警
      if (alarm.alarm_status !== 'active') return
      
      totalActiveAlarms++
      const level = parseAlarmLevel(alarm.alarm_level)
      
      // 更新当前最高报警级别
      if (level < highestCurrentAlarmLevel) {
        highestCurrentAlarmLevel = level
      }
      
      const alarmId = alarm.event_id
      // 检查是否是新报警
      if (!knownAlarmIds.value.has(alarmId)) {
        knownAlarmIds.value.add(alarmId)
        newAlarmCount++
        console.log('[AlarmSound] New alarm detected:', alarmId, 'level:', level)
        if (level < highestNewAlarmLevel) {
          highestNewAlarmLevel = level
        }
      }
    })
  })
  
  console.log('[AlarmSound] Check result:', {
    totalActiveAlarms,
    highestCurrentAlarmLevel,
    newAlarmCount,
    highestNewAlarmLevel
  })
  
  // 如果没有active报警，停止声音
  if (totalActiveAlarms === 0) {
    console.log('[AlarmSound] ✅ No active alarms - stopping sound')
    alarmSound.stopAlarm()
    return
  }
  
  // 如果有active报警，确保声音在播放
  // 如果检测到新报警（包括首次加载），播放对应级别的声音
  if (highestNewAlarmLevel <= 4) {
    const isFirst = isFirstLoad.value
    if (isFirst) {
      console.log('[AlarmSound] 🚨 FIRST LOAD: Found', newAlarmCount, 'unhandled alarms - MUST play sound!')
      isFirstLoad.value = false
    } else {
      console.log('[AlarmSound] Playing alarm sound, highest level:', highestNewAlarmLevel, 'new alarms:', newAlarmCount)
    }
    
    try {
      if (highestNewAlarmLevel <= 1) {
        // Level 0-1: 紧急报警 (L1)
        await alarmSound.playL1()
      } else {
        // Level 2-4: 一般报警 (L2)
        await alarmSound.playL2()
      }
      
      // 播放成功，清除用户交互提示
      if (needUserInteraction.value) {
        needUserInteraction.value = false
      }
    } catch (error: any) {
      // 如果是首次加载且播放失败，显示用户交互提示
      if (isFirst && error.name === 'NotAllowedError') {
        console.warn('[AlarmSound] ⚠️ First load alarm blocked by browser - showing user prompt')
        needUserInteraction.value = true
        // 显示全局提示
        message.warning({
          content: '🔔 有未处理报警！请点击页面任意位置启用报警声音',
          duration: 10,
          key: 'alarm-interaction-required'
        })
      }
    }
  } else if (isFirstLoad.value) {
    // 首次加载但没有报警
    console.log('[AlarmSound] First load: No unhandled alarms')
    isFirstLoad.value = false
  } else if (highestCurrentAlarmLevel <= 4) {
    // 没有新报警，但有existing报警在持续，确保声音在播放
    console.log('[AlarmSound] Existing alarms present (level:', highestCurrentAlarmLevel, '), ensuring sound is playing')
    try {
      if (highestCurrentAlarmLevel <= 1) {
        await alarmSound.playL1()
      } else {
        await alarmSound.playL2()
      }
    } catch (error: any) {
      // 忽略错误，可能是浏览器限制
      console.log('[AlarmSound] Could not play sound for existing alarm:', error.message)
    }
  }
}

/**
 * 切换声音开关
 */
const toggleSound = () => {
  isSoundEnabled.value = !isSoundEnabled.value
  if (!isSoundEnabled.value) {
    alarmSound.stopAlarm()
  }
  message.info(isSoundEnabled.value ? 'Alarm sound enabled' : 'Alarm sound disabled')
}

/**
 * 测试报警声音（右键触发）
 */
const testAlarmSound = () => {
  console.log('[AlarmSound] Test sound triggered')
  alarmSound.playL1()
  message.success('Testing alarm sound...')
}

/**
 * Handle alarm
 * 
 * @param {VitalFocusCard} item - Card object
 * @param {any} [alarm] - Optional alarm object, if not provided use latest pop alarm
 */
const handleAlarm = (item: VitalFocusCard, alarm?: any) => {
  const targetAlarm = alarm || getLatestPopAlarm(item)
  
  if (!targetAlarm) {
    message.warning('No active notification found')
    return
  }
  
  // 设置当前报警和卡片
  currentAlarm.value = targetAlarm
  currentCard.value = item
  showAlarmModal.value = true
}
/**
 * Handle alarm acknowledgment
 * 
 * @param {any} alarm - Alarm object to acknowledge
 */
const handleAlarmAcknowledge = (alarm: any) => {
  if (!alarm || !currentCard.value) return
  
  // 在dataSource中找到原始卡片对象（确保响应式更新）
  const cardId = currentCard.value.card_id
  const items = dataSource.value?.items || []
  const cardIndex = items.findIndex(c => c.card_id === cardId)
  
  if (cardIndex === -1) {
    console.warn('Card not found in dataSource')
    showAlarmModal.value = false
    currentAlarm.value = null
    currentCard.value = null
    return
  }
  
  const card = items[cardIndex]
  if (!card) {
    showAlarmModal.value = false
    currentAlarm.value = null
    currentCard.value = null
    return
  }
  
  if (card.alarms && Array.isArray(card.alarms)) {
    const alarmIndex = card.alarms.findIndex(a => a.event_id === alarm.event_id)
    if (alarmIndex !== -1 && card.alarms[alarmIndex]) {
      // 更新报警状态为acknowledged
      card.alarms[alarmIndex].alarm_status = 'acknowledged'
      
      // 更新unhandled计数
      const level = parseAlarmLevel(alarm.alarm_level)
      if (level === 0 && card.unhandled_alarm_0 && card.unhandled_alarm_0 > 0) {
        card.unhandled_alarm_0--
      } else if (level === 1 && card.unhandled_alarm_1 && card.unhandled_alarm_1 > 0) {
        card.unhandled_alarm_1--
      } else if (level === 2 && card.unhandled_alarm_2 && card.unhandled_alarm_2 > 0) {
        card.unhandled_alarm_2--
      }
      
      if (card.total_unhandled_alarms && card.total_unhandled_alarms > 0) {
        card.total_unhandled_alarms--
      }
    }
  }
  
  // 关闭Modal
  showAlarmModal.value = false
  currentAlarm.value = null
  currentCard.value = null
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
    // Only load from localStorage once on first load (when selectedCardIds is empty)
    if (selectedCardIds.value.length === 0) {
      loadSelectedCardIds()
      
      // 🔴 Focus默认全选: 如果没有保存的选择，则选择所有卡片
      if (data?.items && selectedCardIds.value.length === 0) {
        console.log('📋 Focus默认全选: 选择所有', data.items.length, '个卡片')
        selectedCardIds.value = data.items.map((item: VitalFocusCard) => item.card_id)
        saveSelectedCardIds() // Save default selection
      }
    }
    // Note: If user has a saved selection, we respect it and don't auto-add new cards
    
    // 检测新报警并播放声音
    if (isSoundEnabled.value && data?.items) {
      checkAndPlayAlarmSound(data.items)
    }
    
    // 更新刷新时间戳，触发AlarmHandleModal中的计时器重置
    alarmRefreshTimestamp.value = Date.now()
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
 * Note: In mock mode, intervalTime=0 disables auto-refresh
 */
const startTimer = () => {
  // Mock模式：禁用自动刷新
  if (intervalTime === 0) {
    console.log('Auto-refresh disabled in mock mode. Use manual page refresh.')
    return
  }
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
 * Refresh all status counts when clicked
 */
const handleAmbientRounds = () => {
  // Refresh all status counts when Ambient Rounds is clicked
  refreshAllStatusCounts()
  console.log('Ambient Rounds clicked - all status counts refreshed')
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
// Navigate back to previous page
const goBack = () => {
  router.go(-1)
}

// Navigate to home page
const goHome = () => {
  const homePath = userStore.getUserHomePath
  router.push(homePath)
}

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
 * Focus count - number of selected cards / total cards
 */
const focusCount = computed(() => {
  const total = allCards.value.length
  const selected = selectedCardIds.value.length
  // If all cards are selected or no selection saved, show total
  if (selected === 0 || selected === total) {
    return total
  }
  return selected
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
  
  // 2. Refresh all status counts after focus selection changed
  refreshAllStatusCounts()
  
  // 3. Asynchronously submit to server (doesn't block UI, no loading display)
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
    
    // 2. Refresh all status counts after focus selection changed
    refreshAllStatusCounts()
    
    // Note: After selectedCardIds is updated, filteredCards will automatically update (because it's computed)
    // So the page will immediately display the updated card list
    
    // 3. Asynchronously submit to server (doesn't block UI)
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
 * Get focus-filtered cards (cards selected by Focus)
 * Used for all status count calculations
 */
const getFocusFilteredCards = (): VitalFocusCard[] => {
  let cards = dataSource.value?.items || []
  // Apply Focus selection filter
  if (selectedCardIds.value.length > 0) {
    cards = cards.filter((card) => selectedCardIds.value.includes(card.card_id))
  }
  return cards
}

/**
 * Calculate outofRoom count
 * OutRoom: 所有Location卡片（临时测试：显示所有Location）
 */
const calculateOutofRoomCount = (): number => {
  const cards = getFocusFilteredCards()
  return cards.filter((card) => {
    return card.card_type === 'Location'
  }).length
}

/**
 * Calculate leftBed count
 */
const calculateLeftBedCount = (): number => {
  const cards = getFocusFilteredCards()
  return cards.filter((card) => {
    return card.bed_status === 1
  }).length
}

/**
 * Calculate visitor count
 * Visitor: ActiveBed卡片且 person_count > 1（房间内人数超过居民数）
 */
const calculateVisitorCount = (): number => {
  const cards = getFocusFilteredCards()
  return cards.filter((card) => {
    return card.card_type === 'ActiveBed' && (card.person_count ?? 0) > 1
  }).length
}

/**
 * Calculate awake count
 */
const calculateAwakeCount = (): number => {
  const cards = getFocusFilteredCards()
  return cards.filter((card) => {
    return card.bed_status === 0 && card.sleep_stage === 1
  }).length
}

/**
 * Calculate sleep count
 */
const calculateSleepCount = (): number => {
  const cards = getFocusFilteredCards()
  return cards.filter((card) => {
    return card.bed_status === 0 && (card.sleep_stage === 2 || card.sleep_stage === 4)
  }).length
}

/**
 * Refresh all status counts (called when Ambient Rounds is clicked)
 */
const refreshAllStatusCounts = () => {
  outofRoomCount.value = calculateOutofRoomCount()
  leftBedCount.value = calculateLeftBedCount()
  visitorCount.value = calculateVisitorCount()
  awakeCount.value = calculateAwakeCount()
  sleepCount.value = calculateSleepCount()
}

/**
 * Toggle filter
 * Only one can be selected, clicking the selected one will deselect it
 * Calculate count when filter is clicked (lazy calculation)
 */
const toggleFilter = (filterType: string) => {
  if (activeFilter.value === filterType) {
    activeFilter.value = null // Deselect
  } else {
    activeFilter.value = filterType // Select
  }
  
  // Always refresh all status counts when any filter is clicked
  refreshAllStatusCounts()
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
      // Show all Location cards (临时测试：显示所有Location卡片)
      return cards.filter((card) => {
        return card.card_type === 'Location'
      })
    
    case 'leftbed':
      // Show left bed cards (bed_status=1)
      return cards.filter((card) => {
        return card.bed_status === 1
      })
    
    case 'visitor':
      // Show cards with visitors (ActiveBed cards with person_count > 1)
      return cards.filter((card) => {
        return card.card_type === 'ActiveBed' && (card.person_count ?? 0) > 1
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
 * Ordered cards based on user drag-drop arrangement
 * Cards are ordered based on cardOrder array, with new cards added at the end
 */
const orderedCards = computed(() => {
  const cards = filteredCards.value
  if (cardOrder.value.length === 0) {
    return cards
  }
  
  // Create a map for quick lookup
  const cardMap = new Map(cards.map(card => [card.card_id, card]))
  
  // Build ordered list based on cardOrder
  const ordered: VitalFocusCard[] = []
  const usedIds = new Set<string>()
  
  // First add cards in the saved order
  for (const id of cardOrder.value) {
    const card = cardMap.get(id)
    if (card) {
      ordered.push(card)
      usedIds.add(id)
    }
  }
  
  // Then add any new cards not in the order
  for (const card of cards) {
    if (!usedIds.has(card.card_id)) {
      ordered.push(card)
    }
  }
  
  return ordered
})

/**
 * Handle drag start
 * 使用setDragImage确保拖动时显示整个卡片而不是内部元素
 */
const handleDragStart = (event: DragEvent, item: VitalFocusCard, index: number) => {
  draggedCardId.value = item.card_id
  draggedFromIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', item.card_id)
    
    // 获取卡片元素作为拖动图像，确保拖动时显示整个卡片
    const cardElement = (event.target as HTMLElement).closest('.itemFrom') as HTMLElement
    if (cardElement) {
      // 计算鼠标在卡片中的位置
      const rect = cardElement.getBoundingClientRect()
      const offsetX = event.clientX - rect.left
      const offsetY = event.clientY - rect.top
      event.dataTransfer.setDragImage(cardElement, offsetX, offsetY)
    }
  }
}

/**
 * Handle drag end
 */
const handleDragEnd = () => {
  // 在拖动结束时才真正更新卡片顺序
  if (draggedFromIndex.value !== -1 && dropTargetIndex.value !== -1 && draggedFromIndex.value !== dropTargetIndex.value) {
    const cards = [...orderedCards.value]
    const draggedCard = cards[draggedFromIndex.value]
    if (draggedCard) {
      // Remove from old position
      cards.splice(draggedFromIndex.value, 1)
      // Calculate the actual insert position
      const insertIndex = dropTargetIndex.value > draggedFromIndex.value ? dropTargetIndex.value - 1 : dropTargetIndex.value
      // Insert at new position
      cards.splice(insertIndex, 0, draggedCard)
      // Update the order array
      cardOrder.value = cards.map(c => c.card_id)
      // Save to localStorage
      saveCardOrder()
    }
  }
  
  draggedCardId.value = null
  draggedFromIndex.value = -1
  dropTargetIndex.value = -1
}

/**
 * Handle drag enter (for visual feedback - only update drop target indicator)
 */
const handleDragEnter = (_event: DragEvent, targetIndex: number) => {
  if (draggedFromIndex.value === -1) return
  // 只更新放置目标位置，不实际移动卡片
  dropTargetIndex.value = targetIndex
}

/**
 * Handle drop
 */
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  handleDragEnd()
}

/**
 * Save card order to localStorage
 */
const saveCardOrder = () => {
  try {
    const userInfo = userStore.getUserInfo
    const key = `card_order_${userInfo?.tenant_id || 'default'}`
    localStorage.setItem(key, JSON.stringify(cardOrder.value))
  } catch (e) {
    console.warn('Failed to save card order:', e)
  }
}

/**
 * Load card order from localStorage
 */
const loadCardOrder = () => {
  try {
    const userInfo = userStore.getUserInfo
    const key = `card_order_${userInfo?.tenant_id || 'default'}`
    const saved = localStorage.getItem(key)
    if (saved) {
      cardOrder.value = JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load card order:', e)
  }
}

/**
 * Count statistics
 */
const unhandledCount = computed(() => {
  // Use Focus-filtered cards
  let cards = dataSource.value?.items || []
  if (selectedCardIds.value.length > 0) {
    cards = cards.filter((card) => selectedCardIds.value.includes(card.card_id))
  }
  // Count cards with unhandled level 0 or level 1 alarms
  return cards.filter((card) => {
    return (card.unhandled_alarm_0 ?? 0) > 0 || (card.unhandled_alarm_1 ?? 0) > 0
  }).length
})

// Note: Status counts (outofRoomCount, leftBedCount, visitorCount, awakeCount, sleepCount) 
// are now ref values with lazy calculation (calculated only when clicked or when Ambient Rounds is clicked)
// They are defined above in the "Lazy calculation state" section

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
  // Load saved card order
  loadCardOrder()
  await refreshData()
  // Calculate all status counts on load
  refreshAllStatusCounts()
  startTimer()
  
  // 添加全局点击监听器，用于在用户交互后重试播放报警声音
  const handleUserInteraction = async () => {
    if (needUserInteraction.value && isSoundEnabled.value) {
      console.log('[AlarmSound] User interaction detected - retrying alarm sound')
      needUserInteraction.value = false
      message.destroy('alarm-interaction-required')
      
      // 重新检查报警并播放声音
      if (dataSource.value?.items) {
        // 清空已知报警，强制重新检测
        const tempKnownAlarms = new Set(knownAlarmIds.value)
        knownAlarmIds.value.clear()
        await checkAndPlayAlarmSound(dataSource.value.items)
        // 如果播放失败，恢复已知报警列表
        if (needUserInteraction.value) {
          knownAlarmIds.value = tempKnownAlarms
        }
      }
    }
    
    // 移除监听器（只需要一次交互）
    if (!needUserInteraction.value) {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }
  
  document.addEventListener('click', handleUserInteraction)
  document.addEventListener('keydown', handleUserInteraction)
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
/* 页面容器 */
.overview-container {
  padding: 15px;
  background-color: #f4f7f9;
  min-height: 100vh;
  position: relative;
}

/* 合规水印 - 放大20% */
.compliance-watermark {
  position: fixed;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 16px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 2px solid #1890ff;
  user-select: none;
  white-space: nowrap;
  max-width: none;
}

.watermark-title {
  font-size: 14px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 3px;
  line-height: 1.3;
  white-space: nowrap;
}

.watermark-text {
  font-size: 12px;
  color: #666;
  line-height: 1.3;
  white-space: nowrap;
}

/* 筛选按钮行 */
.filter-buttons-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
}

/* Cards container with flex layout */
.cards-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
  min-height: 200px;
}

.itemFrom {
  padding: 15px;
  background-color: #fff;
  width: 270px;
  height: 260px;
  color: #909399;
  cursor: grab;
  border-radius: 5px;
  margin: 15px;
  transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.15s ease;
  position: relative;
  user-select: none;
}

.itemFrom:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.itemFrom:active {
  cursor: grabbing;
}

.itemFrom.dragging {
  opacity: 0.5;
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

/* 有报警条时，减少上下间距为报警条腾出空间 */
.itemFrom.has-alarm-bar {
  padding-top: 13px;
  padding-bottom: 40px; /* 给报警条留空间 */
}

/* 减少头部区域的下边距 */
.itemFrom.has-alarm-bar > div:first-child {
  padding-bottom: 5px !important;
}

/* ActiveBed主内容区域 - 适度压缩高度，保持图标居中 */
.itemFrom.has-alarm-bar > div:nth-child(2) {
  height: 73% !important;
}

/* 减少状态图标容器的间距 */
.itemFrom.has-alarm-bar .status-icon-text {
  padding: 5px;
  margin-top: -5px;
}

/* 减少主内容区域间距 */
.itemFrom.has-alarm-bar .status-img {
  margin-top: -3px;
  margin-bottom: -3px;
}

/* 减少姿态图标区域 */
.itemFrom.has-alarm-bar .posture-img {
  margin-top: -2px;
  margin-bottom: -2px;
}

/* 有报警条时，压缩心率呼吸详情区域 */
.itemFrom.has-alarm-bar .vitals-detail-container {
  transform: scale(0.85);
  transform-origin: left center;
  margin-top: -8px;
  margin-bottom: -8px;
}

/* 有报警条时，压缩心率呼吸数值 */
.itemFrom.has-alarm-bar .vitals-row-heart {
  margin-bottom: -22px;
}

/* 有报警条时，压缩心率呼吸图标模式 */
.itemFrom.has-alarm-bar .vitals-icons-only {
  transform: scale(0.9);
  transform-origin: left center;
}

/* 有报警条时，隐藏Save change按钮避免空间不足 */
.itemFrom.has-alarm-bar .apply-button-bar {
  display: none;
}

/* 放置位置指示器 - 显示卡片将被放置的位置 */
.itemFrom.drop-target {
  border: 3px dashed #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
  box-shadow: 0 0 15px rgba(24, 144, 255, 0.3);
  transition: all 0.2s ease;
}

.itemFrom.drop-target::before {
  content: '↓ Drop Here';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: bold;
  color: #1890ff;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 12px;
  border-radius: 4px;
  z-index: 10;
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

/* 在床状态：睡眠图标+心率呼吸数值 水平排列 */
.inbed-vitals-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  font-size: 18px;
}

/* 左边：睡眠状态图标容器 */
.sleep-icon-container {
  flex-shrink: 0;
}

/* 中间：心率呼吸详情容器 */
.vitals-detail-container {
  font-size: 18px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* 中间：只显示图标时 */
.vitals-icons-only {
  font-size: 18px;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
}

/* 心率行 - PC端紧凑布局 */
.vitals-row-heart {
  margin-bottom: -20px;
}

.status-number {
  margin-right: 0;
  font-weight: bold;
  font-size: 36px;
  color: #313330;
  flex-shrink: 0;
}

.number-container {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  margin-right: 2px;
  flex-shrink: 0;
}

.number-badge {
  font-size: 14px;
  color: #a2afb58a;
  margin-left: 1px;
  align-self: flex-end;
  margin-bottom: 4px;
}

.status-item {
  display: flex;
  align-items: center;
  flex-direction: row;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

/* 单位文字 */
.vitals-unit {
  flex-shrink: 0;
  white-space: nowrap;
}

/* 心率呼吸小图标（展开详情时显示） */
.vitals-icon-small {
  width: 20px;
  height: 20px;
  margin-right: 4px;
  flex-shrink: 0;
}

.posture-img {
  width: 30px;
  height: 30px;
  margin-right: 4px;
}

/* 心率呼吸大图标（未展开时显示） */
.vitals-icon-large {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.status-img {
  width: 72px;
  height: 72px;
  margin-right: 10px;
}

.status-icon-text {
  font-size: 18px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
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
  border-radius: 5px;
  padding: 4px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 10px;
  left: 6px;
  right: 6px;
  z-index: 10;
}

.red-floating-bar .alarm-text {
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
  border-radius: 5px;
  padding: 4px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 10px;
  left: 6px;
  right: 6px;
  z-index: 10;
}

.yellow-floating-bar .alarm-text {
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
  display: flex;
  justify-content: flex-start;
  margin-left: 72px;
  margin-top: 2px;
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

/* ========== 移动端适配 ========== */

/* 平板 (768px - 1024px) - 卡片尺寸与PC端完全一致 */
@media (max-width: 1024px) {
  .cards-container {
    justify-content: center;
  }
}

/* 手机横屏 / 小平板 (576px - 768px) - 卡片尺寸与PC端完全一致 */
@media (max-width: 768px) {
  .cards-container {
    justify-content: center;
    padding: 0 5px;
  }
}

/* 手机竖屏 (< 576px) */
@media (max-width: 576px) {
  .cards-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 0;
    width: 100%;
  }
  
  /* 卡片宽度与筛选按钮容器一致，自适应屏幕 */
  .itemFrom {
    width: auto;
    height: auto;
    min-height: 220px;
    padding: 15px;
    margin: 8px 10px;
    box-sizing: border-box;
  }
  
  /* 禁用拖动 - 手机上拖动体验差 */
  .itemFrom {
    cursor: pointer;
  }
  
  .itemFrom.dragging {
    transform: none;
    opacity: 1;
  }
  
  .itemFrom.drop-target {
    border: none;
    background-color: #fff;
    box-shadow: none;
  }
  
  .itemFrom.drop-target::before {
    display: none;
  }
  
  /* 不覆盖任何图标大小，完全使用PC端样式 */
  
  .red-floating-bar,
  .yellow-floating-bar {
    padding: 4px 8px;
    left: 5px;
    right: 5px;
    bottom: 5px;
  }
  
  .red-floating-bar span,
  .yellow-floating-bar span {
    font-size: 11px;
  }
  
  .red-handle-button,
  .yellow-handle-button {
    padding: 2px 6px;
    font-size: 11px;
  }
}

/* 超小屏幕 (< 375px) */
@media (max-width: 375px) {
  .itemFrom {
    margin: 6px 8px;
    padding: 12px;
  }
}

/* 移动端全局调整 */
@media (max-width: 768px) {
  /* 筛选按钮响应式 */
  :deep(.ant-btn) {
    font-size: 12px;
    padding: 4px 8px;
    height: 28px;
  }
  
  :deep(.ant-badge) {
    margin-left: 4px;
  }
}

@media (max-width: 576px) {
  :deep(.ant-btn) {
    font-size: 11px;
    padding: 2px 6px;
    height: 26px;
  }
  
  /* 页面容器 */
  .overview-container {
    padding: 10px 8px;
  }
  
  /* 合规水印移动端 - 放大30%，不换行 */
  .compliance-watermark {
    padding: 10px 20px;
    max-width: none;
    white-space: nowrap;
    border-radius: 8px;
  }
  
  .watermark-title {
    font-size: 16px;
    white-space: nowrap;
  }
  
  .watermark-text {
    font-size: 13px;
    white-space: nowrap;
  }
  
  /* 筛选按钮行 */
  .filter-buttons-row {
    gap: 6px;
    padding: 8px;
    margin-bottom: 10px;
  }
}

@media (max-width: 375px) {
  .overview-container {
    padding: 8px 5px;
  }
  
  .compliance-watermark {
    padding: 8px 16px;
    max-width: none;
    white-space: nowrap;
    border-radius: 7px;
  }
  
  .watermark-title {
    font-size: 14px;
    white-space: nowrap;
  }
  
  .watermark-text {
    font-size: 11px;
    white-space: nowrap;
  }
  
  .filter-buttons-row {
    gap: 4px;
    padding: 6px;
  }
}
</style>
