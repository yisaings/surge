(function () {
  var url = ($request || {}).url || "";
  var body = ($response || {}).body;
  try {
    var obj = JSON.parse(body);
    if (obj && obj.data) {
      if (url.indexOf("/api/Member/IsMember") !== -1) {
        obj.data.type = 99;
        obj.data.isMember = true;
        obj.data.endTime = "2099-12-31 23:59:59";
        obj.data.isBuyFamily = true;
      } else if (url.indexOf("/Api/User/GetExtInfo") !== -1) {
        obj.data.memberType = 99;
        obj.data.memberDate = "2099-12-31 23:59:59";
      }
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
