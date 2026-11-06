function main() {
    var arg = (typeof $argument !== 'undefined' && $argument) ? $argument : '';
    var trimTab = true;
    var removeLive = true;
    var m1 = arg.match(/(?:^|&)trim_tab=([^&]*)/);
    if (m1 && m1[1] === '0') trimTab = false;
    var m2 = arg.match(/(?:^|&)remove_live=([^&]*)/);
    if (m2 && m2[1] === '0') removeLive = false;
    var body = $response.body;
    var obj;
    try { obj = JSON.parse(body); } catch (e) { return $done({}); }
    if (!obj || !obj.data) return $done({});
    if (removeLive && Array.isArray(obj.data.tab)) {
        obj.data.tab = obj.data.tab.filter(function (t) { return t.name !== '直播'; });
    }
    if (trimTab && Array.isArray(obj.data.bottom)) {
        obj.data.bottom = obj.data.bottom.filter(function (t) { return t.name !== '会员购'; });
    }
    $done({ body: JSON.stringify(obj) });
}

main();
