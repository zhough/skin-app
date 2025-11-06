/**
 * 获取AI皮肤咨询建议（支持流式响应）
 * @param {Object} params - 请求参数
 * @param {string} params.userId - 用户ID（必填）
 * @param {Object} params.userInfo - 用户信息对象
 * @param {number} params.userInfo.age - 用户年龄（数字类型）
 * @param {string} params.userInfo.gender - 用户性别
 * @param {string} params.skinType - 皮肤类型
 * @param {string} params.question - 用户问题
 * @returns {Promise<ReadableStreamDefaultReader>} 流式响应阅读器
 */
export const getAISkinConsultation = async (params) => {
  try {
    // 基础参数校验（保留核心校验，确保请求有效性）
    if (!params.userId) throw new Error('用户ID不能为空');
    if (!params.question?.trim()) throw new Error('问题内容不能为空');

    // 格式化请求数据（严格匹配后端/stream接口要求）
    const requestData = {
      user_id: params.userId,
      user_query: params.question.trim(), // 后端必填的user_query字段
      user_info: {
        age: params.userInfo?.age ? Number(params.userInfo.age) : 30, // 兜底默认值
        gender: params.userInfo?.gender?.trim() || '未知' // 兜底默认值
      },
      skin_type: params.skinType || '未知',
      timestamp: new Date().getTime()
    };

    // 发送请求到后端流式接口
    const response = await fetch('http://172.30.154.81:8000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        // 移除Accept: application/json，允许接收文本流
      },
      body: JSON.stringify(requestData),
      // 确保不中断流式响应
      signal: AbortSignal.timeout(30000) // 30秒超时保护
    });

    // 处理HTTP错误状态
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP错误: ${response.status}，详情: ${errorText}`);
    }

    // 验证流式响应可用性
    if (!response.body) {
      throw new Error('后端未返回流式数据，可能接口不支持流式输出');
    }

    // 返回可读流阅读器，供前端逐块读取
    return response.body.getReader();

  } catch (error) {
    console.error('AI咨询流式接口错误:', error);
    throw error; // 抛出错误让前端处理
  }
};