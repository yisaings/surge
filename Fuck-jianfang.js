// Surge 传入参数解析 (对应你的 sgmodule 里的参数)
let mode = 'popular';
if (typeof $argument !== 'undefined') {
    let match = $argument.match(/mode=([a-z]+)/);
    if (match) mode = match[1];
}

// 借用 Surge 的持久化存储当做视频缓存池
let videoPool = JSON.parse($persistentStore.read('fj_video_pool') || '[]');
let shownBvids = new Set(JSON.parse($persistentStore.read('fj_shown_bvids') || '[]'));

// --- 封装 Surge 的网络请求 ---
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

// --- 去 B 站拉取热门视频填充池子 ---
async function fillPool() {
    let startPage = Math.floor(Math.random() * 3) + 1;
    let url = `https://api.bilibili.com/x/web-interface/popular?ps=20&pn=${startPage}`;
    let res = await fetchSurge(url);
    
    if (res && res.code === 0 && res.data && res.data.list) {
        res.data.list.forEach(v => {
            // 如果没展示过，就塞进池子里
            if (!shownBvids.has(v.bvid)) {
                videoPool.push(v);
            }
        });
        console.log(`[Fuck茧房] 视频池已补充，当前余量: ${videoPool.length}`);
    }
}

// --- 构造 B 站推荐流认得的数据结构 ---
function buildFeedItem(video) {
    return {
        id: video.aid, bvid: video.bvid, cid: video.cid, goto: 'av',
        uri: 'https://www.bilibili.com/video/' + video.bvid,
        pic: video.pic, pic_4_3: video.pic, title: video.title,
        duration: video.duration, pubdate: video.pubdate,
        owner: video.owner, stat: video.stat,
        rcmd_reason: { reason_type: 1, content: "打破茧房" }, // 加个小标记
        show_info: 1, pos: 0, is_stock: 0, enable_vt: 0
    };
}

// ================= 主逻辑 (使用你熟悉的 try-catch 风格) =================
async function main() {
    let body = $response.body;
    if (!body) return $done({});

    try {
        let obj = JSON.parse(body);

        // 判断是否是我们要拦截的推荐流
        if (obj?.code === 0 && obj?.data?.item) {
            console.log("[Fuck茧房] 开始替换推荐流...");

            // 1. 如果池子快空了，异步去拉取新视频
            if (videoPool.length < 5) {
                await fillPool(); 
            }

            // 2. 循环替换原有的推荐流
            let items = obj.data.item;
            for (let i = 0; i < items.length; i++) {
                if (items[i].goto === 'av' && videoPool.length > 0) {
                    // 从池子里拿出一个视频
                    let newVideo = videoPool.shift(); 
                    // 标记为已展示
                    shownBvids.add(newVideo.bvid);
                    // 替换原位
                    items[i] = buildFeedItem(newVideo); 
                }
            }

            // 3. 把剩余的池子和已展示记录存入 Surge，下次接着用
            $persistentStore.write(JSON.stringify(videoPool), 'fj_video_pool');
            $persistentStore.write(JSON.stringify(Array.from(shownBvids).slice(-100)), 'fj_shown_bvids'); // 只存最近100个防止内存爆满

            // 4. 打包回 JSON
            body = JSON.stringify(obj);
            console.log("[Fuck茧房] 替换完成！");
        }
    } catch (e) {
        console.log("Fuck茧房 JSON Parse Error: " + e);
    }
    
    // 最后统一吐出数据 (Surge 规定如果是 async 函数，必须显式调用 $done)
    $done({ body });
}

// 启动！
main();
