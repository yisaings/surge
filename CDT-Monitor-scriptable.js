/*
 * @name: CDT Monitor (Glass Multi-Server Edition)
 * @description: 阿里云/多平台 CDT 流量监控小组件 (精确尺寸分流版)
 * @version: 2.8.8
*/

// ==================== 0. 脚本精准更新源 ====================
const SCRIPT_REPO_URLS = [
  "https://raw.githubusercontent.com/yisaings/surge/main/CDT-Monitor-scriptable.js",
  "https://testingcf.jsdelivr.net/gh/yisaings/surge@main/CDT-Monitor-scriptable.js"
];
// ==========================================================

// ==================== 1. 自动依赖管理 ====================
async function checkAndDownloadDmYY() {
  const fm = FileManager[module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']();
  const dmyyPath = fm.joinPath(fm.documentsDirectory(), 'DmYY.js');
  
  if (!fm.fileExists(dmyyPath)) {
    console.log("正在自动下载 DmYY 基础框架依赖...");
    const urls = [
      "https://testingcf.jsdelivr.net/gh/dompling/Scriptable@master/Scripts/DmYY.js",
      "https://raw.githubusercontent.com/dompling/Scriptable/master/Scripts/DmYY.js"
    ];

    for (const url of urls) {
      try {
        const req = new Request(url);
        req.timeoutInterval = 5;
        const content = await req.loadString();
        if (content && content.includes("class DmYY")) {
          fm.writeString(dmyyPath, String(content));
          console.log("DmYY 依赖下载完成！");
          break;
        }
      } catch (e) {
        console.warn(`节点 [${url}] 获取失败，尝试备用线路...`);
      }
    }
  }
}

await checkAndDownloadDmYY();

if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');

// ==================== 2. CDT Monitor 业务逻辑 ====================
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = 'CDT Monitor';
    this.en = 'CDT_Monitor';
    this.Run();
  }

  version = '2.8.8';
  baseUrl = '';
  apiKey = '';
  refreshInterval = 10;

  summaryData = {
    totalInstances: 0,
    runningInstances: 0,
    totalTraffic: '0.00',
    alerts: 0
  };

  serverList = [];

  init = async () => {
    try {
      this.baseUrl = (this.settings.baseUrl || '').trim().replace(/\/+$/, '');
      this.apiKey = (this.settings.apiKey || '').trim();
      this.refreshInterval = parseInt(this.settings.refreshInterval || '10');
    } catch (e) {
      console.error(e);
    }
    await this.getData();
  };

  // 在线检查并覆盖更新自身脚本（带时间戳穿透 CDN 强缓存）
  async checkUpdateSelf() {
    const fm = FileManager[module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']();
    let newCode = null;
    const now = Date.now();

    for (const rawUrl of SCRIPT_REPO_URLS) {
      try {
        const noCacheUrl = rawUrl.includes('?') ? `${rawUrl}&_t=${now}` : `${rawUrl}?_t=${now}`;
        const req = new Request(noCacheUrl);
        req.timeoutInterval = 6;
        const content = await req.loadString();
        if (content && content.includes("@name: CDT Monitor")) {
          newCode = content;
          break;
        }
      } catch (e) {}
    }

    if (!newCode) {
      const failAlert = new Alert();
      failAlert.title = "更新失败";
      failAlert.message = "无法连接至 GitHub 仓库或镜像源，请稍后再试。";
      failAlert.addAction("确定");
      await failAlert.presentAlert();
      return;
    }

    const versionMatch = newCode.match(/@version:\s*([0-9.]+)/);
    const remoteVersion = versionMatch ? versionMatch[1] : null;

    if (!remoteVersion) {
      const errAlert = new Alert();
      errAlert.title = "解析失败";
      errAlert.message = "无法解析远端脚本的版本号。";
      errAlert.addAction("确定");
      await errAlert.presentAlert();
      return;
    }

    if (remoteVersion === this.version) {
      const okAlert = new Alert();
      okAlert.title = "已是最新版本";
      okAlert.message = `当前脚本版本 (v${this.version}) 已经是最新的。`;
      okAlert.addAction("好的");
      await okAlert.presentAlert();
      return;
    }

    const confirmAlert = new Alert();
    confirmAlert.title = `发现新版本 v${remoteVersion}`;
    confirmAlert.message = `当前版本: v${this.version}\n远端版本: v${remoteVersion}\n是否立即下载并覆盖更新？`;
    confirmAlert.addAction("立即更新");
    confirmAlert.addCancelAction("暂不更新");

    const choice = await confirmAlert.presentAlert();
    if (choice === 0) {
      try {
        fm.writeString(module.filename, newCode);
        
        const cachePath = fm.joinPath(fm.joinPath(fm.documentsDirectory(), "CDT_Monitor_Cache"), "cdt_status_cache.json");
        if (fm.fileExists(cachePath)) fm.remove(cachePath);

        const doneAlert = new Alert();
        doneAlert.title = "更新成功！";
        doneAlert.message = `已成功升级至 v${remoteVersion}，脚本将自动重新载入。`;
        doneAlert.addAction("确定");
        await doneAlert.presentAlert();
        
        this.reopenScript();
      } catch (err) {
        const errAlert = new Alert();
        errAlert.title = "写入失败";
        errAlert.message = String(err);
        errAlert.addAction("确定");
        await errAlert.presentAlert();
      }
    }
  }

  async getData() {
    if (!this.baseUrl || !this.apiKey) return;

    const fm = FileManager.local();
    const cacheDir = fm.joinPath(fm.documentsDirectory(), "CDT_Monitor_Cache");
    const cachePath = fm.joinPath(cacheDir, `cdt_status_cache.json`);

    if (!fm.fileExists(cacheDir)) fm.createDirectory(cacheDir, true);

    let rawData = null;
    let useCache = false;

    if (config.runsInWidget && fm.fileExists(cachePath)) {
      const modified = fm.modificationDate(cachePath);
      const diffMinutes = (new Date() - modified) / (1000 * 60);
      if (diffMinutes < this.refreshInterval) {
        try {
          rawData = JSON.parse(fm.readString(cachePath));
          useCache = true;
        } catch (e) {}
      }
    }

    if (!useCache) {
      const url = `${this.baseUrl}/api/v1/status`;
      try {
        const req = new Request(url);
        req.method = "GET";
        req.timeoutInterval = 4;
        req.headers = {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        };
        const res = await req.loadJSON();
        if (res && res.accounts) {
          rawData = res;
          if (fm.fileExists(cachePath)) fm.remove(cachePath);
          fm.writeString(cachePath, JSON.stringify(rawData));
        }
      } catch (e) {
        if (fm.fileExists(cachePath)) {
          try {
            rawData = JSON.parse(fm.readString(cachePath));
          } catch (err) {}
        }
      }
    }

    if (rawData && rawData.accounts) {
      let list = Array.isArray(rawData.accounts) ? rawData.accounts : [];

      this.serverList = list.map(item => {
        const usedNum = parseFloat(item.flow_used ?? item.used ?? 0.0);
        const limitNum = parseFloat(item.flow_total ?? item.total ?? 200);
        const pctNum = parseFloat(item.percentage ?? (limitNum > 0 ? (usedNum / limitNum) * 100 : 0));
        
        const statusStr = String(item.instance_status ?? item.status ?? 'Running');
        const isRunning = statusStr.toLowerCase().includes('run') || statusStr.includes('运行');

        const rawCost = item.monthly_cost ?? item.cost ?? null;
        let costDisplay = '';
        if (rawCost !== null && rawCost !== undefined) {
          const costVal = parseFloat(rawCost);
          const symbol = (item.currency === 'USD' || !item.currency) ? '$' : '¥';
          costDisplay = `${symbol}${costVal.toFixed(2)}`;
        }

        return {
          name: item.account ?? item.name ?? '未命名实例',
          region: item.region_name ?? item.region ?? '中国香港',
          status: isRunning ? '运行中' : '未运行',
          isRunning: isRunning,
          cost: costDisplay,
          cdtUsed: usedNum.toFixed(2),
          cdtLimit: limitNum,
          usedPercent: pctNum.toFixed(2),
          threshold: item.threshold ?? 95
        };
      });

      const runningCount = this.serverList.filter(i => i.isRunning).length;
      const totalUsedNum = this.serverList.reduce((acc, cur) => acc + parseFloat(cur.cdtUsed || 0), 0);

      this.summaryData = {
        totalInstances: this.serverList.length,
        runningInstances: runningCount,
        totalTraffic: totalUsedNum < 1 && totalUsedNum > 0 ? totalUsedNum.toFixed(2) : totalUsedNum.toFixed(1),
        alerts: this.serverList.filter(i => parseFloat(i.usedPercent) >= i.threshold).length
      };
    }
  }

  drawProgressBar(percentage, width, height = 4) {
    const context = new DrawContext();
    context.size = new Size(width, height);
    context.opaque = false;

    const radius = height / 2;
    const bgPath = new Path();
    bgPath.addRoundedRect(new Rect(0, 0, width, height), radius, radius);
    context.addPath(bgPath);
    context.setFillColor(new Color("#ffffff", 0.12));
    context.fillPath();

    const pctNum = parseFloat(percentage) || 0;
    const fillWidth = Math.max(height, Math.min(width, (pctNum / 100) * width));
    const fillPath = new Path();
    fillPath.addRoundedRect(new Rect(0, 0, fillWidth, height), radius, radius);
    context.addPath(fillPath);
    context.setFillColor(pctNum > 90 ? new Color("#ff375f") : new Color("#0a84ff"));
    context.fillPath();

    return context.getImage();
  }

  setGlassBackground(widget) {
    const bgGradient = new LinearGradient();
    bgGradient.colors = [new Color("#1c2029", 0.95), new Color("#0c0d10", 0.98)];
    bgGradient.locations = [0.0, 1.0];
    widget.backgroundGradient = bgGradient;
  }

  checkEmpty(widget) {
    this.setGlassBackground(widget);
    widget.setPadding(14, 14, 14, 14);
    if (!this.baseUrl || !this.apiKey) {
      const err = widget.addText("⚠️ 请在 App 首页配置 Base URL 和 API Key");
      err.font = Font.systemFont(12);
      err.textColor = new Color("#ff453a");
      return true;
    }
    if (this.serverList.length === 0) {
      const err = widget.addText("⚠️ 暂未获取到 accounts 实例数据");
      err.font = Font.systemFont(12);
      err.textColor = new Color("#ff9f0a");
      return true;
    }
    return false;
  }

  // ==================== 小号组件 (Small) 专属渲染 ====================
  renderSmall = async (widget) => {
    if (this.checkEmpty(widget)) return widget;
    widget.setPadding(12, 12, 12, 12);

    const a = this.serverList[0];

    const topRow = widget.addStack();
    topRow.centerAlignContent();
    const name = topRow.addText(a.name);
    name.font = Font.boldSystemFont(11);
    name.textColor = new Color("#ffffff", 0.95);
    topRow.addSpacer();
    const dot = topRow.addText("●");
    dot.font = Font.systemFont(8);
    dot.textColor = a.isRunning ? new Color("#30d158") : new Color("#ff9f0a");

    widget.addSpacer(2);

    const subRow = widget.addStack();
    subRow.centerAlignContent();
    if (a.region) {
      const reg = subRow.addText(a.region);
      reg.font = Font.systemFont(9);
      reg.textColor = new Color("#ffffff", 0.45);
    }
    subRow.addSpacer();
    if (a.cost) {
      const fee = subRow.addText(a.cost);
      fee.font = Font.boldSystemFont(10);
      fee.textColor = new Color("#ffd60a", 0.9);
    }

    widget.addSpacer(8);

    const flowRow = widget.addStack();
    flowRow.bottomAlignContent();
    const num = flowRow.addText(`${a.cdtUsed}`);
    num.font = Font.heavySystemFont(20);
    num.textColor = new Color("#ffffff");
    flowRow.addSpacer(2);
    const limit = flowRow.addText(` / ${a.cdtLimit}G`);
    limit.font = Font.boldSystemFont(10);
    limit.textColor = new Color("#ffffff", 0.45);

    widget.addSpacer(8);

    const pImg = this.drawProgressBar(parseFloat(a.usedPercent), 118, 4);
    const imgW = widget.addImage(pImg);
    imgW.imageSize = new Size(118, 4);

    widget.addSpacer(6);

    const botRow = widget.addStack();
    botRow.centerAlignContent();
    const pct = botRow.addText(`${a.usedPercent}%`);
    pct.font = Font.systemFont(9);
    pct.textColor = new Color("#ffffff", 0.6);
    botRow.addSpacer();
    const sync = botRow.addText(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
    sync.font = Font.systemFont(9);
    sync.textColor = new Color("#ffffff", 0.35);

    widget.refreshAfterDate = new Date(Date.now() + this.refreshInterval * 60 * 1000);
    return widget;
  };

  // ==================== 中号组件 (Medium) 专属渲染 ====================
  renderMedium = async (widget) => {
    if (this.checkEmpty(widget)) return widget;
    widget.setPadding(13, 15, 13, 15);

    const s = this.summaryData;
    const a = this.serverList[0];

    const header = widget.addStack();
    header.centerAlignContent();
    const title = header.addText("CDT MONITOR");
    title.font = Font.boldSystemFont(11);
    title.textColor = new Color("#ffffff", 0.7);
    header.addSpacer();

    const badge = header.addStack();
    badge.backgroundColor = a.isRunning ? new Color("#30d158", 0.15) : new Color("#ff9f0a", 0.15);
    badge.cornerRadius = 6;
    badge.setPadding(2, 6, 2, 6);
    badge.centerAlignContent();

    const dot = badge.addText("● ");
    dot.font = Font.systemFont(7);
    dot.textColor = a.isRunning ? new Color("#30d158") : new Color("#ff9f0a");
    const statusText = badge.addText(a.status);
    statusText.font = Font.boldSystemFont(9);
    statusText.textColor = a.isRunning ? new Color("#30d158") : new Color("#ff9f0a");

    widget.addSpacer(6);

    const statsCard = widget.addStack();
    statsCard.backgroundColor = new Color("#ffffff", 0.08);
    statsCard.cornerRadius = 10;
    statsCard.borderColor = new Color("#ffffff", 0.15);
    statsCard.borderWidth = 0.5;
    statsCard.setPadding(5, 12, 5, 12);
    statsCard.centerAlignContent();

    const addStat = (stack, label, val) => {
      const col = stack.addStack();
      col.layoutVertically();
      const lbl = col.addText(label);
      lbl.font = Font.systemFont(8);
      lbl.textColor = new Color("#ffffff", 0.5);
      const num = col.addText(String(val));
      num.font = Font.boldSystemFont(11);
      num.textColor = new Color("#ffffff", 0.95);
    };

    addStat(statsCard, "实例 (总/运)", `${s.totalInstances}/${s.runningInstances}`);
    statsCard.addSpacer();
    addStat(statsCard, "累计流量", `${s.totalTraffic} GB`);
    statsCard.addSpacer();
    addStat(statsCard, "阈值告警", `${s.alerts} 项`);

    widget.addSpacer(6);

    const mainCard = widget.addStack();
    mainCard.layoutVertically();
    mainCard.backgroundColor = new Color("#ffffff", 0.08);
    mainCard.cornerRadius = 12;
    mainCard.borderColor = new Color("#ffffff", 0.15);
    mainCard.borderWidth = 0.5;
    mainCard.setPadding(8, 12, 8, 12);

    const rowTop = mainCard.addStack();
    rowTop.centerAlignContent();
    const name = rowTop.addText(a.name);
    name.font = Font.boldSystemFont(10);
    name.textColor = new Color("#ffffff", 0.95);
    if (a.region) {
      const reg = rowTop.addText(` · ${a.region}`);
      reg.font = Font.systemFont(8);
      reg.textColor = new Color("#ffffff", 0.45);
    }
    rowTop.addSpacer();
    
    if (a.cost) {
      const fee = rowTop.addText(`本月 ${a.cost}`);
      fee.font = Font.boldSystemFont(10);
      fee.textColor = new Color("#ffd60a", 0.9);
    }

    mainCard.addSpacer(3);

    const rowData = mainCard.addStack();
    rowData.bottomAlignContent();
    const num = rowData.addText(`${a.cdtUsed}`);
    num.font = Font.heavySystemFont(15);
    num.textColor = new Color("#ffffff");
    const limit = rowData.addText(` / ${a.cdtLimit} GB`);
    limit.font = Font.systemFont(9);
    limit.textColor = new Color("#ffffff", 0.45);

    mainCard.addSpacer(4);

    const pImg = this.drawProgressBar(parseFloat(a.usedPercent), 270, 4);
    const imgW = mainCard.addImage(pImg);
    imgW.imageSize = new Size(270, 4);

    mainCard.addSpacer(4);

    const rowBottom = mainCard.addStack();
    rowBottom.centerAlignContent();
    const pct = rowBottom.addText(`${a.usedPercent}% 已使用`);
    pct.font = Font.systemFont(8);
    pct.textColor = new Color("#ffffff", 0.6);
    rowBottom.addSpacer();
    const sync = rowBottom.addText(`同步 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`);
    sync.font = Font.systemFont(8);
    sync.textColor = new Color("#ffffff", 0.35);

    if (a.threshold !== null) {
      rowBottom.addSpacer();
      const th = rowBottom.addText(`阈值 ${a.threshold}%`);
      th.font = Font.systemFont(8);
      th.textColor = new Color("#ffffff", 0.35);
    }

    widget.refreshAfterDate = new Date(Date.now() + this.refreshInterval * 60 * 1000);
    return widget;
  };

  // ==================== 大号组件 (Large) 专属渲染 ====================
  renderLarge = async (widget) => {
    return await this.renderMedium(widget);
  };

  Run() {
    if (config.runsInApp) {
      this.registerAction({
        title: 'CDT 监控配置',
        menu: [
          {
            name: 'baseUrl',
            icon: { name: 'link', color: '#0a84ff' },
            title: 'Base URL (面板地址)',
            type: 'input',
            val: 'baseUrl',
            placeholder: 'https://cdt.yisaw.com',
            desc: '面板访问地址'
          },
          {
            name: 'apiKey',
            icon: { name: 'key.fill', color: '#ff9f0a' },
            title: 'API Key',
            type: 'input',
            val: 'apiKey',
            placeholder: 'cdt_xxxxxxxx',
            desc: '具有 widget:read 权限的 Token'
          },
          {
            name: 'refreshInterval',
            icon: { name: 'arrow.clockwise', color: '#30d158' },
            title: '刷新间隔 (分钟)',
            type: 'input',
            placeholder: '10',
            val: 'refreshInterval',
            desc: '建议 10-30 分钟'
          },
          {
            name: 'update',
            icon: { name: 'arrow.down.circle.fill', color: '#007aff' },
            title: `检查并更新脚本 (v${this.version})`,
            type: 'input',
            onClick: async () => {
              await this.checkUpdateSelf();
            }
          },
          {
            name: 'reload',
            icon: { name: 'arrow.triangle.2.circlepath', color: '#ffd60a' },
            title: '清除缓存并立即重载',
            type: 'input',
            onClick: () => {
              const fm = FileManager.local();
              const cachePath = fm.joinPath(fm.joinPath(fm.documentsDirectory(), "CDT_Monitor_Cache"), "cdt_status_cache.json");
              if (fm.fileExists(cachePath)) fm.remove(cachePath);
              this.reopenScript();
            }
          }
        ]
      });
    }
  }

  // 核心分流入口
  async render() {
    await this.init();
    const widget = new ListWidget();
    const family = config.widgetFamily || this.widgetFamily || 'medium';
    
    if (family === 'small') {
      return await this.renderSmall(widget);
    } else if (family === 'large') {
      return await this.renderLarge(widget);
    } else {
      return await this.renderMedium(widget);
    }
  }
}

await Runing(Widget, args.widgetParameter, false);
