(function() {
  try {
    var args = (typeof $argument !== 'undefined' && $argument) ? $argument : {};
    var GATEWAY = args.gateway || "https://wyy.000135.xyz";
    var TOKEN = args.token || "";
    var NAME = args.name || "";
    function getDeviceId() {
      var id = $persistentStore.read("netease_device_id");
      if (!id) {
        id = "dev-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        $persistentStore.write(id, "netease_device_id");
      }
      return id;
    }
    function main() {
      if (!TOKEN) { $done({}); return; }
      var deviceId = getDeviceId();
      var deviceSecret = $persistentStore.read("netease_device_secret") || "";
      $task.fetch({
        url: GATEWAY,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: TOKEN, deviceId: deviceId, deviceSecret: deviceSecret, name: NAME, target: $request.url, method: $request.method || "POST", body: $request.body || "" })
      }).then(function(resp) {
        var data = JSON.parse(resp.body);
        if (data.deviceSecret) { $persistentStore.write(data.deviceSecret, "netease_device_secret"); }
        if (!data.ok) { $done({}); return; }
        var body = data.body || "";
        try { body = atob(body); } catch (e) {}
        var headers = data.headers || {};
        delete headers["set-cookie"];
        $done({ response: { status: data.status, headers: headers, body: body } });
      }, function(err) {
        $done({});
      });
    }
    main();
  } catch (e) {
    $notification.post("网易云网关脚本错误", "", "Error: " + (e && e.message ? e.message : String(e)));
    $done({});
  }
})();
