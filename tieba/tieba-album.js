(function () {
  var res = $response || {};
  var body = res.body;
  function passthrough() { $done({}); }
  if (typeof body !== "string" || !body || body.charAt(0) !== "{") { passthrough(); return; }
  try {
    var obj = JSON.parse(body);
    if (Array.isArray(obj.forum_album) && obj.forum_album.length > 0) {
      obj.forum_album = [];
      $done({ body: JSON.stringify(obj) });
      return;
    }
    passthrough();
  } catch (e) {
    passthrough();
  }
})();
