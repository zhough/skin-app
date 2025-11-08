import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/web/', // 关键：与后端代理 /web 前缀完全匹配，不修改
  plugins: [vue()],
  server: {
    port: 5002,         // 和后端 PATH_TO_PORT['/web'] 配置的端口一致
    host: '0.0.0.0',    // 允许服务器内部访问（后端代理需连接此端口）
    open: true,
    cors: {
      origin: '*'       // 允许后端代理服务（8000端口）访问
    }
    // 移除开发环境 proxy：后端代理已处理 /api 转发，避免双重代理冲突
  },
  resolve: {
    alias: {
      '@': './src' // 规范别名，指向 src 目录（不影响功能，仅优化路径）
    }
  }
})