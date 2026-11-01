// 萤石云视频 VideoGo 7.9.5 去广告/精简 v3（2026-11-01 17:26 新抓包后修正）
//
// v2 出的问题（新包实证）：
// 1. “我的”页崩成 [ModuleMyRevision]：v2 的 spaceInfo 分支把 spaceInfoDetail 也置空了
//    （indexOf("spaceInfo") 会命中 spaceInfoDetail），而“我的”页很可能读 Detail
//    来渲染云盘相册入口，null 直接把整个“我的” RN 模块拖崩。v1 没动这条时“我的”
//    是好的。v3：Detail 一律原样放行，只动 spaceInfo 汇总（汇总体里
//    spaceDetailInfo 原本就是 null，动它等于没动）。
// 2. 天气：v2 的空白字段照样被 App 判为获取失败，照样显示“天气获取失败，点击重试”。
//    接口层去不掉这块天气条（它是首页顶部原生区域），v3 先把天气恢复原样，
//    不再报难看的失败；彻底去掉要等 homepage/basic 的真实结构。
// 3. 社区顶部图标/横幅/分类 tab 还在：新包证实 community/banner、tab、position
//    三次全是 304（If-None-Match 命中缓存），App 直接用缓存，脚本根本看不到响应体。
//    homepage/basic、商城瀑布流、rn-index 同样全是 304/无请求（商城纯缓存）。
//    v3 加 http-request 规则清掉这几处的 If-None-Match / If-Modified-Since，
//    强制服务器回 200 全量，再由 http-response 掏空。
// 4. homepage/basic 本版不改内容（只清缓存），下次抓包里能看到它的真实结构，
//    到时再看天气条和服务专区外壳（标题栏＋“我的智能服务”）能不能从配置里关掉。
// 5. 仍未定位（两次包里都没有）：对话顶部“数字大脑”横幅（文字不在任何响应体里），
//    以及对话里“我的家庭”那行（chat/page 清空后还在，疑似 IM 本地缓存）。
//    这两处先不动，等缓存清掉后的新包再看。
// 6. 底部对话/商城/社区三个按钮是 App 原生写死的，脚本删不掉按钮，只能掏空内容。
// 7. 我的界面：只留管理中心、服务中心、工具（v1 起已生效，本版保持）。

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
  // ---- http-request 阶段：清掉缓存校验头，强制回 200 全量 ----
  if (typeof $response === "undefined" || !$response || typeof $response.body === "undefined") {
    var hh = $request.headers || {};
    delete hh["If-None-Match"]; delete hh["if-none-match"];
    delete hh["If-Modified-Since"]; delete hh["if-modified-since"];
    $done({ headers: hh });
  } else {

  var body = $response.body || "";

  // ---- 首页服务专区整卡：增值卡片列表清空 ----
  if (url.indexOf("api.ys7.com/v3/entrance/vas/service/info") !== -1) {
    var v = JSON.parse(body);
    v.entranceVasServiceList = [];
    done(v);
  }
  // ---- 云盘汇总：只动 spaceInfo 本体，Detail 原样放行（防“我的”页崩） ----
  else if (url.indexOf("api.ys7.com/v3/clouds/cloudspace/spaceInfo") !== -1) {
    if (url.indexOf("spaceInfoDetail") !== -1) {
      $done({});
    } else {
      var sp = JSON.parse(body);
      sp.spaceDetailInfo = null;
      done(sp);
    }
  }
  // ---- 首页服务入口那排 ----
  else if (url.indexOf("api.ys7.com/v3/config/service/entrance/component/info") !== -1) {
    var c = JSON.parse(body);
    c.componentInfoList = [];
    done(c);
  }
  // ---- 对话页：系统机器人、家庭会话、消息汇总一并清空 ----
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
  // ---- 商城页：瀑布流 tabs 清空；RN 页壳返回空数据 ----
  else if (url.indexOf("m.ys7.com/default/index-waterfall-tab-list") !== -1) {
    var w = JSON.parse(body);
    if (w.data && Array.isArray(w.data.tabs)) w.data.tabs = [];
    done(w);
  }
  else if (url.indexOf("m.ys7.com/default/rn-index") !== -1 && url.indexOf("biz=EzMallIndex") !== -1) {
    done({ code: 200, res: {}, status: true, msg: "", data: {}, error: null, redirect: null });
  }
  // ---- 社区页：精选流、横幅、位置、分类 tab 通用掏空 ----
  else if (url.indexOf("api.ys7.com/v3/videoclips/community/") !== -1) {
    var cm = JSON.parse(body);
    if (cm.data !== undefined) cm.data = emptyLists(cm.data);
    done(cm);
  }
  // ---- 我的界面：只留管理中心、服务中心、工具 ----
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
  } // end else: http-response phase
} catch (e) {
  $done({});
}
