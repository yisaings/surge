(function () {
  var res = $response || {};
  var body = res.body;
  function passthrough() { $done({}); }
  if (typeof body !== "string" || !body || body.charAt(0) !== "{") { passthrough(); return; }
  try {
    var obj = JSON.parse(body);
    var changed = false;
    if (Array.isArray(obj.area_data)) {
      var akeep = [];
      for (var i = 0; i < obj.area_data.length; i++) {
        var a = obj.area_data[i];
        var hasShop = false;
        if (a && Array.isArray(a.card_data)) {
          for (var j = 0; j < a.card_data.length; j++) {
            var cd = a.card_data[j];
            if (cd && cd.data && cd.data.shop_info) { hasShop = true; break; }
          }
        }
        var isChat = a && a.area_type === "chat-channel-card";
        if (hasShop || isChat) { changed = true; continue; }
        akeep.push(a);
      }
      obj.area_data = akeep;
    }
    if (obj.card_activity && typeof obj.card_activity === "object") {
      if (Array.isArray(obj.card_activity.small_card) && obj.card_activity.small_card.length > 0) {
        obj.card_activity.small_card = [];
        changed = true;
      }
      if (Array.isArray(obj.card_activity.area_data) && obj.card_activity.area_data.length > 0) {
        obj.card_activity.area_data = [];
        changed = true;
      }
    }
    if (obj.frs_bottom && obj.frs_bottom.frs_chatroom) {
      obj.frs_bottom.frs_chatroom = {};
      changed = true;
    }
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
