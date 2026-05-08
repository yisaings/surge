let obj = JSON.parse($response.body);

try {

  // 开屏时间 0
  obj.splash_time_out = 0;

  // 自定义开屏关闭
  if (obj.custom_app_loading) {
    obj.custom_app_loading.open = 0;
    obj.custom_app_loading.show_time = 0;
    obj.custom_app_loading.show_skip_button = 1;
  }

  // 广告开始位置推迟到 999
  obj.ad_start_pos = 999;

  // 广告间隔巨大
  obj.ad_interval = 999;

  // 弹窗间隔
  obj.popup_interval = 999999;

  // 广告敏感度
  obj.ad_sensitivity_hot_default = 0;
  obj.ad_sensitivity_cold_default = 0;
  obj.ad_sensitivity_count = 0;
  obj.ad_sensitivity_time = 999999;

  // bit广告点击/展示限制
  if (obj.bit_ad) {
    obj.bit_ad.queue_length = 0;
    obj.bit_ad.imp_interval = [999999, 999999];
    obj.bit_ad.click_interval = [999999, 999999];
  }

} catch (e) {
  console.log(e);
}

$done({
  body: JSON.stringify(obj)
});