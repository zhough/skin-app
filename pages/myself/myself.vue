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

    <!-- 诊断记录卡片 (新增) -->
    <view class="card records-card" v-if="medicalRecords.length > 0">
      <div class="card-header">
        <text class="card-title">诊断记录</text>
        <text class="record-count">{{ medicalRecords.length }} 条记录</text>
      </div>
      <view class="records-list">
        <view class="record-item" v-for="(record, index) in medicalRecords" :key="index">
          <text class="record-content">{{ record }}</text>
        </view>
      </view>
    </view>

    <!-- 加载状态提示 (新增) -->
    <view class="card loading-card" v-if="isLoading">
      <text class="loading-text">正在加载诊断记录...</text>
    </view>

    <!-- 错误提示 (新增) -->
    <view class="card error-card" v-if="errorMessage">
      <text class="error-text">{{ errorMessage }}</text>
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
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getCurrentUser } from '@/services/auth-service.js';

// 获取路由实例
const route = useRoute();

// 新增：诊断记录相关
const medicalRecords = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');

// 用户信息
const userInfo = ref({
  age: '',
  gender: '',
  username: '',
  nickname: ''
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

// 根据指标值获取对应颜色
const getColorByValue = (value) => {
  if (value <= 3) return '#ff7694'; // 较差 - 红色
  if (value <= 6) return '#df4a6f'; // 一般 - 玫红色
  return '#f01e56'; // 良好 - 深粉色
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
</script>

<style scoped>
/* 原有样式保持不变，新增以下样式 */
/* 诊断记录卡片 */
.records-card {
  margin-top: 20rpx;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  max-height: 400rpx;
  overflow-y: auto;
}

.record-item {
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  border-left: 4rpx solid #ff6b6b;
}

.record-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.record-count {
  font-size: 24rpx;
  color: #666;
}

/* 加载状态 */
.loading-card {
  text-align: center;
  padding: 40rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

/* 错误提示 */
.error-card {
  text-align: center;
  padding: 40rpx 0;
  background-color: #fff5f5;
}

.error-text {
  font-size: 28rpx;
  color: #e53e3e;
}

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

/* 其他原有样式保持不变 */
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

/* 其他原有样式保持不变 */
</style>