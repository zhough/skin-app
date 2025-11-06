<template>
  <view class="personal-info-container">
    <text class="title">个人信息设置</text>
    <text class="desc">请填写您的基本信息，帮助我们提供更精准的建议</text>

    <!-- 调试信息显示 -->
    <text v-if="isDebug" class="debug-info">{{ debugInfo }}</text>
    
    <form class="info-form">
      <!-- 年龄输入 -->
      <view class="form-item">
        <text class="item-label">年龄</text>
        <input
          type="number"
          v-model.number="age"
          placeholder="请输入您的年龄"
          class="item-input"
          @input="handleInput"
        />
      </view>

      <!-- 性别选择 -->
      <view class="form-item">
        <text class="item-label">性别</text>
        <div class="radio-group">
          <label class="radio-label" @click="gender = '男'">
            <input type="radio" :checked="gender === '男'" />
            <text>男</text>
          </label>
          <label class="radio-label" @click="gender = '女'">
            <input type="radio" :checked="gender === '女'" />
            <text>女</text>
          </label>
        </div>
      </view>

      <!-- 保存按钮 -->
      <button
        class="save-btn"
        :disabled="isButtonDisabled"
        @click="saveAndRedirect"
        hover-class="btn-hover"
      >
        保存信息
      </button>
    </form>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { getCurrentUser, setUserInfo } from '@/services/auth-service.js';

// 响应式数据
const age = ref(''); // 初始值为字符串，用户可以输入数字
const gender = ref('');
const isDebug = ref(true); // 调试模式，发布时改为false

// 调试信息
const debugInfo = computed(() => {
  return `年龄: ${age.value}, 类型: ${typeof age.value}, 性别: ${gender.value}, 按钮状态: ${isButtonDisabled.value}`;
});

// 页面加载时获取用户信息
const loadUserInfo = () => {
  try {
    // 获取当前用户信息
    const user = getCurrentUser();
    if (user) {
      // 填充表单数据
      if (user.age) age.value = user.age;
      if (user.gender) gender.value = user.gender;
    }
  } catch (error) {
    console.error('加载用户信息失败:', error);
  }
};

// 页面挂载时执行
loadUserInfo();

// 按钮状态计算属性
const isButtonDisabled = computed(() => {
  // 简化按钮禁用逻辑，让用户能更容易保存数据
  return !((age.value || age.value === 0) && gender.value);
});

// 输入事件处理
const handleInput = (e) => {
  // 保留字符串类型，因为input返回的是字符串
  age.value = e.detail.value;
};

// 保存并跳转
const saveAndRedirect = () => {
  // 简化校验，让用户能更容易保存数据
  if (!((age.value || age.value === 0) && gender.value)) {
    alert('请填写有效的年龄和性别');
    return;
  }

  try {
    // 创建用户信息对象，确保年龄转换为数字
    const userInfo = {
      age: age.value ? Number(age.value) : 0,
      gender: gender.value
    };

    console.log('保存用户信息:', userInfo);

    // 保存到本地存储
    setUserInfo(userInfo);

    // 提示并跳转
    alert('保存成功，即将返回首页');

    // 确保提示显示完成后跳转
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败，请重试');
  }
};

// 调试用：监听数据变化
watch([age, gender], () => {
  console.log('数据变化: 年龄=', age.value, '性别=', gender.value, '按钮状态=', isButtonDisabled.value);
});
</script>

<style scoped>
/* 页面背景 */
page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 容器样式 */
.personal-info-container {
  width: 90%;
  max-width: 500px;
  margin: 40px auto;
  padding: 30px 25px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 标题样式 */
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
  display: block;
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

/* 描述样式 */
.desc {
  color: #999;
  margin-bottom: 30px;
  font-size: 16px;
  display: block;
  text-align: center;
  line-height: 1.6;
}

/* 调试信息样式 */
.debug-info {
  color: #f00;
  font-size: 12px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 6px;
  word-break: break-all;
}

/* 表单项样式 */
.form-item {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

/* 表单项标签样式 */
.item-label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #555;
  font-size: 16px;
}

/* 输入框样式 */
.item-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  background-color: #fff;
  transition: border-color 0.3s;
}

.item-input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

/* 单选框容器样式 */
.radio-group {
  display: flex;
  gap: 40px;
  padding: 5px 0;
}

/* 单选框标签样式 */
.radio-label {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #555;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
}

.radio-label:hover {
  background-color: #f0f7ff;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.radio-label input[type="radio"]:checked {
  accent-color: #007bff;
}

.radio-label text {
  font-size: 16px;
}

/* 保存按钮样式 */
.save-btn {
  width: 100%;
  padding: 15px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
  margin-top: 40px;
  transition: all 0.3s;
  letter-spacing: 1px;
}

/* 按钮禁用样式 */
.save-btn:disabled {
  background-color: #ccc !important;
  color: #999 !important;
  cursor: not-allowed;
  transform: none;
}

/* 按钮点击反馈 */
.btn-hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .personal-info-container {
    width: 95%;
    margin: 20px auto;
    padding: 20px 15px;
  }
  
  .title {
    font-size: 22px;
  }
  
  .radio-group {
    gap: 30px;
  }
}
</style>