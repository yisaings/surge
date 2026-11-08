# 网易云畅听：用 Cloudflare Worker 共享 VIP，MUSIC_U 不出服务器

## 这是什么

网易云音乐的 VIP 凭证是 `MUSIC_U` 这个 Cookie。谁拿到它，谁就能以你的 VIP 身份听歌。

想把 VIP 分享给朋友，又不想把 `MUSIC_U` 直接给他——给他他就能转手再分享出去，还能烧你的额度。

这个方案用 Cloudflare Worker 做透明网关：

- `MUSIC_U` 只存在 Worker 的 Secret 里，永不下发到手机
- 朋友手机上只装一个 Surge 模块，填一个你发的口令
- 口令 + 设备绑定双重校验，一个口令只能绑一台设备
- 你随时可以在 Cloudflare 后台删口令、删绑定，立即失效

## 原理

```
朋友手机 (Surge)
  │  POST interface3.music.163.com/xeapi/song/...
  │  (Surge 脚本把域名改成你的 Worker 域名，
  │   带上 X-Auth-Token / X-Device-Id / X-Device-Secret)
  ▼
Cloudflare Worker (你的域名)
  │  1. 校验口令在不在 TOKENS 里，不在 → 403
  │  2. 查 KV bind:<口令>，没绑定过 → 记下这台设备
  │     已绑定 → deviceId/secret 对不上 → 403
  │  3. 把请求原样转发给 interface3.music.163.com，
  │     在服务器端注入 MUSIC_U，透传客户端真实 IP
  │  4. 响应剥掉 Set-Cookie 再返回，MUSIC_U 不回流
  ▼
网易云服务器
```

关键点：

- **不是 Mock**：脚本只改 URL 和请求头，用 `$done({url, headers})` 让 Surge 原生发请求，响应是网易云真实返回的，不触发 VPN 检测
- **MUSIC_U 隔离**：手机发出的请求里没有 `MUSIC_U`，抓包也抓不到；响应里的 `Set-Cookie` 被 Worker 剥掉
- **口令可撤销**：TOKENS 里删掉某个口令，该口令立刻失效
- **设备绑定**：一个口令首次使用即绑定该设备，换设备要你手动在 KV 里删绑定

## 准备

- 一个 Cloudflare 账号（免费版即可）
- 一台装有 Surge 的 iPhone/iPad
- 一个网易云 VIP 账号的 `MUSIC_U`（从浏览器登录网易云后从 Cookie 里取，或用抓包工具抓）
- 一个域名（可选，用于 Worker 自定义域名；也可以直接用 `*.workers.dev`）

## 第一步：创建 Worker

1. 登录 Cloudflare Dashboard → Workers 和 Pages → 创建 Worker
2. 起个名字，比如 `netease-gateway`
3. 把下面这段代码粘贴进去，点「部署」

```javascript
export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    var token = request.headers.get('X-Auth-Token');
    var tokens = (env.TOKENS || '').split(',').map(function(s) { return s.trim(); }).filter(Boolean);
    if (tokens.indexOf(token) === -1) {
      return new Response('Forbidden', { status: 403 });
    }
    var deviceId = request.headers.get('X-Device-Id') || '';
    var deviceSecret = request.headers.get('X-Device-Secret') || '';
    var deviceName = request.headers.get('X-Device-Name') || '';
    if (!deviceId || !deviceSecret) {
      return new Response('Missing device binding', { status: 403 });
    }
    var kv = env.BINDINGS;
    var bindKey = 'bind:' + token;
    var binding = null;
    try {
      var raw = await kv.get(bindKey);
      if (raw) binding = JSON.parse(raw);
    } catch (e) {}
    if (!binding) {
      binding = { deviceId: deviceId, secret: deviceSecret, name: deviceName, created: new Date().toISOString() };
      await kv.put(bindKey, JSON.stringify(binding));
    } else {
      if (binding.deviceId !== deviceId || binding.secret !== deviceSecret) {
        return new Response('Device not bound', { status: 403 });
      }
      if (deviceName && binding.name !== deviceName) {
        binding.name = deviceName;
        await kv.put(bindKey, JSON.stringify(binding));
      }
    }
    var clientIP = request.headers.get('CF-Connecting-IP') || '114.114.114.114';
    var url = new URL(request.url);
    var targetUrl = 'https://interface3.music.163.com' + url.pathname + url.search;
    var newHeaders = new Headers();
    for (var pair of request.headers.entries()) {
      var key = pair[0];
      var value = pair[1];
      var lowerKey = key.toLowerCase();
      if (!lowerKey.startsWith('cf-') && !lowerKey.startsWith('x-forwarded-') && lowerKey !== 'x-auth-token' && lowerKey !== 'x-device-id' && lowerKey !== 'x-device-secret' && lowerKey !== 'x-device-name' && lowerKey !== 'host') {
        newHeaders.set(key, value);
      }
    }
    newHeaders.set('Host', 'interface3.music.163.com');
    newHeaders.set('X-Real-IP', clientIP);
    newHeaders.set('X-Forwarded-For', clientIP);
    var musicU = env.MUSIC_U;
    if (!musicU) {
      return new Response(JSON.stringify({ ok: false, error: 'no_music_u' }), { status: 500 });
    }
    var cookie = newHeaders.get('Cookie') || newHeaders.get('cookie') || '';
    if (cookie.indexOf('MUSIC_U=') !== -1) {
      cookie = cookie.replace(/MUSIC_U=[^;]+/, 'MUSIC_U=' + musicU);
    } else {
      cookie = cookie ? cookie + '; MUSIC_U=' + musicU : 'MUSIC_U=' + musicU;
    }
    newHeaders.set('Cookie', cookie);
    var body = await request.arrayBuffer();
    var response = await fetch(targetUrl, {
      method: 'POST',
      headers: newHeaders,
      body: body,
    });
    var respHeaders = new Headers(response.headers);
    respHeaders.delete('set-cookie');
    return new Response(response.body, {
      status: response.status,
      headers: respHeaders,
    });
  },
};
```

## 第二步：创建 KV 命名空间

1. Cloudflare Dashboard → Workers 和 Pages → KV → 创建命名空间，名字比如 `BINDINGS`
2. 回到你的 Worker → 设置 → 变量 → KV 命名空间绑定 → 添加绑定
   - 变量名：`BINDINGS`
   - KV 命名空间：选刚创建的那个

## 第三步：配置环境变量

Worker → 设置 → 变量 → 添加变量（全部选「生产」环境，类型选「密钥」更安全）：

| 变量名 | 值 | 说明 |
| --- | --- | --- |
| `MUSIC_U` | 你的网易云 VIP 账号的 MUSIC_U | 只存在服务器，永不下发 |
| `TOKENS` | `口令1,口令2,口令3` | 英文逗号分隔，无空格；一个口令对应一个人 |

口令自己生成，建议用长随机串，比如 `openssl rand -hex 16`。

**每次改完变量都要点「部署」，否则不生效。**

## 第四步：绑定自定义域名（可选）

Worker → 设置 → 触发器 → 添加自定义域，比如 `wyy.example.com`。

不用自定义域名也可以，直接用 Worker 自带的 `*.workers.dev` 域名。但自定义域名更稳定，也更好记。

记下你的 Worker 地址，下面要用。

## 第五步：安装 Surge 模块

把下面的 Surge 模块保存为 `.sgmodule` 文件，或直接用链接安装。

模块里有 5 条规则：

1. **歌曲播放与详情**：`/song/`（排除点红心/取消红心，红心留在自己号上）
2. **歌单详情**：`/playlist/`（排除创建/删除/收藏/加歌删歌，这些操作留在自己号上）
3. **VIP 与音质鉴权**：`vipauth` / `privilege` / `soundquality` / `user/setting` 等
4. **皮肤与装扮**：`playermode` / `vip-dress` / `dress` / `usertool`
5. **页面净化**（http-response）：首页 Tab、推荐流、Banner、弹窗清理（脚本：Yu9191/NeteasemusicAd 的 `wyyad.js`）

```ini
#!name=网易云畅听
#!desc=畅听 VIP 歌曲。
#!category=Sgmodule
#!arguments=TOKEN:口令,NAME:备注
#!arguments-desc=TOKEN:填入专属口令\nNAME:填设备备注，如张三的手机，不填留空\n\n
[Script]
歌曲播放与详情 = type=http-request,pattern=^https?:\/\/interface\d?\.music\.163\.com\/x?eapi\/(?:v\d+\/)?song\/(?!(?:like|dislike)),requires-body=true,script-path=https://raw.githubusercontent.com/yisaings/surge/main/netease/netease-gateway-client-redirect-1794142900.js,argument=TOKEN={{{TOKEN}}}&NAME={{{NAME}}}
歌单详情 = type=http-request,pattern=^https?:\/\/interface\d?\.music\.163\.com\/w?x?e?api\/(?:homepage\/|v\d+\/)?playlist\/(?!(?:delete|subscribe|unsubscribe|create|update|manipulate|tracks)),requires-body=true,script-path=https://raw.githubusercontent.com/yisaings/surge/main/netease/netease-gateway-client-redirect-1794142900.js,argument=TOKEN={{{TOKEN}}}&NAME={{{NAME}}}
VIP与音质鉴权 = type=http-request,pattern=^https?:\/\/interface\d?\.music\.163\.com\/x?eapi\/(?:vipnewcenter|vipauth|music\/privilege|soundquality|song\/enhance\/privilege|v\d+\/user\/vip|user\/setting),requires-body=true,script-path=https://raw.githubusercontent.com/yisaings/surge/main/netease/netease-gateway-client-redirect-1794142900.js,argument=TOKEN={{{TOKEN}}}&NAME={{{NAME}}}
皮肤与装扮 = type=http-request,pattern=^https?:\/\/interface\d?\.music\.163\.com\/x?eapi\/(?:playermode|vip-dress|dress|usertool),requires-body=true,script-path=https://raw.githubusercontent.com/yisaings/surge/main/netease/netease-gateway-client-redirect-1794142900.js,argument=TOKEN={{{TOKEN}}}&NAME={{{NAME}}}
网易云页面净化 = type=http-response,pattern=^https?:\/\/interface(\d+)?\.music\.163\.com\/x?e?api\/(v\d\/)?(link\/home\/framework\/(top\/)?tab|link\/page\/(rcmd|discovery)\/|homepage\/block\/page|discovery\/recommend\/resource|sp\/flow\/popup|vipactivity|link\/position\/show|batch),requires-body=true,binary-body-mode=true,max-size=3145728,script-path=https://raw.githubusercontent.com/yisaings/surge/main/netease/netease-clean-1794139322.js
[MITM]
hostname = %APPEND% interface.music.163.com, interface3.music.163.com
```

**注意**：页面净化脚本来自 [Yu9191/NeteasemusicAd](https://github.com/Yu9191/NeteasemusicAd) 的 `wyyad.js`，在此致谢。

**致谢**：本地 VIP 注入方案参考了 [anyehttp/quantumult-x](https://github.com/anyehttp/quantumult-x) 的 `wyy-s.js`（作者暗夜），网关方案是在此基础上把 MUSIC_U 从本地移到服务器。

**注意**：客户端 JS 里的 Worker 域名要改成你自己的：

```javascript
var workerHost = 'wyy.example.com';  // 改成你的 Worker 域名
```

## 第六步：填口令，开始用

1. 在 Surge 里安装上面那个模块
2. 模块参数里填入：
   - **口令**：你在 TOKENS 里给这个人生成的那个口令
   - **备注**：填个名字，比如「张三的手机」，方便你在 KV 里分辨是谁的设备
3. 杀掉网易云 App，冷启动，播放一首 VIP 歌曲

第一次播放成功，KV 里就会多一条 `bind:<口令>` 的记录，里面是这台设备的 deviceId、secret、备注和绑定时间。

## 日常管理

### 给新人开口令

1. 生成一个新口令，加进 TOKENS（英文逗号分隔），部署
2. 把口令发给对方，对方装模块、填口令、填备注，第一次播放即绑定

### 撤销某人口令

TOKENS 里删掉他的口令，部署，立即失效。

### 对方换设备

KV 里找到 `bind:<他的口令>`，删掉，重新部署（不用改代码，删 KV 键即时生效）。他换新设备第一次播放即重新绑定。

### 查看谁在用

KV → BINDINGS → 点开 `bind:<口令>`，能看到 deviceId、name、created。

## 安全说明（先说清楚）

这个方案防的是「顺手分享」，不是防「蓄意逆向」：

- **能防住的**：朋友把口令转发给别人，别人拿去用不了（设备绑定）；朋友抓包看不到 `MUSIC_U`（只在服务器）；你随时能吊销口令和设备
- **防不住的**：朋友本人抠出 X-Auth-Token 和设备密钥，在另一台设备上伪造相同的 deviceId/secret（需要懂抓包和改请求头）；朋友把整个手机借给别人用
- **口令本身就是凭证**：谁拿到口令 + 设备密钥就能用，所以口令要够长够随机，别用 `123456` 这种
- **Cookie 隔离未做**：朋友自己的 Cookie 会经过 Worker 透传给网易云（请求成立需要），Worker 代码里不记录请求头/体，但 Cloudflare 后台可能有基础请求统计

一句话：这是一套「提高滥用成本」的方案，不是绝对防复制。适合分享给信任的朋友，不适合公开售卖。

## 常见问题

**Q：提示「检测到您开启了 VPN」？**

先查口令对不对。口令不对、Worker 回 403，App 就会弹这个提示。确认 TOKENS 里有你填的口令、Worker 已重新部署、模块里的口令一字不差。

**Q：只能试听 28 秒？**

`MUSIC_U` 可能失效了。重新抓一个新的 `MUSIC_U` 换进 Worker 的 Secret，重新部署。

**Q：音质选了又跳回标准？**

用户设置接口（`/xeapi/user/setting`）也要走网关，模块规则 3 里已经包含了。如果你用的是旧版模块，更新到最新版。

**Q：歌词加载失败、歌名显示未知？**

这是口令被拒的典型表现。检查口令、检查设备绑定（KV 里是不是绑了别的设备）。

**Q：换了口令还是能播？**

可能原因：①改完 TOKENS 没点部署；②App 缓存了上次的播放地址，换首没放过的歌试试；③模块没更新，Surge 缓存了旧脚本，删了重装 + 冷启动。

**Q：一个口令能几台设备用？**

一台。首次使用即绑定，换设备要你去 KV 删绑定。

## 完整代码

Worker、客户端 JS、模块文件都在 GitHub：

https://github.com/yisaings/surge/tree/main/netease

- `netease-gateway-client-redirect-1794142900.js`：Surge 客户端（改 URL + 带设备头）
- `netease-clean-1794139322.js`：页面净化脚本（Yu9191/NeteasemusicAd 的 `wyyad.js`）
- `netease-gateway.sgmodule`：Surge 模块

---

交流无罪。
