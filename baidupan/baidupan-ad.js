// 百度网盘去广告 v3：v2 的开屏/弹窗/引导/金刚区/工具区/上报全部保留
// 新增：我的页 SVIP 卡、任务系统卡、游戏中心整区清掉
// 保留：头像、我的AI点数/我的资产、我的收藏一排图标、空间卡、传输/下载/上传/分享/会员状态/P2P 配置/激励视频
// 底部库库 AI tab 是原生写死、接口够不着，动不了
var KINGKONG_KEEP = ['相册', '视频', '文档', '音频', '备份', '同步'];
function processBaiduPan(url, body) {
  var obj = JSON.parse(body);
  var changed = false;
  if (url.indexOf('/api/getsyscfg') !== -1) {
    // 开屏冷启/热启瀑布流配置整区清掉
    if (obj.iphone_splash_cold_bidding_config_area) { obj.iphone_splash_cold_bidding_config_area = {}; changed = true; }
    if (obj.iphone_splash_hot_bidding_config_area) { obj.iphone_splash_hot_bidding_config_area = {}; changed = true; }
    // 商业广告配置区：只留激励视频两个节点，其余全清
    var area = obj.business_ad_config_area;
    if (area && Array.isArray(area.cfg_list)) {
      var kept = area.cfg_list.filter(function (n) {
        return n.node_key === 'reward_video_alert_config_node' || n.node_key === 'reward_video_display_node';
      });
      if (kept.length !== area.cfg_list.length) { area.cfg_list = kept; changed = true; }
    }
    // 新工具区：只留文件工具，学习办公/图片工具/生活服务整组清掉
    var nta = obj.new_tool_area;
    if (nta && Array.isArray(nta.cfg_list)) {
      nta.cfg_list.forEach(function (node) {
        var raw = node.new_tool_all_section;
        if (typeof raw !== 'string') return;
        try {
          var secs = JSON.parse(raw);
          var filtered = secs.filter(function (s) { return s.section_name === '文件工具'; });
          if (filtered.length !== secs.length) { node.new_tool_all_section = JSON.stringify(filtered); changed = true; }
        } catch (e) {}
      });
    }
  } else if (url.indexOf('/act/api/activityentry') !== -1) {
    // 活动弹窗（含借钱、领会员、空间将满、相似图清理等营销弹窗）全清
    obj.popup_list = [];
    changed = true;
  } else if (url.indexOf('/api/notice/list') !== -1) {
    // 公告/引导卡（AI 功能推广）全清
    if (obj.data) { obj.data.list = []; changed = true; }
  } else if (url.indexOf('/feed/kingkongdistrict') !== -1) {
    // 金刚区：只留网盘基本模块
    if (obj.data && Array.isArray(obj.data.data)) {
      var kept = obj.data.data.filter(function (x) { return KINGKONG_KEEP.indexOf(x.name) !== -1; });
      if (kept.length !== obj.data.data.length) { obj.data.data = kept; changed = true; }
    }
  } else if (url.indexOf('/rest/2.0/membership/user') !== -1 && url.indexOf('method=usercard') !== -1) {
    // 我的页 SVIP 卡（标题/特权/等级福利/老朋友特惠/立即续费）整卡清掉
    // 只清 usercard 这一个方法，会员状态/头像/配额走别的接口，不动
    if (obj.data) { obj.data = {}; changed = true; }
  } else if (url.indexOf('/coins/center/notice') !== -1) {
    // 任务系统卡（领奖励/下载券/空间气泡）整卡清掉
    if (obj.data) { obj.data = {}; changed = true; }
  } else if (url.indexOf('/act/v2/gamecenter/gametaskinfo') !== -1 || url.indexOf('/act/v2/gamecenter/recommend') !== -1) {
    // 游戏中心：玩寻道任务、猜你爱玩清掉
    if (obj.data) { obj.data = {}; changed = true; }
  } else if (url.indexOf('/act/v2/gamecenter/historyplay') !== -1) {
    // 游戏中心：最近在玩清掉（data 本来就是数组，保持数组类型）
    if (obj.data) { obj.data = []; changed = true; }
  }
  return changed ? JSON.stringify(obj) : body;
}

var _body = $response.body;
try {
  _body = processBaiduPan($request.url, _body);
} catch (e) {}
$done({ body: _body });
