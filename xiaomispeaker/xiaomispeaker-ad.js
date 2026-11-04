// 小米音箱去营销 v1：只清营销接口，设备控制/歌单/绑定一律不动
var url = $request.url;
function parse() {
  try { return JSON.parse($response.body); } catch (e) { return null; }
}
function done(o) { $done({ body: JSON.stringify(o) }); }

// 1. 营销域：广告、弹窗、会员推销、会员开通引导，数据清空
if (url.indexOf('marketing-aibox.v.mitvos.com') !== -1) {
  var mkt = ['/advertise/', '/popup/', '/payGuide/', '/cloudConfig/cpManage/config'];
  var hit = false;
  for (var i = 0; i < mkt.length; i++) {
    if (url.indexOf(mkt[i]) !== -1) { hit = true; break; }
  }
  if (hit) {
    var o1 = parse();
    if (!o1) return;
    o1.data = Array.isArray(o1.data) ? [] : {};
    done(o1);
    return;
  }
  $done({});
  return;
}

// 2. 首页内容流：只删“限时折扣”整块和带 vipbar 的会员条，其余内容块全留
if (url.indexOf('appinfo-aibox.v.mitvos.com/info/app/flow') !== -1) {
  var o2 = parse();
  if (!o2) return;
  if (o2.data && Array.isArray(o2.data.blocks)) {
    o2.data.blocks = o2.data.blocks.filter(function (b) {
      if (b.title === '限时折扣') return false;
      var items = b.items || [];
      for (var j = 0; j < items.length; j++) {
        if (JSON.stringify(items[j]).indexOf('vipbar') !== -1) return false;
      }
      return true;
    });
  }
  done(o2);
  return;
}

$done({});
