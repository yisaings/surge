# Surge Scripts & Modules

个人自用的 Surge 脚本与模块仓库：去广告净化与 App 界面精简。

> 适用 Surge iOS / macOS。涉及 HTTPS 解密的模块需先安装并信任 Surge 证书（MITM），否则脚本不生效。模块没效果时，先清 App 缓存或删了重装模块再看。

---

## 广告拦截（基础层）

本仓库各模块是在下面这套基础广告拦截开着的环境下抓包、开发的；只装模块不加这套基础层，部分广告可能还在（抓包时它们已经被这套规则拦了，包里看不到）。

```ini
# Unbreak（防止部分广告规则误杀正常服务）
RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/UnBan.list,DIRECT

# 广告规则
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/release/rule/Surge/Advertising/Advertising.list,REJECT

# 广告域名规则
DOMAIN-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/release/rule/Surge/Advertising/Advertising_Domain.list,REJECT

# 劫持规则
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/release/rule/Surge/Hijacking/Hijacking.list,REJECT
```

去广告总模块，请挪到模块位置第一个：

🔗 `https://raw.githubusercontent.com/QingRex/LoonKissSurge/refs/heads/main/Surge/Beta/广告平台拦截器.beta.sgmodule`

---

## 目录结构

| 目录 | 内容 |
| --- | --- |
| `10010/` | 中国联通精简、联通 Cookie 获取 |
| `manmanbuy/` | 慢慢买去广告 |
| `smzdm/` | 什么值得买去广告 |
| `baidumap/` | 百度地图精简 |
| `baidupan/` | 百度网盘精简 |
| `bilibili/` | 哔哩哔哩茧房 |
| `didi/` | 滴滴精简 |
| `dongqiudi/` | 懂球帝去广告规则 |
| `gaode/` | 高德精简 |
| `nodeseek/` | NodeSeek 每日签到 |
| `qqmusic/` | QQ 音乐去广告 |
| `skyworth/` | 创维智慧云精简 |
| `umetrip/` | 航旅纵横精简 |
| `woyunpan/` | 联通云盘精简 |
| `xiaodu/` | 小度精简 |
| `yingshiyun/` | 萤石云视频精简 |
| `tianyiyunpan/` | 天翼云盘精简 |
| `weibo/` | 微博去广告 |
| `xiaomispeaker/` | 小米音箱去广告 |
| `ctrip/` | 携程去广告 |
| `yuchangxing/` | 渝畅行精简 |
| `tieba/` | 百度贴吧精简 |
| `wannianli/` | 万年历去广告解锁 |
| `zhihu/` | 知乎精简 |
| `loopback/` | Local Device Loopback（10.7.0.1 回环） |
| `xcurrency/` | 极简汇率 VIP Mock |
| `CSL-Monitor.js` | 中超比赛监控 Scriptable 小组件 |
| `CDT-Monitor-scriptable.js` / `CDT-Monitor-scripting.tsx` | CDT Monitor 配套文件 |

---

## 模块一览

测试版本指该模块实测通过时的 App 版本；App 升级后若失效，欢迎反馈。

### 1. 中国联通精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/10010/10010NoAds.sgmodule`

首页、我的页去营销，商城、权益空白。

测试版本：13.0200（已验证）。

### 2. 联通 Cookie 获取

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/10010/Get-10010-Cookie.sgmodule`

打开联通手机营业厅 App 抓 Cookie，抓到后可把脚本与 MITM 两项填 `#` 禁用。脚本原作者：[@dompling](https://github.com/dompling)。

测试版本：13.0200（同联通 App，已验证）。

### 3. 慢慢买去广告

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/manmanbuy/manmanbuy.sgmodule`

去红包弹窗与红包卡。

测试版本：5.2.51.1（已验证）。

### 4. 什么值得买去广告

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/smzdm/smzdm.sgmodule`

去红包卡、横幅与开屏广告。

测试版本：11.2.3（已验证）。

### 5. 百度地图精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/baidumap/baidumap.sgmodule`

去营销区与我的页营销卡。

测试版本：22.1.20.1（已验证）。

### 6. 百度网盘精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/baidupan/baidupan.sgmodule`

去开屏、弹窗与我的页营销卡。

测试版本：13.36.5（已验证）。

### 7. 哔哩哔哩茧房

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/bilibili/Fuck-jianfang.sgmodule`

替换首页推荐流，打破信息茧房。核心逻辑移植与启发自 [lixing23/Fuck-jianfang](https://github.com/lixing23/Fuck-jianfang)。

测试版本：9.18.0（已验证）。

### 8. 滴滴精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/didi/didi.sgmodule`

首页只留叫车服务，我的页去营销卡。

测试版本：8.0.18（已验证）。

### 9. 懂球帝去广告

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/dongqiudi/dongqiudi.list`

纯域名规则，拦广告联盟与开屏分发。

测试版本：—（纯域名规则，无 App 版本）。

### 10. 高德精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/gaode/gaode.sgmodule`

只留地图与导航，去营销与推荐流。

测试版本：17.3.0（已验证）。

### 11. NodeSeek 每日签到

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/nodeseek/NodeSeekDailyBonus.sgmodule`

NodeSeek 论坛每日签到。脚本原作者：[@Sliverkiss](https://github.com/Sliverkiss)。

测试版本：—（网页版，无 App 版本）。

### 12. QQ 音乐去广告

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/qqmusic/qqmusic.sgmodule`

拦广告与上报，不破 VIP。

测试版本：20.9.8（已验证）。

### 13. 创维智慧云精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/skyworth/skyworth.sgmodule`

首页轮播与横幅空白，拦开屏广告。

测试版本：3.12.9（已验证）。

### 14. 航旅纵横精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/umetrip/umetrip.sgmodule`

精简首页、我的页与社区，去推广营销。

测试版本：8.6.7（待验证）。

### 15. 联通云盘精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/woyunpan/woyunpan.sgmodule`

去开屏、会员横幅与营销行，文件功能不动。

测试版本：6.5.0（已验证）。

### 16. 小度精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/xiaodu/xiaodu.sgmodule`

首页只留回家看看与通话，去商城与会员推广。

测试版本：6.0.0（已验证）。

### 17. 萤石云视频精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/yingshiyun/yingshiyun.sgmodule`

清空营销与商城内容，我的页只留三项。

测试版本：7.9.6（已验证）。

### 18. 天翼云盘精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/tianyiyunpan/tianyiyunpan.sgmodule`

只留网盘功能，去横幅与会员推广。

测试版本：11.1.1（已验证）。

### 19. 微博去广告

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/weibo/weibo.sgmodule`

去推广，只留社交本体。

测试版本：16.11.0（已验证）。

### 20. 小米音箱去广告

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/xiaomispeaker/xiaomispeaker.sgmodule`

去广告、弹窗与会员推销，控制不动。

测试版本：3.0.0（已验证）。

### 21. 携程去广告

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/ctrip/ctrip.sgmodule`

去广告位与上报，预订不动。

测试版本：8.97.2（已验证）。

### 22. 渝畅行精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/yuchangxing/yuchangxing.sgmodule`

只留乘车功能，去广告与动态流。

测试版本：1.29.0（待验证）。

### 23. 万年历去广告解锁

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/wannianli/wannianli.sgmodule`

App Store：`https://apps.apple.com/tr/app/%E4%B8%87%E5%B9%B4%E5%8E%86-%E6%97%A5%E5%8E%86%E5%A4%A9%E6%B0%94%E9%BB%84%E5%8E%86%E5%86%9C%E5%8E%86%E6%9F%A5%E8%AF%A2%E5%B7%A5%E5%85%B7/id419805549`

去广告，解锁 VIP。

测试版本：7.5.9（已验证）。

### 24. 百度贴吧精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/tieba/tieba.sgmodule`

只留帖子查看，去视频、直播与广告。

测试版本：22.13.3.0（已验证）。

### 25. 知乎精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/zhihu/zhihu.sgmodule`

只留问答，去视频、直播、广告与各类推荐。

测试版本：11.14.0（已验证）。

### 26. Scriptable 小组件

- `CSL-Monitor.js`：中超比赛监控小组件。
- `CDT-Monitor-scriptable.js` / `CDT-Monitor-scripting.tsx`：CDT Monitor 配套文件。

### 27. Local Device Loopback

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/loopback/loopback.sgmodule`

把 10.7.0.1 回环到本机，供设备端开发者工具使用。

测试版本：—（网络配置，无 App 版本）。

### 28. 极简汇率 VIP Mock

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/xcurrency/xcurrency.sgmodule`

App Store：`https://apps.apple.com/tr/app/currency-converter-xcurrency/id851033695`

本地修改极简汇率会员接口响应。

测试版本：—（未验证）。
