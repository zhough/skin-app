<template>
  <view class="ai-chat-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">AI皮肤科医生助手</text>
      <text class="page-subtitle">测试模式 - 仅用于对话功能测试</text>
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
            <!-- 用v-html渲染格式化后的内容 -->
            <view v-html="formatStreamText(message.content)"></view>
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
        placeholder="请输入测试消息..." 
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
  </view>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { getAISkinConsultation } from '@/services/ai-api.js';

// 流式文本实时格式化函数
const formatStreamText = (text) => {
  if (!text) return '';
  // 1. 处理列表编号（1. 2. 3. → 换行+缩进+编号）
  text = text.replace(/(\d+)\.\s{1,2}\*\*/g, '\n  $1. **');
  // 2. 处理加粗标记（**内容** → HTML加粗标签）
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // 3. 中文标点后连续空格转为换行（优化段落分隔）
  text = text.replace(/([。！？；])\s{2,}/g, '$1\n');
  // 4. 欢迎语后自动换行分段
  text = text.replace(/欢迎回来。\s+/g, '欢迎回来。\n\n');
  // 5. 移除多余空行（避免排版混乱）
  text = text.replace(/\n{3,}/g, '\n\n');
  return text;
};

// 聊天消息列表（初始消息）
const messages = ref([
  {
    role: 'assistant',
    content: '测试模式：我已准备好接收消息，请发送测试内容。'
  }
]);

// 用户输入内容
const userInput = ref('');

// 加载状态
const isLoading = ref(false);

// 聊天容器引用
const chatContainer = ref(null);

// 页面加载时初始化
onMounted(() => {
  scrollToBottom();
});

// 发送消息（支持流式响应+实时格式化）
const sendMessage = async () => {
  const input = userInput.value.trim();
  if (!input || isLoading.value) return;
  
  // 添加用户消息
  const userMessage = {
    role: 'user',
    content: input
  };
  messages.value.push(userMessage);
  
  // 清空输入框
  userInput.value = '';
  scrollToBottom();
  isLoading.value = true;
  
  try {
    // 添加AI回复占位符
    const aiMessageIndex = messages.value.length;
    messages.value.push({
      role: 'assistant',
      content: '' // 初始为空，后续逐步填充
    });

    // 获取流式响应阅读器
    const reader = await getAISkinConsultation({
      userId: 'test_user', // 固定测试用户ID
      userInfo: {
        age: 30, // 固定测试年龄
        gender: '测试性别' // 固定测试性别
      },
      skinType: '测试皮肤类型',
      question: input
    });

    // 处理流式数据（实时格式化+更新UI）
    const processStream = async () => {
      const { done, value } = await reader.read();
      if (done) {
        isLoading.value = false;
        return;
      }

      // 解码并格式化当前数据块
      const chunk = new TextDecoder().decode(value);
      const formattedChunk = formatStreamText(chunk);
      
      // 累加格式化后的内容
      messages.value[aiMessageIndex].content += formattedChunk;
      scrollToBottom();

      // 继续处理下一个数据块
      await processStream();
    };

    // 开始处理流
    await processStream();

  } catch (error) {
    // 错误处理（替换占位符为错误信息）
    messages.value.push({
      role: 'assistant',
      content: `测试请求失败: ${error.message || '未知错误'}`
    });
    console.error('测试模式错误:', error);
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

// 监听消息变化，自动滚动
watch(messages, () => {
  scrollToBottom();
});
</script>

<style scoped>
/* 基础样式保持不变，新增格式化相关样式 */
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
  line-height: 1.8; /* 优化行高，提升可读性 */
  font-size: 15px;
  word-break: break-all;
  max-width: calc(100% - 50px);
  white-space: pre-line; /* 识别换行符 */
}

/* 格式化相关样式 */
.message-content strong {
  font-weight: bold;
  color: #0051d5; /* 加粗文字颜色加深 */
}

.message-content ul,
.message-content ol {
  margin: 8px 0;
  padding-left: 20px;
}

.message-content li {
  margin: 4px 0;
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
</style>