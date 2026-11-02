// 高德地图精简 v1（2026-11-03，据 gaode.har 实测接口编写）
// 目标：只保留地图功能，打车/酒店等服务入口全清。
// 工具栏只留：骑行、公交地铁、步行、离线地图、收藏夹；
// 地图图层只清酒店/营销类图标（停车场、充电站、路况、巡航、公交、室内楼层不动）；
// 底部推荐信息流、推广资源、打车后台接口全部清空。
// 不动：地图瓦片、搜索、天气、定位、导航、消息分类、安全上报。
// 异常一律原样放行。
(function () {
  var url = $request.url;
  var body = $response.body || '';
  if (!body) { $done({}); return; }
  var obj;
  try { obj = JSON.parse(body); } catch (e) { $done({}); return; }

  // 工具栏保留的 id：105 骑行、103 公交地铁、104 步行、115 离线地图、127 收藏夹
  var KEEP_TOOLS = { '105': 1, '103': 1, '104': 1, '115': 1, '127': 1 };
  // 地图图层删除的 dataKey：酒店 + 营销/过期/活动类图标
  var DROP_ICONS = {
    'SddTileOffsiteHotel': 1, 'OffsiteHotel': 1, // 酒店
    '淄博烧烤POI': 1, 'sdd_tile_HotSpring_SKU': 1, 'StarbucksStreetSend': 1,
    'CategoryYoungRecommend': 1, 'MerchantGuidance': 1, 'RandomPoints': 1,
    'Personalise': 1, 'Onsite': 1, 'Offsite': 1, 'Hqyc': 1,
    'UGCHotEventCard': 1, 'UGCGovCard': 1, 'RenderCPTHouse': 1,
    'Kids': 1, 'Winter': 1, 'SpringV2': 1,
    'Covid': 1, 'CovidMerge': 1, 'Epidemic': 1
  };

  try {
    // ---- 首页工具栏：只留 5 个地图工具 ----
    if (url.indexOf('m5.amap.com/ws/shield/scene/recommend') !== -1) {
      var tr = obj.data && obj.data.toolsRecommend;
      if (tr && tr.data && Array.isArray(tr.data.default)) {
        tr.data.default = tr.data.default.filter(function (t) {
          return t && KEEP_TOOLS[String(t.id)];
        });
      }
      $done({ body: JSON.stringify(obj) }); return;
    }

    // ---- 底部推荐信息流（游记/攻略）：清空 ----
    if (url.indexOf('m5.amap.com/ws/info_bff/contentFeed') !== -1) {
      var wf = obj.data && obj.data.modules && obj.data.modules.waterfall;
      if (wf && wf.data && Array.isArray(wf.data.list)) wf.data.list = [];
      $done({ body: JSON.stringify(obj) }); return;
    }

    // ---- 首页地图图层：清酒店/营销图标 ----
    if (url.indexOf('m5.amap.com/ws/faas/amap-navigation/main-page-aiqs') !== -1) {
      if (obj.data && Array.isArray(obj.data.mapBizList)) {
        obj.data.mapBizList = obj.data.mapBizList.filter(function (c) {
          return c && !DROP_ICONS[c.dataKey];
        });
      }
      $done({ body: JSON.stringify(obj) }); return;
    }

    // ---- 推广资源 / 打车后台：data 置空 ----
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
