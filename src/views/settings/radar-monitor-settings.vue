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
        <h3 class="section-title">Radar Monitoring Configuration (Multiple Options Available)</h3>
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
        
        <!-- monitoring mode -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div class="row-container">
              <span>Monitoring Mode:</span>
              <a-radio-group v-model:value="formData.radarFunctionMode">
                <a-radio
                  v-for="item in radarFunctionModeOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </a-radio>
              </a-radio-group>
            </div>
          </a-col>
        </a-row>
        <a-divider />
        
        <!-- suspect fall -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div class="row-container">
              <a-select
                v-model:value="formData.fallAlarmLevel"
                style="width: 120px"
                :disabled="!fallFunctionsEnable()"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Suspect fall last for</span>
              <a-input-number
                v-model:value="formData.suspectedFallDuration"
                :disabled="formData.fallAlarmLevel === 'disabled' || !fallFunctionsEnable()"
                :min="0"
                :max="300"
                :step="10"
                style="width: 100px"
              />
              <span>seconds</span>
              <a-tooltip :title="fallTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- posture detection -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div class="row-container">
              <a-select
                v-model:value="formData.postureDetectionAlarmLevel"
                style="width: 120px"
                :disabled="!fallFunctionsEnable()"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Posture detection</span>
            </div>
          </a-col>
        </a-row>
        
        <!-- sitting on ground -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div class="row-container">
              <a-select
                v-model:value="formData.sittingOnGroundAlarmLevel"
                style="width: 120px"
                :disabled="formData.postureDetectionAlarmLevel === 'disabled' || !fallFunctionsEnable()"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Sitting on ground</span>
              <a-input-number
                v-model:value="formData.sittingOnGroundDuration"
                :disabled="formData.postureDetectionAlarmLevel === 'disabled' || formData.sittingOnGroundAlarmLevel === 'disabled' || !fallFunctionsEnable()"
                :min="0"
                :max="600"
                :step="10"
                style="width: 100px"
              />
              <span>seconds</span>
              <a-tooltip :title="sittingOnGroundTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- stay -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div class="row-container">
              <a-select
                v-model:value="formData.stayAlarmLevel"
                style="width: 120px"
                :disabled="!fallFunctionsEnable()"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Stayed last for</span>
              <a-input-number
                v-model:value="formData.stayDetectionDuration"
                :disabled="formData.stayAlarmLevel === 'disabled' || !fallFunctionsEnable()"
                :min="0"
                :max="120"
                :step="10"
                style="width: 100px"
              />
              <span>minutes</span>
              <a-tooltip :title="stayTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        <a-divider />
        
        <!-- leave bed -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div class="row-container">
              <a-select
                v-model:value="formData.leaveAlarmLevel"
                style="width: 120px"
                :disabled="!sleepFunctionsEnable()"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>During normal rest time, leaving bed (over)</span>
              <a-select
                v-model:value="formData.leaveDetectionDuration"
                style="width: 120px"
                :disabled="formData.leaveAlarmLevel === 'disabled' || !sleepFunctionsEnable()"
              >
                <a-select-option v-for="option in leftBedDurationOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <a-tooltip :title="leftBedTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- sleep duration -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div class="row-container">
              <span>Went to bed time</span>
              <a-time-picker
                v-model:value="formData.wentToBedTime"
                format="HH:mm"
                :minute-step="10"
                :disabled="formData.leaveAlarmLevel === 'disabled' || !sleepFunctionsEnable()"
              />
              <span>Get up time</span>
              <a-time-picker
                v-model:value="formData.getUpTime"
                format="HH:mm"
                :minute-step="10"
                :disabled="formData.leaveAlarmLevel === 'disabled' || !sleepFunctionsEnable()"
              />
            </div>
          </a-col>
        </a-row>
        
        <!-- heart rate too slow -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div class="row-container">
              <a-select
                v-model:value="formData.heartRateSlowAlarmLevel"
                style="width: 120px"
                :disabled="!sleepFunctionsEnable()"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Heart rate is below</span>
              <a-input-number
                v-model:value="formData.lowerHeartRate"
                :disabled="formData.heartRateSlowAlarmLevel === 'disabled' || !sleepFunctionsEnable()"
                :min="0"
                :max="60"
                :step="5"
                style="width: 100px"
              />
              <span>bpm last for 1 minute</span>
              <a-tooltip :title="slowHeartRateTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- heart rate too fast -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div class="row-container">
              <a-select
                v-model:value="formData.heartRateFastAlarmLevel"
                style="width: 120px"
                :disabled="!sleepFunctionsEnable()"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Heart rate is above</span>
              <a-input-number
                v-model:value="formData.upperHeartRate"
                :disabled="formData.heartRateFastAlarmLevel === 'disabled' || !sleepFunctionsEnable()"
                :min="70"
                :max="150"
                :step="5"
                style="width: 100px"
              />
              <span>bpm last for 1 minute</span>
              <a-tooltip :title="fastHeartRateTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- breath rate too slow -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div class="row-container">
              <a-select
                v-model:value="formData.breathRateSlowAlarmLevel"
                style="width: 120px"
                :disabled="!sleepFunctionsEnable()"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Respiratory rate is below</span>
              <a-input-number
                v-model:value="formData.lowerBreathRate"
                :disabled="formData.breathRateSlowAlarmLevel === 'disabled' || !sleepFunctionsEnable()"
                :min="6"
                :max="20"
                :step="2"
                style="width: 100px"
              />
              <span>rpm last for 1 minute</span>
              <a-tooltip :title="slowBreathRateTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- breath rate too fast -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div class="row-container">
              <a-select
                v-model:value="formData.breathRateFastAlarmLevel"
                style="width: 120px"
                :disabled="!sleepFunctionsEnable()"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Respiratory rate is above</span>
              <a-input-number
                v-model:value="formData.upperBreathRate"
                :disabled="formData.breathRateFastAlarmLevel === 'disabled' || !sleepFunctionsEnable()"
                :min="22"
                :max="40"
                :step="2"
                style="width: 100px"
              />
              <span>rpm last for 1 minute</span>
              <a-tooltip :title="fastBreathRateTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- weak vital sign -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div class="row-container">
              <a-select
                v-model:value="formData.weakVitalAlarmLevel"
                style="width: 120px"
                :disabled="!sleepFunctionsEnable()"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Weak vital sign last for</span>
              <a-input-number
                v-model:value="formData.weakVitalDuration"
                :disabled="formData.weakVitalAlarmLevel === 'disabled' || !sleepFunctionsEnable()"
                :min="1"
                :max="15"
                style="width: 100px"
              />
              <span>minutes</span>
              <a-tooltip :title="weakVitalTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
        
        <!-- weak vital sensitivity-->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div class="row-container">
              <span>Sensitivity</span>
              <div style="width: 200px" class="slider-wrapper">
                <a-slider
                  v-model:value="formData.weakVitalSensitivity"
                  :disabled="!sleepFunctionsEnable()"
                  :min="1"
                  :max="99"
                />
              </div>
            </div>
          </a-col>
        </a-row>
        <a-divider />
        
        <!-- inactivity -->
        <a-row :gutter="[0, 24]" class="section" justify="space-between">
          <a-col :span="24">
            <div class="row-container">
              <a-select
                v-model:value="formData.inactivityAlarmLevel"
                style="width: 120px"
                :disabled="!sleepFunctionsEnable()"
              >
                <a-select-option v-for="option in alarmLevelOptions" :key="option.value">
                  {{ option.label }}
                </a-select-option>
              </a-select>
              <span>Inactive for 24 hours</span>
              <a-tooltip :title="inactivityTitle" :overlayStyle="{ maxWidth: '800px' }">
                <QuestionCircleOutlined style="margin-left: 10px; font-size: 16px; color: #1890ff; cursor: pointer" />
              </a-tooltip>
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
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'
import {
  getRadarDeviceMonitorSettingsApi,
  updateRadarDeviceMonitorSettingsApi,
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

const weakVitalTitle =
  'It is recommended to set for residents who are in need of close attention on the abnormal body movements.'

const fallTitle = ''
const inactivityTitle = 'Alarm condition: no in-room or out-room event for more than 24 hours.'
const stayTitle = 'Alarm condition: user enters bathroom for more than the time threshold.'
const sittingOnGroundTitle =
  'Need to turn on the posture detection switch first, and actions similar to sitting on the ground may trigger false alarms.'

// Options
const radarFunctionModeOptions = [
  { value: 3, label: 'People Tracking' },
  { value: 7, label: 'Fall Monitoring' },
  { value: 11, label: 'Sleep Monitoring' },
  { value: 15, label: 'Full Function' },
]

const leftBedDurationOptions = [
  { value: 0, label: 'Immediately' },
  { value: 30, label: '30 Min' },
  { value: 45, label: '45 Min' },
  { value: 60, label: '1 Hr' },
  { value: 90, label: '1 Hr 30 Min' },
  { value: 120, label: '2 Hr' },
  { value: 180, label: '3 Hr' },
  { value: 240, label: '4 Hr' },
]

// Form data
interface FormData {
  radarFunctionMode: number
  suspectedFallDuration: number
  fallAlarmLevel: AlarmLevel
  postureDetectionAlarmLevel: AlarmLevel
  sittingOnGroundDuration: number
  sittingOnGroundAlarmLevel: AlarmLevel
  stayDetectionDuration: number
  stayAlarmLevel: AlarmLevel
  wentToBedTime: Dayjs
  getUpTime: Dayjs
  leaveDetectionDuration: number
  leaveAlarmLevel: AlarmLevel
  lowerHeartRate: number
  heartRateSlowAlarmLevel: AlarmLevel
  upperHeartRate: number
  heartRateFastAlarmLevel: AlarmLevel
  lowerBreathRate: number
  breathRateSlowAlarmLevel: AlarmLevel
  upperBreathRate: number
  breathRateFastAlarmLevel: AlarmLevel
  weakVitalDuration: number
  weakVitalSensitivity: number
  weakVitalAlarmLevel: AlarmLevel
  inactivityAlarmLevel: AlarmLevel
}

const formData = ref<FormData>({
  radarFunctionMode: 15,
  suspectedFallDuration: 0,
  fallAlarmLevel: 'disabled',
  postureDetectionAlarmLevel: 'disabled',
  sittingOnGroundDuration: 0,
  sittingOnGroundAlarmLevel: 'disabled',
  stayDetectionDuration: 0,
  stayAlarmLevel: 'disabled',
  wentToBedTime: dayjs().hour(22).minute(0),
  getUpTime: dayjs().hour(6).minute(0),
  leaveDetectionDuration: 0,
  leaveAlarmLevel: 'disabled',
  lowerHeartRate: 0,
  heartRateSlowAlarmLevel: 'disabled',
  upperHeartRate: 0,
  heartRateFastAlarmLevel: 'disabled',
  lowerBreathRate: 0,
  breathRateSlowAlarmLevel: 'disabled',
  upperBreathRate: 0,
  breathRateFastAlarmLevel: 'disabled',
  weakVitalDuration: 0,
  weakVitalSensitivity: 0,
  weakVitalAlarmLevel: 'disabled',
  inactivityAlarmLevel: 'disabled',
})

// Helper functions
const fallFunctionsEnable = () => {
  return formData.value.radarFunctionMode === 7 || formData.value.radarFunctionMode === 15
}

const sleepFunctionsEnable = () => {
  return formData.value.radarFunctionMode === 11 || formData.value.radarFunctionMode === 15
}

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
      message.warning('Device information not found')
    }

    // Load monitor settings
    const settings = await getRadarDeviceMonitorSettingsApi(deviceId.value)
    
    // Convert settings to form data
    formData.value.radarFunctionMode = settings.radar_function_mode
    formData.value.suspectedFallDuration = settings.suspected_fall_duration * 10  // Convert from seconds to 0.1s units
    formData.value.fallAlarmLevel = settings.fall_alarm_level || 'disabled'
    formData.value.postureDetectionAlarmLevel = settings.posture_detection_alarm_level || 'disabled'
    formData.value.sittingOnGroundDuration = settings.sitting_on_ground_duration
    formData.value.sittingOnGroundAlarmLevel = settings.sitting_on_ground_alarm_level || 'disabled'
    formData.value.stayDetectionDuration = settings.stay_detection_duration
    formData.value.stayAlarmLevel = settings.stay_alarm_level || 'disabled'
    
    formData.value.wentToBedTime = dayjs()
      .hour(settings.leave_detection_start_hour)
      .minute(settings.leave_detection_start_minute)
    formData.value.getUpTime = dayjs()
      .hour(settings.leave_detection_end_hour)
      .minute(settings.leave_detection_end_minute)
    formData.value.leaveDetectionDuration = settings.leave_detection_duration
    formData.value.leaveAlarmLevel = settings.leave_alarm_level || 'disabled'
    
    formData.value.lowerHeartRate = settings.lower_heart_rate
    formData.value.heartRateSlowAlarmLevel = settings.heart_rate_slow_alarm_level || 'disabled'
    formData.value.upperHeartRate = settings.upper_heart_rate
    formData.value.heartRateFastAlarmLevel = settings.heart_rate_fast_alarm_level || 'disabled'
    
    formData.value.lowerBreathRate = settings.lower_breath_rate
    formData.value.breathRateSlowAlarmLevel = settings.breath_rate_slow_alarm_level || 'disabled'
    formData.value.upperBreathRate = settings.upper_breath_rate
    formData.value.breathRateFastAlarmLevel = settings.breath_rate_fast_alarm_level || 'disabled'
    
    formData.value.weakVitalDuration = settings.weak_vital_duration
    formData.value.weakVitalSensitivity = settings.weak_vital_sensitivity
    formData.value.weakVitalAlarmLevel = settings.weak_vital_alarm_level || 'disabled'
    
    formData.value.inactivityAlarmLevel = settings.inactivity_alarm_level || 'disabled'
    
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
        radar_function_mode: formData.value.radarFunctionMode,
        suspected_fall_duration: Math.floor(formData.value.suspectedFallDuration / 10),  // Convert from 0.1s units to seconds
        fall_alarm_level: formData.value.fallAlarmLevel,
        posture_detection_alarm_level: formData.value.postureDetectionAlarmLevel,
        sitting_on_ground_duration: formData.value.sittingOnGroundDuration,
        sitting_on_ground_alarm_level: formData.value.sittingOnGroundAlarmLevel,
        stay_detection_duration: formData.value.stayDetectionDuration,
        stay_alarm_level: formData.value.stayAlarmLevel,
        leave_detection_start_hour: formData.value.wentToBedTime.hour(),
        leave_detection_start_minute: formData.value.wentToBedTime.minute(),
        leave_detection_end_hour: formData.value.getUpTime.hour(),
        leave_detection_end_minute: formData.value.getUpTime.minute(),
        leave_detection_duration: formData.value.leaveDetectionDuration,
        leave_alarm_level: formData.value.leaveAlarmLevel,
        lower_heart_rate: formData.value.lowerHeartRate,
        heart_rate_slow_alarm_level: formData.value.heartRateSlowAlarmLevel,
        upper_heart_rate: formData.value.upperHeartRate,
        heart_rate_fast_alarm_level: formData.value.heartRateFastAlarmLevel,
        lower_breath_rate: formData.value.lowerBreathRate,
        breath_rate_slow_alarm_level: formData.value.breathRateSlowAlarmLevel,
        upper_breath_rate: formData.value.upperBreathRate,
        breath_rate_fast_alarm_level: formData.value.breathRateFastAlarmLevel,
        weak_vital_duration: formData.value.weakVitalDuration,
        weak_vital_sensitivity: formData.value.weakVitalSensitivity,
        weak_vital_alarm_level: formData.value.weakVitalAlarmLevel,
        inactivity_alarm_level: formData.value.inactivityAlarmLevel,
      }
      
      // Check if data changed
      const changed = JSON.stringify(data) !== JSON.stringify(originalData.value)
      if (!changed) {
        message.info('No changes to save')
        router.go(-1)
        return
      }
      
      await updateRadarDeviceMonitorSettingsApi(deviceId.value, data)
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
}

.form-button {
  text-align: center;
  padding-left: 40px;
  padding-right: 40px;
}

a-form-item {
  margin-bottom: 16px;
}

.row-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

::v-deep(.slider-wrapper .ant-slider-track) {
  background-color: #5cd7fe !important;
}

::v-deep(.slider-wrapper .ant-slider-rail) {
  background-color: #dfe4ed !important;
}

::v-deep(.slider-wrapper .ant-slider .ant-slider-handle) {
  border-style: solid !important;
  border-width: 3px !important;
  border-color: #5cd7fe !important;
}
</style>

