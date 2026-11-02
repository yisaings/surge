// 小度 App 精简 v1（2026-11-02，据 2026-11-02-234607.har 实测接口编写）
// 首页推荐流：只留回家看看 + 小度通话，其余卡片全清
// 我的页营销：会员入口、金币、金榜、奖励广告、个人中心广告横幅全清（头像账号、我的设备不动）
// 开屏：flashScreen 摇一摇全屏广告清掉；商城首页（dumall）整组清掉
// 不动：底部栏项目表（本次抓包没有该接口，bottomTabMode 未改）、音乐/播客/有声等分区页、
//       顶部音乐/蜻蜓/喜马拉雅/播客频道入口、头像账号、我的设备、对话列表
(function () {
  var url = ($request && $request.url) || '';
  var body = ($response && $response.body) || '';
  if (!body) { $done({}); return; }
  var obj;
  try { obj = JSON.parse(body); } catch (e) { $done({}); return; }

  function emptyResources(o) {
    if (o && o.data && Array.isArray(o.data.resources)) o.data.resources = [];
  }

  try {
    if (url.indexOf('/xiaoduapp/v3/module/index') !== -1) {
      // 首页推荐流：只留回家看看；金刚区只留小度通话一项
      var pages = obj.data && obj.data.pages;
      if (Array.isArray(pages)) {
        pages.forEach(function (page) {
          (page.moduleList || []).forEach(function (mod) {
            var res = mod.data && mod.data.resources;
            if (!Array.isArray(res)) return;
            mod.data.resources = res.filter(function (r) {
              var name = r.header && r.header.name;
              if (name === 'RenderGoHomeAndSeeV3') return true;
              if (name === 'RenderKingKong') {
                var list = r.payload && r.payload.list;
                if (Array.isArray(list)) {
                  r.payload.list = list.filter(function (it) { return it.title === '小度通话'; });
                }
                return true;
              }
              return false;
            });
          });
        });
      }
    } else if (url.indexOf('/xiaoduapp/v1/index/index/flashScreen') !== -1) {
      // 开屏摇一摇全屏广告
      if (obj.data) obj.data.list = [];
    } else if (url.indexOf('/xiaoduapp/v1/client/getDidpConf') !== -1) {
      // 亲友引荐计划（营销卡片）；bottomTabMode 等其余配置不动
      if (obj.data && obj.data.clientFeature) delete obj.data.clientFeature.FriendReferralProgram;
    } else if (url.indexOf('/appserver/gateway/app/v1') !== -1) {
      var inner = '';
      try { inner = (JSON.parse($request.body || '{}').url) || ''; } catch (e) {}
      if (inner === 'dueros://dumall_app/home/GetModulesV2') {
        // 商城首页整组（HomeSetting/BannerCarousel/活动/金币/榜单等）
        emptyResources(obj);
      } else if (inner === 'dueros://appserver/internal/getAdvertisement') {
        // 我的页广告横幅（以旧换新、活动）
        (obj.data && obj.data.resources || []).forEach(function (r) {
          if (r.payload) r.payload.bannerList = [];
        });
      } else if (inner === 'dueros://bot_membership/vipCenter/VipEntryInfo') {
        emptyResources(obj); // 会员入口
      } else if (inner === 'dueros://bot_operation/app/user/CoinInfo') {
        emptyResources(obj); // 金币
      } else if (inner === 'dueros://dumall_app/action/GetGoldList') {
        emptyResources(obj); // 金榜
      } else if (inner === 'dueros://bot_operation/app/user/RewardAdEntrance') {
        emptyResources(obj); // 奖励广告入口
      } else if (inner === 'dueros://videoCallHongBao/api/v1/Banner') {
        // 视频通话红包横幅
        (obj.data && obj.data.resources || []).forEach(function (r) {
          if (r.payload) { r.payload.topBanner = null; r.payload.addrBannerList = []; }
        });
      }
    }
  } catch (e) {
    // 任何异常都原样放行，绝不把响应改坏
    $done({});
    return;
  }
  $done({ body: JSON.stringify(obj) });
})();
