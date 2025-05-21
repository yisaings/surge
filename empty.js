let body = JSON.parse($response.body);

// 定义关键词列表，凡是匹配这些关键词的字段都会被清空或关闭
const adKeywords = ['ad', 'ads', 'advertisement', 'banner', 'banners', 'recommend', 'module', 'popup', 'promotion'];

// 递归清理函数
function deepClean(obj) {
  if (!obj || typeof obj !== 'object') return;

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const value = obj[key];
    const keyLower = key.toLowerCase();

    // 关键词匹配
    if (adKeywords.some(k => keyLower.includes(k))) {
      if (Array.isArray(value)) {
        obj[key] = []; // 清空数组
      } else if (typeof value === 'object') {
        obj[key] = null; // 设为 null
      } else if (typeof value === 'boolean') {
        obj[key] = false; // 关闭开关
      } else {
        obj[key] = ''; // 设为空字符串
      }
    }

    // 如果字段是 boolean 类型且名字中含 show/visible，关闭它
    if (/show|visible/i.test(keyLower) && typeof value === 'boolean') {
      obj[key] = false;
    }

    // 递归处理嵌套字段
    if (typeof value === 'object' && value !== null) {
      deepClean(value);
    }
  }
}

deepClean(body);

$done({ body: JSON.stringify(body) });