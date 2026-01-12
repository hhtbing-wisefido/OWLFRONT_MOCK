import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      // @/ => src/ (匹配 @/ 开头的路径)
      {
        find: /^@\/(.*)$/,
        replacement: resolve(__dirname, 'src/$1'),
      },
      // @ => src (匹配单独的 @)
      {
        find: '@',
        replacement: resolve(__dirname, 'src'),
      },
      // /@ => src (兼容 v1.0 的 /@/ 格式)
      {
        find: '/@',
        replacement: resolve(__dirname, 'src'),
      },
      // 支持 /#/ 路径别名，与原项目保持一致
      {
        find: /^\/#/,
        replacement: resolve(__dirname, 'types'),
      },
      // 支持 @test 路径别名，指向 test 目录（用于动态导入测试数据）
      {
        find: '@test',
        replacement: resolve(__dirname, 'test'),
      },
    ],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  // 优化依赖，确保 vue_radar 的依赖被正确处理
  optimizeDeps: {
    include: ['vue', 'pinia'],
    // 排除 vue_radar 的依赖预构建，让它们按需加载
    exclude: [],
  },
  build: {
    // 增加分块大小警告限制
    chunkSizeWarningLimit: 2000,
    // 关闭源码映射以加快构建
    sourcemap: false,
    // 优化构建输出
    rollupOptions: {
      output: {
        // 手动分块，避免单个文件过大
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ant-design': ['ant-design-vue'],
          'charts': ['echarts', 'vue-echarts'],
        },
      },
      // 忽略某些警告
      onwarn(warning, warn) {
        // 忽略 "Use of eval" 警告
        if (warning.code === 'EVAL') return
        // 忽略循环依赖警告
        if (warning.code === 'CIRCULAR_DEPENDENCY') return
        // 忽略动态导入警告
        if (warning.message.includes('dynamic import')) return
        warn(warning)
      },
    },
  },
  server: {
    host: '0.0.0.0', // 监听所有网络接口，允许局域网访问
    port: 3100,
    strictPort: true, // 强制使用3100端口，不自动切换
    proxy: {
      // 让 owlFront 在 dev 环境直接走相对路径（避免 CORS），并把 API 代理到 wisefido-data
      '/admin/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/data/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/auth/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/settings/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/sleepace/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/device/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1': { target: 'http://localhost:8080', changeOrigin: true },
    },
    // https: true, // TODO: 需要配置证书时启用
  },
})
