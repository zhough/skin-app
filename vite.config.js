// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5002,
    host: '0.0.0.0',
    open: false, // 建议关闭自动打开，因为代理服务器在8000端口
    cors: {
      origin: '*'
    },
    // 添加代理配置，处理API请求（可选，如果你想让Vite直接代理API）
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/database': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/multimodal': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  resolve: {
    alias: {
      '@': './'
    }
  },
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})