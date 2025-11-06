// 用于将Markdown转换为小程序rich-text支持的nodes格式
export const markdownToHtml = (markdown) => {
  // 1. 压缩多余换行
  let html = markdown.replace(/\n{2,}/g, '\n');
  
  // 2. 处理无序列表
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$1</ul>');
  
  // 3. 处理标题
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  
  // 4. 处理换行
  html = html.replace(/\n/g, '<br>');
  
  // 5. 处理分隔线和加粗
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 6. 清理首尾多余标签
  return html.trim().replace(/^<br>+|<br>+$/g, '');
};