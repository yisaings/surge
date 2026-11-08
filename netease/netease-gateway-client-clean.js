const GATEWAY = $argument.gateway || "https://wyy.000135.xyz";
const TOKEN = $argument.token || "";
const NAME = $argument.name || "";
function getDeviceId() {
  let id = $persistentStore.read("netease_device_id");
  if (!id) {
    id = "dev-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    $persistentStore.write("netease_device_id", id);
  }
  return id;
}
async function main() {
  if (!TOKEN) { $done({}); return; }
  const deviceId = getDeviceId();
  const deviceSecret = $persistentStore.read("netease_device_secret") || "";
  const target = $request.url;
  const method = $request.method || "POST";
  let body = "";
  if ($request.body) {
    body = typeof $request.body === "string" ? $request.body : JSON.stringify($request.body);
  }
  const payload = { token: TOKEN, deviceId: deviceId, deviceSecret: deviceSecret, name: NAME, target: target, method: method, body: body };
  let resp;
  try {
    resp = await $task.fetch({ url: GATEWAY, method: "POST", headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify(payload) });
  } catch (e) {
    $done({});
    return;
  }
  let obj;
  try { obj = JSON.parse(resp.body); } catch { $done({}); return; }
  if (!obj || !obj.ok || !obj.data) { $done({}); return; }
  if (obj.deviceSecret) {
    $persistentStore.write("netease_device_secret", obj.deviceSecret);
  }
  const data = obj.data;
  let outBody = "";
  try {
    const bin = Uint8Array.from(atob(data.body), function (c) { return c.charCodeAt(0); });
    outBody = new TextDecoder("utf-8").decode(bin);
  } catch { outBody = ""; }
  $done({ response: { status: data.status || 200, headers: data.headers || {}, body: outBody } });
}
main();
