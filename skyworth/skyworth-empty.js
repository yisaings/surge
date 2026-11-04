var url = $request.url;
if (url.indexOf("allBannerConfig") !== -1) {
  $done({ body: "{}" });
} else {
  $done({});
}
