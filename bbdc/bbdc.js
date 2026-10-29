// 确保响应有 body
if ($response.body) {
    try {
        let obj = JSON.parse($response.body);

        // 严格判断是否为目标接口的数据结构
        if (obj.data_body && obj.data_body.purchase) {
            
            // 1. 修改账户剩余的酷币总量显示为 999,999
            obj.data_body.purchase.coin_remain = 999999;
            
            // 2. 模拟拉满抵扣：假设原价是 298 元 (29800酷币)
            // 将本次可用的酷币和消耗的酷币直接拉满
            let fullCoin = obj.data_body.purchase.original_price_in_coin || 29800;
            let fullPrice = obj.data_body.purchase.original_price || 298;

            obj.data_body.purchase.coin_available = fullCoin;
            obj.data_body.purchase.coin_consumption = fullCoin;
            obj.data_body.purchase.coin_value = fullPrice;
            obj.data_body.purchase.deduction_price = fullPrice;

            // 3. 将还需要支付的现金和酷币差额改为 0
            obj.data_body.purchase.coin_shortage = 0;
            obj.data_body.purchase.purchase_price = 0;
            obj.data_body.purchase.purchase_price_in_coin = 0;
            
            // 4. 将购买方式标记为纯酷币购买（pure_coin_purchase = 1）
            obj.data_body.purchase.pure_coin_purchase = 1;
            
            // 5. 顺手修改一下用户公用信息的展示（如果有的话）
            if (obj.data_body.common) {
                obj.data_body.common.nickname = "超级富豪版";
            }
        }

        // 返回修改后的数据
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        // 解析失败说明不是 JSON 数据，原样放行
        console.log("JSON 解析失败或非目标接口: " + e);
        $done({});
    }
} else {
    $done({});
}
