// 天翼云盘精简 v1
// 只留网盘功能，其余全清：
// ① 首页 newHomePages：删「我的AI权益」整个分区；「我的界面」只留相册备份、手机备份、同步盘、私密空间、我的分享、收藏夹、回收站，删音乐、云扫毒、班级群、活动中心、摘星星；
// ② getPageBanners 横幅列表清空；
// ③ 推荐订阅卡（getRecCollectLabelCardList）清空；
// ④ AI 问答首页提示（getDefaultAskListV2）清空。
// 不动：文件/分享/家庭/订阅等功能接口、账号权益与配额数据（getUserPrivilegesV2）、已为空的悬浮窗/优惠券/相册推荐。
(function () {
  var url = $request.url;
  var KEEP = ['相册备份', '手机备份', '同步盘', '私密空间', '我的分享', '收藏夹', '回收站'];
  try {
    var obj = JSON.parse($response.body);
    if (url.indexOf('/bff/client/newHomePages.action') !== -1 && obj.data && Array.isArray(obj.data)) {
      obj.data = obj.data.filter(function (sec) {
        if (sec.type === '/MY_AI_RIGHT') return false;
        if (sec.type === '/MY_INTERFACE' && Array.isArray(sec.serviceHomeMaterialDataList)) {
          sec.serviceHomeMaterialDataList = sec.serviceHomeMaterialDataList.filter(function (it) {
            return KEEP.indexOf(it.title) !== -1;
          });
        }
        return true;
      });
    } else if (url.indexOf('/guns/getPageBanners.action') !== -1 && obj.data && Array.isArray(obj.data.recommendedPositionList)) {
      obj.data.recommendedPositionList = [];
    } else if (url.indexOf('/guns/collectLabelCard/getRecCollectLabelCardList.action') !== -1 && Array.isArray(obj.data)) {
      obj.data = [];
    } else if (url.indexOf('/sealeverScene/getDefaultAskListV2') !== -1 && obj.data && Array.isArray(obj.data.homeAskInfoList)) {
      obj.data.homeAskInfoList = [];
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
