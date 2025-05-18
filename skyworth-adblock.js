// Skyworth 广告屏蔽脚本
let body = $response.body;

try {
  let obj = JSON.parse(body);

  if (obj?.data) {
    const data = obj.data;

    data.isOpen = false;
    data.isWhiteList = false;
    data.isNewUserProtect = false;
    data.showType = false;

    // 清空广告数据
    if (Array.isArray(data.ads)) {
      data.ads.forEach(ad => {
        ad.isOpen = false;
        ad.adsPos = [];
      });
      data.ads = [];
    }

    if (Array.isArray(data.adsSpace)) {
      data.adsSpace.forEach(space => {
        space.isOpen = false;
      });
      data.adsSpace = [];
    }
  }

  body = JSON.stringify(obj);
} catch (e) {
  console.log("Skyworth AdBlock JSON Parse Error:", e);
}

$done({ body });
