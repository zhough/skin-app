import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'

// 创建应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 全局属性
app.config.globalProperties.$isUni = false

// 挂载应用
app.mount('#app')