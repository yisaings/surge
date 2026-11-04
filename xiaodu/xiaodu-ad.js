(function () {
  var url = $request.url;
  var body = $response.body || '';
  if (!body) { $done({}); return; }
  var obj;
  try { obj = JSON.parse(body); } catch (e) { $done({}); return; }
  function isObj(x) { return x && typeof x === 'object' && !Array.isArray(x); }
  try {
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
    if (/^https:\/\/xiaodu\.baidu\.com\/xiaoduapp\/v1\/index\/index\/flashScreen$/.test(url)) {
      if (obj.data && Array.isArray(obj.data.list)) obj.data.list = [];
      $done({ body: JSON.stringify(obj) }); return;
    }
    if (/^https:\/\/xiaodu\.baidu\.com\/xiaoduapp\/v1\/client\/getDidpConf/.test(url)) {
      if (obj.data && obj.data.clientFeature && obj.data.clientFeature.FriendReferralProgram) {
        delete obj.data.clientFeature.FriendReferralProgram;
      }
      $done({ body: JSON.stringify(obj) }); return;
    }
    if (/^https:\/\/xiaodu\.baidu\.com\/xiaoduapp\/v3\/square\/getResourceTab/.test(url)) {
      if (obj.data && Array.isArray(obj.data.pages)) obj.data.pages = [];
      $done({ body: JSON.stringify(obj) }); return;
    }
    if (/^https:\/\/xiaodu\.baidu\.com\/xiaoduapp\/v3\/module\/getList/.test(url)) {
      var gl = obj.data && obj.data.list;
      if (Array.isArray(gl)) {
        gl.forEach(function (g) {
          var rs = g && g.data && g.data.resources;
          if (Array.isArray(rs)) {
            g.data.resources = rs.filter(function (r) {
              var nm = r && r.header && r.header.name;
              if (nm === 'RenderAccountCard') return false;
              if (nm === 'RenderKingKong' && r.payload && Array.isArray(r.payload.list)) {
                r.payload.list = r.payload.list.filter(function (it) { return it && it.title !== '小度会员'; });
              }
              return true;
            });
          }
        });
      }
      $done({ body: JSON.stringify(obj) }); return;
    }
    if (/^https:\/\/xiaodu\.baidu\.com\/device_service\/v1\/getAppMsgList/.test(url)) {
      var ml = obj.data && obj.data.msg_list;
      if (Array.isArray(ml)) {
        obj.data.msg_list = ml.filter(function (m) {
          var ap = m && m.action_payload;
          var link = ap && ap.link ? String(ap.link) : '';
          if (!link) return true;
          if (link.indexOf('dumall.baidu.com') !== -1) return false;
          if (link.indexOf('saiya') !== -1) return false;
          if (link.indexOf('rewardAd') !== -1) return false;
          return true;
        });
      }
      $done({ body: JSON.stringify(obj) }); return;
    }
    if (/^https:\/\/xiaodu\.baidu\.com\/appserver\/gateway\/app\/v1$/.test(url)) {
      var data = obj.data;
      if (isObj(data) && Array.isArray(data.resources)) {
        var DROP_NAMES = {
          'VipEntryInfo': 1,
          'UserCoinInfo': 1,
          'UserRewardAdEntrance': 1,
          'VipAreaV2': 1,
          'VipArea': 1,
          'PuzzleGameHomePage': 1,
          'CheckPromoPopup': 1,
          'floatWindow': 1,
          'guideWindow': 1,
          'popWindow': 1
        };
        var out = [];
        data.resources.forEach(function (r) {
          if (!r || !r.header) { out.push(r); return; }
          var ns = r.header.namespace || '';
          var name = r.header.name || '';
          if (ns.indexOf('dumall_app') !== -1) return;
          if (DROP_NAMES[name]) return;
          if (name === 'PersonalCenterAdvertisement' && r.payload) {
            r.payload.bannerList = [];
          }
          if (name === 'BannerInfo' && r.payload) {
            r.payload.topBanner = null;
            r.payload.addrBannerList = [];
          }
          out.push(r);
        });
        data.resources = out;
      }
      $done({ body: JSON.stringify(obj) }); return;
    }
  } catch (e) { }
  $done({});
})();
