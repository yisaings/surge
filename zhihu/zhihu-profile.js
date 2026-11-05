var body = $response.body;
try {
  var o = JSON.parse(body);
  if (o && o.vip_info) {
    delete o.vip_info.entrance_v2;
    delete o.vip_info.entrance_new;
  }
  body = JSON.stringify(o);
} catch (e) {}
$done({ body: body });
