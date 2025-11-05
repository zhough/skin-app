// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8000,         // 端口改为8000
    host: '0.0.0.0',    // 允许外部访问（关键配置）
    open: true,
    // 可选：如果有跨域需求，可添加允许的源
    cors: {
      origin: '*'       // 允许所有外部源访问（生产环境需限制具体域名）
    }
  },
  resolve: {
    alias: {
      '@': './'
    }
  }
})