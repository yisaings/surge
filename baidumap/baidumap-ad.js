function processBaiduMap(url, body) {
  try {
    if (url.includes('/client/phpui2/') && url.includes('qt=ads')) {
      const j = JSON.parse(body);
      if (j && j.ads && Array.isArray(j.ads.content)) j.ads.content = [];
      return JSON.stringify(j);
    }
    if (url.includes('/client/noticebar/get')) {
      const j = JSON.parse(body);
      if (j && j.content && Array.isArray(j.content.multi_data)) j.content.multi_data = [];
      return JSON.stringify(j);
    }
    if (url.includes('/feed-server/feed/nearby_flow')) {
      const j = JSON.parse(body);
      if (j && j.data) { j.data.flow_list = []; j.data.has_more = 0; }
      return JSON.stringify(j);
    }
    if (url.includes('/usercenter/mine/page')) {
      const j = JSON.parse(body);
      if (j && j.data) {
        if (Array.isArray(j.data.card_list)) j.data.card_list = j.data.card_list.filter(c => c !== 'gold');
        j.data.finance = {};
        j.data.gold_coin_card = {};
        j.data.new_user_entrance = {};
        j.data.gold = {};
        if (j.data.voice_card) j.data.voice_card.rcmdtopics = {};
        j.data.sport_card = {};
        if (j.data.caricon && Array.isArray(j.data.caricon.list)) j.data.caricon.list = [];
      }
      return JSON.stringify(j);
    }
    if (url.includes('/feed/govui/rich_content')) {
      const j = JSON.parse(body);
      if (j && j.data && j.data.posts) j.data.posts.content = [];
      return JSON.stringify(j);
    }
    if (url.includes('/living/nearby/api')) {
      const j = JSON.parse(body);
      if (j && j.Result && Array.isArray(j.Result.cards)) {
        j.Result.cards = j.Result.cards.filter(c => !(c.cardName && c.cardName.indexOf('diamond') !== -1));
      }
      return JSON.stringify(j);
    }
    if (url.includes('/widget/floatballadd')) {
      const j = JSON.parse(body);
      if (j && j.result && j.result.bean) {
        const b = j.result.bean;
        b.advert_id = ''; b.icon_url = ''; b.widget_title = ''; b.widget_desc = '';
        b.show_count = 0; b.show_interval = 0; b.initial_state = ''; b.bg_color = ''; b.ext_param = null;
      }
      return JSON.stringify(j);
    }
    if (url.includes('yongche.baidu.com/') || url.includes('ecom.map.baidu.com/ad-ops/') ||
        url.includes('maphotel.baidu.com/hotel_visible/nearbyfeed') ||
        url.includes('carowner.baidu.com/carownerui/api/pass/get') ||
        url.includes('integralwall.baidu.com/integralwall/interact/check')) {
      return '{}';
    }
    if (url.includes('afdconf.baidu.com/afd/platform')) {
      const j = JSON.parse(body);
      if (j && j.data && j.data.global) {
        Object.keys(j.data.global).forEach(k => {
          if (k.indexOf('nad_') === 0 || k.indexOf('cpc') !== -1) delete j.data.global[k];
        });
      }
      return JSON.stringify(j);
    }
    if (url.includes('/aimode-router/homepage')) {
      const j = JSON.parse(body);
      if (j && j.content && Array.isArray(j.content.components)) j.content.components = [];
      return JSON.stringify(j);
    }
    if (url.includes('/aiagent/aiAgent/scene')) {
      const j = JSON.parse(body);
      if (j && j.result && j.result.data && Array.isArray(j.result.data.sceneList)) j.result.data.sceneList = [];
      return JSON.stringify(j);
    }
    if (url.includes('/feed-server/nearby/poi_rec') && url.includes('nearby_page_home')) {
      const j = JSON.parse(body);
      if (j && j.data) {
        j.data.xiangxiang_info = {};
        if (j.data.query_info) j.data.query_info.list = [];
      }
      return JSON.stringify(j);
    }
    if (url.includes('/contributor-bus/bounty/tips')) {
      const j = JSON.parse(body);
      if (j && j.data) j.data.detail = {};
      return JSON.stringify(j);
    }
  } catch (e) {
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
