<template>
  <router-view />
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      globalData: {
        userInfo: {
          age: '',       // 年龄（用户输入）
          gender: '',    // 性别（用户输入）
          updateTime: '' // 最后更新时间
        }
      }
    }
  },
  created() {
    // 初始化全局用户信息
    console.log('应用初始化')
  }
}
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}

/* 适配uni-app的page样式 */
.page {
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>