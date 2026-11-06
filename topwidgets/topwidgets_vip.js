let body = $response.body;
if (body) {
    try {
        let obj = JSON.parse(body);
        if (obj.data) {
            obj.data.level = 1;
            obj.data.levelIDFA = 1;
            obj.data.isVip = true;
            obj.data.recovered = true;
            obj.data.recoverable = true;
            obj.data.recoveredIDFA = true;
            obj.data.recoverableIDFA = true;
            obj.data.vipEndTime = 4070880000;
            obj.data.vipType = "permanent";
        }
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("TopWidgets VIP 脚本解析失败: " + e);
        $done({});
    }
} else {
    $done({});
}
