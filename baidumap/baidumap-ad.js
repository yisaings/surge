// 百度地图去广告 v1：只留地图/导航/搜索
// 命中规则见 baidumap.sgmodule；未列出的接口（瓦片、定位、导航、路线、搜索历史、语音、phpui2 rgc 地图数据）一律不动。
function processBaiduMap(url, body) {
  try {
    // 1. phpui2 广告（我的页横幅/活动横幅/图标）：只清 ads.content，保留 result/option 结构
    if (url.includes('/client/phpui2/') && url.includes('qt=ads')) {
      const j = JSON.parse(body);
      if (j && j.ads && Array.isArray(j.ads.content)) j.ads.content = [];
      return JSON.stringify(j);
    }
    // 2. 首页顶部通知栏（营销通知）：清 multi_data
    if (url.includes('/client/noticebar/get')) {
      const j = JSON.parse(body);
      if (j && j.content && Array.isArray(j.content.multi_data)) j.content.multi_data = [];
      return JSON.stringify(j);
    }
    // 3. 附近信息流：清 flow_list
    if (url.includes('/feed-server/feed/nearby_flow')) {
      const j = JSON.parse(body);
      if (j && j.data) { j.data.flow_list = []; j.data.has_more = 0; }
      return JSON.stringify(j);
    }
    // 4. 我的页：去金币卡、借钱卡、回归抽奖入口
    if (url.includes('/usercenter/mine/page')) {
      const j = JSON.parse(body);
      if (j && j.data) {
        if (Array.isArray(j.data.card_list)) j.data.card_list = j.data.card_list.filter(c => c !== 'gold');
        j.data.finance = {};
        j.data.gold_coin_card = {};
        j.data.new_user_entrance = {};
      }
      return JSON.stringify(j);
    }
    // 5. 首页笔记区：清 posts.content
    if (url.includes('/feed/govui/rich_content')) {
      const j = JSON.parse(body);
      if (j && j.data && j.data.posts) j.data.posts.content = [];
      return JSON.stringify(j);
    }
    // 6. 附近页：只删钻石展位卡
    if (url.includes('/living/nearby/api')) {
      const j = JSON.parse(body);
      if (j && j.Result && Array.isArray(j.Result.cards)) {
        j.Result.cards = j.Result.cards.filter(c => !(c.cardName && c.cardName.indexOf('diamond') !== -1));
      }
      return JSON.stringify(j);
    }
    // 7. 悬浮球广告：清空 bean
    if (url.includes('/widget/floatballadd')) {
      const j = JSON.parse(body);
      if (j && j.result && j.result.bean) {
        const b = j.result.bean;
        b.advert_id = ''; b.icon_url = ''; b.widget_title = ''; b.widget_desc = '';
        b.show_count = 0; b.show_interval = 0; b.initial_state = ''; b.bg_color = ''; b.ext_param = null;
      }
      return JSON.stringify(j);
    }
    // 8. 打车/酒店/电商/车主/积分墙：整接口返回空 JSON
    if (url.includes('yongche.baidu.com/') || url.includes('ecom.map.baidu.com/ad-ops/') ||
        url.includes('maphotel.baidu.com/hotel_visible/nearbyfeed') ||
        url.includes('carowner.baidu.com/carownerui/api/pass/get') ||
        url.includes('integralwall.baidu.com/integralwall/interact/check')) {
      return '{}';
    }
    // 9. afdconf 广告配置：只删 nad_/cpc 相关键，其余平台配置保留
    if (url.includes('afdconf.baidu.com/afd/platform')) {
      const j = JSON.parse(body);
      if (j && j.data && j.data.global) {
        Object.keys(j.data.global).forEach(k => {
          if (k.indexOf('nad_') === 0 || k.indexOf('cpc') !== -1) delete j.data.global[k];
        });
      }
      return JSON.stringify(j);
    }
  } catch (e) {
    // 解析失败时原样放行，不破坏正常功能
    return body;
  }
  return body;
}

if (typeof $request !== 'undefined' && typeof $done === 'function') {
  try {
    $done({ body: processBaiduMap($request.url, $response.body) });
  } catch (e) {
    $done({});
  }
}
