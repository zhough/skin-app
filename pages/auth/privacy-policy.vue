<template>
  <div class="container">
    <div class="header">
      <div class="back-btn" @click="goBack">←</div>
      <div class="title">隐私政策</div>
      <div class="empty"></div>
    </div>
    <div class="content">
      <div class="policy-content">
        <h1 class="title-text">隐私政策</h1>
        <p class="subtitle-text">保护您的隐私是我们的责任</p>
        
        <div class="section">
          <h2 class="section-title">1. 引言</h2>
          <p class="section-content">
            本隐私政策旨在说明我们如何收集、使用、存储和分享您的个人信息，以及您享有的相关权利。
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">2. 我们收集的信息</h2>
          <p class="section-content">
            我们可能收集的个人信息包括但不限于：您的姓名、手机号、邮箱、设备信息、位置信息、使用记录等。
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">3. 信息的使用</h2>
          <p class="section-content">
            我们收集和使用您的个人信息主要用于：提供服务、改进服务、个性化体验、安全保障、遵守法律法规等。
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">4. 信息的存储</h2>
          <p class="section-content">
            我们将按照法律法规的规定，采取适当的安全措施保护您的个人信息，防止信息泄露、损坏或丢失。
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">5. 信息的分享</h2>
          <p class="section-content">
            未经您的明确同意，我们不会向第三方分享您的个人信息，但法律法规另有规定的除外。
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">6. 您的权利</h2>
          <p class="section-content">
            您有权访问、更正、删除您的个人信息，有权限制或拒绝我们对您个人信息的处理，有权撤回同意。
          </p>
        </div>
        
        <view class="section">
          <text class="section-title">7. Cookie的使用</text>
          <text class="section-content">
            我们可能使用Cookie等技术来改善您的使用体验，您可以设置浏览器拒绝Cookie，但可能影响部分功能。
          </text>
        </view>
        
        <view class="section">
          <text class="section-title">8. 未成年人保护</text>
          <text class="section-content">
            我们重视对未成年人个人信息的保护，如您是未满18周岁的未成年人，请在监护人的指导下使用我们的服务。
          </text>
        </view>
        
        <view class="section">
          <text class="section-title">9. 政策的更新</text>
          <text class="section-content">
            我们可能会不时更新本隐私政策，更新后的政策将在应用内公布。请您定期查阅本政策。
          </text>
        </view>
        
        <view class="section">
          <text class="section-title">10. 联系我们</text>
          <text class="section-content">
            如您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：privacy@example.com
          </text>
        </view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PrivacyPolicy',
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

.policy-content {
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