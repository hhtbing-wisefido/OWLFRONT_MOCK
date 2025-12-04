<template>
  <div style="padding: 15px">
    <div class="form-container">
      <h3 class="tips-title">
        Tips: This page sets the alarm mode template for all devices. 
        Individual device configurations can be adjusted in Device Settings.
      </h3>
      
      <div class="section-column">
        <!-- Common, SleepPad, Radar Sections - 3 columns side by side -->
        <div class="section-row">
          <!-- Common Section -->
          <div class="section">
            <span class="section-title">Common</span>
            <div class="section-item">
              <span class="item-title" :style="{ color: getColor(formData.OfflineAlarm) }">
                Offline alarm
              </span>
              <a-select
                v-model:value="formData.OfflineAlarm"
                style="width: 120px"
                :options="dangerLevelOptions"
              />
            </div>
            <div class="section-item">
              <span class="item-title" :style="{ color: getColor(formData.LowBattery) }">
                Low battery alarm
              </span>
              <a-select
                v-model:value="formData.LowBattery"
                style="width: 120px"
                :options="dangerLevelOptions"
              />
            </div>
            <div class="section-item">
              <span class="item-title" :style="{ color: getColor(formData.DeviceFailure) }">
                Device failure alarm
              </span>
              <a-select
                v-model:value="formData.DeviceFailure"
                style="width: 120px"
                :options="dangerLevelOptions"
              />
            </div>
          </div>

          <!-- SleepPad Monitor Section -->
          <div class="section">
            <span class="section-title">SleepPad Monitor</span>
            <div
              v-for="(level, alarmType) in formData.device_alarms?.SleepPad || {}"
              :key="String(alarmType)"
              class="section-item"
            >
              <span class="item-title" :style="{ color: getColor(level) }">
                {{ formatAlarmName(String(alarmType)) }}
              </span>
              <a-select
                v-model:value="formData.device_alarms.SleepPad![String(alarmType)]"
                style="width: 120px"
                :options="dangerLevelOptions"
              />
            </div>
          </div>

          <!-- Radar Monitor Section -->
          <div class="section">
            <span class="section-title">Radar Monitor</span>
            <div
              v-for="(level, alarmType) in formData.device_alarms?.Radar || {}"
              :key="String(alarmType)"
              class="section-item"
            >
              <span class="item-title" :style="{ color: getColor(level) }">
                {{ formatAlarmName(String(alarmType)) }}
              </span>
              <a-select
                v-model:value="formData.device_alarms.Radar![String(alarmType)]"
                style="width: 120px"
                :options="dangerLevelOptions"
              />
            </div>
          </div>
        </div>

        <!-- Alarm Notification Rules Section -->
        <div class="section-row">
          <div class="section">
            <span class="section-title">Alarm Notification Rules (Default)</span>
            <div class="section-item">
              <span class="item-title">EMERGENCY / ALERT</span>
              <div style="display: flex; align-items: center; gap: 16px;">
                <a-checkbox-group v-model:value="emergencyChannelsForUI">
                  <a-checkbox value="WEB">Web</a-checkbox>
                  <a-checkbox value="APP">APP</a-checkbox>
                </a-checkbox-group>
                <a-checkbox :checked="true" disabled style="color: #888">EMAIL (future support)</a-checkbox>
                <a-checkbox :checked="true" disabled style="color: #888">SMS (future support)</a-checkbox>
              </div>
            </div>
            <div class="section-item">
              <span class="item-title">CRITICAL / ERROR / WARNING</span>
              <a-checkbox-group v-model:value="notificationChannels.CRITICAL">
                <a-checkbox value="WEB">Web</a-checkbox>
                <a-checkbox value="APP">APP</a-checkbox>
                <a-checkbox value="EMAIL" disabled style="color: #888">EMAIL (future support)</a-checkbox>
                <a-checkbox value="SMS" disabled style="color: #888">SMS (future support)</a-checkbox>
              </a-checkbox-group>
            </div>
          </div>
        </div>

        <!-- Cloud Vital Alarm Threshold Section -->
        <div class="section-row">
          <div class="section" style="width: 100%; align-items: flex-start !important;">
            <span class="section-title" style="align-self: flex-start;">Cloud Vital Alarm Threshold</span>
            
            <div style="display: flex; gap: 50px; align-items: flex-start; width: 100%; justify-content: flex-start;">
              <!-- Heart Rate Thresholds -->
              <div style="flex: 1; align-self: flex-start;">
                <div style="font-weight: bold; margin-bottom: 12px; text-align: left;">Heart Rate (HR)</div>
              <div class="threshold-item" style="justify-content: flex-start; align-items: flex-start;">
                <span>EMERGENCY:</span>
                <span style="margin: 0 8px">Low:</span>
                <a-input-number
                  v-model:value="hrEmergencyMin"
                  :min="0"
                  :max="200"
                  style="width: 60px; margin: 0 4px"
                />
                <span>-</span>
                <a-input-number
                  v-model:value="hrEmergencyMax"
                  :min="0"
                  :max="200"
                  style="width: 60px; margin: 0 4px"
                />
                <span style="margin: 0 8px">High:</span>
                <a-input-number
                  v-model:value="hrEmergencyHighMin"
                  :min="0"
                  :max="200"
                  style="width: 60px; margin: 0 4px"
                />
                <span>+</span>
                <span style="margin-left: 8px">Duration: {{ hrEmergencyDuration }}s</span>
              </div>
              <div class="threshold-item">
                <span>WARNING:</span>
                <span style="margin: 0 8px">Low:</span>
                <a-input-number
                  v-model:value="hrWarningMin"
                  :min="0"
                  :max="200"
                  style="width: 60px; margin: 0 4px"
                />
                <span>-</span>
                <a-input-number
                  v-model:value="hrWarningMax"
                  :min="0"
                  :max="200"
                  style="width: 60px; margin: 0 4px"
                />
                <span style="margin: 0 8px">High:</span>
                <a-input-number
                  v-model:value="hrWarningHighMin"
                  :min="0"
                  :max="200"
                  style="width: 60px; margin: 0 4px"
                />
                <span>-</span>
                <a-input-number
                  v-model:value="hrWarningHighMax"
                  :min="0"
                  :max="200"
                  style="width: 60px; margin: 0 4px"
                />
                <span style="margin-left: 8px">Duration: {{ hrWarningDuration }}s</span>
              </div>
              <div class="threshold-item">
                <span>Normal:</span>
                <a-input-number
                  v-model:value="hrNormalMin"
                  :min="0"
                  :max="200"
                  style="width: 60px; margin: 0 4px"
                />
                <span>-</span>
                <a-input-number
                  v-model:value="hrNormalMax"
                  :min="0"
                  :max="200"
                  style="width: 60px; margin: 0 4px"
                />
              </div>
              </div>

              <!-- Respiratory Rate Thresholds -->
              <div style="flex: 1; align-self: flex-start;">
                <div style="font-weight: bold; margin-bottom: 12px; text-align: left;">Respiratory Rate (RR)</div>
              <div class="threshold-item" style="justify-content: flex-start; align-items: flex-start;">
                <span>EMERGENCY:</span>
                <span style="margin: 0 8px">Low:</span>
                <a-input-number
                  v-model:value="rrEmergencyMin"
                  :min="0"
                  :max="60"
                  style="width: 60px; margin: 0 4px"
                />
                <span>-</span>
                <a-input-number
                  v-model:value="rrEmergencyMax"
                  :min="0"
                  :max="60"
                  style="width: 60px; margin: 0 4px"
                />
                <span style="margin: 0 8px">High:</span>
                <a-input-number
                  v-model:value="rrEmergencyHighMin"
                  :min="0"
                  :max="60"
                  style="width: 60px; margin: 0 4px"
                />
                <span>+</span>
                <span style="margin-left: 8px">Duration: {{ rrEmergencyDuration }}s</span>
              </div>
              <div class="threshold-item">
                <span>WARNING:</span>
                <span style="margin: 0 8px">Low:</span>
                <a-input-number
                  v-model:value="rrWarningMin"
                  :min="0"
                  :max="60"
                  style="width: 60px; margin: 0 4px"
                />
                <span>-</span>
                <a-input-number
                  v-model:value="rrWarningMax"
                  :min="0"
                  :max="60"
                  style="width: 60px; margin: 0 4px"
                />
                <span style="margin: 0 8px">High:</span>
                <a-input-number
                  v-model:value="rrWarningHighMin"
                  :min="0"
                  :max="60"
                  style="width: 60px; margin: 0 4px"
                />
                <span>-</span>
                <a-input-number
                  v-model:value="rrWarningHighMax"
                  :min="0"
                  :max="60"
                  style="width: 60px; margin: 0 4px"
                />
                <span style="margin-left: 8px">Duration: {{ rrWarningDuration }}s</span>
              </div>
              <div class="threshold-item">
                <span>Normal:</span>
                <a-input-number
                  v-model:value="rrNormalMin"
                  :min="0"
                  :max="60"
                  style="width: 60px; margin: 0 4px"
                />
                <span>-</span>
                <a-input-number
                  v-model:value="rrNormalMax"
                  :min="0"
                  :max="60"
                  style="width: 60px; margin: 0 4px"
                />
              </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Note Section -->
        <div class="section-row">
          <div class="section">
            <span class="section-title">Note</span>
            <div style="color: #666; font-size: 14px; line-height: 1.8">
              <div style="color: #faad14; margin-bottom: 8px;">• Alarm triggered by cloud-based evaluation.</div>
              <div>• Manager: Recall All alarm of Organize; • Nurse/Caregiver: alarm of assigned_only; • Can Modify at users-setting</div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <a-button type="default" @click="handleCancel">Cancel</a-button>
        <a-button
          v-if="canEdit"
          key="submit"
          type="primary"
          :loading="saving"
          @click="saveSettings"
        >
          Save
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getAlarmCloudApi, updateAlarmCloudApi } from '@/api/alarm/alarm'
import type { AlarmCloud, DangerLevel } from '@/api/alarm/model/alarmModel'
import { useUserStore } from '@/store/modules/user'
import { usePermission } from '@/hooks/usePermission'

const router = useRouter()
const userStore = useUserStore()
const { hasRole } = usePermission()

// Permission check
const canEdit = computed(() => hasRole(['SystemAdmin', 'Admin', 'Manager']))

// Loading state
const saving = ref(false)

// Form data
const formData = reactive<AlarmCloud>({
  tenant_id: null,
  OfflineAlarm: 'ERROR',
  LowBattery: 'WARNING',
  DeviceFailure: 'ERROR',
  device_alarms: {
    Radar: {
      Fall: 'EMERGENCY',
      Radar_ApneaHypopnea: 'EMERGENCY',
      Radar_AbnormalHeartRate: 'EMERGENCY',
      Radar_AbnormalRespiratoryRate: 'EMERGENCY',
      Radar_LeftBed: 'WARNING',
      SuspectedFall: 'WARNING',
      VitalsWeak: 'WARNING',
      Stay: 'WARNING',
      NoActivity24h: 'EMERGENCY',
      AngleException: 'WARNING',
    },
    SleepPad: {
      SleepPad_LeftBed: 'WARNING',
      SleepPad_SitUp: 'WARNING',
      SleepPad_ApneaHypopnea: 'EMERGENCY',
      SleepPad_AbnormalHeartRate: 'EMERGENCY',
      SleepPad_AbnormalRespiratoryRate: 'EMERGENCY',
      SleepPad_AbnormalBodyMovement: 'WARNING',
      SleepPad_InBed: 'DISABLE',
    },
  },
  conditions: {
    heart_rate: {
      EMERGENCY: {
        ranges: [{ min: 0, max: 44 }, { min: 116, max: null }],
        duration_sec: 60,
      },
      WARNING: {
        ranges: [{ min: 45, max: 54 }, { min: 96, max: 115 }],
        duration_sec: 300,
      },
      Normal: {
        ranges: [{ min: 55, max: 95 }],
        duration_sec: 0,
      },
    },
    respiratory_rate: {
      EMERGENCY: {
        ranges: [{ min: 0, max: 7 }, { min: 27, max: null }],
        duration_sec: 60,
      },
      WARNING: {
        ranges: [{ min: 8, max: 9 }, { min: 24, max: 26 }],
        duration_sec: 300,
      },
      Normal: {
        ranges: [{ min: 10, max: 23 }],
        duration_sec: 0,
      },
    },
  },
  notification_rules: {
    channels: {
      EMERGENCY: ['WEB', 'APP', 'EMAIL', 'SMS'],
      ALERT: ['WEB', 'APP', 'EMAIL', 'SMS'],
      CRITICAL: ['WEB', 'APP'],
      ERROR: ['WEB', 'APP'],
      WARNING: ['WEB', 'APP'],
    },
  },
})

const originalData = ref<AlarmCloud | null>(null)

// Notification channels
const notificationChannels = reactive<{
  EMERGENCY: ('WEB' | 'APP' | 'EMAIL' | 'SMS')[]
  CRITICAL: ('WEB' | 'APP' | 'EMAIL' | 'SMS')[]
}>({
  EMERGENCY: ['WEB', 'APP', 'EMAIL', 'SMS'], // EMAIL and SMS are always selected (disabled)
  CRITICAL: ['WEB', 'APP'],
})

// Computed property for EMERGENCY UI (only WEB and APP are selectable, EMAIL/SMS are always selected but disabled)
const emergencyChannelsForUI = computed({
  get: () => {
    return notificationChannels.EMERGENCY.filter(ch => ch !== 'EMAIL' && ch !== 'SMS')
  },
  set: (value: ('WEB' | 'APP')[]) => {
    // Always include EMAIL and SMS
    notificationChannels.EMERGENCY = [...value, 'EMAIL', 'SMS']
  },
})

// Danger level options
const dangerLevelOptions = [
  { value: 'DISABLE', label: 'Disabled' },
  { value: 'EMERGENCY', label: 'EMERGENCY' },
  { value: 'WARNING', label: 'WARNING' },
  { value: 'ERROR', label: 'ERROR' },
  { value: 'INFORMATIONAL', label: 'INFORMATIONAL' },
  { value: 'CRITICAL', label: 'CRITICAL' },
]

// Heart Rate threshold values (computed from conditions)
const hrEmergencyMin = ref(0)
const hrEmergencyMax = ref(44)
const hrEmergencyHighMin = ref(116) // High range for EMERGENCY
const hrEmergencyDuration = ref(60)
const hrWarningMin = ref(45)
const hrWarningMax = ref(54)
const hrWarningHighMin = ref(96) // High range for WARNING
const hrWarningHighMax = ref(115)
const hrWarningDuration = ref(300)
const hrNormalMin = ref(55)
const hrNormalMax = ref(95)

// Respiratory Rate threshold values (computed from conditions)
const rrEmergencyMin = ref(0)
const rrEmergencyMax = ref(7)
const rrEmergencyHighMin = ref(27) // High range for EMERGENCY
const rrEmergencyDuration = ref(60)
const rrWarningMin = ref(8)
const rrWarningMax = ref(9)
const rrWarningHighMin = ref(24) // High range for WARNING
const rrWarningHighMax = ref(26)
const rrWarningDuration = ref(300)
const rrNormalMin = ref(10)
const rrNormalMax = ref(23)

// Watch threshold changes and update conditions
watch(
  [
    hrEmergencyMin,
    hrEmergencyMax,
    hrEmergencyHighMin,
    hrEmergencyDuration,
    hrWarningMin,
    hrWarningMax,
    hrWarningHighMin,
    hrWarningHighMax,
    hrWarningDuration,
    hrNormalMin,
    hrNormalMax,
  ],
  () => {
    if (formData.conditions?.heart_rate) {
      formData.conditions.heart_rate.EMERGENCY = {
        ranges: [
          { min: hrEmergencyMin.value, max: hrEmergencyMax.value },
          { min: hrEmergencyHighMin.value, max: null },
        ],
        duration_sec: hrEmergencyDuration.value,
      }
      formData.conditions.heart_rate.WARNING = {
        ranges: [
          { min: hrWarningMin.value, max: hrWarningMax.value },
          { min: hrWarningHighMin.value, max: hrWarningHighMax.value },
        ],
        duration_sec: hrWarningDuration.value,
      }
      formData.conditions.heart_rate.Normal = {
        ranges: [{ min: hrNormalMin.value, max: hrNormalMax.value }],
        duration_sec: 0,
      }
    }
  },
  { deep: true },
)

watch(
  [
    rrEmergencyMin,
    rrEmergencyMax,
    rrEmergencyHighMin,
    rrEmergencyDuration,
    rrWarningMin,
    rrWarningMax,
    rrWarningHighMin,
    rrWarningHighMax,
    rrWarningDuration,
    rrNormalMin,
    rrNormalMax,
  ],
  () => {
    if (formData.conditions?.respiratory_rate) {
      formData.conditions.respiratory_rate.EMERGENCY = {
        ranges: [
          { min: rrEmergencyMin.value, max: rrEmergencyMax.value },
          { min: rrEmergencyHighMin.value, max: null },
        ],
        duration_sec: rrEmergencyDuration.value,
      }
      formData.conditions.respiratory_rate.WARNING = {
        ranges: [
          { min: rrWarningMin.value, max: rrWarningMax.value },
          { min: rrWarningHighMin.value, max: rrWarningHighMax.value },
        ],
        duration_sec: rrWarningDuration.value,
      }
      formData.conditions.respiratory_rate.Normal = {
        ranges: [{ min: rrNormalMin.value, max: rrNormalMax.value }],
        duration_sec: 0,
      }
    }
  },
  { deep: true },
)

// Watch notification channels
watch(
  () => notificationChannels.EMERGENCY,
  (newVal) => {
    if (formData.notification_rules) {
      // EMAIL and SMS are always included for EMERGENCY/ALERT
      formData.notification_rules.channels = {
        ...formData.notification_rules.channels,
        EMERGENCY: newVal, // Already includes EMAIL and SMS
        ALERT: newVal,
      }
    }
  },
  { deep: true },
)

watch(
  () => notificationChannels.CRITICAL,
  (newVal) => {
    if (formData.notification_rules) {
      formData.notification_rules.channels = {
        ...formData.notification_rules.channels,
        CRITICAL: newVal,
        ERROR: newVal,
        WARNING: newVal,
      }
    }
  },
  { deep: true },
)

// Format alarm name for display
const formatAlarmName = (alarmType: string): string => {
  const nameMap: Record<string, string> = {
    Fall: 'Fall alarm',
    Radar_ApneaHypopnea: 'Apnea/Hypopnea alarm',
    Radar_AbnormalHeartRate: 'Abnormal heart rate alarm',
    Radar_AbnormalRespiratoryRate: 'Abnormal breathing alarm',
    Radar_LeftBed: 'Left bed alarm',
    SuspectedFall: 'SuspectedFall alarm',
    VitalsWeak: 'Vitals weak alarm',
    Stay: 'Stay alarm',
    NoActivity24h: 'No activities alarm',
    AngleException: 'Angle exception alarm',
    SleepPad_LeftBed: 'Left bed alarm',
    SleepPad_SitUp: 'Sitting up alarm',
    SleepPad_ApneaHypopnea: 'Apnea/Hypopnea alarm',
    SleepPad_AbnormalHeartRate: 'Abnormal heart rate alarm',
    SleepPad_AbnormalRespiratoryRate: 'Abnormal breathing alarm',
    SleepPad_AbnormalBodyMovement: 'Abnormal body movement alarm',
    SleepPad_InBed: 'In bed alarm',
  }
  return nameMap[alarmType] || alarmType
}

// Get color based on danger level
const getColor = (level?: DangerLevel): string => {
  if (!level || level === 'DISABLE') return '#000'
  if (level === 'EMERGENCY') return '#ff4d4f'
  if (level === 'WARNING') return '#faad14'
  if (level === 'ERROR') return '#ff4d4f'
  if (level === 'CRITICAL') return '#ff4d4f'
  return '#000'
}

// Load configuration
const loadConfiguration = async () => {
  try {
    const tenantId = userStore.getUserInfo?.tenant_id || null
    const config = await getAlarmCloudApi({ tenant_id: tenantId })
    
    // Merge with default values
    Object.assign(formData, {
      OfflineAlarm: config.OfflineAlarm || 'ERROR',
      LowBattery: config.LowBattery || 'WARNING',
      DeviceFailure: config.DeviceFailure || 'ERROR',
      device_alarms: {
        Radar: {
          ...formData.device_alarms.Radar,
          ...(config.device_alarms?.Radar || {}),
        },
        SleepPad: {
          ...formData.device_alarms.SleepPad,
          ...(config.device_alarms?.SleepPad || {}),
        },
      },
      conditions: config.conditions || formData.conditions,
      notification_rules: config.notification_rules || formData.notification_rules,
    })

    // Update threshold values from conditions
    if (formData.conditions?.heart_rate) {
      const hrEmergency = formData.conditions.heart_rate.EMERGENCY
      if (hrEmergency?.ranges?.[0]) {
        hrEmergencyMin.value = hrEmergency.ranges[0].min || 0
        hrEmergencyMax.value = hrEmergency.ranges[0].max || 44
        hrEmergencyDuration.value = hrEmergency.duration_sec || 60
      }
      if (hrEmergency?.ranges?.[1]) {
        hrEmergencyHighMin.value = hrEmergency.ranges[1].min || 116
      }
      const hrWarning = formData.conditions.heart_rate.WARNING
      if (hrWarning?.ranges?.[0]) {
        hrWarningMin.value = hrWarning.ranges[0].min || 45
        hrWarningMax.value = hrWarning.ranges[0].max || 54
        hrWarningDuration.value = hrWarning.duration_sec || 300
      }
      if (hrWarning?.ranges?.[1]) {
        hrWarningHighMin.value = hrWarning.ranges[1].min || 96
        hrWarningHighMax.value = hrWarning.ranges[1].max || 115
      }
      const hrNormal = formData.conditions.heart_rate.Normal
      if (hrNormal?.ranges?.[0]) {
        hrNormalMin.value = hrNormal.ranges[0].min || 55
        hrNormalMax.value = hrNormal.ranges[0].max || 95
      }
    }

    if (formData.conditions?.respiratory_rate) {
      const rrEmergency = formData.conditions.respiratory_rate.EMERGENCY
      if (rrEmergency?.ranges?.[0]) {
        rrEmergencyMin.value = rrEmergency.ranges[0].min || 0
        rrEmergencyMax.value = rrEmergency.ranges[0].max || 7
        rrEmergencyDuration.value = rrEmergency.duration_sec || 60
      }
      if (rrEmergency?.ranges?.[1]) {
        rrEmergencyHighMin.value = rrEmergency.ranges[1].min || 27
      }
      const rrWarning = formData.conditions.respiratory_rate.WARNING
      if (rrWarning?.ranges?.[0]) {
        rrWarningMin.value = rrWarning.ranges[0].min || 8
        rrWarningMax.value = rrWarning.ranges[0].max || 9
        rrWarningDuration.value = rrWarning.duration_sec || 300
      }
      if (rrWarning?.ranges?.[1]) {
        rrWarningHighMin.value = rrWarning.ranges[1].min || 24
        rrWarningHighMax.value = rrWarning.ranges[1].max || 26
      }
      const rrNormal = formData.conditions.respiratory_rate.Normal
      if (rrNormal?.ranges?.[0]) {
        rrNormalMin.value = rrNormal.ranges[0].min || 10
        rrNormalMax.value = rrNormal.ranges[0].max || 23
      }
    }

    // Update notification channels
    if (formData.notification_rules?.channels?.EMERGENCY) {
      const emergencyChannels = formData.notification_rules.channels.EMERGENCY as ('WEB' | 'APP' | 'EMAIL' | 'SMS')[]
      // Filter out EMAIL and SMS for UI (they are always selected but disabled)
      notificationChannels.EMERGENCY = emergencyChannels.filter(ch => ch !== 'EMAIL' && ch !== 'SMS')
      // Ensure EMAIL and SMS are in the array (they should always be selected)
      if (!emergencyChannels.includes('EMAIL')) {
        emergencyChannels.push('EMAIL')
      }
      if (!emergencyChannels.includes('SMS')) {
        emergencyChannels.push('SMS')
      }
      // Update formData to ensure EMAIL and SMS are always included
      if (formData.notification_rules.channels) {
        formData.notification_rules.channels.EMERGENCY = emergencyChannels
        formData.notification_rules.channels.ALERT = emergencyChannels
      }
    } else {
      // Set default: always include EMAIL and SMS for EMERGENCY/ALERT
      if (formData.notification_rules?.channels) {
        formData.notification_rules.channels.EMERGENCY = ['WEB', 'APP', 'EMAIL', 'SMS']
        formData.notification_rules.channels.ALERT = ['WEB', 'APP', 'EMAIL', 'SMS']
      }
    }
    if (formData.notification_rules?.channels?.CRITICAL) {
      notificationChannels.CRITICAL = formData.notification_rules.channels.CRITICAL as ('WEB' | 'APP' | 'EMAIL' | 'SMS')[]
    } else if (formData.notification_rules?.channels?.WARNING) {
      // Fallback to WARNING if CRITICAL not set
      notificationChannels.CRITICAL = formData.notification_rules.channels.WARNING as ('WEB' | 'APP' | 'EMAIL' | 'SMS')[]
    }

    originalData.value = JSON.parse(JSON.stringify(formData))
  } catch (error) {
    console.error('Failed to load alarm cloud configuration:', error)
    message.error('Failed to load configuration')
  }
}

// Save settings
const saveSettings = async () => {
  if (!canEdit.value) {
    message.warning('You do not have permission to edit')
    return
  }

  saving.value = true
  try {
    const updateParams = {
      OfflineAlarm: formData.OfflineAlarm,
      LowBattery: formData.LowBattery,
      DeviceFailure: formData.DeviceFailure,
      device_alarms: formData.device_alarms,
      conditions: formData.conditions,
      notification_rules: formData.notification_rules,
    }

    await updateAlarmCloudApi(updateParams)
    message.success('Save successfully')
    originalData.value = JSON.parse(JSON.stringify(formData))
  } catch (error) {
    console.error('Failed to save alarm cloud configuration:', error)
    message.error('Failed to save configuration')
  } finally {
    saving.value = false
  }
}

// Cancel
const handleCancel = () => {
  router.go(-1)
}

// Initialize
onMounted(() => {
  loadConfiguration()
})
</script>

<style scoped>
.form-container {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.tips-title {
  font-size: 16px;
  color: #ff8b7f;
  margin-bottom: 20px;
}

.section-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 50px;
  margin-bottom: 30px;
  align-items: flex-start;
}

.section-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.section-item {
  display: flex;
  gap: 16px;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  align-self: flex-start;
}

.item-title {
  min-width: 200px;
  text-align: right;
}

.threshold-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.footer {
  padding: 50px;
  display: flex;
  justify-content: center;
  gap: 60px;
}

.footer .ant-btn {
  height: auto !important;
  line-height: 1.5;
  padding: 10px 50px 10px 50px;
}
</style>

