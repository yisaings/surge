// 什么值得买去红包 v2
// v1 三处（首页红包卡、好价横幅红包卡、详情 preload 京东红包链接）+ v2 新增：
// ① 详情正式接口 /detail/ 的京东红包链接（v1 只拦了 preload，正式接口漏了）；
// ② 好价顶栏图标里的「天天领券」「外卖红包」两个入口；
// ③ 好价「今日好券」领券横幅卡（内含领支付券子项）。
// 其余内容不动：好价其余图标、正常爆料/好价、详情购买链接、标签里的「消灭小红包」话题词均保留。
(function () {
  var url = $request.url;
  try {
    var obj = JSON.parse($response.body);
    if (url.indexOf('/v3/home') !== -1 && obj.data && Array.isArray(obj.data.component)) {
      obj.data.component = obj.data.component.filter(function (c) {
        return c.zz_type !== 'hongbao';
      });
    } else if (url.indexOf('/home/list') !== -1 && obj.data) {
      if (Array.isArray(obj.data.banner_v2)) {
        obj.data.banner_v2 = obj.data.banner_v2.filter(function (b) {
          return !('hongbao' in b);
        });
        obj.data.banner_v2.forEach(function (b) {
          if (Array.isArray(b.rows)) {
            b.rows = b.rows.filter(function (r) {
              return r.title !== '天天领券' && r.title !== '外卖红包';
            });
          }
        });
      }
      if (Array.isArray(obj.data.rows)) {
        obj.data.rows = obj.data.rows.filter(function (r) {
          return r.promotion_name !== '今日好券';
        });
      }
    } else if (url.indexOf('/preload/') !== -1 && obj.data && Array.isArray(obj.data.article_link_list)) {
      obj.data.article_link_list = obj.data.article_link_list.filter(function (l) {
        return l.direct_link_type !== 'hongbao';
      });
    } else if (url.indexOf('/detail/') !== -1 && obj.data && Array.isArray(obj.data.article_link_list)) {
      obj.data.article_link_list = obj.data.article_link_list.filter(function (l) {
        return l.direct_link_type !== 'hongbao';
      });
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
