<template>
  <div 
    class="device-card"
    :class="[`status-${device.status}`, { 'has-alarm': device.hasAlarm }]"
    @click="$emit('select', device.id)"
  >
    <!-- 状态指示器 -->
    <div class="status-indicator">
      <span class="status-dot"></span>
      <span class="status-text">{{ statusText }}</span>
    </div>

    <!-- 设备信息 -->
    <div class="device-info">
      <h3 class="device-name">{{ device.name }}</h3>
      <div class="device-location">
        <span>{{ device.location }}</span>
        <span>{{ device.room }}</span>
      </div>
    </div>

    <!-- 报警信息 -->
    <div v-if="device.hasAlarm" class="alarm-badge">
      <span class="alarm-icon">⚠️</span>
      <span class="alarm-text">{{ device.alarmType }}</span>
    </div>

    <!-- 雷达ID -->
    <div class="radar-id">
      <span class="label">雷达ID:</span>
      <span class="value">{{ device.radarId }}</span>
    </div>

    <!-- 最后更新时间 -->
    <div class="last-update">
      更新: {{ formatTime(device.lastUpdate) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Device } from '@/types/device'

interface Props {
  device: Device
}

const props = defineProps<Props>()

defineEmits<{
  select: [deviceId: string]
}>()

const statusText = computed(() => {
  switch (props.device.status) {
    case 'online': return '在线'
    case 'offline': return '离线'
    case 'alarm': return '报警'
    default: return '未知'
  }
})

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN')
}
</script>

<style scoped>
.device-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid #e0e0e0;
  position: relative;
}

.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-online {
  border-color: #4caf50;
}

.status-offline {
  border-color: #9e9e9e;
  opacity: 0.7;
}

.status-alarm {
  border-color: #f44336;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { border-color: #f44336; }
  50% { border-color: #ff9800; }
}

.has-alarm {
  background: #fff3e0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.status-online .status-dot {
  background: #4caf50;
  box-shadow: 0 0 8px #4caf50;
}

.status-offline .status-dot {
  background: #9e9e9e;
}

.status-alarm .status-dot {
  background: #f44336;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.status-text {
  font-weight: 600;
  font-size: 14px;
}

.device-info {
  margin-bottom: 12px;
}

.device-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #333;
}

.device-location {
  display: flex;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.alarm-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f44336;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
  font-weight: 600;
}

.alarm-icon {
  font-size: 18px;
}

.radar-id {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.radar-id .label {
  font-weight: 600;
}

.radar-id .value {
  color: #1976d2;
  font-family: monospace;
}

.last-update {
  font-size: 12px;
  color: #999;
  text-align: right;
}
</style>
