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

    // 清空广告数组
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

    // 屏蔽 normalBannerConfig 中的 banner
    if (data.normalBannerConfig && typeof data.normalBannerConfig === 'object') {
      for (let key in data.normalBannerConfig) {
        if (data.normalBannerConfig[key]?.bannerConfigList) {
          data.normalBannerConfig[key].bannerConfigList = [];
        }
      }
    }
  }

  body = JSON.stringify(obj);
} catch (e) {
  console.log("Skyworth AdBlock JSON Parse Error:", e);
}

$done({ body });