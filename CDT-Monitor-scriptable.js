/*
 * @name: CDT Monitor
 * @description: 阿里云CDT 流量监控小组件
 * @version: 3.3.6
 * @author: 以撒 (yisaings)
 * @update: 2026/09/02
 */

// ==================== 0. 脚本发布源配置 ====================
// 这里只用于 OTA 更新脚本，不包含用户自己的 CDT 面板地址或 API Key。
const GITHUB_REPO_PATH = "repos/yisaings/surge/contents/CDT-Monitor-scriptable.js";
const BACKUP_RAW_URL = "https://raw.githubusercontent.com/yisaings/surge/main/CDT-Monitor-scriptable.js";
// ==========================================================


// ==================== 1. 自动依赖管理 ====================
async function checkAndDownloadDmYY() {
  const fm = FileManager.local();
  const dmyyPath = fm.joinPath(fm.documentsDirectory(), "DmYY.js");

  if (fm.fileExists(dmyyPath)) return;

  const urls = [
    "https://testingcf.jsdelivr.net/gh/dompling/Scriptable@master/Scripts/DmYY.js",
    "https://raw.githubusercontent.com/dompling/Scriptable/master/Scripts/DmYY.js"
  ];

  for (const url of urls) {
    try {
      const req = new Request(url);
      req.timeoutInterval = 6;

      const content = await req.loadString();

      if (content && content.includes("class DmYY")) {
        fm.writeString(dmyyPath, String(content));
        return;
      }
    } catch (e) {
      console.error(`DmYY 下载失败: ${e}`);
    }
  }
}

if (config.runsInApp) {
  await checkAndDownloadDmYY();
}

if (typeof require === "undefined") require = importModule;

const { DmYY, Runing } = require("./DmYY");


// ==================== 2. CDT Monitor ====================
class Widget extends DmYY {

  constructor(arg) {
    // 默认 15 分钟，但用户在 DmYY「基础功能」里修改后仍然以用户设置为准。
    super(arg, {
      refreshAfterDate: "15"
    });

    this.name = "CDT Monitor";
    this.en = "CDT_Monitor";

    this.Run();
  }

  version = "3.3.6";

  // 用户自己的 CDT 地址和 Key 均不写入代码。
  baseUrl = "";
  apiKey = "";

  // api = 当前成功获取的数据
  // cache = API 失败时使用的缓存
  dataSource = "api";

  arrUpdateTime = ["00", "00", "00", "00"];

  summaryData = {
    totalInstances: 0,
    runningInstances: 0,
    totalTraffic: "0.0",
    alerts: 0
  };

  serverList = [];


  // ==================== 主题颜色 ====================
  getTheme() {
    const dark = Device.isUsingDarkAppearance();

    return {
      dark,

      primary: dark
        ? new Color("#ffffff", 0.95)
        : new Color("#000000", 0.90),

      secondary: dark
        ? new Color("#ffffff", 0.70)
        : new Color("#000000", 0.70),

      tertiary: dark
        ? new Color("#ffffff", 0.60)
        : new Color("#000000", 0.60),

      muted: dark
        ? new Color("#ffffff", 0.45)
        : new Color("#000000", 0.50),

      faint: dark
        ? new Color("#ffffff", 0.35)
        : new Color("#000000", 0.40),

      card: dark
        ? new Color("#ffffff", 0.08)
        : new Color("#000000", 0.055),

      cardBorder: dark
        ? new Color("#ffffff", 0.15)
        : new Color("#000000", 0.10),

      progressBackground: dark
        ? new Color("#ffffff", 0.12)
        : new Color("#000000", 0.10)
    };
  }


  // ==================== 工具 ====================
  format(str) {
    const n = parseInt(str, 10) || 0;
    return n >= 10 ? String(n) : `0${n}`;
  }


  refreshUpdateTime(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      date = new Date();
    }

    this.arrUpdateTime = [
      this.format(date.getMonth() + 1),
      this.format(date.getDate()),
      this.format(date.getHours()),
      this.format(date.getMinutes())
    ];
  }


  getSyncText() {
    if (this.dataSource === "cache") {
      return `缓存 ${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`;
    }

    return `同步 ${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`;
  }


  // ==================== 初始化 ====================
  async init() {
    try {
      this.baseUrl = String(this.settings.baseUrl || "")
        .trim()
        .replace(/\/+$/, "");

      this.apiKey = String(this.settings.apiKey || "")
        .trim();
    } catch (e) {
      console.error(`读取配置失败: ${e}`);
      this.baseUrl = "";
      this.apiKey = "";
    }

    await this.getData();
  }


  // ==================== 缓存路径 ====================
  getCachePath() {
    const fm = FileManager.local();

    const dir = fm.joinPath(
      fm.documentsDirectory(),
      "CDT_Monitor_Cache"
    );

    return {
      fm,
      dir,
      path: fm.joinPath(
        dir,
        "cdt_status_cache.json"
      )
    };
  }


  // ==================== 获取数据 ====================
  async getData() {

    if (!this.baseUrl || !this.apiKey) {
      this.dataSource = "cache";
      this.serverList = [];
      return;
    }

    const cache = this.getCachePath();
    const fm = cache.fm;

    let cachedData = null;
    let cacheDate = null;

    // ---------- 读取缓存 ----------
    if (fm.fileExists(cache.path)) {
      try {
        cachedData = JSON.parse(
          fm.readString(cache.path)
        );

        cacheDate = fm.modificationDate(
          cache.path
        );
      } catch (e) {
        cachedData = null;
        cacheDate = null;
      }
    }

    // ---------- 创建缓存目录 ----------
    try {
      if (!fm.fileExists(cache.dir)) {
        fm.createDirectory(cache.dir, true);
      }
    } catch (e) {
      console.error(`缓存目录创建失败: ${e}`);
    }


    // ---------- 请求 API ----------
    const url = `${this.baseUrl}/api/v1/status`;

    try {
      const req = new Request(url);

      req.method = "GET";
      req.timeoutInterval = 6;

      req.headers = {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      };

      const res = await req.loadJSON();

      // 必须存在 accounts 数组才认为 API 正常。
      if (
        !res ||
        !Array.isArray(res.accounts)
      ) {
        throw new Error("API 返回数据格式异常");
      }


      // API 成功。
      this.dataSource = "api";
      this.refreshUpdateTime(new Date());

      // 先使用 API 数据。
      // 即使缓存写入失败，也不能影响组件显示。
      this.parseData(res);


      // ---------- 更新缓存 ----------
      try {
        if (!fm.fileExists(cache.dir)) {
          fm.createDirectory(cache.dir, true);
        }

        fm.writeString(
          cache.path,
          JSON.stringify(res)
        );
      } catch (e) {
        console.error(`缓存写入失败: ${e}`);
      }

      return;

    } catch (e) {

      console.error(
        `CDT API 请求失败: ${e}`
      );

      // ---------- API 失败 → 使用缓存 ----------
      if (cachedData) {

        this.dataSource = "cache";

        if (cacheDate) {
          this.refreshUpdateTime(cacheDate);
        } else {
          this.refreshUpdateTime(new Date());
        }

        this.parseData(cachedData);

        return;
      }


      // ---------- API 失败且没有缓存 ----------
      this.dataSource = "cache";
      this.serverList = [];

      this.summaryData = {
        totalInstances: 0,
        runningInstances: 0,
        totalTraffic: "0.0",
        alerts: 0
      };
    }
  }


  // ==================== 数据解析 ====================
  parseData(rawData) {

    if (
      !rawData ||
      !Array.isArray(rawData.accounts)
    ) {
      this.serverList = [];
      return;
    }

    const list = rawData.accounts;

    this.serverList = list.map(item => {

      const usedNum = parseFloat(
        item.flow_used ??
        item.used ??
        0
      ) || 0;

      const limitNum = parseFloat(
        item.flow_total ??
        item.total ??
        200
      ) || 200;

      let pctNum = parseFloat(
        item.percentage
      );

      if (
        !Number.isFinite(pctNum)
      ) {
        pctNum =
          limitNum > 0
            ? (usedNum / limitNum) * 100
            : 0;
      }

      pctNum = Math.max(
        0,
        Math.min(100, pctNum)
      );


      const statusStr = String(
        item.instance_status ??
        item.status ??
        "Running"
      );

      const lowerStatus =
        statusStr.toLowerCase();

      const isRunning =
        lowerStatus.includes("run") ||
        statusStr.includes("运行");


      // ---------- 费用 ----------
      const rawCost =
        item.monthly_cost ??
        item.cost ??
        null;

      let costDisplay = "";

      if (
        rawCost !== null &&
        rawCost !== undefined &&
        rawCost !== ""
      ) {
        const costVal =
          parseFloat(rawCost);

        if (Number.isFinite(costVal)) {
          const symbol =
            String(item.currency || "USD")
              .toUpperCase() === "USD"
              ? "$"
              : "¥";

          costDisplay =
            `${symbol}${costVal.toFixed(2)}`;
        }
      }


      return {
        name:
          item.account ??
          item.name ??
          "未命名实例",

        region:
          item.region_name ??
          item.region ??
          "中国香港",

        status:
          isRunning
            ? "运行中"
            : "未运行",

        isRunning,

        cost: costDisplay,

        cdtUsed:
          usedNum.toFixed(2),

        cdtLimit:
          limitNum,

        usedPercent:
          pctNum.toFixed(2),

        threshold:
          parseFloat(
            item.threshold ??
            95
          ) || 95
      };
    });


    // ---------- 汇总 ----------
    const runningCount =
      this.serverList.filter(
        item => item.isRunning
      ).length;


    const totalUsedNum =
      this.serverList.reduce(
        (acc, cur) =>
          acc +
          (
            parseFloat(cur.cdtUsed) || 0
          ),
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
          item =>
            parseFloat(item.usedPercent) >=
            item.threshold
        ).length
    };
  }


  // ==================== 进度条 ====================
  drawProgressBar(
    percentage,
    width,
    height = 4
  ) {

    const theme = this.getTheme();

    const context =
      new DrawContext();

    context.size =
      new Size(width, height);

    context.opaque = false;

    const radius =
      height / 2;


    // ---------- 背景 ----------
    const bgPath =
      new Path();

    bgPath.addRoundedRect(
      new Rect(
        0,
        0,
        width,
        height
      ),
      radius,
      radius
    );

    context.addPath(bgPath);

    context.setFillColor(
      theme.progressBackground
    );

    context.fillPath();


    // ---------- 数值 ----------
    let pctNum =
      parseFloat(percentage) || 0;

    pctNum =
      Math.max(
        0,
        Math.min(100, pctNum)
      );


    const fillWidth =
      Math.max(
        height,
        Math.min(
          width,
          (pctNum / 100) * width
        )
      );


    const fillPath =
      new Path();

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

    const theme =
      this.getTheme();

    widget.setPadding(
      14,
      14,
      14,
      14
    );


    if (
      !this.baseUrl ||
      !this.apiKey
    ) {

      const err =
        widget.addText(
          "⚠️ 请在 App 首页配置 Base URL 和 API Key"
        );

      err.font =
        Font.systemFont(12);

      err.textColor =
        new Color("#ff453a");

      return true;
    }


    if (
      this.serverList.length === 0
    ) {

      const err =
        widget.addText(
          "⚠️ 暂未获取到 accounts 实例数据"
        );

      err.font =
        Font.systemFont(12);

      err.textColor =
        new Color("#ff9f0a");

      return true;
    }

    return false;
  }


  // ==================== Small ====================
  renderSmall = async widget => {

    if (
      this.checkEmpty(widget)
    ) {
      return widget;
    }

    const theme =
      this.getTheme();

    widget.setPadding(
      14,
      14,
      14,
      14
    );


    const a =
      this.serverList[0];


    // ---------- 顶部 ----------
    const topRow =
      widget.addStack();

    topRow.centerAlignContent();


    const name =
      topRow.addText(a.name);

    name.font =
      Font.boldSystemFont(12);

    name.textColor =
      theme.primary;


    topRow.addSpacer();


    const dot =
      topRow.addText("●");

    dot.font =
      Font.systemFont(8);

    dot.textColor =
      a.isRunning
        ? new Color("#30d158")
        : new Color("#ff9f0a");


    widget.addSpacer(2);


    // ---------- 地区 / 费用 ----------
    const subRow =
      widget.addStack();

    subRow.centerAlignContent();


    if (a.region) {

      const reg =
        subRow.addText(a.region);

      reg.font =
        Font.systemFont(9);

      reg.textColor =
        theme.muted;
    }


    subRow.addSpacer();


    if (a.cost) {

      const fee =
        subRow.addText(
          `本月 ${a.cost}`
        );

      fee.font =
        Font.boldSystemFont(10);

      fee.textColor =
        new Color(
          "#ffd60a",
          0.95
        );
    }


    widget.addSpacer(12);


    // ---------- 流量 ----------
    const flowRow =
      widget.addStack();

    flowRow.bottomAlignContent();


    const num =
      flowRow.addText(
        `${a.cdtUsed}`
      );

    num.font =
      Font.heavySystemFont(22);

    num.textColor =
      theme.primary;


    const limit =
      flowRow.addText(
        ` / ${a.cdtLimit} GB`
      );

    limit.font =
      Font.systemFont(10);

    limit.textColor =
      theme.muted;


    widget.addSpacer(8);


    // ---------- 进度条 ----------
    const pImg =
      this.drawProgressBar(
        a.usedPercent,
        128,
        4
      );

    const imgW =
      widget.addImage(pImg);

    imgW.imageSize =
      new Size(128, 4);


    widget.addSpacer(8);


    // ---------- 底部 ----------
    const botRow =
      widget.addStack();

    botRow.centerAlignContent();


    const pct =
      botRow.addText(
        `${a.usedPercent}% 已用`
      );

    pct.font =
      Font.systemFont(8);

    pct.textColor =
      theme.tertiary;


    botRow.addSpacer();


    const sync =
      botRow.addText(
        this.getSyncText()
      );

    sync.font =
      Font.systemFont(8);

    sync.textColor =
      theme.faint;


    return widget;
  };


  // ==================== Medium ====================
  renderMedium = async widget => {

    if (
      this.checkEmpty(widget)
    ) {
      return widget;
    }

    const theme =
      this.getTheme();

    widget.setPadding(
      13,
      15,
      13,
      15
    );


    const s =
      this.summaryData;

    const a =
      this.serverList[0];


    // ---------- 标题 ----------
    const header =
      widget.addStack();

    header.centerAlignContent();


    const title =
      header.addText(
        "CDT MONITOR"
      );

    title.font =
      Font.boldSystemFont(11);

    title.textColor =
      theme.secondary;


    header.addSpacer();


    // ---------- 状态 ----------
    const badge =
      header.addStack();

    badge.backgroundColor =
      a.isRunning
        ? new Color(
            "#30d158",
            0.15
          )
        : new Color(
            "#ff9f0a",
            0.15
          );

    badge.cornerRadius = 6;

    badge.setPadding(
      2,
      6,
      2,
      6
    );

    badge.centerAlignContent();


    const dot =
      badge.addText("● ");

    dot.font =
      Font.systemFont(7);

    dot.textColor =
      a.isRunning
        ? new Color("#30d158")
        : new Color("#ff9f0a");


    const statusText =
      badge.addText(
        a.status
      );

    statusText.font =
      Font.boldSystemFont(9);

    statusText.textColor =
      a.isRunning
        ? new Color("#30d158")
        : new Color("#ff9f0a");


    widget.addSpacer(6);


    // ==================== 数据卡片 ====================
    const statsCard =
      widget.addStack();

    statsCard.backgroundColor =
      theme.card;

    statsCard.cornerRadius = 10;

    statsCard.borderColor =
      theme.cardBorder;

    statsCard.borderWidth =
      0.5;

    statsCard.setPadding(
      5,
      12,
      5,
      12
    );

    statsCard.centerAlignContent();


    const addStat =
      (stack, label, val) => {

        const col =
          stack.addStack();

        col.layoutVertically();


        const lbl =
          col.addText(label);

        lbl.font =
          Font.systemFont(8);

        lbl.textColor =
          theme.muted;


        const num =
          col.addText(
            String(val)
          );

        num.font =
          Font.boldSystemFont(11);

        num.textColor =
          theme.primary;
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


    // ==================== 主卡片 ====================
    const mainCard =
      widget.addStack();

    mainCard.layoutVertically();

    mainCard.backgroundColor =
      theme.card;

    mainCard.cornerRadius = 12;

    mainCard.borderColor =
      theme.cardBorder;

    mainCard.borderWidth =
      0.5;

    mainCard.setPadding(
      8,
      12,
      8,
      12
    );


    // ---------- 名称 ----------
    const rowTop =
      mainCard.addStack();

    rowTop.centerAlignContent();


    const name =
      rowTop.addText(
        a.name
      );

    name.font =
      Font.boldSystemFont(10);

    name.textColor =
      theme.primary;


    if (a.region) {

      const reg =
        rowTop.addText(
          ` · ${a.region}`
        );

      reg.font =
        Font.systemFont(8);

      reg.textColor =
        theme.muted;
    }


    rowTop.addSpacer();


    if (a.cost) {

      const fee =
        rowTop.addText(
          `本月 ${a.cost}`
        );

      fee.font =
        Font.boldSystemFont(10);

      fee.textColor =
        new Color(
          "#ffd60a",
          0.90
        );
    }


    mainCard.addSpacer(3);


    // ---------- 流量 ----------
    const rowData =
      mainCard.addStack();

    rowData.bottomAlignContent();


    const num =
      rowData.addText(
        `${a.cdtUsed}`
      );

    num.font =
      Font.heavySystemFont(15);

    num.textColor =
      theme.primary;


    const limit =
      rowData.addText(
        ` / ${a.cdtLimit} GB`
      );

    limit.font =
      Font.systemFont(9);

    limit.textColor =
      theme.muted;


    mainCard.addSpacer(4);


    // ---------- 进度 ----------
    const pImg =
      this.drawProgressBar(
        a.usedPercent,
        270,
        4
      );

    const imgW =
      mainCard.addImage(pImg);

    imgW.imageSize =
      new Size(270, 4);


    mainCard.addSpacer(4);


    // ---------- 底部 ----------
    const rowBottom =
      mainCard.addStack();

    rowBottom.centerAlignContent();


    const pct =
      rowBottom.addText(
        `${a.usedPercent}% 已使用`
      );

    pct.font =
      Font.systemFont(8);

    pct.textColor =
      theme.tertiary;


    rowBottom.addSpacer();


    const sync =
      rowBottom.addText(
        this.getSyncText()
      );

    sync.font =
      Font.systemFont(8);

    sync.textColor =
      theme.faint;


    if (
      a.threshold !== null &&
      a.threshold !== undefined
    ) {

      rowBottom.addSpacer();


      const th =
        rowBottom.addText(
          `阈值 ${a.threshold}%`
        );

      th.font =
        Font.systemFont(8);

      th.textColor =
        theme.faint;
    }


    return widget;
  };


  // ==================== Large ====================
  renderLarge = async widget => {
    return await this.renderMedium(widget);
  };


  // ==========================================================
  // ==================== OTA 自动更新 ========================
  // ==========================================================

  async checkAndUpdateScript() {

    let newScriptContent =
      null;


    // ---------- GitHub API ----------
    const apiUrl =
      `https://api.github.com/${GITHUB_REPO_PATH}?ref=main&_t=${Date.now()}`;

    try {

      const req =
        new Request(apiUrl);

      req.timeoutInterval = 8;

      req.headers = {
        "Accept":
          "application/vnd.github.v3.raw",
        "Cache-Control":
          "no-cache",
        "User-Agent":
          "Scriptable-CDT-Updater"
      };

      const content =
        await req.loadString();


      if (
        content &&
        content.includes(
          "@name: CDT Monitor"
        ) &&
        content.includes(
          "class Widget"
        )
      ) {
        newScriptContent =
          content;
      }

    } catch (e) {

      console.error(
        `GitHub API 更新失败: ${e}`
      );
    }


    // ---------- Raw 备用 ----------
    if (!newScriptContent) {

      try {

        const req =
          new Request(
            `${BACKUP_RAW_URL}?_t=${Date.now()}`
          );

        req.timeoutInterval = 8;

        req.headers = {
          "Cache-Control":
            "no-cache",
          "User-Agent":
            "Scriptable-CDT-Updater"
        };

        const content =
          await req.loadString();


        if (
          content &&
          content.includes(
            "@name: CDT Monitor"
          ) &&
          content.includes(
            "class Widget"
          )
        ) {
          newScriptContent =
            content;
        }

      } catch (e) {

        console.error(
          `GitHub Raw 更新失败: ${e}`
        );
      }
    }


    // ---------- 下载失败 ----------
    if (!newScriptContent) {

      const alert =
        new Alert();

      alert.title =
        "更新出错";

      alert.message =
        "网络请求失败，未能获取 GitHub 上的最新脚本。";

      alert.addAction(
        "确定"
      );

      await alert.presentAlert();

      return;
    }


    // ==========================================================
    // 版本解析
    // ==========================================================
    const versionPattern =
      /version\s*=\s*["']([^"']+)["']/;

    const headerVersionPattern =
      /@version:\s*([0-9]+(?:\.[0-9]+)*)/;


    const classMatch =
      newScriptContent.match(
        versionPattern
      );

    const headerMatch =
      newScriptContent.match(
        headerVersionPattern
      );


    if (!classMatch) {

      const alert =
        new Alert();

      alert.title =
        "检查失败";

      alert.message =
        "远程脚本没有找到有效的 class version。";

      alert.addAction(
        "确定"
      );

      await alert.presentAlert();

      return;
    }


    const latestVersion =
      classMatch[1];


    // 如果头部版本也存在，必须与 class 版本一致。
    if (
      headerMatch &&
      headerMatch[1] !== latestVersion
    ) {

      const alert =
        new Alert();

      alert.title =
        "版本异常";

      alert.message =
        "远程脚本的顶部 @version 与 class version 不一致。\n\n" +
        `顶部版本：v${headerMatch[1]}\n` +
        `程序版本：v${latestVersion}\n\n` +
        "为避免错误更新，本次更新已取消。";

      alert.addAction(
        "确定"
      );

      await alert.presentAlert();

      return;
    }


    // ---------- 版本比较 ----------
    const compareVersion =
      (a, b) => {

        const pa =
          String(a)
            .split(".")
            .map(
              v =>
                parseInt(v, 10) || 0
            );

        const pb =
          String(b)
            .split(".")
            .map(
              v =>
                parseInt(v, 10) || 0
            );


        const len =
          Math.max(
            pa.length,
            pb.length
          );


        for (
          let i = 0;
          i < len;
          i++
        ) {

          const na =
            pa[i] || 0;

          const nb =
            pb[i] || 0;


          if (na > nb)
            return 1;

          if (na < nb)
            return -1;
        }


        return 0;
      };


    const versionResult =
      compareVersion(
        latestVersion,
        this.version
      );


    // ---------- 防止降级 ----------
    if (
      versionResult < 0
    ) {

      const alert =
        new Alert();

      alert.title =
        "远程版本异常";

      alert.message =
        `当前版本：v${this.version}\n` +
        `远程版本：v${latestVersion}\n\n` +
        "远程版本低于当前版本，为防止降级，本次更新已取消。";

      alert.addAction(
        "确定"
      );

      await alert.presentAlert();

      return;
    }


    // ---------- 已经最新 ----------
    if (
      versionResult === 0
    ) {

      const alert =
        new Alert();

      alert.title =
        "无需更新";

      alert.message =
        `当前已是最新版本 v${this.version}。`;

      alert.addAction(
        "确定"
      );

      await alert.presentAlert();

      return;
    }


    // ---------- 确认更新 ----------
    const alert =
      new Alert();

    alert.title =
      "检测到新版本";

    alert.message =
      `当前版本：v${this.version}\n` +
      `最新版本：v${latestVersion}\n\n` +
      "是否立即下载并覆盖当前脚本？";

    alert.addAction(
      "更新"
    );

    alert.addCancelAction(
      "取消"
    );


    const response =
      await alert.presentAlert();


    if (
      response !== 0
    ) {
      return;
    }


    // ==========================================================
    // 关键：
    // module.filename 就是当前真正正在执行的 JS 文件。
    // 不再猜 Local / iCloud 文件位置。
    // ==========================================================
    try {

      const currentScriptPath =
        module.filename;


      if (
        !currentScriptPath
      ) {
        throw new Error(
          "无法获取当前正在执行的脚本路径。"
        );
      }


      const isICloud =
        currentScriptPath.includes(
          "Documents/iCloud~"
        );


      const targetFM =
        isICloud
          ? FileManager.iCloud()
          : FileManager.local();


      // iCloud 先确保文件已经本地可用。
      if (isICloud) {

        try {

          await targetFM
            .downloadFileFromiCloud(
              currentScriptPath
            );

        } catch (e) {

          console.log(
            `iCloud 文件同步提示：${e}`
          );
        }
      }


      if (
        !targetFM.fileExists(
          currentScriptPath
        )
      ) {
        throw new Error(
          "当前正在运行的脚本文件不存在：\n" +
          currentScriptPath
        );
      }


      // ---------- 写入新脚本 ----------
      targetFM.writeString(
        currentScriptPath,
        newScriptContent
      );


      // ---------- 写入后立即验证 ----------
      const verifyContent =
        targetFM.readString(
          currentScriptPath
        );


      if (
        !verifyContent ||
        !verifyContent.includes(
          "class Widget"
        )
      ) {
        throw new Error(
          "脚本写入后验证失败：文件内容异常。"
        );
      }


      const verifyVersionMatch =
        verifyContent.match(
          versionPattern
        );


      if (
        !verifyVersionMatch ||
        verifyVersionMatch[1] !==
          latestVersion
      ) {

        throw new Error(
          "脚本写入后版本验证失败。\n\n" +
          `期望版本：v${latestVersion}\n` +
          `实际版本：v${
            verifyVersionMatch
              ? verifyVersionMatch[1]
              : "未知"
          }`
        );
      }


      // ---------- 清除 CDT 数据缓存 ----------
      const localFM =
        FileManager.local();

      const cacheDir =
        localFM.joinPath(
          localFM.documentsDirectory(),
          "CDT_Monitor_Cache"
        );

      const cachePath =
        localFM.joinPath(
          cacheDir,
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


      // ---------- 更新成功 ----------
      const successAlert =
        new Alert();

      successAlert.title =
        "更新成功";

      successAlert.message =
        `已成功升级至 v${latestVersion}！\n\n` +
        `写入位置：${
          isICloud
            ? "iCloud"
            : "Local"
        }\n\n` +
        "脚本已完成写入并验证。\n" +
        "即将重新打开脚本。";

      successAlert.addAction(
        "确定"
      );

      await successAlert
        .presentAlert();


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

      errAlert.addAction(
        "确定"
      );

      await errAlert.presentAlert();
    }
  }


  // ==================== 菜单 ====================
  Run() {

    if (!config.runsInApp) {
      return;
    }


    this.registerAction({
      title: "CDT 监控配置",

      menu: [

        {
          name: "baseUrl",

          icon: {
            name: "link",
            color: "#0a84ff"
          },

          title:
            "Base URL (面板地址)",

          type: "input",

          val:
            "baseUrl",

          placeholder:
            "https://你的CDT面板地址",

          desc:
            "填写你自己的 CDT 面板访问地址"
        },


        {
          name: "apiKey",

          icon: {
            name: "key.fill",
            color: "#ff9f0a"
          },

          title:
            "API Key",

          type: "input",

          val:
            "apiKey",

          placeholder:
            "cdt_xxxxxxxx",

          desc:
            "填写你自己的 API Key（需具有 widget:read 权限）"
        },


        {
          name: "update",

          icon: {
            name:
              "arrow.down.circle.fill",
            color:
              "#007aff"
          },

          title:
            `脚本更新 (当前 v${this.version})`,

          type: "input",

          onClick:
            async () => {
              await this.checkAndUpdateScript();
            }
        }
      ]
    });


    this.registerAction({
      title: "",

      menu: [

        {
          name: "basic",

          url:
            "https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/basic.png",

          title:
            "基础功能",

          type:
            "input",

          onClick:
            () => {
              return this.setWidgetConfig();
            }
        },


        {
          name: "reload",

          url:
            "https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/reload.png",

          title:
            "重载组件",

          type:
            "input",

          onClick:
            () => {

              const fm =
                FileManager.local();

              const cachePath =
                fm.joinPath(
                  fm.joinPath(
                    fm.documentsDirectory(),
                    "CDT_Monitor_Cache"
                  ),
                  "cdt_status_cache.json"
                );


              if (
                fm.fileExists(
                  cachePath
                )
              ) {
                fm.remove(
                  cachePath
                );
              }


              this.reopenScript();
            }
        }
      ]
    });
  }


  // ==================== Render ====================
  async render() {

    await this.init();


    const widget =
      new ListWidget();


    // DmYY 继续负责背景图、
    // 背景颜色以及用户自定义背景。
    await this.getWidgetBackgroundImage(
      widget
    );


    let resWidget;


    if (
      this.widgetFamily ===
      "medium"
    ) {

      resWidget =
        await this.renderMedium(
          widget
        );

    } else if (
      this.widgetFamily ===
      "large"
    ) {

      resWidget =
        await this.renderLarge(
          widget
        );

    } else {

      resWidget =
        await this.renderSmall(
          widget
        );
    }


    // 点击组件重新运行。
    resWidget.url =
      `scriptable:///run/${encodeURIComponent(
        Script.name()
      )}`;


    // 注意：
    // 不在这里写死 refreshAfterDate。
    // DmYY 的 Runing() 会读取
    // this.settings.refreshAfterDate。
    //
    // 初始默认值为 15 分钟，
    // 用户可以在「基础功能」中修改。


    return resWidget;
  }
}


// ==================== 启动 ====================
await Runing(
  Widget,
  args.widgetParameter,
  false
);