// ==================== [Fuck茧房] 官方原版纯净满血版 (Web + iPhone + iPad) ====================

let mode = 'popular';
let upmasterName = '老番茄';

if (typeof $argument !== 'undefined') {
    let modeMatch = $argument.match(/mode=([a-z]+)/);
    if (modeMatch) mode = modeMatch[1];
    let upMatch = $argument.match(/upmaster_name=([^&]+)/);
    if (upMatch) upmasterName = decodeURIComponent(upMatch[1]).trim();
}

// 切换模式或更换UP主时，自动清空旧缓存池，下拉刷新立即生效
let lastConfig = $persistentStore.read('fj_last_config') || '';
let currentConfig = `${mode}_${upmasterName}`;
let videoPool = [];

if (lastConfig !== currentConfig) {
    $persistentStore.write(currentConfig, 'fj_last_config');
    $persistentStore.write('[]', 'fj_video_pool');
} else {
    videoPool = JSON.parse($persistentStore.read('fj_video_pool') || '[]');
}

let shownBvidsCache = JSON.parse($persistentStore.read('fj_shown_bvids') || '[]');
let shownBvids = new Set(shownBvidsCache);
let backupPool = JSON.parse($persistentStore.read('fj_backup_pool') || '[]');

const REGION_TIDS = [1, 3, 129, 4, 36, 188, 234, 223, 160, 211, 217, 155, 5, 181];
const MODE_LABELS = {
    popular: "打破茧房",
    fresh: "新号探索",
    weekly: "每周必看",
    crossregion: "跨区漫游",
    niche: "冷门佳作",
    upmaster: `探索:${upmasterName}`
};

function fetchSurge(url) {
    return new Promise((resolve) => {
        $httpClient.get({
            url: url,
            timeout: 3,
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
                "Referer": "https://www.bilibili.com/",
                "Cookie": "buvid3=894A253C-59F2-4B7E-9A1D-2B98D4E1123416789infoc;"
            }
        }, (error, response, data) => {
            if (!error && data) {
                try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
            } else {
                resolve(null);
            }
        });
    });
}

function pushToPool(list) {
    let poolBvids = new Set(videoPool.map(v => v.bvid));
    list.forEach(v => {
        let bvid = v.bvid;
        let aid = v.aid || v.id;
        if (bvid && aid && !shownBvids.has(bvid) && !poolBvids.has(bvid)) {
            videoPool.push({
                bvid: bvid,
                aid: aid,
                cid: v.cid || 0,
                title: (v.title || '').replace(/<[^>]+>/g, ''),
                pic: (v.pic || v.cover || '').replace(/^http:\/\//, 'https://').replace(/^\/\//, 'https://'),
                owner: { name: v.owner?.name || v.author || '', mid: v.owner?.mid || v.mid || 0 },
                stat: { view: v.stat?.view || v.play || 0, danmaku: v.stat?.danmaku || v.video_review || 0 },
                duration: typeof v.duration === 'number' ? v.duration : 180,
                pubdate: v.pubdate || v.created || 0
            });
            poolBvids.add(bvid);
        }
    });
}

async function fillPopular() {
    let startPage = Math.floor(Math.random() * 8) + 1;
    let urls = [0, 1, 2, 3].map(i => `https://api.bilibili.com/x/web-interface/popular?ps=20&pn=${startPage + i}`);
    let results = await Promise.all(urls.map(url => fetchSurge(url)));
    results.forEach(res => { if (res?.code === 0 && res.data?.list) pushToPool(res.data.list); });
}

async function fillFresh() {
    let baseIdx = Math.floor(Math.random() * 8) + 1;
    let urls = [0, 1, 2, 3].map(i => `https://api.bilibili.com/x/web-interface/index/top/feed/rcmd?ps=20&fresh_idx=${baseIdx + i}&fresh_type=4`);
    let results = await Promise.all(urls.map(url => fetchSurge(url)));
    results.forEach(res => {
        if (res?.code === 0 && res.data?.item) {
            pushToPool(res.data.item.filter(item => item.goto === 'av'));
        }
    });
}

async function fillWeekly() {
    let listRes = await fetchSurge('https://api.bilibili.com/x/web-interface/popular/series/list');
    let numbers = listRes?.data?.list?.map(item => item.number) || [250, 251, 252, 253, 254];
    let picked = numbers.sort(() => Math.random() - 0.5).slice(0, 3);
    let results = await Promise.all(picked.map(n => fetchSurge(`https://api.bilibili.com/x/web-interface/popular/series/one?number=${n}`)));
    results.forEach(res => { if (res?.code === 0 && res.data?.list) pushToPool(res.data.list); });
}

async function fillCrossRegion() {
    let picked = [...REGION_TIDS].sort(() => Math.random() - 0.5).slice(0, 4);
    let results = await Promise.all(picked.map(tid => fetchSurge(`https://api.bilibili.com/x/web-interface/dynamic/region?ps=15&rid=${tid}`)));
    results.forEach(res => { if (res?.code === 0 && res.data?.archives) pushToPool(res.data.archives); });
}

async function fillNiche() {
    let picked = [...REGION_TIDS].sort(() => Math.random() - 0.5).slice(0, 4);
    let results = await Promise.all(picked.map(tid => fetchSurge(`https://api.bilibili.com/x/web-interface/ranking/v2?rid=${tid}&type=all`)));
    results.forEach(res => {
        if (res?.code === 0 && res.data?.list) {
            pushToPool(res.data.list.slice(20, 60).sort(() => Math.random() - 0.5).slice(0, 15));
        }
    });
}

async function fillUpmaster() {
    let res = await fetchSurge(`https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=${encodeURIComponent(upmasterName)}&page=1`);
    if (res?.code === 0 && Array.isArray(res.data?.result)) pushToPool(res.data.result);
    else await fillPopular();
}

async function fillPool() {
    let beforeCount = videoPool.length;

    if (mode === 'fresh') await fillFresh();
    else if (mode === 'weekly') await fillWeekly();
    else if (mode === 'crossregion') await fillCrossRegion();
    else if (mode === 'niche') await fillNiche();
    else if (mode === 'upmaster') await fillUpmaster();
    else await fillPopular();

    videoPool.sort(() => Math.random() - 0.5);

    if (videoPool.length <= beforeCount && videoPool.length < 20) {
        shownBvids.clear();
        if (backupPool.length > 0) {
            videoPool.push(...[...backupPool].sort(() => Math.random() - 0.5));
        }
    } else if (videoPool.length > beforeCount) {
        let uniqueBackup = [];
        let tempSet = new Set();
        for (let v of [...videoPool, ...backupPool]) {
            if (!tempSet.has(v.bvid)) {
                tempSet.add(v.bvid);
                uniqueBackup.push(v);
            }
        }
        backupPool = uniqueBackup.slice(0, 150);
        $persistentStore.write(JSON.stringify(backupPool), 'fj_backup_pool');
    }
}

function buildFeedItem(video) {
    let label = MODE_LABELS[mode] || "打破茧房";
    return {
        id: video.aid, bvid: video.bvid, cid: video.cid, goto: 'av',
        uri: 'https://www.bilibili.com/video/' + video.bvid,
        pic: video.pic || video.cover, pic_4_3: video.pic || video.cover, title: video.title,
        duration: video.duration, pubdate: video.pubdate,
        owner: video.owner, stat: video.stat,
        rcmd_reason: { reason_type: 1, content: label },
        show_info: 1, pos: 0, is_stock: 0, enable_vt: 0
    };
}

function buildAppFeedItem(video, isPad) {
    let upName = video.owner?.name || video.up || "打破茧房";
    let viewCount = video.stat?.view || video.view || 0;
    if (viewCount > 10000) viewCount = (viewCount / 10000).toFixed(1) + "万";
    let danmakuCount = String(video.stat?.danmaku || video.danmaku || 0);
    let label = MODE_LABELS[mode] || "打破茧房";

    let appCard = {
        card_type: "small_cover_v2",
        card_goto: "av", goto: "av", title: video.title,
        cover: video.pic || video.cover,
        uri: `bilibili://video/${video.aid}?bvid=${video.bvid}&cid=${video.cid}`,
        param: String(video.aid),
        args: { up_id: video.owner?.mid || 0, up_name: upName, rid: video.aid, aid: video.aid },
        desc_button: { text: upName, type: 1 },
        cover_left_text_1: String(viewCount),
        cover_left_text_2: danmakuCount,
        cover_left_icon_1: 1, cover_left_icon_2: 3,
        rcmd_reason: label,
        rcmd_reason_style: { text: label, text_color: "#FF6633", bg_color: "#FFF1ED", border_color: "#FFF1ED", bg_style: 1 },
        player_args: { aid: video.aid, cid: video.cid, duration: video.duration, type: "av" },
        three_point_v2: [{ title: "添加至稍后再看", type: "watch_later" }]
    };

    if (isPad) {
        appCard.cover_right_text = `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`;
        appCard.desc = upName;
    }
    return appCard;
}

async function main() {
    let body = $response.body;
    let reqUrl = $request.url;
    if (!body) return $done({});

    try {
        let obj = JSON.parse(body);
        let isApp = Array.isArray(obj?.data?.items);
        let isWeb = Array.isArray(obj?.data?.item);
        let targetList = isApp ? obj.data.items : (isWeb ? obj.data.item : null);
        let isPad = reqUrl.indexOf('device=pad') !== -1;

        if (obj?.code === 0 && targetList) {
            let needCount = targetList.filter(card => card.goto === 'av').length;
            if (videoPool.length < needCount + 30) {
                await fillPool();
            }

            for (let i = 0; i < targetList.length; i++) {
                if (targetList[i].goto === 'av' && videoPool.length > 0) {
                    let newVideo = videoPool.shift();
                    shownBvids.add(newVideo.bvid);
                    if (targetList[i].ad_info) delete targetList[i].ad_info;
                    targetList[i] = isApp ? buildAppFeedItem(newVideo, isPad) : buildFeedItem(newVideo);
                }
            }

            $persistentStore.write(JSON.stringify(videoPool), 'fj_video_pool');
            $persistentStore.write(JSON.stringify(Array.from(shownBvids).slice(-150)), 'fj_shown_bvids');
            body = JSON.stringify(obj);
        }
    } catch (e) {
        console.log("[Fuck茧房] 错误: " + e);
    }

    $done({ body });
}

main();
