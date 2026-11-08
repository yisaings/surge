(function() {
var GATEWAY = $argument.gateway || "https://wyy.000135.xyz";
var TOKEN = $argument.token || "";
var NAME = $argument.name || "";
function getDeviceId() {
  var id = $persistentStore.read("netease_device_id");
  if (!id) {
    id = "dev-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    $persistentStore.write("netease_device_id", id);
  }
  return id;
}
async function main() {
  if (!TOKEN) { $done({}); return; }
  var deviceId = getDeviceId();
  var deviceSecret = $persistentStore.read("netease_device_secret") || "";
  var target = $request.url;
  var method = $request.method || "POST";
  var body = "";
  if ($request.body) {
    body = typeof $request.body === "string" ? $request.body : JSON.stringify($request.body);
  }
  var payload = { token: TOKEN, deviceId: deviceId, deviceSecret: deviceSecret, name: NAME, target: target, method: method, body: body };
  var resp;
  try {
    resp = await $task.fetch({ url: GATEWAY, method: "POST", headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify(payload) });
  } catch (e) {
    $done({});
    return;
  }
  var obj;
  try { obj = JSON.parse(resp.body); } catch (e) { $done({}); return; }
  if (!obj || !obj.ok || !obj.data) { $done({}); return; }
  if (obj.deviceSecret) {
    $persistentStore.write("netease_device_secret", obj.deviceSecret);
  }
  var data = obj.data;
  var headers = {};
  for (var k in data.headers || {}) headers[k] = data.headers[k];
  delete headers["content-length"];
  delete headers["content-encoding"];
  delete headers["set-cookie"];
  $done({ response: { status: data.status, headers: headers, body: data.body } });
}
main();
})();
