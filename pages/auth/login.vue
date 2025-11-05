<template>
  <div class="login-container">
    <div class="logo-container">
      <img src="/static/logo.png" class="logo" alt="logo"/>
      <h2 class="app-name">欢迎使用</h2>
    </div>
    
    <!-- 登录/注册切换标签 -->
    <div class="auth-tabs">
      <div class="tab" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">登录</div>
      <div class="tab" :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">注册</div>
    </div>
    
    <div class="form-container">
      <!-- 用户名输入 (注册和用户名登录模式下显示) -->
      <div class="input-group" v-if="activeTab === 'register'">
        <label class="input-label">用户名</label>
        <input type="text" v-model="username" placeholder="请输入用户名" class="input"/>
      </div>
      
      <!-- 手机号输入 -->
      <div class="input-group">
        <label class="input-label">手机号</label>
        <input type="tel" v-model="phone" placeholder="请输入手机号" class="input" maxlength="11"/>
      </div>
      
      <!-- 验证码输入 (手机号登录模式下显示) -->
      <div class="input-group" v-if="loginMethod === 'phone'">
        <label class="input-label">验证码</label>
        <div class="code-input-container">
          <input type="number" v-model="code" placeholder="请输入验证码" class="input code-input" maxlength="6"/>
          <button class="send-code-btn" :disabled="countdown > 0" @click="sendCode">{{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}</button>
        </div>
      </div>
      
      <!-- 密码输入 (注册和密码登录模式下显示) -->
      <div class="input-group" v-if="activeTab === 'register' || loginMethod === 'password'">
        <label class="input-label">{{ activeTab === 'register' ? '设置密码' : '密码' }}</label>
        <input :type="showPassword ? 'text' : 'password'" v-model="password" 
               :placeholder="activeTab === 'register' ? '请设置6-20位密码' : '请输入密码'" 
               class="input password-input"/>
        <span class="password-toggle" @click="togglePasswordVisibility">
          {{ showPassword ? '隐藏' : '显示' }}
        </span>
        <!-- 密码强度提示 (仅在注册模式显示) -->
        <div v-if="activeTab === 'register'" class="password-strength" :class="passwordStrengthClass">
          {{ passwordStrengthText }}
        </div>
      </div>
      
      <!-- 登录方式切换 (仅在登录模式下显示) -->
      <div class="login-method-switch" v-if="activeTab === 'login'">
        <span class="method-label">登录方式:</span>
        <button class="method-btn" :class="{ active: loginMethod === 'phone' }" @click="loginMethod = 'phone'">
          验证码登录
        </button>
        <button class="method-btn" :class="{ active: loginMethod === 'password' }" @click="loginMethod = 'password'">
          密码登录
        </button>
      </div>
      
      <!-- 主操作按钮 -->
      <button class="auth-btn" :disabled="!canProceed" @click="submitAuth">
        {{ activeTab === 'login' ? '登录' : '注册' }}
      </button>
      
      <!-- 找回密码链接 (仅在登录模式下显示) -->
      <div class="forgot-password" v-if="activeTab === 'login' && loginMethod === 'password'">
        <a href="#" @click.prevent="forgotPassword" class="link">忘记密码?</a>
      </div>
      
      <div class="agreement">
        <div class="checkbox-container">
          <div class="checkbox" :class="{ checked: agreed }" @click="toggleAgree">
            <span v-if="agreed">✓</span>
          </div>
          <p class="agreement-text">
            我已阅读并同意
            <span class="link" @click="viewAgreement">《用户协议》</span>
            和
            <span class="link" @click="viewPrivacy">《隐私政策》</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loginByPhone, loginByPassword, registerByUsernamePassword } from '../../services/auth-service.js'

export default {
  name: 'LoginPage',
  data() {
    return {
      // 激活的标签页 (login/register)
      activeTab: 'login',
      // 登录方式 (phone/password)
      loginMethod: 'phone',
      // 表单数据
      username: '',
      phone: '',
      code: '',
      password: '',
      // 其他状态
      countdown: 0,
      agreed: true,
      showPassword: false,
      // 密码强度相关
      passwordStrength: 0 // 0-无密码, 1-弱, 2-中, 3-强
    }
  },
  computed: {
    canProceed() {
      if (!this.agreed) return false
      
      if (this.activeTab === 'register') {
        // 注册需要的验证
        return this.username.trim().length > 0 && 
               this.phone.length === 11 && 
               this.validatePassword() && 
               this.passwordStrength >= 1 // 至少需要弱密码
      } else {
        // 登录需要的验证
        if (this.loginMethod === 'phone') {
          return this.phone.length === 11 && this.code.length === 6
        } else {
          return this.phone.length === 11 && this.password.length >= 6
        }
      }
    },
    // 密码强度文本
    passwordStrengthText() {
      if (!this.password) return ''
      if (this.passwordStrength === 1) return '弱密码'
      if (this.passwordStrength === 2) return '中等强度密码'
      if (this.passwordStrength === 3) return '强密码'
      return ''
    },
    // 密码强度样式类
    passwordStrengthClass() {
      if (!this.password) return ''
      if (this.passwordStrength === 1) return 'weak'
      if (this.passwordStrength === 2) return 'medium'
      if (this.passwordStrength === 3) return 'strong'
      return ''
    }
  },
  watch: {
    // 监听密码变化，更新密码强度
    password(newVal) {
      this.updatePasswordStrength(newVal)
    }
  },
  methods: {
    // 更新密码强度
    updatePasswordStrength(password) {
      if (!password) {
        this.passwordStrength = 0
        return
      }
      
      let strength = 0
      // 长度检查
      if (password.length >= 8) strength++
      // 包含数字
      if (/\d/.test(password)) strength++
      // 包含字母
      if (/[a-zA-Z]/.test(password)) strength++
      // 包含特殊字符
      if (/[^a-zA-Z0-9]/.test(password)) strength++
      
      this.passwordStrength = Math.min(3, strength) // 限制最大强度为3
    },
    
    async sendCode() {
      if (!this.validatePhone()) {
        this.showToast('请输入正确的手机号')
        return
      }
      
      try {
        // 开始倒计时
        this.startCountdown()
        
        // 显示发送成功提示
        this.showToast('验证码已发送', 'success')
        console.log('发送验证码到:', this.phone)
      } catch (error) {
        console.error('发送验证码失败:', error)
        this.showToast('发送失败，请重试')
      }
    },
    
    async submitAuth() {
      if (!this.canProceed) return
      
      try {
        let result
        
        if (this.activeTab === 'register') {
          // 注册
          result = await this.register()
        } else {
          // 登录
          result = await this.login()
        }
        
        if (result && result.success) {
          // 成功提示
          this.showToast(this.activeTab === 'login' ? '登录成功' : '注册成功', 'success')
          
          // 延迟跳转回登录前的页面或首页
          setTimeout(() => {
            try {
              // 获取登录前的路径，如果不存在则跳转到/index
              // 确保跳转路径符合路由配置
              let redirectPath = this.$route.query.redirect || '/index' 
              // 简单验证路径格式，确保以/开头
              if (!redirectPath.startsWith('/')) {
                redirectPath = '/' + redirectPath
              }
              this.$router.push(redirectPath)
            } catch (e) {
              console.error('路由跳转失败:', e)
              // 如果router失败，使用浏览器跳转
              let redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/index' 
              if (!redirectPath.startsWith('/')) {
                redirectPath = '/' + redirectPath
              }
              window.location.href = redirectPath
            }
          }, 1500)
        } else {
          throw new Error(result?.message || (this.activeTab === 'login' ? '登录失败' : '注册失败'))
        }
      } catch (error) {
        console.error(`${this.activeTab === 'login' ? '登录' : '注册'}失败:`, error)
        this.showToast(error.message || `${this.activeTab === 'login' ? '登录' : '注册'}失败，请重试`)
      }
    },
    
    async login() {
      if (this.loginMethod === 'phone') {
        return await loginByPhone(this.phone, this.code)
      } else {
        return await loginByPassword(this.phone, this.password)
      }
    },
    
    async register() {
      // 注册逻辑 - 调用注册服务
      return await registerByUsernamePassword(this.username, this.phone, this.password)
    },
    
    validatePhone() {
      const phoneRegex = /^1[3-9]\d{9}$/
      return phoneRegex.test(this.phone)
    },
    
    validatePassword() {
      // 密码规则：6-20位
      return this.password.length >= 6 && this.password.length <= 20
    },
    
    startCountdown() {
      this.countdown = 60
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    
    toggleAgree() {
      this.agreed = !this.agreed
    },
    
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    
    forgotPassword() {
      // 这里可以实现找回密码逻辑
      console.log('忘记密码')
      this.showToast('找回密码功能即将上线')
    },
    
    // 初始化页面时执行
    created() {
      // 初始化密码强度检查
      this.updatePasswordStrength(this.password)
    },
    
    // 通用提示方法
    showToast(title, icon = 'none') {
      // 优先使用uni的toast，如果不存在则使用简单的console提示
      if (typeof uni !== 'undefined') {
        uni.showToast({ title, icon })
      } else {
        console.log(title)
        // 可以添加一个简单的网页toast实现
        const toast = document.createElement('div')
        toast.textContent = title
        toast.style.position = 'fixed'
        toast.style.top = '50%'
        toast.style.left = '50%'
        toast.style.transform = 'translate(-50%, -50%)'
        toast.style.padding = '10px 20px'
        toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
        toast.style.color = 'white'
        toast.style.borderRadius = '4px'
        toast.style.zIndex = '9999'
        document.body.appendChild(toast)
        setTimeout(() => {
          document.body.removeChild(toast)
        }, 2000)
      }
    },
    
    // 查看协议
    viewAgreement() {
      try {
        this.$router.push('/auth/user-agreement')
      } catch (error) {
        console.error('查看协议失败:', error)
      }
    },
    
    // 查看隐私政策
    viewPrivacy() {
      try {
        this.$router.push('/auth/privacy-policy')
      } catch (error) {
        console.error('查看隐私政策失败:', error)
      }
    }
  }
}
</script>

<style scoped>
/* 基础样式设置 */
* {
  box-sizing: border-box;
}

.login-container {
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Logo区域 */
.logo-container {
  margin: 40px 0 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.app-name {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 登录/注册切换标签 */
.auth-tabs {
  display: flex;
  width: 100%;
  max-width: 400px;
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.tab {
  flex: 1;
  padding: 15px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  background-color: #f8f9fa;
}

.tab.active {
  color: #007aff;
  border-bottom-color: #007aff;
  background-color: #f0f8ff;
}

/* 表单容器 */
.form-container {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* 输入组 */
.input-group {
  margin-bottom: 20px;
  position: relative;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.input {
  width: 100%;
  height: 50px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 15px;
  font-size: 16px;
  color: #333;
  transition: all 0.3s ease;
  background-color: #fff;
}

.input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.input::placeholder {
  color: #999;
}

/* 验证码输入容器 */
.code-input-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  min-width: 120px;
  height: 50px;
  line-height: 50px;
  padding: 0 15px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-code-btn:hover:not([disabled]) {
  background-color: #0051d5;
  transform: translateY(-1px);
}

.send-code-btn[disabled] {
  background-color: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  transform: none;
}

/* 密码输入 */
.password-input {
  padding-right: 50px;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;
}

/* 密码强度提示 */
.password-strength {
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  opacity: 0.8;
}

.password-strength.weak {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.password-strength.medium {
  background-color: #fff3e0;
  color: #e65100;
  border: 1px solid #ffcc80;
}

.password-strength.strong {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.password-toggle:hover {
  color: #007aff;
}

/* 登录方式切换 */
.login-method-switch {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  gap: 10px;
}

.method-label {
  font-size: 14px;
  color: #666;
}

.method-btn {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  background-color: #fff;
  color: #666;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.method-btn:hover {
  border-color: #007aff;
  color: #007aff;
}

.method-btn.active {
  background-color: #007aff;
  border-color: #007aff;
  color: #fff;
}

/* 操作按钮 */
.auth-btn {
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: linear-gradient(135deg, #007aff, #0051d5);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.auth-btn:hover:not([disabled]) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.auth-btn[disabled] {
  background: #e0e0e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 忘记密码链接 */
.forgot-password {
  text-align: center;
  margin-bottom: 20px;
}

/* 协议区域 */
.agreement {
  margin-top: 20px;
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: flex-start;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 1px solid #007aff;
  border-radius: 4px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: transparent;
  margin-top: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkbox.checked {
  background-color: #007aff;
  color: white;
}

.agreement-text {
  flex: 1;
  line-height: 1.5;
  margin: 0;
}

/* 链接样式 */
.link {
  color: #007aff;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.3s ease;
}

.link:hover {
  color: #0051d5;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 20px 20px;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .logo {
    width: 80px;
    height: 80px;
  }
  
  .app-name {
    font-size: 20px;
  }
}
</style>