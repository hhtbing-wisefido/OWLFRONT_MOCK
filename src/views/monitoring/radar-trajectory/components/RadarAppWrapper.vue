<template>
  <div class="radar-app-wrapper">
    <!-- vue_radar 的核心组件 -->
    <div class="radar-system">
      <!-- 左侧：雷达画布 -->
      <RadarCanvas />

      <!-- 第一个分隔器 -->
      <div class="spacer spacer-toggle" @click="toggleWaveform"></div>

      <!-- 中间：示波器 -->
      <div 
        class="waveform-wrapper" 
        :class="{ 'waveform-closed': !isWaveformOpen }"
      >
        <WaveMonitor />
      </div>

      <!-- 第二个分隔器 -->
      <div class="spacer spacer-toggle" @click="toggleToolbar"></div>

      <!-- 右侧：工具栏 -->
      <div 
        class="toolbar-wrapper" 
        :class="{ 'toolbar-closed': !isToolbarOpen }"
      >
        <Toolbar />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
// 从本地导入组件
import RadarCanvas from '@/components/Radar/RadarCanvas.vue'
import WaveMonitor from '@/components/Radar/WaveMonitor.vue'
import Toolbar from '@/components/Radar/Toolbar.vue'

// 导入 stores 和 utils
import { useCanvasStore } from '@/stores/radar/canvas'
import { useObjectsStore } from '@/stores/radar/objects'
import { useRadarDataStore } from '@/stores/radar/radarData'
import { getCanvasParams } from '@/utils/radar/urlParams'
import { autoQueryFromURL } from '@/utils/radar/autoQuery'

interface Props {
  cardId: string
  deviceId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  sendCommand: [deviceId: string, commandData: Record<string, any>]
  queryDevice: [deviceId: string]
}>()

// 初始化 stores
const canvasStore = useCanvasStore()
const objectsStore = useObjectsStore()
const radarDataStore = useRadarDataStore()

const isWaveformOpen = ref(false)  // 默认关闭 wave
const isToolbarOpen = ref(true)

const toggleWaveform = () => {
  isWaveformOpen.value = !isWaveformOpen.value
}

const toggleToolbar = () => {
  isToolbarOpen.value = !isToolbarOpen.value
}

// 向子组件提供面板控制
provide('panelControls', {
  isWaveformOpen,
  isToolbarOpen,
  toggleWaveform,
  toggleToolbar
})

// 提供外部回调函数（供 Toolbar 使用）
provide('externalCallbacks', {
  sendCommand: async (deviceId: string, commandData: Record<string, any>) => {
    emit('sendCommand', deviceId, commandData)
    // 返回一个 Promise，等待父组件处理
    // 注意：这里需要父组件通过某种方式返回结果，暂时返回成功
    return {
      success: true,
      data: commandData
    }
  },
  queryDevice: async (deviceId: string) => {
    emit('queryDevice', deviceId)
    // 返回一个 Promise，等待父组件处理
    // 注意：这里需要父组件通过某种方式返回结果，暂时返回模拟数据
    return {
      success: true,
      data: {
        install_model: 1,
        height: 170,
        boundary_left: 300,
        boundary_right: 300,
        boundary_front: 400,
        boundary_rear: 0,
      }
    }
  }
})

// 初始化
onMounted(async () => {
  // 设置 Canvas 参数
  setupCanvasParams()
  
  // 检查是否是URL查询模式
  const isAutoQuery = await autoQueryFromURL()
  if (isAutoQuery) {
    console.log('🎬 URL auto-query mode started')
    return
  }
  
  // 获取Canvas参数
  const params = getCanvasParams()
  
  if (params) {
    canvasStore.setParams(params)
    
    const canvasId = canvasStore.getCanvasId()
    if (canvasId) {
      objectsStore.loadCanvas(canvasId)
      
      if (params.currentDeviceId) {
        const device = objectsStore.objects.find((obj: any) => 
          obj.device?.iot && 
          (obj.device.iot.deviceId === params.currentDeviceId || obj.id === params.currentDeviceId)
        )
        
        if (device) {
          objectsStore.selectObject(device.id)
        }
      }
    }
  } else {
    console.warn('⚠️ No URL parameters provided, using default empty Canvas')
  }
})

// 设置 Canvas 参数
function setupCanvasParams() {
  const canvasParams = {
    canvasId: `canvas_${props.cardId}_${props.deviceId}`,
    devices: [
      {
        deviceId: props.deviceId,
        deviceName: 'Track',
      },
    ],
    currentDeviceId: props.deviceId,
  }

  // 设置全局参数（vue_radar 通过 window.__radarCanvasParams 读取）
  ;(window as any).__radarCanvasParams = canvasParams
}
</script>

<style scoped>
.radar-app-wrapper {
  /* 关键：移除 padding，因为 .radar-container 已经处理了 padding */
  padding: 0;
  background-color: transparent;
  min-height: 100vh;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  /* 关键：固定宽度，确保正好是 radar-system 的宽度 */
  width: 1486px; /* radar-system 的固定宽度 */
  flex-shrink: 0; /* 防止被压缩 */
}

.radar-system {
  display: flex;
  width: 1486px; /* 固定宽度：620 + 3 + 620 + 3 + 240 = 1486px */
  height: 650px;
  flex-shrink: 0; /* 防止被压缩 */
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 分隔器 3x650 */
.spacer {
  width: 3px;
  height: 650px;
  background-color: #e0e0e0;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}

.spacer-toggle {
  cursor: pointer;
  transition: background-color 0.2s;
}

.spacer-toggle:hover {
  background-color: #d0d0d0;
}

/* 波形监测容器 */
.waveform-wrapper {
  width: 620px;
  height: 650px;
  transition: width 0.3s ease;
  overflow: hidden;
}

.waveform-wrapper.waveform-closed {
  width: 0;
}

/* 工具栏容器 */
.toolbar-wrapper {
  width: 240px;
  height: 650px;
  transition: width 0.3s ease;
  overflow: hidden;
}

.toolbar-wrapper.toolbar-closed {
  width: 0;
}
</style>

