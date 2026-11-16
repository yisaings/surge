function operator(proxies) {
return proxies.map(function(p) {
var m = {hysteria2: 'hy2', hysteria: 'hy', shadowsocks: 'ss', wireguard: 'wg'};
var t = m[p.type] || p.type;
if (p.name.indexOf('')!== 0) p.name = '' + p.name;
return p;
});
}
