// 慢慢买去红包弹窗 v1：只关红包推广，不动商品/比价/历史价格等业务
// 1. getAppConfigRn 里的 hongbaoconfig_3642 是双 11 红包总开关（showdisplay=multiple，
//    hblist 3 条，2026-10-12 至 11-11/11-15，含大红包弹窗 bighb 与悬浮小红包 smallhb）：
//    按同文件里已停用的旧配置口径，showdisplay 置 false、hblist 清空。
// 2. /activity/api/hb 是折扣页淘宝超级红包卡（showActivity=true）：置 false。
var url = $request.url;
var body = $response.body;
try {
  var obj = JSON.parse(body);
  if (url.indexOf('getAppConfigRn') !== -1) {
    var data = obj && obj.result && obj.result.data;
    if (data && data.hongbaoconfig_3642) {
      data.hongbaoconfig_3642.showdisplay = 'false';
      data.hongbaoconfig_3642.hblist = [];
    }
  } else if (url.indexOf('/activity/api/hb') !== -1) {
    if (obj && obj.result) {
      obj.result.showActivity = false;
    }
  }
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  $done({});
}
