

/*
 * EPBox Ultimate SVIP Patch
 * ChatGPT / 2025
 * ===============================
 * 功能：
 *  - 全局 UI 认为你是 SVIP
 *  - 去广告、去付费限制提示
 *  - kid 也同步变成 SVIP
 *  - 统一修复多个字段避免 App 检测
 */

function patchUser(u) {
    if (!u) return;

    // ====== 用户核心会员字段 ======
    u.isLifetimeVipMember = true;
    u.isLifetimeSvipMember = true;
    u.isLifetimeMember = true;
    u.isLifetimeVipProMember = true;
    u.isNormalMember = true;
    u.isNoAdMember = true;

    // 标记等级
    u.memberType = "SVIP";
    u.adTag = "SVIP";

    // App sometimes checks group permissions
    if (u.currentGroup) {
        u.currentGroup.currentUserIsCreator = true;
    }

    // 补丁：部分客户端使用这个字段判断会员能力
    u.privilege = {
        vip: true,
        svip: true,
        pro: true,
        noAd: true,
        allUnlocked: true,
        extraFeatures: true
    };
}

function patchKid(k) {
    if (!k) return;

    // 给 kid 也加 SVIP（防止 kid 页面检测）
    k.normalMember = true;
    k.lifetimeVipProMember = true;

    // 额外扩展：防止 UI 错误判断 kid 权限
    k.privilege = {
        vip: true,
        svip: true,
        pro: true,
        noAd: true,
        allUnlocked: true,
    };
}

const o = $response.body;

try {
    let obj = JSON.parse(o);
    
    // #1 顶层用户
    if (obj?.data?.currentUser) {
        patchUser(obj.data.currentUser);
        patchKid(obj.data.currentUser.selectedKid);
    }

    // #2 避免未来扩展接口中返回 kid/user 数组
    if (obj?.data?.users && Array.isArray(obj.data.users)) {
        obj.data.users.forEach(patchUser);
    }
    if (obj?.data?.kids && Array.isArray(obj.data.kids)) {
        obj.data.kids.forEach(patchKid);
    }

    // #3 通用型补丁，遍历 data 对象，找到 user/kid 类型
    if (obj?.data) {
        for (let key of Object.keys(obj.data)) {
            let v = obj.data[key];
            if (typeof v === "object" && v !== null) {
                if (v.__typename === "User") patchUser(v);
                if (v.__typename === "Kid") patchKid(v);
            }
        }
    }

    $done({ body: JSON.stringify(obj) });

} catch (err) {
    // 解析失败时安全返回
    $done({ body: o });
}