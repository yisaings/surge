var url = $request.url;
var body = $response.body || '';

if (!body) return $done({});
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
    if (b === -1) { out += body.slice(pos); break; }
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
    if (depth !== 0) { out += body.slice(pos); break; }
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
    obj.data = {};
  } else if (url.indexOf('mall-access/query/terminalGoods/region') !== -1) {
    obj.data = {};
  } else if (url.indexOf('aggregateFloorConfig') !== -1) {
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
