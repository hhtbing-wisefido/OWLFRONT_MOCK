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
  server: {
    port: 3100,
    // https: true, // TODO: 需要配置证书时启用
  },
})
