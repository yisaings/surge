const body = $response.body;
if (!body) { $done({}); return; }
try {
  const o = JSON.parse(body);
  if (Array.isArray(o.data)) { o.data = []; }
  if (o.data && typeof o.data === 'object' && Array.isArray(o.data.items)) {
    o.data.items = [];
    o.data.total = 0;
  }
  $done({ body: JSON.stringify(o) });
} catch (_) {
  $done({});
}
