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
  }
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  $done({});
}
