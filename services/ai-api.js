import config from '@/config.js';

/**
 * 获取AI皮肤咨询建议
 * @param {Object} params - 请求参数
 * @param {Object} params.userInfo - 用户信息对象
 * @param {number} params.userInfo.age - 用户年龄
 * @param {string} params.userInfo.gender - 用户性别
 * @param {string} params.skinType - 皮肤类型
 * @param {string} [params.question] - 额外问题（可选）
 * @returns {Promise<string>} AI返回的建议内容
 */
export const getAISkinConsultation = async (params) => {
  try {
    // 参数校验
    if (!params || !params.userInfo) {
      throw new Error('参数错误：缺少必要的用户信息');
    }
    
    const { userInfo, skinType, question } = params;
    
    if (!userInfo.age || !userInfo.gender) {
      throw new Error('请先完善年龄和性别信息');
    }
    
    if (!skinType) {
      throw new Error('缺少皮肤类型信息');
    }

    // 构建提示内容
    let prompt = `我是一名${userInfo.age}岁的${userInfo.gender}，皮肤类型是${skinType}。`;
    
    // 如果有额外问题，添加到提示中
    if (question && question.trim()) {
      prompt += `我的问题是：${question.trim()} 请提供专业的护肤建议，包括日常护理、适合的产品类型和注意事项，回答请简洁明了，避免过于专业的术语，同时强调不能替代专业医疗诊断。`;
    } else {
      prompt += `请提供个性化护肤建议，包括日常护理、适合的产品类型和注意事项，回答请简洁明了，避免过于专业的术语，同时强调不能替代专业医疗诊断。`;
    }

    // 发起请求（使用fetch API，兼容网页环境）
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.API_KEY}`
      },
      body: JSON.stringify({
        model: "GLM-4",
        messages: [
          {
            role: "system",
            content: "你是一个专业的皮肤科医生助手，提供皮肤病相关的信息和建议。回答应简洁明了，避免过于专业的术语，同时必须强调不能替代专业医疗诊断。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    // 错误处理
    if (!response.ok) {
      throw new Error(`API请求失败: 状态码 ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data?.choices || data.choices.length === 0) {
      throw new Error('未获取到有效的AI回复');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('获取皮肤咨询建议失败:', error);
    return `获取建议失败: ${error.message}`;
  }
};
