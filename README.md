# Surge Scripts & Modules

个人自用的 Surge 脚本与模块仓库：去广告净化、App 界面精简、签到自动化，以及两个 Scriptable 小组件。

> 适用 Surge iOS / macOS。涉及 HTTPS 解密的模块需先安装并信任 Surge 证书（MITM），否则脚本不生效。

---

## 目录结构

| 目录 | 内容 |
| --- | --- |
| `10010/` | 中国联通去广告、联通 Cookie 获取 |
| `baidumap/` | 百度地图精简 |
| `baidupan/` | 百度网盘精简 |
| `bilibili/` | 哔哩哔哩推荐流替换 |
| `didi/` | 滴滴精简 |
| `dongqiudi/` | 懂球帝去广告规则 |
| `gaode/` | 高德地图精简 |
| `nodeseek/` | NodeSeek 每日签到 |
| `qqmusic/` | QQ 音乐去广告 |
| `skyworth/` | 创维智慧云精简（脚本返空版） |
| `umetrip/` | 航旅纵横精简 |
| `woyunpan/` | 联通云盘精简 |
| `xiaodu/` | 小度精简 |
| `yingshiyun/` | 萤石云视频精简 |
| `CSL-Monitor.js` | 中超比赛监控 Scriptable 小组件 |
| `CDT-Monitor-scriptable.js` / `CDT-Monitor-scripting.tsx` | CDT Monitor 配套文件 |

---

## 模块一览

### 1. 萤石云视频精简（VideoGo）

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/yingshiyun/yingshiyun.sgmodule`

- 首页服务专区整卡清空、云盘汇总置空、服务入口那排清空。
- 对话（系统机器人 / 家庭会话 / 消息汇总）、社区、商城瀑布流内容清空；“我的”界面只留管理中心、服务中心、工具。
- 另有 3 条 http-request 规则清掉社区、首页配置、商城的缓存校验头，强制回全量再掏空。
- 已知限制（接口层改不了）：底部对话 / 商城 / 社区三个按钮是 App 原生写死的，只能掏空内容；首页天气本版恢复原样，空白字段照样会被 App 判为获取失败。

### 2. 创维智慧云精简（脚本返空版）

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/skyworth/skyworth.sgmodule`

- 对 `allBannerConfig` 接口直接返回 `{}`：首页顶部轮播 banner 与“我的”中间 banner 位一起消失。
- 已知限制（接口层改不了）：轮播图没了，但那个占位框是 App 原生布局，空白还在；底部消息 / 云服务按钮与“我的”页增值服务卡同样是原生写死的。

### 3. 哔哩哔哩推荐流替换（Fuck 茧房）

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/bilibili/Fuck-jianfang.sgmodule`

- 替换 B 站首页推荐流，打破信息茧房。
- 长按模块可调运行模式：`popular`（热门池）、`crossregion`（跨分区）、`niche`（冷门优质）、`weekly`（每周必看）、`fresh`（新号模式）、`upmaster`（UP 主画像，需配合 UP 主名称）。
- 来源致谢：核心逻辑移植与启发自 [lixing23/Fuck-jianfang](https://github.com/lixing23/Fuck-jianfang)。

### 4. 中国联通去广告

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/10010/10010NoAds.sgmodule`

- v3（MITM 新增 m.10010.com 与 card.10010.com，需删模块重装）：在 v2 基础上再清首页脚手架营销模块（特惠购机 / 爆款套餐 / 靓号种草 / 极速宽带 / 瀑布流）、商城瀑布流与首页商品、服务提醒、我的页彩铃 / 积分商品 / 钱包借钱备用金 / 套餐升级卡 / 设备推广 / 精准营销 / 神券；商城页会空，套餐本身、积分数字、本机设备、话费优惠与我的钱包保留。

### 5. 联通 Cookie 获取

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/10010/Get-10010-Cookie.sgmodule`

- 联通手机营业厅 Cookie 获取模块，带参数面板，抓到后可把脚本与 MITM 两项填 `#` 禁用。
- 脚本原作者：[@dompling](https://github.com/dompling)（本模块引用其 Script 仓库中的联通脚本）。

### 6. NodeSeek 每日签到

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/nodeseek/NodeSeekDailyBonus.sgmodule`

- NodeSeek 论坛每日签到模块，定时任务走 cron，签到时间可在模块参数面板里改；Token 抓到后可把获取脚本与 MITM 两项填 `#` 禁用。
- 脚本原作者：[@Sliverkiss](https://github.com/Sliverkiss)（本模块引用其 nodeseek.js）。

### 7. 懂球帝去广告

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/dongqiudi/dongqiudi.list`

- 纯域名规则列表，屏蔽懂球帝内置的广告联盟、开屏广告分发与追踪域名。按 Surge 规则集方式引用。

### 8. 高德地图精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/gaode/gaode.sgmodule`

- 只留地图功能：工具栏只留骑行 / 公交地铁 / 步行 / 离线地图 / 收藏夹，清掉酒店 / 营销图层及首页 / 探索 / 我的页营销卡，探索只剩顶上原生搜索框。
- 已知限制：底部 tab 是原生写死的，动不了；搜索页分类行未进响应体，属本地缓存或原生兜底，脚本过滤不了。

### 9. 百度地图精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/baidumap/baidumap.sgmodule`

- 只留地图 / 导航 / 搜索，去打车 / 酒店 / 电商 / 营销 / 广告及统计 SDK；周边 AI 推荐全清。
- 已知限制：底部 tab 与分类行图标上的神券 / 油补角标是原生或图标图自带的，接口去不掉。

### 10. 小度精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/xiaodu/xiaodu.sgmodule`

- 首页只留回家看看 + 小度通话；资源广场 / 会员 / 商城内容清空、底部会员 tab 消失；我的页营销已清。
- 已知限制：我的页收藏行与头像下签到金条是原生写死的，去不掉。

### 11. QQ 音乐去广告

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/qqmusic/qqmusic.sgmodule`

- 纯 `[URL Rewrite]` reject，无 JS：只拦广告与上报域名。
- 已知限制：主接口响应全加密，推荐页 / 我的页推广位、绿钻入口挑不出来；不破 VIP。

### 12. 百度网盘精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/baidupan/baidupan.sgmodule`

- 我的页 usercard / coins / gamecenter / gamematerial 数据清空。
- 已知限制：三处原生框、AI 点数 / 资产行、玩寻道卡没有可控接口，保持现状；个别超大响应体（约 1MB 以上）受 Surge 脚本上限影响，过滤不生效。

### 13. 滴滴精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/didi/didi.sgmodule`

- 顶部只留出行；首页服务网格只留 5 个叫车服务（打车 / 顺风车 / 代驾 / 城际拼车 / 特价拼车）；我的页删会员卡 / 营销卡 / 企业服务卡，工具与钱包只留核心项；清开屏海报弹窗与通知弹窗营销。
- 注意：ad_oss 不是纯广告桶，功能图标也走它，不能整路 reject，本模块只拦 adtrack 上报。

### 14. 航旅纵横精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/umetrip/umetrip.sgmodule`

- 纯 `[URL Rewrite]` reject，无 JS：只留登机相关，拦社区、活动（含行程页运营横幅）、上报与免税购物图。
- 已知限制：底部原生 tab 去不掉，社区 tab 点进去空白 / 加载失败；首页接口无响应体，首页营销卡片动不了；活动接口混有一句删行程确认，删行程功能可能受影响，查看行程不受影响。

### 15. 联通云盘精简

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/woyunpan/woyunpan.sgmodule`

- 清开屏、首页会员横幅与芒果视频卡及 AI 入戏入口、我的页活动中心、工具箱权益优惠 tab、发现页全部娱乐 tab、会员权益展示、弹窗与 mixpanel 上报。
- 不动文件 / 备份 / 相册 / 工具与会员入口。

### 16. Scriptable 小组件

- **CSL Monitor**（`CSL-Monitor.js`，v1.2.0）：中超比赛监控，仅支持大尺寸小组件。
- **CDT Monitor**（`CDT-Monitor-scriptable.js` / `CDT-Monitor-scripting.tsx`）：与 CDT Monitor 配套的 Scriptable 文件。

---

## 安装

1. 复制上方需要的模块 Raw 链接。
2. 打开 Surge App，进入模块页面，安装新模块，粘贴链接保存。
3. 涉及 MITM 的模块需确认证书已安装并信任；模块删了重装后，相关 App 杀掉重进才生效。

注意：本仓库各模块的 MITM 均使用 `hostname = %APPEND% …` 写法，互相追加、不覆盖其他模块的 MITM 域名；不要把其中任何一个改回裸写，否则后应用的模块会顶掉之前模块的 MITM 域名。

---

## 免责声明

- 本仓库内容仅供个人学习与网络调试研究使用，请勿用于商业用途或非法盈利。
- 脚本带来的 App 账号、服务可用性等风险由使用者自行承担。
