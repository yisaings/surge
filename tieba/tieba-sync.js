(function () {
  var res = $response || {};
  var body = res.body;
  function passthrough() { $done({}); }
  if (typeof body !== "string" || !body || body.charAt(0) !== "{") { passthrough(); return; }
  try {
    var obj = JSON.parse(body);
    var changed = false;
    function keepRecommend(arr) {
      var keep = [];
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].tab_name === "推荐" || arr[i].tab_code === "recommend") keep.push(arr[i]);
      }
      return keep;
    }
    if (Array.isArray(obj.index_tab_info)) {
      var ni = keepRecommend(obj.index_tab_info);
      if (ni.length !== obj.index_tab_info.length) { obj.index_tab_info = ni; changed = true; }
    }
    if (Array.isArray(obj.new_index_tab_info)) {
      var nn = keepRecommend(obj.new_index_tab_info);
      if (nn.length !== obj.new_index_tab_info.length) { obj.new_index_tab_info = nn; changed = true; }
    }
    function keepNavi(dict) {
      var keep = {};
      for (var k in dict) {
        if (Object.prototype.hasOwnProperty.call(dict, k)) {
          if (k === "推荐" || k === "侧边栏" || k === "关注") keep[k] = dict[k];
          else changed = true;
        }
      }
      return keep;
    }
    if (obj.top_level_navi && typeof obj.top_level_navi === "object") {
      obj.top_level_navi = keepNavi(obj.top_level_navi);
    }
    if (obj.new_top_level_navi && typeof obj.new_top_level_navi === "object") {
      obj.new_top_level_navi = keepNavi(obj.new_top_level_navi);
    }
    if (changed) { $done({ body: JSON.stringify(obj) }); return; }
    passthrough();
  } catch (e) {
    passthrough();
  }
})();
