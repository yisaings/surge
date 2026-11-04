var KINGKONG_KEEP = ['相册', '视频', '文档', '音频', '备份', '同步'];
function processBaiduPan(url, body) {
  var obj = JSON.parse(body);
  var changed = false;
  if (url.indexOf('/api/getsyscfg') !== -1) {
    if (obj.iphone_splash_cold_bidding_config_area) { obj.iphone_splash_cold_bidding_config_area = {}; changed = true; }
    if (obj.iphone_splash_hot_bidding_config_area) { obj.iphone_splash_hot_bidding_config_area = {}; changed = true; }
    var area = obj.business_ad_config_area;
    if (area && Array.isArray(area.cfg_list)) {
      var kept = area.cfg_list.filter(function (n) {
        return n.node_key === 'reward_video_alert_config_node' || n.node_key === 'reward_video_display_node';
      });
      if (kept.length !== area.cfg_list.length) { area.cfg_list = kept; changed = true; }
    }
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
    obj.popup_list = [];
    changed = true;
  } else if (url.indexOf('/api/notice/list') !== -1) {
    if (obj.data) { obj.data.list = []; changed = true; }
  } else if (url.indexOf('/feed/kingkongdistrict') !== -1) {
    if (obj.data && Array.isArray(obj.data.data)) {
      var kept = obj.data.data.filter(function (x) { return KINGKONG_KEEP.indexOf(x.name) !== -1; });
      if (kept.length !== obj.data.data.length) { obj.data.data = kept; changed = true; }
    }
  } else if (url.indexOf('/rest/2.0/membership/user') !== -1 && url.indexOf('method=usercard') !== -1) {
    if (obj.data) { obj.data = {}; changed = true; }
  } else if (url.indexOf('/coins/center/notice') !== -1) {
    if (obj.data) { obj.data = {}; changed = true; }
  } else if (url.indexOf('/act/v2/gamecenter/gametaskinfo') !== -1 || url.indexOf('/act/v2/gamecenter/recommend') !== -1) {
    if (obj.data) { obj.data = {}; changed = true; }
  } else if (url.indexOf('/act/v2/gamecenter/historyplay') !== -1) {
    if (obj.data) { obj.data = []; changed = true; }
  } else if (url.indexOf('/act/v2/gamecenter/gamematerial') !== -1) {
    if (obj.data) { obj.data = {}; changed = true; }
  }
  else if (url.indexOf('/api/taskscore/tasklist') !== -1) {
    if (obj.result && Array.isArray(obj.result.list)) { obj.result.list = []; changed = true; }
  }
  return changed ? JSON.stringify(obj) : body;
}

var _body = $response.body;
try {
  _body = processBaiduPan($request.url, _body);
} catch (e) {}
$done({ body: _body });
