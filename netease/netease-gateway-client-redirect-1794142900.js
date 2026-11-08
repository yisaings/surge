(function() {
  try {
    var token = '';
    var argName = '';
    if (typeof $argument !== 'undefined' && $argument) {
      if (typeof $argument === 'string') {
        if ($argument.indexOf('TOKEN=') !== -1) {
          var parts = $argument.split('&');
          for (var i = 0; i < parts.length; i++) {
            var kv = parts[i].split('=');
            if (kv[0] === 'TOKEN') token = decodeURIComponent(kv[1] || '');
            if (kv[0] === 'NAME') argName = decodeURIComponent(kv[1] || '');
          }
        } else {
          token = $argument;
        }
      } else if (typeof $argument === 'object') {
        if ($argument.TOKEN) token = String($argument.TOKEN);
        if ($argument.NAME) argName = String($argument.NAME);
      }
    }
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
    var deviceName = argName;
    if (!deviceName) deviceName = $persistentStore.read('NETEASE_DEVICE_NAME') || '';
    if (deviceName) $persistentStore.write(deviceName, 'NETEASE_DEVICE_NAME');
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
