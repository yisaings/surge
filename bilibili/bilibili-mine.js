var DROP_IDS = {
    174: true,
    402: true,
    403: true,
    3607: true,
    406: true,
    2909: true,
    3046: true,
    968: true,
    990: true,
    4120: true
};

function main() {
    var arg = (typeof $argument !== 'undefined' && $argument) ? $argument : '';
    var m = arg.match(/(?:^|&)trim_mine=([^&]*)/);
    if (m && m[1] === '0') return $done({});
    var body = $response.body;
    var obj;
    try { obj = JSON.parse(body); } catch (e) { return $done({}); }
    if (!obj || !obj.data) return $done({});
    var d = obj.data;
    d.use_modular_vip_section = false;
    d.modular_vip_section = {};
    d.mall_home = null;
    if (Array.isArray(d.sections_v2)) {
        d.sections_v2.forEach(function (sec) {
            if (Array.isArray(sec.items)) {
                sec.items = sec.items.filter(function (it) { return !DROP_IDS[it.id]; });
            }
        });
    }
    $done({ body: JSON.stringify(obj) });
}

main();
