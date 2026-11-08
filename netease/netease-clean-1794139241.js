(function() {
  try {
    var body = $response.body;
    if (!body) { $done({}); return; }
    var obj;
    try { obj = JSON.parse(body); } catch (e) { $done({}); return; }
    if (obj && obj.data) {
      if (Array.isArray(obj.data)) { obj.data = []; }
      else if (typeof obj.data === 'object') {
        if (obj.data.blocks) obj.data.blocks = [];
        if (obj.data.tabs) obj.data.tabs = [];
        if (obj.data.banner) obj.data.banner = [];
        if (obj.data.recommend) obj.data.recommend = [];
      }
    }
    if (obj && obj.result) {
      if (Array.isArray(obj.result)) { obj.result = []; }
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
