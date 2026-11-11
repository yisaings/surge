var headers = $request.headers || {};
var cookie = headers.Cookie || headers.cookie || '';
var reqBody = $request.body || '';
var reqUrl = $request.url || '';
function formValue(text, name) {
  var re = new RegExp('(?:^|&)' + name + '=([^&]*)');
  var m = text.match(re);
  return m ? decodeURIComponent(m[1]) : null;
}
var isMlpro = reqBody.indexOf('functionId=mlproprice_') !== -1 || reqUrl.indexOf('mlproprice_') !== -1;
var changed = false;
if (isMlpro) {
  var eid = formValue(reqBody, 'x-api-eid-token');
  if (eid) {
    if ($persistentStore.read('JD_EID') !== eid) {
      $persistentStore.write(eid, 'JD_EID');
      changed = true;
    }
  }
  if (cookie) {
    if ($persistentStore.read('JD_FULL_COOKIE') !== cookie) {
      $persistentStore.write(cookie, 'JD_FULL_COOKIE');
      changed = true;
    }
  }
}
if (cookie) {
  var keyMatch = cookie.match(/(?:^|;\s*)pt_key=([^;]+)/);
  var pinMatch = cookie.match(/(?:^|;\s*)pt_pin=([^;]+)/);
  if (keyMatch && pinMatch) {
    var newKey = keyMatch[1].trim();
    var newPin = pinMatch[1].trim();
    if ($persistentStore.read('JD_PT_KEY') !== newKey || $persistentStore.read('JD_PT_PIN') !== newPin) {
      $persistentStore.write(newKey, 'JD_PT_KEY');
      $persistentStore.write(newPin, 'JD_PT_PIN');
      changed = true;
    }
  }
}
if (changed) {
  $notification.post('京东一键价保', '', 'Cookie 已抓取，定时价保已就绪');
}
$done({});
