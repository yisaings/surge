// 小度 App 精简 v2（2026-11-03）：首页只留回家看看+小度通话；
// 我的只留基础、营销全清；资源广场/会员/商城三个页内容清成空页
// （底部 tab 栏本身是原生写死、接口层去不掉，内容清掉后点进去是空的）。
// 关键修正：Surge http-response 里 $request.body 拿不到网关内层 url，
// 所以网关一律按响应体里的 resource 名字/命名空间过滤，不再依赖请求体。
// 异常一律原样放行，绝不破坏正常功能。
(function () {
  var url = $request.url;
  var body = $response.body || '';
  if (!body) { $done({}); return; }
  var obj;
  try { obj = JSON.parse(body); } catch (e) { $done({}); return; }

  function isObj(x) { return x && typeof x === 'object' && !Array.isArray(x); }

  try {
    // ---- 首页推荐流：只留回家看看 + 金刚区只留小度通话 ----
    if (/^https:\/\/xiaodu\.baidu\.com\/xiaoduapp\/v3\/module\/index$/.test(url)) {
      var pages = obj.data && obj.data.pages;
      if (Array.isArray(pages) && pages[0] && Array.isArray(pages[0].moduleList)) {
        var list = pages[0].moduleList[0] && pages[0].moduleList[0].data && pages[0].moduleList[0].data.resources;
        if (Array.isArray(list)) {
          var kept = [];
          list.forEach(function (r) {
            var name = r.header && r.header.name;
            if (name === 'RenderGoHomeAndSeeV3') { kept.push(r); return; }
            if (name === 'RenderKingKong' && r.payload && Array.isArray(r.payload.list)) {
              r.payload.list = r.payload.list.filter(function (it) { return it && it.title === '小度通话'; });
              kept.push(r);
            }
          });
          pages[0].moduleList[0].data.resources = kept;
        }
      }
      $done({ body: JSON.stringify(obj) }); return;
    }

    // ---- 开屏：data.list 置空 ----
    if (/^https:\/\/xiaodu\.baidu\.com\/xiaoduapp\/v1\/index\/index\/flashScreen$/.test(url)) {
      if (obj.data && Array.isArray(obj.data.list)) obj.data.list = [];
      $done({ body: JSON.stringify(obj) }); return;
    }

    // ---- 客户端配置：删亲友引荐计划营销卡 ----
    if (/^https:\/\/xiaodu\.baidu\.com\/xiaoduapp\/v1\/client\/getDidpConf/.test(url)) {
      if (obj.data && obj.data.clientFeature && obj.data.clientFeature.FriendReferralProgram) {
        delete obj.data.clientFeature.FriendReferralProgram;
      }
      $done({ body: JSON.stringify(obj) }); return;
    }

    // ---- 资源广场 tab 栏：pages 置空 ----
    if (/^https:\/\/xiaodu\.baidu\.com\/xiaoduapp\/v3\/square\/getResourceTab/.test(url)) {
      if (obj.data && Array.isArray(obj.data.pages)) obj.data.pages = [];
      $done({ body: JSON.stringify(obj) }); return;
    }

    // ---- 网关：按响应体 resource 过滤 ----
    if (/^https:\/\/xiaodu\.baidu\.com\/appserver\/gateway\/app\/v1$/.test(url)) {
      var data = obj.data;
      if (isObj(data) && Array.isArray(data.resources)) {
        var DROP_NAMES = {
          'VipEntryInfo': 1,        // 我的：领会员 + 白金VIP/儿童益智卡
          'UserCoinInfo': 1,        // 我的：星币
          'UserRewardAdEntrance': 1,// 我的：奖励广告入口
          'VipAreaV2': 1,           // 会员专区整页（纯卖会员）
          'PuzzleGameHomePage': 1   // 资源广场儿童页
        };
        var out = [];
        data.resources.forEach(function (r) {
          if (!r || !r.header) { out.push(r); return; }
          var ns = r.header.namespace || '';
          var name = r.header.name || '';
          // 商城全部资源：命名空间 dumall_app 全删
          if (ns.indexOf('dumall_app') !== -1) return;
          if (DROP_NAMES[name]) return;
          if (name === 'PersonalCenterAdvertisement' && r.payload) {
            r.payload.bannerList = [];   // 我的：宠粉 banner
          }
          if (name === 'BannerInfo' && r.payload) {
            r.payload.topBanner = null;
            r.payload.addrBannerList = []; // 视频通话红包 banner
          }
          out.push(r);
        });
        data.resources = out;
      }
      $done({ body: JSON.stringify(obj) }); return;
    }
  } catch (e) { /* 异常原样放行 */ }
  $done({});
})();
