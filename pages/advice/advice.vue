<template>
  <view class="health-advice-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">皮肤健康建议</text>
      <text class="page-subtitle">遵循以下建议，保持皮肤健康</text>
    </view>
    
    <!-- 日常护理建议 -->
    <view class="section">
      <view class="section-title">日常皮肤护理</view>
      <view class="advice-list">
        <view class="advice-item">
          <text class="highlight">1. 保持皮肤清洁</text>：使用温和的清洁产品，避免过度清洁导致皮肤干燥。
        </view>
        <view class="advice-item">
          <text class="highlight">2. 保湿</text>：根据肤质选择合适的保湿产品，保持皮肤水分。
        </view>
        <view class="advice-item">
          <text class="highlight">3. 防晒</text>：每天使用防晒霜，避免长时间暴露在阳光下。
        </view>
        <view class="advice-item">
          <text class="highlight">4. 健康饮食</text>：多吃水果、蔬菜和富含omega-3脂肪酸的食物，少吃辛辣、油腻和甜食。
        </view>
        <view class="advice-item">
          <text class="highlight">5. 充足睡眠</text>：保持7-8小时的高质量睡眠，有利于皮肤修复。
        </view>
      </view>
    </view>
    
    <!-- 问题预防建议 -->
    <view class="section">
      <view class="section-title">皮肤问题预防</view>
      <view class="advice-list">
        <view class="advice-item">
          <text class="highlight">1. 避免刺激物</text>：如化学物质、粗糙织物、过度热水等。
        </view>
        <view class="advice-item">
          <text class="highlight">2. 注意个人卫生</text>：勤换洗衣物、床上用品，避免共用毛巾等个人物品。
        </view>
        <view class="advice-item">
          <text class="highlight">3. 管理压力</text>：长期压力可能导致皮肤问题，学习放松技巧。
        </view>
        <view class="advice-item">
          <text class="highlight">4. 了解自己的皮肤</text>：注意皮肤变化，及时发现问题并寻求帮助。
        </view>
      </view>
    </view>
    
    <!-- 就医建议 -->
    <view class="section">
      <view class="section-title">何时就医</view>
      <view class="advice-list">
        <view class="advice-item">如果出现以下情况，请及时就医：</view>
        <view class="advice-item">• 皮肤问题持续超过2周不改善</view>
        <view class="advice-item">• 伴有发热、寒战等全身症状</view>
        <view class="advice-item">• 皮肤出现大面积红肿、疼痛、渗液</view>
        <view class="advice-item">• 痣的大小、形状、颜色发生变化</view>
        <view class="advice-item">• 出现不明原因的皮疹或溃疡</view>
      </view>
    </view>
    
    <!-- 皮肤测试部分 -->
    <view class="skin-test-section">
      <view class="section-title">皮肤类型自测</view>
      <view class="test-description">回答以下问题，了解您的皮肤类型：</view>
      
      <form @submit.prevent="handleSubmit">
        <!-- 问题1 -->
        <view class="question">
          <text class="question-text">1. 洗完脸后30分钟内，您的皮肤感觉：</text>
          <div class="radio-group">
            <label v-for="option in options.q1" :key="option" class="radio-option">
              <input 
                type="radio" 
                name="q1" 
                :value="option" 
                :checked="answers.q1 === option"
                @change="e => answers.q1 = e.target.value"
              />
              <text>{{ option }}</text>
            </label>
          </div>
        </view>
        
        <!-- 问题2 -->
        <view class="question">
          <text class="question-text">2. T区（额头、鼻子、下巴）在下午的油腻程度：</text>
          <div class="radio-group">
            <label v-for="option in options.q2" :key="option" class="radio-option">
              <input 
                type="radio" 
                name="q2" 
                :value="option" 
                :checked="answers.q2 === option"
                @change="e => answers.q2 = e.target.value"
              />
              <text>{{ option }}</text>
            </label>
          </div>
        </view>
        
        <!-- 问题3 -->
        <view class="question">
          <text class="question-text">3. 您的毛孔看起来：</text>
          <div class="radio-group">
            <label v-for="option in options.q3" :key="option" class="radio-option">
              <input 
                type="radio" 
                name="q3" 
                :value="option" 
                :checked="answers.q3 === option"
                @change="e => answers.q3 = e.target.value"
              />
              <text>{{ option }}</text>
            </label>
          </div>
        </view>
        
        <!-- 问题4 -->
        <view class="question">
          <text class="question-text">4. 您的皮肤是否容易发红或敏感：</text>
          <div class="radio-group">
            <label v-for="option in options.q4" :key="option" class="radio-option">
              <input 
                type="radio" 
                name="q4" 
                :value="option" 
                :checked="answers.q4 === option"
                @change="e => answers.q4 = e.target.value"
              />
              <text>{{ option }}</text>
            </label>
          </div>
        </view>
        
        <!-- 问题5 -->
        <view class="question">
          <text class="question-text">5. 您的皮肤是否有脱皮现象：</text>
          <div class="radio-group">
            <label v-for="option in options.q5" :key="option" class="radio-option">
              <input 
                type="radio" 
                name="q5" 
                :value="option" 
                :checked="answers.q5 === option"
                @change="e => answers.q5 = e.target.value"
              />
              <text>{{ option }}</text>
            </label>
          </div>
        </view>
        
        <button form-type="submit" class="submit-btn" :disabled="isLoading">
          <text v-if="!isLoading">提交测试</text>
          <text v-if="isLoading">分析中...</text>
        </button>
      </form>
      
      <!-- 测试结果 -->
      <view v-if="testResult" class="result-section">
        <view class="result-title">您的皮肤类型是：{{ testResult.skinType }}</view>
        <view class="result-advice">{{ testResult.basicAdvice }}</view>
        
        <!-- AI个性化建议 -->
        <view v-if="aiAdvice" class="ai-advice-section">
          <view class="ai-title">AI个性化建议：</view>
          <view class="ai-content">{{ aiAdvice }}</view>
        </view>
      </view>
    </view>
    
    <!-- 免责声明 -->
    <view class="disclaimer">
      <text class="disclaimer-title">重要提示</text>
      <text class="disclaimer-content">以上建议仅供参考，不能替代专业医疗诊断。如有严重皮肤问题，请及时咨询皮肤科医生。</text>
    </view>
  </view>
</template>

<script>
// 导入所需服务
import { getAISkinConsultation } from '@/services/ai-api.js';
import { getCurrentUser } from '@/services/auth-service.js';

export default {
  data() {
    return {
      // 用户信息（从全局获取）
      userInfo: {
        age: '',
        gender: ''
      },
      
      // 皮肤测试答案
      answers: {
        q1: '',
        q2: '',
        q3: '',
        q4: '',
        q5: ''
      },
      
      // 问题选项
      options: {
        q1: ['紧绷', '正常', '轻微油腻', '明显油腻'],
        q2: ['不油', '轻微油光', '明显油光', '反光'],
        q3: ['几乎看不见', 'T区可见', '全脸可见', '粗大明显'],
        q4: ['经常', '偶尔', '很少', '从不'],
        q5: ['经常', '偶尔', '很少', '从不']
      },
      
      // 测试结果
      testResult: null,
      
      // AI建议
      aiAdvice: '',
      
      // 加载状态
      isLoading: false
    };
  },
  mounted() {
    // 使用auth-service获取用户信息
    const user = getCurrentUser();
    if (user) {
      this.userInfo = {
        ...this.userInfo,
        ...user
      };
    }

    // 提示用户完善信息（如果未填写）
    if (!this.userInfo.age || !this.userInfo.gender) {
      if (window.confirm('请完善年龄和性别信息，以获取更精准的建议')) {
        this.$router.push('/personal');
      }
    }
  },
  methods: {
    // 确定皮肤类型
    determineSkinType(answers) {
      const scores = {
        '干性': 0,
        '中性': 0,
        '油性': 0,
        '混合性': 0,
        '敏感性': 0
      };

      // 问题1评分
      if (answers.q1 === '紧绷') {
        scores['干性'] += 1;
        scores['敏感性'] += 1;
      } else if (answers.q1 === '正常') {
        scores['中性'] += 1;
      } else if (answers.q1 === '轻微油腻') {
        scores['混合性'] += 1;
      } else if (answers.q1 === '明显油腻') {
        scores['油性'] += 1;
      }

      // 问题2评分
      if (answers.q2 === '不油') {
        scores['干性'] += 1;
      } else if (answers.q2 === '轻微油光') {
        scores['中性'] += 1;
      } else if (answers.q2 === '明显油光') {
        scores['油性'] += 1;
        scores['混合性'] += 1;
      } else if (answers.q2 === '反光') {
        scores['油性'] += 2;
      }

      // 问题3评分
      if (answers.q3 === '几乎看不见') {
        scores['中性'] += 1;
      } else if (answers.q3 === 'T区可见') {
        scores['混合性'] += 1;
      } else if (answers.q3 === '全脸可见') {
        scores['油性'] += 1;
      } else if (answers.q3 === '粗大明显') {
        scores['油性'] += 2;
      }

      // 问题4评分
      if (answers.q4 === '经常') {
        scores['敏感性'] += 2;
      } else if (answers.q4 === '偶尔') {
        scores['敏感性'] += 1;
      }

      // 问题5评分
      if (answers.q5 === '经常') {
        scores['干性'] += 2;
      } else if (answers.q5 === '偶尔') {
        scores['干性'] += 1;
      }

      // 确定最高分数的皮肤类型
      let skinType = '中性';
      let maxScore = 0;
      
      for (const type in scores) {
        if (scores[type] > maxScore) {
          maxScore = scores[type];
          skinType = type;
        }
      }

      // 处理混合类型特殊情况
      if (skinType === '中性' && maxScore < 2) {
        if (scores['油性'] > 0 && scores['干性'] > 0) {
          skinType = '混合性';
        }
      }

      // 基础建议
      const basicAdvice = this.getBasicAdvice(skinType);
      
      return { skinType, basicAdvice };
    },
    
    // 获取基础建议
    getBasicAdvice(skinType) {
      const adviceMap = {
        '干性': '干性皮肤需要加强保湿，选择滋润型护肤品，避免使用含酒精的产品。洗澡水温不宜过高，时间不宜过长。',
        '中性': '中性皮肤是理想的皮肤状态，保持日常基础护理即可，注意定期清洁和保湿，避免环境因素导致皮肤失衡。',
        '油性': '油性皮肤需要注意清洁，选择清爽型护肤品，避免过于油腻的产品。饮食宜清淡，减少油脂摄入。',
        '混合性': '混合性皮肤T区较油，两颊可能偏干，建议分区护理，T区使用清爽型产品，两颊使用保湿产品。',
        '敏感性': '敏感性皮肤应选择温和、无刺激的护肤品，避免含有香精和酒精的产品，注意防晒，减少皮肤刺激。'
      };
      
      return adviceMap[skinType] || '请根据您的皮肤特点选择合适的护理方式。';
    },
    
    // 提交测试
    async handleSubmit() {
      // 验证是否完成所有问题
      const isComplete = Object.values(this.answers).every(answer => answer !== '');
      if (!isComplete) {
        alert('请完成所有问题');
        return;
      }
      

      
      // 显示加载状态
      this.isLoading = true;
      this.testResult = null;
      this.aiAdvice = '';
      
      try {
        // 确定皮肤类型
        this.testResult = this.determineSkinType(this.answers);
        
        // 调用AI接口获取个性化建议（仅使用getAISkinConsultation）
        this.aiAdvice = await getAISkinConsultation({
          userInfo: this.userInfo,
          skinType: this.testResult.skinType
        });
      } catch (error) {
        console.error('获取AI建议失败:', error);
        this.aiAdvice = '获取个性化建议失败，请稍后重试';
      } finally {
        // 隐藏加载状态
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.health-advice-page {
  padding: 15px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 25px;
  padding: 10px 0;
}

.page-title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
}

.section {
  background-color: white;
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.advice-list {
  font-size: 15px;
  color: #444;
  line-height: 1.7;
}

.advice-item {
  margin-bottom: 12px;
  position: relative;
  padding-left: 5px;
}

.advice-item:last-child {
  margin-bottom: 0;
}

.highlight {
  color: #4e8cff;
  font-weight: 500;
}

.skin-test-section {
  background-color: white;
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.test-description {
  font-size: 15px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.question {
  margin-bottom: 25px;
}

.question-text {
  display: block;
  font-size: 16px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 500;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #444;
}

.submit-btn {
  width: 100%;
  height: 45px;
  background-color: #4e8cff;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  margin-top: 10px;
}

.submit-btn:disabled {
  background-color: #ccc;
}

.result-section {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px dashed #eee;
}

.result-title {
  font-size: 17px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.result-advice {
  font-size: 15px;
  color: #444;
  line-height: 1.7;
  margin-bottom: 20px;
}

.ai-advice-section {
  background-color: #f0f7ff;
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
}

.ai-title {
  font-size: 16px;
  font-weight: bold;
  color: #4e8cff;
  margin-bottom: 10px;
}

.ai-content {
  font-size: 15px;
  color: #333;
  line-height: 1.7;
}

.disclaimer {
  background-color: #fff8e6;
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
}

.disclaimer-title {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #e6a23c;
  margin-bottom: 8px;
}

.disclaimer-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}
</style>
