<template>
  <view class="diagnose-page">
    <!-- 顶部标题栏 -->
    <view class="page-header">
      <text class="header-title">图片皮肤诊断</text>
    </view>

    <!-- 图片上传区域（卡片式） -->
    <view class="card upload-card">
      <view class="upload-btns">
        <button class="upload-btn" @click="handleChooseImage">
          <text class="btn-icon">📁</text> 选择图片
        </button>
        <button class="upload-btn" @click="handleTakePhoto">
          <text class="btn-icon">📷</text> 拍摄图片
        </button>
      </view>
      <!-- 图片预览（上传后显示） -->
      <view class="image-preview" v-if="imageUrl">
        <image :src="imageUrl" mode="widthFix" class="preview-img" />
        <text class="tips-text">图片已准备好，点击诊断按钮进行分析</text>
      </view>
    </view>

    <!-- 诊断按钮（悬浮强调，仅图片上传后显示） -->
    <button class="diagnose-btn" @click="diagnoseImage" v-if="imageUrl">
      开始AI诊断
    </button>

    <!-- 诊断结果区域（卡片式，带阴影） -->
    <view class="card result-card" v-if="diagnoseResult">
      <view class="result-title">
        <text class="title-text">诊断结果</text>
      </view>
      <view class="indicators">
        <!-- 6个核心指标（0-10分制） -->
        <view class="indicator-item">
          <text class="indicator-label">黑头：</text>
          <text class="indicator-value">{{ diagnoseResult.黑头 }} 分</text>
        </view>
        <view class="indicator-item">
          <text class="indicator-label">光滑度：</text>
          <text class="indicator-value">{{ diagnoseResult.光滑度 }} 分</text>
        </view>
        <view class="indicator-item">
          <text class="indicator-label">黑眼圈：</text>
          <text class="indicator-value">{{ diagnoseResult.黑眼圈 }} 分</text>
        </view>
        <view class="indicator-item">
          <text class="indicator-label">出油：</text>
          <text class="indicator-value">{{ diagnoseResult.出油 }} 分</text>
        </view>
        <view class="indicator-item">
          <text class="indicator-label">毛孔：</text>
          <text class="indicator-value">{{ diagnoseResult.毛孔 }} 分</text>
        </view>
        <view class="indicator-item">
          <text class="indicator-label">痘痘：</text>
          <text class="indicator-value">{{ diagnoseResult.痘痘 }} 分</text>
        </view>
      </view>
      <button class="save-btn" @click="saveToArchive">
        保存到个人档案
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'; 

const imageUrl = ref(''); 
const diagnoseResult = ref(null); 

// 选择相册图片的处理函数
const handleChooseImage = async () => {
  try {
    // 使用HTML5 FileReader API实现图片选择
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imageUrl.value = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    };
    input.click();
  } catch (error) {
    alert('选择图片失败');
    console.error(error);
  }
};

// 拍摄图片的处理函数
const handleTakePhoto = async () => {
  try {
    // 使用HTML5 getUserMedia API实现摄像头拍照
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const video = document.createElement('video');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      
      // 创建一个拍照按钮
      const takePhotoBtn = document.createElement('button');
      takePhotoBtn.textContent = '拍照';
      takePhotoBtn.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // 停止视频流
        stream.getTracks().forEach(track => track.stop());
        
        // 转换为base64
        imageUrl.value = canvas.toDataURL('image/jpeg');
      };
      
      // 在实际项目中，你可能需要创建一个模态框来显示视频和拍照按钮
      // 这里简化为alert提示
      alert('请使用设备摄像头权限进行拍照');
      // 实际实现时，需要创建UI来显示摄像头画面和拍照按钮
    } else {
      alert('您的浏览器不支持摄像头功能');
    }
  } catch (error) {
    alert('拍摄图片失败');
    console.error(error);
  }
};

// AI诊断（本地模拟，使用固定指标）
const diagnoseImage = async () => {
  try {
    // 创建一个简单的加载提示
    const loadingElement = document.createElement('div');
    loadingElement.style.position = 'fixed';
    loadingElement.style.top = '50%';
    loadingElement.style.left = '50%';
    loadingElement.style.transform = 'translate(-50%, -50%)';
    loadingElement.style.background = 'rgba(0, 0, 0, 0.7)';
    loadingElement.style.color = 'white';
    loadingElement.style.padding = '10px 20px';
    loadingElement.style.borderRadius = '5px';
    loadingElement.style.zIndex = '9999';
    loadingElement.textContent = '正在分析皮肤状况...';
    document.body.appendChild(loadingElement);
    
    const localDiagnoseResult = {
      黑头: 6,     
      光滑度: 7,   
      黑眼圈: 8,   
      出油: 5,     
      毛孔: 6,     
      痘痘: 9,     
      conclusion: '皮肤状况良好，建议注意控油和黑头护理'
    };

    setTimeout(() => {
      diagnoseResult.value = localDiagnoseResult;
      document.body.removeChild(loadingElement);
    }, 1500);

  } catch (error) {
    // 移除加载提示
    const loadingElements = document.querySelectorAll('div[style*="z-index: 9999"]');
    loadingElements.forEach(el => el.remove());
    
    alert('诊断失败，请重试');
    console.error('诊断错误：', error);
  }
};

// 保存到个人档案并跳转
const saveToArchive = async () => {
  if (diagnoseResult.value) {
    try {
      // 准备要传递的六个指标数据
      const indicatorsData = {
        黑头: diagnoseResult.value.黑头,
        光滑度: diagnoseResult.value.光滑度,
        黑眼圈: diagnoseResult.value.黑眼圈,
        出油: diagnoseResult.value.出油,
        毛孔: diagnoseResult.value.毛孔,
        痘痘: diagnoseResult.value.痘痘
      };
      
      // 跳转到myself页面并传递指标数据
      window.location.href = `/myself?indicators=${encodeURIComponent(JSON.stringify(indicatorsData))}`;
      
    } catch (error) {
      alert('保存失败');
      console.error(error);
    }
  }
};
</script>

<style scoped>
/* 页面整体渐变背景 */
.diagnose-page {
  background: linear-gradient(to bottom, #f0f9ff, #e6f7ff);
  min-height: 100vh;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 顶部标题栏 */
.page-header {
  width: 100%;
  text-align: center;
  margin-bottom: 30rpx;
}
.header-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff6b6b;
}

/* 卡片通用样式（带阴影、圆角） */
.card {
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  padding: 30rpx;
  margin-bottom: 30rpx;
  width: 100%;
  max-width: 600rpx;
}

/* 上传区域卡片 */
.upload-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.upload-btns {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}
.upload-btn {
  background-color: #ff6b6b;
  color: #fff;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 28rpx;
}
.btn-icon {
  margin-right: 8rpx;
}
.image-preview {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.preview-img {
  width: 100%;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}
/* 图片上传提示文本 */
.tips-text {
  font-size: 22rpx;
  color: #606266;
  text-align: center;
  line-height: 32rpx;
}

/* 诊断按钮（悬浮放大） */
.diagnose-btn {
  background-color: #ff6b6b;
  color: #fff;
  border-radius: 8rpx;
  padding: 16rpx 40rpx;
  font-size: 30rpx;
  margin-bottom: 30rpx;
  transition: transform 0.2s;
}
.diagnose-btn:hover {
  transform: scale(1.05);
}

/* 结果卡片 */
.result-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.result-title {
  width: 100%;
  border-bottom: 2rpx solid #e6f7ff;
  padding-bottom: 10rpx;
  margin-bottom: 20rpx;
}
.title-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #ff6b6b;
  line-height: 40rpx;
}
.indicators {
  width: 100%;
}
.indicator-item,
.disease-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
  font-size: 28rpx;
}
.indicator-label {
  color: #606266;
}
.indicator-value,
.disease-value {
  color: #ff6b6b;
  font-weight: 500;
}
.save-btn {
  background-color: #ff6b6b;
  color: #fff;
  border-radius: 8rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  margin-top: 20rpx;
  align-self: center;
}
</style>