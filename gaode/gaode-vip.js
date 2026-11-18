var url = $request.url;
var body = $response.body;
try {
  var obj = JSON.parse(body);
  if (url.indexOf('/ws/user/vassets/myEntrance') !== -1) {
    var cards = obj.data && obj.data.cardList;
    if (cards) {
      for (var i = 0; i < cards.length; i++) {
        var vip = cards[i].cardData && cards[i].cardData.myVipInfo;
        if (vip) {
          vip.vipStatus = 1;
          vip.vipStatusText = 'VIP会员';
          vip.vipName = 'VIP会员';
          vip.vipType = 'vip';
          vip.validBeginTime = 1700000000;
          vip.validEndTime = 4102444800;
          vip.buttonText = '已开通';
        }
      }
    }
  } else if (url.indexOf('/ws/user/shopping_mall/member/cashdesk') !== -1) {
    var u = obj.data && obj.data.userInfo;
    if (u) {
      u.vipStatus = 1;
      u.vipStatusText = 'VIP会员';
      u.validEndTime = 4102444800;
    }
  } else if (url.indexOf('/ws/user/shopping_mall/member/memberIndex') !== -1) {
    var v = obj.data && obj.data.vipInfo;
    if (v) {
      v.vipStatus = 1;
      v.vipStatusText = 'VIP会员';
      v.buttonText = '已开通';
    }
  }
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  $done({});
}
