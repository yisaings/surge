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
  if (Array.isArray(o.data) && o.data.length > 0 && typeof o.data[0] === 'string') {
    const vipPrivileges = ['pdf_convert', 'pdf_edit', 'pdf_sign', 'pdf_compress', 'pdf_merge', 'pdf_split', 'pdf_watermark', 'pdf_ocr', 'no_ad', 'ocr', 'translate', 'doc_merge', 'doc_split', 'ai_write', 'ai_translate', 'cloud_space_vip', 'file_recovery', 'doc_roaming_vip'];
    for (const p of vipPrivileges) {
      if (o.data.indexOf(p) === -1) { o.data.push(p); }
    }
  }
  $done({ body: JSON.stringify(o) });
} catch (_) {
  $done({});
}
