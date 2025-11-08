// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5002,         // 端口8000
    host: '0.0.0.0',    // 允许外部访问
    open: true,
    cors: {
      origin: '*'       // 允许所有外部源访问
    }
  },
  resolve: {
    alias: {
      '@': './'
    }
  }
})