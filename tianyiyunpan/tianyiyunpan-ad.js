// 天翼云盘精简 v2
// 只留网盘功能，其余全清（v1 + v2 新增）：
// ① 首页配置 newHomePages 改白名单：只留「我的界面」（7 项网盘入口）、「文件管理」（去音乐，留图片/视频/文档/备份/分享/收藏/卡包/微信备份/文件清理/回收站/文件收集）、相册备份任务数控制；
//    其余分区全删：AI 精选各区（AI形象照/文档处理/图片处理/顶部推广位）、AI 助手各区、金刚区里的音乐/云笔记/云U盘、专属福利、云安全、签到、推广位、广告轮播、会员尊享、办公助手、校园工具、云视听、数字家庭、图片处理、家庭档案等；
// ② 我的页推荐位（getMyPageRecommendedPositionList）清空：去会员中心、成长体系行；
// ③ 权益配置（listConfigPrivilege）清空：去我的 AI 权益行；
// ④ 订阅内容（getOwnerSubscribeShare / getRecResourceShare）清空：去发现页订阅号视频流；
// ⑤ AI 形象照模板（getTemplateByTagChannel）清空；
// ⑥ v1 保留：横幅、推荐订阅卡、AI 问答首页提示清空。
// 不动：文件/分享/家庭/订阅功能接口本身、账号权益与配额数据（getUserPrivilegesV2）、空间用量（zySpace）、文件动态。
// 注意：底部 tab（首页/文件/AI/发现/我的）、搜索栏、开通会员横幅与每日签到格若为原生写死，脚本动不了，见交付说明。
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
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
