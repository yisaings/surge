// ==================== [Fuck茧房] Surge 终极兼容版 (App + Web) ====================

// 1. 读取 Surge 模块传入的参数
let mode = 'popular';
if (typeof $argument !== 'undefined') {
    let match = $argument.match(/mode=([a-z]+)/);
    if (match) mode = match[1];
}

// 2. 状态管理 (使用 Surge 的持久化存储当做视频缓存池)
let videoPool = JSON.parse($persistentStore.read('fj_video_pool') || '[]');
let shownBvidsCache = JSON.parse($persistentStore.read('fj_shown_bvids') || '[]');
let shownBvids = new Set(shownBvidsCache);

// 3. 封装 Surge 的网络请求 (替代 fetch)
function fetchSurge(url) {
    return new Promise((resolve) => {
        $httpClient.get(url, (error, response, data) => {
            if (!error && data) {
                try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
            } else {
                resolve(null);
            }
        });
    });
}

// 4. 去 B 站拉取热门视频填充池子
async function fillPool() {
    let startPage = Math.floor(Math.random() * 3) + 1;
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
        console.log(`[Fuck茧房] 视频池已补充 ${added} 个，当前余量: ${videoPool.length}`);
    }
}

// 5. 构造数据结构 (Web端)
function buildFeedItem(video) {
    return {
        id: video.aid, bvid: video.bvid, cid: video.cid, goto: 'av',
        uri: 'https://www.bilibili.com/video/' + video.bvid,
        pic: video.pic, pic_4_3: video.pic, title: video.title,
        duration: video.duration, pubdate: video.pubdate,
        owner: video.owner, stat: video.stat,
        rcmd_reason: { reason_type: 1, content: "打破茧房" },
        show_info: 1, pos: 0, is_stock: 0, enable_vt: 0
    };
}

// 6. 构造数据结构 (App端)
function buildAppFeedItem(video) {
    return {
        card_type: "small_cover_v2",
        card_goto: "av",
        goto: "av",
        title: video.title,
        cover: video.pic, 
        uri: 'bilibili://video/' + video.bvid,
        param: String(video.aid),
        args: {
            up_id: video.owner?.mid || 0,
            up_name: video.owner?.name || "打破茧房",
            aid: video.aid
        },
        desc_button: { text: video.owner?.name || "打破茧房", type: 1 },
        cover_left_text_1: String(video.stat?.view || 0), 
        cover_left_text_2: String(video.stat?.danmaku || 0), 
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
            {
                title: "添加至稍后再看",
                type: "watch_later"
            },
            {
                title: "我不想看",
                subtitle: "（选择后将减少相似内容推荐）",
                type: "dislike",
                reasons: [
                    { id: 1, name: "打破信息茧房", toast: "将减少相似内容推荐" }
                ]
            }
        ]
    };
}

// ================= 主逻辑 =================
async function main() {
    let body = $response.body;
    if (!body) return $done({});

    try {
        let obj = JSON.parse(body);

        // 判断环境：App 端用 items，Web 端用 item
        let isApp = Array.isArray(obj?.data?.items);
        let isWeb = Array.isArray(obj?.data?.item);
        let targetList = isApp ? obj.data.items : (isWeb ? obj.data.item : null);

        // 拦截到推荐流
        if (obj?.code === 0 && targetList) {
            console.log(`[Fuck茧房] 开始替换推荐流... 环境: ${isApp ? 'App端' : 'Web端'}`);

            // 如果池子快空了，拉取新视频
            if (videoPool.length < 5) {
                await fillPool(); 
            }

            // 执行替换
            let replacedCount = 0;
            for (let i = 0; i < targetList.length; i++) {
                let card = targetList[i];
                // 确保只替换视频类卡片，避开直播、横幅等特殊卡片
                if (card.goto === 'av' && videoPool.length > 0) {
                    let newVideo = videoPool.shift(); 
                    shownBvids.add(newVideo.bvid);
                    
                    // 清理广告标记(顺手去一下广告)
                    if (card.ad_info) delete card.ad_info;

                    targetList[i] = isApp ? buildAppFeedItem(newVideo) : buildFeedItem(newVideo); 
                    replacedCount++;
                }
            }

            // 保存持久化数据 (只保留最近300条防止炸内存)
            $persistentStore.write(JSON.stringify(videoPool), 'fj_video_pool');
            let shownArray = Array.from(shownBvids).slice(-300);
            $persistentStore.write(JSON.stringify(shownArray), 'fj_shown_bvids');

            console.log(`[Fuck茧房] 替换完成！成功替换 ${replacedCount} 个视频卡片。`);
            body = JSON.stringify(obj);
        }
    } catch (e) {
        console.log("[Fuck茧房] JSON Parse Error: " + e);
    }
    
    $done({ body });
}

// 启动
main();
