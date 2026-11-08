(function() {
  try {
    $notification.post("网关脚本已触发", "", "Script invoked, checking args...");
    var args = (typeof $argument !== 'undefined' && $argument) ? $argument : {};
    var hasArgs = (typeof $argument !== 'undefined');
    var GATEWAY = args.gateway || "https://wyy.000135.xyz";
    var TOKEN = args.token || "";
    var NAME = args.name || "";
    if (!TOKEN) {
      $notification.post("网关脚本：口令为空", "", "$argument exists: " + hasArgs + ", token empty, passing through");
      $done({});
      return;
    }
    $notification.post("网关脚本：口令已读到", "", "Token length: " + TOKEN.length + ", calling Worker...");
    function getDeviceId() {
      var id = $persistentStore.read("netease_device_id");
      if (!id) {
        id = "dev-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        $persistentStore.write(id, "netease_device_id");
      }
      return id;
    }
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
      if (!data.ok) {
        $notification.post("网关返回失败", "", "Error: " + (data.error || "unknown"));
        $done({});
        return;
      }
      var body = data.body || "";
      try { body = atob(body); } catch (e) {}
      var headers = data.headers || {};
      delete headers["set-cookie"];
      $notification.post("网关成功", "", "Worker returned full song URL");
      $done({ response: { status: data.status, headers: headers, body: body } });
    }, function(err) {
      $notification.post("网关请求失败", "", "Fetch error: " + (err && err.error ? err.error : String(err)));
      $done({});
    });
  } catch (e) {
    $notification.post("网易云网关脚本错误", "", "Error: " + (e && e.message ? e.message : String(e)));
    $done({});
  }
})();
