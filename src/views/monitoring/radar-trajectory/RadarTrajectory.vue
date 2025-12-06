<template>
  <div class="radar-trajectory-page">
    <a-page-header
      class="page-header"
      :title="pageTitle"
      @back="goBack"
    >
      <template #extra>
        <a-button @click="goBack">
          <template #icon>
            <ArrowLeftOutlined />
          </template>
          Back
        </a-button>
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
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import RadarAppWrapper from './components/RadarAppWrapper.vue'

const route = useRoute()
const router = useRouter()

const cardId = ref<string>(route.params.cardId as string)
const deviceId = ref<string>(route.params.deviceId as string)

const pageTitle = ref('Radar Trajectory')

// 返回上一页
const goBack = () => {
  router.go(-1)
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

.radar-container {
  flex: 1;
  overflow: auto;
  /* 关键：左侧 padding 20px 与侧边栏保持固定间距，右侧 padding 匹配原始 vue_radar 的间距 */
  /* 原始 vue_radar: #app padding 20px + .app-container padding 5px = 25px 总间距 */
  padding: 5px 25px 5px 20px;
  background-color: #f0f0f0;
  /* 关键：使用 flex 布局，内容靠左对齐 */
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  /* 关键：固定宽度，不随侧边栏状态变化 */
  width: 1531px; /* 1486px (radar系统) + 20px (左padding) + 25px (右padding) */
  flex-shrink: 0; /* 防止被压缩 */
}

.radar-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
</style>

