// ==================== [Fuck茧房] Surge 终极兼容版 (Web + iPhone + iPad) ====================

// 1. 读取参数
let mode = 'popular';
if (typeof $argument !== 'undefined') {
    let match = $argument.match(/mode=([a-z]+)/);
    if (match) mode = match[1];
}

// 2. 状态与池子管理
let videoPool = JSON.parse($persistentStore.read('fj_video_pool') || '[]');
let shownBvidsCache = JSON.parse($persistentStore.read('fj_shown_bvids') || '[]');
let shownBvids = new Set(shownBvidsCache);

// 3. 带 UA 的请求
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

// 4. 拉取热门
async function fillPopular() {
    let startPage = Math.floor(Math.random() * 10) + 1;
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
        if (added === 0) {
            shownBvids.clear();
            res.data.list.forEach(v => videoPool.push(v));
        }
    }
}

// 拉取新号
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
        if (added === 0) shownBvids.clear();
    }
}

async function fillPool() {
    if (mode === 'fresh') await fillFresh();
    else await fillPopular();
}

// 5. 数据构造中心

// 5.1 Web 端
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

// 5.2 手机/iPad App 统一构造器
function buildAppFeedItem(video, isPad) {
    let upName = video.owner?.name || video.up || "打破茧房";
    let viewCount = video.stat?.view || video.view || 0;
    
    // 如果大于1万，做个简单的数值转换显示
    if (viewCount > 10000) {
        viewCount = (viewCount / 10000).toFixed(1) + "万";
    }

    let danmakuCount = String(video.stat?.danmaku || video.danmaku || 0);
    let coverUrl = video.pic || video.cover;

    let appCard = {
        card_type: "small_cover_v2", // iPad 大多也能完美兼容 v2，部分老 iPad 必须 v1，但 v2 最稳妥
        card_goto: "av",
        goto: "av",
        title: video.title,
        cover: coverUrl, 
        uri: `bilibili://video/${video.aid}?bvid=${video.bvid}&cid=${video.cid}`, // iPad 需要完整的 URI Scheme
        param: String(video.aid),
        args: {
            up_id: video.owner?.mid || 0,
            up_name: upName,
            rid: video.aid,
            aid: video.aid
        },
        desc_button: { text: upName, type: 1 },
        cover_left_text_1: String(viewCount), 
        cover_left_text_2: danmakuCount, 
        cover_left_icon_1: 1, // 播放量小图标
        cover_left_icon_2: 3, // 弹幕小图标
        rcmd_reason: "打破茧房",
        rcmd_reason_style: {
            text: "打破茧房",
            text_color: "#FF6633",
            bg_color: "#FFF1ED",
            border_color: "#FFF1ED",
            bg_style: 1
        },
        player_args: { aid: video.aid, cid: video.cid, duration: video.duration, type: "av" },
        three_point_v2: [
            { title: "添加至稍后再看", type: "watch_later" },
            { title: "我不想看", type: "dislike", reasons: [{ id: 1, name: "内容不感兴趣", toast: "将减少相似内容推荐" }] }
        ]
    };

    // iPad 需要强制补全一些排版字段
    if (isPad) {
        appCard.cover_right_text = `${Math.floor(video.duration/60)}:${(video.duration%60).toString().padStart(2, '0')}`;
        appCard.desc = upName; // iPad 常用 desc 字段显示UP名
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
        
        // 判断是不是 Pad 端 (通常 URL 里有 device=pad)
        let isPad = reqUrl.indexOf('device=pad') !== -1;

        if (obj?.code === 0 && targetList) {
            console.log(`[Fuck茧房] 拦截成功 | 环境: ${isApp ? (isPad ? 'iPad' : 'iPhone') : 'Web'} | 模式: ${mode}`);

            if (videoPool.length < 10) await fillPool(); 

            let replacedCount = 0;
            for (let i = 0; i < targetList.length; i++) {
                let card = targetList[i];
                
                // 找到原视频卡片，进行精准替换 (保留广告槽位但改掉数据)
                if (card.goto === 'av' && videoPool.length > 0) {
                    let newVideo = videoPool.shift(); 
                    shownBvids.add(newVideo.bvid);
                    
                    if (card.ad_info) delete card.ad_info; // 去除广告标记
                    
                    targetList[i] = isApp ? buildAppFeedItem(newVideo, isPad) : buildFeedItem(newVideo); 
                    replacedCount++;
                }
            }

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
