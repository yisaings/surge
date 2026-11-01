// 创维智慧云：allBannerConfig 整个返回空字典 {}
// （等价于 Loon/kelee 的 reject_dict，但用 Surge 脚本实现，
//  因为 Surge 的 [URL Rewrite] 没有 reject-dict 这个类型）
var url = $request.url;
if (url.indexOf("allBannerConfig") !== -1) {
  $done({ body: "{}" });
} else {
  $done({});
}
