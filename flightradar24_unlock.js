// flightradar24_unlock.js

let body = $response.body;
let obj = JSON.parse(body);

// 解锁广告
if (obj.features) {
  obj.features.adverts = "disabled";
  obj.features["map.info.flight"] = "enabled";
  obj.features["map.info.aircraft"] = "enabled";
  obj.features["map.filters.categories"] = "enabled";
  obj.features["map.widgets.last_clicked_flights"] = "enabled";
  obj.features["map.filters.unblocking"] = "enabled";
  obj.features["support.platform"] = "Full";
  obj.features["map.view.3d.basic"] = 5;
  obj.features["map.widgets.bookmarks.max"] = 999;
  obj.features["user.fleets.max"] = 99;
  obj.features["user.fleets.max.aircraft"] = 9999;
  obj.features["map.timeout.mins"] = 999;
}

// 修改用户类型
if (obj.userData) {
  obj.userData.accountType = "gold";
  obj.userData.features["adverts"] = "disabled";
  obj.userData.features["map.info.flight"] = "enabled";
  obj.userData.features["map.info.aircraft"] = "enabled";
  obj.userData.features["map.filters.categories"] = "enabled";
  obj.userData.features["map.widgets.last_clicked_flights"] = "enabled";
  obj.userData.features["map.filters.unblocking"] = "enabled";
  obj.userData.features["support.platform"] = "Full";
  obj.userData.features["map.view.3d.basic"] = 5;
  obj.userData.features["map.widgets.bookmarks.max"] = 999;
  obj.userData.features["user.fleets.max"] = 99;
  obj.userData.features["user.fleets.max.aircraft"] = 9999;
  obj.userData.features["map.timeout.mins"] = 999;
}

$done({ body: JSON.stringify(obj) });