<template>
  <view class="symptom-check-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">症状自查</text>
      <text class="page-subtitle">请选择您的症状，系统将为您提供可能的疾病和建议</text>
      <text class="disclaimer-small">⚠️ 结果仅供参考，不能替代专业医疗诊断</text>
    </view>
    
    <!-- 症状自查表单 -->
    <view class="form-container">
      <view class="form-item">
        <text class="form-label">请选择您的症状（可多选）：</text>
        <view class="symptom-grid">
          <view 
            v-for="(symptom, index) in symptoms" 
            :key="index"
            :class="['symptom-tag', selectedSymptoms.includes(symptom) ? 'selected' : '']"
            @click="toggleSymptom(symptom)"
          >
            {{ symptom }}
          </view>
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">主要发病部位：</text>
        <picker 
          @change="onLocationChange" 
          :value="locationIndex"
          :range="locations"
          class="picker"
        >
          <view class="picker-display">
            {{ locations[locationIndex] }}
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">症状持续时间：</text>
        <picker 
          @change="onDurationChange" 
          :value="durationIndex"
          :range="durations"
          class="picker"
        >
          <view class="picker-display">
            {{ durations[durationIndex] }}
          </view>
        </picker>
      </view>
      
      <button 
        class="submit-btn" 
        @click="submitForm"
        :disabled="!selectedSymptoms.length"
      >
        提交查询
      </button>
      
      <text class="form-hint" v-if="!selectedSymptoms.length">请至少选择一个症状</text>
    </view>
    
    <!-- 结果展示区域 -->
    <view class="results-container" v-if="showResults">
      <view class="section-title">分析结果</view>
      <text class="results-intro">根据您提供的信息，以下是可能的疾病：</text>
      
      <view class="disease-cards">
        <view 
          v-for="(disease, index) in matchedDiseases" 
          :key="index"
          class="disease-card"
        >
          <view class="card-header">
            <text class="card-title">
              {{ index + 1 }}. {{ disease.name }} 
              <text class="match-score">（匹配度: {{ (disease.score * 100).toFixed(0) }}%）</text>
            </text>
          </view>
          
          <view class="card-content">
            <view class="disease-image">
              <image :src="disease.image" mode="widthFix"></image>
            </view>
            
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
                <text class="info-value">{{ disease.targetGroup }}</text>
              </view>
              <view class="info-item advice">
                <text class="info-label">建议：</text>
                <text class="info-value">{{ disease.advice }}</text>
              </view>
            </view>
          </view>
          
          <!-- AI建议 -->
          <view class="ai-advice-section">
            <view class="ai-advice-header">
              <text class="ai-advice-title">AI专业建议</text>
              <view class="loading" v-if="aiAdviceLoading[index]">
                <view class="loading-dot"></view>
                <view class="loading-dot"></view>
                <view class="loading-dot"></view>
              </view>
            </view>
            <view class="ai-advice-content" v-if="aiAdvices[index]">
              {{ aiAdvices[index] }}
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 页脚声明 -->
    <view class="page-footer">
      <text>© 2025 皮肤健康助手 | 本应用仅供参考，不能替代专业医疗诊断</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// 导入正确的AI接口方法
import { getAISkinConsultation } from '@/services/ai-api.js';
// 导入认证服务
import { getCurrentUser } from '@/services/auth-service.js';

// 症状数据
const symptoms = ref([
  "皮肤发红", "瘙痒", "疼痛", "水疱", "鳞屑", "渗液", "干燥", 
  "肿胀", "风团", "结节", "色素沉着", "脱屑", "油脂分泌过多"
]);

// 发病部位数据
const locations = ref([
  "头部", "面部", "颈部", "胸部", "背部", "腹部", "手臂", 
  "手掌", "腿部", "足底", "生殖器", "全身"
]);

// 持续时间数据
const durations = ref([
  "不到1天", "1-3天", "4-7天", "1-2周", "2周-1个月", "1-3个月", "3个月以上"
]);

// 皮肤病数据库
const diseaseData = ref([
  {
    name: "湿疹",
    symptoms: "皮肤发红、瘙痒、小水泡、渗液",
    locations: "手、脚、肘窝、腘窝",
    targetGroup: "儿童、过敏体质者",
    advice: "避免刺激物、保持皮肤湿润、使用糖皮质激素软膏",
    image: "https://so1.360tres.com/t01a5775726fd982cc5.png"
  },
  {
    name: "银屑病",
    symptoms: "红色斑块覆盖银白色鳞屑、干燥、瘙痒",
    locations: "头皮、肘部、膝盖、背部",
    targetGroup: "青壮年",
    advice: "保持皮肤清洁、使用保湿剂、光疗或系统治疗",
    image: "https://p1.ssl.qhimgs1.com/sdr/400__/t013db64df05514e6ab.jpg"
  },
  {
    name: "痤疮",
    symptoms: "粉刺、丘疹、脓疱、结节",
    locations: "面部、胸部、背部",
    targetGroup: "青少年、油性皮肤者",
    advice: "保持皮肤清洁、避免油腻食物、使用外用药物",
    image: "https://p0.ssl.qhimgs1.com/sdr/400__/t01ff18455a216c6246.jpg"
  },
  {
    name: "荨麻疹",
    symptoms: "红色风团、剧烈瘙痒、时起时消",
    locations: "全身任何部位",
    targetGroup: "过敏体质者",
    advice: "避免过敏原、抗组胺药物治疗",
    image: "https://p0.ssl.qhimgs1.com/sdr/400__/t012a019aa385356d5e.png"
  },
  {
    name: "带状疱疹",
    symptoms: "单侧带状分布的水疱、疼痛",
    locations: "胸部、腰部、面部",
    targetGroup: "免疫力低下者",
    advice: "早期抗病毒治疗、止痛、营养神经",
    image: "https://p1.ssl.qhimgs1.com/sdr/400__/t012c1ecf704aec1f17.jpg"
  },
  {
    name: "黑色素瘤",
    symptoms: "不对称、边界不规则、颜色不均匀的痣",
    locations: "全身皮肤、黏膜",
    targetGroup: "长期紫外线暴露者",
    advice: "立即就医、手术切除、病理检查",
    image: "https://p2.ssl.qhimgs1.com/sdr/400__/t0103b7078436f7d7a8.png"
  },
  {
    name: "脂溢性皮炎",
    symptoms: "头皮、面部油脂分泌多、红斑、脱屑",
    locations: "头皮、鼻翼两侧、眉毛",
    targetGroup: "油性皮肤者",
    advice: "保持皮肤清洁、使用抗真菌洗发水、低脂饮食",
    image: "https://p5.ssl.qhimgs1.com/sdr/400__/t0121d57b90a87a1fff.jpg"
  },
  {
    name: "特应性皮炎",
    symptoms: "慢性瘙痒、皮肤干燥、苔藓样变",
    locations: "面部、颈部、四肢屈侧",
    targetGroup: "有遗传过敏史者",
    advice: "避免刺激物、保持皮肤湿润、使用糖皮质激素软膏",
    image: "https://p3.ssl.qhimgs1.com/sdr/400__/t01dc0a15c417457c4d.jpg"
  }
]);

// 表单数据
const selectedSymptoms = ref([]);
const locationIndex = ref(0);
const durationIndex = ref(0);

// 结果数据
const showResults = ref(false);
const matchedDiseases = ref([]);
const aiAdvices = ref([]);
const aiAdviceLoading = ref([]);
const userInfo = ref({}); // 用户信息（从全局获取）
const skinType = ref('混合性'); // 默认皮肤类型，可根据实际情况修改

// 页面加载时获取用户信息
onMounted(() => {
  // 使用auth-service获取用户信息
  const user = getCurrentUser();
  if (user) {
    userInfo.value = user;
  }
});

// 切换症状选择
const toggleSymptom = (symptom) => {
  if (selectedSymptoms.value.includes(symptom)) {
    selectedSymptoms.value = selectedSymptoms.value.filter(s => s !== symptom);
  } else {
    selectedSymptoms.value.push(symptom);
  }
};

// 处理部位选择变化
const onLocationChange = (e) => {
  locationIndex.value = e.detail.value;
};

// 处理持续时间选择变化
const onDurationChange = (e) => {
  durationIndex.value = e.detail.value;
};

// 计算匹配度
const calculateMatchScore = (disease) => {
  const selected = selectedSymptoms.value;
  const diseaseSymptoms = disease.symptoms.split('、');
  
  // 症状匹配度
  let symptomScore = 0;
  if (selected.length > 0) {
    selected.forEach(symptom => {
      if (diseaseSymptoms.some(ds => ds.includes(symptom) || symptom.includes(ds))) {
        symptomScore++;
      }
    });
    symptomScore /= selected.length;
  }
  
  // 部位匹配度
  const locationScore = disease.locations.includes(locations.value[locationIndex.value]) ? 1 : 0.5;
  
  // 综合得分
  return symptomScore * 0.7 + locationScore * 0.3;
};

// 提交表单
const submitForm = () => {
  if (selectedSymptoms.value.length === 0) return;
  
  // 计算匹配度并排序
  const diseasesWithScores = diseaseData.value.map(disease => ({
    ...disease,
    score: calculateMatchScore(disease)
  })).sort((a, b) => b.score - a.score);
  
  // 取前3名
  matchedDiseases.value = diseasesWithScores.slice(0, 3);
  
  // 初始化AI建议数组
  aiAdvices.value = new Array(matchedDiseases.value.length).fill('');
  aiAdviceLoading.value = new Array(matchedDiseases.value.length).fill(false);
  
  // 获取每个疾病的AI建议
  matchedDiseases.value.forEach((disease, index) => {
    fetchAIAdvice(disease, index);
  });
  
  // 显示结果
  showResults.value = true;
  
  // 滚动到结果区域
  setTimeout(() => {
    const resultsElement = document.querySelector('.results-container');
    if (resultsElement) {
      window.scrollTo({
        top: resultsElement.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  }, 100);
};

// 获取AI建议（使用正确的getAISkinConsultation方法）
const fetchAIAdvice = async (disease, index) => {
  aiAdviceLoading.value[index] = true;
  
  try {
    // 构建参数（确保符合ai-api.js的要求）
    const params = {
      userInfo: {
        age: userInfo.value.age || 30, // 使用从全局获取的年龄，默认30
        gender: userInfo.value.gender || '未知' // 使用从全局获取的性别
      },
      skinType: skinType.value,
      question: `我的皮肤上有${selectedSymptoms.value.join('、')}的症状，主要出现在${locations.value[locationIndex.value]}，已经持续了${durations.value[durationIndex.value]}。关于${disease.name}，能提供更多信息吗？包括可能的原因、预防措施和治疗建议。`
    };
    
    // 调用正确的AI接口方法
    const response = await getAISkinConsultation(params);
    aiAdvices.value[index] = response;
  } catch (error) {
    console.error('获取AI建议失败:', error);
    aiAdvices.value[index] = `获取AI建议失败: ${error.message}`;
  } finally {
    aiAdviceLoading.value[index] = false;
  }
};
</script>

<style scoped>
.symptom-check-page {
  padding: 0 15px 60px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  padding: 20px 15px;
  background-color: #ff6b6b;
  color: white;
  border-radius: 8px;
  margin: 15px 0 20px;
  text-align: center;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 14px;
  display: block;
  margin-bottom: 5px;
  opacity: 0.9;
}

.disclaimer-small {
  font-size: 12px;
  opacity: 0.8;
  display: block;
  margin-top: 10px;
}

/* 表单容器样式 */
.form-container {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.form-item {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
  font-size: 16px;
}

/* 症状选择样式 */
.symptom-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.symptom-tag {
  padding: 8px 15px;
  background-color: #f0f0f0;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.symptom-tag.selected {
  background-color: #4e8cff;
  color: white;
}

/* 选择器样式 */
.picker {
  width: 100%;
}

.picker-display {
  padding: 12px 15px;
  background-color: #f0f0f0;
  border-radius: 6px;
  color: #333;
  font-size: 15px;
}

/* 提交按钮样式 */
.submit-btn {
  width: 100%;
  height: 45px;
  background-color: #4e8cff;
  color: white;
  border-radius: 6px;
  font-size: 16px;
  line-height: 45px;
  margin-top: 10px;
}

.submit-btn:disabled {
  background-color: #ccc;
  color: #666;
}

.form-hint {
  display: block;
  text-align: center;
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 10px;
}

/* 结果区域样式 */
.results-container {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #4e8cff;
  padding-bottom: 8px;
  border-bottom: 1px solid #eaeaea;
  display: block;
}

.results-intro {
  display: block;
  margin-bottom: 20px;
  color: #666;
  font-size: 15px;
}

/* 疾病卡片样式 */
.disease-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.disease-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.disease-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card-header {
  background-color: #f9f9f9;
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

.card-title {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.match-score {
  font-size: 14px;
  color: #666;
  font-weight: normal;
  margin-left: 10px;
}

.card-content {
  display: flex;
  flex-wrap: wrap;
  padding: 15px;
  gap: 15px;
}

.disease-image {
  width: 100%;
  max-width: 150px;
  flex-shrink: 0;
}

.disease-image image {
  width: 100%;
  border-radius: 6px;
}

.disease-info {
  flex: 1;
  min-width: 200px;
}

.info-item {
  margin-bottom: 10px;
  line-height: 1.6;
}

.info-label {
  font-weight: bold;
  color: #4e8cff;
  margin-right: 5px;
}

.info-value {
  color: #333;
  font-size: 14px;
}

.advice .info-value {
  color: #e63946;
}

/* AI建议样式 */
.ai-advice-section {
  padding: 15px;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}

.ai-advice-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.ai-advice-title {
  font-weight: bold;
  color: #333;
  font-size: 15px;
}

.ai-advice-content {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  white-space: pre-line;
}

/* 加载动画 */
.loading {
  display: flex;
  margin-left: 10px;
}

.loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #4e8cff;
  margin: 0 2px;
  animation: loading 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* 页脚样式 */
.page-footer {
  padding: 15px;
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 30px;
}

/* 响应式调整 */
@media (min-width: 768px) {
  .symptom-check-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px 60px;
  }
  
  .card-content {
    flex-wrap: nowrap;
  }
}
</style>
