(function () {
  var body = ($response || {}).body;
  try {
    var obj = JSON.parse(body);
    if (obj && obj.data) {
      obj.data.type = 99;
      obj.data.isMember = true;
      obj.data.endTime = "2099-12-31 23:59:59";
      obj.data.isBuyFamily = true;
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
