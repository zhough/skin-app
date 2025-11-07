<template>
  <div class="container">
    <!-- 历史消息展示区域 -->
    <div class="history-container" ref="historyRef">
      <div class="message assistant-message">
        <div class="message-content" v-html="markdownToHtml('您好！请输入您的ID、问题')"></div>
      </div>
      <!-- 循环展示消息历史 -->
      <div 
        v-for="(msg, index) in messageHistory" 
        :key="index" 
        :class="['message', msg.isUser ? 'user-message' : 'assistant-message']"
      >
        <div class="message-content" v-html="msg.content"></div>
        <img 
          v-if="msg.imageUrl" 
          class="message-image" 
          :src="msg.imageUrl" 
          alt="用户上传图片"
        >
        <div v-if="msg.isUser" class="message-meta">用户ID: {{ msg.userId }}</div>
      </div>
    </div>

    <!-- 输入交互区域 -->
    <div class="input-container">
      <h1>皮肤病诊断助手</h1>
      
      <!-- 用户ID输入框 -->
      <!-- <div class="id-input">
        <label for="userId">用户ID（必填）</label>
        <input
          type="text"
          id="userId"
          v-model.trim="userId"
          placeholder="例如：00123"
          required
        >
      </div> -->
      
      <!-- 图片上传区域 -->
      <div 
        class="image-upload" 
        @click="triggerFileInput"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop.prevent="handleDrop"
        :style="{ borderColor: isDragging ? '#2563eb' : '#ddd' }"
      >
        <p>点击或拖拽图片到此处上传（支持JPG/PNG）</p>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          style="display: none;"
          @change="handleFileChange"
        >
        <img 
          v-if="imagePreview" 
          class="image-preview" 
          :src="imagePreview" 
          alt="预览图"
        >
      </div>

      <!-- 文本输入框 -->
      <textarea
        v-model.trim="query"
        placeholder="请描述您的症状或问题..."
        @keydown="handleKeyDown"
      ></textarea>
      
      <!-- 发送按钮与状态提示 -->
      <button @click="sendRequest" :disabled="isLoading">
        {{ isLoading ? '处理中...' : '发送' }}
      </button>
      <div class="status">{{ statusText }}</div>
    </div>
  </div>
</template>

<script setup>
import { getCurrentUser } from '@/services/auth-service.js';
import { ref, nextTick, onMounted } from 'vue';
// 状态管理
const userId = ref(''); // 用户ID
const query = ref(''); // 用户输入的问题
const imageFile = ref(null); // 上传的图片文件
const imagePreview = ref(''); // 图片预览地址
const isLoading = ref(false); // 请求加载状态
const statusText = ref('就绪'); // 状态提示文本
const isDragging = ref(false); // 拖拽状态标识
const messageHistory = ref([]); // 消息历史记录
const historyRef = ref(null); // 历史消息区域DOM引用

onMounted(() => {
  const user = getCurrentUser();
  if (user && user.username) {
    userId.value = user.username; // 自动把username赋值给userId
    statusText.value = `已登录：${user.username}`;
  } else {
    statusText.value = '未检测到用户信息，请先登录';
    alert('请先完成注册/登录');
  }
});

// 触发文件选择对话框
const triggerFileInput = () => {
  document.getElementById('imageUpload').click();
};

// 处理文件选择
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    imageFile.value = file;
    // 读取文件并生成预览地址
    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview.value = event.target.result;
    };
    reader.readAsDataURL(file);
  }
};

// 处理拖拽悬停
const handleDragOver = () => {
  isDragging.value = true;
};

// 处理拖拽离开
const handleDragLeave = () => {
  isDragging.value = false;
};

// 处理文件拖放
const handleDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    imageFile.value = file;
    // 读取文件并生成预览地址
    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview.value = event.target.result;
    };
    reader.readAsDataURL(file);
  }
};

// 处理键盘事件：Enter发送，Shift+Enter换行
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendRequest();
  }
};

// Markdown格式转换为HTML
const markdownToHtml = (markdown) => {
  // 压缩多余换行
  markdown = markdown.replace(/\n{2,}/g, '\n');
  
  // 处理无序列表
  markdown = markdown.replace(/^- (.*?)$/gm, '<li>$1</li>');
  markdown = markdown.replace(/(<li>.*?<\/li>)+/gs, '<ul>$1</ul>');
  markdown = markdown.replace(/<li>(.*?)<br><\/li>/gs, '<li>$1</li>');
  
  // 处理表格
  markdown = markdown.replace(/^\|(.*?)\|$/gm, (match) => {
    const cells = match.replace(/^\||\|$/g, '').split('|').map(cell => `<td>${cell.trim()}</td>`);
    return `<tr>${cells.join('')}</tr>`;
  });
  markdown = markdown.replace(/^\|[\s-]+\|$/gm, '');
  markdown = markdown.replace(/(<tr>.*?<\/tr>)+/gs, '<table border="1" style="border-collapse:collapse;margin:8px 0;"><tbody>$1</tbody></table>');
  
  // 处理标题
  markdown = markdown.replace(/^### (.*?)$/gm, '<br><h3>$1</h3>');
  markdown = markdown.replace(/^## (.*?)$/gm, '<br><h2>$1</h2>');
  
  // 处理换行
  markdown = markdown.replace(/\n/g, '<br>');
  
  // 处理分隔线和加粗
  markdown = markdown.replace(/^---$/gm, '<hr>');
  markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 清理首尾多余标签
  return markdown.trim().replace(/^<br>+|<br>+$/g, '');
};

// 滚动到消息底部
const scrollToBottom = async () => {
  await nextTick();
  if (historyRef.value) {
    historyRef.value.scrollTop = historyRef.value.scrollHeight;
  }
};

// 发送请求到后端服务
const sendRequest = async () => {
  // 1. 参数验证
  if (!userId.value) {
    alert('请输入用户ID');
    return;
  }
  if (!query.value && !imageFile.value) {
    alert('请输入问题或上传图片');
    return;
  }

  // 2. 更新状态
  isLoading.value = true;
  statusText.value = '处理中...';

  try {
    // 3. 构建请求参数（关键：先处理参数，再清空输入）
    // 3.1 处理图片：转换为base64字符串（去除前缀）
    let imageBase64 = null;
    if (imageFile.value) {
      imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Str = e.target.result.split(',')[1];
          resolve(base64Str);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile.value);
      });
    }

    // 3.2 生成最终查询文本（确保有<image>前缀）
    const userQuery = query.value.trim();
    let finalQuery = userQuery;
    if (imageFile.value) {
      // 有图片时强制添加<image>前缀
      finalQuery = userQuery ? `<image>${userQuery}` : '<image>请分析上传的图片';
    }

    // 3.3 构造payload（严格匹配后端QueryRequest模型）
    const payload = {
      user_query: finalQuery, // 必传参数，确保不为空
      ID: userId.value,       // 用户ID
      image_base64: imageBase64 // 可选：图片base64
    };

    // 4. 添加用户消息到历史记录（使用finalQuery确保显示正确）
    const userMsg = {
      isUser: true,
      userId: userId.value,
      content: markdownToHtml(finalQuery),
      imageUrl: imagePreview.value || ''
    };
    messageHistory.value.push(userMsg);
    await scrollToBottom();

    // 5. 清空输入（关键：参数构建完成后再清空）
    query.value = '';
    imageFile.value = null;
    imagePreview.value = '';

    // 6. 添加助手消息占位
    const assistantMsgIndex = messageHistory.value.length;
    messageHistory.value.push({
      isUser: false,
      content: '',
      imageUrl: ''
    });
    await scrollToBottom();

    // 7. 发送请求到后端
    const response = await fetch('http://172.30.154.81:8000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // 8. 处理响应状态
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `请求失败（${response.status}）`);
    }

    // 9. 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      result += decoder.decode(value, { stream: true });
      // 更新助手消息内容
      messageHistory.value[assistantMsgIndex].content = markdownToHtml(result);
      await scrollToBottom();
    }

    statusText.value = '就绪';
  } catch (error) {
    // 错误处理：添加错误消息到历史
    const errorMsgIndex = messageHistory.value.length;
    messageHistory.value.push({
      isUser: false,
      content: `错误：${error.message}`,
      imageUrl: ''
    });
    await scrollToBottom();
    statusText.value = '出错了';
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};
</script>

<style scoped>
/* 基础样式设置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
body {
  background-color: #f8f9fa;
  color: #2d3436;
  line-height: 1.5;
  font-size: 16px;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  height: 100vh;
}

/* 历史消息区域样式 */
.history-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  overflow-y: auto;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
.history-container::-webkit-scrollbar {
  width: 6px;
}
.history-container::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}
.message {
  margin-bottom: 20px;
  max-width: 85%;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.user-message {
  margin-left: auto;
}
.user-message .message-content {
  background: #2563eb;
  color: white;
}
.assistant-message .message-content {
  background: #f1f5f9;
  color: #2d3436;
}
.message-content {
  padding: 10px 18px;
  border-radius: 18px;
  word-wrap: break-word;
  font-size: 15px;
  white-space: pre-wrap;
  line-height: 1.4;
}

/* Markdown内容样式 */
.message-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 4px 0 2px 0;
  color: inherit;
}
.message-content ul {
  margin: 3px 0 3px 22px;
  padding-left: 6px;
}
.message-content li {
  margin: 2px 0;
  line-height: 1.4;
}
.message-content hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 5px 0;
}
.message-content strong {
  font-weight: 600;
}
.message-content table {
  width: 100%;
}
.message-content td {
  padding: 4px 8px;
  border: 1px solid #eee;
}

/* 消息附加元素样式 */
.message-image {
  margin-top: 10px;
  max-width: 160px;
  border-radius: 8px;
  border: 1px solid #eee;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.message-meta {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  margin-left: 18px;
}

/* 输入区域样式 */
.input-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
h1 {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1e293b;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

/* 用户ID输入框样式 */
.id-input {
  margin-bottom: 18px;
}
.id-input label {
  display: block;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 6px;
  font-weight: 500;
}
.id-input input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
}
.id-input input:focus {
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

/* 图片上传区域样式 */
.image-upload {
  margin-bottom: 18px;
  padding: 18px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.image-upload:hover {
  border-color: #2563eb;
  background-color: rgba(37, 99, 235, 0.02);
}
.image-upload p {
  color: #64748b;
  font-size: 14px;
}
.image-preview {
  max-width: 100%;
  margin-top: 10px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* 文本输入框样式 */
textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
  min-height: 100px;
  margin-bottom: 14px;
  font-size: 15px;
  line-height: 1.5;
  transition: border-color 0.2s;
}
textarea:focus {
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
textarea::placeholder {
  color: #94a3b8;
}

/* 按钮样式 */
button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: background 0.2s;
}
button:hover {
  background: #1d4ed8;
}
button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

/* 状态提示样式 */
.status {
  margin-top: 10px;
  color: #64748b;
  font-size: 14px;
  text-align: center;
  min-height: 20px;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    height: auto;
    gap: 16px;
  }
  .history-container {
    height: 400px;
    padding: 16px;
  }
  .input-container {
    padding: 16px;
  }
  .message {
    max-width: 90%;
  }
}
</style>