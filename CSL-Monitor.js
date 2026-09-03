// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: futbol;

/*
 * @name: CSL Monitor
 * @description: 中超比赛监控 - iOS Native Glass UI
 * @version: 1.0.0
 * @author: yisa
 *
 * 核心特性:
 * - 全场景自适应布局（0场全景榜、1~4场对阵深度分析看板、5~8场大比赛日全景列表）
 * - Color.dynamic 底层动态变色，深浅色模式秒级丝滑切换
 * - 像素级物理对齐与对称排版，严防长队名折行与队徽形变
 * - 本地磁盘多级穿透缓存，保障弱网与离线队徽瞬时加载
 */

/* ============================================================
 * DmYY 自动加载
 * ============================================================ */

const DmYY_URLS = [
  "https://testingcf.jsdelivr.net/gh/dompling/Scriptable@master/Scripts/DmYY.js",
  "https://raw.githubusercontent.com/dompling/Scriptable/master/Scripts/DmYY.js"
];

async function checkAndDownloadDmYY() {
  const fm = FileManager.local();
  const dmyyPath = fm.joinPath(fm.documentsDirectory(), "DmYY.js");

  if (fm.fileExists(dmyyPath)) return;

  for (const url of DmYY_URLS) {
    try {
      const req = new Request(String(url));
      req.method = "GET";
      req.headers = { "User-Agent": "Mozilla/5.0" };
      req.timeoutInterval = 6;
      const content = await req.loadString();
      const text = typeof content === "string" ? content : String(content || "");

      if (text.length > 1000 && text.includes("class DmYY")) {
        fm.writeString(dmyyPath, text);
        return;
      }
    } catch (e) {
      console.error("DmYY 下载失败: " + safeString(e));
    }
  }

  throw new Error("DmYY.js 下载失败，请检查网络后重新运行脚本");
}

await checkAndDownloadDmYY();

const { DmYY, Runing } = importModule("./DmYY");


/* ============================================================
 * 安全类型转换
 * ============================================================ */

function safeString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }

  try {
    if (typeof value === "object" && value.string !== undefined) {
      return safeString(value.string);
    }
  } catch (e) {}

  try {
    return String(value);
  } catch (e) {
    return "";
  }
}

function safeError(error) {
  try {
    if (error && error.message !== undefined) {
      return safeString(error.message);
    }
    return safeString(error);
  } catch (e) {
    return "Unknown error";
  }
}


/* ============================================================
 * 球队与队标底册
 * ============================================================ */

const TEAMS = [
  "成都蓉城", "北京国安", "青岛西海岸", "大连英博",
  "山东泰山", "云南玉昆", "上海海港", "重庆铜梁龙",
  "上海申花", "浙江队", "深圳新鹏城", "河南队",
  "辽宁铁人", "天津津门虎", "武汉三镇", "青岛海牛"
];

const TEAM_ALIASES = {
  "深圳新鵬城": "深圳新鹏城",
  "深圳新鵬城队": "深圳新鹏城",
  "深圳新鹏城队": "深圳新鹏城",
  "浙江FC": "浙江队",
  "浙江俱乐部": "浙江队",
  "浙江俱乐部绿城": "浙江队",
  "浙江": "浙江队",
  "大连智行": "大连英博",
  "大连英博海发": "大连英博",
  "河南嵩山龙门": "河南队",
  "河南建业": "河南队",
  "河南": "河南队",
  "河南俱乐部": "河南队",
  "天津泰达": "天津津门虎",
  "天津津门虎队": "天津津门虎",
  "成都蓉城队": "成都蓉城",
  "北京国安队": "北京国安",
  "山东泰山队": "山东泰山",
  "上海申花队": "上海申花",
  "上海海港队": "上海海港",
  "青岛海牛队": "青岛海牛",
  "武汉三镇队": "武汉三镇",
  "辽宁铁人队": "辽宁铁人",
  "云南玉昆队": "云南玉昆",
  "青岛西海岸队": "青岛西海岸",
  "重庆铜梁龙队": "重庆铜梁龙"
};

const TEAM_LOGOS = {
  "成都蓉城": "https://www.footylogos.com/downloads/logo/chengdu-rongcheng-logo-footylogos.png",
  "北京国安": "https://www.footylogos.com/downloads/logo/beijing-guoan-logo-footylogos.png",
  "青岛西海岸": "https://www.footylogos.com/downloads/logo/qingdao-west-coast-logo-footylogos.png",
  "大连英博": "https://www.footylogos.com/downloads/logo/dalian-yingbo-logo-footylogos.png",
  "山东泰山": "https://www.footylogos.com/downloads/logo/shandong-taishan-logo-footylogos.png",
  "云南玉昆": "https://www.footylogos.com/downloads/logo/yunnan-yukun-logo-footylogos.png",
  "上海海港": "https://www.footylogos.com/downloads/logo/shanghai-port-logo-footylogos.png",
  "重庆铜梁龙": "https://www.footylogos.com/downloads/logo/chongqing-tonglianglong-logo-footylogos.png",
  "上海申花": "https://www.footylogos.com/downloads/logo/shanghai-shenhua-logo-footylogos.png",
  "浙江队": "https://www.footylogos.com/downloads/logo/zhejiang-professional-logo-footylogos.png",
  "浙江": "https://www.footylogos.com/downloads/logo/zhejiang-professional-logo-footylogos.png",
  "深圳新鹏城": "https://www.footylogos.com/downloads/logo/shenzhen-xinpengcheng-logo-footylogos.png",
  "河南队": "https://www.footylogos.com/downloads/logo/henan-fc-logo-footylogos.png",
  "河南": "https://www.footylogos.com/downloads/logo/henan-fc-logo-footylogos.png",
  "辽宁铁人": "https://www.footylogos.com/downloads/logo/liaoning-tieren-logo-footylogos.png",
  "天津津门虎": "https://www.footylogos.com/downloads/logo/tianjin-jinmen-tiger-logo-footylogos.png",
  "武汉三镇": "https://www.footylogos.com/downloads/logo/wuhan-three-towns-logo-footylogos.png",
  "青岛海牛": "https://www.footylogos.com/downloads/logo/qingdao-hainiu-logo-footylogos.png"
};

const SINA_HOME = "https://match.sports.sina.com.cn/livecast/show_date.php?date=";
const SINA_RANK = "https://match.sports.sina.com.cn/football/opta_rank.php?item=order&lid=8&type=2&year=2026";

const IMAGE_CACHE = new Map();
const GLOBAL_LOGOS = {};

function normalizeTeamText(text) {
  let value = decodeHTML(safeString(text)).replace(/\s+/g, " ").trim();
  const keys = Object.keys(TEAM_ALIASES);
  for (const key of keys) {
    value = value.split(safeString(key)).join(safeString(TEAM_ALIASES[key]));
  }
  return value;
}

function normalizeTeamName(name) {
  const value = normalizeTeamText(name);
  return TEAM_ALIASES[value] || value;
}

function getTeamLogoURL(team) {
  const raw = safeString(team).trim();
  const name = normalizeTeamName(raw);
  const clean = name.replace(/队$/, "");
  const withTeam = clean + "队";

  return safeString(
    TEAM_LOGOS[name] ||
    TEAM_LOGOS[clean] ||
    TEAM_LOGOS[withTeam] ||
    TEAM_LOGOS[raw] ||
    GLOBAL_LOGOS[name] ||
    GLOBAL_LOGOS[clean] ||
    GLOBAL_LOGOS[withTeam] ||
    ""
  );
}


/* ============================================================
 * 北京时间
 * ============================================================ */

function getBeijingDate(offsetDays = 0) {
  try {
    const d = new Date();
    if (offsetDays !== 0) d.setDate(d.getDate() + offsetDays);
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(d);

    let y = "", m = "", day = "";
    for (const item of parts) {
      if (item.type === "year") y = safeString(item.value);
      if (item.type === "month") m = safeString(item.value);
      if (item.type === "day") day = safeString(item.value);
    }
    return y + "-" + m + "-" + day;
  } catch (e) {
    return "";
  }
}

function getWeekday(dateString) {
  const date = new Date(safeString(dateString) + "T00:00:00+08:00");
  const names = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return names[date.getDay()] || "";
}


/* ============================================================
 * 网络与图片持久化
 * ============================================================ */

async function fetchString(url, timeout = 6) {
  const requestURL = safeString(url);
  if (!requestURL) return "";

  try {
    const req = new Request(requestURL);
    req.method = "GET";
    req.headers = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      "Accept": "text/html,application/xhtml+xml,application/xml,text/html"
    };
    req.timeoutInterval = Number(timeout) || 6;
    const result = await req.loadString();
    return safeString(result);
  } catch (e) {
    return "";
  }
}

function normalizeImageURL(url) {
  let value = safeString(url).trim();
  if (!value) return "";

  value = decodeHTML(value).trim();
  if (value.startsWith("//")) value = "https:" + value;
  if (value.startsWith("http://")) value = value.replace(/^http:\/\//i, "https://");
  return value;
}

async function fetchImage(url, key = "") {
  const imageURL = normalizeImageURL(url);
  const fm = FileManager.local();
  const cacheDir = fm.joinPath(fm.cacheDirectory(), "csl_team_logos");

  if (imageURL && IMAGE_CACHE.has(imageURL)) return IMAGE_CACHE.get(imageURL);

  if (key) {
    const cleanKey = normalizeTeamName(key).replace(/队$/, "");
    const candidates = [cleanKey, cleanKey + "队", key];
    for (const name of candidates) {
      const localPath = fm.joinPath(cacheDir, `${encodeURIComponent(name)}.png`);
      if (fm.fileExists(localPath)) {
        try {
          const diskImg = Image.fromFile(localPath);
          if (diskImg) {
            if (imageURL) IMAGE_CACHE.set(imageURL, diskImg);
            return diskImg;
          }
        } catch (e) {}
      }
    }
  }

  if (!imageURL || !/^https?:\/\//i.test(imageURL)) return null;

  try {
    const req = new Request(imageURL);
    req.method = "GET";
    req.headers = {
      "User-Agent": "Mozilla/5.0",
      "Accept": "image/avif,image/webp,image/png,image/jpeg,*/*"
    };
    req.timeoutInterval = 4;

    const image = await req.loadImage();
    if (image) {
      IMAGE_CACHE.set(imageURL, image);
      if (key) {
        if (!fm.fileExists(cacheDir)) {
          try { fm.createDirectory(cacheDir, true); } catch (e) {}
        }
        const cleanKey = normalizeTeamName(key).replace(/队$/, "");
        const savePath = fm.joinPath(cacheDir, `${encodeURIComponent(cleanKey)}.png`);
        try { fm.writeImage(savePath, image); } catch (e) {}
      }
    }
    return image;
  } catch (e) {
    return null;
  }
}

async function preloadLogoImages(standings, matches = []) {
  const tasks = [];
  for (const team of TEAMS) {
    const url = getTeamLogoURL(team);
    if (url) tasks.push(fetchImage(url, team));
  }
  if (Array.isArray(standings)) {
    for (const item of standings) {
      const url = getTeamLogoURL(item.team) || safeString(item.logo);
      if (url) tasks.push(fetchImage(url, item.team));
    }
  }
  if (Array.isArray(matches)) {
    for (const match of matches) {
      const homeURL = getTeamLogoURL(match.home) || safeString(match.homeLogo);
      const awayURL = getTeamLogoURL(match.away) || safeString(match.awayLogo);
      if (homeURL) tasks.push(fetchImage(homeURL, match.home));
      if (awayURL) tasks.push(fetchImage(awayURL, match.away));
    }
  }
  await Promise.all(tasks);
}


/* ============================================================
 * HTML 与文本解析
 * ============================================================ */

function decodeHTML(str) {
  const value = safeString(str);
  if (!value) return "";

  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (match, n) => String.fromCharCode(parseInt(n, 10)));
}

function stripHTML(str) {
  const value = safeString(str);
  if (!value) return "";

  return decodeHTML(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function extractRows(html) {
  const value = safeString(html);
  if (!value) return [];
  return value.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];
}

function extractCells(row) {
  const value = safeString(row);
  if (!value) return [];
  return value.match(/<td\b[^>]*>[\s\S]*?<\/td>/gi) || [];
}

function extractImages(html) {
  const value = safeString(html);
  if (!value) return [];
  return value.match(/<img\b[^>]*>/gi) || [];
}

function getImageURL(imgTag) {
  const value = safeString(imgTag);
  if (!value) return "";

  const patterns = [
    /\bsrc\s*=\s*["']([^"']+)["']/i,
    /\bdata-src\s*=\s*["']([^"']+)["']/i,
    /\bdata-original\s*=\s*["']([^"']+)["']/i,
    /\boriginal\s*=\s*["']([^"']+)["']/i,
    /\blazy-src\s*=\s*["']([^"']+)["']/i
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match && match[1]) {
      const url = normalizeImageURL(match[1]);
      if (/^https?:\/\//i.test(url)) return url;
    }
  }
  return "";
}

function extractAllImages(html) {
  return extractImages(html)
    .map(getImageURL)
    .filter(url => !url && /^https?:\/\//i.test(safeString(url)));
}

function findTeams(text) {
  const normalized = normalizeTeamText(text);
  if (!normalized) return [];

  const found = [];
  for (const team of TEAMS) {
    const index = normalized.indexOf(team);
    if (index >= 0) {
      found.push({ team: safeString(team), index: Number(index) });
    }
  }

  found.sort((a, b) => a.index - b.index);

  const result = [];
  for (const item of found) {
    if (result.indexOf(item.team) < 0) {
      result.push(item.team);
    }
  }
  return result;
}

function findScore(text, timeString) {
  let value = safeString(text);
  if (!value) return null;

  if (timeString) {
    value = value.replace(new RegExp(timeString, "g"), " ");
  }

  const match = value.match(/(?:^|\s|完|全场|点球)(\d{1,2})\s*[-－—:：]\s*(\d{1,2})(?:\s|$|完|全场)/);
  if (!match) return null;

  const h = parseInt(match[1], 10);
  const a = parseInt(match[2], 10);

  if (h > 15 || a > 15) return null;

  return { home: h, away: a };
}

function collectLogoMap(html, logoMap) {
  if (!html || !logoMap) return;
  const rows = extractRows(html);

  for (const row of rows) {
    const teams = findTeams(stripHTML(row));
    if (teams.length < 1) continue;

    const cells = extractCells(row);
    for (const cell of cells) {
      const cellText = stripHTML(cell);
      const cellTeams = findTeams(cellText);
      if (!cellTeams.length) continue;

      const images = extractAllImages(cell);
      if (!images.length) continue;

      for (const team of cellTeams) {
        if (!logoMap[team]) {
          logoMap[team] = safeString(images[0]);
        }
      }
    }

    const rowImages = extractAllImages(row);
    if (rowImages.length >= 2 && teams.length >= 2) {
      if (!logoMap[teams[0]]) logoMap[teams[0]] = safeString(rowImages[0]);
      if (!logoMap[teams[1]]) logoMap[teams[1]] = safeString(rowImages[1]);
    }
    if (teams.length === 1 && rowImages.length >= 1) {
      if (!logoMap[teams[0]]) logoMap[teams[0]] = safeString(rowImages[0]);
    }
  }
}

function parseMatchRows(html) {
  const result = [];
  if (!html) return result;

  for (const row of extractRows(html)) {
    const text = stripHTML(row);
    if (!text) continue;
    if (/女足|U\d+|青年|预备队|足协杯|亚冠|友谊赛/.test(text)) continue;

    const teams = findTeams(text);
    if (teams.length < 2 || teams[0] === teams[1]) continue;

    const home = safeString(teams[0]);
    const away = safeString(teams[1]);

    let rowRound = "";
    const rMatch = text.match(/(?:中超\s*)?第\s*(\d{1,2})\s*轮/);
    if (rMatch) {
      rowRound = parseInt(rMatch[1], 10);
    }

    let time = "";
    const cells = extractCells(row);
    for (const cell of cells) {
      const cellText = stripHTML(cell);
      const tm = cellText.match(/(?:^|\s)(\d{1,2})\s*[:：]\s*(\d{1,2})(?:\s|$)/);
      if (tm) {
        time = String(tm[1]).padStart(2, "0") + ":" + String(tm[2]).padStart(2, "0");
        break;
      }
    }

    if (!time) {
      const tm = text.match(/(?:^|\s)(\d{1,2})\s*[:：]\s*(\d{1,2})(?:\s|$)/);
      if (tm) {
        time = String(tm[1]).padStart(2, "0") + ":" + String(tm[2]).padStart(2, "0");
      }
    }

    const score = findScore(text, time);

    let homeLogo = getTeamLogoURL(home);
    let awayLogo = getTeamLogoURL(away);

    result.push({
      time: safeString(time),
      home: safeString(home),
      away: safeString(away),
      homeLogo: safeString(homeLogo),
      awayLogo: safeString(awayLogo),
      score: score,
      round: rowRound
    });
  }
  return result;
}

function parseDailyMatches(html) {
  const matches = parseMatchRows(html);
  const unique = [];
  const seen = new Set();

  for (const item of matches) {
    const key = [safeString(item.time), safeString(item.home), safeString(item.away)].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  return unique.sort((a, b) => safeString(a.time).localeCompare(safeString(b.time)));
}

function parseStandings(html, logoMap) {
  const result = [];
  if (!html) return result;

  collectLogoMap(html, logoMap);

  for (const row of extractRows(html)) {
    const cells = extractCells(row);
    if (cells.length < 3) continue;

    const cellTexts = cells.map(cell => stripHTML(safeString(cell)));
    let teamIndex = -1;
    let team = "";

    for (let i = 0; i < cellTexts.length; i++) {
      const found = findTeams(safeString(cellTexts[i]));
      if (found.length) {
        teamIndex = i;
        team = safeString(found[0]);
        break;
      }
    }

    if (teamIndex < 0 || !team) continue;

    const values = [];
    for (let i = teamIndex + 1; i < cellTexts.length; i++) {
      const value = safeString(cellTexts[i]).replace(/[^\d-]/g, "");
      if (/^-?\d+$/.test(value)) {
        values.push(parseInt(value, 10));
      }
    }

    if (values.length < 2) continue;

    let rank = 0;
    for (let i = 0; i < teamIndex; i++) {
      const n = safeString(cellTexts[i]).match(/^\s*(\d+)\s*$/);
      if (n) {
        rank = parseInt(n[1], 10);
        break;
      }
    }

    if (!rank) rank = result.length + 1;

    const played = Number(values[0]) || 0;
    const wins = Number(values[1]) || 0;
    const draws = Number(values[2]) || 0;
    const losses = Number(values[3]) || 0;
    const goalsFor = Number(values[4]) || 0;
    const goalsAgainst = Number(values[5]) || 0;
    const points = Number(values[values.length - 1]) || 0;

    if (played < 0 || played > 40 || points < 0 || points > 150) continue;

    const logo = getTeamLogoURL(team) || safeString(logoMap[team]) || safeString(GLOBAL_LOGOS[team]) || "";

    result.push({
      rank: Number(rank),
      team: safeString(team),
      logo: safeString(logo),
      played: Number(played),
      wins: Number(wins),
      draws: Number(draws),
      losses: Number(losses),
      goalsFor: Number(goalsFor),
      goalsAgainst: Number(goalsAgainst),
      points: Number(points)
    });
  }

  const unique = [];
  const seen = new Set();
  for (const item of result) {
    const itemTeam = safeString(item.team);
    if (seen.has(itemTeam)) continue;
    seen.add(itemTeam);
    unique.push(item);
  }

  unique.sort((a, b) => Number(a.rank) - Number(b.rank));
  for (const item of unique) {
    item.logo = getTeamLogoURL(item.team) || safeString(item.logo) || "";
  }
  return unique;
}

function getCachedStandings() {
  const fm = FileManager.local();
  const cachePath = fm.joinPath(fm.cacheDirectory(), "csl_standings_db.json");
  if (fm.fileExists(cachePath)) {
    try {
      const raw = fm.readString(cachePath);
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length >= 10) return data;
    } catch (e) {}
  }
  return TEAMS.map((t, idx) => ({
    rank: idx + 1,
    team: t,
    logo: getTeamLogoURL(t),
    played: 24,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 30 - idx
  }));
}

function saveCachedStandings(standings) {
  if (!Array.isArray(standings) || standings.length < 10) return;
  const fm = FileManager.local();
  const cachePath = fm.joinPath(fm.cacheDirectory(), "csl_standings_db.json");
  try {
    fm.writeString(cachePath, JSON.stringify(standings));
  } catch (e) {}
}

async function findNextMatch(favTeam, currentBeijingDate) {
  if (!favTeam) return null;

  const offsets = [1, 2, 3, 4, 5, 6, 7];
  const promises = offsets.map(offset => {
    const targetDate = getBeijingDate(offset);
    return fetchString(SINA_HOME + targetDate, 3).then(html => ({
      date: targetDate,
      offset: offset,
      matches: parseDailyMatches(html)
    }));
  });

  const results = await Promise.all(promises);

  for (const res of results) {
    for (const m of res.matches) {
      if (
        normalizeTeamName(m.home) === favTeam ||
        normalizeTeamName(m.away) === favTeam
      ) {
        return {
          ...m,
          matchDate: res.date,
          offsetDays: res.offset
        };
      }
    }
  }

  return null;
}


/* ============================================================
 * CSL Monitor 主类
 * ============================================================ */

class CSLMonitor extends DmYY {
  constructor(arg) {
    super(arg, {
      refreshInterval: 30,
      light: { bgColor: "#F2F5F3" },
      dark: { bgColor: "#0D110F" }
    });

    this.registerAction("基础外观设置", async () => {
      await this.setWidgetConfig();
    }, { name: "gear", color: "#8C8C8C" });

    this.registerAction({
      title: "球队关注设置",
      menu: [
        {
          name: "favoriteTeam",
          val: "favoriteTeam",
          type: "select",
          title: "关注球队",
          desc: "右上角与顶置栏将展示主队及下一场预告",
          icon: { name: "star.fill", color: "#FF9500" },
          options: ["不关注", ...TEAMS]
        }
      ]
    });
  }

  get favoriteTeam() {
    let value = "";
    try {
      value = safeString(this.settings && this.settings.favoriteTeam).trim();
    } catch (e) {
      value = "";
    }
    if (!value || value === "不关注") return "";
    return normalizeTeamName(value);
  }

  get widgetDate() {
    return getBeijingDate();
  }

  isFavoriteMatch(match) {
    const fav = this.favoriteTeam;
    if (!fav) return false;
    return (
      normalizeTeamName(match.home) === fav ||
      normalizeTeamName(match.away) === fav
    );
  }

  setupBackground(widget) {
    const gradient = new LinearGradient();
    gradient.locations = [0, 0.5, 1];
    gradient.colors = [
      Color.dynamic(new Color("#F8FAF9"), new Color("#0A0D0B")),
      Color.dynamic(new Color("#EFF4F1"), new Color("#111613")),
      Color.dynamic(new Color("#F5F8F6"), new Color("#080B09"))
    ];
    widget.backgroundGradient = gradient;
  }

  font(size, weight = "regular") {
    try {
      return this.provideFont(
        "SFProRounded-" + (weight === "bold" ? "Semibold" : (weight === "medium" ? "Medium" : "Regular")),
        Number(size) || 12
      );
    } catch (e) {
      return Font.systemFont(Number(size) || 12);
    }
  }

  text(parent, value, size, options = {}) {
    const stringValue = safeString(value === null || value === undefined ? "" : value);
    const t = parent.addText(stringValue);

    t.font = options.font || this.font(size, options.weight || "regular");
    t.textColor = options.color || Color.dynamic(new Color("#17201A"), Color.white());

    if (options.opacity !== undefined) t.textOpacity = Number(options.opacity);
    if (options.lineLimit) t.lineLimit = Number(options.lineLimit);
    if (options.minimumScaleFactor) t.minimumScaleFactor = Number(options.minimumScaleFactor);

    return t;
  }

  async logo(parent, url, size, key = "") {
    const imageURL = safeString(url);
    const image = await fetchImage(imageURL, key);

    if (image) {
      const img = parent.addImage(image);
      img.imageSize = new Size(Number(size) || 18, Number(size) || 18);
      img.cornerRadius = (Number(size) || 18) * 0.22;
      return img;
    }

    const fallback = parent.addText("⚽");
    fallback.font = this.font((Number(size) || 18) * 0.7, "bold");
    fallback.centerAlignText();
    return fallback;
  }

  glass(parent, padding = 10, radius = 16) {
    const stack = parent.addStack();
    stack.layoutHorizontally();
    stack.cornerRadius = radius;
    stack.setPadding(Number(padding), Number(padding), Number(padding), Number(padding));

    stack.backgroundColor = Color.dynamic(
      new Color("#FFFFFF", 0.68),
      new Color("#FFFFFF", 0.045)
    );

    stack.borderWidth = 0.5;
    stack.borderColor = Color.dynamic(
      new Color("#FFFFFF", 0.9),
      new Color("#FFFFFF", 0.08)
    );

    return stack;
  }

  /* ==========================================================
   * 顶部 Header
   * ========================================================== */
  async drawHeader(widget, round, dateString, standingsMap) {
    const header = widget.addStack();
    header.layoutHorizontally();
    header.centerAlignContent();

    const titleBadge = header.addStack();
    titleBadge.layoutHorizontally();
    titleBadge.centerAlignContent();
    titleBadge.setPadding(3, 7, 3, 7);
    titleBadge.cornerRadius = 7;
    titleBadge.backgroundColor = Color.dynamic(
      new Color("#34C759", 0.12),
      new Color("#34C759", 0.16)
    );
    titleBadge.borderWidth = 0.5;
    titleBadge.borderColor = Color.dynamic(
      new Color("#34C759", 0.2),
      new Color("#34C759", 0.25)
    );

    const icon = titleBadge.addText("⚽");
    icon.font = this.font(10);
    titleBadge.addSpacer(3);

    this.text(titleBadge, "中超", 12, { weight: "bold", color: new Color("#34C759") });
    header.addSpacer(6);

    if (round) {
      const rBadge = header.addStack();
      rBadge.setPadding(2, 6, 2, 6);
      rBadge.cornerRadius = 5;
      rBadge.backgroundColor = Color.dynamic(
        new Color("#000000", 0.05),
        new Color("#FFFFFF", 0.08)
      );

      this.text(rBadge, `第 ${round} 轮`, 10, { weight: "bold", opacity: 0.85 });
      header.addSpacer(6);
    }

    this.text(header, safeString(dateString) + " " + getWeekday(dateString), 11, {
      opacity: 0.55,
      weight: "medium"
    });

    header.addSpacer();

    const favTeam = this.favoriteTeam;
    if (favTeam) {
      const favData = standingsMap && (standingsMap[favTeam] || standingsMap[favTeam.replace(/队$/, "")]);
      const favBadge = header.addStack();
      favBadge.layoutHorizontally();
      favBadge.centerAlignContent();
      favBadge.setPadding(2, 6, 2, 6);
      favBadge.cornerRadius = 6;
      favBadge.backgroundColor = Color.dynamic(
        new Color("#000000", 0.05),
        new Color("#FFFFFF", 0.08)
      );
      favBadge.borderWidth = 0.5;
      favBadge.borderColor = Color.dynamic(
        new Color("#000000", 0.06),
        new Color("#FFFFFF", 0.1)
      );

      const favLogoBox = favBadge.addStack();
      favLogoBox.size = new Size(13, 13);
      favLogoBox.centerAlignContent();
      await this.logo(favLogoBox, getTeamLogoURL(favTeam) || safeString(favData && favData.logo), 13, favTeam);

      favBadge.addSpacer(3);

      const shortName = favTeam.replace(/队$/, "");
      this.text(favBadge, shortName, 10, { weight: "bold" });

      if (favData && favData.rank && favData.rank !== "-") {
        favBadge.addSpacer(3);
        this.text(favBadge, "#" + safeString(favData.rank), 9, {
          weight: "bold",
          color: new Color("#34C759")
        });
      }
    } else {
      const currentR = round || (standingsMap && standingsMap["成都蓉城"] ? standingsMap["成都蓉城"].played : 24);
      const progressBadge = header.addStack();
      progressBadge.setPadding(2, 6, 2, 6);
      progressBadge.cornerRadius = 6;
      progressBadge.backgroundColor = Color.dynamic(
        new Color("#000000", 0.05),
        new Color("#FFFFFF", 0.08)
      );
      progressBadge.borderWidth = 0.5;
      progressBadge.borderColor = Color.dynamic(
        new Color("#000000", 0.06),
        new Color("#FFFFFF", 0.1)
      );
      this.text(progressBadge, `第 ${currentR} 轮 / 共 30 轮`, 9.5, {
        weight: "medium",
        opacity: 0.75
      });
    }
  }

  /* ==========================================================
   * 置顶主队预告胶囊
   * ========================================================== */
  async drawTopFavoriteBanner(widget, nextMatch, standingsMap) {
    const fav = this.favoriteTeam;
    if (!fav) return;

    const banner = this.glass(widget, 5.5, 11);
    banner.layoutHorizontally();
    banner.centerAlignContent();

    if (nextMatch) {
      const isHome = normalizeTeamName(nextMatch.home) === fav;
      const mDateParts = nextMatch.matchDate.split("-");
      const shortDate = `${parseInt(mDateParts[1])}/${parseInt(mDateParts[2])}`;

      const leftPart = banner.addStack();
      leftPart.layoutHorizontally();
      leftPart.centerAlignContent();

      const icon = leftPart.addText("🗓️");
      icon.font = this.font(10);
      leftPart.addSpacer(4);

      this.text(leftPart, "主队下场预告", 10, { weight: "bold" });
      leftPart.addSpacer(4);

      const cdBadge = leftPart.addStack();
      cdBadge.setPadding(1, 4, 1, 4);
      cdBadge.cornerRadius = 3;
      cdBadge.backgroundColor = Color.dynamic(
        new Color("#34C759", 0.12),
        new Color("#34C759", 0.2)
      );
      this.text(cdBadge, `${nextMatch.offsetDays}天后`, 8, { weight: "bold", color: new Color("#34C759") });

      banner.addSpacer();

      const rightPart = banner.addStack();
      rightPart.layoutHorizontally();
      rightPart.centerAlignContent();

      const hLogo = rightPart.addStack();
      hLogo.size = new Size(14, 14);
      await this.logo(hLogo, getTeamLogoURL(nextMatch.home), 14, nextMatch.home);
      rightPart.addSpacer(3);
      this.text(rightPart, nextMatch.home.replace(/队$/, ""), 10, { weight: isHome ? "bold" : "regular" });

      rightPart.addSpacer(3);
      this.text(rightPart, "VS", 8, { weight: "bold", opacity: 0.35 });
      rightPart.addSpacer(3);

      this.text(rightPart, nextMatch.away.replace(/队$/, ""), 10, { weight: !isHome ? "bold" : "regular" });
      rightPart.addSpacer(3);
      const aLogo = rightPart.addStack();
      aLogo.size = new Size(14, 14);
      await this.logo(aLogo, getTeamLogoURL(nextMatch.away), 14, nextMatch.away);

      rightPart.addSpacer(5);
      this.text(rightPart, `· ${shortDate}`, 9, { opacity: 0.45 });

    } else if (standingsMap && standingsMap[fav]) {
      const data = standingsMap[fav];
      const icon = banner.addText("🛡️");
      icon.font = this.font(10);
      banner.addSpacer(4);
      this.text(banner, `${fav} 近期暂无中超赛程`, 10, { weight: "bold", opacity: 0.75 });
      banner.addSpacer();
      this.text(banner, `当前积分 ${data.points}分 · #${data.rank}`, 9, { opacity: 0.45 });
    }
  }

  /* ==========================================================
   * 比赛卡片 (全面撑开，垂直内边距自适应)
   * ========================================================== */
  async drawCleanMatchCard(widget, match, isFavorite, verticalPadding = 6) {
    const card = this.glass(widget, 0, 12);
    card.setPadding(verticalPadding, 10, verticalPadding, 10);
    card.layoutHorizontally();
    card.centerAlignContent();

    if (isFavorite) {
      card.borderWidth = 1.2;
      card.borderColor = new Color("#34C759", 0.8);
      card.backgroundColor = Color.dynamic(
        new Color("#34C759", 0.10),
        new Color("#34C759", 0.16)
      );
    }

    const homeName = normalizeTeamName(match.home).replace(/队$/, "");
    const awayName = normalizeTeamName(match.away).replace(/队$/, "");

    // 1. 开球时间 / 状态
    const timeBox = card.addStack();
    timeBox.size = new Size(40, 18);
    timeBox.centerAlignContent();
    timeBox.cornerRadius = 4;
    timeBox.backgroundColor = Color.dynamic(
      new Color("#000000", 0.05),
      new Color("#FFFFFF", 0.07)
    );

    if (match.score) {
      const finText = this.text(timeBox, "完赛", 9, { opacity: 0.55, weight: "medium" });
      finText.centerAlignText();
    } else {
      const tmText = this.text(timeBox, safeString(match.time) || "待定", 9, {
        weight: "bold",
        color: new Color("#34C759")
      });
      tmText.centerAlignText();
    }

    card.addSpacer(8);

    // 2. 主队名
    const homeNameBox = card.addStack();
    homeNameBox.size = new Size(76, 18);
    homeNameBox.centerAlignContent();
    const hText = this.text(homeNameBox, homeName, 11, {
      weight: homeName === this.favoriteTeam ? "bold" : "regular",
      lineLimit: 1,
      minimumScaleFactor: 0.65
    });
    hText.leftAlignText();

    // 3. 主队队标
    const hLogo = card.addStack();
    hLogo.size = new Size(18, 18);
    hLogo.centerAlignContent();
    await this.logo(hLogo, getTeamLogoURL(homeName), 18, homeName);

    card.addSpacer(8);

    // 4. 正中央 VS / 比分
    const vsBox = card.addStack();
    vsBox.size = new Size(32, 18);
    vsBox.centerAlignContent();

    if (match.score) {
      const scoreText = this.text(
        vsBox,
        `${match.score.home}-${match.score.away}`,
        11,
        { weight: "bold", color: new Color("#FF3B30"), lineLimit: 1 }
      );
      scoreText.centerAlignText();
    } else {
      const vsText = this.text(vsBox, "VS", 10, {
        weight: "bold",
        opacity: 0.3,
        lineLimit: 1
      });
      vsText.centerAlignText();
    }

    card.addSpacer(8);

    // 5. 客队队标
    const aLogo = card.addStack();
    aLogo.size = new Size(18, 18);
    aLogo.centerAlignContent();
    await this.logo(aLogo, getTeamLogoURL(awayName), 18, awayName);

    card.addSpacer(8);

    // 6. 客队名
    const awayNameBox = card.addStack();
    awayNameBox.size = new Size(76, 18);
    awayNameBox.centerAlignContent();
    const aText = this.text(awayNameBox, awayName, 11, {
      weight: awayName === this.favoriteTeam ? "bold" : "regular",
      lineLimit: 1,
      minimumScaleFactor: 0.65
    });
    aText.leftAlignText();

    card.addSpacer();
  }

  /* ==========================================================
   * 焦点战深度指标对决看板
   * ========================================================== */
  async drawSingleMatchDashboard(widget, match, standingsMap, innerPad = 10, rowGap = 5.0) {
    const titleRow = widget.addStack();
    titleRow.layoutHorizontally();
    titleRow.centerAlignContent();
    const isFavMatch = this.isFavoriteMatch(match);
    this.text(titleRow, isFavMatch ? "主队对战深度解析" : "焦点交锋对战深度解析", 12, { weight: "bold" });
    titleRow.addSpacer();
    this.text(titleRow, isFavMatch ? "本轮焦点战" : "赛前多维数据", 10, { opacity: 0.35, weight: "medium" });

    widget.addSpacer(4);

    const panel = this.glass(widget, innerPad, 14);
    panel.layoutVertically();

    const homeName = normalizeTeamName(match.home);
    const awayName = normalizeTeamName(match.away);

    const h = standingsMap[homeName] || standingsMap[homeName.replace(/队$/, "")] || {
      rank: "-", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0
    };
    const a = standingsMap[awayName] || standingsMap[awayName.replace(/队$/, "")] || {
      rank: "-", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0
    };

    // 1. 顶层双方身份条 (镜像对齐，双重兜底队标与锁死单行比分)
    const heroBar = panel.addStack();
    heroBar.layoutHorizontally();
    heroBar.centerAlignContent();

    // 主队卡槽
    const hCap = heroBar.addStack();
    hCap.layoutHorizontally();
    hCap.centerAlignContent();

    const hLogo = hCap.addStack();
    hLogo.size = new Size(18, 18);
    const hLogoURL = getTeamLogoURL(homeName) || safeString(h.logo) || safeString(match.homeLogo);
    await this.logo(hLogo, hLogoURL, 18, homeName);
    hCap.addSpacer(4);

    this.text(hCap, homeName.replace(/队$/, ""), 11.5, {
      weight: "bold",
      lineLimit: 1,
      minimumScaleFactor: 0.7
    });
    hCap.addSpacer(3);

    const hBadge = hCap.addStack();
    hBadge.setPadding(1, 3.5, 1, 3.5);
    hBadge.cornerRadius = 3;
    hBadge.backgroundColor = Color.dynamic(
      new Color("#34C759", 0.12),
      new Color("#34C759", 0.2)
    );
    this.text(hBadge, `#${h.rank}`, 8, { weight: "bold", color: new Color("#34C759") });

    heroBar.addSpacer();

    // 中间比分 (单行锁定，杜绝折行)
    const midBox = heroBar.addStack();
    midBox.layoutHorizontally();
    midBox.centerAlignContent();
    this.text(midBox, `${h.points}分 VS ${a.points}分`, 10, {
      weight: "bold",
      opacity: 0.75,
      lineLimit: 1
    });

    heroBar.addSpacer();

    // 客队卡槽
    const aCap = heroBar.addStack();
    aCap.layoutHorizontally();
    aCap.centerAlignContent();

    const aBadge = aCap.addStack();
    aBadge.setPadding(1, 3.5, 1, 3.5);
    aBadge.cornerRadius = 3;
    aBadge.backgroundColor = Color.dynamic(
      new Color("#34C759", 0.12),
      new Color("#34C759", 0.2)
    );
    this.text(aBadge, `#${a.rank}`, 8, { weight: "bold", color: new Color("#34C759") });
    aCap.addSpacer(3);

    this.text(aCap, awayName.replace(/队$/, ""), 11.5, {
      weight: "bold",
      lineLimit: 1,
      minimumScaleFactor: 0.7
    });
    aCap.addSpacer(4);

    const aLogo = aCap.addStack();
    aLogo.size = new Size(18, 18);
    const aLogoURL = getTeamLogoURL(awayName) || safeString(a.logo) || safeString(match.awayLogo);
    await this.logo(aLogo, aLogoURL, 18, awayName);

    panel.addSpacer(rowGap + 2);

    // 2. 指标对比行
    const drawRow = (label, hVal, aVal) => {
      const r = panel.addStack();
      r.layoutHorizontally();
      r.centerAlignContent();

      const l = this.text(r, safeString(hVal), 11, { weight: "medium" });
      l.size = new Size(76, 17);
      l.leftAlignText();

      r.addSpacer();
      const m = this.text(r, label, 9, { opacity: 0.45 });
      m.centerAlignText();
      r.addSpacer();

      const rt = this.text(r, safeString(aVal), 11, { weight: "medium" });
      rt.size = new Size(76, 17);
      rt.rightAlignText();
    };

    drawRow("已赛场次", `${h.played} 场`, `${a.played} 场`);
    panel.addSpacer(rowGap);
    drawRow("胜 / 平 / 负", `${h.wins}胜 ${h.draws}平 ${h.losses}负`, `${a.wins}胜 ${a.draws}平 ${a.losses}负`);
    panel.addSpacer(rowGap);

    const hGD = h.goalsFor - h.goalsAgainst;
    const aGD = a.goalsFor - a.goalsAgainst;
    drawRow("进球 / 净胜", `${h.goalsFor} (${hGD > 0 ? "+" + hGD : hGD})`, `${a.goalsFor} (${aGD > 0 ? "+" + aGD : aGD})`);
    panel.addSpacer(rowGap);

    const hWinRate = h.played > 0 ? Math.round((h.wins / h.played) * 100) : 0;
    const aWinRate = a.played > 0 ? Math.round((a.wins / a.played) * 100) : 0;
    drawRow("赛季胜率", `${hWinRate}%`, `${aWinRate}%`);

    panel.addSpacer(rowGap + 2);

    // 3. 底部势能提示槽 (水平绝对居中)
    const footerContainer = panel.addStack();
    footerContainer.layoutHorizontally();
    footerContainer.centerAlignContent();
    footerContainer.addSpacer();

    const footerBar = footerContainer.addStack();
    footerBar.layoutHorizontally();
    footerBar.centerAlignContent();
    footerBar.setPadding(4.5, 12, 4.5, 12);
    footerBar.cornerRadius = 6;
    footerBar.backgroundColor = Color.dynamic(
      new Color("#000000", 0.03),
      new Color("#FFFFFF", 0.04)
    );

    const diff = Math.abs(h.points - a.points);
    const leader = h.points >= a.points ? homeName.replace(/队$/, "") : awayName.replace(/队$/, "");
    const diffDesc = diff === 0 ? "两队积分持平 势均力敌" : `${leader} 积分领先优势 ${diff} 分`;

    const tip = this.text(footerBar, `⚡ ${diffDesc}`, 9, { opacity: 0.65, weight: "medium", lineLimit: 1 });
    tip.centerAlignText();

    footerContainer.addSpacer();
  }

  /* ==========================================================
   * 无比赛日：今日暂无比赛面板
   * ========================================================== */
  async drawNoMatch(widget, nextMatch, standingsMap) {
    widget.addSpacer(6);

    const box = this.glass(widget, 8, 14);
    box.layoutHorizontally();
    box.centerAlignContent();

    const fav = this.favoriteTeam;

    const leftBox = box.addStack();
    leftBox.layoutHorizontally();
    leftBox.centerAlignContent();

    const icon = leftBox.addText("☕");
    icon.font = this.font(16);
    leftBox.addSpacer(6);

    const leftTextStack = leftBox.addStack();
    leftTextStack.layoutVertically();

    this.text(leftTextStack, "今日暂无比赛", 11, { weight: "bold" });
    leftTextStack.addSpacer(2);

    if (fav && nextMatch) {
      const cdBadge = leftTextStack.addStack();
      cdBadge.setPadding(1.5, 4.5, 1.5, 4.5);
      cdBadge.cornerRadius = 4;
      cdBadge.backgroundColor = Color.dynamic(
        new Color("#34C759", 0.12),
        new Color("#34C759", 0.2)
      );
      
      this.text(cdBadge, `${nextMatch.offsetDays}天后比赛`, 9, {
        weight: "bold",
        color: new Color("#34C759"),
        minimumScaleFactor: 0.7
      });
    } else {
      this.text(leftTextStack, "当前联赛排位如下", 9, { opacity: 0.45 });
    }

    box.addSpacer();

    if (fav && nextMatch) {
      const isHome = normalizeTeamName(nextMatch.home) === fav;
      const mDateParts = nextMatch.matchDate.split("-");
      const shortDate = `${parseInt(mDateParts[1])}/${parseInt(mDateParts[2])}`;

      const rightBox = box.addStack();
      rightBox.layoutHorizontally();
      rightBox.centerAlignContent();

      const homeLogoBox = rightBox.addStack();
      homeLogoBox.size = new Size(16, 16);
      homeLogoBox.centerAlignContent();
      await this.logo(homeLogoBox, getTeamLogoURL(nextMatch.home), 16, nextMatch.home);
      rightBox.addSpacer(3);

      this.text(rightBox, nextMatch.home.replace(/队$/, ""), 10, {
        weight: isHome ? "bold" : "regular",
        opacity: isHome ? 1.0 : 0.7
      });

      rightBox.addSpacer(3);
      this.text(rightBox, "VS", 8, { weight: "bold", opacity: 0.35 });
      rightBox.addSpacer(3);

      this.text(rightBox, nextMatch.away.replace(/队$/, ""), 10, {
        weight: !isHome ? "bold" : "regular",
        opacity: !isHome ? 1.0 : 0.7
      });
      rightBox.addSpacer(3);

      const awayLogoBox = rightBox.addStack();
      awayLogoBox.size = new Size(16, 16);
      awayLogoBox.centerAlignContent();
      await this.logo(awayLogoBox, getTeamLogoURL(nextMatch.away), 16, nextMatch.away);

      rightBox.addSpacer(5);

      const timeBadge = rightBox.addStack();
      timeBadge.setPadding(2, 5, 2, 5);
      timeBadge.cornerRadius = 4;
      timeBadge.backgroundColor = Color.dynamic(
        new Color("#000000", 0.05),
        new Color("#FFFFFF", 0.08)
      );
      this.text(timeBadge, `${shortDate} ${nextMatch.time || "待定"}`, 8, {
        opacity: 0.6,
        weight: "medium"
      });

    } else if (fav && standingsMap && standingsMap[fav]) {
      const data = standingsMap[fav];
      const statBadge = box.addStack();
      statBadge.layoutHorizontally();
      statBadge.centerAlignContent();
      statBadge.setPadding(3, 8, 3, 8);
      statBadge.cornerRadius = 6;
      statBadge.backgroundColor = Color.dynamic(
        new Color("#000000", 0.04),
        new Color("#FFFFFF", 0.06)
      );

      this.text(statBadge, `已赛 ${data.played} 轮`, 10, { opacity: 0.6 });
      statBadge.addSpacer(6);
      this.text(statBadge, `${data.points} 分`, 11, { weight: "bold", color: new Color("#34C759") });
    }
  }

  /* ==========================================================
   * 16 强全景积分榜
   * ========================================================== */
  async drawStandingItem(parent, item) {
    const row = parent.addStack();
    row.layoutHorizontally();
    row.centerAlignContent();

    const r = Number(item.rank);

    const indicator = row.addStack();
    indicator.size = new Size(2.5, 12);
    indicator.cornerRadius = 1.25;

    let numColor;
    if (r === 1) {
      indicator.backgroundColor = new Color("#F59E0B");
      numColor = new Color("#D97706");
    } else if (r === 2 || r === 3) {
      indicator.backgroundColor = new Color("#0EA5E9");
      numColor = new Color("#0284C7");
    } else if (r === 15 || r === 16) {
      indicator.backgroundColor = new Color("#EF4444");
      numColor = new Color("#DC2626");
    } else {
      indicator.backgroundColor = Color.dynamic(
        new Color("#000000", 0.08),
        new Color("#FFFFFF", 0.12)
      );
      numColor = Color.dynamic(
        new Color("#17201A", 0.45),
        new Color("#FFFFFF", 0.45)
      );
    }

    row.addSpacer(4);

    const rankBox = row.addStack();
    rankBox.size = new Size(16, 20);
    rankBox.centerAlignContent();
    const rankText = this.text(rankBox, safeString(r), 10, {
      weight: (r <= 3 || r >= 15) ? "bold" : "medium",
      color: numColor
    });
    rankText.centerAlignText();

    row.addSpacer(4);

    const logoBox = row.addStack();
    logoBox.size = new Size(17, 17);
    logoBox.centerAlignContent();
    await this.logo(
      logoBox,
      getTeamLogoURL(item.team) || safeString(item.logo),
      17,
      item.team
    );

    row.addSpacer(5);

    const teamText = this.text(row, safeString(item.team).replace(/队$/, ""), 10, {
      weight: r <= 3 ? "bold" : "regular",
      color: r >= 15 ? Color.dynamic(new Color("#17201A", 0.7), new Color("#FFFFFF", 0.7)) : null,
      lineLimit: 1
    });

    row.addSpacer();

    const points = this.text(row, safeString(item.points), 11, {
      weight: "bold",
      color: r === 1 ? new Color("#D97706") : (r >= 15 ? new Color("#DC2626") : null)
    });
    points.rightAlignText();

    return row;
  }

  async drawFullStandings(widget, standings) {
    if (!standings || standings.length === 0) return;

    widget.addSpacer(6);

    const title = widget.addStack();
    title.layoutHorizontally();
    title.centerAlignContent();

    this.text(title, "联赛积分榜", 12, { weight: "bold" });
    title.addSpacer();
    this.text(title, "1 - 16", 10, { opacity: 0.35, weight: "medium" });

    widget.addSpacer(4);

    const box = this.glass(widget, 9, 15);
    box.layoutHorizontally();

    const left = box.addStack();
    left.layoutVertically();

    const leftItems = standings.slice(0, 8);
    for (let i = 0; i < leftItems.length; i++) {
      await this.drawStandingItem(left, leftItems[i]);
      if (i < leftItems.length - 1) left.addSpacer(4.5);
    }

    box.addSpacer(10);

    const divider = box.addStack();
    divider.size = new Size(1, 195);
    divider.backgroundColor = Color.dynamic(
      new Color("#000000", 0.05),
      new Color("#FFFFFF", 0.08)
    );

    box.addSpacer(10);

    const right = box.addStack();
    right.layoutVertically();

    const rightItems = standings.slice(8, 16);
    for (let i = 0; i < rightItems.length; i++) {
      await this.drawStandingItem(right, rightItems[i]);
      if (i < rightItems.length - 1) right.addSpacer(4.5);
    }
  }

  /* ==========================================================
   * 核心调度主函数
   * ========================================================== */
  async renderLarge() {
    const widget = new ListWidget();
    widget.setPadding(13, 14, 13, 14);
    this.setupBackground(widget);

    const date = safeString(this.widgetDate);
    const favTeam = this.favoriteTeam;

    const [dailyHTML, rankHTML, nextMatch] = await Promise.all([
      fetchString(SINA_HOME + date, 6),
      fetchString(SINA_RANK, 6),
      findNextMatch(favTeam, date)
    ]);

    collectLogoMap(rankHTML, GLOBAL_LOGOS);
    collectLogoMap(dailyHTML, GLOBAL_LOGOS);

    for (const team of TEAMS) {
      if (TEAM_LOGOS[team]) {
        GLOBAL_LOGOS[team] = safeString(TEAM_LOGOS[team]);
      }
    }

    const matches = parseDailyMatches(dailyHTML);
    let standings = parseStandings(rankHTML, GLOBAL_LOGOS);

    if (!standings || standings.length < 10) {
      standings = getCachedStandings();
    } else {
      saveCachedStandings(standings);
    }

    const standingsMap = {};
    for (const item of standings) {
      const norm = normalizeTeamName(item.team);
      standingsMap[norm] = item;
      standingsMap[norm.replace(/队$/, "")] = item;
      item.logo = getTeamLogoURL(item.team) || safeString(item.logo) || "";
    }

    for (const match of matches) {
      match.homeLogo = getTeamLogoURL(match.home) || safeString(match.homeLogo) || "";
      match.awayLogo = getTeamLogoURL(match.away) || safeString(match.awayLogo) || "";
    }

    await preloadLogoImages(standings, matches);

    let round = "";
    if (matches.length > 0 && matches[0].round) {
      round = matches[0].round;
    } else {
      const roundMatch = safeString(dailyHTML).match(/(?:中超\s*)?第\s*(\d{1,2})\s*轮/);
      if (roundMatch) {
        round = parseInt(roundMatch[1], 10);
      }
    }

    await this.drawHeader(widget, round, date, standingsMap);

    if (matches.length > 0) {
      const hasFavMatchToday = favTeam && matches.some(m =>
        normalizeTeamName(m.home) === favTeam ||
        normalizeTeamName(m.away) === favTeam
      );

      const totalMatches = matches.length;

      const sortedMatches = [...matches];
      if (hasFavMatchToday) {
        sortedMatches.sort((a, b) => {
          const aIsFav = normalizeTeamName(a.home) === favTeam || normalizeTeamName(a.away) === favTeam;
          const bIsFav = normalizeTeamName(b.home) === favTeam || normalizeTeamName(b.away) === favTeam;
          return (bIsFav ? 1 : 0) - (aIsFav ? 1 : 0);
        });
      }

      /* ----------------------------------------------------
       * 分流 A: 超级比赛日 ( > 4 场比赛 )
       * ---------------------------------------------------- */
      if (totalMatches > 4) {
        widget.addSpacer(6);

        const titleRow = widget.addStack();
        titleRow.layoutHorizontally();
        titleRow.centerAlignContent();
        this.text(titleRow, "今日全量赛程", 12, { weight: "bold" });
        titleRow.addSpacer();
        this.text(titleRow, `共 ${totalMatches} 场较量`, 10, { opacity: 0.35, weight: "medium" });

        widget.addSpacer(6);

        const displayCount = Math.min(totalMatches, 8);
        const cardPad = displayCount === 5 ? 8.5 : (displayCount === 6 ? 6.5 : 4.5);
        const cardGap = displayCount === 5 ? 10.0 : (displayCount === 6 ? 6.5 : 3.5);

        for (let i = 0; i < displayCount; i++) {
          await this.drawCleanMatchCard(widget, sortedMatches[i], this.isFavoriteMatch(sortedMatches[i]), cardPad);
          if (i < displayCount - 1) widget.addSpacer(cardGap);
        }
      }

      /* ----------------------------------------------------
       * 分流 B: 1 ~ 4 场常规比赛日 (卡片 + 深度看板)
       * ---------------------------------------------------- */
      else {
        let topGap = 6;
        let cardGap = 6;
        let middleGap = 8;
        let cardPad = 6;
        let boardPad = 9;
        let boardRowGap = 4.5;

        if (totalMatches === 1) {
          topGap = 12;
          cardGap = 0;
          middleGap = 14;
          cardPad = 10;
          boardPad = 13;
          boardRowGap = 6.5;
        } else if (totalMatches === 2) {
          topGap = 10;
          cardGap = 10;
          middleGap = 12;
          cardPad = 8;
          boardPad = 11;
          boardRowGap = 5.5;
        } else if (totalMatches === 3) {
          topGap = 6;
          cardGap = 6;
          middleGap = 8;
          cardPad = 6;
          boardPad = 9;
          boardRowGap = 4.2;
        } else if (totalMatches === 4) {
          topGap = 4;
          cardGap = 3.5;
          middleGap = 5;
          cardPad = 4.5;
          boardPad = 7.5;
          boardRowGap = 3.0;
        }

        if (!hasFavMatchToday) {
          widget.addSpacer(4);
          await this.drawTopFavoriteBanner(widget, nextMatch, standingsMap);
          widget.addSpacer(topGap);
        } else {
          widget.addSpacer(topGap + 2);
        }

        for (let i = 0; i < totalMatches; i++) {
          await this.drawCleanMatchCard(widget, sortedMatches[i], this.isFavoriteMatch(sortedMatches[i]), cardPad);
          if (i < totalMatches - 1) {
            widget.addSpacer(cardGap);
          }
        }

        widget.addSpacer(middleGap);

        let focusMatch = null;
        if (hasFavMatchToday) {
          focusMatch = sortedMatches.find(m =>
            normalizeTeamName(m.home) === favTeam ||
            normalizeTeamName(m.away) === favTeam
          );
        } else {
          const nowMinutes = new Date().getMinutes();
          const randIndex = (Math.floor(nowMinutes / 5) + Math.floor(Math.random() * totalMatches)) % totalMatches;
          focusMatch = sortedMatches[randIndex];
        }

        if (!focusMatch) focusMatch = sortedMatches[0];

        await this.drawSingleMatchDashboard(widget, focusMatch, standingsMap, boardPad, boardRowGap);
      }

    } else {
      // 无比赛日：全景积分榜模式
      await this.drawNoMatch(widget, nextMatch, standingsMap);
      await this.drawFullStandings(widget, standings);
    }

    return widget;
  }

  async render() {
    return await this.renderLarge();
  }
}


/* ============================================================
 * 启动与异常保护
 * ============================================================ */

try {
  await Runing(CSLMonitor, "", true);
} catch (e) {
  console.error("CSL Monitor Launch Error: " + safeError(e));

  if (config.runsInWidget) {
    const errorWidget = new ListWidget();
    errorWidget.setPadding(16, 16, 16, 16);
    errorWidget.backgroundColor = Color.dynamic(new Color("#F2F5F3"), new Color("#0D110F"));

    const title = errorWidget.addText("⚽ 中超联赛");
    title.font = Font.boldSystemFont(14);
    title.textColor = Color.dynamic(new Color("#17201A"), Color.white());

    errorWidget.addSpacer(6);
    const msg = errorWidget.addText("桌面组件启动异常:\n" + safeError(e));
    msg.font = Font.systemFont(10);
    msg.textColor = new Color("#FF3B30");
    msg.lineLimit = 5;

    Script.setWidget(errorWidget);
    Script.complete();
  }
}
