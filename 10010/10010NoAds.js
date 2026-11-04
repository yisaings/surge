// 中国联通去广告 v12（2026-11-04 晚，依据 22:10 重装首启包 433 条：v11 两包补丁实证已跑上、画面仍在，证明源头找错）：
// - 22:10 包实锤：chunk-2660b238 体内 douDiData=[]、omoQianrenqianmian 体内 omoDataDoudi=[]，即 v11 包补丁已在设备上跑到，
//   但视频里首页卡片仍在——首页 OMO 行真正源头是 homeView 包内的 omoDataList 默认数据（流量专区/装宽带/超值购机/靓号秒杀/套餐专区/热销手机），
//   omoQianrenqianmian 只是另一路个性化组件。本版新增 homeView 包补丁：omoDataList 平衡括号置空（两包同规则逻辑，锚点不满足即原样放行）；
// - 我的格子双保险：已有 goods=[] 不足以杀格子（v11 视频 1 实证格子仍在——init 种子在 fetch 空结果时存活），
//   本版 precisionKeyAndActivity 再把服务端“移出”开关 MoveOut 置 1，走 chunk-2660 自身的清空分支；只动这一个开关；
// - 其余 v11 全部保留；MITM 不变，更新模块即可。
// 中国联通去广告 v11（2026-11-04 晚，依据 21:42 重装首启包 1336 条：兜底数据源定位到 H5 包内，接口层到墙的问题改走包补丁）：
// - 新增包补丁（须 MITM img.client.10010.com，见 sgmodule；脚本内任一补丁条件不满足即原样放行，绝不破坏页面）：
//   (1) 我的页兜底格子：myinfo12 chunk-2660b238 的 douDiData（10 项，与截图格子顺序完全一致）置空，isDouDiIndex 同步置空，
//       HuoDongData 随 douDiData 自动为空；内容锚点 douDiData=[{title:"宽带办理" 保证只命中该包；
//   (2) 首页 OMO 兜底：homejingxuan12 omoQianrenqianmian 的 omoDataDoudi（流量专区/装宽带）置空；
// - newUserInfo：撤掉 v10 的 isNewBroad/isNewCard=false（21:32 实证横幅仍在，旗标无用，不留无用改动）；trafficVo 清空保留；
// - navMenuList 过滤在重装首启包里实证跑上（1572 项、黑名单余 0），保留；
// - 待定位（本包仍无）：首页大卡片兜底 moren 结构、套餐专区侧卡、加赠横幅（疑图片）、我的设备推广 chunk-5f99f7f2。
// 中国联通去广告 v10（2026-11-04 晚，依据 21:15 冷启动重抓包 983 条 + 旧包复核 Gemini 说法）：
// - newUserInfo：trafficVo.pageList 清空（流量推广位，功能行 broad/card/contract/cloud 不动）；
//   isNewBroad/isNewCard 置 false（实验：验证加赠横幅是否由新户旗标控制，若横幅还在则与此无关）；
// - myWallet：payShowFlag 置 false（实验：验证 -- 格子是不是钱包卡；若格子还在则是楼层占位）；
// - [Rule] 加穿山甲 SDK 与 WebInsight 埋点域 REJECT（仅减后台流量，不改画面）；
// - 注意：首页卡片已证实是 H5 前端兜底渲染（smartad 兜底-前端-* 打点 63 条），非接口数据，接口层清不掉；
//   navMenuList 本包未重拉（App 缓存菜单库），v9 过滤尚未跑上；aggregateFloorData 两包均未出现（配置旗标全关时 H5 直接跳过该请求）。
// 中国联通去广告 v9（2026-11-04 晚，依据 21:01 空白配置+单模块重抓包 313 条）：
// - 新增导航菜单库过滤：navMenuList 是首页卡片与我的页营销格子的唯一活源（本包内百亿补贴等标题只在此接口出现，
//   其余接口体均已是 v8 清空后状态）；按标题/别名精确匹配删 12 类营销项，充话费/充流量/查账单/PLUS 等功能项不在黑名单内故保留；
// - 已知副作用：菜单库无页面标记，同标题项在服务页也会一并消失；
// - 未定位（本包任何 HTTP 体/JS 包里均无对应数据，疑 aggregateFloorData 缓存或原生桥接数据）：首页更多靓号卡与卡内小字徽标、
//   我的页套餐专区卡/加赠横幅/我的设备推广机型/营销格子余项（套餐专区/享数码好物/手机特惠/至高享千元），须冷启动重抓我的页看 aggregateFloorData 再定。
// 中国联通去广告 v8（2026-11-03 晚，核实 211417 重装包：我的页默认菜单在 H5 包里、清空会触发兜底，故改 moduleConfigFlag=true＋各楼层关旗标使菜单为空；商城 brandZone/terminalGoods 补规则）：
// 中国联通去广告 v4（2026-11-03 晚，Yi 新口径：首页只留话费/流量行、商城清空、我的页只留基本信息）：
// - 首页脚手架 pageContent 全清；顶栏 homeMenuItems/homeTopMenuItems 全清；专属优惠右栏 pageList 也清；
// - 首页用量行 queryUserInfoSeven 只留 fee/flow/voice 三项，point/云盘/云机清掉，顶层三项资源不动；
// - 商城：smartHome/tabs/文创/顶图/活动/终端/品牌/浮窗横幅/搜索推荐全部清空（瀑布流与首页商品 v3 已清）；
// - 我的页：楼层配置关旗标、楼层数据全清、设备左右全清、积分数据全清、钱包四格全清；
//   只留 getMyUnicomDate（头像/等级基本信息）与 newUserInfo 套餐本身配置不动。
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
var body = $response.body;
var patched = null;
if (url.indexOf('omoQianrenqianmian') !== -1 && body.indexOf('omoDataDoudi:[{title:"流量专区"') !== -1) {
  var s = body.indexOf('omoDataDoudi:[');
  var e = body.indexOf(']}},created:', s);
  if (s !== -1 && e !== -1 && body.indexOf('omoDataDoudi:[', s + 1) === -1) {
    patched = body.slice(0, s) + 'omoDataDoudi:[]' + body.slice(e + 1);
  }
} else if (url.indexOf('/myinfo12/js/chunk-') !== -1 && body.indexOf('douDiData=[{title:"宽带办理"') !== -1) {
  var s2 = body.indexOf('this.douDiData=[');
  var e2 = body.indexOf('],this.isDouDiIndex=', s2);
  if (s2 !== -1 && e2 !== -1 && body.indexOf('this.douDiData=[', s2 + 1) === -1) {
    var tmp = body.slice(0, s2) + 'this.douDiData=[]' + body.slice(e2 + 1);
    var idxLit = 'this.isDouDiIndex=[0,1,2,3,4,5,6,7,8,9]';
    if (tmp.indexOf(idxLit) !== -1) {
      patched = tmp.replace(idxLit, 'this.isDouDiIndex=[]');
    }
  }
} else if (url.indexOf('/js/homeView.') !== -1 && body.indexOf('omoDataList:') !== -1) {
  var out = '';
  var pos = 0;
  var changed = false;
  while (true) {
    var a = body.indexOf('omoDataList:', pos);
    if (a === -1) { out += body.slice(pos); break; }
    var b = body.indexOf('[', a);
    if (b === -1) { changed = false; break; }
    var depth = 0;
    var k = b;
    var instr = false;
    var esc = false;
    var q = '';
    while (k < body.length) {
      var ch = body.charAt(k);
      if (instr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === q) instr = false;
      } else {
        if (ch === '"' || ch === "'" || ch === '`') { instr = true; q = ch; }
        else if (ch === '[') depth++;
        else if (ch === ']') { depth--; if (depth === 0) break; }
      }
      k++;
    }
    if (depth !== 0) { changed = false; break; }
    out += body.slice(pos, a) + 'omoDataList:[]';
    pos = k + 1;
    changed = true;
  }
  if (changed) patched = out;
}
if (patched !== null) {
  $done({ body: patched });
} else {
var obj = null;
try {
  obj = JSON.parse(body);
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
    if (obj.data) {
      ['left', 'right'].forEach(function (side) {
        if (Array.isArray(obj.data[side])) {
          obj.data[side].forEach(function (it) {
            if (Array.isArray(it.pageList)) it.pageList = [];
          });
        }
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
    if (obj.datas) {
      if (Array.isArray(obj.datas.homeTopMenuItems)) obj.datas.homeTopMenuItems = [];
      if (Array.isArray(obj.datas.homeMenuItems)) obj.datas.homeMenuItems = [];
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
      obj.data[0].pageContent = [];
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
    obj.data = {};
  } else if (url.indexOf('myWallet') !== -1) {
    if (obj.data) {
      obj.data.firstPlace = {};
      obj.data.secendPlace = {};
      obj.data.thirdPlace = {};
      obj.data.fourPlace = {};
      obj.data.payShowFlag = false;
    }
  } else if (url.indexOf('newUserInfo') !== -1) {
    if (obj.data) {
      obj.data.myPackagePackageZone = {};
      if (obj.data.userInfoData) {
        if (obj.data.userInfoData.trafficVo && Array.isArray(obj.data.userInfoData.trafficVo.pageList)) {
          obj.data.userInfoData.trafficVo.pageList = [];
        }
      }
    }
  } else if (url.indexOf('getDeviceInfo') !== -1) {
    if (obj.data) {
      if (Array.isArray(obj.data.rightData)) obj.data.rightData = [];
      obj.data.leftData = {};
    }
  } else if (url.indexOf('precisionKeyAndActivity') !== -1) {
    if (obj.data) {
      if (Array.isArray(obj.data.goods)) obj.data.goods = [];
      obj.data.precisionKeyAndActivityMoveOut = "1";
    }
  } else if (url.indexOf('aggregateFloorData') !== -1) {
    obj.data = {};
  } else if (url.indexOf('mall-access/homePage/v25/query/brandZone') !== -1) {
    // v7：205332 包实证——商城截图的品牌列与商品列表唯一活源就是 brandZone（brandNameList + goodsInfoList，含 iPhone Air 等），
    // 此前 v3/v4 只清了 smartHome/tabs/brandFloor 等，漏了这一路，故商城整页仍在。直接清空。
    obj.data = {};
  } else if (url.indexOf('mall-access/query/terminalGoods/region') !== -1) {
    // v7：同包实证——terminalGoods/region 的 subsidyRegion/subRegion1 仍带完整分区数据，属商城分区内容，随商城一并清空。
    obj.data = {};
  } else if (url.indexOf('aggregateFloorConfig') !== -1) {
    // v8：v6/v7 的 data={} 是错的——我的页 H5（myinfo12 chunk）逻辑是：moduleConfigFlag 为真时按各楼层 configFlag 组装菜单，
    // 为假或数据为空时菜单保持不动（初次即 H5 内置默认菜单 setDefaultMenuData：领券中心/我的礼包/我的订单/浏览记录/购物车），
    // 所以清空反而触发默认菜单、重装也清不掉（默认菜单在 JS 包里，不在缓存里）。
    // 正确做法：moduleConfigFlag=true 让服务端分支跑起来，同时各楼层 configFlag=false，使组装出的菜单为空数组，行消失。
    obj.data = {
      moduleFlag: false,
      moduleConfigFlag: true,
      browsingHistory: { configFlag: false },
      couponCollectionCenter: { configFlag: false },
      myOrder: { configFlag: false },
      myPacks: { configFlag: false },
      shoppingCart: { configFlag: false }
    };
  } else if (url.indexOf('queryUserInfoSeven') !== -1) {
    if (obj.data && Array.isArray(obj.data.dataList)) {
      obj.data.dataList = obj.data.dataList.filter(function (it) {
        return it.type === 'fee' || it.type === 'flow' || it.type === 'voice';
      });
    }
  } else if (url.indexOf('mobileserviceNine/api/v1/index/queryCfig') !== -1) {
    if (obj.data) obj.data.pageListItem = Array.isArray(obj.data.pageListItem) ? [] : {};
  } else if (url.indexOf('queryBroadbandRenewalData') !== -1) {
    obj.data = null;
  } else if (url.indexOf('mall-access/homePage/v25/query/smartHome') !== -1) {
    obj.data = {};
  } else if (url.indexOf('mall-access/homePage/v25/query/tabs') !== -1) {
    obj.data = [];
  } else if (url.indexOf('mall-access/homePage/v25/query/unicomCulture') !== -1) {
    obj.data = {};
  } else if (url.indexOf('mall-access/homePage/v25/topBanner') !== -1) {
    obj.data = {};
  } else if (url.indexOf('mall-access/homePage/v25/topTab/activityShow') !== -1) {
    if (obj.data) {
      if (Array.isArray(obj.data.tabList)) obj.data.tabList = [];
      if (Array.isArray(obj.data.activityShowList)) obj.data.activityShowList = [];
    }
  } else if (url.indexOf('mall-access/homePage/v25/topTerminalShow') !== -1) {
    obj.data = [];
  } else if (url.indexOf('mall-access/mall/homePage/brandFloor') !== -1) {
    obj.data = [];
  } else if (url.indexOf('mall-access/query/FlowWindowAndBanner') !== -1) {
    obj.data = {};
  } else if (url.indexOf('naviService/navMenuList') !== -1) {
    var NAV_BLOCK = ['百亿补贴', '更多套餐', '流量专区', '装宽带', '宽带新装', '宽带升级', '腾讯王卡', '选靓号', '流量特惠', '1元1GB', '宽带办理', '全屋光宽带'];
    if (obj.data && obj.data.value && Array.isArray(obj.data.value.list)) {
      obj.data.value.list = obj.data.value.list.filter(function (it) {
        return NAV_BLOCK.indexOf(it.title) === -1 && NAV_BLOCK.indexOf(it.menuAliasName) === -1;
      });
    }
  } else if (url.indexOf('mall-access/searchRecommend') !== -1) {
    obj.data = [];
  }
  $done({ body: JSON.stringify(obj) });
} else {
  $done({});
}
}
