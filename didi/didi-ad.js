// 滴滴出行精简 v1：只留打车
// core：顶部导航只留 出行（chu_xing，打车 tab），打车输入框 main_card 与底部 tab 不动
// fast：删日常运营活动卡、公交乘车码、扫一扫；删营销轮播、超级横幅、车主招募挂件、猜你喜欢
// slow：删领券横幅；叫车卡与进行中订单不动
function processDiDi() {
  var url = $request.url;
  var obj;
  try {
    obj = JSON.parse($response.body);
  } catch (e) {
    return $done({});
  }
  if (!obj || !obj.data) return $done({});

  var data = obj.data;
  if (url.indexOf('/homepage/v1/core') !== -1) {
    var nav = data.disorder_cards && data.disorder_cards.top_nav_list;
    if (nav && nav.data && Array.isArray(nav.data.top_nav_info)) {
      nav.data.top_nav_info = nav.data.top_nav_info.filter(function (n) {
        return n.nav_id === 'chu_xing';
      });
    }
  } else if (url.indexOf('/homepage/v1/other/fast') !== -1) {
    var dc = data.disorder_cards || {};
    var oc = data.order_cards || {};
    ['communicate_card', 'riding_code_card', 'scan_card'].forEach(function (k) { delete dc[k]; });
    ['marketing_card', 'super_banner_card', 'car_owner_widget_card', 'guess_card'].forEach(function (k) {
      delete oc[k];
      delete dc[k];
    });
  } else if (url.indexOf('/homepage/v1/other/slow') !== -1) {
    var oc2 = data.order_cards || {};
    delete oc2['new_loss_banner_card'];
  }

  $done({ body: JSON.stringify(obj) });
}

processDiDi();
