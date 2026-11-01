// 萤石云视频 VideoGo 7.9.5 去广告/精简
// 抓包：2026-11-01-163315.har（227 条），App：VideoGo/7.9.5
//
// 改动：
// 1. 首页顶部天气：weather/live、weather/alarm 返回失败码，天气条不渲染
// 2. 首页服务专区：config/service/entrance/component/info 的 componentInfoList 清空
//    （视频通话/音乐/广播/对讲/录制/抓拍/留言那排入口都没了）
// 3. 首页云盘：entrance/vas/service/info 里 serviceMainTitle 为“云存储”的卡片删掉，
//    其余增值卡片不动；clouds/spaceInfo 不动（我的·管理中心里的云盘相册还用它）
// 4. 底部标签：对话/商城/社区三个按钮是 App 原生写死的，抓包里没有控制它们的
//    服务端配置接口，脚本删不掉按钮，只能把点进去的内容掏空：
//    对话 -> intelligent-bot 会话列表清空；社区 -> videoclips featured 清空；
//    商城 -> m.ys7.com rn-index（EzMallIndex）返回空数据
// 5. 我的界面：valueadded master/station 只留管理中心、服务中心、工具三组，
//    增值服务、应用市场、安全中心三组删掉
// 注意：萤石 App 如有证书固定（SSL Pinning），MITM 可能不生效，装完完全没变化就说明是这问题。

var url = $request.url;

function done(obj) {
  if (typeof obj === "string") $done({ body: obj });
  else $done({ body: JSON.stringify(obj) });
}

try {
  var body = $response.body || "";

  // ---- 1. 天气 ----
  if (url.indexOf("api.ys7.com/v3/weather/") !== -1) {
    done({ meta: { code: 500, message: "" }, condition: null, city: null });
  }
  // ---- 2. 首页服务专区 ----
  else if (url.indexOf("api.ys7.com/v3/config/service/entrance/component/info") !== -1) {
    var c = JSON.parse(body);
    c.componentInfoList = [];
    done(c);
  }
  // ---- 3. 首页云存储卡片 ----
  else if (url.indexOf("api.ys7.com/v3/entrance/vas/service/info") !== -1) {
    var v = JSON.parse(body);
    if (Array.isArray(v.entranceVasServiceList)) {
      v.entranceVasServiceList = v.entranceVasServiceList.filter(function (s) {
        return s.serviceMainTitle !== "云存储";
      });
    }
    done(v);
  }
  // ---- 4a. 对话：会话列表清空 ----
  else if (url.indexOf("api.ys7.com/v3/intelligent-bot/bot/conversation/list") !== -1) {
    var cv = JSON.parse(body);
    if (cv.data) cv.data.conversationList = [];
    done(cv);
  }
  // ---- 4b. 社区：精选流清空、频道 tab 清空 ----
  else if (url.indexOf("api.ys7.com/v3/videoclips/community/featured") !== -1) {
    var f = JSON.parse(body);
    if (Array.isArray(f.data)) f.data = [];
    done(f);
  }
  else if (url.indexOf("api.ys7.com/v3/videoclips/community/tab") !== -1) {
    var t = JSON.parse(body);
    if (Array.isArray(t.data)) t.data = [];
    else if (t.data && Array.isArray(t.data.tabs)) t.data.tabs = [];
    done(t);
  }
  // ---- 4c. 商城：RN 商城页返回空数据 ----
  else if (url.indexOf("m.ys7.com/default/rn-index") !== -1 && url.indexOf("biz=EzMallIndex") !== -1) {
    done({ code: 200, res: {}, status: true, msg: "", data: {}, error: null, redirect: null });
  }
  // ---- 5. 我的界面：只留管理中心、服务中心、工具 ----
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
