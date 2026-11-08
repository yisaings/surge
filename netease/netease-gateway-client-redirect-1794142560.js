(function() {
  try {
    var token = (typeof $argument !== 'undefined' && $argument) ? String($argument) : '';
    if (!token) {
      token = $persistentStore.read('NETEASE_VIP_TOKEN') || '';
    }
    if (!token) {
      $notification.post('网易云 VIP 模块', '未配置口令', '请在模块参数中填入专属口令');
      $done({});
      return;
    }
    var deviceId = $persistentStore.read('netease_device_id');
    if (!deviceId) {
      deviceId = 'dev-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      $persistentStore.write(deviceId, 'netease_device_id');
    }
    var deviceSecret = $persistentStore.read('netease_device_secret');
    if (!deviceSecret) {
      deviceSecret = Math.random().toString(36).slice(2, 18) + Math.random().toString(36).slice(2, 18);
      $persistentStore.write(deviceSecret, 'netease_device_secret');
    }
    var deviceName = (typeof $argument !== 'undefined' && $argument && $argument.NAME) ? String($argument.NAME) : '';
    if (!deviceName) deviceName = $persistentStore.read('NETEASE_DEVICE_NAME') || '';
    if (!deviceName) deviceName = 'test';
    $persistentStore.write(deviceName, 'NETEASE_DEVICE_NAME');
    var url = $request.url;
    var headers = $request.headers;
    var workerHost = 'wyy.000135.xyz';
    var newUrl = url.replace(/^https?:\/\/[^\/]+/, 'https://' + workerHost);
    headers['Host'] = workerHost;
    delete headers['host'];
    headers['X-Auth-Token'] = token;
    headers['X-Device-Id'] = deviceId;
    headers['X-Device-Secret'] = deviceSecret;
    headers['X-Device-Name'] = deviceName;
    $done({ url: newUrl, headers: headers });
  } catch (e) {
    $notification.post('网易云网关脚本错误', '', 'Error: ' + (e && e.message ? e.message : String(e)));
    $done({});
  }
})();
