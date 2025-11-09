import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5002,
    host: '0.0.0.0',
    open: false,
    cors: true,
    // 调整 HMR：对外通过代理（8000）访问时，客户端应连接到代理可达的 host/port
    hmr: {
      host: 'localhost', // 你的服务器对外 IP（把这个替换为实际服务器 IP）
      port: 5002,            // 浏览器通过 8000 访问代理，HMR 客户端也通过 8000 连接 websocket
      protocol: 'ws'
    },
    // 允许服务外部访问
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@pages': path.resolve(__dirname, 'pages')
    }
  },
  // 明确设置基础路径
  base: '/',
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // 确保资源路径正确
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    }
  },
  // CSS配置
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})