<template>
  <!-- 模板部分保持不变 -->
  <view class="container">
    <!-- 顶部标题区域 -->
    <view class="header">
      <text class="app-title">健康助手</text>
      <text class="app-subtitle">您的个人健康管家</text>
    </view>

    <!-- 功能按钮网格 -->
    <view class="function-grid">
      <!-- 疾病知识库 -->
      <view class="function-card" :style="{ backgroundColor: '#FF6B6B' }" @click="goToPage('/pages/knowledge/knowledge')">
        <view class="icon-wrapper">
          <text class="icon">📚</text>
        </view>
        <text class="function-name">疾病知识库</text>
      </view>

      <!-- 症状自查 -->
      <view class="function-card" :style="{ backgroundColor: '#4ECDC4' }" @click="goToPage('/pages/selfcheck/selfcheck')">
        <view class="icon-wrapper">
          <text class="icon">🔍</text>
        </view>
        <text class="function-name">症状自查</text>
      </view>

      <!-- 健康建议 -->
      <view class="function-card" :style="{ backgroundColor: '#FFD166' }" @click="goToPage('/pages/advice/advice')">
        <view class="icon-wrapper">
          <text class="icon">💡</text>
        </view>
        <text class="function-name">健康建议</text>
      </view>

      <!-- 图片诊断 -->
      <view class="function-card" :style="{ backgroundColor: '#06D6A0' }" @click="goToPage('/pages/picture/picture')">
        <view class="icon-wrapper">
          <text class="icon">📷</text>
        </view>
        <text class="function-name">图片诊断</text>
      </view>

      <!-- AI聊天 -->
      <view class="function-card" :style="{ backgroundColor: '#118AB2' }" @click="goToPage('/pages/aichat/aichat')">
        <view class="icon-wrapper">
          <text class="icon">💬</text>
        </view>
        <text class="function-name">AI聊天</text>
      </view>

      <!-- 我的档案 -->
      <view class="function-card" :style="{ backgroundColor: '#EF476F' }" @click="goToPage('/pages/myself/myself')">
        <view class="icon-wrapper">
          <text class="icon">👤</text>
        </view>
        <text class="function-name">我的档案</text>
      </view>
    </view>

    <!-- 底部装饰 -->
    <view class="footer-decoration"></view>
  </view>
</template>

<script>
export default {
  name: 'Index',
  methods: {
    // 使用 vue-router 进行页面跳转
    goToPage(url) {
      // 从uni-app路径格式转换为vue-router路径格式
      // 简化转换逻辑，只保留页面名称部分
      const pathParts = url.split('/')
      const pageName = pathParts[pathParts.length - 1].replace('.vue', '')
      const routerPath = `/${pageName}`
      this.$router.push(routerPath)
    }
  }
}
</script>

<style scoped>
/* 样式保持不变 */
.container {
  min-height: 100vh;
  background-color: #f0f4f8;
  padding: 40rpx 20rpx;
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
  padding: 20rpx;
}

.app-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #2A2A52;
  display: block;
  margin-bottom: 10rpx;
}

.app-subtitle {
  font-size: 28rpx;
  color: #555;
  opacity: 0.8;
}

.function-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30rpx;
  padding: 0 20rpx;
}

.function-card {
  height: 240rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.function-card:active {
  transform: scale(0.97);
  box-shadow: 0 5rpx 10rpx rgba(0, 0, 0, 0.15);
}

.function-card::before {
  content: '';
  position: absolute;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  top: -60rpx;
  right: -60rpx;
}

.icon-wrapper {
  margin-bottom: 20rpx;
  position: relative;
  z-index: 1;
}

.icon {
  font-size: 60rpx;
  display: block;
}

.function-name {
  font-size: 30rpx;
  font-weight: 500;
  position: relative;
  z-index: 1;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.footer-decoration {
  height: 60rpx;
  margin-top: 60rpx;
  background-image: radial-gradient(circle, #4ECDC4 10rpx, transparent 10rpx),
                   radial-gradient(circle, #FF6B6B 10rpx, transparent 10rpx),
                   radial-gradient(circle, #FFD166 10rpx, transparent 10rpx);
  background-size: 60rpx 60rpx;
  background-position: 0 0, 30rpx 30rpx, 60rpx 0;
  background-repeat: repeat-x;
  opacity: 0.5;
}
</style>