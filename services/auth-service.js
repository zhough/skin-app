/**
 * 认证相关服务
 */

// 模拟API基础URL
const BASE_URL = ''

/**
 * 发送验证码
 * @param {string} phone - 手机号
 * @returns {Promise}
 */
export async function sendVerificationCode(phone) {
  try {
    // 这里应该是真实的API调用
    // const response = await uni.request({
    //   url: `${BASE_URL}/auth/sendCode`,
    //   method: 'POST',
    //   data: { phone }
    // })
    // return response.data
    
    // 模拟成功响应
    return { success: true, message: '验证码已发送' }
  } catch (error) {
    console.error('发送验证码失败:', error)
    throw new Error('发送验证码失败，请重试')
  }
}

/**
 * 手机号验证码登录
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @returns {Promise}
 */
export async function loginByPhone(phone, code) {
  try {
    // 这里应该是真实的API调用
    // const response = await uni.request({
    //   url: `${BASE_URL}/auth/login`,
    //   method: 'POST',
    //   data: { phone, code }
    // })
    // return response.data
    
    // 模拟成功响应
    const mockData = {
      success: true,
      data: {
        token: 'mock_token_' + Date.now(),
        userInfo: {
          phone,
          nickname: '用户' + phone.slice(-4),
          avatar: ''
        }
      }
    }
    
    // 尝试获取用户之前保存的个人信息（模拟从云服务器获取）
    let savedUserInfo = null;
    if (typeof localStorage !== 'undefined') {
      // 使用phone作为key存储/读取用户信息，模拟后端数据库
      const savedInfoKey = `user_info_${phone}`;
      const savedInfo = localStorage.getItem(savedInfoKey);
      if (savedInfo) {
        savedUserInfo = JSON.parse(savedInfo);
      }
    }
    
    // 合并登录信息和之前保存的个人信息
    const finalUserInfo = {
      ...mockData.data.userInfo,
      ...savedUserInfo
    };
    
    // 保存登录信息
    if (typeof uni !== 'undefined') {
      uni.setStorageSync('token', mockData.data.token)
      uni.setStorageSync('userInfo', finalUserInfo)
    }
    // 网页环境使用localStorage
    else if (typeof localStorage !== 'undefined') {
      localStorage.setItem('token', mockData.data.token)
      localStorage.setItem('userInfo', JSON.stringify(finalUserInfo))
    }
    
    return mockData
  } catch (error) {
    console.error('登录失败:', error)
    throw new Error('登录失败，请检查验证码是否正确')
  }
}

/**
 * 退出登录
 */
export function logout() {
  // 优先使用uni对象
  if (typeof uni !== 'undefined') {
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }
  // 网页环境使用localStorage
  else if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export function isLoggedIn() {
  try {
    // 优先使用uni对象
    if (typeof uni !== 'undefined') {
      return !!uni.getStorageSync('token')
    }
    // 网页环境使用localStorage
    else if (typeof localStorage !== 'undefined') {
      return !!localStorage.getItem('token')
    }
  } catch (error) {
    console.error('检查登录状态失败:', error)
  }
  return false
}

/**
 * 获取当前用户信息
 * @returns {object|null}
 */
export function getCurrentUser() {
  try {
    // 优先使用uni对象
    if (typeof uni !== 'undefined') {
      return uni.getStorageSync('userInfo') || null
    }
    // 网页环境使用localStorage
    else if (typeof localStorage !== 'undefined') {
      const userInfoStr = localStorage.getItem('userInfo')
      return userInfoStr ? JSON.parse(userInfoStr) : null
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
  return null
}

/**
 * 获取Token
 * @returns {string}
 */
export function getToken() {
  try {
    // 优先使用uni对象
    if (typeof uni !== 'undefined') {
      return uni.getStorageSync('token')
    }
    // 网页环境使用localStorage
    else if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('token') || ''
    }
  } catch (error) {
    console.error('获取Token失败:', error)
  }
  return ''
}

/**
 * 简单的密码加密函数（模拟环境使用）
 * @param {string} password - 原始密码
 * @returns {string} 加密后的密码
 */
function encryptPassword(password) {
  // 模拟简单加密，实际项目中应该使用更安全的加密算法
  return btoa(password + '_salt');
}

/**
 * 检查密码是否正确（模拟环境使用）
 * @param {string} inputPassword - 输入的密码
 * @param {string} storedPassword - 存储的加密密码
 * @returns {boolean} 密码是否匹配
 */
function checkPassword(inputPassword, storedPassword) {
  return encryptPassword(inputPassword) === storedPassword;
}

/**
 * 手机号密码登录
 * @param {string} phone - 手机号
 * @param {string} password - 密码
 * @returns {Promise}
 */
export async function loginByPassword(phone, password) {
  try {
    // 尝试从存储中获取用户信息，包括保存的密码
    let savedUserInfo = null;
    let storedPassword = null;
    
    if (typeof localStorage !== 'undefined') {
      // 使用phone作为key存储/读取用户信息，模拟后端数据库
      const savedInfoKey = `user_info_${phone}`;
      const savedInfo = localStorage.getItem(savedInfoKey);
      if (savedInfo) {
        savedUserInfo = JSON.parse(savedInfo);
        // 获取存储的密码（实际应该在独立的安全存储中）
        storedPassword = localStorage.getItem(`user_password_${phone}`);
      }
    }
    
    // 验证密码
    if (!storedPassword || !checkPassword(password, storedPassword)) {
      throw new Error('手机号或密码错误');
    }
    
    // 密码验证通过，创建用户信息
    const mockData = {
      success: true,
      data: {
        token: 'mock_token_' + Date.now(),
        userInfo: {
          phone,
          nickname: savedUserInfo?.nickname || '用户' + phone.slice(-4),
          username: savedUserInfo?.username || '',
          avatar: ''
        }
      }
    }
    
    // 合并登录信息和之前保存的个人信息
    const finalUserInfo = {
      ...mockData.data.userInfo,
      ...savedUserInfo
    };
    
    // 保存登录信息
    if (typeof uni !== 'undefined') {
      uni.setStorageSync('token', mockData.data.token)
      uni.setStorageSync('userInfo', finalUserInfo)
    }
    // 网页环境使用localStorage
    else if (typeof localStorage !== 'undefined') {
      localStorage.setItem('token', mockData.data.token)
      localStorage.setItem('userInfo', JSON.stringify(finalUserInfo))
    }
    
    return mockData
  } catch (error) {
    console.error('登录失败:', error)
    throw new Error('登录失败，请检查手机号和密码是否正确')
  }
}

/**
 * 设置用户信息
 * @param {object} newInfo - 新的用户信息
 */
export function setUserInfo(newInfo) {
  try {
    // 获取当前用户信息
    const currentUser = getCurrentUser() || {};
    
    // 合并新旧信息，保留原有信息不被覆盖
    const updatedUser = { ...currentUser, ...newInfo };
    
    // 保存更新后的用户信息到本地会话存储
    if (typeof uni !== 'undefined') {
      uni.setStorageSync('userInfo', updatedUser);
      
      // 如果是uni-app环境，我们可以模拟存储个人信息到持久化存储
      if (updatedUser.phone) {
        const savedInfoKey = `user_info_${updatedUser.phone}`;
        const userProfile = {
          username: updatedUser.username,
          nickname: updatedUser.nickname,
          age: updatedUser.age,
          gender: updatedUser.gender
        };
        uni.setStorageSync(savedInfoKey, userProfile);
      }
    }
    // 网页环境使用localStorage
    else if (typeof localStorage !== 'undefined') {
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
      // 同时保存到以手机号为key的存储中，模拟云服务器持久化存储
      // 这样即使清除了常规的登录信息，下次用相同手机号登录时仍能恢复个人信息
      if (updatedUser.phone) {
        const savedInfoKey = `user_info_${updatedUser.phone}`;
        // 只保存个人资料信息，不保存token等登录状态
        const userProfile = {
          username: updatedUser.username,
          nickname: updatedUser.nickname,
          age: updatedUser.age,
          gender: updatedUser.gender
        };
        localStorage.setItem(savedInfoKey, JSON.stringify(userProfile));
        
        console.log('用户信息已保存到模拟的云服务器:', userProfile);
      }
    }
    
    return updatedUser;
  } catch (error) {
    console.error('设置用户信息失败:', error);
    throw new Error('设置用户信息失败');
  }
}

/**
 * 用户名密码注册
 * @param {string} username - 用户名
 * @param {string} phone - 手机号
 * @param {string} password - 密码
 * @returns {Promise}
 */
export async function registerByUsernamePassword(username, phone, password) {
  try {
    // 检查用户是否已存在
    if (typeof localStorage !== 'undefined') {
      const savedInfoKey = `user_info_${phone}`;
      const existingUser = localStorage.getItem(savedInfoKey);
      if (existingUser) {
        throw new Error('该手机号已注册，请使用其他手机号或直接登录');
      }
    }
    
    // 模拟成功响应
    const mockData = {
      success: true,
      data: {
        token: 'mock_token_' + Date.now(),
        userInfo: {
          username,
          phone,
          nickname: username || '用户' + phone.slice(-4),
          avatar: ''
        }
      }
    }
    
    // 保存登录信息
    if (typeof uni !== 'undefined') {
      uni.setStorageSync('token', mockData.data.token)
      uni.setStorageSync('userInfo', mockData.data.userInfo)
    }
    // 网页环境使用localStorage
    else if (typeof localStorage !== 'undefined') {
      localStorage.setItem('token', mockData.data.token)
      localStorage.setItem('userInfo', JSON.stringify(mockData.data.userInfo))
      
      // 同时保存到以手机号为key的存储中，模拟云服务器持久化存储
      const savedInfoKey = `user_info_${phone}`;
      const userProfile = {
        username: username,
        nickname: username || '用户' + phone.slice(-4),
        age: '',
        gender: ''
      };
      localStorage.setItem(savedInfoKey, JSON.stringify(userProfile));
      
      // 保存加密后的密码（模拟后端数据库存储）
      const passwordKey = `user_password_${phone}`;
      localStorage.setItem(passwordKey, encryptPassword(password));
    }
    
    return mockData
  } catch (error) {
    console.error('注册失败:', error)
    throw new Error('注册失败，请稍后重试')
  }
}