var url = $request.url;
var body = $response.body;
try {
  var obj = JSON.parse(body);
  if (url.indexOf('getAppConfigRn') !== -1) {
    var data = obj && obj.result && obj.result.data;
    if (data && data.hongbaoconfig_3642) {
      data.hongbaoconfig_3642.showdisplay = 'false';
      data.hongbaoconfig_3642.hblist = [];
    }
  } else if (url.indexOf('/activity/api/hb') !== -1) {
    if (obj && obj.result) {
      obj.result = {};
    }
  } else if (url.indexOf('getHomeOverlayInfo') !== -1) {
    if (obj) {
      obj.result = null;
    }
  } else if (url.indexOf('/v1/config') !== -1) {
    if (obj && obj.result && obj.result.ad && obj.result.ad.mmb_homealert_name) {
      obj.result.ad = null;
    }
  }
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  $done({});
}
