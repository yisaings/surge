var body = $response.body;
try {
  var o = JSON.parse(body);
  if (o && Array.isArray(o.tab_list)) {
    var KEEP = { follow: 1, recommend: 1, hot: 1 };
    o.tab_list = o.tab_list.filter(function (t) {
      return t && KEEP[t.tab_type];
    });
    body = JSON.stringify(o);
  }
} catch (e) {}
$done({ body: body });
