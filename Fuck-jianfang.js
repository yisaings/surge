// ==================== [Fuck茧房] 防风控绝对无敌版 (Web + iPhone + iPad) ====================

let mode = 'popular';
if (typeof $argument !== 'undefined') {
    let match = $argument.match(/mode=([a-z]+)/);
    if (match) mode = match[1];
}

let videoPool = JSON.parse($persistentStore.read('fj_video_pool') || '[]');
let shownBvidsCache = JSON.parse($persistentStore.read('fj_shown_bvids') || '[]');
let shownBvids = new Set(shownBvidsCache);

// 🌟 新增：紧急备用粮仓（哪怕断网、被B站封杀，也能保证有视频可看）
let backupPool = JSON.parse($persistentStore.read('fj_backup_pool') || '[]');

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

async function fillPopular() {
    let startPage = Math.floor(Math.random() * 8) + 1;
    let urls = [0, 1, 2, 3].map(i => `https://api.bilibili.com/x/web-interface/popular?ps=20&pn=${startPage + i}`);
    let results = await Promise.all(urls.map(url => fetchSurge(url)));
    
    let poolBvids = new Set(videoPool.map(v => v.bvid));
    
    results.forEach(res => {
        if (res && res.code === 0 && res.data && res.data.list) {
            res.data.list.forEach(v => {
                if (!shownBvids.has(v.bvid) && !poolBvids.has(v.bvid)) {
                    videoPool.push(v);
                    poolBvids.add(v.bvid);
                }
            });
        }
    });
}

async function fillFresh() {
    let baseIdx = Math.floor(Math.random() * 8) + 1; 
    let urls = [0, 1, 2, 3].map(i => `https://api.bilibili.com/x/web-interface/index/top/feed/rcmd?ps=20&fresh_idx=${baseIdx + i}&fresh_type=4`);
    let results = await Promise.all(urls.map(url => fetchSurge(url)));
    
    let poolBvids = new Set(videoPool.map(v => v.bvid));
    
    results.forEach(res => {
        if (res && res.code === 0 && res.data && res.data.item) {
            res.data.item.forEach(item => {
                if (item.goto === 'av' && item.bvid && !shownBvids.has(item.bvid) && !poolBvids.has(item.bvid)) {
                    videoPool.push({
                        bvid: item.bvid, aid: item.id, cid: item.cid, title: item.title,
                        pic: (item.pic || '').replace('http://', 'https://'),
                        owner: { name: item.owner?.name || '', mid: item.owner?.mid || 0 },
                        stat: { view: item.stat?.view || 0, danmaku: item.stat?.danmaku || 0 },
                        duration: item.duration, pubdate: item.pubdate
                    });
                    poolBvids.add(item.bvid);
                }
            });
        }
    });
}

async function fillPool() {
    let beforeCount = videoPool.length;

    if (mode === 'fresh') await fillFresh();
    else await fillPopular();

    // 🌟 核心防断网/防风控逻辑：如果进货后发现池子一点没涨（B站拦截了请求或全部被去重）
    if (videoPool.length <= beforeCount && videoPool.length < 20) {
        console.log("[Fuck茧房] API 拉取失败或已见底，启用备用粮仓！");
        shownBvids.clear(); // 清空去重记忆
        if (backupPool.length > 0) {
            // 将备用粮仓的数据打乱顺序，装填进主池
            let shuffledBackup = [...backupPool].sort(() => Math.random() - 0.5);
            videoPool.push(...shuffledBackup);
        }
    } else if (videoPool.length > beforeCount) {
        // 如果成功进货了，顺手更新备用粮仓，保持粮仓里有 150 个最新的新鲜视频
        let newBackup = [...videoPool, ...backupPool];
        let uniqueBackup = [];
        let tempSet = new Set();
        for (let v of newBackup) {
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
        rcmd_reason: mode === 'fresh' ? "新号探索" : "打破茧房",
        rcmd_reason_style: { text: mode === 'fresh' ? "新号探索" : "打破茧房", text_color: "#FF6633", bg_color: "#FFF1ED", border_color: "#FFF1ED", bg_style: 1 },
        player_args: { aid: video.aid, cid: video.cid, duration: video.duration, type: "av" },
        three_point_v2: [{ title: "添加至稍后再看", type: "watch_later" }]
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
            
            let needCount = targetList.filter(card => card.goto === 'av').length;
            
            if (videoPool.length < needCount + 30) {
                await fillPool(); 
            }

            let replacedCount = 0;
            for (let i = 0; i < targetList.length; i++) {
                if (targetList[i].goto === 'av' && videoPool.length > 0) {
                    let newVideo = videoPool.shift(); 
                    shownBvids.add(newVideo.bvid);
                    if (targetList[i].ad_info) delete targetList[i].ad_info; 
                    targetList[i] = isApp ? buildAppFeedItem(newVideo, isPad) : buildFeedItem(newVideo); 
                    replacedCount++;
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
