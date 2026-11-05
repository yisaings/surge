(function () {
  var u = ($request && $request.url) || "";
  var body = "{}";
  if (u.indexOf("get_ads") !== -1) { body = "{\"status_code\":20001,\"reason\":218,\"desc\":\"\"}"; }
  $done({ response: { status: 200, headers: { "Content-Type": "application/json" }, body: body } });
})();
