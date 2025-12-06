<template>
  <div class="test-page">
    <div class="test-container">
      <div class="test-wrapper">
        <canvas class="test-canvas" width="1500" height="700"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  const canvas = document.querySelector('.test-canvas') as HTMLCanvasElement
  if (canvas) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // 绘制边框和尺寸标注
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, 1500, 700)
      
      // 绘制中心线
      ctx.strokeStyle = '#f00'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(750, 0)
      ctx.lineTo(750, 700)
      ctx.moveTo(0, 350)
      ctx.lineTo(1500, 350)
      ctx.stroke()
      
      // 绘制尺寸标注
      ctx.fillStyle = '#000'
      ctx.font = '20px Arial'
      ctx.fillText('1500px × 700px', 10, 30)
      ctx.fillText('Expected: 1500px width', 10, 60)
      ctx.fillText('Expected: 700px height', 10, 90)
    }
  }
})
</script>

<style scoped>
.test-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f0f0;
}

.test-container {
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 5px;
  background-color: #f0f0f0;
}

.test-wrapper {
  padding: 5px;
  background-color: #f0f0f0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.test-canvas {
  background-color: white;
  border: 2px solid #000;
  display: block;
  /* 关键：使用 box-sizing: border-box 确保 border 包含在总尺寸内 */
  box-sizing: border-box;
  width: 1500px;
  height: 700px;
  /* 这样总尺寸就是 1500×700，border 包含在内 */
}
</style>

