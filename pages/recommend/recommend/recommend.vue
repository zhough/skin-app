<template>
  <view class="recommend-page">
    <!-- 顶部标题栏 -->
    <view class="page-header">
      <text class="header-title">专属护肤品推荐</text>
      <text class="sub-title">根据您的皮肤状态智能匹配</text>
    </view>

    <!-- 皮肤状态摘要（展示关键信息） -->
    <view class="skin-summary card">
      <view class="summary-item">
        <text class="label">性别：</text>
        <text class="value">{{ userInfo.gender || "未知" }}</text>
      </view>
      <view class="summary-item">
        <text class="label">皮肤类型：</text>
        <text class="value">{{ skinType || "待分析" }}</text>
      </view>
      <view class="summary-item">
        <text class="label">核心问题：</text>
        <text class="value">{{ coreProblems.join("、") || "无" }}</text>
      </view>
      <view class="summary-item">
        <text class="label">推荐方向：</text>
        <text class="value">{{ recommendDirection }}</text>
      </view>
    </view>

    <!-- 加载/空状态 -->
    <view class="empty-state" v-if="isLoading || recommendList.length === 0">
      <text class="empty-text" v-if="isLoading">正在匹配最优护肤品...</text>
      <text class="empty-text" v-else>暂无匹配的护肤品数据</text>
    </view>

    <!-- 推荐列表（前10条） -->
    <view class="recommend-list" v-else>
      <view class="recommend-item card" v-for="(item, index) in recommendList" :key="index">
        <!-- 产品图片 -->
        <image :src="item.imgUrl" class="product-img" mode="widthFix" />
        <!-- 产品信息 -->
        <view class="product-info">
          <text class="product-name">{{ index + 1 }}. {{ item.name }}</text>
          <text class="brand">品牌：{{ item.brand }}</text>
          <text class="price">参考价：{{ item.price }}</text>
          <!-- 匹配优势 -->
          <view class="match-tags">
            <text class="tag" v-for="(tag, idx) in item.matchTags" :key="idx">{{ tag }}</text>
          </view>
          <!-- 跳转链接（合规提示） -->
          <navigator :url="item.officialUrl" class="official-link" target="_blank">
            前往美丽修行查看详情 →
          </navigator>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 获取全局应用实例
const app = getApp();

// 1. 状态定义
const userInfo = ref({ gender: '', age: '' }); // 用户性别、年龄
const skinData = ref({ indicators: {} }); // 皮肤指标（黑头、出油等）
const isLoading = ref(true); // 加载状态
const skinType = ref(''); // 推断的皮肤类型（干性/油性/混合性/中性）
const coreProblems = ref([]); // 核心皮肤问题
const recommendDirection = ref(''); // 推荐方向
const recommendList = ref([]); // 推荐产品列表（前10条）

// 2. 页面加载：获取用户信息、皮肤数据，生成推荐
onMounted(async () => {
  try {
    // 2.1 读取用户信息（从全局/本地存储）
    await getUserInfo();
    // 2.2 读取皮肤指标数据（从全局/本地存储）
    await getSkinData();
    // 2.3 推断皮肤类型与核心问题
    analyzeSkinState();
    // 2.4 生成推荐列表（模拟：后续可对接合规API）
    await generateRecommendList();
  } catch (error) {
    console.error('推荐数据生成失败：', error);
    uni.showToast({ title: '推荐加载失败', icon: 'none' });
  } finally {
    isLoading.value = false;
  }
});

// 3. 读取用户信息（性别用于匹配产品）
const getUserInfo = () => {
  return new Promise((resolve) => {
    if (app.globalData?.userInfo) {
      userInfo.value = { ...app.globalData.userInfo };
    } else {
      const storedInfo = uni.getStorageSync('userInfo');
      userInfo.value = storedInfo || { gender: '', age: '' };
    }
    resolve();
  });
};

// 4. 读取皮肤指标数据（用于分析皮肤状态）
const getSkinData = () => {
  return new Promise((resolve) => {
    if (app.globalData?.latestSkinDiagnosis) {
      skinData.value.indicators = { ...app.globalData.latestSkinDiagnosis };
    } else {
      const storedData = uni.getStorageSync('latestSkinDiagnosis');
      skinData.value.indicators = storedData || {
        黑头: 6.2,
        光滑度: 3.9,
        黑眼圈: 6.7,
        出油: 5.3,
        毛孔: 7.1,
        痘痘: 4.8,
      };
    }
    resolve();
  });
};

// 5. 分析皮肤类型与核心问题（核心逻辑）
const analyzeSkinState = () => {
  const { 出油, 黑头, 毛孔, 痘痘, 光滑度 } = skinData.value.indicators;
  const problems = [];

  // 5.1 推断皮肤类型（基于出油、毛孔指标：分数越低问题越严重）
  if (出油 <= 3 && 光滑度 <= 4) {
    skinType.value = '干性皮肤';
  } else if (出油 <= 4 && 毛孔 <= 5) {
    skinType.value = '中性皮肤';
  } else if (出油 > 5 && 毛孔 > 6) {
    skinType.value = '油性皮肤';
  } else {
    skinType.value = '混合性皮肤';
  }

  // 5.2 识别核心问题（分数<=5判定为需改善问题）
  if (黑头 <= 5) problems.push('黑头明显');
  if (痘痘 <= 5) problems.push('痘痘问题');
  if (毛孔 <= 5) problems.push('毛孔粗大');
  if (出油 <= 4 && skinType.value !== '干性皮肤') problems.push('出油异常');
  if (光滑度 <= 4) problems.push('皮肤粗糙');
  coreProblems.value = problems.length > 0 ? problems : ['皮肤状态良好'];

  // 5.3 确定推荐方向（结合皮肤类型+核心问题）
  const genderPrefix = userInfo.value.gender === '男' ? '男士' : '女士';
  if (coreProblems.value.includes('黑头明显') || coreProblems.value.includes('毛孔粗大')) {
    recommendDirection.value = `${genderPrefix}${skinType.value}专用：控油+收缩毛孔+去黑头`;
  } else if (coreProblems.value.includes('痘痘问题')) {
    recommendDirection.value = `${genderPrefix}${skinType.value}专用：祛痘+舒缓修复`;
  } else if (skinType.value === '干性皮肤') {
    recommendDirection.value = `${genderPrefix}干性皮肤专用：保湿+滋润+修复`;
  } else {
    recommendDirection.value = `${genderPrefix}${skinType.value}专用：维稳+轻度护理`;
  }
};

// 6. 生成推荐列表（模拟：前10条，格式对齐美丽修行产品信息）
// 注意：实际项目需替换为「美丽修行开放API」或合规数据供应商接口
const generateRecommendList = () => {
  return new Promise((resolve) => {
    // 模拟推荐数据：基于皮肤类型+性别+核心问题匹配（格式参考美丽修行）
    const baseList = [
      // 控油/去黑头方向（适合油性/混合性+黑头/毛孔问题）
      {
        name: '净透控油洁面乳',
        brand: '理肤泉',
        price: '¥128/100ml',
        imgUrl: 'https://via.placeholder.com/100x100?text=理肤泉洁面',
        matchTags: ['控油', '去黑头', '适合油性'],
        officialUrl: 'https://www.bevol.cn/product/123456', // 模拟美丽修行链接
      },
      {
        name: '毛孔收缩爽肤水',
        brand: '科颜氏',
        price: '¥210/250ml',
        imgUrl: 'https://via.placeholder.com/100x100?text=科颜氏爽肤水',
        matchTags: ['收缩毛孔', '控油保湿', '适合混合性'],
        officialUrl: 'https://www.bevol.cn/product/123457',
      },
      // 祛痘修复方向（适合痘痘问题）
      {
        name: '清痘舒缓精华液',
        brand: '修丽可',
        price: '¥590/30ml',
        imgUrl: 'https://via.placeholder.com/100x100?text=修丽可精华',
        matchTags: ['祛痘', '舒缓', '适合所有肤质'],
        officialUrl: 'https://www.bevol.cn/product/123458',
      },
      {
        name: '痘肌修护面霜',
        brand: '薇诺娜',
        price: '¥168/50g',
        imgUrl: 'https://via.placeholder.com/100x100?text=薇诺娜面霜',
        matchTags: ['修护屏障', '淡化痘印', '适合敏感痘肌'],
        officialUrl: 'https://www.bevol.cn/product/123459',
      },
      // 干性皮肤保湿方向
      {
        name: '高保湿修护乳液',
        brand: '雅诗兰黛',
        price: '¥480/100ml',
        imgUrl: 'https://via.placeholder.com/100x100?text=雅诗兰黛乳液',
        matchTags: ['高保湿', '修护', '适合干性'],
        officialUrl: 'https://www.bevol.cn/product/123460',
      },
      {
        name: '深层滋润面霜',
        brand: '兰蔻',
        price: '¥620/50g',
        imgUrl: 'https://via.placeholder.com/100x100?text=兰蔻面霜',
        matchTags: ['滋润', '抗干燥', '适合干性'],
        officialUrl: 'https://www.bevol.cn/product/123461',
      },
      // 中性/混合性维稳方向
      {
        name: '维稳修护精华露',
        brand: '赫莲娜',
        price: '¥1280/50ml',
        imgUrl: 'https://via.placeholder.com/100x100?text=赫莲娜精华',
        matchTags: ['维稳', '抗初老', '适合中性'],
        officialUrl: 'https://www.bevol.cn/product/123462',
      },
      {
        name: '平衡水油爽肤水',
        brand: 'SK-II',
        price: '¥1540/230ml',
        imgUrl: 'https://via.placeholder.com/100x100?text=SK-II神仙水',
        matchTags: ['平衡水油', '提亮', '适合混合性'],
        officialUrl: 'https://www.bevol.cn/product/123463',
      },
      // 男士专用方向
      {
        name: '男士控油保湿套装',
        brand: '碧欧泉',
        price: '¥890/套',
        imgUrl: 'https://via.placeholder.com/100x100?text=碧欧泉男士套装',
        matchTags: ['男士专用', '控油保湿', '适合油性'],
        officialUrl: 'https://www.bevol.cn/product/123464',
      },
      {
        name: '男士清痘洁面膏',
        brand: '资生堂',
        price: '¥180/125ml',
        imgUrl: 'https://via.placeholder.com/100x100?text=资生堂男士洁面',
        matchTags: ['男士专用', '祛痘', '适合痘肌'],
        officialUrl: 'https://www.bevol.cn/product/123465',
      },
    ];

    // 过滤匹配：基于皮肤类型+性别，确保推荐精准
    const filteredList = baseList.filter((item) => {
      // 性别匹配：男士优先男士专用产品
      if (userInfo.value.gender === '男' && item.matchTags.includes('男士专用')) {
        return true;
      }
      // 皮肤类型匹配：产品标签包含当前皮肤类型
      if (item.matchTags.includes(`适合${skinType.value}`)) {
        return true;
      }
      // 核心问题匹配：产品标签包含核心问题解决方案
      return coreProblems.value.some((problem) => {
        const problemTagMap = {
          '黑头明显': '去黑头',
          '痘痘问题': '祛痘',
          '毛孔粗大': '收缩毛孔',
          '皮肤粗糙': '修护',
        };
        return item.matchTags.includes(problemTagMap[problem]);
      });
    });

    // 截取前10条，不足时用基础数据补充
    recommendList.value = filteredList.length >= 10 
      ? filteredList.slice(0, 10) 
      : [...filteredList, ...baseList].slice(0, 10);

    resolve();
  });
};
</script>

<style scoped>
/* 页面整体样式 */
.recommend-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 20rpx;
}

/* 顶部标题栏 */
.page-header {
  text-align: center;
  margin-bottom: 30rpx;
}
.header-title {
  font-size: 38rpx;
  font-weight: bold;
  color: #ff6b6b;
  display: block;
  margin-bottom: 10rpx;
}
.sub-title {
  font-size: 24rpx;
  color: #666;
}

/* 卡片通用样式 */
.card {
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
  padding: 25rpx;
  margin-bottom: 25rpx;
}

/* 皮肤状态摘要 */
.skin-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx 25rpx;
  align-items: center;
}
.summary-item {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}
.summary-item .label {
  font-size: 26rpx;
  color: #666;
  margin-right: 10rpx;
}
.summary-item .value {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

/* 空状态/加载状态 */
.empty-state {
  text-align: center;
  padding: 80rpx 20rpx;
  color: #999;
  font-size: 26rpx;
}

/* 推荐列表 */
.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.recommend-item {
  display: flex;
  gap: 25rpx;
  align-items: flex-start;
}
.product-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
}
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.product-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}
.brand, .price {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 6rpx;
}
.match-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 10rpx;
}
.tag {
  background-color: #f0f9ff;
  color: #2f54eb;
  font-size: 22rpx;
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
}
.tag {
  background-color: #f0f9ff;
  color: #2f54eb;
  font-size: 22rpx;
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
}
.official-link {
  font-size: 24rpx;
  color: #ff6b6b;
  text-decoration: underline;
  margin-top: 8rpx;
  display: inline-block;
}
</style>