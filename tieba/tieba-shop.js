(function () {
  var res = $response || {};
  var body = res.body;
  function passthrough() { $done({}); }
  if (typeof body !== "string" || !body || body.charAt(0) !== "{") { passthrough(); return; }
  try {
    var obj = JSON.parse(body);
    var changed = false;
    function walk(node) {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        for (var i = 0; i < node.length; i++) walk(node[i]);
        return;
      }
      var shop = node.shop_info;
      if (shop && typeof shop === "object" && Array.isArray(shop.goods_list) && shop.goods_list.length > 0) {
        shop.goods_list = [];
        changed = true;
      }
      for (var k in node) {
        if (Object.prototype.hasOwnProperty.call(node, k)) walk(node[k]);
      }
    }
    walk(obj);
    if (changed) {
      $done({ body: JSON.stringify(obj) });
      return;
    }
    passthrough();
  } catch (e) {
    passthrough();
  }
})();
