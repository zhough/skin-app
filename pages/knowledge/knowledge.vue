<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="title">疾病知识库</text>
      <text class="subtitle">了解常见皮肤病的症状、原因和治疗方法</text>
    </view>
    
    <!-- 搜索和筛选区域 -->
    <view class="filter-bar">
      <!-- 搜索框 -->
      <view class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          v-model="searchTerm" 
          placeholder="搜索疾病名称或症状..."
          class="search-input"
        />
      </view>
      
      
    </view>
    
    <!-- 疾病列表 -->
    <view class="disease-list">
      <view 
        class="disease-card" 
        v-for="(disease, index) in filteredDiseases" 
        :key="index"
      >
        <!-- 疾病卡片头部 -->
        <view class="card-header" @click="toggleExpand(index)">
          <text class="disease-name">{{ disease.name }}</text>
          <span 
            class="expand-icon"
            :class="{ 'rotated': disease.expanded }"
          >▼</span>
        </view>
        
        <!-- 疾病详情（展开时显示） -->
        <view class="card-content" v-if="disease.expanded">
          <!-- 疾病图片 -->
          <image 
            :src="disease.image" 
            mode="widthFix" 
            class="disease-image"
            lazy-load
          ></image>
          
          <!-- 疾病信息 -->
          <view class="disease-info">
            <view class="info-item">
              <text class="info-label">症状：</text>
              <text class="info-value">{{ disease.symptoms }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">常见部位：</text>
              <text class="info-value">{{ disease.locations }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">高发人群：</text>
              <text class="info-value">{{ disease.highRiskGroups }}</text>
            </view>
            <view class="info-item suggestion">
              <text class="info-label">建议：</text>
              <text class="info-value">{{ disease.suggestion }}</text>
            </view>
          </view>
          
          <!-- 免责声明 -->
          <view class="disclaimer">
            <text>⚠️ 注意：以上信息仅供参考，不能替代专业医疗诊断。</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空状态提示 -->
    <view class="empty-state" v-if="filteredDiseases.length === 0">
      <span class="empty-icon">🔍</span>
      <text class="empty-text">未找到匹配的疾病</text>
      <text class="empty-subtext">请尝试其他搜索关键词或筛选条件</text>
    </view>
    
    <!-- 页脚 -->
    <view class="footer">
      <text class="footer-text">© 皮肤健康助手 | 本应用仅供参考，不能替代专业医疗诊断</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';

// 发病部位列表
const locationOptions = [
  { value: 'all', text: '全部' },
  { value: '头部', text: '头部' },
  { value: '面部', text: '面部' },
  { value: '颈部', text: '颈部' },
  { value: '胸部', text: '胸部' },
  { value: '背部', text: '背部' },
  { value: '腹部', text: '腹部' },
  { value: '手臂', text: '手臂' },
  { value: '手掌', text: '手掌' },
  { value: '腿部', text: '腿部' },
  { value: '足底', text: '足底' },
  { value: '生殖器', text: '生殖器' },
  { value: '全身', text: '全身' }
];

// 搜索关键词
const searchTerm = ref('');
// 选中的部位筛选条件
const selectedLocation = ref('all');

// 皮肤病数据
const diseases = ref([
  {
    name: "湿疹",
    symptoms: "皮肤发红、瘙痒、小水泡、渗液",
    locations: "手、脚、肘窝、腘窝",
    highRiskGroups: "儿童、过敏体质者",
    suggestion: "避免刺激物、保持皮肤湿润、使用糖皮质激素软膏",
    image: "https://so1.360tres.com/t01a5775726fd982cc5.png",
    expanded: false
  },
  {
    name: "银屑病",
    symptoms: "红色斑块覆盖银白色鳞屑、干燥、瘙痒",
    locations: "头皮、肘部、膝盖、背部",
    highRiskGroups: "青壮年",
    suggestion: "保持皮肤清洁、使用保湿剂、光疗或系统治疗",
    image: "https://p1.ssl.qhimgs1.com/sdr/400__/t013db64df05514e6ab.jpg",
    expanded: false
  },
  {
    name: "痤疮",
    symptoms: "粉刺、丘疹、脓疱、结节",
    locations: "面部、胸部、背部",
    highRiskGroups: "青少年、油性皮肤者",
    suggestion: "保持皮肤清洁、避免油腻食物、使用外用药物",
    image: "https://p0.ssl.qhimgs1.com/sdr/400__/t01ff18455a216c6246.jpg",
    expanded: false
  },
  {
    name: "荨麻疹",
    symptoms: "红色风团、剧烈瘙痒、时起时消",
    locations: "全身任何部位",
    highRiskGroups: "过敏体质者",
    suggestion: "避免过敏原、抗组胺药物治疗",
    image: "https://p0.ssl.qhimgs1.com/sdr/400__/t012a019aa385356d5e.png",
    expanded: false
  },
  {
    name: "带状疱疹",
    symptoms: "单侧带状分布的水疱、疼痛",
    locations: "胸部、腰部、面部",
    highRiskGroups: "免疫力低下者",
    suggestion: "早期抗病毒治疗、止痛、营养神经",
    image: "https://p1.ssl.qhimgs1.com/sdr/400__/t012c1ecf704aec1f17.jpg",
    expanded: false
  },
  {
    name: "黑色素瘤",
    symptoms: "不对称、边界不规则、颜色不均匀的痣",
    locations: "全身皮肤、黏膜",
    highRiskGroups: "长期紫外线暴露者",
    suggestion: "立即就医、手术切除、病理检查",
    image: "https://p0.ssl.qhimgs1.com/sdr/400__/t0103b7078436f7d7a8.png",
    expanded: false
  },
  {
    name: "脂溢性皮炎",
    symptoms: "头皮、面部油脂分泌多、红斑、脱屑",
    locations: "头皮、鼻翼两侧、眉毛",
    highRiskGroups: "油性皮肤者",
    suggestion: "保持皮肤清洁、使用抗真菌洗发水、低脂饮食",
    image: "https://file.youlai.cn/cnkfile1/M00/01/7D/ooYBAFhJOKOAUqryAAKwlhb8T1Y55.jpeg",
    expanded: false
  },
  {
    name: "特应性皮炎",
    symptoms: "慢性瘙痒、皮肤干燥、苔藓样变",
    locations: "面部、颈部、四肢屈侧",
    highRiskGroups: "有遗传过敏史者",
    suggestion: "避免刺激物、保持皮肤湿润、使用糖皮质激素软膏",
    image: "https://file.youlai.cn/cnkfile1/M00/01/38/oYYBAFhJN6eADmAdAAQ_Rs0wgxc08.jpeg",
    expanded: false
  }
]);

// 筛选后的疾病列表
const filteredDiseases = computed(() => {
  return diseases.value.filter(disease => {
    // 搜索筛选
    const matchesSearch = searchTerm.value === '' || 
      disease.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      disease.symptoms.toLowerCase().includes(searchTerm.value.toLowerCase());
    
    // 部位筛选
    const matchesLocation = selectedLocation.value === 'all' || 
      disease.locations.includes(selectedLocation.value);
    
    return matchesSearch && matchesLocation;
  });
});

// 切换疾病详情展开状态
const toggleExpand = (index) => {
  diseases.value[index].expanded = !diseases.value[index].expanded;
};

// 处理部位筛选变化
const onLocationChange = (value) => {
  selectedLocation.value = value;
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60rpx;
}

/* 页面标题 */
.page-header {
  /* Flex 布局，让子元素水平 + 垂直居中 */
  display: flex;
  flex-direction: column; /* 子元素垂直排列 */
  justify-content: center; /* 垂直方向居中 */
  align-items: center; /* 水平方向居中 */
  /* 可根据需求加 padding，比如上下留空白 */
  padding: 30rpx 20rpx; 
  background-color: #ff6b6b;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 26rpx;
  color: #666;
}


.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 60rpx;
  padding: 0 20rpx;
  height: 60rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 10rpx;
  color: #999;
}

.search-input {
	
  flex: 1;
  align-items: center;
  height: 100%;
  padding: 0 10rpx;
  font-size: 26rpx;
  background-color: transparent;
}

.location-filter {
  width: 200rpx;
}

/* 疾病列表 */
.disease-list {
  padding: 20rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

/* 疾病卡片 */
.disease-card {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1px solid #f5f5f5;
}

.disease-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.expand-icon {
  font-size: 20rpx;
  color: #51a2f3;
  transition: transform 0.3s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.card-content {
  padding: 0 20rpx 20rpx;
}

.disease-image {
  width: 100%;
  border-radius: 10rpx;
  margin: 20rpx 0;
}

.disease-info {
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  margin-bottom: 15rpx;
  font-size: 24rpx;
}

.info-label {
  color: #666;
  font-weight: 500;
  min-width: 100rpx;
}

.info-value {
  color: #333;
  flex: 1;
}

.suggestion .info-value {
  color: #e63946;
}

/* 免责声明 */
.disclaimer {
  margin-top: 15rpx;
  padding: 15rpx;
  background-color: #fff8f8;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #ff6b6b;
}

/* 空状态提示 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 20rpx;
  color: #999;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  margin: 20rpx 0 10rpx;
}

.empty-subtext {
  font-size: 24rpx;
}

/* 页脚 */
.footer {
  padding: 20rpx;
  text-align: center;
  font-size: 22rpx;
  color: #999;
  margin-top: 40rpx;
}
</style>
