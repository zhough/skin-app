<template>
  <div class="container">
    <div class="header">
      <div class="back-btn" @click="goBack">←</div>
      <div class="title">用户协议</div>
      <div class="empty"></div>
    </div>
    <div class="content">
      <div class="agreement-content">
        <h1 class="title-text">用户协议</h1>
        <p class="subtitle-text">欢迎使用本应用，请您仔细阅读以下协议内容</p>
        
        <div class="section">
          <h2 class="section-title">1. 协议的接受</h2>
          <p class="section-content">
            本协议是您与我们之间关于您使用本应用的法律协议。一旦您注册或使用本应用，即表示您已同意接受本协议的全部条款。
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">2. 用户注册</h2>
          <p class="section-content">
            您在使用本应用前需要注册账号。您应当提供真实、准确、完整的个人资料，并保持资料的及时更新。
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">3. 用户行为规范</h2>
          <p class="section-content">
            您在使用本应用时，应当遵守中华人民共和国相关法律法规，不得利用本应用进行任何违法或不当的活动。
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">4. 知识产权</h2>
          <p class="section-content">
            本应用的所有内容，包括但不限于文字、图片、音频、视频、软件、程序等，均受著作权法等相关法律的保护。
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">5. 隐私保护</h2>
          <p class="section-content">
            我们重视您的隐私保护，将按照本协议及《隐私政策》的规定收集、使用、存储和分享您的个人信息。
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">6. 免责声明</h2>
          <p class="section-content">
            本应用提供的信息仅供参考，不构成任何建议。我们不对信息的准确性、完整性、适用性等作任何保证。
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">7. 协议的修改</h2>
          <p class="section-content">
            我们有权随时修改本协议，修改后的协议将在应用内公布。您继续使用本应用即表示您接受修改后的协议。
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">8. 法律适用</h2>
          <p class="section-content">
            本协议的订立、执行、解释及争议的解决均适用中华人民共和国法律。
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">9. 联系方式</h2>
          <p class="section-content">
            如您对本协议有任何疑问，请通过以下方式联系我们：support@example.com
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserAgreement',
  methods: {
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  background-color: #ffffff;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #e0e0e0;
}

.back-btn {
  font-size: 48rpx;
  color: #333333;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.empty {
  width: 48rpx;
}

.content {
  height: calc(100vh - 100rpx);
}

.agreement-content {
  padding: 30rpx;
  background-color: #ffffff;
}

.title-text {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 20rpx;
}

.subtitle-text {
  display: block;
  font-size: 28rpx;
  color: #666666;
  text-align: center;
  margin-bottom: 40rpx;
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.section-content {
  display: block;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
}
</style>