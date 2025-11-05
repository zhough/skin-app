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
  gender: ''
});

// 皮肤类型（默认未知，用户可在聊天中提及或通过测试获取）
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

  // 检查用户信息是否完善
  checkUserInfo();
  scrollToBottom();
});

// 检查用户信息是否完善
const checkUserInfo = () => {
  if (!userInfo.value.age || !userInfo.value.gender) {
    const confirmed = window.confirm('请完善年龄和性别信息，以便提供更精准的建议');
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
  if (!userInfo.value.age || !userInfo.value.gender) {
    checkUserInfo();
    return;
  }
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: input
  });
  
  // 清空输入框
  userInput.value = '';
  
  // 滚动到底部
  scrollToBottom();
  
  // 显示加载状态
  isLoading.value = true;
  
  try {
    // 调用API获取回复（使用getAISkinConsultation）
    const response = await getAISkinConsultation({
      userInfo: userInfo.value,
      skinType: skinType.value,
      question: input // 将用户输入作为问题传入
    });
    
    // 添加AI回复
    messages.value.push({
      role: 'assistant',
      content: response
    });
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: '抱歉，暂时无法获取回复，请稍后再试。'
    });
    console.error('API调用失败:', error);
  } finally {
    // 隐藏加载状态
    isLoading.value = false;
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
  padding-bottom: 60px;
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 20px;
  background-color: #ff6b6b;
  color: white;
  text-align: center;
  margin-bottom: 15px;
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
}

.user-message .message-content {
  background-color: #ff6b6b;
  color: white;
  border-top-right-radius: 4px;
  margin-left: 10px;
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
  background-color: #ff6b6b;
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
  padding: 10px 15px;
  background-color: white;
  border-top: 1px solid #eee;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.input-textarea {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 15px;
  margin-right: 10px;
}

.send-button {
  width: 60px;
  height: 40px;
  background-color: #ff6b6b;
  color: white;
  border-radius: 20px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button:disabled {
  background-color: #ccc;
}

.bottom-disclaimer {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  padding: 8px 15px;
  font-size: 12px;
  color: #666;
  text-align: center;
  background-color: rgba(245, 245, 245, 0.8);
}
</style>
