(function () {
  var url = $request.url;
  var KEEP_INTERFACE = ['相册备份', '手机备份', '同步盘', '私密空间', '我的分享', '收藏夹', '回收站'];
  var KEEP_FILE = ['图片', '视频', '文档', '相册备份', '手机备份', '同步盘', '私密空间', '我的分享', '收藏夹', '卡包', '微信备份', '文件清理', '回收站', '文件收集'];
  try {
    var obj = JSON.parse($response.body);
    if (url.indexOf('/bff/client/newHomePages.action') !== -1 && obj.data && Array.isArray(obj.data)) {
      obj.data = obj.data.filter(function (sec) {
        var keep = null;
        if (sec.type === '/MY_INTERFACE') keep = KEEP_INTERFACE;
        else if (sec.type === '/file') keep = KEEP_FILE;
        else if (sec.type === 'APP_BACKUP_CONTROL') keep = null;
        else return false;
        if (keep && Array.isArray(sec.serviceHomeMaterialDataList)) {
          sec.serviceHomeMaterialDataList = sec.serviceHomeMaterialDataList.filter(function (it) {
            return keep.indexOf(it.title) !== -1;
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
    } else if (url.indexOf('/guns/getMyPageRecommendedPositionList.action') !== -1 && obj.data && Array.isArray(obj.data.mypageRecommendedPositionList)) {
      obj.data.mypageRecommendedPositionList = [];
    } else if (url.indexOf('/privilege/listConfigPrivilege') !== -1 && obj.data && Array.isArray(obj.data.userConfigPrivilegeList)) {
      obj.data.userConfigPrivilegeList = [];
    } else if ((url.indexOf('getOwnerSubscribeShare.action') !== -1 || url.indexOf('getRecResourceShare.action') !== -1) && obj.data && Array.isArray(obj.data.shareFileList)) {
      obj.data.shareFileList = [];
      obj.data.count = 0;
    } else if (url.indexOf('/guns/ai/getTemplateByTagChannel.action') !== -1 && Array.isArray(obj.data)) {
      obj.data = [];
    } else if (url.indexOf('queryUserLogo.action') !== -1 && obj.data) {
      obj.data.defaultMsg = '';
      obj.data.logoUrlList = [];
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
