<template>
  <div class="radar-trajectory-page">
    <a-page-header
      class="page-header"
      @back="goBack"
    >
      <template #title>
        <div class="header-title-row">
          <a-button type="text" @click="goHome" class="home-btn" :title="'Home'">
            <template #icon>
              <HomeOutlined />
            </template>
          </a-button>
          <span class="title-separator">|</span>
          <span class="device-info-title">{{ deviceInfoTitle }}</span>
        </div>
      </template>
      <template #extra>
        <span class="device-status" :class="deviceStatusClass">
          {{ deviceStatusText }}
        </span>
      </template>
    </a-page-header>

    <div class="radar-container">
      <!-- vue_radar 组件 -->
      <RadarAppWrapper
        :card-id="cardId"
        :device-id="deviceId"
        @send-command="handleSendCommand"
        @query-device="handleQueryDevice"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeOutlined } from '@ant-design/icons-vue'
import RadarAppWrapper from './components/RadarAppWrapper.vue'

const route = useRoute()
const router = useRouter()

const cardId = ref<string>(route.params.cardId as string)
const deviceId = ref<string>(route.params.deviceId as string)

// 从路由 query 参数获取 cardName 和设备信息（从 card detail 页面传递）
const cardName = computed(() => (route.query.cardName as string) || '')
const deviceName = computed(() => (route.query.deviceName as string) || '')
const deviceSn = computed(() => (route.query.deviceSn as string) || '')
const deviceStatus = computed(() => (route.query.deviceStatus as string) || 'offline')

// 计算设备信息标题：cardName | deviceName/device_sn
const deviceInfoTitle = computed(() => {
  const parts: string[] = []
  
  if (cardName.value) {
    parts.push(cardName.value)
  }
  
  if (deviceName.value) {
    const devicePart = deviceSn.value ? `${deviceName.value}/${deviceSn.value}` : deviceName.value
    parts.push(devicePart)
  }
  
  return parts.length > 0 ? parts.join(' | ') : 'Radar Trajectory'
})

// 设备状态显示
const deviceStatusText = computed(() => {
  return deviceStatus.value === 'online' ? 'Online' : 'Offline'
})

// 设备状态样式类
const deviceStatusClass = computed(() => {
  return deviceStatus.value === 'online' ? 'status-online' : 'status-offline'
})

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 跳转到首页
const goHome = () => {
  router.push({
    name: 'MonitoringOverview',
  })
}

// 发送命令回调（供 vue_radar 使用）
async function handleSendCommand(
  deviceId: string,
  commandData: Record<string, any>
): Promise<{
  success: boolean
  data?: Record<string, any>
  error?: string
}> {
  try {
    // TODO: 调用后端 API 发送雷达配置
    // const response = await updateRadarConfigApi(deviceId, commandData)
    
    console.log('📤 Send radar config command:', { deviceId, commandData })
    
    // 临时返回成功（实际需要调用 API）
    return {
      success: true,
      data: commandData,
    }
  } catch (error: any) {
    console.error('❌ Send command failed:', error)
    return {
      success: false,
      error: error.message || 'Failed to send command',
    }
  }
}

// 查询设备回调（供 vue_radar 使用）
async function handleQueryDevice(deviceId: string): Promise<{
  success: boolean
  data?: Record<string, any>
  error?: string
}> {
  try {
    // TODO: 调用后端 API 查询雷达配置
    // const response = await getRadarConfigApi(deviceId)
    
    console.log('📥 Query radar config:', deviceId)
    
    // 临时返回模拟数据（实际需要调用 API）
    return {
      success: true,
      data: {
        install_model: 1,
        height: 170,
        boundary_left: 300,
        boundary_right: 300,
        boundary_front: 400,
        boundary_rear: 0,
      },
    }
  } catch (error: any) {
    console.error('❌ Query device failed:', error)
    return {
      success: false,
      error: error.message || 'Failed to query device',
    }
  }
}
</script>

<style scoped>
.radar-trajectory-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f0f0;
}

.page-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-btn {
  padding: 0;
  height: auto;
}

.title-separator {
  color: #d9d9d9;
  margin: 0 4px;
}

.device-info-title {
  font-weight: 500;
}

.device-status {
  font-size: 14px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 4px;
}

.device-status.status-online {
  color: #21c376;
}

.device-status.status-offline {
  color: #f56c6c;
}

.radar-container {
  flex: 1;
  /* 不显示滚动条，由外层容器处理滚动 */
  overflow: hidden;
  /* 关键：左侧 padding 20px 与侧边栏保持固定间距，右侧 padding 匹配原始 vue_radar 的间距 */
  /* 原始 vue_radar: #app padding 20px + .app-container padding 5px = 25px 总间距 */
  padding: 5px 25px 5px 20px;
  background-color: #f0f0f0;
  /* 关键：使用 flex 布局，内容靠左对齐 */
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  /* 关键：使用 min-width 而不是固定 width，允许容器自适应，只在内容超出时才显示滚动条 */
  min-width: 1531px; /* 1486px (radar系统) + 20px (左padding) + 25px (右padding) */
  flex-shrink: 0; /* 防止被压缩 */
  /* 关键：设置最小高度，确保内容能完整显示，避免不必要的垂直滚动条 */
  min-height: 0; /* 允许 flex 子元素缩小 */
}

.radar-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
</style>

