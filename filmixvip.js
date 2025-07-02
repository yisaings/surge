// Surge Script to unlock Filmix VIP

let body = $response.body;
let obj = JSON.parse(body);

// 修改 VIP 状态字段
obj.is_vip = true;
obj.vip_level = 2;  // 可以自定义等级
obj.vip_start_time = "2024-01-01T00:00:00.000Z";
obj.vip_end_time = "2099-12-31T23:59:59.999Z";
obj.first_vip_start_time = "2024-01-01T00:00:00.000Z";

// 如有 token 校验，建议保持原样，以下字段原样保留
// obj.token = obj.token;
// obj.app_account_token = obj.app_account_token;

$done({ body: JSON.stringify(obj) });