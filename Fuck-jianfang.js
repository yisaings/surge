// ==================== [Fuck茧房] Surge 无限续杯稳定版 ====================

// 1. 读取 Surge 模块传入的参数
let mode = 'popular';
if (typeof $argument !== 'undefined') {
    let match = $argument.match(/mode=([a-z]+)/);
    if (match) mode = match[1];
}

// 2. 状态管理
let videoPool = JSON.parse($persistentStore.read('fj_video_pool') || '[]');
let shownBvidsCache = JSON.parse($persistentStore.read('fj_shown_bvids') || '[]');
let shownBvids = new Set(shownBvidsCache);

// 3. 封装带 Header 的网络请求 (防止被 B 站风控拦截)
function fetchSurge(url) {
    return new Promise((resolve) => {
        $httpClient.get({
            url: url,
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

// 4. 拉取热门视频 (热门模式)
async function fillPopular() {
    // 扩大随机范围到 1~15 页，视频池更深
    let startPage = Math.floor(Math.random() * 15) + 1;
    let url = `https://api.bilibili.com/x/web-interface/popular?ps=20&pn=${startPage}`;
    let res = await fetchSurge(url);
    
    if (res && res.code === 0 && res.data && res.data.list) {
        let added = 0;
        res.data.list.forEach(v => {
            if (!shownBvids.has(v.bvid)) {
                videoPool.push(v);
                added++;
            }
        });
        
        // 🌟 触底反弹：如果全都被去重过滤了，清空记忆强制补给！
        if (added === 0) {
            console.log(`[Fuck茧房] 视频均已看腻，清空去重记录重新洗牌！`);
            shownBvids.clear();
            res.data.list.forEach(v => videoPool.push(v));
        } else {
            console.log(`[Fuck茧房] 热门池已补充 ${added} 个，当前余量: ${videoPool.length}`);
        }
    }
}

// 4.5 拉取新号数据 (新号模式)
async function fillFresh() {
    let idx = Math.floor(Math.random() * 10) + 1; 
    let url = `https://api.bilibili.com/x/web-interface/index/top/feed/rcmd?ps=20&fresh_idx=${idx}&fresh_type=4`;
    let res = await fetchSurge(url);
    
    if (res && res.code === 0 && res.data && res.data.item) {
        let added = 0;
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
        
        if (added === 0) {
            shownBvids.clear();
            console.log(`[Fuck茧房] 新号模式记录清空重置！`);
        }
    }
}

// 路由调度
async function fillPool() {
    if (mode === 'fresh') {
        await fillFresh();
    } else {
        await fillPopular();
    }
}

// 5. 构造数据结构 (Web端)
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

// 6. 构造数据结构 (App端)
function buildAppFeedItem(video) {
    let upName = video.owner?.name || video.up || "打破茧房";
    return {
        card_type: "small_cover_v2",
        card_goto: "av",
        goto: "av",
        title: video.title,
        cover: video.pic || video.cover, 
        uri: 'bilibili://video/' + video.bvid,
        param: String(video.aid),
        args: {
            up_id: video.owner?.mid || 0,
            up_name: upName,
            aid: video.aid
        },
        desc_button: { text: upName, type: 1 },
        cover_left_text_1: String(video.stat?.view || video.view || 0), 
        cover_left_text_2: String(video.stat?.danmaku || video.danmaku || 0), 
        rcmd_reason: mode === 'fresh' ? "新号模式" : "打破茧房",
        rcmd_reason_style: {
            text: mode === 'fresh' ? "新号模式" : "打破茧房",
            text_color: "#FF6633",
            bg_color: "#FFF1ED",
            border_color: "#FFF1ED",
            bg_style: 1
        },
        player_args: { aid: video.aid, cid: video.cid, duration: video.duration, type: "av" },
        three_point_v2: [
            { title: "添加至稍后再看", type: "watch_later" }
        ]
    };
}

// ================= 主拦截逻辑 =================
async function main() {
    let body = $response.body;
    if (!body) return $done({});

    try {
        let obj = JSON.parse(body);
        let isApp = Array.isArray(obj?.data?.items);
        let isWeb = Array.isArray(obj?.data?.item);
        let targetList = isApp ? obj.data.items : (isWeb ? obj.data.item : null);

        if (obj?.code === 0 && targetList) {
            console.log(`[Fuck茧房] 开始接管流数据... 环境: ${isApp ? 'App' : 'Web'} | 模式: ${mode}`);

            // 池子余量不足 10 个时，开始进货
            if (videoPool.length < 10) {
                await fillPool(); 
            }

            let replacedCount = 0;
            for (let i = 0; i < targetList.length; i++) {
                if (targetList[i].goto === 'av' && videoPool.length > 0) {
                    let newVideo = videoPool.shift(); 
                    shownBvids.add(newVideo.bvid);
                    if (targetList[i].ad_info) delete targetList[i].ad_info;
                    targetList[i] = isApp ? buildAppFeedItem(newVideo) : buildFeedItem(newVideo); 
                    replacedCount++;
                }
            }

            // 存入 Surge，限定记忆容量，保持轻量
            $persistentStore.write(JSON.stringify(videoPool), 'fj_video_pool');
            $persistentStore.write(JSON.stringify(Array.from(shownBvids).slice(-400)), 'fj_shown_bvids');

            body = JSON.stringify(obj);
        }
    } catch (e) {
        console.log("[Fuck茧房] 致命错误: " + e);
    }
    
    $done({ body });
}

main();
