// 渝畅行精简 v1
// 首页菜单只留乘车本质；广告与首页动态流清空；日志上报不碰业务
var KEEP_HOME_MENU = ['行程规划', '列车到站', '拥堵情况', '首末班时间', '站点信息', '快车时刻表', '进站预约'];
var url = $request.url;
var body = $response.body;
try {
  var obj = JSON.parse(body);
  if (url.indexOf('/bas/appmgt/v3/app-menus') !== -1) {
    // 只动首页，其他页（乘车码页、计期票页、我的页）原样放行
    if (obj.result && obj.result.page_code === 'BWTHomePage') {
      (obj.result.menu_groups || []).forEach(function (g) {
        if (g.style_code === '4' && g.menu_items) {
          g.menu_items = g.menu_items.filter(function (it) {
            return KEEP_HOME_MENU.indexOf(it.item_name) !== -1;
          });
        }
      });
      body = JSON.stringify(obj);
    }
  } else if (url.indexOf('/bas/ad/v1/advertisement/getAds') !== -1) {
    if (obj.result) obj.result = [];
    body = JSON.stringify(obj);
  } else if (url.indexOf('/bas/tweets/v1/posts/home_list') !== -1) {
    if (obj.result) obj.result = [];
    body = JSON.stringify(obj);
  }
} catch (e) {}
$done({ body: body });
