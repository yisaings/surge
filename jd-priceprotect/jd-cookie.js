var headers = $request.headers || {};
var cookie = headers.Cookie || headers.cookie || '';
var reqBody = $request.body || '';
var reqUrl = $request.url || '';
function formValue(text, name) {
  var re = new RegExp('(?:^|&)' + name + '=([^&]*)');
  var m = text.match(re);
  return m ? decodeURIComponent(m[1]) : null;
}
function storeIfChanged(key, val) {
  if (!val) return false;
  if ($persistentStore.read(key) !== val) {
    $persistentStore.write(val, key);
    return true;
  }
  return false;
}
var isMlpro = reqBody.indexOf('functionId=mlproprice_') !== -1 || reqUrl.indexOf('mlproprice_') !== -1;
var changed = false;
if (isMlpro) {
  var eid = formValue(reqBody, 'x-api-eid-token');
  if (eid) changed = storeIfChanged('JD_EID', eid) || changed;
  if (cookie) changed = storeIfChanged('JD_FULL_COOKIE', cookie) || changed;
}
if (cookie) {
  var keyMatch = cookie.match(/(?:^|;\s*)pt_key=([^;]+)/);
  var pinMatch = cookie.match(/(?:^|;\s*)pt_pin=([^;]+)/);
  if (keyMatch && pinMatch) {
    var newKey = keyMatch[1].trim();
    var newPin = pinMatch[1].trim();
    changed = storeIfChanged('JD_PT_KEY', newKey) || changed;
    changed = storeIfChanged('JD_PT_PIN', newPin) || changed;
  }
}
var isApiM = reqUrl.indexOf('api.m.jd.com') !== -1;
if (isApiM) {
  var beanEid = formValue(reqBody, 'x-api-eid-token');
  if (beanEid) changed = storeIfChanged('JD_BEAN_EID', beanEid) || changed;
  var devEid = formValue(reqBody, 'eid');
  if (devEid && devEid.length >= 60) changed = storeIfChanged('JD_DEVICE_EID', devEid) || changed;
  var oudid = formValue(reqBody, 'openudid') || formValue(reqBody, 'uuid');
  if (oudid && oudid.length >= 32) changed = storeIfChanged('JD_OPENUDID', oudid) || changed;
  var wgTok = formValue(reqBody, 'wg-sdk-token');
  if (wgTok) changed = storeIfChanged('JD_WG_TOKEN', wgTok) || changed;
  var areaV = formValue(reqBody, 'area');
  if (!areaV) {
    var areaM = reqUrl.match(/[?&]area=([^&]+)/);
    if (areaM) areaV = decodeURIComponent(areaM[1]);
  }
  if (areaV) changed = storeIfChanged('JD_AREA', areaV) || changed;
  var bodyRaw = formValue(reqBody, 'body');
  if (bodyRaw) {
    try {
      var bodyObj = JSON.parse(bodyRaw);
      if (bodyObj.lng !== undefined && bodyObj.lat !== undefined) {
        changed = storeIfChanged('JD_LNG', String(bodyObj.lng)) || changed;
        changed = storeIfChanged('JD_LAT', String(bodyObj.lat)) || changed;
      }
      if (bodyObj.gcLat !== undefined && bodyObj.gcLng !== undefined) {
        changed = storeIfChanged('JD_GCLAT', String(bodyObj.gcLat)) || changed;
        changed = storeIfChanged('JD_GCLNG', String(bodyObj.gcLng)) || changed;
      }
      if (bodyObj.lbsParamMap) {
        changed = storeIfChanged('JD_LBS', JSON.stringify(bodyObj.lbsParamMap)) || changed;
      }
    } catch (e) {}
  }
}
if (changed) {
  var lastNotify = parseInt($persistentStore.read('JD_NOTIFY_TS') || '0', 10) || 0;
  if (Date.now() - lastNotify > 3600000) {
    $persistentStore.write(String(Date.now()), 'JD_NOTIFY_TS');
    $notification.post('京东一键价保', '', '京东凭证已抓取，定时价保与签到已就绪');
  }
}
$done({});
