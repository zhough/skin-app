<template>
  <view class="ai-chat-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">AI皮肤科医生助手</text>
      <text class="page-subtitle">在这里您可以向AI医生咨询任何皮肤相关的问题</text>
      <text class="disclaimer-small">AI的回答仅供参考，不能替代专业医疗诊断</text>
    </view>
    
    <!-- 聊天内容区域 -->
    <view class="chat-container" ref="chatContainer">
      <view class="message-list">
        <!-- 消息列表 -->
        <view 
          v-for="(message, index) in messages" 
          :key="index" 
          :class="['message-item', message.role === 'user' ? 'user-message' : 'assistant-message']"
        >
          <view class="avatar">
            <image 
              :src="message.role === 'user' ? '/static/user-avatar.png' : '/static/doctor-avatar.png'" 
              mode="widthFix"
              alt="用户头像"
            ></image>
          </view>
          <view class="message-content">
            <text>{{ message.content }}</text>
          </view>
        </view>
        
        <!-- 加载状态 -->
        <view class="loading" v-if="isLoading">
          <view class="loading-dot"></view>
          <view class="loading-dot"></view>
          <view class="loading-dot"></view>
        </view>
      </view>
    </view>
    
    <!-- 输入区域 -->
    <view class="input-area">
      <textarea 
        v-model="userInput" 
        placeholder="请输入您的皮肤相关问题..." 
        class="input-textarea"
        @keypress.enter.prevent="sendMessage"
        rows="1"
        maxlength="500"
      ></textarea>
      <button 
        class="send-button" 
        @click="sendMessage"
        :disabled="!userInput.trim() || isLoading"
      >
        发送
      </button>
    </view>
    
    <!-- 底部免责声明 -->
    <view class="bottom-disclaimer">
      <text>© 2025 皮肤健康助手 | 本应用仅供参考，不能替代专业医疗诊断</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { getAISkinConsultation } from '@/services/ai-api.js';
import { getCurrentUser } from '@/services/auth-service.js';

// 用户信息（从全局获取）
const userInfo = ref({
  age: '',
  gender: '',
  id: '' // 确保包含用户ID
});

// 皮肤类型
const skinType = ref('未知');

// 聊天消息列表
const messages = ref([
  {
    role: 'assistant',
    content: '您好！我是您的AI皮肤科医生助手。我可以帮您解答关于皮肤健康的问题，或者提供一些初步的建议。请问有什么可以帮助您的吗？'
  }
]);

// 用户输入内容
const userInput = ref('');

// 加载状态
const isLoading = ref(false);

// 聊天容器引用
const chatContainer = ref(null);

// 页面加载时获取用户信息
onMounted(() => {
  const user = getCurrentUser();
  if (user) {
    userInfo.value = {
      ...userInfo.value,
      ...user
    };
  }
  checkUserInfo();
  scrollToBottom();
});

// 检查用户信息是否完善
const checkUserInfo = () => {
  if (!userInfo.value.age || !userInfo.value.gender || !userInfo.value.id) {
    const confirmed = window.confirm('请完善个人信息（包括ID、年龄和性别），以便提供更精准的建议');
    if (confirmed) {
      window.location.href = '/personal';
    }
  }
};

// 发送消息
const sendMessage = async () => {
  const input = userInput.value.trim();
  if (!input || isLoading.value) return;
  
  // 再次检查用户信息
  if (!userInfo.value.age || !userInfo.value.gender || !userInfo.value.id) {
    checkUserInfo();
    return;
  }
  
  // 添加用户消息（修复不显示问题）
  const userMessage = {
    role: 'user',
    content: input
  };
  messages.value.push(userMessage);
  
  // 清空输入框
  userInput.value = '';
  
  // 滚动到底部
  scrollToBottom();
  
  // 显示加载状态
  isLoading.value = true;
  
  try {
    // 调用API获取回复
    const response = await getAISkinConsultation({
      userId: userInfo.value.id, // 明确传递用户ID
      userInfo: {
        age: Number(userInfo.value.age), // 确保是数字类型
        gender: userInfo.value.gender
      },
      skinType: skinType.value,
      question: input
    });
    
    // 添加AI回复
    messages.value.push({
      role: 'assistant',
      content: response
    });
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: `抱歉，请求失败: ${error.message}`
    });
    console.error('API调用失败:', error);
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

// 滚动到最底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      const container = chatContainer.value;
      container.scrollTop = container.scrollHeight;
    }
  });
};

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  scrollToBottom();
});
</script>

<style scoped>
.ai-chat-page {
  padding-bottom: 80px;
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 20px;
  background: linear-gradient(135deg, #4e8cff, #0051d5);
  color: white;
  text-align: center;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.page-title {
  font-size: 22px;
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
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 15px;
}

.message-list {
  padding: 10px 0;
}

.message-item {
  display: flex;
  margin-bottom: 18px;
  max-width: 85%;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  flex-direction: row-reverse;
  margin-left: auto;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.avatar image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  padding: 12px 15px;
  border-radius: 18px;
  line-height: 1.6;
  font-size: 15px;
  word-break: break-all;
  max-width: calc(100% - 50px);
}

.user-message .message-content {
  background-color: #4e8cff;
  color: white;
  border-top-right-radius: 4px;
  margin-left: 10px;
  box-shadow: 0 1px 3px rgba(78, 140, 255, 0.2);
}

.assistant-message .message-content {
  background-color: white;
  color: #333;
  border-top-left-radius: 4px;
  margin-right: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.loading {
  display: flex;
  justify-content: center;
  padding: 15px 0;
}

.loading-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #4e8cff;
  margin: 0 5px;
  animation: loading 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.input-area {
  display: flex;
  padding: 15px;
  background-color: white;
  border-top: 1px solid #eee;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.input-textarea {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 22px;
  font-size: 15px;
  margin-right: 10px;
  resize: none;
  transition: all 0.3s;
}

.input-textarea:focus {
  border-color: #4e8cff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(78, 140, 255, 0.1);
}

.send-button {
  width: 60px;
  height: 44px;
  background-color: #4e8cff;
  color: white;
  border-radius: 22px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.3s;
}

.send-button:not(:disabled):hover {
  background-color: #3a75e0;
  transform: translateY(-1px);
}

.send-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.bottom-disclaimer {
  position: fixed;
  bottom: 70px;
  left: 0;
  right: 0;
  padding: 8px 15px;
  font-size: 12px;
  color: #999;
  text-align: center;
  background-color: transparent;
}
</style>