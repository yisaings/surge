// 小米音箱广告清除脚本
// Surge Module: 小爱音箱会员广告屏蔽

let url = $request.url;
let body = {};

if (url.includes("/advertise/bindPopup") || url.includes("/payGuide/memberGuideBar")) {
  body = {
    message: "Success",
    data: null,
    code: 0
  };
} else if (url.includes("/payGuide/memberPrice")) {
  body = {
    message: "Success",
    data: {
      pricePageMap: {}
    },
    code: 0
  };
} else {
  // fallback：不处理的接口保持原样返回
  $done({});
}

$done({ body: JSON.stringify(body) });