<template>
  <div style="padding: 15px">
    <div class="form-container">
      <a-form
        layout="horizontal"
        :labelCol="{ flex: '140px' }"
        :wrapperCol="{ span: 24 }"
        :colon="false"
        :model="formData"
        ref="formRef"
        @submit="handleSubmit"
        class="form-container"
      >
        <!-- Basic Information Section -->
        <h3 class="section-title">
          <div class="title-icons">
            <a-button type="text" @click="goBackToCard" style="padding: 0; border: none; box-shadow: none; margin-right: 8px;">
              <template #icon>
                <ArrowLeftOutlined />
              </template>
            </a-button>
            <a-button type="text" @click="goHome" style="padding: 0; border: none; box-shadow: none; margin-right: 12px;">
              <template #icon>
                <HomeOutlined />
              </template>
            </a-button>
          </div>
          Sleep Monitoring Configuration (Multiple Options Available)
        </h3>
        <div class="information-container">
          <div class="information-row">
            <span>Device: {{ deviceInfo.device_name }} / {{ deviceInfo.serial_number || deviceInfo.uid || '-' }}</span>
          </div>
          <div class="information-row">
            <span>Address: {{ cardInfo?.card_address || '-' }}</span>
          </div>
          <div class="information-row">
            <span>Residents:</span>
            <div style="display: flex; flex-direction: column">
              <div
                v-for="resident in cardInfo?.residents || []"
                :key="resident.resident_id"
                style="display: flex; flex-direction: row; gap: 10px"
              >
                <span>{{ getResidentDisplayName(resident) }}</span>
              </div>
            </div>
          </div>
        </div>
        <a-divider />
        
        <!-- sleep duration -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div style="display: inline-flex; align-items: center">
              <span style="margin-right: 10px">Went to bed time</span>
              <a-time-picker
                v-model:value="formData.wentToBedTime"
                format="HH:mm"
                :minute-step="10"
              />
              <span style="margin: 0px 10px 0px 10px">Get up time</span>
              <a-time-picker v-model:value="formData.getUpTime" format="HH:mm" :minute-step="10" />
            </div>
          </a-col>
        </a-row>
        
        <!-- leave bed -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div style="display: inline-flex; align-items: center; gap: 10px">
              <a-select
                v-model:value="formData.leftBedAlarmLevel"
                style="width: 120px"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>During normal rest time, leaving bed (over)</span>
              <a-select
                v-model:value="formData.leftBedDuration"
                style="width: 120px"
                :disabled="formData.leftBedAlarmLevel === 'disabled'"
              >
                <a-select-option v-for="option in leftBedDurationOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>after in bed more than 5 minutes</span>
              <a-tooltip :title="leftBedTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- heart rate too slow -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div style="display: inline-flex; align-items: center; gap: 10px">
              <a-select
                v-model:value="formData.heartRateSlowAlarmLevel"
                style="width: 120px"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Heart rate is below</span>
              <a-select
                v-model:value="formData.minHeartRate"
                style="width: 120px"
                :disabled="formData.heartRateSlowAlarmLevel === 'disabled'"
              >
                <a-select-option v-for="option in slowHeartRateOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>last for</span>
              <a-select
                v-model:value="formData.heartRateSlowDuration"
                style="width: 120px"
                :disabled="formData.heartRateSlowAlarmLevel === 'disabled'"
              >
                <a-select-option v-for="option in oneHourDurationOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <a-tooltip :title="slowHeartRateTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- heart rate too fast -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div style="display: inline-flex; align-items: center; gap: 10px">
              <a-select
                v-model:value="formData.heartRateFastAlarmLevel"
                style="width: 120px"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Heart rate is above</span>
              <a-select
                v-model:value="formData.maxHeartRate"
                style="width: 120px"
                :disabled="formData.heartRateFastAlarmLevel === 'disabled'"
              >
                <a-select-option v-for="option in fastHeartRateOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>last for</span>
              <a-select
                v-model:value="formData.heartRateFastDuration"
                style="width: 120px"
                :disabled="formData.heartRateFastAlarmLevel === 'disabled'"
              >
                <a-select-option v-for="option in oneHourDurationOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <a-tooltip :title="fastHeartRateTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- breath rate too slow -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div style="display: inline-flex; align-items: center; gap: 10px">
              <a-select
                v-model:value="formData.breathRateSlowAlarmLevel"
                style="width: 120px"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Respiratory rate is below</span>
              <a-select
                v-model:value="formData.minBreathRate"
                style="width: 120px"
                :disabled="formData.breathRateSlowAlarmLevel === 'disabled'"
              >
                <a-select-option v-for="option in slowBreathRateOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>last for</span>
              <a-select
                v-model:value="formData.breathRateSlowDuration"
                style="width: 120px"
                :disabled="formData.breathRateSlowAlarmLevel === 'disabled'"
              >
                <a-select-option v-for="option in oneHourDurationOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <a-tooltip :title="slowBreathRateTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- breath rate too fast -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div style="display: inline-flex; align-items: center; gap: 10px">
              <a-select
                v-model:value="formData.breathRateFastAlarmLevel"
                style="width: 120px"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Respiratory rate is above</span>
              <a-select
                v-model:value="formData.maxBreathRate"
                style="width: 120px"
                :disabled="formData.breathRateFastAlarmLevel === 'disabled'"
              >
                <a-select-option v-for="option in fastBreathRateOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>last for</span>
              <a-select
                v-model:value="formData.breathRateFastDuration"
                style="width: 120px"
                :disabled="formData.breathRateFastAlarmLevel === 'disabled'"
              >
                <a-select-option v-for="option in oneHourDurationOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <a-tooltip :title="fastBreathRateTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- breath pause(apnea) -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div style="display: inline-flex; align-items: center; gap: 10px">
              <a-select
                v-model:value="formData.breathPauseAlarmLevel"
                style="width: 120px"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Apnea</span>
              <a-select
                v-model:value="formData.breathPauseDuration"
                style="width: 120px"
                :disabled="formData.breathPauseAlarmLevel === 'disabled'"
              >
                <a-select-option v-for="option in breathPauseDurationOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <a-tooltip :title="breathPauseTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- body move -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div style="display: inline-flex; align-items: center; gap: 10px">
              <a-select
                v-model:value="formData.bodyMoveAlarmLevel"
                style="width: 120px"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Frequent body movement last for</span>
              <a-select
                v-model:value="formData.bodyMoveDuration"
                style="width: 120px"
                :disabled="formData.bodyMoveAlarmLevel === 'disabled'"
              >
                <a-select-option v-for="option in bodyMoveDurationOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <a-tooltip :title="bodyMoveTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- no body move -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div style="display: inline-flex; align-items: center; gap: 10px">
              <a-select
                v-model:value="formData.nobodyMoveAlarmLevel"
                style="width: 120px"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>No body movement last for</span>
              <a-select
                v-model:value="formData.nobodyMoveDuration"
                style="width: 120px"
                :disabled="formData.nobodyMoveAlarmLevel === 'disabled'"
              >
                <a-select-option v-for="option in twoHourDurationOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <a-tooltip :title="noBodyMoveTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- no turn over -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div style="display: inline-flex; align-items: center; gap: 10px">
              <a-select
                v-model:value="formData.noTurnOverAlarmLevel"
                style="width: 120px"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>No turning over last for</span>
              <a-select
                v-model:value="formData.noTurnOverDuration"
                style="width: 120px"
                :disabled="formData.noTurnOverAlarmLevel === 'disabled'"
              >
                <a-select-option v-for="option in twoHourDurationOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <a-tooltip :title="noTurnOverTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- sit up -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div style="display: inline-flex; align-items: center; gap: 10px">
              <a-select
                v-model:value="formData.situpAlarmLevel"
                style="width: 120px"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Give an alarm immediately if the user is suspected of sitting up</span>
              <a-tooltip :title="sitUpTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- on bed -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div style="display: inline-flex; align-items: center; gap: 10px">
              <a-select
                v-model:value="formData.onbedAlarmLevel"
                style="width: 120px"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>In bed (over)</span>
              <a-select
                v-model:value="formData.onbedDuration"
                style="width: 120px"
                :disabled="formData.onbedAlarmLevel === 'disabled'"
              >
                <a-select-option v-for="option in onbedDurationOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <a-tooltip :title="onbedTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- sensor fall -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div style="display: inline-flex; align-items: center; gap: 10px">
              <a-select
                v-model:value="formData.fallAlarmLevel"
                style="width: 120px"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Sensor fall</span>
            </div>
          </a-col>
        </a-row>

        <!-- Submit Button -->
        <a-row :gutter="24" class="buttons-section">
          <a-form-item>
            <a-button
              type="default"
              class="form-button"
              @click="handleCancel"
              style="margin-right: 60px"
            >
              Cancel
            </a-button>
            <a-button
              v-if="canEdit"
              type="primary"
              class="form-button"
              @click="handleSubmit"
            >
              Save
            </a-button>
          </a-form-item>
        </a-row>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { QuestionCircleOutlined, ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'
import {
  getSleepaceDeviceMonitorSettingsApi,
  updateSleepaceDeviceMonitorSettingsApi,
} from '@/api/settings/settings'
import type { AlarmLevel } from '@/api/settings/model/settingsModel'
import { useCardStore } from '@/store/modules/card'
import { useUserStore } from '@/store/modules/user'
import type { CardOverviewItem } from '@/api/card-overview/model/cardOverviewModel'

const route = useRoute()
const router = useRouter()
const cardStore = useCardStore()
const userStore = useUserStore()
const formRef = ref()
const originalData = ref<any>(null)

// Device and card info
const deviceId = computed(() => route.params.deviceId as string)
const deviceInfo = ref<any>({})
const cardInfo = ref<CardOverviewItem | null>(null)

// Check if user can edit (Admin, Manager, IT, Nurse can edit)
const canEdit = computed(() => {
  const role = userStore.getUserInfo?.role
  return role === 'Admin' || role === 'Manager' || role === 'IT' || role === 'Nurse'
})

// Alarm level options (including 'disabled')
const alarmLevelOptions = [
  { value: 'disabled', label: 'Disabled' },
  { value: '0', label: 'EMERG' },
  { value: '1', label: 'ALERT' },
  { value: '2', label: 'CRIT' },
  { value: '3', label: 'ERR' },
  { value: '4', label: 'WARNING' },
  { value: '5', label: 'NOTICE' },
  { value: '6', label: 'INFO' },
  { value: '7', label: 'DEBUG' },
]

// Tooltip titles
const leftBedTitle =
  'Discover nighttime accidents as soon as possible by monitoring the length of time' +
  ' out of bed. In normal use, it is recommended not to set "immediately" out of bed, because the monitoring' +
  ' range of the device is limited, which may cause frequent alarm when sleeping out of the monitoring' +
  ' range for short periods of time.'

const slowHeartRateTitle =
  'The heart rate threshold can be set lower than the normal heart rate level.' +
  ' After falling asleep, the heart rate starts to slow down during the light sleep, and it reaches its lowest' +
  ' level in the deep sleep, some people even have heart rates in 40 to 50 beats per minute. If the slow heart' +
  ' rate alarm continues to occur, it is suggested to check the physical condition. If in good health, the' +
  ' threshold can be Appropriately raised.'

const fastHeartRateTitle =
  'The heart rate threshold can be set higher than the normal heart rate level. If the rapid heart rate alarm' +
  ' continues to occur, it is suggested to check the physical condition. If in good health, the threshold can be' +
  ' Appropriately raised.'

const slowBreathRateTitle =
  'The respiratory rate threshold can be set lower than the normal respiratory rate level.' +
  ' Because when you fall asleep, your breathing rate decreases. If the bradypnea alarm continues to occur, it is' +
  ' suggested to check your physical condition. If in good health, the threshold can be Appropriately raised.'

const fastBreathRateTitle =
  'The respiratory rate threshold can be set higher than the normal respiratory rate level. If the tachypnea alarm' +
  ' continues to occur, it is suggested to check the physical condition. If in good health, the threshold can be Appropriately raised.'

const breathPauseTitle =
  'It is suggested to set for residents who snore severely or have respiratory diseases.'

const bodyMoveTitle =
  'It is recommended to set for residents who are in need of close attention on the abnormal body movements.'

const noBodyMoveTitle =
  'It is suggested to turn over the body for the elderly who have no body movement for a long time due to their poor' +
  ' physical condition, or disabled elderly people who have no body movement for a long time.'

const noTurnOverTitle =
  'It is suggested to turn over the body for the elderly who have no body movement for a long time due to their poor physical' +
  ' condition, or disabled elderly people who have no body movement for a long time'

const sitUpTitle =
  'It is suggested to pay close attention to the disabled elderly, the semi-disabled elderly or the elderly who get out of bed' +
  ' and need help. Please do not set it for the healthy elderly, sitting up is inferred from the change of gravity value of the' +
  ' sensor, so when sleeping on the edge or turning over, the gravity value will also change, resulting in misjudgment.'

const onbedTitle =
  'It is recommended to set for the elderly whose rest conditions need to be paid attention to.'

// Options
const leftBedDurationOptions = [
  { value: 0, label: 'Immediately' },
  { value: 30 * 60, label: '30 Min' },
  { value: 45 * 60, label: '45 Min' },
  { value: 60 * 60, label: '1 Hr' },
  { value: 90 * 60, label: '1 Hr 30 Min' },
  { value: 120 * 60, label: '2 Hr' },
]

const slowHeartRateOptions = [
  { value: 45, label: '45 bpm' },
  { value: 50, label: '50 bpm' },
  { value: 55, label: '55 bpm' },
]

const fastHeartRateOptions = [
  { value: 110, label: '110 bpm' },
  { value: 115, label: '115 bpm' },
  { value: 120, label: '120 bpm' },
  { value: 125, label: '125 bpm' },
]

const slowBreathRateOptions = [
  { value: 10, label: '10 rpm' },
  { value: 12, label: '12 rpm' },
  { value: 14, label: '14 rpm' },
  { value: 16, label: '16 rpm' },
]

const fastBreathRateOptions = [
  { value: 22, label: '22 rpm' },
  { value: 24, label: '24 rpm' },
  { value: 26, label: '26 rpm' },
  { value: 28, label: '28 rpm' },
]

const oneHourDurationOptions = [
  { value: 2 * 60, label: '2 Min' },
  { value: 5 * 60, label: '5 Min' },
  { value: 10 * 60, label: '10 Min' },
  { value: 15 * 60, label: '15 Min' },
  { value: 20 * 60, label: '20 Min' },
  { value: 30 * 60, label: '30 Min' },
  { value: 45 * 60, label: '45 Min' },
  { value: 60 * 60, label: '1 Hr' },
]

const twoHourDurationOptions = [
  { value: 45, label: '45 Min' },
  { value: 60, label: '1 Hr' },
  { value: 1.5 * 60, label: '1 hr 30 Min' },
  { value: 2 * 60, label: '2 Hr' },
]

const breathPauseDurationOptions = [
  { value: 15, label: '15 Sec' },
  { value: 30, label: '30 Sec' },
  { value: 1 * 60, label: '1 Min' },
  { value: 1.5 * 60, label: '1 Min 30 Sec' },
  { value: 2 * 60, label: '2 Min' },
  { value: 2.5 * 60, label: '2 Min 30 Sec' },
  { value: 3 * 60, label: '3 Min' },
]

const bodyMoveDurationOptions = [
  { value: 5, label: '5 Min' },
  { value: 10, label: '10 Min' },
  { value: 15, label: '15 Min' },
  { value: 20, label: '20 Min' },
]

const onbedDurationOptions = [
  { value: 3 * 60, label: '3 Min' },
  { value: 5 * 60, label: '5 Min' },
  { value: 10 * 60, label: '10 Min' },
  { value: 20 * 60, label: '20 Min' },
]

// Form data
interface FormData {
  wentToBedTime: Dayjs
  getUpTime: Dayjs
  leftBedDuration: number
  leftBedAlarmLevel: AlarmLevel
  minHeartRate: number
  heartRateSlowDuration: number
  heartRateSlowAlarmLevel: AlarmLevel
  maxHeartRate: number
  heartRateFastDuration: number
  heartRateFastAlarmLevel: AlarmLevel
  minBreathRate: number
  breathRateSlowDuration: number
  breathRateSlowAlarmLevel: AlarmLevel
  maxBreathRate: number
  breathRateFastDuration: number
  breathRateFastAlarmLevel: AlarmLevel
  breathPauseDuration: number
  breathPauseAlarmLevel: AlarmLevel
  bodyMoveDuration: number
  bodyMoveAlarmLevel: AlarmLevel
  nobodyMoveDuration: number
  nobodyMoveAlarmLevel: AlarmLevel
  noTurnOverDuration: number
  noTurnOverAlarmLevel: AlarmLevel
  situpAlarmLevel: AlarmLevel
  onbedDuration: number
  onbedAlarmLevel: AlarmLevel
  fallAlarmLevel: AlarmLevel
}

const formData = ref<FormData>({
  wentToBedTime: dayjs().hour(22).minute(0),
  getUpTime: dayjs().hour(6).minute(0),
  leftBedDuration: 0,
  leftBedAlarmLevel: 'disabled',
  minHeartRate: 45,
  heartRateSlowDuration: 0,
  heartRateSlowAlarmLevel: 'disabled',
  maxHeartRate: 110,
  heartRateFastDuration: 0,
  heartRateFastAlarmLevel: 'disabled',
  minBreathRate: 10,
  breathRateSlowDuration: 0,
  breathRateSlowAlarmLevel: 'disabled',
  maxBreathRate: 22,
  breathRateFastDuration: 0,
  breathRateFastAlarmLevel: 'disabled',
  breathPauseDuration: 15,
  breathPauseAlarmLevel: 'disabled',
  bodyMoveDuration: 5,
  bodyMoveAlarmLevel: 'disabled',
  nobodyMoveDuration: 45,
  nobodyMoveAlarmLevel: 'disabled',
  noTurnOverDuration: 45,
  noTurnOverAlarmLevel: 'disabled',
  situpAlarmLevel: 'disabled',
  onbedDuration: 3 * 60,
  onbedAlarmLevel: 'disabled',
  fallAlarmLevel: 'disabled',
})

// Helper function to get resident display name
const getResidentDisplayName = (resident: CardOverviewItem['residents'][0]): string => {
  if (resident.nickname) {
    return resident.nickname
  }
  const parts: string[] = []
  if (resident.first_name) parts.push(resident.first_name)
  if (resident.last_name) parts.push(resident.last_name)
  return parts.length > 0 ? parts.join(' ') : '-'
}

// Load device and card info
onMounted(async () => {
  if (!deviceId.value) {
    message.error('Device ID is required')
    router.go(-1)
    return
  }

  try {
    // Get card by device ID
    const card = cardStore.getCardByDeviceId(deviceId.value)
    if (card) {
      cardInfo.value = card
      // Find device info
      const device = card.devices.find(d => d.device_id === deviceId.value)
      if (device) {
        deviceInfo.value = device
      }
    } else {
      // If card not in cache, try to load it
      // Note: This might need a different API to get device info directly
      message.warning('Device information not found')
    }

    // Load monitor settings
    const settings = await getSleepaceDeviceMonitorSettingsApi(deviceId.value)
    
    // Convert settings to form data
    formData.value.wentToBedTime = dayjs()
      .hour(settings.left_bed_start_hour)
      .minute(settings.left_bed_start_minute)
    formData.value.getUpTime = dayjs()
      .hour(settings.left_bed_end_hour)
      .minute(settings.left_bed_end_minute)
    
    formData.value.leftBedDuration = settings.left_bed_duration
    formData.value.leftBedAlarmLevel = settings.left_bed_alarm_level || 'disabled'
    
    formData.value.minHeartRate = settings.min_heart_rate
    formData.value.heartRateSlowDuration = settings.heart_rate_slow_duration
    formData.value.heartRateSlowAlarmLevel = settings.heart_rate_slow_alarm_level || 'disabled'
    
    formData.value.maxHeartRate = settings.max_heart_rate
    formData.value.heartRateFastDuration = settings.heart_rate_fast_duration
    formData.value.heartRateFastAlarmLevel = settings.heart_rate_fast_alarm_level || 'disabled'
    
    formData.value.minBreathRate = settings.min_breath_rate
    formData.value.breathRateSlowDuration = settings.breath_rate_slow_duration
    formData.value.breathRateSlowAlarmLevel = settings.breath_rate_slow_alarm_level || 'disabled'
    
    formData.value.maxBreathRate = settings.max_breath_rate
    formData.value.breathRateFastDuration = settings.breath_rate_fast_duration
    formData.value.breathRateFastAlarmLevel = settings.breath_rate_fast_alarm_level || 'disabled'
    
    formData.value.breathPauseDuration = settings.breath_pause_duration
    formData.value.breathPauseAlarmLevel = settings.breath_pause_alarm_level || 'disabled'
    
    formData.value.bodyMoveDuration = settings.body_move_duration
    formData.value.bodyMoveAlarmLevel = settings.body_move_alarm_level || 'disabled'
    
    formData.value.nobodyMoveDuration = settings.nobody_move_duration
    formData.value.nobodyMoveAlarmLevel = settings.nobody_move_alarm_level || 'disabled'
    
    formData.value.noTurnOverDuration = settings.no_turn_over_duration
    formData.value.noTurnOverAlarmLevel = settings.no_turn_over_alarm_level || 'disabled'
    
    formData.value.situpAlarmLevel = settings.situp_alarm_level || 'disabled'
    
    formData.value.onbedDuration = settings.onbed_duration
    formData.value.onbedAlarmLevel = settings.onbed_alarm_level || 'disabled'
    
    formData.value.fallAlarmLevel = settings.fall_alarm_level || 'disabled'
    
    // Save original data for change detection
    originalData.value = JSON.parse(JSON.stringify(formData.value))
  } catch (error: any) {
    console.error('Failed to load monitor settings:', error)
    message.error(error?.message || 'Failed to load monitor settings')
  }
})

const handleSubmit = () => {
  formRef.value
    .validate()
    .then(async () => {
      const data = {
        left_bed_start_hour: formData.value.wentToBedTime.hour(),
        left_bed_start_minute: formData.value.wentToBedTime.minute(),
        left_bed_end_hour: formData.value.getUpTime.hour(),
        left_bed_end_minute: formData.value.getUpTime.minute(),
        left_bed_duration: formData.value.leftBedDuration,
        left_bed_alarm_level: formData.value.leftBedAlarmLevel,
        min_heart_rate: formData.value.minHeartRate,
        heart_rate_slow_duration: formData.value.heartRateSlowDuration,
        heart_rate_slow_alarm_level: formData.value.heartRateSlowAlarmLevel,
        max_heart_rate: formData.value.maxHeartRate,
        heart_rate_fast_duration: formData.value.heartRateFastDuration,
        heart_rate_fast_alarm_level: formData.value.heartRateFastAlarmLevel,
        min_breath_rate: formData.value.minBreathRate,
        breath_rate_slow_duration: formData.value.breathRateSlowDuration,
        breath_rate_slow_alarm_level: formData.value.breathRateSlowAlarmLevel,
        max_breath_rate: formData.value.maxBreathRate,
        breath_rate_fast_duration: formData.value.breathRateFastDuration,
        breath_rate_fast_alarm_level: formData.value.breathRateFastAlarmLevel,
        breath_pause_duration: formData.value.breathPauseDuration,
        breath_pause_alarm_level: formData.value.breathPauseAlarmLevel,
        body_move_duration: formData.value.bodyMoveDuration,
        body_move_alarm_level: formData.value.bodyMoveAlarmLevel,
        nobody_move_duration: formData.value.nobodyMoveDuration,
        nobody_move_alarm_level: formData.value.nobodyMoveAlarmLevel,
        no_turn_over_duration: formData.value.noTurnOverDuration,
        no_turn_over_alarm_level: formData.value.noTurnOverAlarmLevel,
        situp_alarm_level: formData.value.situpAlarmLevel,
        onbed_duration: formData.value.onbedDuration,
        onbed_alarm_level: formData.value.onbedAlarmLevel,
        fall_alarm_level: formData.value.fallAlarmLevel,
      }
      
      // Check if data changed
      const changed = JSON.stringify(data) !== JSON.stringify(originalData.value)
      if (!changed) {
        message.info('No changes to save')
        router.go(-1)
        return
      }
      
      await updateSleepaceDeviceMonitorSettingsApi(deviceId.value, data)
      message.success('Settings saved successfully')
      router.go(-1)
    })
    .catch((error) => {
      console.log('Validation error:', error)
      message.error('Please fill in all required fields')
    })
}

const handleCancel = () => {
  router.go(-1)
}

// Navigate back to card detail page
const goBackToCard = () => {
  if (cardInfo.value?.card_id) {
    router.push(`/monitoring/detail/${cardInfo.value.card_id}`)
  } else {
    router.go(-1)
  }
}

// Navigate to home page
const goHome = () => {
  router.push('/monitoring/overview')
}
</script>

<style scoped>
.form-container {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.form-container :deep(.ant-form-item-label > label) {
  font-weight: bold;
}

.information-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.information-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.section {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;
}

.section img {
  width: 20px;
  height: 20px;
}

.buttons-section {
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
}

.section-title {
  font-weight: bold;
  font-size: 18px;
  color: #333;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-button {
  text-align: center;
  padding-left: 40px;
  padding-right: 40px;
}

a-form-item {
  margin-bottom: 16px;
}
</style>

