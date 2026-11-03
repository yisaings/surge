// 联通云盘精简 v1：只清无争议的营销，云盘核心（文件/备份/相册/工具）不动
// - 开屏：/api/bff/resource/query/open-screen/app 的 result.openScreen（家庭智能体功能宣传）清空
// - 首页：/api/bff/homePage 的 recommend 里 code=home_banner 那项（联合会员横幅）删掉，相册故事保留；homeVideoCardDTO.videos（芒果内容卡）清空
// - 我的页：/api/bff/resource/query/mine-resource/app 的 data 里 resourceType=mine_fixed_operation_function 那组（活动中心）删掉
// - 工具箱：/api/bff/app/home/toolboxs 的 data 里 tabPosCode=TAB_EQUITY_DISCOUNTS_TOOLS 那 tab（权益优惠）删掉
// - 弹窗：/api/bff/resource/query/popupAndFlow 的 result.popups/result.widgets 置 null（本次已是 null，防御以后弹出）
// 不动：diamond/function 导航、相册故事、智能搜索、备份/AI/格式转换等工具、会员入口与会员页、影院/发现页娱乐 tab（待定）、加密的 dispatcher 与会员权益串
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
    }
  }
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  $done({});
}
