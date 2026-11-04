(function () {
  var url = $request.url;
  var body = $response.body || '';
  if (!body) { $done({}); return; }

  if (url.indexOf('ai.amap.com/v1/ai_rec/home_explore') !== -1) {
    $done({ body: 'event: data\ndata: {"exist_risk":false,"is_done":true}\n\n' });
    return;
  }

  if (url.indexOf('ai.amap.com/v1/ai_rec/home_qs') !== -1) {
    try {
      var lines = body.split('\n');
      var out = [];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.indexOf('data:') !== 0) { out.push(line); continue; }
        var raw = line.slice(5);
        var j;
        try { j = JSON.parse(raw); } catch (e) { out.push(line); continue; }
        var comp = j.component || {};
        var inner0 = comp.data && comp.data.data;
        if (comp.type === 'loading' || comp.think_type ||
            (inner0 && inner0.sub_type === 'think')) continue;
        var mods = inner0 && inner0.modules;
        if (mods) {
          if (mods.PmtContainer) mods.PmtContainer = {};
          if (mods.AiCardContainer_0 && raw.indexOf('常去地点') === -1) {
            mods.AiCardContainer_0 = {};
          }
          out.push('data:' + JSON.stringify(j));
        } else {
          out.push(line);
        }
      }
      $done({ body: out.join('\n') }); return;
    } catch (e) { $done({}); return; }
  }

  var obj;
  try { obj = JSON.parse(body); } catch (e) { $done({}); return; }

  var KEEP_TOOLS = { '105': 1, '103': 1, '104': 1, '115': 1, '127': 1 };
  var DROP_ICONS = {
    'SddTileOffsiteHotel': 1, 'OffsiteHotel': 1,
    '淄博烧烤POI': 1, 'sdd_tile_HotSpring_SKU': 1, 'StarbucksStreetSend': 1,
    'CategoryYoungRecommend': 1, 'MerchantGuidance': 1, 'RandomPoints': 1,
    'Personalise': 1, 'Onsite': 1, 'Offsite': 1, 'Hqyc': 1,
    'UGCHotEventCard': 1, 'UGCGovCard': 1, 'RenderCPTHouse': 1,
    'Kids': 1, 'Winter': 1, 'SpringV2': 1,
    'Covid': 1, 'CovidMerge': 1, 'Epidemic': 1
  };
  var KEEP_MINE = {
    'MineNewFootprintCard': 1,
    'MineNewVirtualAssetCardV3': 1,
    'MineNewBEntranceCardV4': 1
  };

  try {
    if (url.indexOf('m5.amap.com/ws/shield/scene/recommend') !== -1) {
      var tr = obj.data && obj.data.toolsRecommend;
      if (tr && tr.data && Array.isArray(tr.data.default)) {
        tr.data.default = tr.data.default.filter(function (t) {
          return t && KEEP_TOOLS[String(t.id)];
        });
      }
      $done({ body: JSON.stringify(obj) }); return;
    }

    if (url.indexOf('m5.amap.com/ws/info_bff/contentFeed') !== -1) {
      var wf = obj.data && obj.data.modules && obj.data.modules.waterfall;
      if (wf && wf.data && Array.isArray(wf.data.list)) wf.data.list = [];
      $done({ body: JSON.stringify(obj) }); return;
    }

    if (url.indexOf('m5.amap.com/ws/info_bff/ContentCenter') !== -1) {
      var cw = obj.data && obj.data.modules && obj.data.modules.waterfall;
      if (cw && cw.data && Array.isArray(cw.data.list)) cw.data.list = [];
      $done({ body: JSON.stringify(obj) }); return;
    }

    if (url.indexOf('m5.amap.com/ws/c3frontend/af-ai-search/search') !== -1) {
      var ms = obj.data && obj.data.modules;
      if (ms) {
        if (ms.quickLink && ms.quickLink.data && Array.isArray(ms.quickLink.data.list)) ms.quickLink.data.list = [];
        if (ms.rankEntry) ms.rankEntry.data = [];
        if (ms.weather) ms.weather.data = {};
      }
      $done({ body: JSON.stringify(obj) }); return;
    }

    if (url.indexOf('m5.amap.com/ws/shield/dsp/profile/index/nodefaasv3') !== -1) {
      if (obj.data && Array.isArray(obj.data.cardList)) {
        obj.data.cardList = obj.data.cardList.filter(function (c) {
          return c && KEEP_MINE[c.dataKey];
        });
      }
      $done({ body: JSON.stringify(obj) }); return;
    }

    if (url.indexOf('m5.amap.com/ws/faas/amap-navigation/main-page-aiqs') !== -1) {
      if (obj.data && Array.isArray(obj.data.mapBizList)) {
        obj.data.mapBizList = obj.data.mapBizList.filter(function (c) {
          return c && !DROP_ICONS[c.dataKey];
        });
      }
      $done({ body: JSON.stringify(obj) }); return;
    }

    if (url.indexOf('m5-zb.amap.com/ws/') !== -1) {
      var isPromo = url.indexOf('/ws/promotion-web/resource') !== -1;
      var isBoss = url.indexOf('/ws/boss/') !== -1;
      var isRide = url.indexOf('/ws/amap/ride/') !== -1 || url.indexOf('/ws/ride/') !== -1;
      var isVipJoint = url.indexOf('/ws/vip/jointly-channel') !== -1;
      var isGalaxy = url.indexOf('/ws/galaxy/show') !== -1;
      if (isPromo || isBoss || isRide || isVipJoint || isGalaxy) {
        if (obj.data !== undefined) obj.data = {};
        $done({ body: JSON.stringify(obj) }); return;
      }
    }
  } catch (e) { /* 异常原样放行 */ }
  $done({});
})();
