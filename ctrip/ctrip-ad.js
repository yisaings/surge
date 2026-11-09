// 携程去广告 v1：只清广告位数据，预订功能一律不动
var url = $request.url;
function parse() {
  try { return JSON.parse($response.body); } catch (e) { return null; }
}
function done(o) { $done({ body: JSON.stringify(o) }); }

// 广告接口 tripAds：广告位整组清空
if (url.indexOf('m.ctrip.com/restapi/soa2/') !== -1 && url.indexOf('/json/tripAds') !== -1) {
  var o = parse();
  if (!o) return $done({});
  if (Array.isArray(o.seats)) o.seats = [];
  done(o);
  return;
}

$done({});
