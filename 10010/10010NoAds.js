// 中国联通去广告 v2：旧版 v1 的 [Body Rewrite] + jq 写法 Surge 不认、会静默忽略，
// 本版改用 http-response 脚本重写 JSON，域名级拦截走 [Rule]。
// v3 新增（依据 2026-11-03 20:03 新抓包，1400 条；v2 已实证生效，新包里 v2 接口体已是清空后状态）：
// - 首页脚手架：按模块名删特惠购机/爆款套餐/靓号种草/极速宽带/瀑布流，留头部/金刚区/头图/消息
// - 商城：瀑布流 pageList、首页商品槽位清空（商城页会空）
// - 服务提醒整条置空（3 次抓到的提醒全是营销：积分兑换、爱奇艺会员、话费券）
// - 我的页：彩铃关旗标并清空、积分商品清空（积分数字保留）、钱包备用金/借钱两格置空（话费优惠/我的钱包保留）、
//   套餐升级卡置空（套餐本身信息保留）、我的设备推广机型清空（本机保留）、精准营销商品清空、神券清空
// 依据 2026-11-03 联通手机营业厅 13.2 抓包（680 条）：
// - 首页：瀑布流 28 张营销卡、营销位 topList、专属优惠、OMO、浮窗广告与底部标签、顶栏通通/签到、推送消息、弹窗、517 活动
// - 我的页：广告文案、推荐
// - 搜索：发现页列表、热词
// - 上报：smartad 全是 businessLogRecords 打点、m1.ad 是广告图域，走 [Rule] 整域 reject
// 不动：功能导航（homeMenuItems、navMenuList）、话费/流量/账单等业务接口、我的页积分/钱包/订单、宽带续约提醒、
//      商城选号（card.10010.com）、图片 CDN（m1.img/img.client，功能图标与广告图混用不能整域拦）、
//      推送通道（pushservice，只清推送消息里的营销内容）、开屏（本次包没抓到冷启动，未动）
var url = $request.url;
var obj = null;
try {
  obj = JSON.parse($response.body);
} catch (e) {
  obj = null;
}
if (obj) {
  if (url.indexOf('queryIndexWaterfall') !== -1) {
    if (obj.data && obj.data.liuCeDto && Array.isArray(obj.data.liuCeDto.pageList)) {
      obj.data.liuCeDto.pageList = [];
    }
  } else if (url.indexOf('getServiceHomeMarketingBits') !== -1) {
    if (obj.data) {
      if (Array.isArray(obj.data.topList)) obj.data.topList = [];
      if (Array.isArray(obj.data.bottomList)) obj.data.bottomList = [];
    }
  } else if (url.indexOf('queryIndexExclusiveOffers') !== -1) {
    if (obj.data && Array.isArray(obj.data.left)) {
      obj.data.left.forEach(function (it) {
        if (Array.isArray(it.pageList)) it.pageList = [];
      });
    }
  } else if (url.indexOf('queryOMO') !== -1) {
    if (obj.data && Array.isArray(obj.data.listOMOInfo)) {
      obj.data.listOMOInfo = [];
    }
  } else if (url.indexOf('homefusion/fuInter') !== -1) {
    delete obj['HomeFusion.fuchuangAdv_A8'];
    delete obj['HomeFusion.bottomLabel'];
    if (obj['HomeFusion.backGroundQuery'] && Array.isArray(obj['HomeFusion.backGroundQuery'].result)) {
      obj['HomeFusion.backGroundQuery'].result = [];
    }
  } else if (url.indexOf('clientIndex/v1/api/navHome') !== -1) {
    if (obj.datas && Array.isArray(obj.datas.homeTopMenuItems)) {
      obj.datas.homeTopMenuItems = obj.datas.homeTopMenuItems.filter(function (it) {
        return it.menuName !== '通通' && it.menuName !== '签到';
      });
    }
  } else if (url.indexOf('copywritingAdvertisement') !== -1) {
    if (obj.data && Array.isArray(obj.data.pageList)) {
      obj.data.pageList = [];
    }
  } else if (url.indexOf('/api/myRecommend') !== -1) {
    if (obj.data) {
      obj.data.myRecommendShowFlag = false;
      if (Array.isArray(obj.data.pageList)) obj.data.pageList = [];
    }
  } else if (url.indexOf('queryPushMessage') !== -1) {
    if (obj.data && obj.data.respBody && Array.isArray(obj.data.respBody.messages)) {
      obj.data.respBody.messages = [];
    }
  } else if (url.indexOf('homePopUpActivityNew') !== -1) {
    obj.data = null;
  } else if (url.indexOf('query517Active') !== -1) {
    if (obj.data) {
      obj.data.homeShowFlag = false;
      obj.data.myShowFlag = false;
      obj.data.searchShowFlag = false;
      if (Array.isArray(obj.data.top)) obj.data.top = [];
      if (Array.isArray(obj.data.central)) obj.data.central = [];
    }
  } else if (url.indexOf('searchDiscoverListExpress') !== -1) {
    obj.data = [];
  } else if (url.indexOf('searchScrollWord') !== -1) {
    obj['113000004'] = [];
  } else if (url.indexOf('queryNewHomePageidShowData') !== -1) {
    if (obj.data && Array.isArray(obj.data) && obj.data[0] && Array.isArray(obj.data[0].pageContent)) {
      var drop = ['特惠购机模块', '爆款套餐模块', '靓号种草模块', '极速宽带模块', '瀑布流模块'];
      obj.data[0].pageContent = obj.data[0].pageContent.filter(function (m) {
        return drop.indexOf(m.name) === -1;
      });
    }
  } else if (url.indexOf('mall-access/query/waterfallFlow') !== -1) {
    if (obj.data && obj.data.res && Array.isArray(obj.data.res.pageList)) {
      obj.data.res.pageList = [];
    }
  } else if (url.indexOf('mall-order/query/newFirstPage') !== -1) {
    obj.data = {};
  } else if (url.indexOf('serviceReminder') !== -1) {
    obj.data = null;
  } else if (url.indexOf('myColorfulRingtone') !== -1) {
    if (obj.data) {
      obj.data.showFlag = false;
      if (Array.isArray(obj.data.goodsList)) obj.data.goodsList = [];
    }
  } else if (url.indexOf('myPoints') !== -1) {
    if (obj.data && Array.isArray(obj.data.goodsList)) obj.data.goodsList = [];
  } else if (url.indexOf('myWallet') !== -1) {
    if (obj.data) {
      obj.data.secendPlace = {};
      obj.data.thirdPlace = {};
    }
  } else if (url.indexOf('newUserInfo') !== -1) {
    if (obj.data) obj.data.myPackagePackageZone = {};
  } else if (url.indexOf('getDeviceInfo') !== -1) {
    if (obj.data && Array.isArray(obj.data.rightData)) obj.data.rightData = [];
  } else if (url.indexOf('precisionKeyAndActivity') !== -1) {
    if (obj.data && Array.isArray(obj.data.goods)) obj.data.goods = [];
  } else if (url.indexOf('aggregateFloorData') !== -1) {
    if (obj.data && obj.data.couponCollectionCenter && Array.isArray(obj.data.couponCollectionCenter.data)) {
      obj.data.couponCollectionCenter.data = [];
    }
  }
  $done({ body: JSON.stringify(obj) });
} else {
  $done({});
}
