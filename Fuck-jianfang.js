// ==================== 1. 配置与状态初始化 ====================
let mode = 'popular';
let upmasterName = '';
let active = true;

// 解析 Surge 面板传入的参数
if (typeof $argument !== 'undefined') {
    const args = Object.fromEntries($argument.split('&').map(item => item.split('=')));
    if (args.mode) mode = args.mode;
    if (args.upmaster_name) upmasterName = decodeURIComponent(args.upmaster_name);
}

// 读取持久化存储的视频池和去重记录
let videoPool = JSON.parse($persistentStore.read('fj_video_pool') || '[]');
let shownBvidsArray = JSON.parse($persistentStore.read('fj_shown_bvids') || '[]');
let shownBvids = new Set(shownBvidsArray);
let poolBvids = new Set(videoPool.map(v => v.bvid));

// ==================== 2. 基础请求封装 (替代 fetch) ====================
async function fetchSurge(url, options = {}) {
    return new Promise((resolve, reject) => {
        let reqOpts = { url: url };
        if (options.headers) reqOpts.headers = options.headers;
        
        $httpClient.get(reqOpts, (error, response, data) => {
            if (error) {
                reject(error);
            } else {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            }
        });
    });
}

// ==================== 3. 粘贴原项目的纯逻辑函数 ====================

// TODO: 将原项目 content.js 中的以下函数原封不动粘贴到这里：
// 1. md5hex(str)
// 2. getWbiKeys()
// 3. mixinKey(orig)
// 4. wbiSign(params)
// 5. pushVideo(v) (注意：需要稍微修改里面的全局变量引用，或者直接用本脚本里的 poolBvids)
// 6. fillPopular(), fillUpmaster(), fillCrossRegion(), fillNiche(), fillFresh(), fillWeekly()
// 7. buildFeedItem(video)

// *注意*：在粘贴的 fill 系列函数中，把里面的 `fetch(...).then(r => r.json())` 
// 全部替换为 `fetchSurge(...)` 即可。

// ==================== 4. 核心调度与拦截 ====================

async function fillPool() {
    let added = 0;
    try {
        switch (mode) {
            case 'upmaster': added = await fillUpmaster(); break;
            case 'crossregion': added = await fillCrossRegion(); break;
            case 'niche': added = await fillNiche(); break;
            case 'weekly': added = await fillWeekly(); break;
            case 'fresh': added = await fillFresh(); break;
            default: added = await fillPopular(); break;
        }
        console.log(`[Fuck茧房] [${mode}] 视频池已填充: ${videoPool.length} 个 (+${added})`);
        // 持久化保存
        $persistentStore.write(JSON.stringify(videoPool), 'fj_video_pool');
    } catch (e) {
        console.log('[Fuck茧房] 填充视频池失败:', e);
    }
}

function getVideoFromPool() {
    let candidates = videoPool.filter(v => !shownBvids.has(v.bvid));

    if (candidates.length === 0) {
        console.log('[Fuck茧房] 去重记录已清空，重新开始');
        shownBvids.clear();
        candidates = videoPool; 
    }

    if (candidates.length === 0) return null;

    const idx = Math.floor(Math.random() * candidates.length);
    const video = candidates[idx];
    videoPool.splice(videoPool.indexOf(video), 1);
    poolBvids.delete(video.bvid);
    shownBvids.add(video.bvid);

    // 触发异步补充视频池
    if (videoPool.length < 20) fillPool();

    // 持久化去重记录
    $persistentStore.write(JSON.stringify(Array.from(shownBvids)), 'fj_shown_bvids');
    $persistentStore.write(JSON.stringify(videoPool), 'fj_video_pool');

    return video;
}

function replaceFeedItems(items) {
    if (!items || !items.length) return items;
    const result = [];
    items.forEach(item => {
        if (item.goto === 'av') {
            const video = getVideoFromPool();
            if (video) {
                result.push(buildFeedItem(video)); // 依赖原项目 buildFeedItem 函数
            } else {
                result.push(item);
            }
        } else {
            result.push(item);
        }
    });
    return result;
}

// ==================== 5. Surge 入口点 ====================
async function main() {
    let body = $response.body;
    if (!body || !active) return $done({});
    
    try {
        let data = JSON.parse(body);
        if (data && data.code === 0 && data.data && data.data.item) {
            
            // 如果池子是空的，等待一次同步填充
            if (videoPool.length === 0) {
                await fillPool();
            }

            // 执行替换
            data.data.item = replaceFeedItems(data.data.item);
            
            // 返回修改后的 JSON
            $done({ body: JSON.stringify(data) });
        } else {
            $done({ body });
        }
    } catch (e) {
        console.log(`[Fuck茧房] 执行报错: ${e}`);
        $done({ body });
    }
}

main();
