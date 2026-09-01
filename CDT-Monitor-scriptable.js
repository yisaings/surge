```javascript
/*
 * @name: CDT Monitor
 * @description: 阿里云CDT 流量监控小组件
 * @version: 3.3.5
 * @author: 以撒 (yisaings)
 * @update: 2026/09/01
*/

// ==================== 0. 脚本发布源配置 ====================
// 这里只负责 OTA 更新脚本，不包含任何用户的 CDT 面板地址或 API Key。
const GITHUB_REPO_PATH = "repos/yisaings/surge/contents/CDT-Monitor-scriptable.js";
const BACKUP_RAW_URL = "https://raw.githubusercontent.com/yisaings/surge/main/CDT-Monitor-scriptable.js";
// ==========================================================


// ==================== 1. 自动依赖管理 ====================
async function checkAndDownloadDmYY() {
  const fm = FileManager.local();
  const dmyyPath = fm.joinPath(
    fm.documentsDirectory(),
    'DmYY.js'
  );

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
          fm.writeString(
            dmyyPath,
            String(content)
          );
          break;
        }
      } catch (e) {}
    }
  }
}

if (config.runsInApp) {
  await checkAndDownloadDmYY();
}

if (typeof require === 'undefined') {
  require = importModule;
}

const { DmYY, Runing } = require('./DmYY');


// ==================== 2. CDT Monitor 业务逻辑 ====================
class Widget extends DmYY {

  constructor(arg) {
    super(arg);

    this.name = 'CDT Monitor';
    this.en = 'CDT_Monitor';

    this.Run();
  }


  // ==================== 基础配置 ====================

  version = '3.3.4';

  baseUrl = '';
  apiKey = '';


  // ==================== 数据状态 ====================

  // api   = 本次成功请求 API
  // cache = API 请求失败，使用缓存
  dataSource = 'api';


  // ==================== 时间格式 ====================

  format = (str) => {
    return parseInt(str) >= 10
      ? str
      : `0${str}`;
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
      this.format(date.getMinutes())
    ];
  }


  // ==================== 数据汇总 ====================

  summaryData = {
    totalInstances: 0,
    runningInstances: 0,
    totalTraffic: '0.00',
    alerts: 0
  };


  serverList = [];


  // ==================== 初始化 ====================

  init = async () => {
    try {
      this.baseUrl = (this.settings.baseUrl || '')
        .trim()
        .replace(/\/+$/, '');

      this.apiKey = (this.settings.apiKey || '').trim();

    } catch (e) {
      console.error(e);
    }

    await this.getData();
  };


  // ==================== 数据获取与状态解析 ====================

  async getData() {
    if (!this.baseUrl || !this.apiKey) {
      return;
    }

    // 数据缓存统一放 Local，不跟着脚本存储位置变化。
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

        cacheDate = fm.modificationDate(
          cachePath
        );

      } catch (e) {
        cachedData = null;
        cacheDate = null;
      }
    }


    // ==================== 请求 API ====================
    //
    // 这里不再使用“15 分钟缓存优先”的逻辑。
    //
    // 因为 Widget 是否应该刷新，由 DmYY 的
    // this.settings.refreshAfterDate 决定。
    //
    // 每次 Widget 被系统重新运行时：
    //     1. 尝试请求最新 API
    //     2. API 成功 → 更新缓存
    //     3. API 失败 → 使用旧缓存
    //
    // 这样不会因为本地缓存未过期而阻止 Widget 获取最新数据。
    // ==========================================================

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
        throw new Error(
          "API 返回数据格式异常"
        );
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

      this.refreshUpdateTime(
        new Date()
      );

      this.parseData(res);

      return;

    } catch (e) {

      console.error(
        `CDT API 请求失败: ${e}`
      );


      // ==================== API 失败 → 使用缓存 ====================

      if (cachedData) {
        this.dataSource = 'cache';

        if (cacheDate) {
          this.refreshUpdateTime(
            cacheDate
          );
        }

        this.parseData(
          cachedData
        );

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

        const costVal =
          parseFloat(rawCost);

        const symbol =
          (
            item.currency === 'USD' ||
            !item.currency
          )
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

        isRunning:
          isRunning,

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


    // ==================== 汇总 ====================

    const runningCount =
      this.serverList.filter(
        i => i.isRunning
      ).length;


    const totalUsedNum =
      this.serverList.reduce(
        (acc, cur) =>
          acc +
          parseFloat(
            cur.cdtUsed || 0
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
          i =>
            parseFloat(
              i.usedPercent
            ) >= i.threshold
        ).length
    };
  }


  // ==================== 进度条 ====================

  drawProgressBar(
    percentage,
    width,
    height = 4
  ) {
    const context =
      new DrawContext();

    context.size =
      new Size(
        width,
        height
      );

    context.opaque =
      false;


    const radius =
      height / 2;


    // 背景

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

    context.addPath(
      bgPath
    );

    context.setFillColor(
      new Color(
        "#ffffff",
        0.12
      )
    );

    context.fillPath();


    // 前景

    const pctNum =
      parseFloat(
        percentage
      ) || 0;


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

    context.addPath(
      fillPath
    );


    context.setFillColor(
      pctNum > 90
        ? new Color(
            "#ff375f"
          )
        : new Color(
            "#0a84ff"
          )
    );

    context.fillPath();


    return context.getImage();
  }


  // ==================== 空状态检查 ====================

  checkEmpty(widget) {
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


  // ==================== 同步状态 ====================

  getSyncText() {
    if (
      this.dataSource === 'cache'
    ) {
      return `缓存 ${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`;
    }

    return `同步 ${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`;
  }


  // ==================== 小号组件 ====================

  renderSmall = async (widget) => {
    if (
      this.checkEmpty(widget)
    ) {
      return widget;
    }


    widget.setPadding(
      14,
      14,
      14,
      14
    );


    const a =
      this.serverList[0];


    const topRow =
      widget.addStack();

    topRow.centerAlignContent();


    const name =
      topRow.addText(
        a.name
      );

    name.font =
      Font.boldSystemFont(12);

    name.textColor =
      new Color(
        "#ffffff",
        0.95
      );


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


    const subRow =
      widget.addStack();

    subRow.centerAlignContent();


    if (a.region) {

      const reg =
        subRow.addText(
          a.region
        );

      reg.font =
        Font.systemFont(9);

      reg.textColor =
        new Color(
          "#ffffff",
          0.45
        );
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
      new Color("#ffffff");


    const limit =
      flowRow.addText(
        ` / ${a.cdtLimit} GB`
      );

    limit.font =
      Font.systemFont(10);

    limit.textColor =
      new Color(
        "#ffffff",
        0.45
      );


    widget.addSpacer(8);


    const pImg =
      this.drawProgressBar(
        parseFloat(
          a.usedPercent
        ),
        128,
        4
      );


    const imgW =
      widget.addImage(
        pImg
      );

    imgW.imageSize =
      new Size(
        128,
        4
      );


    widget.addSpacer(8);


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
      new Color(
        "#ffffff",
        0.6
      );


    botRow.addSpacer();


    const sync =
      botRow.addText(
        this.getSyncText()
      );

    sync.font =
      Font.systemFont(8);

    sync.textColor =
      new Color(
        "#ffffff",
        0.35
      );


    return widget;
  };


  // ==================== 中号组件 ====================

  renderMedium = async (widget) => {
    if (
      this.checkEmpty(widget)
    ) {
      return widget;
    }


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
      new Color(
        "#ffffff",
        0.7
      );


    header.addSpacer();


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

    badge.cornerRadius =
      6;

    badge.setPadding(
      2,
      6,
      2,
      6
    );

    badge.centerAlignContent();


    const dot =
      badge.addText(
        "● "
      );

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


    const statsCard =
      widget.addStack();

    statsCard.backgroundColor =
      new Color(
        "#ffffff",
        0.08
      );

    statsCard.cornerRadius =
      10;

    statsCard.borderColor =
      new Color(
        "#ffffff",
        0.15
      );

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
          col.addText(
            label
          );

        lbl.font =
          Font.systemFont(8);

        lbl.textColor =
          new Color(
            "#ffffff",
            0.5
          );


        const num =
          col.addText(
            String(val)
          );

        num.font =
          Font.boldSystemFont(11);

        num.textColor =
          new Color(
            "#ffffff",
            0.95
          );
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


    const mainCard =
      widget.addStack();

    mainCard.layoutVertically();

    mainCard.backgroundColor =
      new Color(
        "#ffffff",
        0.08
      );

    mainCard.cornerRadius =
      12;

    mainCard.borderColor =
      new Color(
        "#ffffff",
        0.15
      );

    mainCard.borderWidth =
      0.5;

    mainCard.setPadding(
      8,
      12,
      8,
      12
    );


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
      new Color(
        "#ffffff",
        0.95
      );


    if (a.region) {

      const reg =
        rowTop.addText(
          ` · ${a.region}`
        );

      reg.font =
        Font.systemFont(8);

      reg.textColor =
        new Color(
          "#ffffff",
          0.45
        );
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
          0.9
        );
    }


    mainCard.addSpacer(3);


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
      new Color(
        "#ffffff"
      );


    const limit =
      rowData.addText(
        ` / ${a.cdtLimit} GB`
      );

    limit.font =
      Font.systemFont(9);

    limit.textColor =
      new Color(
        "#ffffff",
        0.45
      );


    mainCard.addSpacer(4);


    const pImg =
      this.drawProgressBar(
        parseFloat(
          a.usedPercent
        ),
        270,
        4
      );


    const imgW =
      mainCard.addImage(
        pImg
      );

    imgW.imageSize =
      new Size(
        270,
        4
      );


    mainCard.addSpacer(4);


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
      new Color(
        "#ffffff",
        0.6
      );


    rowBottom.addSpacer();


    const sync =
      rowBottom.addText(
        this.getSyncText()
      );

    sync.font =
      Font.systemFont(8);

    sync.textColor =
      new Color(
        "#ffffff",
        0.35
      );


    if (
      a.threshold !== null
    ) {

      rowBottom.addSpacer();


      const th =
        rowBottom.addText(
          `阈值 ${a.threshold}%`
        );

      th.font =
        Font.systemFont(8);

      th.textColor =
        new Color(
          "#ffffff",
          0.35
        );
    }


    return widget;
  };


  // ==================== Large ====================

  renderLarge = async (widget) => {
    return await this.renderMedium(widget);
  };


  // ==========================================================
  // ==================== OTA 更新 ============================
  // ==========================================================

  async checkAndUpdateScript() {

    console.log(
      "正在检查更新..."
    );


    let newScriptContent = null;


    // ==================== GitHub API ====================

    const apiUrl =
      `https://api.github.com/${GITHUB_REPO_PATH}?ref=main&_t=${Date.now()}`;


    try {

      const req =
        new Request(apiUrl);

      req.timeoutInterval =
        6;

      req.headers = {
        'Accept':
          'application/vnd.github.v3.raw',

        'User-Agent':
          'Scriptable-CDT-Updater'
      };


      const content =
        await req.loadString();


      if (
        content &&
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


    // ==================== GitHub Raw 备用 ====================

    if (!newScriptContent) {

      try {

        const req =
          new Request(
            `${BACKUP_RAW_URL}?_t=${Date.now()}`
          );

        req.timeoutInterval =
          5;


        const content =
          await req.loadString();


        if (
          content &&
          content.includes(
            "class Widget"
          )
        ) {

          newScriptContent =
            content;
        }

      } catch (err) {

        console.error(
          `GitHub Raw 更新失败: ${err}`
        );
      }
    }


    // ==================== 网络失败 ====================

    if (!newScriptContent) {

      const alert =
        new Alert();

      alert.title =
        "更新出错";

      alert.message =
        "网络请求失败，未能连接到 GitHub 仓库。";

      alert.addAction(
        "确定"
      );

      await alert.presentAlert();

      return;
    }


    // ==================== 读取远程版本 ====================

    const versionPattern =
      /version\s*=\s*['"]([^'"]+)['"]/;


    const match =
      newScriptContent.match(
        versionPattern
      );


    if (!match) {

      const alert =
        new Alert();

      alert.title =
        "检查失败";

      alert.message =
        "远程脚本格式不正确，未匹配到版本号。";

      alert.addAction(
        "确定"
      );

      await alert.presentAlert();

      return;
    }


    const latestVersion =
      match[1];


    // ==================== 版本比较 ====================

    const compareVersion =
      (a, b) => {

        const pa =
          String(a)
            .split('.')
            .map(
              v =>
                parseInt(
                  v,
                  10
                ) || 0
            );


        const pb =
          String(b)
            .split('.')
            .map(
              v =>
                parseInt(
                  v,
                  10
                ) || 0
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


          if (
            na > nb
          ) {
            return 1;
          }


          if (
            na < nb
          ) {
            return -1;
          }
        }


        return 0;
      };


    const versionResult =
      compareVersion(
        latestVersion,
        this.version
      );


    // ==================== 防止降级 ====================

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
        "远程版本低于当前版本，为防止降级更新，本次已取消。";


      alert.addAction(
        "确定"
      );


      await alert.presentAlert();

      return;
    }


    // ==================== 已是最新 ====================

    if (
      versionResult === 0
    ) {

      const alert =
        new Alert();


      alert.title =
        "无需更新";


      alert.message =
        `当前已是最新版本 (v${this.version})。`;


      alert.addAction(
        "确定"
      );


      await alert.presentAlert();

      return;
    }


    // ==================== 确认更新 ====================

    const alert =
      new Alert();


    alert.title =
      "检测到新版本";


    alert.message =
      `当前版本：v${this.version}\n` +
      `最新版本：v${latestVersion}\n\n` +
      "是否立即下载并覆盖更新？";


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
    // OTA 核心修复
    //
    // DmYY 已经在 _init() 中根据 module.filename 判断了
    // 当前脚本究竟位于 iCloud 还是 Local，并保存到：
    //
    //     this.FILE_MGR
    //
    // 因此这里直接使用 this.FILE_MGR，
    // 不再猜 Local / iCloud。
    // ==========================================================

    try {

      const targetFM =
        this.FILE_MGR;


      if (!targetFM) {

        throw new Error(
          "无法取得当前脚本的 FileManager。"
        );
      }


      const scriptFileName =
        `${Script.name()}.js`;


      const targetPath =
        targetFM.joinPath(
          targetFM.documentsDirectory(),
          scriptFileName
        );


      console.log(
        `OTA 更新目标：${targetPath}`
      );


      // ==================== 确认目标文件存在 ====================

      if (
        !targetFM.fileExists(
          targetPath
        )
      ) {

        throw new Error(
          `未找到当前脚本文件：\n${targetPath}`
        );
      }


      // ==================== iCloud 文件下载 ====================

      try {

        await targetFM.downloadFileFromiCloud(
          targetPath
        );

      } catch (e) {

        console.log(
          `iCloud 文件下载检查：${e}`
        );
      }


      // ==================== 写入当前脚本 ====================

      targetFM.writeString(
        targetPath,
        newScriptContent
      );


      // ==================== 写入验证 ====================

      const verifyContent =
        targetFM.readString(
          targetPath
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
          "脚本已经写入，但读取回来的版本号不正确。\n\n" +
          `期望：v${latestVersion}\n` +
          `实际：v${verifyMatch ? verifyMatch[1] : '未知'}`
        );
      }


      console.log(
        `OTA 更新验证成功：v${latestVersion}`
      );


      // ==================== 清除 CDT 缓存 ====================

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
        "当前脚本已完成覆盖。\n" +
        "请完全关闭 Scriptable 后重新打开。";


      successAlert.addAction(
        "确定"
      );


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
        "写入失败";


      errAlert.message =
        String(err);


      errAlert.addAction(
        "确定"
      );


      await errAlert.presentAlert();
    }
  }


  // ==================== 菜单注册 ====================

  Run() {

    if (
      config.runsInApp
    ) {

      this.registerAction({

        title:
          'CDT 监控配置',

        menu: [

          {
            name:
              'baseUrl',

            icon: {
              name:
                'link',
              color:
                '#0a84ff'
            },

            title:
              'Base URL (面板地址)',

            type:
              'input',

            val:
              'baseUrl',

            placeholder:
              'https://你的CDT面板地址',

            desc:
              '填写你自己的 CDT 面板访问地址'
          },


          {
            name:
              'apiKey',

            icon: {
              name:
                'key.fill',
              color:
                '#ff9f0a'
            },

            title:
              'API Key',

            type:
              'input',

            val:
              'apiKey',

            placeholder:
              'cdt_xxxxxxxx',

            desc:
              '填写你自己的 API Key（需具有 widget:read 权限）'
          },


          {
            name:
              'update',

            icon: {
              name:
                'arrow.down.circle.fill',
              color:
                '#007aff'
            },

            title:
              `脚本更新 (当前 v${this.version})`,

            type:
              'input',

            onClick:
              async () => {

                await this.checkAndUpdateScript();

              }
          }

        ]
      });


      this.registerAction({

        title:
          '',

        menu: [

          {
            name:
              'basic',

            url:
              'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/basic.png',

            title:
              '基础功能',

            type:
              'input',

            onClick:
              () => {

                return this.setWidgetConfig();

              }
          },


          {
            name:
              'reload',

            url:
              'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/reload.png',

            title:
              '重载组件',

            type:
              'input',

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
  }


  // ==================== 渲染总入口 ====================

  async render() {

    await this.init();


    const widget =
      new ListWidget();


    await this.getWidgetBackgroundImage(
      widget
    );


    let resWidget;


    if (
      this.widgetFamily ===
      'medium'
    ) {

      resWidget =
        await this.renderMedium(
          widget
        );

    } else if (
      this.widgetFamily ===
      'large'
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


    // ==========================================================
    // 注意：
    //
    // 这里故意不自己写死刷新时间。
    //
    // DmYY 的 Runing() 会在 render() 完成后，
    // 继续读取：
    //
    //     M.settings.refreshAfterDate
    //
    // 并统一设置 W.refreshAfterDate。
    //
    // 因此用户在“基础功能 → 刷新时间”里设置多少，
    // 这里就使用多少。
    // ==========================================================

    resWidget.url =
      `scriptable:///run/${encodeURIComponent(
        Script.name()
      )}`;


    return resWidget;
  }
}


// ==================== 启动 ====================

await Runing(
  Widget,
  args.widgetParameter,
  false
);
```
