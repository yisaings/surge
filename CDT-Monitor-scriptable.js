/*
 * @name: CDT Monitor (Glass Multi-Server Edition)
 * @description: 阿里云/多平台 CDT 流量监控小组件
 * @version: 2.6.2
*/

if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');

class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = 'CDT Monitor';
    this.en = 'CDT_Monitor';
    this.Run();
  }

  version = '2.6.2';
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

  defaultPlaceholder = {
    name: "未连接实例",
    region: "中国香港",
    status: "未运行",
    isRunning: false,
    cost: "0.01",
    balance: "0.00",
    cdtUsed: "0.00",
    cdtLimit: 200,
    usedPercent: "0.00",
    threshold: 95
  };

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

  async getData() {
    if (!this.baseUrl || !this.apiKey) return;

    const fm = FileManager.local();
    const cacheDir = fm.joinPath(fm.documentsDirectory(), "CDT_Monitor_Cache");
    const cachePath = fm.joinPath(cacheDir, `cdt_glass_summary.json`);

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
      const url = `${this.baseUrl}/api/v1/widget/summary`;
      try {
        const req = new Request(url);
        req.method = "GET";
        req.headers = {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        };
        const res = await req.loadJSON();
        if (res) {
          rawData = res;
          if (fm.fileExists(cachePath)) fm.remove(cachePath);
          fm.writeString(cachePath, JSON.stringify(rawData));
        }
      } catch (e) {
        if (fm.fileExists(cachePath)) {
          rawData = JSON.parse(fm.readString(cachePath));
        }
      }
    }

    if (rawData) {
      let list = rawData.accounts || rawData.data || rawData.items || [];
      if (!Array.isArray(list)) list = [];

      this.serverList = list.map(item => {
        const usedNum = parseFloat(item.used ?? item.traffic_used ?? item.cdt_used_gb ?? 0.0);
        const limitNum = parseFloat(item.total ?? item.traffic_limit ?? item.cdt_limit_gb ?? 200) || 200;
        
        let pct = item.percentage ?? (limitNum > 0 ? (usedNum / limitNum) * 100 : 0);
        pct = parseFloat(pct);

        const statusStr = String(item.status || 'Running');
        const isRunning = statusStr.toLowerCase() === 'running' || statusStr.includes('运行');

        return {
          name: item.name || "LTAI5tE***",
          region: item.region || "中国香港",
          status: isRunning ? "运行中" : "未运行",
          isRunning: isRunning,
          cost: parseFloat(item.cost ?? item.month_cost ?? 0.01).toFixed(2),
          balance: parseFloat(item.balance ?? 0.00).toFixed(2),
          cdtUsed: usedNum.toFixed(2),
          cdtLimit: limitNum,
          usedPercent: pct.toFixed(2),
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

    const fillWidth = Math.max(height, Math.min(width, (percentage / 100) * width));
    const fillPath = new Path();
    fillPath.addRoundedRect(new Rect(0, 0, fillWidth, height), radius, radius);
    context.addPath(fillPath);
    context.setFillColor(percentage > 90 ? new Color("#ff375f") : new Color("#0a84ff"));
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
    return false;
  }

  drawLargeServerRow(container, a, count) {
    const mainCard = container.addStack();
    mainCard.layoutVertically();
    mainCard.backgroundColor = new Color("#ffffff", 0.08);
    mainCard.cornerRadius = 12;
    mainCard.borderColor = new Color("#ffffff", 0.15);
    mainCard.borderWidth = 0.5;

    const padV = count === 1 ? 22 : (count === 2 ? 14 : 9);
    mainCard.setPadding(padV, 14, padV, 14);

    const rowTop = mainCard.addStack();
    rowTop.centerAlignContent();
    const name = rowTop.addText(a.name);
    name.font = Font.boldSystemFont(count === 3 ? 10 : 12);
    name.textColor = new Color("#ffffff", 0.95);

    const reg = rowTop.addText(` · ${a.region}`);
    reg.font = Font.systemFont(count === 3 ? 8 : 10);
    reg.textColor = new Color("#ffffff", 0.45);

    rowTop.addSpacer();

    const fee = rowTop.addText(`本月 $${a.cost}`);
    fee.font = Font.boldSystemFont(count === 3 ? 10 : 12);
    fee.textColor = new Color("#ffd60a", 0.9);

    mainCard.addSpacer(count === 1 ? 10 : (count === 2 ? 6 : 4));

    const rowData = mainCard.addStack();
    rowData.bottomAlignContent();
    const num = rowData.addText(`${a.cdtUsed}`);
    num.font = Font.heavySystemFont(count === 1 ? 24 : (count === 2 ? 18 : 15));
    num.textColor = new Color("#ffffff");

    const limit = rowData.addText(` / ${a.cdtLimit} GB`);
    limit.font = Font.systemFont(count === 3 ? 9 : 11);
    limit.textColor = new Color("#ffffff", 0.45);

    mainCard.addSpacer(count === 1 ? 10 : (count === 2 ? 6 : 4));

    const barW = 295;
    const barH = count === 1 ? 6 : 4;
    const pImg = this.drawProgressBar(parseFloat(a.usedPercent), barW, barH);
    const imgW = mainCard.addImage(pImg);
    imgW.imageSize = new Size(barW, barH);

    mainCard.addSpacer(count === 1 ? 8 : (count === 2 ? 5 : 3));

    const rowBottom = mainCard.addStack();
    rowBottom.centerAlignContent();
    const pct = rowBottom.addText(`${a.usedPercent}% 已用`);
    pct.font = Font.systemFont(count === 3 ? 8 : 10);
    pct.textColor = new Color("#ffffff", 0.6);

    rowBottom.addSpacer();

    const th = rowBottom.addText(`阈值 ${a.threshold}%`);
    th.font = Font.systemFont(count === 3 ? 8 : 10);
    th.textColor = new Color("#ffffff", 0.35);
  }

  drawLargeGridItem(container, a) {
    const card = container.addStack();
    card.layoutVertically();
    card.backgroundColor = new Color("#ffffff", 0.08);
    card.cornerRadius = 12;
    card.borderColor = new Color("#ffffff", 0.15);
    card.borderWidth = 0.5;
    card.setPadding(12, 10, 12, 10);

    const row1 = card.addStack();
    row1.centerAlignContent();
    const name = row1.addText(a.name);
    name.font = Font.boldSystemFont(10);
    name.textColor = new Color("#ffffff", 0.95);
    row1.addSpacer();
    const dot = row1.addText("●");
    dot.font = Font.systemFont(8);
    dot.textColor = a.isRunning ? new Color("#30d158") : new Color("#ff9f0a");

    card.addSpacer(4);

    const row2 = card.addStack();
    row2.centerAlignContent();
    const fee = row2.addText(`$${a.cost}`);
    fee.font = Font.boldSystemFont(9);
    fee.textColor = new Color("#ffd60a");
    row2.addSpacer();
    const reg = row2.addText(a.region);
    reg.font = Font.systemFont(8);
    reg.textColor = new Color("#ffffff", 0.45);

    card.addSpacer(8);

    const row3 = card.addStack();
    row3.bottomAlignContent();
    const used = row3.addText(`${a.cdtUsed}`);
    used.font = Font.heavySystemFont(15);
    used.textColor = new Color("#ffffff");
    const lim = row3.addText(` / ${a.cdtLimit}G`);
    lim.font = Font.systemFont(8);
    lim.textColor = new Color("#ffffff", 0.45);

    card.addSpacer(6);

    const pImg = this.drawProgressBar(parseFloat(a.usedPercent), 132, 4);
    const imgW = card.addImage(pImg);
    imgW.imageSize = new Size(132, 4);

    card.addSpacer(6);

    const row4 = card.addStack();
    const pct = row4.addText(`${a.usedPercent}% 已用`);
    pct.font = Font.systemFont(8);
    pct.textColor = new Color("#ffffff", 0.5);
  }

  renderSmall = async (widget) => {
    if (this.checkEmpty(widget)) return widget;
    widget.setPadding(12, 12, 12, 12);

    const a = this.serverList[0] || this.defaultPlaceholder;

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
    const reg = subRow.addText(a.region);
    reg.font = Font.systemFont(9);
    reg.textColor = new Color("#ffffff", 0.45);
    subRow.addSpacer();
    const fee = subRow.addText(`$${a.cost}`);
    fee.font = Font.boldSystemFont(10);
    fee.textColor = new Color("#ffd60a", 0.9);

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

  renderMedium = async (widget) => {
    if (this.checkEmpty(widget)) return widget;
    widget.setPadding(13, 15, 13, 15);

    const s = this.summaryData;
    const a = this.serverList[0] || this.defaultPlaceholder;

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
    const reg = rowTop.addText(` · ${a.region}`);
    reg.font = Font.systemFont(8);
    reg.textColor = new Color("#ffffff", 0.45);
    rowTop.addSpacer();
    const fee = rowTop.addText(`本月 $${a.cost}`);
    fee.font = Font.systemFont(8);
    fee.textColor = new Color("#ffd60a", 0.9);

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
    rowBottom.addSpacer();
    const th = rowBottom.addText(`阈值 ${a.threshold}%`);
    th.font = Font.systemFont(8);
    th.textColor = new Color("#ffffff", 0.35);

    widget.refreshAfterDate = new Date(Date.now() + this.refreshInterval * 60 * 1000);
    return widget;
  };

  renderLarge = async (widget) => {
    if (this.checkEmpty(widget)) return widget;
    widget.setPadding(14, 15, 14, 15);

    const s = this.summaryData;
    const list = this.serverList.length > 0 ? this.serverList : [this.defaultPlaceholder];
    const count = list.length;

    const header = widget.addStack();
    header.centerAlignContent();
    const title = header.addText("CDT MONITOR");
    title.font = Font.boldSystemFont(13);
    title.textColor = new Color("#ffffff", 0.7);
    header.addSpacer();

    const isRunning = s.runningInstances > 0;
    const badge = header.addStack();
    badge.backgroundColor = isRunning ? new Color("#30d158", 0.15) : new Color("#ff9f0a", 0.15);
    badge.cornerRadius = 6;
    badge.setPadding(3, 8, 3, 8);
    badge.centerAlignContent();

    const dot = badge.addText("● ");
    dot.font = Font.systemFont(8);
    dot.textColor = isRunning ? new Color("#30d158") : new Color("#ff9f0a");
    const statusText = badge.addText(`在线: ${s.runningInstances}/${s.totalInstances}`);
    statusText.font = Font.boldSystemFont(10);
    statusText.textColor = isRunning ? new Color("#30d158") : new Color("#ff9f0a");

    widget.addSpacer(8);

    const statsCard = widget.addStack();
    statsCard.backgroundColor = new Color("#ffffff", 0.08);
    statsCard.cornerRadius = 12;
    statsCard.borderColor = new Color("#ffffff", 0.15);
    statsCard.borderWidth = 0.5;
    statsCard.setPadding(8, 14, 8, 14);
    statsCard.centerAlignContent();

    const addStat = (stack, label, val) => {
      const col = stack.addStack();
      col.layoutVertically();
      const lbl = col.addText(label);
      lbl.font = Font.systemFont(9);
      lbl.textColor = new Color("#ffffff", 0.5);
      const num = col.addText(String(val));
      num.font = Font.boldSystemFont(12);
      num.textColor = new Color("#ffffff", 0.95);
    };

    addStat(statsCard, "实例总数", `${s.totalInstances} 台`);
    statsCard.addSpacer();
    addStat(statsCard, "累计流量", `${s.totalTraffic} GB`);
    statsCard.addSpacer();
    addStat(statsCard, "阈值告警", `${s.alerts} 项`);

    widget.addSpacer(10);

    if (count >= 4) {
      const grid = widget.addStack();
      grid.layoutVertically();

      const r1 = grid.addStack();
      r1.layoutHorizontally();
      this.drawLargeGridItem(r1, list[0]);
      r1.addSpacer(10);
      this.drawLargeGridItem(r1, list[1]);

      grid.addSpacer(10);

      const r2 = grid.addStack();
      r2.layoutHorizontally();
      this.drawLargeGridItem(r2, list[2]);
      r2.addSpacer(10);
      this.drawLargeGridItem(r2, list[3]);

    } else {
      const displayList = list.slice(0, 3);
      const gap = count === 1 ? 0 : (count === 2 ? 12 : 8);

      displayList.forEach((item, idx) => {
        if (idx > 0) widget.addSpacer(gap);
        this.drawLargeServerRow(widget, item, count);
      });
    }

    widget.addSpacer();

    const footRow = widget.addStack();
    footRow.centerAlignContent();
    const timeText = footRow.addText(`上次同步: ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`);
    timeText.font = Font.systemFont(9);
    timeText.textColor = new Color("#ffffff", 0.35);

    widget.refreshAfterDate = new Date(Date.now() + this.refreshInterval * 60 * 1000);
    return widget;
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
            placeholder: 'https://panel.example.com',
            desc: '反代后的完整网页访问地址'
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
            name: 'reload',
            icon: { name: 'arrow.triangle.2.circlepath', color: '#ffd60a' },
            title: '重载并保存',
            type: 'input',
            onClick: () => {
              const fm = FileManager.local();
              const cachePath = fm.joinPath(fm.joinPath(fm.documentsDirectory(), "CDT_Monitor_Cache"), "cdt_glass_summary.json");
              if (fm.fileExists(cachePath)) fm.remove(cachePath);
              this.reopenScript();
            }
          }
        ]
      });
    }
  }

  async render() {
    await this.init();
    const widget = new ListWidget();
    if (this.widgetFamily === 'small') {
      return await this.renderSmall(widget);
    } else if (this.widgetFamily === 'large') {
      return await this.renderLarge(widget);
    } else {
      return await this.renderMedium(widget);
    }
  }
}

await Runing(Widget, args.widgetParameter, false);
