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
    var navList = data.order_cards && data.order_cards.nav_list_card;
    if (navList && Array.isArray(navList.data)) {
      var keepNav = ['dache_anycar', 'carmate', 'driverservice', 'yuancheng', 'pincheche'];
      navList.data = navList.data.filter(function (n) {
        return keepNav.indexOf(n.nav_id) !== -1;
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
  } else if (url.indexOf('/common/v5/usercenter/layout') !== -1) {
    var inst = data.instances || {};
    delete inst['center_marketing_card'];
    delete inst['center_member_card'];
    if (data.layout && Array.isArray(data.layout.order)) {
      var dropOrder = ['center_member_card', 'center_marketing_card', 'enterprise-service-card_center'];
      data.layout.order = data.layout.order.filter(function (x) {
        return dropOrder.indexOf(x) === -1;
      });
    }
    var tool = inst['center_tool_card'];
    if (tool && Array.isArray(tool.data)) {
      var keepTool = ['shoucangjia', 'didizhifu', 'ditufankui'];
      tool.data.forEach(function (group) {
        if (Array.isArray(group.data)) {
          group.data = group.data.filter(function (it) {
            var cd = it.content_data || {};
            return keepTool.indexOf(cd.nav_id) !== -1;
          });
        }
      });
    }
    var wallet = inst['center_wallet_finance_card'];
    if (wallet && wallet.data && Array.isArray(wallet.data.view_info)) {
      wallet.data.view_info = wallet.data.view_info.filter(function (v) {
        return v.title === '优惠卡券' || v.title === '账单月结';
      });
    }
    var widgets = inst['center_widget_list'];
    if (widgets && Array.isArray(widgets.data)) {
      widgets.data.forEach(function (group) {
        if (Array.isArray(group.data)) {
          group.data = group.data.filter(function (it) {
            var cd = it.content_data || {};
            return (cd.link || '').indexOf('safety_shield') !== -1;
          });
        }
      });
    }
  } else if (url.indexOf('/resapi/activity/mget') !== -1) {
    if (data.pas_start_page) {
      data.pas_start_page = [];
    }
    if (data.pas_notice_webview) {
      data.pas_notice_webview = [];
    }
  }

  $done({ body: JSON.stringify(obj) });
}

processDiDi();
