// empty-json.js
// 用于 Surge Response 的脚本，将响应 JSON 替换为空对象

if (typeof $response !== "undefined") {
  $done({ body: "{}" });
} else {
  $done({});
}