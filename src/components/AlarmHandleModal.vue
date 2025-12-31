<template>
  <a-modal
    v-model:visible="localVisible"
    :title="modalTitle"
    :width="modalWidth"
    :z-index="2000"
    :mask-closable="!isUrgentLevel || alarm?.alarm_status !== 'active'"
    :closable="!isUrgentLevel || alarm?.alarm_status !== 'active'"
    :keyboard="!isUrgentLevel || alarm?.alarm_status !== 'active'"
    @cancel="handleCancel"
    :footer="null"
    :wrapClassName="modalWrapClass"
    :bodyStyle="{ padding: '10px 14px' }"
    :centered="isMobile"
  >
    <div v-if="alarm" class="alarm-detail-compact">
      <!-- 优先级标识 -->
      <div class="alarm-level-badge" :class="alarmLevelClass">
        <component :is="alarmLevelIcon" style="font-size: 16px; margin-right: 5px;" />
        <span style="font-size: 13px; font-weight: bold;">{{ alarmLevelText }}</span>
      </div>

      <!-- UL 2560 合规提示 - Level 1/2 必须确认 -->
      <a-alert 
        v-if="isUrgentLevel && alarm.alarm_status === 'active'"
        type="warning" 
        style="margin-top: 8px; padding: 4px 8px;"
        message="Acknowledgment required"
        show-icon
      />

      <!-- 通知信息 - 紧凑布局 -->
      <a-descriptions bordered :column="1" size="small" style="margin-top: 8px;">
        <a-descriptions-item label="Event">
          <span style="font-weight: 600; font-size: 12px;">
            {{ formatAlarmType(alarm.event_type) }}
          </span>
        </a-descriptions-item>
        
        <a-descriptions-item label="Resident">
          {{ card?.card_name || 'Resident' }}
          <span v-if="card?.card_address" style="color: #666; font-size: 11px;">
            ({{ card.card_address }})
          </span>
        </a-descriptions-item>
        
        <a-descriptions-item label="Status">
          <a-tag size="small" :color="alarm.alarm_status === 'active' ? 'red' : 'green'">
            {{ alarm.alarm_status === 'active' ? 'Pending' : 'Acknowledged' }}
          </a-tag>
        </a-descriptions-item>
        
        <a-descriptions-item label="Time">
          {{ formatDateTime(displayTime) }}
          <span style="color: #999; font-size: 10px;">({{ relativeTimeText || 'just now' }})</span>
        </a-descriptions-item>
        
        <a-descriptions-item label="Source">
          {{ alarm.triggered_by || 'Sensor' }}
        </a-descriptions-item>
      </a-descriptions>

      <!-- 检测数据详情 - 保留心率/呼吸率颜色指示 -->
      <div v-if="alarm.trigger_data" style="margin-top: 12px;">
        <div style="font-weight: 600; margin-bottom: 6px; font-size: 13px;">
          Sensor Readings:
        </div>
        <a-descriptions bordered :column="2" size="small">
          <a-descriptions-item 
            v-if="alarm.trigger_data.heart_rate" 
            label="Heart Rate"
            :span="1"
          >
            <span :style="{ color: getHeartRateColor(alarm.trigger_data.heart_rate), fontWeight: 600 }">
              {{ alarm.trigger_data.heart_rate }} bpm
            </span>
          </a-descriptions-item>
          
          <a-descriptions-item 
            v-if="alarm.trigger_data.respiratory_rate" 
            label="Respiratory Rate"
            :span="1"
          >
            <span :style="{ color: getRespiratoryColor(alarm.trigger_data.respiratory_rate), fontWeight: 600 }">
              {{ alarm.trigger_data.respiratory_rate }} rpm
            </span>
          </a-descriptions-item>
          
          <a-descriptions-item 
            v-if="alarm.trigger_data.posture" 
            label="Posture"
            :span="1"
          >
            {{ alarm.trigger_data.posture }}
          </a-descriptions-item>
          
          <a-descriptions-item 
            v-if="alarm.trigger_data.location" 
            label="Location"
            :span="1"
          >
            {{ alarm.trigger_data.location }}
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <!-- 响应时间追踪 (UL 2560 要求) -->
      <div v-if="alarm.alarm_status === 'active'" class="response-timer">
        <span>⏱️ Response: </span>
        <span style="font-weight: bold; color: #1890ff;">{{ responseTime }}</span>
      </div>

      <!-- 操作按钮 -->
      <div style="margin-top: 14px; display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
        <template v-if="alarm.alarm_status === 'active'">
          <a-button size="small" @click="handleViewHistory">
            📋 History
          </a-button>
          
          <a-button 
            v-if="isUrgentLevel"
            type="primary" 
            @click="handleAcknowledge"
            :loading="acknowledging"
            style="min-width: 140px;"
          >
            ✅ ACKNOWLEDGE
          </a-button>
          
          <template v-else>
            <a-button size="small" @click="handleDismiss">
              Dismiss
            </a-button>
            <a-button 
              type="primary" 
              size="small"
              @click="handleAcknowledge"
              :loading="acknowledging"
            >
              Acknowledge
            </a-button>
          </template>
        </template>
        
        <template v-else>
          <a-button size="small" @click="handleViewHistory">
            📋 History
          </a-button>
          <a-button size="small" @click="handleCancel">
            Close
          </a-button>
          <a-button size="small" type="default" disabled>
            ✅ Acknowledged
          </a-button>
        </template>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { 
  AlertFilled, 
  WarningFilled, 
  InfoCircleFilled, 
  BellFilled,
  InfoCircleOutlined 
} from '@ant-design/icons-vue'
import type { VitalFocusCard } from '@/api/monitors/model/monitorModel'

interface AlarmEvent {
  event_id: string
  event_type: string
  category: 'clinical' | 'safety' | 'device' | 'system'
  alarm_level: number
  alarm_status: 'active' | 'acknowledged' | 'cleared'
  triggered_at: number
  triggered_by?: string
  trigger_data?: {
    heart_rate?: number
    respiratory_rate?: number
    posture?: string
    location?: string
    threshold?: {
      max?: number
      min?: number
    }
  }
}

interface Props {
  visible: boolean
  alarm: AlarmEvent | null
  card: VitalFocusCard | null
  refreshTimestamp?: number  // 用于触发计时器重置
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'acknowledge', alarm: AlarmEvent): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 本地visible状态（用于 v-model:visible）
const localVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const acknowledging = ref(false)
const responseTime = ref('00:00:00')
const relativeTimeText = ref('')  // 响应式的相对时间文本
const displayTime = ref<number>(Date.now())  // 显示的时间（Modal打开时的当前时间）
let responseTimer: ReturnType<typeof setInterval> | null = null

// 移动端检测
const windowWidth = ref(window.innerWidth)
const isMobile = computed(() => windowWidth.value < 576)
const modalWidth = computed(() => {
  if (windowWidth.value < 375) return '95%'
  if (windowWidth.value < 576) return '90%'
  return 420
})

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

// 响应时间计时器
let timerStartTime: number | null = null  // 计时器起始时间

const startResponseTimer = (fromNow: boolean = false) => {
  // 如果已经在运行，先停止
  if (responseTimer) {
    stopResponseTimer()
  }
  
  // fromNow=true: 从当前时间开始（刷新复位）
  // fromNow=false: 从报警触发时间开始（首次打开）
  timerStartTime = fromNow ? Date.now() : (props.alarm?.triggered_at || Date.now())
  
  const updateTimer = () => {
    if (!timerStartTime) return
    const elapsed = Date.now() - timerStartTime
    const hours = Math.floor(elapsed / 3600000)
    const minutes = Math.floor((elapsed % 3600000) / 60000)
    const seconds = Math.floor((elapsed % 60000) / 1000)
    responseTime.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    
    // 同步更新相对时间文本
    if (hours > 0) {
      relativeTimeText.value = `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min ago`
    } else if (minutes > 0) {
      relativeTimeText.value = `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else {
      relativeTimeText.value = `${seconds} second${seconds > 1 ? 's' : ''} ago`
    }
  }
  
  updateTimer()
  responseTimer = setInterval(updateTimer, 1000)
}

const stopResponseTimer = () => {
  if (responseTimer) {
    clearInterval(responseTimer)
    responseTimer = null
  }
}

// 重置并启动计时器 - 从当前时间开始
const resetAndStartTimer = () => {
  stopResponseTimer()
  timerStartTime = Date.now()  // 重置起始时间为当前
  responseTime.value = '00:00:00'
  relativeTimeText.value = 'just now'  // 重置相对时间
  if (props.visible && props.alarm?.alarm_status === 'active') {
    startResponseTimer(true)  // fromNow=true, 从当前时间开始
  }
}

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (newVal && props.alarm?.alarm_status === 'active') {
    // 打开Modal时，Time显示报警触发时间
    displayTime.value = props.alarm?.triggered_at || Date.now()
    // Response从报警触发时间开始计时（体现真实响应时间）
    startResponseTimer(false)  // fromNow=false, 从triggered_at开始
  } else {
    stopResponseTimer()
    // 关闭时重置显示
    responseTime.value = '00:00:00'
    relativeTimeText.value = ''
  }
})

// 监听alarm变化 - 刷新卡片时复位计时器
watch(() => props.alarm?.event_id, (newId, oldId) => {
  if (newId !== oldId) {
    // alarm变化时，复位计时器
    resetAndStartTimer()
  }
})

// 注意：triggered_at的watch已禁用
// 因为mock数据每次刷新可能生成新的triggered_at，会导致计时器被重置
// 如果需要在triggered_at变化时重置计时器，取消下面的注释：
// watch(() => props.alarm?.triggered_at, (newTime, oldTime) => {
//   if (newTime !== oldTime && props.visible) {
//     resetAndStartTimer()
//   }
// })

// 注意：已移除refreshTimestamp的watch
// 因为卡片每3秒刷新一次，会导致计时器每3秒被重置
// Response计时器应该持续运行，直到用户Acknowledge

onMounted(() => {
  if (props.visible && props.alarm?.alarm_status === 'active') {
    // 从当前时间开始计时（响应时间）
    startResponseTimer(true)  // fromNow=true
  }
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  stopResponseTimer()
  window.removeEventListener('resize', handleResize)
})

// 计算属性
const modalTitle = computed(() => {
  // 使用合规术语：Notification/Notice 而非 Alert
  const prefix = isUrgentLevel.value ? '🔔 Urgent Notification' : '📋 Wellness Notice'
  return props.alarm ? `${prefix} - ${formatAlarmType(props.alarm.event_type)}` : 'Notification Details'
})

// 是否为紧急级别 (Level 0-2)
const isUrgentLevel = computed(() => {
  if (!props.alarm) return false
  return props.alarm.alarm_level <= 2
})

const alarmLevelClass = computed(() => {
  if (!props.alarm) return ''
  const level = props.alarm.alarm_level
  if (level <= 1) return 'level-urgent'      // Level 0-1: 紧急 (红色)
  if (level === 2) return 'level-important'  // Level 2: 重要 (橙色)
  if (level === 3) return 'level-notice'     // Level 3: 提醒 (蓝色)
  return 'level-info'                         // Level 4+: 信息 (绿色)
})

// Modal wrap class - 根据报警级别设置边框颜色 (UL 2560 合规)
const modalWrapClass = computed(() => {
  if (!props.alarm) return 'alarm-handle-modal-wrap'
  const level = props.alarm.alarm_level
  if (level <= 1) return 'alarm-handle-modal-wrap modal-urgent'      // 红色边框
  if (level === 2) return 'alarm-handle-modal-wrap modal-important'  // 橙色边框
  if (level === 3) return 'alarm-handle-modal-wrap modal-notice'     // 蓝色边框
  return 'alarm-handle-modal-wrap modal-info'                         // 绿色边框
})

// 合规术语 - 按 UL 2560 要求
const alarmLevelText = computed(() => {
  if (!props.alarm) return ''
  const level = props.alarm.alarm_level
  switch (level) {
    case 0: return 'URGENT - Immediate Response Required'
    case 1: return 'URGENT - Priority Response'
    case 2: return 'IMPORTANT - Attention Needed'
    case 3: return 'NOTICE - Please Review'
    case 4: return 'INFORMATION'
    default: return 'NOTIFICATION'
  }
})

// 根据级别选择图标
const alarmLevelIcon = computed(() => {
  if (!props.alarm) return InfoCircleFilled
  const level = props.alarm.alarm_level
  if (level <= 1) return AlertFilled
  if (level === 2) return WarningFilled
  if (level === 3) return BellFilled
  return InfoCircleFilled
})

// 方法
const handleCancel = () => {
  // Level 1/2 禁止通过 Cancel/Close 关闭
  if (isUrgentLevel.value && props.alarm?.alarm_status === 'active') {
    message.warning('Please acknowledge this notification before closing.')
    return
  }
  stopResponseTimer()
  emit('update:visible', false)
}

const handleDismiss = () => {
  // 只有 Level 3+ 才允许 Dismiss
  if (isUrgentLevel.value) {
    message.warning('Urgent notifications require acknowledgment.')
    return
  }
  stopResponseTimer()
  emit('update:visible', false)
}

const handleAcknowledge = async () => {
  if (!props.alarm) return
  
  acknowledging.value = true
  
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 触发确认事件
    emit('acknowledge', props.alarm)
    
    // 使用合规术语
    message.success('Notification acknowledged - please check on resident')
    
    // 延迟关闭Modal以显示成功消息
    setTimeout(() => {
      stopResponseTimer()
      emit('update:visible', false)
      acknowledging.value = false
    }, 500)
  } catch (error) {
    message.error('Failed to acknowledge notification')
    acknowledging.value = false
  }
}

const handleViewHistory = () => {
  message.info('Opening history...')
  // TODO: 导航到历史记录页面
}

const formatAlarmType = (type: string): string => {
  // 将下划线分隔的类型转换为可读格式
  // 并使用合规术语替换
  return type
    .replace(/^Radar_|^SleepPad_/, '')
    .replace(/Abnormal/g, 'Pattern Change -')  // 合规：Abnormal -> Pattern Change
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
}

const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`
}

// 分类标签 - 使用护理系统术语而非医疗术语
const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'clinical': return 'Wellness Pattern'
    case 'safety': return 'Safety Check'
    case 'device': return 'Device Status'
    case 'system': return 'System'
    default: return category
  }
}

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'clinical': return 'blue'
    case 'safety': return 'orange'
    case 'device': return 'purple'
    case 'system': return 'default'
    default: return 'default'
  }
}

// 心率颜色指示 - 保留用于快速识别，添加合规说明
const getHeartRateColor = (rate: number): string => {
  // 颜色用于视觉区分，不做医学诊断
  if (rate > 100 || rate < 50) return '#ff4d4f'  // 显著变化
  if (rate > 90 || rate < 60) return '#faad14'   // 轻微变化
  return '#52c41a'  // 常规范围
}

// 呼吸率颜色指示 - 保留用于快速识别，添加合规说明
const getRespiratoryColor = (rate: number): string => {
  // 颜色用于视觉区分，不做医学诊断
  if (rate > 25 || rate < 10) return '#ff4d4f'  // 显著变化
  if (rate > 22 || rate < 12) return '#faad14'  // 轻微变化
  return '#52c41a'  // 常规范围
}
</script>

<style scoped>
.alarm-detail {
  padding: 10px 0;
}

.alarm-level-badge {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 8px;
  font-weight: bold;
}

/* Level 0-1: 紧急 (红色) - UL 2560 允许 */
.level-urgent {
  background-color: #fff1f0;
  border: 2px solid #ff4d4f;
  color: #cf1322;
}

/* Level 2: 重要 (橙色) */
.level-important {
  background-color: #fff7e6;
  border: 2px solid #fa8c16;
  color: #d46b08;
}

/* Level 3: 提醒 (蓝色) */
.level-notice {
  background-color: #e6f7ff;
  border: 2px solid #1890ff;
  color: #096dd9;
}

/* Level 4+: 信息 (绿色) */
.level-info {
  background-color: #f6ffed;
  border: 2px solid #52c41a;
  color: #389e0d;
}

.suggested-actions {
  margin-top: 20px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.response-timer {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #e6f7ff;
  border-radius: 6px;
  border: 1px solid #91d5ff;
  font-size: 12px;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 600;
  width: 100px;
  font-size: 11px;
}

:deep(.ant-descriptions-item-content) {
  font-size: 12px;
}

/* ========== 移动端适配 ========== */
@media (max-width: 576px) {
  .alarm-level-badge {
    padding: 10px 14px;
    font-size: 12px;
  }
  
  .alarm-level-badge span {
    font-size: 11px !important;
  }
  
  .response-timer {
    padding: 6px 10px;
    font-size: 11px;
  }
  
  :deep(.ant-descriptions-item-label) {
    width: 80px;
    font-size: 10px;
    padding: 6px 8px !important;
  }
  
  :deep(.ant-descriptions-item-content) {
    font-size: 11px;
    padding: 6px 8px !important;
  }
  
  :deep(.ant-btn) {
    font-size: 12px;
    padding: 4px 10px;
    height: auto;
  }
}

@media (max-width: 375px) {
  .alarm-level-badge {
    padding: 8px 10px;
  }
  
  :deep(.ant-descriptions-item-label) {
    width: 70px;
    font-size: 9px;
  }
  
  :deep(.ant-descriptions-item-content) {
    font-size: 10px;
  }
}
</style>

<!-- 全局样式：Modal边框颜色根据报警级别变化 (UL 2560 合规) -->
<style>
/* Level 0-1: 紧急 - 红色边框 (UL 2560: RGB(220, 38, 38)) */
.modal-urgent .ant-modal-content {
  border: 3px solid #DC2626;
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
}
.modal-urgent .ant-modal-header {
  background-color: #FEF2F2;
  border-bottom: 1px solid #FECACA;
}
.modal-urgent .ant-modal-title {
  color: #DC2626;
}

/* Level 2: 重要 - 橙色边框 (UL 2560: RGB(251, 146, 60)) */
.modal-important .ant-modal-content {
  border: 3px solid #FB923C;
  box-shadow: 0 0 15px rgba(251, 146, 60, 0.25);
}
.modal-important .ant-modal-header {
  background-color: #FFF7ED;
  border-bottom: 1px solid #FED7AA;
}
.modal-important .ant-modal-title {
  color: #EA580C;
}

/* Level 3: 提醒 - 蓝色边框 (UL 2560: RGB(59, 130, 246)) */
.modal-notice .ant-modal-content {
  border: 2px solid #3B82F6;
}
.modal-notice .ant-modal-header {
  background-color: #EFF6FF;
  border-bottom: 1px solid #BFDBFE;
}
.modal-notice .ant-modal-title {
  color: #2563EB;
}

/* Level 4+: 信息 - 绿色边框 */
.modal-info .ant-modal-content {
  border: 2px solid #22C55E;
}
.modal-info .ant-modal-header {
  background-color: #F0FDF4;
  border-bottom: 1px solid #BBF7D0;
}
.modal-info .ant-modal-title {
  color: #16A34A;
}
</style>
