import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 支持 /#/ 路径别名，与原项目保持一致
      '/#': resolve(__dirname, 'types'),
      // 支持 @test 路径别名，指向 test 目录（用于动态导入测试数据）
      '@test': resolve(__dirname, 'test'),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  server: {
    port: 3100,
    // https: true, // TODO: 需要配置证书时启用
  },
})
