let body = $response.body;
if (body) {
    try {
        let obj = JSON.parse(body);
        if (obj && obj.data && Array.isArray(obj.data) && obj.data.length > 0) {
            let item = obj.data[0];
            item.vipStatus = "paid";
            item.vipLevel = "senior";
            item.vipPayNum = 1;
            item.expireDate = "2099-12-31 23:59:59";
            item.benefits = [
                "ad_free",
                "custom_bank",
                "live_rates"
            ];
            body = JSON.stringify(obj);
        }
    } catch (e) {
        console.log("xCurrency VIP script error: " + e);
    }
}
$done({ body });
