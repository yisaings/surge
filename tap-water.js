// block-water-ad.js

if ($response?.body) {
  let obj = JSON.parse($response.body);
  if (obj?.content) {
    obj.content = [];
    obj.message = "广告已屏蔽";
    obj.code = "0";
  }
  $done({ body: JSON.stringify(obj) });
} else {
  $done({});
}