
var url = $request.url;

function done(obj) {
  if (typeof obj === "string") $done({ body: obj });
  else $done({ body: JSON.stringify(obj) });
}

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
  if (typeof $response === "undefined" || !$response || typeof $response.body === "undefined") {
    var hh = $request.headers || {};
    delete hh["If-None-Match"]; delete hh["if-none-match"];
    delete hh["If-Modified-Since"]; delete hh["if-modified-since"];
    $done({ headers: hh });
  } else {

  var body = $response.body || "";

  if (url.indexOf("api.ys7.com/v3/entrance/vas/service/info") !== -1) {
    var v = JSON.parse(body);
    v.entranceVasServiceList = [];
    done(v);
  }
  else if (url.indexOf("api.ys7.com/v3/clouds/cloudspace/spaceInfo") !== -1) {
    if (url.indexOf("spaceInfoDetail") !== -1) {
      $done({});
    } else {
      var sp = JSON.parse(body);
      sp.spaceDetailInfo = null;
      done(sp);
    }
  }
  else if (url.indexOf("api.ys7.com/v3/config/service/entrance/component/info") !== -1) {
    var c = JSON.parse(body);
    c.componentInfoList = [];
    done(c);
  }
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
  else if (url.indexOf("api.ys7.com/api/ads/v2") !== -1) {
    var ad = JSON.parse(body);
    if (Array.isArray(ad.ad)) {
      ad.ad = [];
      done(ad);
    } else {
      $done({});
    }
  }
  else if (url.indexOf("api.ys7.com/v3/intelligent-bot/bot/message/unread-msg-count") !== -1) {
    done({ meta: { code: 200, message: "success", moreInfo: {}, success: true },
      data: { count: 0, unreadCount: 0 } });
  }
  else if (url.indexOf("m.ys7.com/default/index-waterfall-tab-list") !== -1) {
    var w = JSON.parse(body);
    if (w.data && Array.isArray(w.data.tabs)) w.data.tabs = [];
    done(w);
  }
  else if (url.indexOf("m.ys7.com/default/rn-index") !== -1 && url.indexOf("biz=EzMallIndex") !== -1) {
    done({ code: 200, res: {}, status: true, msg: "", data: {}, error: null, redirect: null });
  }
  else if (url.indexOf("api.ys7.com/v3/videoclips/community/") !== -1) {
    var cm = JSON.parse(body);
    if (cm.data !== undefined) cm.data = emptyLists(cm.data);
    done(cm);
  }
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
