// proxy.js - 修正后的版本
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const agentSystemPath = path.join(__dirname, '../agent-system/images');
app.use('/images', express.static(agentSystemPath));
// 日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// API 服务代理 (5000端口) - 修正路径重写
const apiProxy = createProxyMiddleware('/api', {
  target: 'http://127.0.0.1:5000',
  changeOrigin: true,
  logLevel: 'warn',
  // 关键：重写路径，去掉 /api 前缀
  pathRewrite: {
    '^/api': ''  // 将 /api 替换为空字符串
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API代理] ${req.method} ${req.url} -> :5000${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error(`[API代理错误] ${err.message}`);
  }
});

// 数据库服务代理 (5001端口) - 同样修正
const databaseProxy = createProxyMiddleware('/database', {
  target: 'http://127.0.0.1:5001',
  changeOrigin: true,
  logLevel: 'warn',
  pathRewrite: {
    '^/database': ''  // 将 /database 替换为空字符串
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[数据库代理] ${req.method} ${req.url} -> :5001${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error(`[数据库代理错误] ${err.message}`);
  }
});

// Vite 前端开发服务器代理 (5002端口) - 保持不变
const viteProxy = createProxyMiddleware({
  target: 'http://127.0.0.1:5002',
  changeOrigin: true,
  ws: true,
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    if (!req.url.startsWith('/api') && !req.url.startsWith('/database')) {
      console.log(`[前端代理] ${req.method} ${req.url} -> :5002`);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
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
app.use('/', viteProxy);

// 启动服务器
const PORT = 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 代理服务器启动成功!');
  console.log(`📍 外部访问地址: http://你的服务器IP:${PORT}`);
  console.log('🔧 服务路由配置:');
  console.log('   /api/*      → http://127.0.0.1:5000/* (去掉/api前缀)');
  console.log('   /database/* → http://127.0.0.1:5001/* (去掉/database前缀)');
  console.log('   其他路径    → http://127.0.0.1:5002 (前端Vite)');
});

process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭代理服务器...');
  process.exit(0);
});