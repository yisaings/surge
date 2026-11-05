var url = $request.url;
if (url.indexOf("get_ads") !== -1) {
  $done({ status: 200, headers: { "Content-Type": "application/json" }, body: '{"status_code":20001,"reason":218,"desc":""}' });
} else {
  $done({ status: 200, headers: { "Content-Type": "application/json" }, body: "{}" });
}
