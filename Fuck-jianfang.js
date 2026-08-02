// ==================== [Fuck茧房] 高并发防卡顿版 (Web + iPhone + iPad) ====================

let mode = 'popular';
if (typeof $argument !== 'undefined') {
    let match = $argument.match(/mode=([a-z]+)/);
    if (match) mode = match[1];
}

let videoPool = JSON.parse($persistentStore.read('fj_video_pool') || '[]');
let shownBvidsCache = JSON.parse($persistentStore.read('fj_shown_bvids') || '[]');
let shownBvids = new Set(shownBvidsCache);

// 封装 Surge 网络请求（增加 3 秒超时限制，防止卡死 App）
function fetchSurge(url) {
    return new Promise((resolve) => {
        $httpClient.get({
            url: url,
            timeout: 3, 
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15"
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

// 批量拉取热门（一次拉 3 页，确保池子深不见底）
async function fillPopular() {
    let startPage = Math.floor(Math.random() * 10) + 1;
    // 使用 Promise.all 并发请求 3 页数据（60个视频），速度跟请求 1 页一样快
    let urls = [0, 1, 2].map(i => `https://api.bilibili.com/x/web-interface/popular?ps=20&pn=${startPage + i}`);
    let results = await Promise.all(urls.map(url => fetchSurge(url)));
    
    let added = 0;
    results.forEach(res => {
        if (res && res.code === 0 && res.data && res.data.list) {
            res.data.list.forEach(v => {
                if (!shownBvids.has(v.bvid)) {
                    videoPool.push(v);
                    added++;
                }
            });
        }
    });

    if (added === 0) {
        shownBvids.clear(); // 全看过了就清空记忆
        console.log("[Fuck茧房] 去重记录已清空");
    }
}

// 批量拉取新号（一次拉 3 页）
async function fillFresh() {
    let baseIdx = Math.floor(Math.random() * 8) + 1; 
    let urls = [0, 1, 2].map(i => `https://api.bilibili.com/x/web-interface/index/top/feed/rcmd?ps=20&fresh_idx=${baseIdx + i}&fresh_type=4`);
    let results = await Promise.all(urls.map(url => fetchSurge(url)));
    
    let added = 0;
    results.forEach(res => {
        if (res && res.code === 0 && res.data && res.data.item) {
            res.data.item.forEach(item => {
                if (item.goto === 'av' && item.bvid && !shownBvids.has(item.bvid)) {
                    videoPool.push({
                        bvid: item.bvid, aid: item.id, cid: item.cid, title: item.title,
                        pic: (item.pic || '').replace('http://', 'https://'),
                        owner: { name: item.owner?.name || '', mid: item.owner?.mid || 0 },
                        stat: { view: item.stat?.view || 0, danmaku: item.stat?.danmaku || 0 },
                        duration: item.duration, pubdate: item.pubdate
                    });
                    added++;
                }
            });
        }
    });
    if (added === 0) shownBvids.clear();
}

async function fillPool() {
    if (mode === 'fresh') await fillFresh();
    else await fillPopular();
}

// 构造 Web 卡片
function buildFeedItem(video) {
    return {
        id: video.aid, bvid: video.bvid, cid: video.cid, goto: 'av',
        uri: 'https://www.bilibili.com/video/' + video.bvid,
        pic: video.pic || video.cover, pic_4_3: video.pic || video.cover, title: video.title,
        duration: video.duration, pubdate: video.pubdate,
        owner: video.owner, stat: video.stat,
        rcmd_reason: { reason_type: 1, content: "打破茧房" },
        show_info: 1, pos: 0, is_stock: 0, enable_vt: 0
    };
}

// 构造 App/iPad 卡片
function buildAppFeedItem(video, isPad) {
    let upName = video.owner?.name || video.up || "打破茧房";
    let viewCount = video.stat?.view || video.view || 0;
    if (viewCount > 10000) viewCount = (viewCount / 10000).toFixed(1) + "万";
    let danmakuCount = String(video.stat?.danmaku || video.danmaku || 0);

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
        rcmd_reason: mode === 'fresh' ? "新号模式" : "打破茧房",
        rcmd_reason_style: { text: mode === 'fresh' ? "新号模式" : "打破茧房", text_color: "#FF6633", bg_color: "#FFF1ED", border_color: "#FFF1ED", bg_style: 1 },
        player_args: { aid: video.aid, cid: video.cid, duration: video.duration, type: "av" },
        three_point_v2: [
            { title: "添加至稍后再看", type: "watch_later" }
        ]
    };

    if (isPad) {
        appCard.cover_right_text = `${Math.floor(video.duration/60)}:${(video.duration%60).toString().padStart(2, '0')}`;
        appCard.desc = upName;
    }
    return appCard;
}

// ================= 主拦截逻辑 =================
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
            
            // iPad 一次刷新的卡片很多，所以只要池子少于 30 个就立刻并发进货！
            if (videoPool.length < 30) {
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
            $persistentStore.write(JSON.stringify(Array.from(shownBvids).slice(-400)), 'fj_shown_bvids');

            body = JSON.stringify(obj);
        }
    } catch (e) {
        console.log("[Fuck茧房] 错误: " + e);
    }
    
    $done({ body });
}

main();
