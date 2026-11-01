# Surge Scripts & Modules

个人自用的 Surge 脚本与模块仓库：去广告净化、App 界面精简、签到自动化，以及两个 Scriptable 小组件。

> 适用 Surge iOS / macOS。涉及 HTTPS 解密的模块需先安装并信任 Surge 证书（MITM），否则脚本不生效。

---

## 目录结构

```
10010/
  10010NoAds.sgmodule      中国联通去广告
  Get-10010-Cookie.sgmodule  联通 Cookie 获取
bbdc/
  bbdc.js / bbdc.sgmodule  延长不背单词本地 VIP 时间
bilibili/
  Fuck-jianfang.js / Fuck-jianfang.sgmodule  哔哩哔哩推荐流替换
dongqiudi/
  dongqiudi.list           懂球帝去广告规则
nodeseek/
  NodeSeekDailyBonus.sgmodule  NodeSeek 每日签到
skyworth/
  skyworth-empty.js / skyworth.sgmodule  创维智慧云精简（脚本返空版）
yingshiyun/
  yingshiyun-ad.js / yingshiyun.sgmodule  萤石云视频精简
CSL-Monitor.js             中超比赛监控 Scriptable 小组件
CDT-Monitor-scriptable.js / CDT-Monitor-scripting.tsx  CDT Monitor 配套文件
```

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

### 4. 中国联通去广告

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/10010/10010NoAds.sgmodule`

- 规则拦截开屏广告域名，另用 jq 重写剔除首页“通通”“签到”、浮窗广告，以及发现页和搜索页的热词展示。

### 5. 联通 Cookie 获取

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/10010/Get-10010-Cookie.sgmodule`

- 联通手机营业厅 Cookie 获取模块，带参数面板，抓到后可把脚本与 MITM 两项填 `#` 禁用。

### 6. NodeSeek 每日签到

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/nodeseek/NodeSeekDailyBonus.sgmodule`

- NodeSeek 论坛每日签到模块，定时任务走 cron，签到时间可在模块参数面板里改；Token 抓到后可把获取脚本与 MITM 两项填 `#` 禁用。

### 7. 延长不背单词本地 VIP 时间

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/bbdc/bbdc.sgmodule`

- 修改用户信息接口，将 VIP 特权有效期延长至 2099 年，仅对纯本地控制的功能有效。

### 8. 懂球帝去广告

🔗 `https://raw.githubusercontent.com/yisaings/surge/refs/heads/main/dongqiudi/dongqiudi.list`

- 纯域名规则列表，屏蔽懂球帝内置的广告联盟、开屏广告分发与追踪域名。按 Surge 规则集方式引用。

### 9. Scriptable 小组件

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
