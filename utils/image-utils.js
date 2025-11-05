// 选择图片（从相册）
export const chooseImage = async (options = { count: 1 }) => {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      ...options,
      sourceType: ['album'], // 明确指定从相册选择
      success: resolve,
      fail: reject,
    });
  });
};

// 拍摄图片
export const takePhoto = async (options = { count: 1 }) => {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      ...options,
      sourceType: ['camera'], // 明确指定从相机拍摄
      success: resolve,
      fail: reject,
    });
  });
};

// 上传图片到服务器
export const uploadFile = async (filePath, url) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url,
      filePath,
      name: 'file',
      success: resolve,
      fail: reject,
    });
  });
};
