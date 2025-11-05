// 保存诊断数据到档案
export const saveDiagnoseData = async (data) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: '/api/archive/save', // 模拟保存档案的接口
      method: 'POST',
      data,
      success: (res) => {
        if (res[1].statusCode === 200) {
          resolve(res[1].data);
        } else {
          reject(res[1].data);
        }
      },
      fail: reject,
    });
  });
};