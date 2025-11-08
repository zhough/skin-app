import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 1. 关键：设置静态资源基础路径，与代理的 /web 前缀匹配
  base: '/web/', 
  plugins: [vue()],
  server: {
    port: 5002,         // 保持与代理配置一致（代理转发 /web 到 5002）
    host: '0.0.0.0',    // 允许服务器内部访问（代理需要连接此端口）
    open: true,
    cors: {
      origin: '*'       // 允许代理服务（8000端口）访问
    },
    // 2. 开发环境代理：解决前端请求跨域（仅开发时使用，生产环境通过后端代理）
    proxy: {
      // 匹配 /api 前缀的请求，转发到后端代理服务（8000端口）
      '/api': {
        target: 'http://127.0.0.1:8000', // 后端代理服务地址（服务器内部访问）
        changeOrigin: true,              // 改变请求源（避免跨域）
        rewrite: (path) => path          // 不需要重写路径，后端代理会处理
      }
    }
  },
  resolve: {
    alias: {
      '@': './src' // 修正别名路径，指向 src 目录（更规范）
    }
  }
})