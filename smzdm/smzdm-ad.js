(function () {
  var url = $request.url;
  try {
    var obj = JSON.parse($response.body);
    if (url.indexOf('/v3/home') !== -1 && obj.data && Array.isArray(obj.data.component)) {
      obj.data.component = obj.data.component.filter(function (c) {
        return c.zz_type !== 'hongbao' && c.zz_type !== 'banner' && c.zz_type !== 'yixing_banner';
      });
    } else if (url.indexOf('/home/list') !== -1 && obj.data) {
      if (Array.isArray(obj.data.banner_v2)) {
        obj.data.banner_v2 = obj.data.banner_v2.filter(function (b) {
          return !('hongbao' in b) && String(b.cell_type) !== '23003';
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
          return r.promotion_name !== '今日好券' && r.promotion_name !== '占位样式';
        });
      }
    } else if (url.indexOf('/preload/') !== -1 && obj.data && Array.isArray(obj.data.article_link_list)) {
      obj.data.article_link_list = obj.data.article_link_list.filter(function (l) {
        return (l.direct_link_type || '').indexOf('hongbao') !== 0;
      });
    } else if (url.indexOf('detail_modul/user_related_modul') !== -1 && obj.data) {
      delete obj.data.super_coupon;
    } else if (url.indexOf('/detail/') !== -1 && obj.data && Array.isArray(obj.data.article_link_list)) {
      obj.data.article_link_list = obj.data.article_link_list.filter(function (l) {
        return (l.direct_link_type || '').indexOf('hongbao') !== 0;
      });
    } else if (url.indexOf('user-api.smzdm.com/vip') !== -1 && obj.data) {
      obj.data.featured_activitys = [];
      obj.data.big_banner = [];
    } else if (url.indexOf('app-api.smzdm.com/util/loading') !== -1 && Array.isArray(obj.data)) {
      obj.data = obj.data.filter(function (it) {
        return it.is_show_ad !== '1';
      });
    } else if (url.indexOf('/sou/filter/tags/hot_tags') !== -1 && obj.data) {
      obj.data.hongbao = null;
    } else if (url.indexOf('/util/update') !== -1 && obj.data) {
      obj.data.widget = [];
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
