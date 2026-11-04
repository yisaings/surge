// 微博去推广 v1：去开屏、红包、签到及非社交推广
// 匹配逻辑按 $request.url 分支；只改目标字段，其余原样返回。
(function () {
  var url = $request.url;

  function done(obj) {
    $done({ body: JSON.stringify(obj) });
  }

  function parse() {
    try {
      return JSON.parse($response.body);
    } catch (e) {
      $done({});
      return null;
    }
  }

  // 1. 开屏预加载：清空广告池
  if (url.indexOf('bootpreload.uve.weibo.com/v2/ad/preload') !== -1) {
    var o = parse();
    if (!o) return;
    o.ads = [];
    done(o);
    return;
  }

  // 2. 开屏拉取广告：清空缓存广告
  if (url.indexOf('wbapp.uve.weibo.com/wbapplua/wbpullad.lua') !== -1) {
    var o2 = parse();
    if (!o2) return;
    if (o2.cached_ad) o2.cached_ad.ads = [];
    done(o2);
    return;
  }

  // 3. 签到弹窗：不展示
  if (url.indexOf('api.weibo.cn/2/checkin/show') !== -1) {
    var o3 = parse();
    if (!o3) return;
    o3.show = 0;
    o3.days = [];
    done(o3);
    return;
  }

  // 4. 读红包配置：清空
  if (url.indexOf('api.weibo.cn/2/ug/read/redpacket/config') !== -1) {
    var o4 = parse();
    if (!o4) return;
    o4.data = {};
    done(o4);
    return;
  }

  // 5. 视频红包：清空
  if (url.indexOf('multimedia/video/red_package/grow_follower/active_uids') !== -1) {
    var o5 = parse();
    if (!o5) return;
    o5.result = [];
    o5.mid_list = [];
    o5.repost_mid_list = [];
    o5.repost_uid_list = [];
    done(o5);
    return;
  }

  // 6. 首页气泡：清空
  if (url.indexOf('api.weibo.cn/2/!/ug/home_bubble') !== -1) {
    var o6 = parse();
    if (!o6) return;
    o6.data = {};
    done(o6);
    return;
  }

  // 7. 搜索彩蛋推广视频：清空
  if (url.indexOf('api.weibo.cn/2/!/mi/api/sap') !== -1) {
    var o7 = parse();
    if (!o7) return;
    o7.data = [];
    done(o7);
    return;
  }

  // 8. 视频提醒气泡：不提醒
  if (url.indexOf('api.weibo.cn/2/video/remind_info') !== -1) {
    var o8 = parse();
    if (!o8) return;
    o8.exist_remind = false;
    done(o8);
    return;
  }

  // 9. 推送节点配置：删红包/签到/钱包/彩票/购物/活动类节点
  if (url.indexOf('api.weibo.cn/2/push/active') !== -1) {
    var o9 = parse();
    if (!o9) return;
    var BLOCK = {
      'RedPackets': 1, 'sign_gift': 1, 'promote': 1, 'daitou': 1,
      'leguagua': 1, 'choujiang': 1, 'stock': 1, 'ashares': 1,
      'jijin': 1, 'caipiao': 1, 'wccaipiao': 1, 'wcjingcai': 1,
      'worldcup_bocai': 1, 'jieqian': 1, 'jieqian1': 1, 'jieqian2': 1,
      'jieqian3': 1, 'jieqian4': 1, 'jieqian5': 1, 'licai': 1,
      'licai1': 1, 'licai2': 1, 'licai3': 1, 'licai4': 1,
      'xinyongka': 1, 'xinyongka1': 1, 'xinyongka2': 1, 'xinyongka3': 1,
      'jinrong': 1, 'jinrong1': 1, 'jinrong2': 1, 'jinrong3': 1,
      'mypay': 1, 'mypay1': 1, 'welfare': 1, 'fenqi': 1, 'jifen': 1,
      'card_coupon': 1, 'shop_order': 1, 'shop_cart': 1,
      'crowdfunding': 1, 'lucky_treasure': 1, 'daka': 1, 'wawa': 1,
      'yingqiu': 1, 'jingcai': 1, 'choumenghe': 1, 'fafacredit': 1,
      'dingzhi': 1, 'commercial_Service': 1, 'fansService': 1,
      'youxuan': 1, 'examination': 1, 'followremind': 1,
      'updateremind': 1, 'me_follow_updateremind': 1,
      'popular_activity': 1, 'fentiao_discount': 1, 'voucher': 1,
      'skin_list': 1, 'cover_list': 1, 'card_list': 1, 'avatar_list': 1,
      'themes': 1, 'custom_source': 1, 'card_background': 1,
      'card_privilegeone': 1, 'card_privilegetwo': 1,
      '230916': 1, '101926': 1, '230344': 1, '230655': 1,
      '230375': 1, '100001': 1, '230269': 1, '108803': 1,
      '108803_me': 1, '230619': 1, '230915': 1, '230771': 1,
      '230743': 1, '231126': 1, '230494': 1, '230548': 1,
      'markqiandao': 1, 'vip': 1, 'recall_info': 1, 'block': 1,
      'weibo_pop': 1, 'regret_pill': 1, 'my_store_all': 1,
      'my_store_revenu': 1, 'productcenter_dot': 1,
      'creator_card': 1, 'creator_title': 1, 'app_download': 1,
      'ceshi': 1, 'video_test': 1, 'wqtest': 1,
      'thedot_test': 1, 'thedot_test02': 1,
      'radar_card_coupon': 1, 'radar_uber': 1, 'radar_didi': 1,
      'radar_movie': 1, 'radar_tv': 1,
      'balance': 1, 'transaction': 1, 'order_gmv': 1
    };
    function blocked(id) {
      if (!id) return false;
      if (BLOCK[id]) return true;
      if (id.slice(0, 2) === 'm_' && BLOCK[id.slice(2)]) return true;
      return false;
    }
    function walk(x) {
      if (Array.isArray(x)) {
        var out = [];
        for (var i = 0; i < x.length; i++) {
          var el = x[i];
          if (el && typeof el === 'object' && !Array.isArray(el) && blocked(el.id)) continue;
          out.push(walk(el));
        }
        return out;
      }
      if (x && typeof x === 'object') {
        for (var k in x) x[k] = walk(x[k]);
      }
      return x;
    }
    var cleaned9 = walk(o9);
    if (cleaned9.feed_redpacket) cleaned9.feed_redpacket = {};
    done(cleaned9);
    return;
  }

  // 10. 我的页：删任务中心/活动/购物卡片，清钱包贷款类子项
  if (url.indexOf('api.weibo.cn/2/profile/me') !== -1) {
    var o10 = parse();
    if (!o10) return;
    var DROP_ITEMS = {
      '100505_-_newusertask': 1, '100505_-_renwu': 1,
      '100505_-_ewbshopping1': 1, '100505_-_jingran2026': 1,
      '100505_-_aibanliao': 1, '100505_-_chaoyouqu': 1
    };
    if (Array.isArray(o10.items)) {
      var kept = [];
      for (var i = 0; i < o10.items.length; i++) {
        var it = o10.items[i];
        if (it && DROP_ITEMS[it.itemId]) continue;
        if (it && it.itemId === 'mine_attent_title') continue;
        if (it && it.itemId && it.itemId.indexOf('100505_-_meattent') === 0) continue;
        if (it && it.header) {
          delete it.header.vipView;
          delete it.header.vipIcon;
        }
        if (it && Array.isArray(it.items)) {
          var subs = [];
          for (var j = 0; j < it.items.length; j++) {
            var sub = it.items[j];
            var ss = JSON.stringify(sub);
            if (it.itemId === '100505_-_mypay_new') {
              if (sub.adData) continue;
              if (/可借额度|应急额度|租·手机/.test(ss)) continue;
            }
            if (/微博购订单/.test(ss)) continue;
            subs.push(sub);
          }
          it.items = subs;
        }
        if (it && it.body && Array.isArray(it.body.items)) {
          var bsubs = [];
          for (var k = 0; k < it.body.items.length; k++) {
            var bs = it.body.items[k];
            var bss = JSON.stringify(bs);
            if (/组队活动|超友趣|金融服务/.test(bss)) continue;
            bsubs.push(bs);
          }
          it.body.items = bsubs;
        }
        kept.push(it);
      }
      var CUT_FROM = {
        '100505_-_recentlyuser': 1, '100505_-_mypay_new': 1,
        '100505_-_chaohua': 1, '100505_-_worldcup': 1,
        '100505_-_manage2': 1, 'mine_attent_title': 1
      };
      for (var ci2 = 0; ci2 < kept.length; ci2++) {
        var cid = kept[ci2] && kept[ci2].itemId;
        if (cid && (CUT_FROM[cid] || cid.indexOf('100505_-_meattent') === 0)) {
          kept = kept.slice(0, ci2);
          break;
        }
      }
      o10.items = kept;
    }
    done(o10);
    return;
  }

  // 11. 发博面板：删签到/红包/抽奖/锦鲤/股票/打卡/商品/付费类入口
  if (url.indexOf('api.weibo.cn/2/client/publisher_list') !== -1) {
    var o11 = parse();
    if (!o11) return;
    var DROP_NAMES = {
      '签到': 1, '红包': 1, '抽奖': 1, '锦鲤': 1, '股票': 1,
      '打卡': 1, '签到/点评': 1, '群签到': 1, '商品': 1,
      'V+专属内容': 1, '付费专栏': 1
    };
    if (Array.isArray(o11.elements)) {
      o11.elements = o11.elements.filter(function (el) {
        return !DROP_NAMES[el.app_name];
      });
    }
    done(o11);
    return;
  }

  // 12. 热门流：删推广帖
  if (url.indexOf('api.weibo.cn/2/statuses/container_timeline_hot') !== -1) {
    var o12 = parse();
    if (!o12) return;
    if (Array.isArray(o12.items)) {
      o12.items = o12.items.filter(function (it) {
        return JSON.stringify(it).indexOf('reallog_mark_ad') === -1;
      });
    }
    done(o12);
    return;
  }

  // 13. 关注页顶部直播行：清空直播故事流
  if (url.indexOf('api.weibo.cn/2/live/media_homelist') !== -1) {
    var o13 = parse();
    if (!o13) return;
    o13.data = [];
    done(o13);
    return;
  }

  // 14. 发现页：清搜索框推荐词、删中间轮播卡片
  if (url.indexOf('api.weibo.cn/2/search/finder') !== -1) {
    var o14 = parse();
    if (!o14) return;
    if (o14.channelInfo && Array.isArray(o14.channelInfo.channels)) {
      for (var ci = 0; ci < o14.channelInfo.channels.length; ci++) {
        var ch = o14.channelInfo.channels[ci];
        var li = ch && ch.payload && ch.payload.loadedInfo;
        if (li && Array.isArray(li.searchBarContent)) {
          li.searchBarContent = [{ word: ' ', tip: '', note: ' ', scheme: 'sinaweibo://searchall', ext: '' }];
        }
      }
    }
    if (o14.header && o14.header.data && Array.isArray(o14.header.data.items)) {
      for (var gi = 0; gi < o14.header.data.items.length; gi++) {
        var grp = o14.header.data.items[gi];
        if (grp && Array.isArray(grp.items)) {
          grp.items = grp.items.filter(function (s) {
            return !(s && s.data && s.data.itemid === 'finder_window');
          });
        }
      }
    }
    done(o14);
    return;
  }

  // 15. 搜索联想：清空猜你想搜（发现页搜索框点按后占位词由此回流）
  if (url.indexOf('api.weibo.cn/2/!/was/finder/searchbarchange') !== -1) {
    var o15a = parse();
    if (!o15a) return;
    o15a.suggestions = [];
    done(o15a);
    return;
  }

  // 16. 消息-动态流：删广告卡片（带 promotion/ad_tag 或 source=ad 的消息）
  if (url.indexOf('api.weibo.cn/2/messageflow/notice') !== -1) {
    var o15 = parse();
    if (!o15) return;
    if (Array.isArray(o15.messages)) {
      o15.messages = o15.messages.filter(function (m) {
        var mc = m && m.msg_card;
        if (!mc) return true;
        if (mc.promotion || mc.ad_tag) return false;
        if (mc.actionlog && mc.actionlog.source === 'ad') return false;
        return true;
      });
    }
    done(o15);
    return;
  }

  $done({});
})();
