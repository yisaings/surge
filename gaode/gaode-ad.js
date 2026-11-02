// 高德地图精简 v2（2026-11-03，据 004612 新抓包补齐）
// 目标：只保留地图功能，打车/酒店等服务入口全清。
// v1 保留：工具栏只留骑行/公交地铁/步行/离线地图/收藏夹；
//   地图图层清酒店/营销类图标；contentFeed 推荐流清空；
//   m5-zb 推广/打车后台 data 置空。
// v2 新增：
//   首页 AI 流 home_qs：PmtContainer（AI 叫车卡）与精选榜单 feed 置空，
//     只保留常去地点那一行；思考过程 loading 行直接丢弃；
//   探索 AI 流 home_explore：整条流返回空（游记/攻略卡片全没）；
//   探索榜单入口 af-ai-search 的 rankEntry（美食榜/景点榜/酒店榜）清空，
//     分类行 quickLink 与天气不动；
//   内容中心 ContentCenter 的 waterfall 列表清空；
//   我的页 nodefaasv3：cardList 只留足迹、导航语音/车标、入口行三组，
//     达人任务、勋章、好友动态、活动卡片、猜你喜欢、通知卡全部去掉。
// 不动：地图瓦片、搜索、天气、定位、导航、消息分类、安全上报、
//   首页工具栏、探索分类行、我的入口行（含借钱等，见模块说明）。
// 底部 tab（首页/探索/长按说话/打车/我的）两次抓包均无对应接口，属原生，动不了。
// 异常一律原样放行。
(function () {
  var url = $request.url;
  var body = $response.body || '';
  if (!body) { $done({}); return; }

  // ---- 探索 AI 流：整条置空 ----
  if (url.indexOf('ai.amap.com/v1/ai_rec/home_explore') !== -1) {
    $done({ body: 'event: data\ndata: {"exist_risk":false,"is_done":true}\n\n' });
    return;
  }

  // ---- 首页 AI 流：按行手术，只留常去地点 ----
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
        // AI 思考过程行：丢弃（think_type / sub_type=think，type 不一定是 loading）
        var inner0 = comp.data && comp.data.data;
        if (comp.type === 'loading' || comp.think_type ||
            (inner0 && inner0.sub_type === 'think')) continue;
        var mods = inner0 && inner0.modules;
        if (mods) {
          // AI 叫车卡：置空
          if (mods.PmtContainer) mods.PmtContainer = {};
          // feed 容器：除常去地点外全部置空
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
  // 我的页保留的 card dataKey：足迹、导航语音/车标、入口行
  var KEEP_MINE = {
    'MineNewFootprintCard': 1,
    'MineNewVirtualAssetCardV3': 1,
    'MineNewBEntranceCardV4': 1
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

    // ---- 内容中心 waterfall：清空 ----
    if (url.indexOf('m5.amap.com/ws/info_bff/ContentCenter') !== -1) {
      var cw = obj.data && obj.data.modules && obj.data.modules.waterfall;
      if (cw && cw.data && Array.isArray(cw.data.list)) cw.data.list = [];
      $done({ body: JSON.stringify(obj) }); return;
    }

    // ---- 探索榜单入口：清空（分类行与天气不动） ----
    if (url.indexOf('m5.amap.com/ws/c3frontend/af-ai-search/search') !== -1) {
      var rk = obj.data && obj.data.modules && obj.data.modules.rankEntry;
      if (rk) rk.data = [];
      $done({ body: JSON.stringify(obj) }); return;
    }

    // ---- 我的页：只留足迹、语音/车标、入口行 ----
    if (url.indexOf('m5.amap.com/ws/shield/dsp/profile/index/nodefaasv3') !== -1) {
      if (obj.data && Array.isArray(obj.data.cardList)) {
        obj.data.cardList = obj.data.cardList.filter(function (c) {
          return c && KEEP_MINE[c.dataKey];
        });
      }
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
