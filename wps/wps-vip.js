const body = $response.body;
if (!body) { $done({}); return; }
try {
  const o = JSON.parse(body);
  if (Array.isArray(o.vips)) {
    const hasWps = o.vips.some(function (v) { return v.memberid === 20; });
    if (!hasWps) {
      o.vips.push({ enabled: null, expire_time: 4102444800, has_ad: 0, memberid: 20, name: 'WPS会员' });
    }
  }
  if (o.vipinfo && typeof o.vipinfo === 'object') {
    o.vipinfo.memberid = 20;
    o.vipinfo.name = 'WPS会员';
    o.vipinfo.has_ad = 0;
  }
  $done({ body: JSON.stringify(o) });
} catch (_) {
  $done({});
}
