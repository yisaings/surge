let body = $response.body;

if (body) {
    try {
        let obj = JSON.parse(body);

        if (obj.data_body) {
            // 遍历 data_body 下的所有字段
            for (let key in obj.data_body) {
                let item = obj.data_body[key];
                
                // 找到包含 vip 信息的对象并强制修改
                if (item && typeof item === 'object' && item.hasOwnProperty('type')) {
                    // 如果原本不是 VIP，也可以强制改为 vip
                    item.type = "vip";
                    // 延长有效期至 2099 年 12 月 31 日
                    item.expire_date = "2099-12-31";
                    item.expire_timestamp = 4102415999000; // 2099年的时间戳
                    
                    // 如果有配额（如 wordlist_vip 的 quota），顺手改大
                    if (item.hasOwnProperty('quota')) {
                        item.quota = 999;
                    }
                }
            }
        }
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        $done({});
    }
} else {
    $done({});
}
