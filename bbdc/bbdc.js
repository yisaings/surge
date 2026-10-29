let body = $response.body;

if (body) {
    try {
        let obj = JSON.parse(body);

        if (obj.data_body) {
            for (let key in obj.data_body) {
                let item = obj.data_body[key];
                
                if (item && typeof item === 'object' && item.hasOwnProperty('type')) {
                    item.type = "vip";
                    
                    // 改为 2035 年，避免时间戳溢出导致 App 解析报错
                    item.expire_date = "2035-12-31";
                    item.expire_timestamp = 2082643199000; 
                    
                    if (item.hasOwnProperty('quota')) {
                        item.quota = 999;
                    }
                }
            }
        }
        
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("解析报错: " + e);
        $done({});
    }
} else {
    $done({});
}
