<template>
  <view class="ai-chat-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">AI皮肤科医生助手</text>
      <text class="page-subtitle">支持文本+图片咨询 - 测试模式</text>
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
            <!-- 文本内容（格式化后） -->
            <view v-html="formatStreamText(message.content)" v-if="message.content"></view>
            <!-- 图片内容（仅用户消息有图片） -->
            <view class="message-image" v-if="message.imageUrl">
              <image :src="message.imageUrl" mode="widthFix" alt="用户上传的图片" @click="previewImage(message.imageUrl)"></image>
            </view>
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
    
    <!-- 输入区域（新增图片上传按钮） -->
    <view class="input-area">
      <textarea 
        v-model="userInput" 
        placeholder="请输入测试消息（可搭配图片上传）..." 
        class="input-textarea"
        @keypress.enter.prevent="sendMessage"
        rows="1"
        maxlength="500"
      ></textarea>
      <!-- 图片上传按钮（隐藏的文件选择器 + 可视化按钮） -->
      <input 
        type="file" 
        ref="fileInput" 
        accept="image/*" 
        class="file-input" 
        @change="handleFileSelect"
      >
      <view class="upload-btn" @click="triggerFileSelect">
        <image src="/static/upload-image.png" mode="widthFix" alt="上传图片"></image>
      </view>
      <button 
        class="send-button" 
        @click="sendMessage"
        :disabled="!userInput.trim() && !selectedImage.value || isLoading"
      >
        发送
      </button>
    </view>
    
    <!-- 已选图片预览（底部临时显示） -->
    <view class="image-preview" v-if="selectedImage.value">
      <image :src="selectedImage.value" mode="widthFix" alt="预览图片"></image>
      <view class="delete-btn" @click="clearImage">×</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { getAISkinConsultation } from '@/services/ai-api.js';

// 流式文本实时格式化函数
const formatStreamText = (text) => {
  if (!text) return '';
  text = text.replace(/(\d+)\.\s{1,2}\*\*/g, '\n  $1. **');
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/([。！？；])\s{2,}/g, '$1\n');
  text = text.replace(/欢迎回来。\s+/g, '欢迎回来。\n\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text;
};

// 聊天消息列表（初始消息）
const messages = ref([
  {
    role: 'assistant',
    content: '测试模式：我已准备好接收消息，请发送文本或上传图片咨询。',
    imageUrl: ''
  }
]);

// 用户输入内容
const userInput = ref('');
// 已选择的图片（本地临时路径）
const selectedImage = ref('');
// 图片文件（用于上传）
const imageFile = ref(null);
// 加载状态
const isLoading = ref(false);
// 聊天容器引用
const chatContainer = ref(null);
// 文件选择器DOM引用
const fileInput = ref(null);

// 页面加载时初始化
onMounted(() => {
  scrollToBottom();
});

// 触发文件选择（点击上传按钮时调用）
const triggerFileSelect = () => {
  if (fileInput.value) {
    fileInput.value.click(); // 触发隐藏的文件选择器
  }
};

// 处理文件选择结果（原生Web API）
const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 验证文件类型（仅允许图片）
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件');
    return;
  }

  // 读取图片并显示预览
  const reader = new FileReader();
  reader.onload = (event) => {
    selectedImage.value = event.target.result; // 本地预览路径（base64）
    imageFile.value = file; // 保存文件对象
  };
  reader.readAsDataURL(file);

  // 重置文件选择器（允许重复选择同一张图片）
  e.target.value = '';
};

// 清除已选图片
const clearImage = () => {
  selectedImage.value = '';
  imageFile.value = null;
};

// 预览图片（原生Web方法）
const previewImage = (url) => {
  // 创建新窗口预览图片
  const previewWindow = window.open('', '_blank');
  previewWindow.document.write(`
    <html>
      <body style="margin:0; padding:20px; background:#f0f0f0; text-align:center;">
        <img src="${url}" style="max-width:90%; max-height:90vh;" alt="图片预览">
      </body>
    </html>
  `);
  previewWindow.document.close();
};

// 图片转Base64（适配后端处理逻辑）
const imageToBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // 截取Base64前缀（仅保留编码部分）
      const base64Str = reader.result.split(',')[1];
      resolve(base64Str);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

// 发送消息（支持文本+图片）
const sendMessage = async () => {
  const input = userInput.value.trim();
  if ((!input && !imageFile.value) || isLoading.value) return;
  
  // 构建用户消息
  const userMessage = {
    role: 'user',
    content: input,
    imageUrl: selectedImage.value || ''
  };
  messages.value.push(userMessage);
  
  // 清空输入和图片选择
  userInput.value = '';
  clearImage();
  scrollToBottom();
  isLoading.value = true;
  
  try {
    // 添加AI回复占位符
    const aiMessageIndex = messages.value.length;
    messages.value.push({
      role: 'assistant',
      content: '',
      imageUrl: ''
    });

    // 处理图片：转为Base64
    let imageBase64 = null;
    if (imageFile.value) {
      imageBase64 = await imageToBase64(imageFile.value);
    }

    // 调用流式API
    const reader = await getAISkinConsultation({
      userId: 'test_user',
      userInfo: {
        age: 30,
        gender: '测试性别'
      },
      skinType: '测试皮肤类型',
      question: input,
      imageBase64: imageBase64
    });

    // 处理流式数据
    const processStream = async () => {
      const { done, value } = await reader.read();
      if (done) {
        isLoading.value = false;
        return;
      }

      const chunk = new TextDecoder().decode(value);
      const formattedChunk = formatStreamText(chunk);
      messages.value[aiMessageIndex].content += formattedChunk;
      scrollToBottom();

      await processStream();
    };

    await processStream();

  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: `请求失败: ${error.message || '未知错误'}`
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

// 页面卸载时清除图片选择
onUnmounted(() => {
  clearImage();
});
</script>

<style scoped>
/* 新增文件选择器样式（隐藏原生input，仅显示自定义按钮） */
.file-input {
  display: none; /* 隐藏原生文件选择器 */
}

/* 图片上传按钮 */
.upload-btn {
  width: 44px;
  height: 44px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.upload-btn image {
  width: 28px;
  height: 28px;
}

/* 消息中的图片样式 */
.message-image {
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  max-width: 200px;
}

.message-image image {
  width: 100%;
  height: auto;
  display: block;
  cursor: pointer;
}

/* 底部图片预览栏 */
.image-preview {
  position: fixed;
  bottom: 70px;
  left: 25px;
  right: 25px;
  z-index: 15;
  display: flex;
  align-items: center;
  background-color: white;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.image-preview image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

/* 图片删除按钮 */
.delete-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background-color: #ff4d4f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

/* 其余原有样式保持不变... */
.ai-chat-page {
  padding-bottom: 120px;
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
  line-height: 1.8;
  font-size: 15px;
  word-break: break-all;
  max-width: calc(100% - 50px);
  white-space: pre-line;
}

.message-content strong {
  font-weight: bold;
  color: #0051d5;
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
  align-items: flex-end;
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
  cursor: pointer;
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