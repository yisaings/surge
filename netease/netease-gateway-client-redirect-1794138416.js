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
    var url = $request.url;
    var headers = $request.headers;
    var workerHost = 'wyy.000135.xyz';
    var newUrl = url.replace(/^https?:\/\/[^\/]+/, 'https://' + workerHost);
    headers['Host'] = workerHost;
    delete headers['host'];
    headers['X-Auth-Token'] = token;
    $done({ url: newUrl, headers: headers });
  } catch (e) {
    $notification.post('网易云网关脚本错误', '', 'Error: ' + (e && e.message ? e.message : String(e)));
    $done({});
  }
})();
