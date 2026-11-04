let url = $request.url;
let body = $response.body;
try {
  let obj = JSON.parse(body);
  let bad = /qfd2024|lucky-koi|wnl-2048|wnl-advert-lottery2|dayday-money2|wnlproyunying|building-wealth|wnl_family/;
  if (url.includes('/AdApi/GetFeedAds')) {
    if (obj.data) { obj.data.ads = []; obj.data.feed = ''; }
  } else if (url.includes('/CttApi/GetGeneralCardInfo')) {
    if (obj.data) { obj.data.cards = []; }
  } else if (url.includes('/CttApi/GetTabsConrner')) {
    if (obj.data) { obj.data.corner = ''; }
  } else if (url.includes('/ExtTools/GetExtTools')) {
    if (obj.data && Array.isArray(obj.data.extGroup)) {
      obj.data.extGroup.forEach(function (g) {
        if (Array.isArray(g.tools)) {
          g.tools = g.tools.filter(function (t) { return !bad.test(t.toolUrl || ''); });
        }
      });
      obj.data.extGroup = obj.data.extGroup.filter(function (g) {
        return !Array.isArray(g.tools) || g.tools.length > 0;
      });
    }
  } else if (url.includes('/API/gettools.aspx')) {
    if (Array.isArray(obj.msg)) {
      obj.msg = obj.msg.filter(function (m) { return !bad.test(m.WebUrl || ''); });
    }
  } else if (url.includes('/MessageCenter/getwnliosmsg')) {
    if (obj.data) {
      if (Array.isArray(obj.data)) {
        obj.data = [];
      } else {
        if (Array.isArray(obj.data.list)) obj.data.list = [];
        if (Array.isArray(obj.data.msgs)) obj.data.msgs = [];
        if (Array.isArray(obj.data.messages)) obj.data.messages = [];
      }
    }
    if (Array.isArray(obj.msgs)) obj.msgs = [];
    if (Array.isArray(obj.messages)) obj.messages = [];
  } else if (url.includes('/api/CardHome/GetCardHomeItems')) {
    if (obj.data && Array.isArray(obj.data)) {
      obj.data = obj.data.filter(function (c) { return !/openvip/.test(c.url || ''); });
    }
  } else if (url.includes('/api/CardHome/GetCardHome')) {
    let drop = ['今日星座', '每日一言', '抖音领券', '特价会员', '今日一览', '限时背景图', '按钮图', '非限时背景图', '电子木鱼'];
    if (obj.data && Array.isArray(obj.data)) {
      obj.data.forEach(function (g) {
        if (Array.isArray(g.items)) {
          g.items = g.items.filter(function (it) {
            return drop.indexOf(it.title) === -1 && !/openvip|csj-mall/.test(it.url || '');
          });
        }
      });
      obj.data = obj.data.filter(function (g) {
        return !Array.isArray(g.items) || g.items.length > 0;
      });
    }
  } else if (url.includes('/api/healthtimer/list')) {
    if (obj.data) { obj.data = []; }
  } else if (url.includes('/api/News/GetInfiniteInfos')) {
    if (obj.data) { obj.data = []; }
  } else if (url.includes('/api/channel/GetChannelList')) {
    if (obj.data) { obj.data = []; }
  } else if (url.includes('/api/daily/GetDailySentences')) {
    if (obj.data) { obj.data = []; }
  } else if (url.includes('/api/ChannelCardFlow/GetList')) {
    if (obj.data) { obj.data = []; }
  }
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  $done({});
}
