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
    // 配置HMR
    hmr: {
      host: 'localhost',
      port: 5002,
      protocol: 'ws'
    },
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        // 合并assetFileNames配置，确保CSS文件正确归类
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name]-[hash].[ext]';
          }
          return '[ext]/[name]-[hash].[ext]';
        }
      }
    }
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})