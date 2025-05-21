// generic-empty-json.js

try {
  let obj = JSON.parse($response.body);
  if (typeof obj === 'object') {
    if ('data' in obj) {
      obj.data = Array.isArray(obj.data) ? [] : {};
    } else {
      // 如果没有 data 字段，直接返回空对象
      obj = {};
    }
    $done({ body: JSON.stringify(obj) });
  } else {
    $done({ body: '{}' });
  }
} catch (e) {
  $done({ body: '{}' });
}