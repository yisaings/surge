function main() {
    var arg = (typeof $argument !== 'undefined' && $argument) ? $argument : '';
    var m = arg.match(/(?:^|&)remove_splash=([^&]*)/);
    if (m && m[1] === '0') return $done({});
    var body = $response.body;
    var obj;
    try { obj = JSON.parse(body); } catch (e) { return $done({}); }
    if (obj && obj.data) {
        if (Array.isArray(obj.data.list)) obj.data.list = [];
        if (Array.isArray(obj.data.show)) obj.data.show = [];
    }
    $done({ body: JSON.stringify(obj) });
}

main();
