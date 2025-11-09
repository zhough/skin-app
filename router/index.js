import { createRouter, createWebHashHistory } from 'vue-router'
import { isLoggedIn } from '../services/auth-service.js'

// 定义路由
const routes = [
  {
    path: '/',
    redirect: '/auth/login' // 默认重定向到登录页面
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('../pages/auth/login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/user-agreement',
    name: 'UserAgreement',
    component: () => import('../pages/auth/user-agreement.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/privacy-policy',
    name: 'PrivacyPolicy',
    component: () => import('../pages/auth/privacy-policy.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/index',
    name: 'Index',
    component: () => import('../pages/index/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('../pages/knowledge/knowledge.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/selfcheck',
    name: 'SelfCheck',
    component: () => import('../pages/selfcheck/selfcheck.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/advice',
    name: 'Advice',
    component: () => import('../pages/advice/advice.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/picture',
    name: 'Picture',
    component: () => import('../pages/picture/picture.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/aichat',
    name: 'AIChat',
    component: () => import('../pages/aichat/aichat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/myself',
    name: 'Myself',
    component: () => import('../pages/myself/myself.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/personal',
    name: 'Personal',
    component: () => import('../pages/personal/personal.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recommend',
    name: 'Recommend',
    component: () => import('../pages/recommend/recommend/recommend.vue'),
    meta: { requiresAuth: true }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    redirect: '/index'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  // 检查页面是否需要登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否已登录
    if (!isLoggedIn()) {
      // 未登录，重定向到登录页
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    // 不需要登录的页面直接通过
    next()
  }
})

export default router