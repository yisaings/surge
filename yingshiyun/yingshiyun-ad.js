// 萤石云视频 VideoGo 7.9.5 去广告/精简 v2（2026-11-01 截图反馈后修正）
// 抓包：2026-11-01-163315.har（227 条）＋ 17:05 五张截图
//
// 修正说明（v1 错在哪）：
// - 天气返回失败码会显示“天气获取失败，点击重试”，更难看。v2 改为返回 code 200
//   但所有天气字段为空串，天气条显示空白，不再报失败。天气条本身是首页顶部
//   原生写死的区域，接口层只能让它空白，没法把那块高度也收掉。
// - 首页“服务专区”卡片不是 component/info 那排入口，而是 entrance/vas/service/info
//   的增值卡片列表（智能识别/增值畅享卡/电话提醒…），v1 只删了“云存储”一张，
//   整卡还在。v2 直接清空整个列表；云盘 tab 的数据来自 clouds spaceInfo，一并置空。
//   注意：spaceInfo 置空后如果“我的·云盘相册”打不开，告诉我，我把 spaceInfo 这条撤掉。
// - 对话页的行不是 conversation/list，而是 system-bots（设备消息/系统通知）＋
//   im/chat/page（我的家庭）＋ unifiedmsg/summary（消息预览与未读数），v2 一并清空。
// - 商城页的真正内容是 index-waterfall-tab-list（分类/横幅/商品瀑布流），
//   光空白 rn-index 没用，v2 把 waterfall 的 tabs 清空。
// - 社区页：精选流已空（暂无内容是对的），顶部图标/横幅/分类 tab 来自
//   community/banner、position、tab，这三个接口在 v1 抓包里没有响应体，
//   v2 按通用规则掏空（list/tabs 字段置空），若还残留就得新抓包定位。
// - 对话页顶部“数字大脑”横幅在 v1 抓包里没有任何响应体含这串文字（疑似缓存），
//   本版未动它；想去掉的话，打开对话页时新抓一次包发我。
// - 底部对话/商城/社区三个按钮是 App 原生写死的，脚本删不掉按钮，只能掏空内容。
// - 我的界面：只留管理中心、服务中心、工具（v1 已生效，本版保持）。

var url = $request.url;

function done(obj) {
  if (typeof obj === "string") $done({ body: obj });
  else $done({ body: JSON.stringify(obj) });
}

// 通用掏空：list 置空，dict 里所有 list 型字段置空
function emptyLists(d) {
  if (Array.isArray(d)) return [];
  if (d && typeof d === "object") {
    Object.keys(d).forEach(function (k) {
      if (Array.isArray(d[k])) d[k] = [];
    });
  }
  return d;
}

try {
  var body = $response.body || "";

  // ---- 1. 天气：返回成功但全空，不报“获取失败” ----
  if (url.indexOf("api.ys7.com/v3/weather/") !== -1) {
    done({
      condition: { condition: "", humidity: "", icon: "", temp: "", updatetime: "",
        windDir: "", windLevel: "", tips: "", sunRise: "", sunSet: "", pressure: "" },
      city: { cityId: 0, name: "", enName: "", pyName: null, provinceCn: "", dname: "" },
      meta: { code: 200, message: "操作成功", moreInfo: null }
    });
  }
  // ---- 2. 首页服务专区整卡：增值卡片列表清空 ----
  else if (url.indexOf("api.ys7.com/v3/entrance/vas/service/info") !== -1) {
    var v = JSON.parse(body);
    v.entranceVasServiceList = [];
    done(v);
  }
  // ---- 2b. 云盘 tab：空间信息置空 ----
  else if (url.indexOf("api.ys7.com/v3/clouds/cloudspace/spaceInfo") !== -1) {
    var sp = JSON.parse(body);
    sp.spaceDetailInfo = null;
    done(sp);
  }
  // ---- 2c. 首页服务入口那排（v1 的，保留） ----
  else if (url.indexOf("api.ys7.com/v3/config/service/entrance/component/info") !== -1) {
    var c = JSON.parse(body);
    c.componentInfoList = [];
    done(c);
  }
  // ---- 3. 对话页：系统机器人、家庭会话、消息汇总一并清空 ----
  else if (url.indexOf("api.ys7.com/v3/intelligent-bot/bot/system-bots") !== -1) {
    var sb = JSON.parse(body);
    sb.data = [];
    done(sb);
  }
  else if (url.indexOf("api.ys7.com/v3/terminal/communication/im/chat/page") !== -1) {
    var cp = JSON.parse(body);
    cp.data = [];
    if (cp.page) { cp.page.totalResults = 0; cp.page.hasNext = false; }
    done(cp);
  }
  else if (url.indexOf("api.ys7.com/v3/intelligent-bot/bot/conversation/list") !== -1) {
    var cv = JSON.parse(body);
    if (cv.data) cv.data.conversationList = [];
    done(cv);
  }
  else if (url.indexOf("api.ys7.com/v3/unifiedmsg/summary") !== -1) {
    var us = JSON.parse(body);
    if (Array.isArray(us.cards)) us.cards = [];
    done(us);
  }
  else if (url.indexOf("api.ys7.com/v3/unifiedmsg/list") !== -1) {
    var ul = JSON.parse(body);
    if (Array.isArray(ul.data)) ul.data = [];
    done(ul);
  }
  else if (url.indexOf("api.ys7.com/v3/intelligent-bot/bot/message/unread-msg-count") !== -1) {
    done({ meta: { code: 200, message: "success", moreInfo: {}, success: true },
      data: { count: 0, unreadCount: 0 } });
  }
  // ---- 4. 商城页：瀑布流 tabs 清空；RN 页壳返回空数据 ----
  else if (url.indexOf("m.ys7.com/default/index-waterfall-tab-list") !== -1) {
    var w = JSON.parse(body);
    if (w.data && Array.isArray(w.data.tabs)) w.data.tabs = [];
    done(w);
  }
  else if (url.indexOf("m.ys7.com/default/rn-index") !== -1 && url.indexOf("biz=EzMallIndex") !== -1) {
    done({ code: 200, res: {}, status: true, msg: "", data: {}, error: null, redirect: null });
  }
  // ---- 5. 社区页：精选流、横幅、位置、分类 tab 通用掏空 ----
  else if (url.indexOf("api.ys7.com/v3/videoclips/community/") !== -1) {
    var cm = JSON.parse(body);
    if (cm.data !== undefined) cm.data = emptyLists(cm.data);
    done(cm);
  }
  // ---- 6. 我的界面：只留管理中心、服务中心、工具 ----
  else if (url.indexOf("api.ys7.com/v3/valueadded/operation/config/master/station") !== -1) {
    var st = JSON.parse(body);
    var keep = ["管理中心", "服务中心", "工具"];
    if (st.stationInfo && Array.isArray(st.stationInfo.groupList)) {
      st.stationInfo.groupList = st.stationInfo.groupList.filter(function (g) {
        return keep.indexOf(g.groupName) !== -1;
      });
    }
    done(st);
  }
  else {
    $done({});
  }
} catch (e) {
  $done({});
}
