/*
 * @name: CDT Monitor
 * @description: 阿里云CDT 流量监控小组件
 * @version: 3.3.4
 * @author: 以撒 (yisaings)
 * @update: 2026/09/01
*/

// ==================== 0. 脚本发布源配置 ====================
// 这里只用于 OTA 更新脚本，不包含用户自己的 CDT 面板地址或 API Key。
const GITHUB_REPO_PATH = "repos/yisaings/surge/contents/CDT-Monitor-scriptable.js";
const BACKUP_RAW_URL = "https://raw.githubusercontent.com/yisaings/surge/main/CDT-Monitor-scriptable.js";
// ==========================================================


// ==================== 1. 自动依赖管理 ====================
async function checkAndDownloadDmYY() {
  const fm = FileManager.local();
  const dmyyPath = fm.joinPath(fm.documentsDirectory(), 'DmYY.js');

  if (!fm.fileExists(dmyyPath)) {
    const urls = [
      "https://testingcf.jsdelivr.net/gh/dompling/Scriptable@master/Scripts/DmYY.js",
      "https://raw.githubusercontent.com/dompling/Scriptable/master/Scripts/DmYY.js"
    ];

    for (const url of urls) {
      try {
        const req = new Request(url);
        req.timeoutInterval = 4;
        const content = await req.loadString();

        if (content && content.includes("class DmYY")) {
          fm.writeString(dmyyPath, String(content));
          break;
        }
      } catch (e) {}
    }
  }
}

if (config.runsInApp) {
  await checkAndDownloadDmYY();
}

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

  version = '3.3.4';
  baseUrl = '';
  apiKey = '';

  // API = 本次成功获取网络数据
  // CACHE = API 请求失败，使用缓存数据
  dataSource = 'api';

  format = (str) => {
    return parseInt(str) >= 10 ? str : `0${str}`;
  };

  arrUpdateTime = ['00', '00', '00', '00'];

  refreshUpdateTime(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      date = new Date();
    }

    this.arrUpdateTime = [
      this.format(date.getMonth() + 1),
      this.format(date.getDate()),
      this.format(date.getHours()),
      this.format(date.getMinutes()),
    ];
  }

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
    } catch (e) {
      console.error(e);
    }

    await this.getData();
  };

  // ==================== 数据获取与状态解析 ====================
  async getData() {
    if (!this.baseUrl || !this.apiKey) return;

    const fm = FileManager.local();
    const cacheDir = fm.joinPath(
      fm.documentsDirectory(),
      "CDT_Monitor_Cache"
    );
    const cachePath = fm.joinPath(
      cacheDir,
      "cdt_status_cache.json"
    );

    if (!fm.fileExists(cacheDir)) {
      fm.createDirectory(cacheDir, true);
    }

    // ==================== 读取缓存 ====================
    let cachedData = null;
    let cacheDate = null;

    if (fm.fileExists(cachePath)) {
      try {
        cachedData = JSON.parse(
          fm.readString(cachePath)
        );

        cacheDate = fm.modificationDate(cachePath);
      } catch (e) {
        cachedData = null;
        cacheDate = null;
      }
    }

    // ==================== 请求 API ====================
    // Widget 每次真正运行时都尝试获取最新数据。
    // API 成功：更新缓存。
    // API 失败：使用已有缓存。
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

      if (
        !res ||
        !Array.isArray(res.accounts)
      ) {
        throw new Error("API 返回数据格式异常");
      }

      // ==================== API 成功 ====================
      this.dataSource = 'api';

      if (fm.fileExists(cachePath)) {
        fm.remove(cachePath);
      }

      fm.writeString(
        cachePath,
        JSON.stringify(res)
      );

      this.refreshUpdateTime(new Date());

      this.parseData(res);
      return;

    } catch (e) {
      console.error(`CDT API 请求失败: ${e}`);

      // ==================== API 失败 → 使用缓存 ====================
      if (cachedData) {
        this.dataSource = 'cache';

        if (cacheDate) {
          this.refreshUpdateTime(cacheDate);
        }

        this.parseData(cachedData);
        return;
      }

      // ==================== 没有缓存 ====================
      this.dataSource = 'cache';
      this.serverList = [];
    }
  }

  // ==================== 数据解析 ====================
  parseData(rawData) {
    if (!rawData || !rawData.accounts) {
      this.serverList = [];
      return;
    }

    const list = Array.isArray(rawData.accounts)
      ? rawData.accounts
      : [];

    this.serverList = list.map(item => {
      const usedNum = parseFloat(
        item.flow_used ??
        item.used ??
        0.0
      );

      const limitNum = parseFloat(
        item.flow_total ??
        item.total ??
        200
      );

      const pctNum = parseFloat(
        item.percentage ??
        (
          limitNum > 0
            ? (usedNum / limitNum) * 100
            : 0
        )
      );

      const statusStr = String(
        item.instance_status ??
        item.status ??
        'Running'
      );

      const isRunning =
        statusStr.toLowerCase().includes('run') ||
        statusStr.includes('运行');

      const rawCost =
        item.monthly_cost ??
        item.cost ??
        null;

      let costDisplay = '';

      if (
        rawCost !== null &&
        rawCost !== undefined
      ) {
        const costVal = parseFloat(rawCost);
        const symbol =
          (item.currency === 'USD' || !item.currency)
            ? '$'
            : '¥';

        costDisplay =
          `${symbol}${costVal.toFixed(2)}`;
      }

      return {
        name:
          item.account ??
          item.name ??
          '未命名实例',

        region:
          item.region_name ??
          item.region ??
          '中国香港',

        status:
          isRunning
            ? '运行中'
            : '未运行',

        isRunning: isRunning,

        cost:
          costDisplay,

        cdtUsed:
          usedNum.toFixed(2),

        cdtLimit:
          limitNum,

        usedPercent:
          pctNum.toFixed(2),

        threshold:
          item.threshold ??
          95
      };
    });

    const runningCount =
      this.serverList.filter(
        i => i.isRunning
      ).length;

    const totalUsedNum =
      this.serverList.reduce(
        (acc, cur) =>
          acc + parseFloat(cur.cdtUsed || 0),
        0
      );

    this.summaryData = {
      totalInstances:
        this.serverList.length,

      runningInstances:
        runningCount,

      totalTraffic:
        totalUsedNum < 1 &&
        totalUsedNum > 0
          ? totalUsedNum.toFixed(2)
          : totalUsedNum.toFixed(1),

      alerts:
        this.serverList.filter(
          i =>
            parseFloat(i.usedPercent) >= i.threshold
        ).length
    };
  }

  // ==================== 进度条 ====================
  drawProgressBar(percentage, width, height = 4) {
    const context = new DrawContext();
    context.size = new Size(width, height);
    context.opaque = false;

    const radius = height / 2;

    const bgPath = new Path();
    bgPath.addRoundedRect(
      new Rect(0, 0, width, height),
      radius,
      radius
    );

    context.addPath(bgPath);
    context.setFillColor(
      new Color("#ffffff", 0.12)
    );
    context.fillPath();

    const pctNum =
      parseFloat(percentage) || 0;

    const fillWidth =
      Math.max(
        height,
        Math.min(
          width,
          (pctNum / 100) * width
        )
      );

    const fillPath = new Path();

    fillPath.addRoundedRect(
      new Rect(
        0,
        0,
        fillWidth,
        height
      ),
      radius,
      radius
    );

    context.addPath(fillPath);

    context.setFillColor(
      pctNum > 90
        ? new Color("#ff375f")
        : new Color("#0a84ff")
    );

    context.fillPath();

    return context.getImage();
  }

  // ==================== 空状态 ====================
  checkEmpty(widget) {
    widget.setPadding(14, 14, 14, 14);

    if (!this.baseUrl || !this.apiKey) {
      const err = widget.addText(
        "⚠️ 请在 App 首页配置 Base URL 和 API Key"
      );

      err.font = Font.systemFont(12);
      err.textColor = new Color("#ff453a");

      return true;
    }

    if (this.serverList.length === 0) {
      const err = widget.addText(
        "⚠️ 暂未获取到 accounts 实例数据"
      );

      err.font = Font.systemFont(12);
      err.textColor = new Color("#ff9f0a");

      return true;
    }

    return false;
  }

  // ==================== 同步状态 ====================
  getSyncText() {
    if (this.dataSource === 'cache') {
      return `缓存 ${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`;
    }

    return `同步 ${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`;
  }

  // ==================== 小号组件 (Small) ====================
  renderSmall = async (widget) => {
    if (this.checkEmpty(widget)) return widget;

    widget.setPadding(14, 14, 14, 14);

    const a = this.serverList[0];

    const topRow = widget.addStack();
    topRow.centerAlignContent();

    const name = topRow.addText(a.name);
    name.font = Font.boldSystemFont(12);
    name.textColor = new Color("#ffffff", 0.95);

    topRow.addSpacer();

    const dot = topRow.addText("●");
    dot.font = Font.systemFont(8);
    dot.textColor =
      a.isRunning
        ? new Color("#30d158")
        : new Color("#ff9f0a");

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
      const fee = subRow.addText(
        `本月 ${a.cost}`
      );

      fee.font = Font.boldSystemFont(10);
      fee.textColor = new Color("#ffd60a", 0.95);
    }

    widget.addSpacer(12);

    const flowRow = widget.addStack();
    flowRow.bottomAlignContent();

    const num = flowRow.addText(
      `${a.cdtUsed}`
    );

    num.font = Font.heavySystemFont(22);
    num.textColor = new Color("#ffffff");

    const limit = flowRow.addText(
      ` / ${a.cdtLimit} GB`
    );

    limit.font = Font.systemFont(10);
    limit.textColor = new Color("#ffffff", 0.45);

    widget.addSpacer(8);

    const pImg = this.drawProgressBar(
      parseFloat(a.usedPercent),
      128,
      4
    );

    const imgW = widget.addImage(pImg);
    imgW.imageSize = new Size(128, 4);

    widget.addSpacer(8);

    const botRow = widget.addStack();
    botRow.centerAlignContent();

    const pct = botRow.addText(
      `${a.usedPercent}% 已用`
    );

    pct.font = Font.systemFont(8);
    pct.textColor = new Color("#ffffff", 0.6);

    botRow.addSpacer();

    const sync = botRow.addText(
      this.getSyncText()
    );

    sync.font = Font.systemFont(8);
    sync.textColor = new Color("#ffffff", 0.35);

    return widget;
  };

  // ==================== 中号组件 (Medium) ====================
  renderMedium = async (widget) => {
    if (this.checkEmpty(widget)) return widget;

    widget.setPadding(13, 15, 13, 15);

    const s = this.summaryData;
    const a = this.serverList[0];

    const header = widget.addStack();
    header.centerAlignContent();

    const title = header.addText(
      "CDT MONITOR"
    );

    title.font = Font.boldSystemFont(11);
    title.textColor = new Color("#ffffff", 0.7);

    header.addSpacer();

    const badge = header.addStack();

    badge.backgroundColor =
      a.isRunning
        ? new Color("#30d158", 0.15)
        : new Color("#ff9f0a", 0.15);

    badge.cornerRadius = 6;

    badge.setPadding(
      2,
      6,
      2,
      6
    );

    badge.centerAlignContent();

    const dot = badge.addText("● ");

    dot.font = Font.systemFont(7);

    dot.textColor =
      a.isRunning
        ? new Color("#30d158")
        : new Color("#ff9f0a");

    const statusText =
      badge.addText(a.status);

    statusText.font = Font.boldSystemFont(9);

    statusText.textColor =
      a.isRunning
        ? new Color("#30d158")
        : new Color("#ff9f0a");

    widget.addSpacer(6);

    const statsCard = widget.addStack();

    statsCard.backgroundColor =
      new Color("#ffffff", 0.08);

    statsCard.cornerRadius = 10;

    statsCard.borderColor =
      new Color("#ffffff", 0.15);

    statsCard.borderWidth = 0.5;

    statsCard.setPadding(
      5,
      12,
      5,
      12
    );

    statsCard.centerAlignContent();

    const addStat = (
      stack,
      label,
      val
    ) => {
      const col = stack.addStack();
      col.layoutVertically();

      const lbl = col.addText(label);
      lbl.font = Font.systemFont(8);
      lbl.textColor = new Color("#ffffff", 0.5);

      const num = col.addText(
        String(val)
      );

      num.font = Font.boldSystemFont(11);
      num.textColor = new Color("#ffffff", 0.95);
    };

    addStat(
      statsCard,
      "实例 (总/运)",
      `${s.totalInstances}/${s.runningInstances}`
    );

    statsCard.addSpacer();

    addStat(
      statsCard,
      "累计流量",
      `${s.totalTraffic} GB`
    );

    statsCard.addSpacer();

    addStat(
      statsCard,
      "阈值告警",
      `${s.alerts} 项`
    );

    widget.addSpacer(6);

    const mainCard = widget.addStack();

    mainCard.layoutVertically();

    mainCard.backgroundColor =
      new Color("#ffffff", 0.08);

    mainCard.cornerRadius = 12;

    mainCard.borderColor =
      new Color("#ffffff", 0.15);

    mainCard.borderWidth = 0.5;

    mainCard.setPadding(
      8,
      12,
      8,
      12
    );

    const rowTop = mainCard.addStack();
    rowTop.centerAlignContent();

    const name = rowTop.addText(
      a.name
    );

    name.font = Font.boldSystemFont(10);
    name.textColor = new Color("#ffffff", 0.95);

    if (a.region) {
      const reg = rowTop.addText(
        ` · ${a.region}`
      );

      reg.font = Font.systemFont(8);
      reg.textColor = new Color("#ffffff", 0.45);
    }

    rowTop.addSpacer();

    if (a.cost) {
      const fee = rowTop.addText(
        `本月 ${a.cost}`
      );

      fee.font = Font.boldSystemFont(10);
      fee.textColor = new Color("#ffd60a", 0.9);
    }

    mainCard.addSpacer(3);

    const rowData = mainCard.addStack();
    rowData.bottomAlignContent();

    const num = rowData.addText(
      `${a.cdtUsed}`
    );

    num.font = Font.heavySystemFont(15);
    num.textColor = new Color("#ffffff");

    const limit = rowData.addText(
      ` / ${a.cdtLimit} GB`
    );

    limit.font = Font.systemFont(9);
    limit.textColor = new Color("#ffffff", 0.45);

    mainCard.addSpacer(4);

    const pImg = this.drawProgressBar(
      parseFloat(a.usedPercent),
      270,
      4
    );

    const imgW = mainCard.addImage(pImg);
    imgW.imageSize = new Size(270, 4);

    mainCard.addSpacer(4);

    const rowBottom = mainCard.addStack();
    rowBottom.centerAlignContent();

    const pct = rowBottom.addText(
      `${a.usedPercent}% 已使用`
    );

    pct.font = Font.systemFont(8);
    pct.textColor = new Color("#ffffff", 0.6);

    rowBottom.addSpacer();

    const sync = rowBottom.addText(
      this.getSyncText()
    );

    sync.font = Font.systemFont(8);
    sync.textColor = new Color("#ffffff", 0.35);

    if (a.threshold !== null) {
      rowBottom.addSpacer();

      const th = rowBottom.addText(
        `阈值 ${a.threshold}%`
      );

      th.font = Font.systemFont(8);
      th.textColor = new Color("#ffffff", 0.35);
    }

    return widget;
  };

  // ==================== Large ====================
  renderLarge = async (widget) => {
    return await this.renderMedium(widget);
  };


  // ==========================================================
  // ==================== 脚本更新 OTA =========================
  // ==========================================================

  async checkAndUpdateScript() {
    console.log("正在检查更新...");

    let newScriptContent = null;

    // ==================== GitHub API ====================

    const apiUrl =
      `https://api.github.com/${GITHUB_REPO_PATH}?ref=main&_t=${Date.now()}`;

    try {
      const req = new Request(apiUrl);

      req.timeoutInterval = 6;

      req.headers = {
        'Accept': 'application/vnd.github.v3.raw',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Scriptable-CDT-Updater'
      };

      const content = await req.loadString();

      if (
        content &&
        content.includes("class Widget")
      ) {
        newScriptContent = content;
      }

    } catch (e) {
      console.error(
        `GitHub API 更新失败: ${e}`
      );
    }


    // ==================== GitHub Raw 备用 ====================

    if (!newScriptContent) {
      try {
        const req = new Request(
          `${BACKUP_RAW_URL}?_t=${Date.now()}`
        );

        req.timeoutInterval = 6;

        req.headers = {
          'Cache-Control': 'no-cache',
          'User-Agent': 'Scriptable-CDT-Updater'
        };

        const content = await req.loadString();

        if (
          content &&
          content.includes("class Widget")
        ) {
          newScriptContent = content;
        }

      } catch (e) {
        console.error(
          `GitHub Raw 更新失败: ${e}`
        );
      }
    }


    // ==================== 下载失败 ====================

    if (!newScriptContent) {
      const alert = new Alert();

      alert.title = "更新出错";

      alert.message =
        "网络请求失败，未能连接到 GitHub 仓库。";

      alert.addAction("确定");

      await alert.presentAlert();

      return;
    }


    // ==================== 获取远程版本 ====================

    const versionPattern =
      /version\s*=\s*['"]([^'"]+)['"]/;

    const match =
      newScriptContent.match(
        versionPattern
      );

    if (!match) {
      const alert = new Alert();

      alert.title = "检查失败";

      alert.message =
        "远程脚本格式不正确，未匹配到版本号。";

      alert.addAction("确定");

      await alert.presentAlert();

      return;
    }


    const latestVersion =
      match[1];


    // ==================== 版本比较 ====================

    const compareVersion = (a, b) => {
      const pa = String(a)
        .split('.')
        .map(v => parseInt(v, 10) || 0);

      const pb = String(b)
        .split('.')
        .map(v => parseInt(v, 10) || 0);

      const len = Math.max(
        pa.length,
        pb.length
      );

      for (let i = 0; i < len; i++) {
        const na = pa[i] || 0;
        const nb = pb[i] || 0;

        if (na > nb) return 1;
        if (na < nb) return -1;
      }

      return 0;
    };


    const versionResult =
      compareVersion(
        latestVersion,
        this.version
      );


    // ==================== 防止降级 ====================

    if (versionResult < 0) {
      const alert = new Alert();

      alert.title = "远程版本异常";

      alert.message =
        `当前版本：v${this.version}\n` +
        `远程版本：v${latestVersion}\n\n` +
        "远程版本低于当前版本，为防止降级更新，本次已取消。";

      alert.addAction("确定");

      await alert.presentAlert();

      return;
    }


    // ==================== 已经是最新版本 ====================

    if (versionResult === 0) {
      const alert = new Alert();

      alert.title = "无需更新";

      alert.message =
        `当前已是最新版本 (v${this.version})。`;

      alert.addAction("确定");

      await alert.presentAlert();

      return;
    }


    // ==================== 确认更新 ====================

    const alert = new Alert();

    alert.title = "检测到新版本";

    alert.message =
      `当前版本：v${this.version}\n` +
      `最新版本：v${latestVersion}\n\n` +
      "是否立即下载并覆盖更新？";

    alert.addAction("更新");
    alert.addCancelAction("取消");

    const response =
      await alert.presentAlert();

    if (response !== 0) {
      return;
    }


    // ==========================================================
    // 关键：
    // 直接使用 module.filename 获取当前正在执行的脚本路径。
    // 不再通过 Script.name() + documentsDirectory() 猜路径。
    // ==========================================================

    try {
      const currentScriptPath =
        module.filename;

      if (!currentScriptPath) {
        throw new Error(
          "无法获取当前正在执行的脚本路径。"
        );
      }

      console.log(
        `当前脚本路径：${currentScriptPath}`
      );


      // ==================== 判断 Local / iCloud ====================

      const isICloud =
        currentScriptPath.includes(
          'Documents/iCloud~'
        );

      const targetFM =
        isICloud
          ? FileManager.iCloud()
          : FileManager.local();


      // ==================== 检查当前脚本 ====================

      if (
        !targetFM.fileExists(
          currentScriptPath
        )
      ) {
        throw new Error(
          `当前脚本文件不存在：\n${currentScriptPath}`
        );
      }


      // ==================== iCloud 文件下载 ====================

      if (isICloud) {
        try {
          await targetFM.downloadFileFromiCloud(
            currentScriptPath
          );
        } catch (e) {
          console.log(
            `iCloud 文件下载处理：${e}`
          );
        }
      }


      // ==================== 写入新版本 ====================

      targetFM.writeString(
        currentScriptPath,
        newScriptContent
      );


      // ==================== 立即读取并验证 ====================

      const verifyContent =
        targetFM.readString(
          currentScriptPath
        );

      const verifyMatch =
        verifyContent.match(
          versionPattern
        );


      if (
        !verifyMatch ||
        verifyMatch[1] !== latestVersion
      ) {
        throw new Error(
          "脚本写入后验证失败。\n\n" +
          `期望版本：v${latestVersion}\n` +
          `实际版本：v${
            verifyMatch
              ? verifyMatch[1]
              : '未知'
          }\n\n` +
          `写入路径：\n${currentScriptPath}`
        );
      }


      console.log(
        `OTA 更新成功：v${latestVersion}`
      );


      // ==================== 清除缓存 ====================

      const localFM =
        FileManager.local();

      const cachePath =
        localFM.joinPath(
          localFM.joinPath(
            localFM.documentsDirectory(),
            "CDT_Monitor_Cache"
          ),
          "cdt_status_cache.json"
        );

      if (
        localFM.fileExists(
          cachePath
        )
      ) {
        localFM.remove(
          cachePath
        );
      }


      // ==================== 更新成功 ====================

      const successAlert =
        new Alert();

      successAlert.title =
        "更新成功";

      successAlert.message =
        `已成功升级至 v${latestVersion}！\n\n` +
        `写入位置：${isICloud ? 'iCloud' : 'Local'}\n\n` +
        "请完全关闭 Scriptable 后重新打开。";

      successAlert.addAction("确定");

      await successAlert.presentAlert();


      // ==================== 重载 ====================

      this.reopenScript();

    } catch (err) {
      console.error(
        `OTA 写入失败：${err}`
      );

      const errAlert =
        new Alert();

      errAlert.title =
        "更新失败";

      errAlert.message =
        String(err);

      errAlert.addAction("确定");

      await errAlert.presentAlert();
    }
  }


  // ==================== 菜单注册 ====================
  Run() {
    if (config.runsInApp) {
      this.registerAction({
        title: 'CDT 监控配置',
        menu: [
          {
            name: 'baseUrl',
            icon: {
              name: 'link',
              color: '#0a84ff'
            },
            title: 'Base URL (面板地址)',
            type: 'input',
            val: 'baseUrl',
            placeholder: 'https://你的CDT面板地址',
            desc: '填写你自己的 CDT 面板访问地址'
          },
          {
            name: 'apiKey',
            icon: {
              name: 'key.fill',
              color: '#ff9f0a'
            },
            title: 'API Key',
            type: 'input',
            val: 'apiKey',
            placeholder: 'cdt_xxxxxxxx',
            desc: '填写你自己的 API Key（需具有 widget:read 权限）'
          },
          {
            name: 'update',
            icon: {
              name: 'arrow.down.circle.fill',
              color: '#007aff'
            },
            title: `脚本更新 (当前 v${this.version})`,
            type: 'input',
            onClick: async () => {
              await this.checkAndUpdateScript();
            }
          }
        ]
      });

      this.registerAction({
        title: '',
        menu: [
          {
            name: 'basic',
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/basic.png',
            title: '基础功能',
            type: 'input',
            onClick: () => {
              return this.setWidgetConfig();
            }
          },
          {
            name: 'reload',
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/reload.png',
            title: '重载组件',
            type: 'input',
            onClick: () => {
              const fm = FileManager.local();

              const cachePath =
                fm.joinPath(
                  fm.joinPath(
                    fm.documentsDirectory(),
                    "CDT_Monitor_Cache"
                  ),
                  "cdt_status_cache.json"
                );

              if (
                fm.fileExists(cachePath)
              ) {
                fm.remove(cachePath);
              }

              this.reopenScript();
            }
          }
        ]
      });
    }
  }


  // ==================== 渲染总入口 ====================
  async render() {
    await this.init();

    const widget = new ListWidget();

    await this.getWidgetBackgroundImage(widget);

    let resWidget;

    if (this.widgetFamily === 'medium') {
      resWidget =
        await this.renderMedium(widget);

    } else if (this.widgetFamily === 'large') {
      resWidget =
        await this.renderLarge(widget);

    } else {
      resWidget =
        await this.renderSmall(widget);
    }

    resWidget.url =
      `scriptable:///run/${encodeURIComponent(
        Script.name()
      )}`;

    // ==========================================================
    // 不在这里自己写死 15 分钟。
    //
    // DmYY 的 Runing() 会继续读取
    // this.settings.refreshAfterDate
    // 并负责设置 Widget 的 refreshAfterDate。
    //
    // 因此“基础功能”里的刷新时间设置会正常生效。
    // ==========================================================

    return resWidget;
  }
}


await Runing(
  Widget,
  args.widgetParameter,
  false
);
