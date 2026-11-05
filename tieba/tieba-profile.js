(function () {
  var res = $response || {};
  var body = res.body;
  function passthrough() { $done({}); }
  if (typeof body !== "string" || !body || body.charAt(0) !== "{") { passthrough(); return; }
  try {
    var obj = JSON.parse(body);
    var changed = false;
    function dropNames(arr) {
      var keep = [];
      for (var i = 0; i < arr.length; i++) {
        var it = arr[i];
        var nm = it.short_name || it.name || it.title || "";
        if (nm === "去赚贴贝" || nm === "做任务赚贴贝" || nm === "兑换商城" || nm === "印记中心" || nm === "游戏大厅") { changed = true; continue; }
        keep.push(it);
      }
      return keep;
    }
    if (Array.isArray(obj.custom_grid)) {
      var before = obj.custom_grid.length;
      obj.custom_grid = dropNames(obj.custom_grid);
      if (obj.custom_grid.length !== before) changed = true;
    }
    if (Array.isArray(obj.zone_info)) {
      var zkeep = [];
      for (var j = 0; j < obj.zone_info.length; j++) {
        var z = obj.zone_info[j];
        if (z.type === "commerce" || z.type === "game") { changed = true; continue; }
        if (z.type === "common_func" && z.common_func) {
          if (Array.isArray(z.common_func.common_func_other_new)) {
            z.common_func.common_func_other_new = dropNames(z.common_func.common_func_other_new);
          }
          if (Array.isArray(z.common_func.common_func_other)) {
            z.common_func.common_func_other = dropNames(z.common_func.common_func_other);
          }
        }
        zkeep.push(z);
      }
      if (changed) obj.zone_info = zkeep;
    }
    if (obj.finance_tab) { obj.finance_tab = {}; changed = true; }
    if (obj.duxiaoman) { obj.duxiaoman = {}; changed = true; }
    if (obj.duxiaoman_entry) { obj.duxiaoman_entry = {}; changed = true; }
    if (obj.vip_banner) { obj.vip_banner = null; changed = true; }
    if (changed) { $done({ body: JSON.stringify(obj) }); return; }
    passthrough();
  } catch (e) {
    passthrough();
  }
})();
