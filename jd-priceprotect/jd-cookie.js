var headers = $request.headers || {};
var cookie = headers.Cookie || headers.cookie || '';
if (cookie) {
  var keyMatch = cookie.match(/(?:^|;\s*)pt_key=([^;]+)/);
  var pinMatch = cookie.match(/(?:^|;\s*)pt_pin=([^;]+)/);
  if (keyMatch && pinMatch) {
    var newKey = keyMatch[1].trim();
    var newPin = pinMatch[1].trim();
    var oldKey = $persistentStore.read('JD_PT_KEY');
    var oldPin = $persistentStore.read('JD_PT_PIN');
    if (oldKey !== newKey || oldPin !== newPin) {
      $persistentStore.write(newKey, 'JD_PT_KEY');
      $persistentStore.write(newPin, 'JD_PT_PIN');
      $notification.post('京东一键价保', '', 'Cookie 已抓取，定时价保已就绪');
    }
  }
}
$done({});
