var body = $response.body;
try {
  var o = JSON.parse(body);
  if (o && Array.isArray(o.data)) {
    o.data = [];
    body = JSON.stringify(o);
  }
} catch (e) {}
$done({ body: body });
