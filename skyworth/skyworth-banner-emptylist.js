(function () {
  var req = $request || {};
  var res = $response || {};
  var body = res.body;
  var url = req.url || "";
  if (url.indexOf("allBannerConfig") === -1) { $done({}); return; }
  try {
    var obj = JSON.parse(body);
    var cfg = obj && obj.data && obj.data.normalBannerConfig;
    if (cfg) {
      if (cfg.homePageB1) cfg.homePageB1.bannerConfigList = [];
      if (cfg.myPageB1) cfg.myPageB1.bannerConfigList = [];
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
