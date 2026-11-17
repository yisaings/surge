const body = $response.body;
if (!body) { $done({}); return; }
try {
  const o = JSON.parse(body);
  if (Array.isArray(o.data)) { o.data = []; }
  $done({ body: JSON.stringify(o) });
} catch (_) {
  $done({});
}
