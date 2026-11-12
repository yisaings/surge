var headers = $request.headers || {};
var cookie = headers.Cookie || headers.cookie || '';
var reqBody = $request.body || '';
var reqUrl = $request.url || '';
function formValue(text, name) {
  var re = new RegExp('(?:^|&)' + name + '=([^&]*)');
  var m = text.match(re);
  return m ? decodeURIComponent(m[1]) : null;
}
var changedKeys = [];
function storeIfChanged(key, val) {
  if (!val) return false;
  if ($persistentStore.read(key) !== val) {
    $persistentStore.write(val, key);
    changedKeys.push(key);
    return true;
  }
  return false;
}
var isMlpro = reqBody.indexOf('functionId=mlproprice_') !== -1 || reqUrl.indexOf('mlproprice_') !== -1;
if (isMlpro) {
  var eid = formValue(reqBody, 'x-api-eid-token');
  if (eid) storeIfChanged('JD_EID', eid);
  if (cookie) storeIfChanged('JD_FULL_COOKIE', cookie);
}
if (cookie) {
  var keyMatch = cookie.match(/(?:^|;\s*)pt_key=([^;]+)/);
  var pinMatch = cookie.match(/(?:^|;\s*)pt_pin=([^;]+)/);
  if (keyMatch && pinMatch) {
    storeIfChanged('JD_PT_KEY', keyMatch[1].trim());
    storeIfChanged('JD_PT_PIN', pinMatch[1].trim());
  }
}
var uaHdr = headers['User-Agent'] || headers['user-agent'] || '';
if (typeof console !== 'undefined' && console.log) {
  var hdrNames = Object.keys(headers || {});
  console.log('[京东凭证] UA头存在:' + (uaHdr ? '是' : '否') + ' 头数量:' + hdrNames.length + ' 有ep:' + (uaHdr.indexOf('ep=') !== -1 ? '是' : '否'));
}
if (uaHdr) {
  var epM = uaHdr.match(/(?:^|;)ep=([^;]+)/);
  if (epM && epM[1]) storeIfChanged('JD_EP', epM[1]);
}
var isApiM = reqUrl.indexOf('api.m.jd.com') !== -1;
if (isApiM) {
  var beanEid = formValue(reqBody, 'x-api-eid-token');
  if (beanEid) storeIfChanged('JD_BEAN_EID', beanEid);
  var devEid = formValue(reqBody, 'eid');
  if (devEid && devEid.length === 90) storeIfChanged('JD_DEVICE_EID', devEid);
  var oudid = formValue(reqBody, 'openudid') || formValue(reqBody, 'uuid');
  if (oudid && oudid.length === 40) storeIfChanged('JD_OPENUDID', oudid);
  var wgTok = formValue(reqBody, 'wg-sdk-token');
  if (wgTok) storeIfChanged('JD_WG_TOKEN', wgTok);
  var areaV = formValue(reqBody, 'area');
  if (!areaV) {
    var areaM = reqUrl.match(/[?&]area=([^&]+)/);
    if (areaM) areaV = decodeURIComponent(areaM[1]);
  }
  if (areaV) storeIfChanged('JD_AREA', areaV);
  var bodyRaw = formValue(reqBody, 'body');
  if (bodyRaw) {
    try {
      var bodyObj = JSON.parse(bodyRaw);
      if (bodyObj.lng !== undefined && bodyObj.lat !== undefined) {
        storeIfChanged('JD_LNG', String(bodyObj.lng));
        storeIfChanged('JD_LAT', String(bodyObj.lat));
      }
      if (bodyObj.gcLat !== undefined && bodyObj.gcLng !== undefined) {
        storeIfChanged('JD_GCLAT', String(bodyObj.gcLat));
        storeIfChanged('JD_GCLNG', String(bodyObj.gcLng));
      }
      if (bodyObj.lbsParamMap) {
        storeIfChanged('JD_LBS', JSON.stringify(bodyObj.lbsParamMap));
      }
    } catch (e) {}
  }
}
if (changedKeys.length > 0 && typeof console !== 'undefined' && console.log) {
  console.log('[京东凭证] 已更新：' + changedKeys.join('、'));
}
$done({});
