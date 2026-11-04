var url = $request.url;
if (url.indexOf("allBannerConfig") !== -1) {
  $done({ body: '{"code":500,"success":false,"data":{}}' });
} else {
  $done({});
}
