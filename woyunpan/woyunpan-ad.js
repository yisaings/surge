// 联通云盘精简 v2：v1 全部 + 发现页娱乐 tab、会员权益展示、首页 AI 入戏入口
// - 开屏：/api/bff/resource/query/open-screen/app 的 result.openScreen（家庭智能体功能宣传）清空
// - 首页：/api/bff/homePage 的 recommend 里 code=home_banner 那项（联合会员横幅）删掉，相册故事保留；homeVideoCardDTO.videos（芒果内容卡）清空；function 里 title=AI入戏（芒果 TV 入口）删掉
// - 我的页：/api/bff/resource/query/mine-resource/app 的 data 里 resourceType=mine_fixed_operation_function 那组（活动中心）删掉
// - 工具箱：/api/bff/app/home/toolboxs 的 data 里 tabPosCode=TAB_EQUITY_DISCOUNTS_TOOLS 那 tab（权益优惠）删掉
// - 弹窗：/api/bff/resource/query/popupAndFlow 的 result.popups/result.widgets 置 null（本次已是 null，防御以后弹出）
// - 发现页：/api/bff/discovery/page/tab/list 的 result.tabList（云影院/芒果 TV/大学教育/云游戏/K12 课堂/欢视 TV/联通爱看/凤凰网，全是娱乐内容）清空
// - 会员权益：/api/bff/membershipBenefit/V2/displayMembershipBenefit 的 result（加密串）置空字符串
// 不动：diamond/function 其余导航、相册故事、智能搜索、备份/AI/格式转换等工具、会员入口与会员页、影院视频数据本身（tab 没了就进不去）、加密的 dispatcher、缩略图 CDN
var url = $request.url;
var body = $response.body;
try {
  var obj = JSON.parse(body);
  var result = obj.result;
  if (result) {
    if (url.indexOf('/resource/query/open-screen/app') !== -1) {
      if (result.openScreen) {
        result.openScreen = [];
      }
    } else if (url.indexOf('/api/bff/homePage') !== -1) {
      if (Array.isArray(result.recommend)) {
        result.recommend = result.recommend.filter(function (it) {
          return it.code !== 'home_banner';
        });
      }
      if (result.homeVideoCardDTO && Array.isArray(result.homeVideoCardDTO.videos)) {
        result.homeVideoCardDTO.videos = [];
      }
      if (Array.isArray(result.function)) {
        result.function = result.function.filter(function (it) {
          return it.title !== 'AI入戏';
        });
      }
    } else if (url.indexOf('/resource/query/mine-resource/app') !== -1) {
      if (Array.isArray(result.data)) {
        result.data = result.data.filter(function (it) {
          return it.resourceType !== 'mine_fixed_operation_function';
        });
      }
    } else if (url.indexOf('/app/home/toolboxs') !== -1) {
      if (Array.isArray(result.data)) {
        result.data = result.data.filter(function (it) {
          return it.tabPosCode !== 'TAB_EQUITY_DISCOUNTS_TOOLS';
        });
      }
    } else if (url.indexOf('/resource/query/popupAndFlow') !== -1) {
      result.popups = null;
      result.widgets = null;
    } else if (url.indexOf('/discovery/page/tab/list') !== -1) {
      if (Array.isArray(result.tabList)) {
        result.tabList = [];
      }
    } else if (url.indexOf('/membershipBenefit/V2/displayMembershipBenefit') !== -1) {
      obj.result = '';
    }
  }
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  $done({});
}
