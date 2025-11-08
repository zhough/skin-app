<template>
  <view class="profile-container">
    <!-- 用户基本信息卡片 -->
    <view class="card user-info-card">
      <div class="card-header">
        <text class="card-title">个人信息</text>
        <view class="card-icon">👤</view>
      </div>
      <view class="user-avatar">
        <text class="avatar-placeholder">{{ userInitial }}</text>
      </view>
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

    <!-- 诊断记录卡片 -->
    <view class="card records-card" v-if="medicalRecords.length > 0">
      <div class="card-header">
        <text class="card-title">诊断记录</text>
        <view class="card-icon">📋</view>
      </div>
      <text class="record-count">{{ medicalRecords.length }} 条记录</text>
      <view class="records-list">
        <view class="record-item" v-for="(record, index) in medicalRecords" :key="index">
          <view class="record-icon">📝</view>
          <text class="record-content">{{ record }}</text>
        </view>
      </view>
    </view>

    <!-- 诊断图像卡片 (新增) -->
    <view class="card images-card" v-if="imageRecords.length > 0">
      <div class="card-header">
        <text class="card-title">诊断图像</text>
        <view class="card-icon">🖼️</view>
      </div>
      <text class="image-count">{{ imageRecords.length }} 张图像</text>
      <view class="images-list">
        <view class="image-item" v-for="(imageUrl, index) in imageRecords" :key="index">
          <image 
            :src="imageUrl" 
            mode="aspectFill"
            class="diagnosis-image"
            @click="previewImage(imageUrl, index)"
          />
          <text class="image-label">诊断图像 {{ index + 1 }}</text>
        </view>
      </view>
    </view>

    <!-- 加载状态提示 -->
    <view class="card loading-card" v-if="isLoading">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载诊断记录...</text>
    </view>

    <!-- 错误提示 -->
    <view class="card error-card" v-if="errorMessage">
      <view class="error-icon">⚠️</view>
      <text class="error-text">{{ errorMessage }}</text>
    </view>

    <!-- 皮肤综合评分卡片 -->
    <view class="card score-card" v-if="isInfoComplete">
      <div class="card-header">
        <text class="card-title">皮肤综合评分</text>
        <view class="card-icon">⭐</view>
      </div>
      <view class="score-display">
        <text class="score-number">{{ skinData.overallScore || '--' }}</text>
        <text class="score-label">/ 100</text>
      </view>
      <view class="score-progress">
        <view class="score-progress-bar">
          <view 
            class="score-progress-fill" 
            :style="{ width: `${(skinData.overallScore || 0)}%` }"
          ></view>
        </view>
      </view>
    </view>

    <!-- 肌肤年龄卡片 -->
    <view class="card age-card" v-if="isInfoComplete">
      <div class="card-header">
        <text class="card-title">肌肤年龄</text>
        <view class="card-icon">🎂</view>
      </div>
      <view class="age-display">
        <text class="age-number">{{ userInfo.age || 0 }}</text>
        <text class="age-unit">岁</text>
      </view>
      <view class="age-comparison" v-if="userInfo.age">
        <text class="comparison-text" :class="getAgeComparisonClass()">
          {{ getAgeComparisonText() }}
        </text>
      </view>
    </view>

    <!-- 皮肤指标详情卡片 -->
    <view class="card indicators-card" v-if="isInfoComplete">
      <div class="card-header">
        <text class="card-title">皮肤指标详情</text>
        <view class="card-icon">📊</view>
      </div>
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
                background: getGradientByValue(item.value)
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
        <view class="card-icon">💡</view>
      </div>
      <text class="incomplete-text">请先完善个人信息，以获取您的专属皮肤档案</text>
      <button class="edit-info-btn" @click="navigateToEditInfo">
        完善信息
      </button>
    </view>

    <!-- 推荐按钮 -->
    <button 
      class="recommend-btn" 
      @click="navigateToRecommend"
      :disabled="!isInfoComplete"
      :class="{ 'disabled': !isInfoComplete }"
    >
      <text class="btn-text">查看护肤品建议</text>
      <view class="btn-icon">➔</view>
    </button>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getCurrentUser } from '@/services/auth-service.js';

// 获取路由实例
const route = useRoute();

// 新增：诊断记录相关
const medicalRecords = ref([]);
const imageRecords = ref([]); // 专门存储图像URL
const isLoading = ref(false);
const errorMessage = ref('');

// 用户信息
const userInfo = ref({
  age: '',
  gender: '',
  username: '',
  nickname: ''
});

// 计算用户首字母
const userInitial = computed(() => {
  const name = userInfo.value.username || userInfo.value.nickname || '用户';
  return name.charAt(0).toUpperCase();
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

// 获取年龄比较文本
const getAgeComparisonText = () => {
  const age = parseInt(userInfo.value.age);
  if (age < 25) return '比实际年龄年轻';
  if (age < 35) return '与实际年龄相符';
  return '比实际年龄成熟';
};

// 获取年龄比较样式类
const getAgeComparisonClass = () => {
  const age = parseInt(userInfo.value.age);
  if (age < 25) return 'comparison-good';
  if (age < 35) return 'comparison-normal';
  return 'comparison-bad';
};

// 页面加载时执行
onMounted(() => {
  // 1. 获取用户信息
  const user = getCurrentUser();
  if (user) {
    userInfo.value = { ...user };
  }

  // 2. 获取路由参数中的指标数据
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

// 监听username变化，自动请求数据
watch(
  () => userInfo.value.username || userInfo.value.nickname,
  (newUserId) => {
    if (newUserId) {
      fetchMedicalRecords(newUserId);
    }
  },
  { immediate: true } // 立即执行一次
);

const fetchMedicalRecords = async (userId) => {
  if (!userId) {
    errorMessage.value = '用户ID不存在';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  medicalRecords.value = [];
  imageRecords.value = []; // 清空图像记录

  try {
    // 创建URLSearchParams对象并添加参数
    const body = new URLSearchParams();
    body.append('user_id', userId);

    // 发送POST请求
    const response = await fetch('http://172.30.154.81:8000/database/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body  // 使用正确的参数对象
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }

    const data = await response.json();
    let allRecords = [];
    
    if (data.fact && Array.isArray(data.fact)) {
      allRecords = allRecords.concat(data.fact);
    }
    
    if (data.preference && Array.isArray(data.preference)) {
      allRecords = allRecords.concat(data.preference);
    }
    
    if (data.important && Array.isArray(data.important)) {
      allRecords = allRecords.concat(data.important);
    }

    // 专门处理path字段 - 存储图像URL
    if (data.path && Array.isArray(data.path)) {
      imageRecords.value = '~/zhou/agent-system' + data.path;
    }

    if (allRecords.length > 0) {
      medicalRecords.value = allRecords;
    } else {
      medicalRecords.value = ['未查询到有效记录'];
    }
  } catch (error) {
    console.error('查询失败:', error);
    errorMessage.value = `查询失败: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
};

// 图片预览功能
const previewImage = (currentUrl, currentIndex) => {
  const urls = imageRecords.value;
  
  // 使用uni.previewImage实现图片预览
  uni.previewImage({
    current: currentUrl,
    urls: urls,
    indicator: 'number',
    loop: true,
    success: () => {
      console.log('图片预览成功');
    },
    fail: (err) => {
      console.error('图片预览失败:', err);
      uni.showToast({
        title: '图片预览失败',
        icon: 'none'
      });
    }
  });
};

// 加载本地存储的数据
const loadLocalData = () => {
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
    localStorage.setItem('latestSkinDiagnosis', JSON.stringify(data));
  } catch (error) {
    console.error('保存到本地存储失败:', error);
  }
};

// 更新皮肤指标数据
const updateSkinIndicators = (diagnosisData) => {
  const indicatorsData = [
    { name: '黑头', value: diagnosisData.黑头 },
    { name: '光滑度', value: diagnosisData.光滑度 },
    { name: '黑眼圈', value: diagnosisData.黑眼圈 },
    { name: '出油', value: diagnosisData.出油 },
    { name: '毛孔', value: diagnosisData.毛孔 },
    { name: '痘痘', value: diagnosisData.痘痘 }
  ];
  
  skinData.value.indicators = indicatorsData;
  const total = indicatorsData.reduce((sum, item) => sum + item.value, 0);
  skinData.value.overallScore = Math.round((total / indicatorsData.length) * 10);
};

// 检查用户信息是否完善
const checkUserInfo = () => {
  if (!isInfoComplete.value) {
    alert('请完善年龄和性别信息，以便提供更精准的建议');
    return false;
  }
  return true;
};

// 根据指标值获取渐变颜色
const getGradientByValue = (value) => {
  if (value <= 3) return 'linear-gradient(90deg, #ff7694, #ff4d7a)';
  if (value <= 6) return 'linear-gradient(90deg, #df4a6f, #c93a5e)';
  return 'linear-gradient(90deg, #f01e56, #d81b4d)';
};

// 跳转至推荐页面
const navigateToRecommend = () => {
  if (!checkUserInfo()) {
    return;
  }
  
  uni.navigateTo({
    url: '/pages/recommend/recommend'
  });
};

// 跳转至编辑信息页面
const navigateToEditInfo = () => {
  uni.navigateTo({
    url: '/pages/edit-profile/edit-profile'
  });
};
</script>

<style scoped>
/* 页面整体样式 */
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  padding: 30rpx 20rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

/* 通用卡片样式 */
.card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: linear-gradient(90deg, #6a89cc, #4a69bd);
}

.card:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25rpx;
}

.card-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #2c3e50;
  display: block;
}

.card-icon {
  font-size: 36rpx;
}

/* 用户信息卡片 */
.user-info-card {
  text-align: center;
  position: relative;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a89cc, #4a69bd);
  margin: 0 auto 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(106, 137, 204, 0.3);
}

.avatar-placeholder {
  font-size: 48rpx;
  color: white;
  font-weight: bold;
}

.username {
  font-size: 42rpx;
  font-weight: bold;
  color: #2c3e50;
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
  padding: 12rpx 20rpx;
  background-color: #f8fafc;
  border-radius: 12rpx;
}

.detail-label {
  font-size: 28rpx;
  color: #7f8c8d;
}

.detail-value {
  font-size: 28rpx;
  color: #2c3e50;
  font-weight: 500;
}

/* 诊断记录卡片 */
.records-card {
  margin-top: 20rpx;
}

.record-count {
  font-size: 26rpx;
  color: #7f8c8d;
  margin-bottom: 20rpx;
  display: block;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  max-height: 400rpx;
  overflow-y: auto;
}

.record-item {
  padding: 24rpx;
  background-color: #f8fafc;
  border-radius: 16rpx;
  border-left: 6rpx solid #6a89cc;
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  transition: background-color 0.2s ease;
}

.record-item:hover {
  background-color: #f0f4f8;
}

.record-icon {
  font-size: 28rpx;
  margin-top: 4rpx;
}

.record-content {
  font-size: 28rpx;
  color: #2c3e50;
  line-height: 1.6;
  flex: 1;
}

/* 诊断图像卡片 (新增样式) */
.images-card {
  margin-top: 20rpx;
}

.image-count {
  font-size: 26rpx;
  color: #7f8c8d;
  margin-bottom: 20rpx;
  display: block;
}

.images-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  background-color: #f8fafc;
  border-radius: 16rpx;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-item:active {
  transform: scale(0.98);
}

.diagnosis-image {
  width: 100%;
  height: 200rpx;
  border-radius: 12rpx;
  background-color: #eef2f7;
  object-fit: cover;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.image-label {
  font-size: 24rpx;
  color: #7f8c8d;
  text-align: center;
}

/* 加载状态 */
.loading-card {
  text-align: center;
  padding: 60rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #f0f4f8;
  border-top: 6rpx solid #6a89cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #7f8c8d;
}

/* 错误提示 */
.error-card {
  text-align: center;
  padding: 60rpx 0;
  background-color: #fff5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.error-icon {
  font-size: 48rpx;
}

.error-text {
  font-size: 28rpx;
  color: #e53e3e;
}

/* 皮肤综合评分卡片 */
.score-card {
  text-align: center;
}

.score-display {
  display: flex;
  justify-content: center;
  align-items: baseline;
  margin-bottom: 20rpx;
}

.score-number {
  font-size: 72rpx;
  font-weight: bold;
  color: #2c3e50;
}

.score-label {
  font-size: 32rpx;
  color: #7f8c8d;
  margin-left: 10rpx;
}

.score-progress {
  width: 100%;
  padding: 0 20rpx;
}

.score-progress-bar {
  height: 16rpx;
  background-color: #f0f4f8;
  border-radius: 10rpx;
  overflow: hidden;
}

.score-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6a89cc, #4a69bd);
  border-radius: 10rpx;
  transition: width 1s ease;
}

/* 肌肤年龄卡片 */
.age-card {
  text-align: center;
}

.age-display {
  display: flex;
  justify-content: center;
  align-items: baseline;
  margin-bottom: 20rpx;
}

.age-number {
  font-size: 72rpx;
  font-weight: bold;
  color: #2c3e50;
}

.age-unit {
  font-size: 32rpx;
  color: #7f8c8d;
  margin-left: 10rpx;
}

.age-comparison {
  margin-top: 10rpx;
}

.comparison-text {
  font-size: 28rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  display: inline-block;
}

.comparison-good {
  background-color: #e8f6ef;
  color: #27ae60;
}

.comparison-normal {
  background-color: #fff9e6;
  color: #f39c12;
}

.comparison-bad {
  background-color: #fdedec;
  color: #e74c3c;
}

/* 皮肤指标详情卡片 */
.indicators-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.indicator-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.indicator-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.indicator-name {
  font-size: 28rpx;
  color: #2c3e50;
  font-weight: 500;
}

.indicator-value-container {
  display: flex;
  align-items: baseline;
}

.indicator-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #2c3e50;
}

.indicator-unit {
  font-size: 24rpx;
  color: #7f8c8d;
  margin-left: 4rpx;
}

.progress-bar {
  height: 12rpx;
  background-color: #f0f4f8;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.8s ease;
}

/* 未完善信息提示 */
.incomplete-card {
  text-align: center;
}

.incomplete-text {
  font-size: 28rpx;
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 30rpx;
  display: block;
}

.edit-info-btn {
  background: linear-gradient(135deg, #6a89cc, #4a69bd);
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  box-shadow: 0 6rpx 16rpx rgba(106, 137, 204, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.edit-info-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 8rpx rgba(106, 137, 204, 0.3);
}

/* 推荐按钮 */
.recommend-btn {
  background: linear-gradient(135deg, #6a89cc, #4a69bd);
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 28rpx 40rpx;
  font-size: 32rpx;
  font-weight: 500;
  box-shadow: 0 8rpx 24rpx rgba(106, 137, 204, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16rpx;
  margin-top: 20rpx;
}

.recommend-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba(106, 137, 204, 0.4);
}

.recommend-btn.disabled {
  background: #bdc3c7;
  box-shadow: none;
  transform: none;
}

.btn-text {
  font-size: 32rpx;
}

.btn-icon {
  font-size: 28rpx;
  transition: transform 0.3s ease;
}

.recommend-btn:active .btn-icon {
  transform: translateX(4rpx);
}
</style>