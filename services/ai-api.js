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
    if (!params.userId) throw new Error('用户ID不能为空');
    // 允许仅上传图片（无文本时）
    if (!params.question?.trim() && !params.imageBase64) {
      throw new Error('请输入问题或上传图片');
    }

    // 构建表单数据（因为包含图片，使用FormData而非JSON）
    const formData = new FormData();
    formData.append('user_id', params.userId);
    formData.append('question', params.question?.trim() || '');
    // 后端需要<image>前缀标识图片（匹配Python代码逻辑）
    if (params.imageBase64) {
      formData.append('question', `<image>${params.question?.trim() || ''}`);
    }

    // 发送请求
    const response = await fetch('http://172.30.154.81:8000/api/generate', {
      method: 'POST',
      body: formData, // 直接传递FormData（自动处理Content-Type）
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP错误: ${response.status}，详情: ${errorText}`);
    }

    if (!response.body) {
      throw new Error('后端未返回流式数据');
    }
    return response.body.getReader();

  } catch (error) {
    console.error('AI咨询接口错误:', error);
    throw error;
  }
};