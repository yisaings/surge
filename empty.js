let body = JSON.parse($response.body);

// 定义关键词：凡是字段名中包含这些关键词的，统一处理
const adKeys = ['ad', 'ads', 'advert', 'banner', 'recommend', 'module', 'promotion', 'popup', 'feed'];

// 清除内容 + 设置隐藏标志
function clean(obj) {
  if (!obj || typeof obj !== 'object') return;

  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const lowerKey = key.toLowerCase();
    const value = obj[key];

    // 匹配到广告类字段
    if (adKeys.some(k => lowerKey.includes(k))) {
      if (Array.isArray(value)) obj[key] = [];
      else if (typeof value === 'object') obj[key] = null;
      else if (typeof value === 'boolean') obj[key] = false;
      else obj[key] = '';
    }

    // 如果字段控制可视性，统一关闭
    if (/show|visible|display/i.test(lowerKey) && typeof value === 'boolean') {
      obj[key] = false;
    }

    // 如果字段是 height、size、layout，设为 0
    if (/height|size|layout/i.test(lowerKey) && typeof value === 'number') {
      obj[key] = 0;
    }

    // 递归处理嵌套结构
    if (typeof value === 'object') {
      clean(value);
    }
  }
}

clean(body);
$done({ body: JSON.stringify(body) });