// proxy.js - 使用 ES 模块语法
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// 日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// API 服务代理 (5000端口)
const apiProxy = createProxyMiddleware('/api', {
  target: 'http://127.0.0.1:5000',
  changeOrigin: true,
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API代理] ${req.method} ${req.url} -> :5000`);
  },
  onError: (err, req, res) => {
    console.error(`[API代理错误] ${err.message}`);
  }
});

// 数据库服务代理 (5001端口)
const databaseProxy = createProxyMiddleware('/database', {
  target: 'http://127.0.0.1:5001',
  changeOrigin: true,
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[数据库代理] ${req.method} ${req.url} -> :5001`);
  },
  onError: (err, req, res) => {
    console.error(`[数据库代理错误] ${err.message}`);
  }
});

// Vite 前端开发服务器代理 (5002端口)
const viteProxy = createProxyMiddleware({
  target: 'http://127.0.0.1:5002',
  changeOrigin: true,
  ws: true, // WebSocket 支持 (Vite HMR 需要)
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    if (!req.url.startsWith('/api') && !req.url.startsWith('/database')) {
      console.log(`[前端代理] ${req.method} ${req.url} -> :5002`);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // 确保 CSS 文件正确的内容类型
    if (req.url.endsWith('.css') && proxyRes.headers['content-type']) {
      proxyRes.headers['content-type'] = 'text/css; charset=utf-8';
    }
  },
  onError: (err, req, res) => {
    console.error(`[前端代理错误] ${err.message}`);
  }
});

// 应用代理规则
app.use('/api', apiProxy);
app.use('/database', databaseProxy);
app.use('/', viteProxy); // 其他所有请求转发到前端

// 启动服务器
const PORT = 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 代理服务器启动成功!');
  console.log(`📍 外部访问地址: http://你的服务器IP:${PORT}`);
  console.log('🔧 服务路由配置:');
  console.log('   /api/*      → http://127.0.0.1:5000');
  console.log('   /database/* → http://127.0.0.1:5001');
  console.log('   其他路径    → http://127.0.0.1:5002 (前端Vite)');
  console.log('⚡ 支持 WebSocket (Vite HMR 热重载)');
  console.log('📝 日志: 按 Ctrl+C 停止服务');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭代理服务器...');
  process.exit(0);
});