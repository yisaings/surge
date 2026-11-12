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
    try { $notification.post('京东一键价保', '', body); } catch (e) {}
  }
  function finish() {
    try { $done({}); } catch (e) {}
  }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function loadPlan(key) {
    try { var p = JSON.parse($persistentStore.read(key) || ''); return (p && typeof p === 'object') ? p : null; } catch (e) { return null; }
  }
  function savePlan(key, p) {
    try { $persistentStore.write(JSON.stringify(p), key); } catch (e) {}
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
  function doneNotify(body) {
    markPlanDone('JD_PP_PLAN');
    notify(body);
    finish();
  }
  try {
    if (randomGate('JD_PP_PLAN') !== 'run') {
      finish();
      return;
    }
    var ptKey = $persistentStore.read('JD_PT_KEY');
    var ptPin = $persistentStore.read('JD_PT_PIN');
    if (!ptKey || !ptPin) {
      if (!planWarned('JD_PP_PLAN')) {
        notify('未抓到 Cookie，请先打开京东 App 价保页一次');
        markPlanWarned('JD_PP_PLAN');
      }
      finish();
      return;
    }
    var eid = $persistentStore.read('JD_EID');
    if (!eid) {
      if (!planWarned('JD_PP_PLAN')) {
        notify('未抓到 eid，请打开京东价保页重新抓取');
        markPlanWarned('JD_PP_PLAN');
      }
      finish();
      return;
    }
    var fullCookie = $persistentStore.read('JD_FULL_COOKIE');
    var cookieHeader = (fullCookie && fullCookie !== '') ? fullCookie : ('pt_key=' + ptKey + '; pt_pin=' + ptPin + ';');
    var bodyObj = { onceBatchId: '', couponConfirmFlag: null, appId: 'cuser', uniformBizInfo: { data: { language: 'zh_CN', buId: 301, tenantId: 1024 } }, type: '25' };
    var bodyStr = JSON.stringify(bodyObj);
    var bodySha = SHA256(bodyStr);
    loadSdk(function() {
      var t = Date.now();
      var ps = new window.ParamsSign({ appId: '6f46e' });
      ps.sign({ appid: 'price_protection', clientVersion: '', client: 'apple', functionId: 'mlproprice_skuOnceApply_jsf', body: bodySha, t: t }).then(function(res) {
        var h5st = res && res.h5st;
        if (!h5st) {
          doneNotify('签名失败，请稍后重试');
          return;
        }
        var form = 'functionId=mlproprice_skuOnceApply_jsf&appid=price_protection&loginType=2&body=' + encodeURIComponent(bodyStr) + '&client=apple&clientVersion=&x-api-eid-token=' + encodeURIComponent(eid) + '&h5st=' + encodeURIComponent(h5st) + '&t=' + t + '&xAPIClientLanguage=zh_CN';
        $httpClient.post({
          url: 'https://api.m.jd.com/',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'jdapp;iPhone;16.1.81;;;M/5.0;appBuild/171195;jdSupportDarkMode/0;lang/zh_CN;ctype/0;site/CN;ccy/CNY;elder/0;ef/1;Mozilla/5.0 (iPhone; CPU iPhone OS 27_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
            'Accept': 'application/json, text/plain, */*',
            'Origin': 'https://h5.m.jd.com',
            'Referer': 'https://h5.m.jd.com/',
            'X-Rp-Client': 'h5_2.6.0',
            'Accept-Language': 'zh-SG,zh-CN;q=0.9,zh-Hans;q=0.8',
            'sec-fetch-site': 'same-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'x-referer-page': 'https://h5.m.jd.com/babelDiy/Zeus/2RePMzTqg6UoffvMwtwVeMcnPGeg/index.html',
            'priority': 'u=3, i',
            'Cookie': cookieHeader
          },
          body: form
        }, function(error, response, data) {
          try {
          if (error) {
            doneNotify('请求失败，请检查网络后重试');
            return;
          }
          if (response && response.status && response.status !== 200) {
            doneNotify('价保申请失败（HTTP ' + response.status + '）');
            return;
          }
          var obj = null;
          try { obj = JSON.parse(data); } catch (e) { obj = null; }
          if (!obj || obj.code !== 0 || !obj.data) {
            var why = '';
            if (obj && obj.message) { why = '：' + obj.message; }
            else if (obj && obj.code) { why = '（code ' + obj.code + '）'; }
            doneNotify('价保申请失败' + why);
            return;
          }
          var d = obj.data;
          if (d.waitFetch) {
            notify('已提交申请，正在计算差价，稍后打开价保页查看结果');
          } else if (d.succNum > 0) {
            notify('价保成功 ' + d.succNum + ' 单，共返 ¥' + d.succAmount);
          } else {
            notify(d.onceApplyNoSuccessTips || '当前无差价');
          }
          markPlanDone('JD_PP_PLAN');
          finish();
          } catch (e) {
            doneNotify('价保申请失败，请稍后重试');
          }
        });
      }).catch(function() {
        doneNotify('签名失败，请稍后重试');
      });
    });
  } catch (e) {
    doneNotify('签名失败，请稍后重试');
  }
})();
