# 🌊 Surge Scripts & Modules

欢迎来到我的 Surge 脚本与模块仓库！这里收录了一系列自写的网络调试、去广告净化、数据流重写以及 App 功能解锁的 Surge 配置模块。

👤 全部是Ai制作或来源于网络

---

## 📦 模块导航 (Modules List)

### 1. 哔哩哔哩推荐流替换 (Fuck 茧房 🍃)
🔗 **模块链接**：`https://raw.githubusercontent.com/yisaings/surge/main/Fuck-jianfang.sgmodule`
💡 **来源致谢**：核心逻辑移植与启发自 [lixing23/Fuck-jianfang](https://github.com/lixing23/Fuck-jianfang)

打破 B 站信息茧房，将首页无聊的同质化推荐强制接管并替换为**全站热门**或**新号探索**内容。
* **多端适配**：完美兼容 Web 端、iPhone (Pegasus) 以及 iPad (Pad 专有大卡片) 端。
* **原生 UI**：支持 Surge 模块参数面板（`arguments`），长按模块即可无代码切换运行模式。
* **极限防卡死**：内置动态水位计算、高并发批量进货（单次 80 视频），保证 0 毫秒极速刷新。
* **防风控机制**：独立沙盒请求免 Cookie，内置 150 个视频的本地离线备用粮仓，彻底解决拉取频繁导致的 B 站风控死锁。


### 2. 小白智慧打印 部分功能解锁
🔗 **模块链接**：`https://raw.githubusercontent.com/yisaings/surge/main/xiaobaizhihuidayin.sgmodule`

小白智慧打印 App 的普通VIP解锁。
* **特性**：强解 VIP 身份、破除使用限制，实现高效打印体验。

### 3. 中国联通 App 极简版
🔗 **模块链接**：`https://raw.githubusercontent.com/yisaings/surge/main/10010NoAds.sgmodule`

彻底净化中国联通客户端的臃肿 UI 与广告。
* **规则拦截**：精准屏蔽开屏广告请求。
* **UI 精简 (JQ Rewrite)**：无痕剔除首页“通通”、“签到”、浮窗广告，以及发现页和搜索页的热词展示，还你一个干净的营业厅。

### 4. 懂球帝 去广告
🔗 **模块链接**：`https://raw.githubusercontent.com/yisaings/surge/main/dongqiudi.list`

* **特性**：基于 Domain 规则的网络层拦截。精准屏蔽懂球帝内置的第三方广告联盟（如 ubixioe、beizi）、开屏广告分发器及追踪域名。

### 5. 指尖水务 去广告
🔗 **模块链接**：`https://raw.githubusercontent.com/yisaings/surge/main/tap-water.sgmodule`

* **特性**：通过 Script 重写特定 API，完美剔除指尖水务 App 烦人的开屏广告请求。

### 6. 创维智慧云 去广告
🔗 **模块链接**：`https://raw.githubusercontent.com/yisaings/surge/main/skyworth.sgmodule`

* **特性**：利用 JSON 响应体修改，清空并屏蔽创维智慧云 App 的开屏动画及应用内的内置广告流。

---

## 🚀 如何安装 (Installation)

在 Surge 中，你可以通过复制模块的 Raw 链接直接安装使用：

1. 复制上方你需要的 **🔗 模块链接**。
2. 打开 Surge App，进入 **模块 (Modules)** 页面。
3. 点击 **安装新模块 (Install New Module)**。
4. 将复制的链接粘贴进去并保存即可。

*(注：需确保证书（MITM）已安装并信任，否则涉及 HTTPS 解密的脚本将无法生效。)*

---

## ⚠️ 免责声明 (Disclaimer)

* 本仓库内的所有脚本及模块仅供个人学习与网络调试研究使用。
* 请勿将本仓库的任何内容用于商业用途或非法盈利。
* 任何由脚本带来的 App 账号封禁、服务不可用等风险需由使用者自行承担。
