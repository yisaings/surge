// 什么值得买去红包 v1
// 首页天天领红包卡、好价横幅红包卡、详情页京东红包链接三处过滤，其余内容不动。
(function () {
  var url = $request.url;
  try {
    var obj = JSON.parse($response.body);
    if (url.indexOf('/v3/home') !== -1 && obj.data && Array.isArray(obj.data.component)) {
      obj.data.component = obj.data.component.filter(function (c) {
        return c.zz_type !== 'hongbao';
      });
    } else if (url.indexOf('/home/list') !== -1 && obj.data && Array.isArray(obj.data.banner_v2)) {
      obj.data.banner_v2 = obj.data.banner_v2.filter(function (b) {
        return !('hongbao' in b);
      });
    } else if (url.indexOf('/preload/') !== -1 && obj.data && Array.isArray(obj.data.article_link_list)) {
      obj.data.article_link_list = obj.data.article_link_list.filter(function (l) {
        return l.direct_link_type !== 'hongbao';
      });
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
