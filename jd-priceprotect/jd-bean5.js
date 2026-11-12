var _g = (typeof globalThis !== 'undefined') ? globalThis : this;
_g.window = _g;
_g.self = _g;
_g.globalThis = _g;
_g.localStorage = {
  getItem: function(k) {
    var v = $persistentStore.read('JD_H5ST_' + k);
    if (v === null || v === undefined || v === '') { return null; }
    return v;
  },
  setItem: function(k, v) { $persistentStore.write(String(v), 'JD_H5ST_' + k); },
  removeItem: function(k) { $persistentStore.write('', 'JD_H5ST_' + k); }
};
_g.sessionStorage = _g.localStorage;
_g.navigator = {
  userAgent: 'jdapp;iPhone;16.1.81;;;M/5.0;appBuild/171195;jdSupportDarkMode/0;lang/zh_CN;ctype/0;site/CN;ccy/CNY;elder/0;ef/1;Mozilla/5.0 (iPhone; CPU iPhone OS 27_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
  platform: 'iPhone',
  appVersion: '5.0 (iPhone; CPU iPhone OS 27_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  vendor: 'Apple Computer, Inc.',
  language: 'zh-CN',
  languages: ['zh-CN', 'zh'],
  onLine: true,
  hardwareConcurrency: 6,
  deviceMemory: 4,
  maxTouchPoints: 5,
  webdriver: false,
  plugins: [],
  mimeTypes: [],
  cookieEnabled: true,
  doNotTrack: null,
  getBattery: undefined
};

function __makeEl() {
  return {
    style: {},
    setAttribute: function() {},
    getAttribute: function() { return null; },
    appendChild: function(c) { return c; },
    removeChild: function(c) { return c; },
    addEventListener: function() {},
    removeEventListener: function() {},
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; },
    getContext: function() { return null; },
    toDataURL: function() { return ''; },
    getBoundingClientRect: function() { return { width: 0, height: 0, top: 0, left: 0 }; },
    width: 0,
    height: 0,
    textContent: '',
    innerHTML: ''
  };
}
_g.document = {
  documentElement: __makeEl(),
  head: __makeEl(),
  body: __makeEl(),
  title: '',
  referrer: '',
  cookie: '',
  readyState: 'complete',
  createElement: function() { return __makeEl(); },
  createTextNode: function(t) { return { data: t, nodeValue: t }; },
  querySelector: function() { return null; },
  querySelectorAll: function() { return []; },
  getElementsByTagName: function() { return []; },
  getElementById: function() { return null; },
  addEventListener: function() {},
  removeEventListener: function() {},
  hasFocus: function() { return true; },
  visibilityState: 'visible',
  hidden: false
};

_g.location = {
  href: 'https://h5.m.jd.com/babelDiy/Zeus/2RePMzTqg6UoffvMwtwVeMcnPGeg/index.html',
  protocol: 'https:',
  host: 'h5.m.jd.com',
  hostname: 'h5.m.jd.com',
  pathname: '/babelDiy/Zeus/2RePMzTqg6UoffvMwtwVeMcnPGeg/index.html',
  search: '',
  hash: '',
  origin: 'https://h5.m.jd.com',
  reload: function() {},
  replace: function() {},
  assign: function() {}
};
_g.screen = { width: 390, height: 844, availWidth: 390, availHeight: 844, colorDepth: 32, pixelDepth: 32 };
_g.innerWidth = 390;
_g.innerHeight = 844;
_g.devicePixelRatio = 3;
_g.fetch = undefined;
function __StubXHR() {
  this.readyState = 0;
  this.status = 0;
  this.responseText = '';
  this.response = '';
}
__StubXHR.prototype.open = function() {};
__StubXHR.prototype.setRequestHeader = function() {};
__StubXHR.prototype.getResponseHeader = function() { return null; };
__StubXHR.prototype.getAllResponseHeaders = function() { return ''; };
__StubXHR.prototype.addEventListener = function() {};
__StubXHR.prototype.abort = function() {};
__StubXHR.prototype.send = function() {
  var self = this;
  setTimeout(function() {
    self.readyState = 4;
    self.status = 0;
    if (self.onerror) { self.onerror(new Error('offline')); }
    if (self.onreadystatechange) { self.onreadystatechange(); }
  }, 5);
};
_g.XMLHttpRequest = __StubXHR;
_g.ActiveXObject = undefined;
if (typeof crypto === 'undefined') {
  _g.crypto = {
    getRandomValues: function(arr) {
      for (var i = 0; i < arr.length; i++) { arr[i] = Math.floor(Math.random() * 256); }
      return arr;
    }
  };
}
if (typeof performance === 'undefined') {
  _g.performance = { now: function() { return Date.now(); } };
}
if (typeof atob === 'undefined') {
  _g.atob = function(s) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var out = '';
    var i = 0;
    s = String(s).replace(/[^A-Za-z0-9\+\/\=]/g, '');
    while (i < s.length) {
      var e1 = chars.indexOf(s.charAt(i++));
      var e2 = chars.indexOf(s.charAt(i++));
      var e3 = chars.indexOf(s.charAt(i++));
      var e4 = chars.indexOf(s.charAt(i++));
      var c1 = (e1 << 2) | (e2 >> 4);
      var c2 = ((e2 & 15) << 4) | (e3 >> 2);
      var c3 = ((e3 & 3) << 6) | e4;
      out += String.fromCharCode(c1);
      if (e3 !== 64) { out += String.fromCharCode(c2); }
      if (e4 !== 64) { out += String.fromCharCode(c3); }
    }
    return out;
  };
  _g.btoa = function(s) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var out = '';
    var i = 0;
    s = String(s);
    while (i < s.length) {
      var c1 = s.charCodeAt(i++) & 255;
      var c2 = i < s.length ? s.charCodeAt(i++) & 255 : NaN;
      var c3 = i < s.length ? s.charCodeAt(i++) & 255 : NaN;
      var e1 = c1 >> 2;
      var e2 = ((c1 & 3) << 4) | (c2 >> 4);
      var e3 = ((c2 & 15) << 2) | (c3 >> 6);
      var e4 = c3 & 63;
      if (isNaN(c2)) { e3 = 64; e4 = 64; } else if (isNaN(c3)) { e4 = 64; }
      out += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
    }
    return out;
  };
}
if (typeof requestAnimationFrame === 'undefined') {
  _g.requestAnimationFrame = function(cb) { return setTimeout(cb, 16); };
}
if (typeof cancelAnimationFrame === 'undefined') {
  _g.cancelAnimationFrame = function(id) { clearTimeout(id); };
}
if (typeof getComputedStyle === 'undefined') {
  _g.getComputedStyle = function() { return { getPropertyValue: function() { return ''; } }; };
}
if (typeof addEventListener === 'undefined') {
  _g.addEventListener = function() {};
}
if (typeof matchMedia === 'undefined') {
  _g.matchMedia = function() { return { matches: false, addListener: function() {}, removeListener: function() {} }; };
}
if (typeof Element === 'undefined') {
  _g.Element = function Element() {};
}
if (typeof HTMLElement === 'undefined') {
  _g.HTMLElement = function HTMLElement() {};
}
if (typeof Node === 'undefined') {
  _g.Node = function Node() {};
}
function SHA256(s){var chrsz=8;var hexcase=0;function safe_add(x,y){var lsw=(x&0xFFFF)+(y&0xFFFF);var msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xFFFF)}function S(X,n){return(X>>>n)|(X<<(32-n))}function R(X,n){return(X>>>n)}function Ch(x,y,z){return((x&y)^((~x)&z))}function Maj(x,y,z){return((x&y)^(x&z)^(y&z))}function Sigma0256(x){return(S(x,2)^S(x,13)^S(x,22))}function Sigma1256(x){return(S(x,6)^S(x,11)^S(x,25))}function Gamma0256(x){return(S(x,7)^S(x,18)^R(x,3))}function Gamma1256(x){return(S(x,17)^S(x,19)^R(x,10))}function core_sha256(m,l){var K=new Array(0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0xFC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x6CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2);var HASH=new Array(0x6A09E667,0xBB67AE85,0x3C6EF372,0xA54FF53A,0x510E527F,0x9B05688C,0x1F83D9AB,0x5BE0CD19);var W=new Array(64);var a,b,c,d,e,f,g,h,i,j;var T1,T2;m[l>>5]|=0x80<<(24-l%32);m[((l+64>>9)<<4)+15]=l;for(var i=0;i<m.length;i+=16){a=HASH[0];b=HASH[1];c=HASH[2];d=HASH[3];e=HASH[4];f=HASH[5];g=HASH[6];h=HASH[7];for(var j=0;j<64;j++){if(j<16)W[j]=m[j+i];else W[j]=safe_add(safe_add(safe_add(Gamma1256(W[j-2]),W[j-7]),Gamma0256(W[j-15])),W[j-16]);T1=safe_add(safe_add(safe_add(safe_add(h,Sigma1256(e)),Ch(e,f,g)),K[j]),W[j]);T2=safe_add(Sigma0256(a),Maj(a,b,c));h=g;g=f;f=e;e=safe_add(d,T1);d=c;c=b;b=a;a=safe_add(T1,T2)}HASH[0]=safe_add(a,HASH[0]);HASH[1]=safe_add(b,HASH[1]);HASH[2]=safe_add(c,HASH[2]);HASH[3]=safe_add(d,HASH[3]);HASH[4]=safe_add(e,HASH[4]);HASH[5]=safe_add(f,HASH[5]);HASH[6]=safe_add(g,HASH[6]);HASH[7]=safe_add(h,HASH[7])}return HASH}function str2binb(str){var bin=Array();var mask=(1<<chrsz)-1;for(var i=0;i<str.length*chrsz;i+=chrsz){bin[i>>5]|=(str.charCodeAt(i/chrsz)&mask)<<(24-i%32)}return bin}function Utf8Encode(string){string=string.replace(/\r\n/g,"\n");var utftext="";for(var n=0;n<string.length;n++){var c=string.charCodeAt(n);if(c<128){utftext+=String.fromCharCode(c)}else if((c>127)&&(c<2048)){utftext+=String.fromCharCode((c>>6)|192);utftext+=String.fromCharCode((c&63)|128)}else{utftext+=String.fromCharCode((c>>12)|224);utftext+=String.fromCharCode(((c>>6)&63)|128);utftext+=String.fromCharCode((c&63)|128)}}return utftext}function binb2hex(binarray){var hex_tab=hexcase?"0123456789ABCDEF":"0123456789abcdef";var str="";for(var i=0;i<binarray.length*4;i++){str+=hex_tab.charAt((binarray[i>>2]>>((3-i%4)*8+4))&0xF)+hex_tab.charAt((binarray[i>>2]>>((3-i%4)*8))&0xF)}return str}s=Utf8Encode(s);return binb2hex(core_sha256(str2binb(s),s.length*chrsz))}(function() {
  function notify(body) {
    try { $notification.post('京东签到', '', body); } catch (e) {}
    try { if (typeof console !== 'undefined' && console.log) console.log(body); } catch (e) {}
  }
  function finish() {
    try { $done({}); } catch (e) {}
  }
  function read(k) {
    try {
      var v = $persistentStore.read(k);
      return (v === null || v === undefined || v === '') ? null : v;
    } catch (e) { return null; }
  }
  function write(k, v) {
    try { $persistentStore.write(v, k); } catch (e) {}
  }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function loadPlan(key) {
    var p = parseJson(read(key) || '');
    return (p && typeof p === 'object') ? p : null;
  }
  function savePlan(key, p) {
    write(key, JSON.stringify(p));
  }
  function randomRunAt(now) {
    var end = new Date();
    end.setHours(10, 45, 0, 0);
    var span = end.getTime() - now;
    if (span < 60000) span = 60000;
    return now + 1 + Math.floor(Math.random() * span);
  }
  function randomGate(key) {
    var now = Date.now();
    var plan = loadPlan(key);
    if (!plan || plan.date !== todayStr()) {
      plan = { date: todayStr(), runAt: randomRunAt(now), done: false, warned: false };
      savePlan(key, plan);
    }
    if (plan.done) return 'done';
    if (now < plan.runAt) return 'wait';
    return 'run';
  }
  function markPlanDone(key) {
    var plan = loadPlan(key);
    if (plan) { plan.done = true; savePlan(key, plan); }
  }
  function markPlanWarned(key) {
    var plan = loadPlan(key);
    if (plan) { plan.warned = true; savePlan(key, plan); }
  }
  function planWarned(key) {
    var plan = loadPlan(key);
    return !!(plan && plan.warned);
  }
  function loadSdk(done) {
    $httpClient.get('https://raw.githubusercontent.com/yisaings/surge/main/jd-priceprotect/h5st-sdk.js', function(err, resp, data) {
      if (err || !data) {
        notify('SDK 加载失败，请检查网络后重试');
        finish();
        return;
      }
      try {
        (0, eval)(data);
      } catch (e) {
        notify('SDK 解析失败');
        finish();
        return;
      }
      if (typeof window.ParamsSign === 'undefined') {
        notify('SDK 加载失败：未找到签名模块');
        finish();
        return;
      }
      done();
    });
  }
  function parseJson(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
  }
  function num(v) {
    var n = parseInt(v, 10);
    return isNaN(n) ? 0 : n;
  }
  function buildForm(pairs) {
    var parts = [];
    for (var i = 0; i < pairs.length; i++) {
      var v = pairs[i][1];
      if (v === null || v === undefined) continue;
      parts.push(encodeURIComponent(pairs[i][0]) + '=' + encodeURIComponent(String(v)));
    }
    return parts.join('&');
  }
  var ptKey = read('JD_PT_KEY');
  var ptPin = read('JD_PT_PIN');
  var fullCookie = read('JD_FULL_COOKIE');
  var beanEid = read('JD_BEAN_EID') || read('JD_EID');
  var deviceEid = read('JD_DEVICE_EID') || '';
  var openudid = read('JD_OPENUDID') || '';
  var wgToken = read('JD_WG_TOKEN') || '';
  var area = read('JD_AREA') || '4_48207_48260_0';
  var lngV = read('JD_LNG');
  var latV = read('JD_LAT');
  var gcLatV = read('JD_GCLAT');
  var gcLngV = read('JD_GCLNG');
  var lbsV = read('JD_LBS');
  var cookieHeader = (fullCookie && fullCookie !== '') ? fullCookie : ('pt_key=' + ptKey + ';pt_pin=' + ptPin + ';');
  var JDAPP_UA = 'jdapp;iPhone;16.1.81;;;M/5.0;appBuild/171195;jdSupportDarkMode/0;lang/zh_CN;ctype/0;site/CN;ccy/CNY;elder/0;ef/1;Mozilla/5.0 (iPhone; CPU iPhone OS 27_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;';
  function lbsParam() {
    var d = parseJson(lbsV || '');
    if (d && typeof d === 'object') return d;
    return { svcType: '', lbsLng: '', lbsLat: '', provinceId: 4, cityId: 48207, countyId: 54781, townId: 0 };
  }
  function sign(shortCode, params) {
    return new Promise(function(resolve, reject) {
      try {
        var ps = new window.ParamsSign({ appId: shortCode });
        ps.sign(params).then(function(res) { resolve(res && res.h5st); }).catch(function(e) { reject(e); });
      } catch (e) { reject(e); }
    });
  }
  function postForm(url, form, extraHeaders) {
    return new Promise(function(resolve, reject) {
      var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': JDAPP_UA,
        'Accept': 'application/json, text/plain, */*',
        'Cookie': cookieHeader
      };
      if (extraHeaders) {
        for (var k in extraHeaders) headers[k] = extraHeaders[k];
      }
      $httpClient.post({ url: url, headers: headers, body: form }, function(error, response, data) {
        if (error) { reject(error); return; }
        resolve({ status: response && response.status, data: data });
      });
    });
  }
  function apiCall(o) {
    var t = o.t || Date.now();
    var bodyStr = JSON.stringify(o.bodyObj);
    var bodySha = SHA256(bodyStr);
    var url = (typeof o.url === 'function') ? o.url(t) : o.url;
    return sign(o.shortCode, { appid: o.appid, clientVersion: o.clientVersion || '', client: o.client || 'apple', functionId: o.functionId, body: bodySha, t: t }).then(function(h5st) {
      if (!h5st) throw new Error('sign fail');
      var form = buildForm(o.formPairs(bodyStr, h5st, t));
      return postForm(url, form, o.headers).then(function(r) {
        return { status: r.status, obj: parseJson(r.data), raw: r.data };
      });
    });
  }
  function noSignCall(o) {
    var bodyStr = JSON.stringify(o.bodyObj);
    var form = buildForm(o.formPairs(bodyStr));
    return postForm(o.url, form, o.headers).then(function(r) {
      return { status: r.status, obj: parseJson(r.data), raw: r.data };
    });
  }
  function needEid() {
    if (!beanEid) throw new Error('no eid');
  }
  function okCode(v) {
    return v === 0 || v === '0' || v === '0000' || v === 11000 || v === '11000';
  }
  var results = [];
  function rec(name, status, beans, note) {
    results.push({ name: name, status: status, beans: beans || 0, note: note || '' });
  }
  function flowSecKill() {
    try { needEid(); } catch (e) { rec('秒杀', 'fail', 0, '未抓到 eid'); return Promise.resolve(); }
    var lng = lngV ? parseFloat(lngV) : '';
    var lat = latV ? parseFloat(latV) : '';
    return apiCall({
      url: 'https://api.m.jd.com/client.action?functionId=findBeanSceneNew',
      shortCode: 'ed9a2', appid: 'signed_wh5_ihub', client: 'apple', clientVersion: '16.1.81',
      functionId: 'findBeanSceneNew',
      bodyObj: { requestSource: 'normal', babelChannel: 'ttt1', actSecTraffic: '1', lng: lng, lat: lat },
      formPairs: function(bodyStr, h5st, t) {
        return [['functionId', 'findBeanSceneNew'], ['body', bodyStr], ['appid', 'signed_wh5_ihub'], ['client', 'apple'], ['screen', '393*661'], ['networkType', 'wifi'], ['openudid', openudid], ['build', '171195'], ['area', area], ['uemps', '0-2-999'], ['ext', '{"prstate":"0"}'], ['uuid', openudid], ['clientVersion', '16.1.81'], ['d_model', 'iPhone16,1'], ['osVersion', '27.0.1'], ['eid', deviceEid], ['h5st', h5st], ['x-api-eid-token', beanEid]];
      }
    }).then(function(r) {
      var d = r.obj && r.obj.data;
      if (!d) throw new Error('bad resp');
      if (num(d.todayBeanNum) === 0) { rec('秒杀', 'done', 0); return; }
      var arr = d.signComponentInfoResult || [];
      if (!arr.length || !arr[0].encryptAssignmentId) throw new Error('no assignmentId');
      var aid = arr[0].encryptAssignmentId;
      return apiCall({
        url: 'https://api.m.jd.com/client.action?functionId=bff_rightsCenter_interaction',
        shortCode: '90b26', appid: 'signed_wh5', client: 'ios', clientVersion: '16.1.81',
        functionId: 'bff_rightsCenter_interaction',
        bodyObj: { scene: 'commonDoInteractiveAssignment', activityCode: 'beanDailySign', businessScenario: 'jingDouCenter', commonScene: 'secKillChannel', assignmentId: aid },
        formPairs: function(bodyStr, h5st, t) {
          return [['functionId', 'bff_rightsCenter_interaction'], ['body', bodyStr], ['sceneType', 'secKillChannel'], ['appid', 'signed_wh5'], ['client', 'ios'], ['screen', '393*661'], ['networkType', 'wifi'], ['openudid', openudid], ['uuid', openudid], ['clientVersion', '16.1.81'], ['d_model', 'iPhone16,1'], ['osVersion', '27.0.1'], ['eid', deviceEid], ['h5st', h5st], ['x-api-eid-token', beanEid]];
        }
      }).then(function(r2) {
        var o2 = r2.obj || {};
        if (!okCode(o2.code)) throw new Error('code ' + o2.code);
        var sr = (((o2.rs || {}).rewardsInfo || {}).successRewards || {})['3'] || [];
        var q = sr.length ? num(sr[0].quantity) : 0;
        rec('秒杀', 'signed', q);
      });
    }).catch(function(e) { rec('秒杀', 'fail', 0, String(e && e.message || e)); });
  }
  function flowDeliverySign() {
    try { needEid(); } catch (e) { rec('签到页', 'fail', 0, '未抓到 eid'); return Promise.resolve(); }
    return apiCall({
      url: 'https://api.m.jd.com/?functionId=bean_deliverySign_home',
      shortCode: 'c1e85', appid: 'signed_wh5_ihub', client: 'ios', clientVersion: '16.1.81',
      functionId: 'bean_deliverySign_home',
      bodyObj: { iHubType: 'simple', activityId: '5383' },
      formPairs: function(bodyStr, h5st, t) {
        return [['functionId', 'bean_deliverySign_home'], ['appid', 'signed_wh5_ihub'], ['body', bodyStr], ['rfs', '0000'], ['client', 'ios'], ['uuid', openudid], ['build', '171195'], ['clientVersion', '16.1.81'], ['d_model', ''], ['osVersion', '27.0.1'], ['eid', deviceEid], ['screen', '852*393'], ['appBuild', '171195'], ['h5st', h5st], ['x-api-eid-token', beanEid]];
      }
    }).then(function(r) {
      var res = r.obj && r.obj.data && r.obj.data.result;
      if (!res) throw new Error('bad resp');
      var bl = res.bubbleList || [];
      for (var i = 0; i < bl.length; i++) {
        if (bl[i].type === 1) {
          if (num(bl[i].status) === 2) { rec('签到页', 'done', 0); return; }
          break;
        }
      }
      return apiCall({
        url: 'https://api.m.jd.com/?functionId=bean_deliverySign_sign',
        shortCode: '987dd', appid: 'signed_wh5_ihub', client: 'ios', clientVersion: '16.1.81',
        functionId: 'bean_deliverySign_sign',
        bodyObj: { activityId: '5383' },
        formPairs: function(bodyStr, h5st, t) {
          return [['functionId', 'bean_deliverySign_sign'], ['appid', 'signed_wh5_ihub'], ['body', bodyStr], ['rfs', '0000'], ['client', 'ios'], ['uuid', openudid], ['build', '171195'], ['clientVersion', '16.1.81'], ['d_model', ''], ['osVersion', '27.0.1'], ['eid', deviceEid], ['screen', '852*393'], ['appBuild', '171195'], ['h5st', h5st], ['x-api-eid-token', beanEid]];
        }
      }).then(function(r2) {
        var res2 = r2.obj && r2.obj.data && r2.obj.data.result;
        if (!res2 || !res2.rewardSuccess) throw new Error('sign fail');
        rec('签到页', 'signed', num(res2.value));
      });
    }).catch(function(e) { rec('签到页', 'fail', 0, String(e && e.message || e)); });
  }
  function flowWeGame() {
    try { needEid(); } catch (e) { rec('种豆', 'fail', 0, '未抓到 eid'); return Promise.resolve(); }
    var extStr = JSON.stringify({ appType: 'jdapp', systemType: 'ios', bigScreen: false, 'x-api-eid-token': beanEid, 'wg-sdk-token': wgToken });
    var formPairs = function(fid, bodyStr, h5st, t) {
      return [['functionId', fid], ['body', bodyStr], ['t', t], ['appid', 'wegame-hub'], ['client', 'ios'], ['clientVersion', '16.1.81'], ['platform', '3'], ['loginType', '2'], ['loginWQBiz', 'wegame'], ['h5st', h5st], ['x-api-eid-token', beanEid], ['uuid', openudid], ['build', '171195'], ['screen', '393*852'], ['networkType', 'wifi'], ['d_brand', 'iPhone'], ['d_model', 'iPhone16,1'], ['lang', 'zh_CN'], ['osVersion', '27.0.1'], ['partner', '-1'], ['wg-sdk-token', wgToken], ['ext', extStr], ['cthr', '1']];
    };
    return apiCall({
      url: 'https://api.m.jd.com/api?functionId=weGameHome',
      shortCode: '101aa', appid: 'wegame-hub', client: 'ios', clientVersion: '16.1.81',
      functionId: 'weGameHome',
      bodyObj: { envType: 1, linkId: '4HcenxuZM4XiHesOb1HG4g', appType: 1 },
      formPairs: function(bodyStr, h5st, t) { return formPairs('weGameHome', bodyStr, h5st, t); }
    }).then(function(r) {
      var sm = r.obj && r.obj.data && r.obj.data.signMainVo;
      if (!sm) throw new Error('bad resp');
      if (num(sm.currentStatus) === 3) { rec('种豆', 'done', 0); return; }
      return apiCall({
        url: 'https://api.m.jd.com/api?functionId=weGameLottery',
        shortCode: '730a6', appid: 'wegame-hub', client: 'ios', clientVersion: '16.1.81',
        functionId: 'weGameLottery',
        bodyObj: { envType: 1, linkId: '4HcenxuZM4XiHesOb1HG4g', appType: 1, status: 1, markStr: '' },
        formPairs: function(bodyStr, h5st, t) { return formPairs('weGameLottery', bodyStr, h5st, t); }
      }).then(function(r2) {
        var av = r2.obj && r2.obj.data && r2.obj.data.awardVo;
        if (!av) throw new Error('no award');
        rec('种豆', 'signed', num(av.awardGivenNumber));
      });
    }).catch(function(e) { rec('种豆', 'fail', 0, String(e && e.message || e)); });
  }
  function flowBaibaoxiang() {
    try { needEid(); } catch (e) { rec('百宝箱', 'fail', 0, '未抓到 eid'); return Promise.resolve(); }
    var baseBody = { platform: 1, osVersion: '27.0.1', screen: '393*852', eid: deviceEid, client: 'iOS', clientVersion: '16.1.81', model: 'iPhone16,1', brand: 'iPhone', uuid: openudid, networkType: 'wifi' };
    function idxBody() {
      var b = {};
      for (var k in baseBody) b[k] = baseBody[k];
      b.taskVersion = 1; b.channel = 'daily';
      return b;
    }
    return apiCall({
      url: 'https://api.m.jd.com/api?functionId=market_daily_pageIndex',
      shortCode: '4b818', appid: 'jdh-middle', client: 'iOS', clientVersion: '16.1.81',
      functionId: 'market_daily_pageIndex',
      bodyObj: idxBody(),
      formPairs: function(bodyStr, h5st, t) {
        return [['appid', 'jdh-middle'], ['functionId', 'market_daily_pageIndex'], ['body', bodyStr], ['h5st', h5st], ['x-api-eid-token', beanEid]];
      }
    }).then(function(r) {
      var al = r.obj && r.obj.data && r.obj.data.assignmentList;
      if (!al) throw new Error('bad resp');
      var target = null;
      for (var i = 0; i < al.length; i++) {
        if (al[i].assignmentType === 5) { target = al[i]; break; }
      }
      if (!target) throw new Error('no sign task');
      if (num(target.completionCnt) >= 1) { rec('百宝箱', 'done', 0); return; }
      var doBody = {};
      for (var k in baseBody) doBody[k] = baseBody[k];
      doBody.assignmentType = 5;
      doBody.encryptAssignmentId = target.encryptAssignmentId;
      doBody.actionType = 0;
      doBody.channel = 'daily';
      return apiCall({
        url: 'https://api.m.jd.com/api?functionId=market_daily_doCompleteTask',
        shortCode: '4b818', appid: 'jdh-middle', client: 'iOS', clientVersion: '16.1.81',
        functionId: 'market_daily_doCompleteTask',
        bodyObj: doBody,
        formPairs: function(bodyStr, h5st, t) {
          return [['appid', 'jdh-middle'], ['functionId', 'market_daily_doCompleteTask'], ['body', bodyStr], ['h5st', h5st], ['x-api-eid-token', beanEid]];
        }
      }).then(function(r2) {
        var o2 = r2.obj || {};
        if (o2.code !== '0000') throw new Error('code ' + o2.code);
        var sr = (o2.data && o2.data.successRewards) || [];
        var q = sr.length ? num(sr[0].quantity) : 0;
        rec('百宝箱', 'signed', q);
      });
    }).catch(function(e) { rec('百宝箱', 'fail', 0, String(e && e.message || e)); });
  }
  function jdhomeBody(chan, isDo, aid, poolId) {
    var b = {
      gcLat: gcLatV || '',
      gcLng: gcLngV || '',
      lbsParamMap: lbsParam(),
      supportNewChannel: '2'
    };
    if (chan.pageCode) b.pageCode = chan.pageCode;
    if (chan.identityCode) b.identityCode = chan.identityCode;
    if (chan.isJdApp) b.isJdApp = true;
    if (isDo) {
      b.checkInTaskParamMap = { itemId: '1', signDays: '1', whtPoolId: poolId, encryptAssignmentId: aid, requestScene: chan.requestScene };
    } else {
      b.checkInTaskParamMap = { requestScene: chan.requestScene };
    }
    b.source = chan.source;
    return b;
  }
  function flowJdHome(name, chan) {
    try { needEid(); } catch (e) { rec(name, 'fail', 0, '未抓到 eid'); return Promise.resolve(); }
    var formPairs = function(fid, bodyStr, h5st, t) {
      return [['functionId', fid], ['appid', 'JDHOME_TARO'], ['client', 'apple'], ['clientVersion', '16.1.81'], ['uuid', openudid], ['openudid', openudid], ['x-api-eid-token', beanEid], ['x_app_key', 'vygmwcxg14ui3jxw'], ['screen', '1179*2556'], ['area', area], ['body', bodyStr], ['h5st', h5st]];
    };
    return apiCall({
      url: 'https://api.m.jd.com/?functionId=checkInTaskList',
      shortCode: '35fa0', appid: 'JDHOME_TARO', client: 'apple', clientVersion: '16.1.81',
      functionId: 'checkInTaskList',
      bodyObj: jdhomeBody(chan, false),
      formPairs: function(bodyStr, h5st, t) { return formPairs('checkInTaskList', bodyStr, h5st, t); }
    }).then(function(r) {
      var list = r.obj && r.obj.checkInTaskList;
      if (!list || !list.length) throw new Error('bad resp');
      var task = list[0];
      if (task.completionFlag === true || num(task.completionCnt) >= 1) { rec(name, 'done', 0); return; }
      var poolId = null;
      var rw = task.rewardsList || [];
      if (rw.length && rw[0].whtPoolId) poolId = rw[0].whtPoolId;
      return apiCall({
        url: 'https://api.m.jd.com/?functionId=checkInTaskDo',
        shortCode: '35fa0', appid: 'JDHOME_TARO', client: 'apple', clientVersion: '16.1.81',
        functionId: 'checkInTaskDo',
        bodyObj: jdhomeBody(chan, true, task.encryptAssignmentId, poolId),
        formPairs: function(bodyStr, h5st, t) { return formPairs('checkInTaskDo', bodyStr, h5st, t); }
      }).then(function(r2) {
        var o2 = r2.obj || {};
        var dl = o2.doTaskJdList || [];
        if (!dl.length) throw new Error('no reward');
        rec(name, 'signed', num(dl[0].quantity));
      });
    }).catch(function(e) { rec(name, 'fail', 0, String(e && e.message || e)); });
  }
  function flowInteractSign() {
    try { needEid(); } catch (e) { rec('连签', 'fail', 0, '未抓到 eid'); return Promise.resolve(); }
    function qurl(fid, channelCode, sceneCode, t) {
      return 'https://api.m.jd.com/?area=' + encodeURIComponent(area) + '&clientVersion=16.1.81&client=apple&loginType=2&t=' + t + '&appid=Bigsale&xAPIClientLanguage=zh_CN&functionId=' + fid + '&channelCode=' + channelCode + '&sceneCode=' + sceneCode;
    }
    var t0 = Date.now();
    return apiCall({
      url: function(t) { return qurl('interact_pre_executor', 'gift', 'sign_floor', t); },
      shortCode: '7f3ea', appid: 'Bigsale', client: 'apple', clientVersion: '16.1.81',
      functionId: 'interact_pre_executor',
      bodyObj: {},
      formPairs: function(bodyStr, h5st, t) {
        return [['body', bodyStr], ['h5st', h5st], ['x-api-eid-token', beanEid]];
      }
    }).then(function(r) {
      var tl = r.obj && r.obj.data && r.obj.data.result && r.obj.data.result.taskInfo && r.obj.data.result.taskInfo.taskList;
      if (!tl || !tl.length) throw new Error('bad resp');
      var task = tl[0];
      var st = task.ext && task.ext.sign && task.ext.sign.status;
      if (num(st) === 2) { rec('连签', 'done', 0); return; }
      return apiCall({
        url: function(t) { return qurl('interact_executor', 'gift', 'sign', t); },
        shortCode: '7f3ea', appid: 'Bigsale', client: 'apple', clientVersion: '16.1.81',
        functionId: 'interact_executor',
        bodyObj: { assignmentId: task.encryptAssignmentId, itemId: '1', actionType: 0 },
        formPairs: function(bodyStr, h5st, t) {
          return [['body', bodyStr], ['h5st', h5st], ['x-api-eid-token', beanEid]];
        }
      }).then(function(r2) {
        var o2 = r2.obj || {};
        var ar = o2.data && o2.data.result && o2.data.result.assignmentResult;
        if (!ar) throw new Error('no result');
        var sr = ((ar.rewardsInfo || {}).successRewards || {})['3'] || [];
        var q = sr.length ? num(sr[0].quantity) : 0;
        rec('连签', 'signed', q);
      });
    }).catch(function(e) { rec('连签', 'fail', 0, String(e && e.message || e)); });
  }
  function flowCampus() {
    return noSignCall({
      url: 'https://api.m.jd.com/client.action?functionId=campusTask_interact_load',
      bodyObj: { interactActId: '93', clientChannel: 0, requestType: 0, babelChannel: 'ttt11' },
      formPairs: function(bodyStr) {
        return [['appid', 'schoolChannelHome'], ['functionId', 'campusTask_interact_load'], ['loginType', '2'], ['loginWQBiz', 'campusTask_interact_load'], ['body', bodyStr]];
      }
    }).then(function(r) {
      var m = r.obj && r.obj.data && r.obj.data.signBeanModule;
      if (!m) throw new Error('bad resp');
      if (num(m.todaySignStatus) === 2) { rec('校园', 'done', 0); return; }
      return noSignCall({
        url: 'https://api.m.jd.com/client.action?functionId=campusTask_interact_invoke',
        bodyObj: { interactActId: '93', taskId: m.taskId, itemId: '1', optType: 0, taskType: 5, clientChannel: 0, babelChannel: 'ttt11', requestType: 0 },
        formPairs: function(bodyStr) {
          return [['appid', 'schoolChannelHome'], ['functionId', 'campusTask_interact_invoke'], ['loginType', '2'], ['loginWQBiz', 'campusTask_interact_invoke'], ['body', bodyStr]];
        }
      }).then(function(r2) {
        var o2 = r2.obj || {};
        var ri = o2.data && o2.data.rewardInfo;
        if (!ri) throw new Error('no reward');
        rec('校园', 'signed', num(ri.rewardNum));
      });
    }).catch(function(e) { rec('校园', 'fail', 0, String(e && e.message || e)); });
  }
  function flowSuperSubsidy() {
    try { needEid(); } catch (e) { rec('补贴', 'fail', 0, '未抓到 eid'); return Promise.resolve(); }
    var formPairs = function(fid, bodyStr, h5st, t) {
      return [['appid', 'plus_business'], ['functionId', fid], ['body', bodyStr], ['loginType', '2'], ['loginWQBiz', ''], ['scval', 'test01'], ['xAPIClientLanguage', 'zh_CN'], ['d_brand', 'iPhone'], ['h5st', h5st], ['x-api-eid-token', beanEid]];
    };
    return apiCall({
      url: 'https://api.m.jd.com/api?functionId=bff_rightsCenter_jdInteractTask&scene=jdInteractTask',
      shortCode: 'b63ff', appid: 'plus_business', client: 'apple', clientVersion: '',
      functionId: 'bff_rightsCenter_jdInteractTask',
      bodyObj: { taskType: 'beanDailySign_newBeanTask', popFlag: '0', scene: 'jdInteractTask', commonScene: 'superSubsidyScene', needBeanSignStatus: '1', otherApis: [{ api: 'bff_exec_func', businessParam: { firstDomain: 'rightsCenter', secondDomain: 'userInfo', contentType: '27', scene: 'userInfo' } }] },
      formPairs: function(bodyStr, h5st, t) { return formPairs('bff_rightsCenter_jdInteractTask', bodyStr, h5st, t); }
    }).then(function(r) {
      var tl = r.obj && r.obj.rs && r.obj.rs.beanTask && r.obj.rs.beanTask.taskList;
      if (!tl) throw new Error('bad resp');
      var target = null;
      for (var i = 0; i < tl.length; i++) {
        if (tl[i].assignmentType === 5) { target = tl[i]; break; }
      }
      if (!target) throw new Error('no sign task');
      if (target.completionFlag === true || num(target.completionCnt) >= 1) { rec('补贴', 'done', 0); return; }
      return apiCall({
        url: 'https://api.m.jd.com/api?functionId=bff_rightsCenter_interaction&scene=commonDoInteractiveAssignment',
        shortCode: 'b63ff', appid: 'plus_business', client: 'apple', clientVersion: '',
        functionId: 'bff_rightsCenter_interaction',
        bodyObj: { scene: 'commonDoInteractiveAssignment', commonScene: 'superSubsidyScene', activityCode: 'beanDailySign', businessScenario: 'jingDouCenter', assignmentId: target.encryptAssignmentId, actionType: '100', itemId: '' },
        formPairs: function(bodyStr, h5st, t) { return formPairs('bff_rightsCenter_interaction', bodyStr, h5st, t); }
      }).then(function(r2) {
        var o2 = r2.obj || {};
        if (!okCode(o2.code)) throw new Error('code ' + o2.code);
        var sr = (((o2.rs || {}).rewardsInfo || {}).successRewards || {})['3'] || [];
        var q = sr.length ? num(sr[0].quantity) : 0;
        rec('补贴', 'signed', q);
      });
    }).catch(function(e) { rec('补贴', 'fail', 0, String(e && e.message || e)); });
  }
  function flowXinqi() {
    try { needEid(); } catch (e) { rec('新奇集市', 'fail', 0, '未抓到 eid'); return Promise.resolve(); }
    function qurl(fid, t) {
      return 'https://api.m.jd.com/?area=' + encodeURIComponent(area) + '&clientVersion=16.1.81&client=apple&loginType=2&t=' + t + '&appid=Bigsale&xAPIClientLanguage=zh_CN&functionId=' + fid + '&uuid=' + openudid + '&d_model=iPhone16,1&d_brand=iPhone&model=iPhone16,1&osVersion=27.0.1';
    }
    return apiCall({
      url: function(t) { return qurl('common_task_list', t); },
      shortCode: '7f3ea', appid: 'Bigsale', client: 'apple', clientVersion: '16.1.81',
      functionId: 'common_task_list',
      bodyObj: { ext: { queryReceiveTimes: 1 }, extMap: { sceneType: 2 }, channelId: '8' },
      formPairs: function(bodyStr, h5st, t) {
        return [['body', bodyStr], ['h5st', h5st], ['x-api-eid-token', beanEid]];
      }
    }).then(function(r) {
      var tl = r.obj && r.obj.data && r.obj.data.result && r.obj.data.result.taskInfo && r.obj.data.result.taskInfo.taskList;
      if (!tl || !tl.length) throw new Error('bad resp');
      var target = null;
      for (var i = 0; i < tl.length; i++) {
        if (tl[i].assignmentType === 5) { target = tl[i]; break; }
      }
      if (!target) throw new Error('no sign task');
      if (target.completionFlag === true || num(target.completionCnt) >= 1) { rec('新奇集市', 'done', 0); return; }
      return apiCall({
        url: function(t) { return qurl('common_do_task', t); },
        shortCode: '7f3ea', appid: 'Bigsale', client: 'apple', clientVersion: '16.1.81',
        functionId: 'common_do_task',
        bodyObj: { channelId: '8', itemId: '1', assignmentId: target.encryptAssignmentId, actionType: 0, ext: { doReceiveRewards: null } },
        formPairs: function(bodyStr, h5st, t) {
          return [['body', bodyStr], ['h5st', h5st], ['x-api-eid-token', beanEid]];
        }
      }).then(function(r2) {
        var o2 = r2.obj || {};
        var ar = o2.data && o2.data.result && o2.data.result.assignmentResult;
        if (!ar) throw new Error('no result');
        var sr = ((ar.rewardsInfo || {}).successRewards || {})['3'] || [];
        var q = sr.length ? num(sr[0].quantity) : 0;
        rec('新奇集市', 'signed', q);
      });
    }).catch(function(e) { rec('新奇集市', 'fail', 0, String(e && e.message || e)); });
  }
  function flowMedicine() {
    var bodyObj = { encryptProjectId: '3gUkbvwFqf4zciMRTtJ4d2uPhfaT', encryptAssignmentId: '3uEBpEkXxnkhQYpLzXQKo914eVph' };
    var formPairs = function(bodyStr) {
      return [['appid', 'laputa'], ['functionId', 'mb2capp_ma_queryActivityPageInfo'], ['body', bodyStr]];
    };
    return noSignCall({
      url: 'https://api.m.jd.com/client.action?functionId=mb2capp_ma_queryActivityPageInfo',
      bodyObj: bodyObj,
      formPairs: formPairs
    }).then(function(r) {
      var sl = r.obj && r.obj.data && r.obj.data.dailySignInfo && r.obj.data.dailySignInfo.signList;
      if (!sl || !sl.length) throw new Error('bad resp');
      var today = null;
      for (var i = 0; i < sl.length; i++) {
        if (sl[i].todayFlag === true) { today = sl[i]; break; }
      }
      if (!today) throw new Error('no today item');
      if (today.signed === true) { rec('医药', 'done', 0); return; }
      return noSignCall({
        url: 'https://api.m.jd.com/client.action?functionId=mb2capp_ma_doDailyAttendance',
        bodyObj: bodyObj,
        formPairs: function(bodyStr) {
          return [['appid', 'laputa'], ['functionId', 'mb2capp_ma_doDailyAttendance'], ['body', bodyStr]];
        }
      }).then(function(r2) {
        var sl2 = r2.obj && r2.obj.data && r2.obj.data.signList;
        if (!sl2 || !sl2.length) throw new Error('no reward');
        var t2 = null;
        for (var j = 0; j < sl2.length; j++) {
          if (sl2[j].todayFlag === true) { t2 = sl2[j]; break; }
        }
        if (!t2 || t2.signed !== true) throw new Error('not signed');
        rec('医药', 'signed', num(t2.getJingDouCount));
      });
    }).catch(function(e) { rec('医药', 'fail', 0, String(e && e.message || e)); });
  }
  function flowLottery() {
    try { needEid(); } catch (e) { rec('抽奖', 'fail', 0, '未抓到 eid'); return Promise.resolve(); }
    var extStr = JSON.stringify({ appType: 'jdapp', systemType: 'ios', bigScreen: false, 'x-api-eid-token': beanEid, 'wg-sdk-token': wgToken });
    function basePairs(fid, bodyStr, h5st, t, withLogin) {
      var p = [['functionId', fid], ['body', bodyStr], ['t', t], ['appid', 'activities_platform'], ['client', 'ios'], ['clientVersion', '16.1.81'], ['platform', '3']];
      if (withLogin) { p.push(['loginType', '2']); p.push(['loginWQBiz', 'wegame']); }
      p.push(['h5st', h5st]); p.push(['x-api-eid-token', beanEid]); p.push(['uuid', openudid]); p.push(['build', '171195']); p.push(['screen', '393*852']); p.push(['networkType', 'wifi']); p.push(['d_brand', 'iPhone']); p.push(['d_model', 'iPhone16,1']); p.push(['lang', 'zh_CN']); p.push(['osVersion', '27.0.1']); p.push(['partner', '-1']); p.push(['wg-sdk-token', wgToken]); p.push(['ext', extStr]); p.push(['cthr', '1']);
      return p;
    }
    return apiCall({
      url: 'https://api.m.jd.com/api?functionId=lotteryMachineHome',
      shortCode: 'd7439', appid: 'activities_platform', client: 'ios', clientVersion: '16.1.81',
      functionId: 'lotteryMachineHome',
      bodyObj: { linkId: 'MrKB46kaB3CizIRRqnjB3A', taskId: '', inviter: '' },
      formPairs: function(bodyStr, h5st, t) { return basePairs('lotteryMachineHome', bodyStr, h5st, t, false); }
    }).then(function(r) {
      var d = r.obj && r.obj.data;
      if (!d) throw new Error('bad resp');
      if (num(d.remainTimes) < 1) { rec('抽奖', 'done', 0); return; }
      return apiCall({
        url: 'https://api.m.jd.com/api?functionId=apsDoTask',
        shortCode: '54ed7', appid: 'activities_platform', client: 'ios', clientVersion: '16.1.81',
        functionId: 'apsDoTask',
        bodyObj: { taskType: 'SIGN', taskId: 28094, channel: 4, checkVersion: true, linkId: 'MrKB46kaB3CizIRRqnjB3A', pipeExt: { taskType: 'SIGN', assignmentId: '4LN2JcUhwNjpLeYvZGnaVMvEZcXW' } },
        formPairs: function(bodyStr, h5st, t) { return basePairs('apsDoTask', bodyStr, h5st, t, true); }
      }).catch(function() { return null; }).then(function() {
        return apiCall({
          url: 'https://api.m.jd.com/api?functionId=lotteryMachineDraw',
          shortCode: 'd7439', appid: 'activities_platform', client: 'ios', clientVersion: '16.1.81',
          functionId: 'lotteryMachineDraw',
          bodyObj: { linkId: 'MrKB46kaB3CizIRRqnjB3A' },
          formPairs: function(bodyStr, h5st, t) { return basePairs('lotteryMachineDraw', bodyStr, h5st, t, false); }
        }).then(function(r2) {
          var d2 = r2.obj && r2.obj.data;
          if (!d2) throw new Error('no prize');
          var q = (num(d2.prizeType) === 3) ? num(d2.amount) : 0;
          rec('抽奖', 'signed', q);
        });
      });
    }).catch(function(e) { rec('抽奖', 'fail', 0, String(e && e.message || e)); });
  }
  try {
    if (randomGate('JD_BEAN_PLAN') !== 'run') {
      finish();
      return;
    }
    if (!ptKey || !ptPin) {
      if (!planWarned('JD_BEAN_PLAN')) {
        notify('未抓到 Cookie，请先打开京东 App 任意签到页一次');
        markPlanWarned('JD_BEAN_PLAN');
      }
      finish();
      return;
    }
    loadSdk(function() {
      var chain = Promise.resolve();
      var flows = [
        flowSecKill,
        flowDeliverySign,
        flowWeGame,
        flowBaibaoxiang,
        function() { return flowJdHome('服务', { source: '38', requestScene: 0, isJdApp: true }); },
        function() { return flowJdHome('家政', { source: 'hp39', requestScene: 2, pageCode: 'service_housekeeping', identityCode: 'houseKeeping' }); },
        flowInteractSign,
        flowCampus,
        flowSuperSubsidy,
        flowLottery,
        flowXinqi,
        flowMedicine
      ];
      flows.forEach(function(f) { chain = chain.then(f); });
      chain.then(function() {
        var total = 0;
        var parts = [];
        var fails = [];
        for (var i = 0; i < results.length; i++) {
          var r = results[i];
          if (r.status === 'signed') { total += r.beans; parts.push(r.name + '+' + r.beans); }
          else if (r.status === 'done') { parts.push(r.name + '已签'); }
          else if (r.status === 'fail') { fails.push(r.name); }
        }
        var msg = parts.length ? ('京豆签到：' + parts.join('，') + '，共+' + total + '京豆') : '京豆签到：全部失败';
        if (fails.length) msg += '（' + fails.join('、') + '失败）';
        markPlanDone('JD_BEAN_PLAN');
        notify(msg);
        finish();
      }).catch(function() {
        markPlanDone('JD_BEAN_PLAN');
        notify('京豆签到：执行异常');
        finish();
      });
    });
  } catch (e) {
    markPlanDone('JD_BEAN_PLAN');
    notify('京豆签到：执行异常');
    finish();
  }
})();
