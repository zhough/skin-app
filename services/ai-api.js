/**
 * 获取AI皮肤咨询建议
 * @param {Object} params - 请求参数
 * @param {string} params.userId - 用户ID（必填）
 * @param {Object} params.userInfo - 用户信息对象
 * @param {number} params.userInfo.age - 用户年龄（数字类型）
 * @param {string} params.userInfo.gender - 用户性别
 * @param {string} params.skinType - 皮肤类型
 * @param {string} params.question - 用户问题
 * @returns {Promise<string>} AI返回的建议内容
 */
export const getAISkinConsultation = async (params) => {
  try {
    // 严格参数校验
    if (!params.userId) throw new Error('用户ID不能为空');
    if (!params.userInfo?.age || !params.userInfo?.gender) throw new Error('用户年龄和性别为必填项');
    if (!params.question?.trim()) throw new Error('问题内容不能为空');

    // 格式化请求数据（确保后端能正确处理）
    const requestData = {
      user_id: params.userId, // 与后端字段保持一致
      user_info: {
        age: Number(params.userInfo.age), // 确保是数字类型
        gender: params.userInfo.gender.trim()
      },
      skin_type: params.skinType || '未知',
      question: params.question.trim(),
      timestamp: new Date().getTime()
    };

    // 发送请求到指定后端地址
    const response = await fetch('http://172.30.154.81:8000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    // 处理HTTP错误状态
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP错误: ${response.status}，详情: ${errorText}`);
    }

    // 解析响应数据
    const data = await response.json();
    
    // 验证响应格式
    if (!data || typeof data !== 'object') {
      throw new Error('后端返回格式不正确');
    }
    
    // 根据后端实际返回字段调整（这里假设后端返回{ result: "..." }）
    if (data.result === undefined) {
      throw new Error('后端未返回有效数据');
    }

    return data.result;
  } catch (error) {
    console.error('AI咨询接口错误:', error);
    throw error; // 抛出错误让调用方处理
  }
};