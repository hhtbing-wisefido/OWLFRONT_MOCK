<template>
  <div class="monitor-view">
    <!-- 头部 -->
    <header class="header">
      <h1>🦉 智慧养老监控系统</h1>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-label">在线设备</span>
          <span class="stat-value online">{{ deviceStore.onlineDevices.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">离线设备</span>
          <span class="stat-value offline">{{ deviceStore.offlineDevices.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">报警设备</span>
          <span class="stat-value alarm">{{ deviceStore.alarmDevices.length }}</span>
        </div>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="main-content">
      <!-- 左侧：设备列表 -->
      <div class="device-list-section">
        <div class="section-header">
          <h2>设备列表</h2>
          <button @click="refreshDevices" class="refresh-btn" :disabled="deviceStore.loading">
            {{ deviceStore.loading ? '刷新中...' : '🔄 刷新' }}
          </button>
        </div>

        <div v-if="deviceStore.loading" class="loading">
          加载中...
        </div>

        <div v-else class="device-grid">
          <DeviceCard
            v-for="device in deviceStore.devices"
            :key="device.id"
            :device="device"
            @select="selectDevice"
          />
        </div>
      </div>

      <!-- 右侧：报警列表 -->
      <div class="alarm-list-section">
        <div class="section-header">
          <h2>⚠️ 报警事件</h2>
          <span class="alarm-count">{{ deviceStore.unresolvedAlarms.length }}条未处理</span>
        </div>

        <div class="alarm-list">
          <div
            v-for="alarm in deviceStore.alarms"
            :key="alarm.id"
            class="alarm-item"
            :class="{ resolved: alarm.resolved }"
          >
            <div class="alarm-header">
              <span class="alarm-level" :class="alarm.level">{{ alarm.level === 'danger' ? '🔴 危险' : '🟡 警告' }}</span>
              <span class="alarm-device">{{ alarm.deviceName }}</span>
            </div>
            <div class="alarm-message">{{ alarm.message }}</div>
            <div class="alarm-footer">
              <span class="alarm-time">{{ formatTime(alarm.timestamp) }}</span>
              <span v-if="alarm.resolved" class="resolved-tag">已处理</span>
            </div>
          </div>

          <div v-if="deviceStore.alarms.length === 0" class="empty-state">
            暂无报警事件
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDeviceStore } from '@/stores/device'
import DeviceCard from '@/components/DeviceCard.vue'

const deviceStore = useDeviceStore()

onMounted(async () => {
  await Promise.all([
    deviceStore.loadDevices(),
    deviceStore.loadAlarms()
  ])
})

async function refreshDevices() {
  await deviceStore.loadDevices()
}

function selectDevice(deviceId: string) {
  deviceStore.selectDevice(deviceId)
  console.log('选中设备:', deviceId)
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)
  
  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.monitor-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0 0 16px 0;
  font-size: 28px;
}

.header-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
}

.stat-value.online { color: #4caf50; }
.stat-value.offline { color: #9e9e9e; }
.stat-value.alarm { color: #ff5252; }

.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  padding: 24px 32px;
  max-width: 1600px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.refresh-btn {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 48px;
  color: #666;
  font-size: 16px;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.alarm-list-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 24px;
}

.alarm-count {
  background: #f44336;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.alarm-item {
  background: #fff;
  border: 2px solid #f44336;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s;
}

.alarm-item.resolved {
  border-color: #e0e0e0;
  opacity: 0.6;
}

.alarm-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.alarm-level {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.alarm-level.danger {
  background: #f44336;
  color: white;
}

.alarm-level.warning {
  background: #ff9800;
  color: white;
}

.alarm-device {
  font-weight: 600;
  color: #333;
}

.alarm-message {
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.alarm-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.resolved-tag {
  background: #4caf50;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #999;
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .alarm-list-section {
    position: static;
  }
}
</style>
