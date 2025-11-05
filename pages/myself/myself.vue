<template>
  <view class="profile-container">
    <!-- 用户基本信息卡片 -->
    <view class="card user-info-card">
      <div class="card-header">
        <text class="card-title">个人信息</text>
      </div>
      <text class="username">{{ userInfo.username || userInfo.nickname || '个人皮肤档案' }}</text>
      <div class="user-details">
        <div class="detail-item">
          <span class="detail-label">年龄:</span>
          <span class="detail-value">{{ userInfo.age || '未设置' }}岁</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">性别:</span>
          <span class="detail-value">{{ userInfo.gender || '未设置' }}</span>
        </div>
      </div>
    </view>

    <!-- 皮肤综合评分卡片 -->
    <view class="card score-card" v-if="isInfoComplete">
      <div class="card-header">
        <text class="card-title">皮肤综合评分</text>
      </div>
      <view class="score-display">
        <text class="score-number">{{ skinData.overallScore || '--' }}</text>
      </view>
    </view>

    <!-- 肌肤年龄卡片 -->
    <view class="card age-card" v-if="isInfoComplete">
      <div class="card-header">
        <text class="card-title">肌肤年龄</text>
      </div>
      <view class="age-display">
        <text class="age-number">{{ userInfo.age || 0 }}</text>
        <text class="age-unit">岁</text>
      </view>
    </view>

    <!-- 皮肤指标详情卡片 -->
    <view class="card indicators-card" v-if="isInfoComplete">
      <text class="card-title">皮肤指标详情</text>
      <view class="indicators-list">
        <view class="indicator-row" v-for="(item, index) in skinData.indicators" :key="index">
          <div class="indicator-content">
            <text class="indicator-name">{{ item.name }}</text>
            <view class="indicator-value-container">
              <text class="indicator-value">{{ item.value.toFixed(1) }}</text>
              <text class="indicator-unit">分</text>
            </view>
          </div>
          <view class="progress-bar">
            <view 
              class="progress-fill" 
              :style="{
                width: `${item.value * 10}%`,
                backgroundColor: getColorByValue(item.value)
              }"
            ></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 未完善信息提示 -->
    <view class="card incomplete-card" v-else>
      <div class="card-header">
        <text class="card-title">提示</text>
      </div>
      <text class="incomplete-text">请先完善个人信息，以获取您的专属皮肤档案</text>
    </view>

    <!-- 推荐按钮 -->
    <button 
      class="recommend-btn" 
      @click="navigateToRecommend"
      :disabled="!isInfoComplete"
    >
      查看护肤品建议
    </button>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getCurrentUser } from '@/services/auth-service.js';

// 获取路由实例
const route = useRoute();

// 用户信息
const userInfo = ref({
  age: '',
  gender: ''
});

// 皮肤数据（包含六个指标）
const skinData = ref({
  overallScore: 0,
  skinAge: 0,
  indicators: [
    { name: '黑头', value: 6.2 },
    { name: '痘痘', value: 4.8 },
    { name: '毛孔', value: 7.1 },
    { name: '出油', value: 5.3 },
    { name: '光滑度', value: 3.9 },
    { name: '黑眼圈', value: 6.7 }
  ],
  advice: ''
});

// 判断用户信息是否完善
const isInfoComplete = computed(() => {
  return !!userInfo.value.age && !!userInfo.value.gender;
});

// 页面加载时执行
onMounted(() => {
  // 1. 获取用户信息
  const user = getCurrentUser();
  if (user) {
    userInfo.value = { ...user };
  }

  // 2. 不自动检查用户信息，让用户可以自由浏览页面
  // 只有在需要时才会提示完善信息

  // 3. 获取路由参数中的指标数据
  const indicators = route.query.indicators;
  
  // 优先使用路由参数中的数据
  if (indicators) {
    try {
      const indicatorsData = JSON.parse(decodeURIComponent(indicators));
      updateSkinIndicators(indicatorsData);
      // 同时保存到本地存储
      saveDiagnosisData(indicatorsData);
    } catch (error) {
      console.error('解析指标数据失败:', error);
      loadLocalData(); // 解析失败时加载本地数据
    }
  } else {
    loadLocalData(); // 没有路由参数时加载本地数据
  }
});

// 加载本地存储的数据
const loadLocalData = () => {
  // 从本地存储获取
  try {
    const storedDiagnosis = localStorage.getItem('latestSkinDiagnosis');
    if (storedDiagnosis) {
      updateSkinIndicators(JSON.parse(storedDiagnosis));
    }
  } catch (error) {
    console.error('读取本地存储失败:', error);
  }
};

// 保存诊断数据到本地存储
const saveDiagnosisData = (data) => {
  try {
    // 保存到localStorage
    localStorage.setItem('latestSkinDiagnosis', JSON.stringify(data));
  } catch (error) {
    console.error('保存到本地存储失败:', error);
  }
};

// 更新皮肤指标数据
const updateSkinIndicators = (diagnosisData) => {
  // 将诊断结果转换为环形图所需的指标格式
  const indicatorsData = [
    { name: '黑头', value: diagnosisData.黑头 },
    { name: '光滑度', value: diagnosisData.光滑度 },
    { name: '黑眼圈', value: diagnosisData.黑眼圈 },
    { name: '出油', value: diagnosisData.出油 },
    { name: '毛孔', value: diagnosisData.毛孔 },
    { name: '痘痘', value: diagnosisData.痘痘 }
  ];
  
  // 更新皮肤数据
  skinData.value.indicators = indicatorsData;
  
  // 计算综合评分（六个指标的平均值*10）
  const total = indicatorsData.reduce((sum, item) => sum + item.value, 0);
  skinData.value.overallScore = Math.round((total / indicatorsData.length) * 10);
};

// 检查用户信息是否完善
const checkUserInfo = () => {
  if (!isInfoComplete.value) {
    // 只显示提示，不再自动跳转，让用户有选择的权利
    alert('请完善年龄和性别信息，以便提供更精准的建议');
    return false;
  }
  return true;
};

// 根据指标值获取对应颜色
const getColorByValue = (value) => {
  if (value <= 3) return '#ff7694'; // 较差 - 红色
  if (value <= 6) return '#df4a6f'; // 一般 - 玫红色
  return '#f01e56'; // 良好 - 深粉色
};

// 跳转至推荐页面
const navigateToRecommend = () => {
  // 检查用户信息是否完善，只有完善了才能继续
  if (!checkUserInfo()) {
    return;
  }
  
  uni.navigateTo({
    url: '/pages/recommend/recommend'
  });
};
</script>

<style scoped>
/* 页面整体样式 */
.profile-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 30rpx 20rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

/* 通用卡片样式 */
.card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 25rpx;
  display: block;
}

/* 用户信息卡片 */
.user-info-card {
  text-align: center;
}

.username {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 30rpx;
}

.user-details {
  display: flex;
  justify-content: center;
  gap: 60rpx;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.detail-label {
  font-size: 28rpx;
  color: #666666;
}

.detail-value {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

/* 评分卡片 */
.score-card {
  text-align: center;
}

.score-display {
  background: linear-gradient(135deg, #ff7eb3, #ff6b6b);
  border-radius: 15rpx;
  padding: 40rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.score-number {
  font-size: 60rpx;
  font-weight: bold;
  color: #ffffff;
  line-height: 1;
}

/* 年龄卡片 */
.age-card {
  text-align: center;
}

.age-display {
  display: flex;
  justify-content: center;
  align-items: baseline;
  padding: 40rpx 0;
}

.age-number {
  font-size: 60rpx;
  font-weight: bold;
  color: #ff6b6b;
  line-height: 1;
}

.age-unit {
  font-size: 32rpx;
  color: #666666;
  margin-left: 10rpx;
}

/* 指标详情卡片 */
.indicators-card {
  /* 指标卡片样式 */
}

.indicators-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.indicator-row {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.indicator-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5rpx;
}

.indicator-name {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  min-width: 100rpx;
}

.indicator-value-container {
  display: flex;
  align-items: baseline;
  font-weight: bold;
}

.indicator-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.indicator-unit {
  font-size: 24rpx;
  color: #666666;
  margin-left: 5rpx;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

/* 未完善信息卡片 */
.incomplete-card {
  text-align: center;
}

.incomplete-text {
  font-size: 30rpx;
  color: #666666;
  line-height: 1.6;
  padding: 30rpx 0;
  display: block;
}

/* 推荐按钮 */
.recommend-btn {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  background: linear-gradient(90deg, #ff7eb3, #ff6b6b);
  color: #ffffff;
  font-size: 34rpx;
  border-radius: 20rpx;
  border: none;
  margin-top: 20rpx;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 107, 0.25);
  transition: all 0.3s ease;
  font-weight: 500;
}

.recommend-btn:disabled {
  background: #cccccc;
  box-shadow: none;
  opacity: 0.7;
}

.recommend-btn:not(:disabled):active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.2);
}

/* 响应式设计 */
@media (min-width: 768px) {
  .profile-container {
    max-width: 800rpx;
    margin: 0 auto;
    padding: 40rpx;
  }
  
  .card {
    padding: 40rpx;
  }
}
</style>
    