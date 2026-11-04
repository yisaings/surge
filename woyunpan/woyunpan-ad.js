var url = $request.url;
var body = $response.body;
try {
  var obj = JSON.parse(body);
  var result = obj.result;
  if (result) {
    if (url.indexOf('/resource/query/open-screen/app') !== -1) {
      if (result.openScreen) {
        result.openScreen = [];
      }
    } else if (url.indexOf('/api/bff/homePage') !== -1) {
      if (Array.isArray(result.recommend)) {
        result.recommend = result.recommend.filter(function (it) {
          return it.code !== 'home_banner';
        });
      }
      if (result.homeVideoCardDTO && Array.isArray(result.homeVideoCardDTO.videos)) {
        result.homeVideoCardDTO.videos = [];
      }
      if (Array.isArray(result.function)) {
        result.function = result.function.filter(function (it) {
          return it.title !== 'AI入戏';
        });
      }
    } else if (url.indexOf('/resource/query/mine-resource/app') !== -1) {
      if (Array.isArray(result.data)) {
        result.data = result.data.filter(function (it) {
          if (it.resourceType === 'mine_fixed_operation_function') {
            return false;
          }
          var items = it.entity && it.entity.items;
          if (Array.isArray(items)) {
            for (var i = 0; i < items.length; i++) {
              if (items[i] && items[i].resourceName === '特惠') {
                return false;
              }
            }
          }
          return true;
        });
      }
    } else if (url.indexOf('/member/info/card/service/package') !== -1) {
      if (result.recommendServicePackageConfigIos) {
        result.recommendServicePackageConfigIos.subConfigs = [];
      }
      if (result.recommendServicePackageConfigAndroid) {
        result.recommendServicePackageConfigAndroid.subConfigs = [];
      }
    } else if (url.indexOf('/app/home/toolboxs') !== -1) {
      if (Array.isArray(result.data)) {
        result.data = result.data.filter(function (it) {
          return it.tabPosCode !== 'TAB_EQUITY_DISCOUNTS_TOOLS';
        });
      }
    } else if (url.indexOf('/resource/query/popupAndFlow') !== -1) {
      result.popups = null;
      result.widgets = null;
    } else if (url.indexOf('/discovery/page/tab/list') !== -1) {
      if (Array.isArray(result.tabList)) {
        result.tabList = [];
      }
    } else if (url.indexOf('/membershipBenefit/V2/displayMembershipBenefit') !== -1) {
      obj.result = '';
    }
  }
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  $done({});
}
